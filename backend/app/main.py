from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import joblib
import os
import shutil
import numpy as np
import pandas as pd
import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas

from app.core.database import Base, engine, get_db, SessionLocal
from app.core.migrations import run_auto_migrations
from app.models import user  # noqa: F401 - needed so SQLAlchemy knows about the User table
from app.models.user import User
from app.models.dashboard_metrics import DashboardMetrics
from app.api.auth import router as auth_router, get_current_user
from app.api.assistant import router as assistant_router
from sqlalchemy.orm import Session

app = FastAPI(title="EcoWatt AI Backend with Trained Models", version="1.0")

# Create the users table (and any other tables) if they don't already exist
Base.metadata.create_all(bind=engine)

# Add any columns that exist on the models but not yet in the actual DB
# tables (e.g. after adding avatar_url, email_alerts, etc.) — without
# deleting or touching existing data.
run_auto_migrations(engine, Base)

# Register the /api/auth/register and /api/auth/login routes
app.include_router(auth_router)
# Register the /api/assistant/chat route (real Groq-powered AI chat)
app.include_router(assistant_router)

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Load Saved PKL Models using Absolute Path (Safe & Reliable)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

PROPHET_MODEL_PATH = os.path.join(BASE_DIR, "models", "eco_watt_prophet_model.pkl")
ANOMALY_MODEL_PATH = os.path.join(BASE_DIR, "models", "eco_watt_anomaly_model.pkl")

prophet_model = None
anomaly_model = None

try:
    if os.path.exists(ANOMALY_MODEL_PATH):
        anomaly_model = joblib.load(ANOMALY_MODEL_PATH)
        print("SUCCESS: Anomaly Detection Model loaded successfully from:", ANOMALY_MODEL_PATH)
    else:
        print("FILE NOT FOUND:", ANOMALY_MODEL_PATH)

    if os.path.exists(PROPHET_MODEL_PATH):
        prophet_model = joblib.load(PROPHET_MODEL_PATH)
        print("SUCCESS: Prophet Model loaded successfully from:", PROPHET_MODEL_PATH)
    else:
        print("FILE NOT FOUND:", PROPHET_MODEL_PATH)
except Exception as e:
    print("Error loading models:", e)


# Root Endpoint
@app.get("/")
def read_root():
    return {"message": "EcoWatt AI Backend is running with custom ML models!"}


# In-memory storage for live dynamic anomaly logs and metrics override
live_anomaly_logs = [
    { "id": 1, "timestamp": "14 Jun 2024, 8:30 PM", "usage": "8.3 kWh", "severity": "danger", "reason": "AC Overuse Spike Detected", "status": "Unresolved" },
    { "id": 2, "timestamp": "10 Jun 2024, 11:15 PM", "usage": "7.1 kWh", "severity": "warning", "reason": "Unusual Night Activity", "status": "Reviewed" },
    { "id": 3, "timestamp": "05 Jun 2024, 2:00 PM", "usage": "9.5 kWh", "severity": "danger", "reason": "Simultaneous Heavy Appliances Running", "status": "Resolved" }
]

# Global dictionary to store latest uploaded file analytics & dynamic overrides.
# This acts as an in-memory cache that's loaded from (and written back to) the
# `dashboard_metrics` DB table, so values survive a backend restart.
latest_upload_metrics = {
    "total_consumption": "245 kWh",
    "estimated_bill": "$34.56",
    "weekly_prediction": "1,450 kWh",
    "status": "Default Dataset",
    "scale_factor": 1.0
}


def _load_metrics_from_db():
    """Runs once at startup: pulls the saved row (if any) into the in-memory
    cache above, or creates the default row on first-ever run."""
    db = SessionLocal()
    try:
        row = db.query(DashboardMetrics).filter(DashboardMetrics.id == 1).first()
        if row is None:
            row = DashboardMetrics(id=1, **latest_upload_metrics)
            db.add(row)
            db.commit()
            db.refresh(row)
        latest_upload_metrics["total_consumption"] = row.total_consumption
        latest_upload_metrics["estimated_bill"] = row.estimated_bill
        latest_upload_metrics["weekly_prediction"] = row.weekly_prediction
        latest_upload_metrics["status"] = row.status
        latest_upload_metrics["scale_factor"] = row.scale_factor
    finally:
        db.close()


def _save_metrics_to_db():
    """Call this any time latest_upload_metrics changes, so the new values
    survive the next restart."""
    db = SessionLocal()
    try:
        row = db.query(DashboardMetrics).filter(DashboardMetrics.id == 1).first()
        if row is None:
            row = DashboardMetrics(id=1)
            db.add(row)
        row.total_consumption = latest_upload_metrics["total_consumption"]
        row.estimated_bill = latest_upload_metrics["estimated_bill"]
        row.weekly_prediction = latest_upload_metrics["weekly_prediction"]
        row.status = latest_upload_metrics["status"]
        row.scale_factor = latest_upload_metrics["scale_factor"]
        db.commit()
    finally:
        db.close()


_load_metrics_from_db()

# Reports audit list data
reports_audit_list = [
    { "id": 1, "title": "June 2026 Monthly Energy Audit", "date": "01 Jul 2026", "size": "2.4 MB", "type": "PDF", "filename": "june_2026_audit.pdf" },
    { "id": 2, "title": "May 2026 Consumption Summary", "date": "01 Jun 2026", "size": "1.8 MB", "type": "PDF", "filename": "may_2026_audit.pdf" },
    { "id": 3, "title": "Q1 2026 Comprehensive Analytics", "date": "01 Apr 2026", "size": "5.1 MB", "type": "PDF", "filename": "q1_2026_audit.pdf" },
]

# In-memory storage for user settings
user_settings = {
    "security": {
        "twoFactor": False
    }
}


# 2. Flexible Request Schema for Anomaly Detection (Supports both list and float input)
class AnomalyInput(BaseModel):
    features: list[float] | float


@app.post("/api/detect-anomaly")
def detect_anomaly(data: AnomalyInput):
    if anomaly_model is None:
        raise HTTPException(status_code=500, detail="Anomaly model not loaded on server.")
    
    try:
        feature_vals = data.features if isinstance(data.features, list) else [data.features, 0.0, 0.0]
        input_df = pd.DataFrame([feature_vals])
        prediction = anomaly_model.predict(input_df)
        
        is_anomaly = bool(prediction[0] == -1)
        message = "Anomaly detected! Unusual power spike." if is_anomaly else "Normal energy usage."
        
        if is_anomaly:
            new_log = {
                "id": len(live_anomaly_logs) + 1,
                "timestamp": "Just now",
                "usage": f"{feature_vals[0]} kWh",
                "severity": "danger",
                "reason": "Live Isolation Forest Model Spike",
                "status": "Unresolved"
            }
            live_anomaly_logs.insert(0, new_log)
        
        return {
            "status": "success",
            "is_anomaly": is_anomaly,
            "message": message
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 3. Request Schema for Status Update
class StatusUpdateInput(BaseModel):
    status: str

@app.patch("/api/anomalies/{anomaly_id}/status")
def update_anomaly_status(anomaly_id: int, data: StatusUpdateInput):
    for item in live_anomaly_logs:
        if item["id"] == anomaly_id:
            item["status"] = data.status
            return {"status": "success", "message": "Status updated successfully"}
    raise HTTPException(status_code=404, detail="Anomaly not found")


# 4. Settings Endpoints
# Notification preferences are stored per-user in the database (users table).
# Only "security.twoFactor" remains a simple in-memory placeholder since that
# feature isn't wired up to real 2FA logic yet.
@app.get("/api/settings")
def get_settings(current_user: User = Depends(get_current_user)):
    return {
        "status": "success",
        "settings": {
            "notifications": {
                "emailAlerts": current_user.email_alerts,
                "anomalyAlerts": current_user.anomaly_alerts,
                "weeklyReports": current_user.weekly_reports,
            },
            "security": user_settings["security"],
        },
    }


class SettingsUpdateInput(BaseModel):
    notifications: dict | None = None
    security: dict | None = None


@app.put("/api/settings")
def update_settings(
    data: SettingsUpdateInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.notifications:
        if "emailAlerts" in data.notifications:
            current_user.email_alerts = bool(data.notifications["emailAlerts"])
        if "anomalyAlerts" in data.notifications:
            current_user.anomaly_alerts = bool(data.notifications["anomalyAlerts"])
        if "weeklyReports" in data.notifications:
            current_user.weekly_reports = bool(data.notifications["weeklyReports"])
        db.commit()
        db.refresh(current_user)

    if data.security:
        user_settings["security"].update(data.security)

    return {
        "status": "success",
        "message": "Settings updated successfully",
        "settings": {
            "notifications": {
                "emailAlerts": current_user.email_alerts,
                "anomalyAlerts": current_user.anomaly_alerts,
                "weeklyReports": current_user.weekly_reports,
            },
            "security": user_settings["security"],
        },
    }


# 5. Request Schema for Prophet Forecasting
class ForecastInput(BaseModel):
    periods: int = 30


@app.post("/api/predict-forecast")
def predict_forecast(data: ForecastInput):
    if prophet_model is None:
        raise HTTPException(status_code=500, detail="Prophet model not loaded on server.")
    
    try:
        future = prophet_model.make_future_dataframe(periods=data.periods)
        forecast = prophet_model.predict(future)
        
        result_subset = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(data.periods).copy()
        
        try:
            scale_factor = latest_upload_metrics["scale_factor"]
            if scale_factor != 1.0:
                result_subset['yhat'] = result_subset['yhat'] * (scale_factor * 0.1)
                result_subset['yhat_lower'] = result_subset['yhat_lower'] * (scale_factor * 0.1)
                result_subset['yhat_upper'] = result_subset['yhat_upper'] * (scale_factor * 0.1)
        except Exception:
            pass

        forecast_list = result_subset.to_dict(orient="records")
        
        return {
            "status": "success",
            "forecast_data": forecast_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 6. Dataset Upload Endpoint with Full Feature Sync
@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    try:
        os.makedirs("uploads", exist_ok=True)
        save_path = os.path.join("uploads", file.filename)
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        total_kwh = 245.0
        if file.filename.endswith('.csv'):
            df = pd.read_csv(save_path)
        elif file.filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(save_path)
        else:
            df = None
            
        if df is not None:
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                col_data = df[numeric_cols[0]]
                total_kwh = round(float(col_data.sum()), 2)
                if total_kwh == 0:
                    total_kwh = 310.5
                
                max_val = float(col_data.max()) if len(col_data) > 0 else 0
                if max_val > (col_data.mean() * 2.0) if len(col_data) > 0 else False:
                    new_anomaly = {
                        "id": len(live_anomaly_logs) + 1,
                        "timestamp": "Just now (From Upload)",
                        "usage": f"{round(max_val, 2)} kWh",
                        "severity": "danger",
                        "reason": f"High Peak Spike detected in {file.filename}",
                        "status": "Unresolved"
                    }
                    live_anomaly_logs.insert(0, new_anomaly)
            
        scale_factor = total_kwh / 245.0 if total_kwh != 245.0 else 1.0
        weekly_pred_val = round(total_kwh * 4.2, 2)
        
        latest_upload_metrics["total_consumption"] = f"{total_kwh} kWh"
        latest_upload_metrics["estimated_bill"] = f"Rs. {int(total_kwh * 8.5)}"
        latest_upload_metrics["weekly_prediction"] = f"{weekly_pred_val:,.1f} kWh"
        latest_upload_metrics["status"] = f"Processed {file.filename}"
        latest_upload_metrics["scale_factor"] = scale_factor
        _save_metrics_to_db()

        return {
            "status": "success",
            "filename": file.filename,
            "message": f"Dataset uploaded! Calculated total usage: {total_kwh} kWh",
            "metrics": latest_upload_metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 7. Appliances Breakdown Endpoint with Dynamic Scaling
@app.get("/api/appliances")
def get_appliances_data():
    scale = latest_upload_metrics["scale_factor"]
    
    base_appliances = [
        { "id": 1, "name": "Air Conditioner (Inverter)", "category": "Cooling", "power_rating": "1.5 kW", "daily_usage_hours": 6.5, "consumption_kwh": 9.75, "cost_inr": 82.87, "status": "Active" },
        { "id": 2, "name": "Refrigerator (Double Door)", "category": "Kitchen", "power_rating": "0.3 kW", "daily_usage_hours": 24.0, "consumption_kwh": 7.20, "cost_inr": 61.20, "status": "Running" },
        { "id": 3, "name": "Washing Machine", "category": "Laundry", "power_rating": "0.5 kW", "daily_usage_hours": 1.2, "consumption_kwh": 0.60, "cost_inr": 5.10, "status": "Standby" },
        { "id": 4, "name": "Water Heater (Geyser)", "category": "Bathroom", "power_rating": "2.0 kW", "daily_usage_hours": 0.8, "consumption_kwh": 1.60, "cost_inr": 13.60, "status": "Off" },
        { "id": 5, "name": "LED Lighting & Fans", "category": "General", "power_rating": "0.2 kW", "daily_usage_hours": 8.0, "consumption_kwh": 1.60, "cost_inr": 13.60, "status": "Active" },
    ]
    
    appliances_list = []
    for item in base_appliances:
        scaled_kwh = round(item["consumption_kwh"] * scale, 2)
        scaled_cost = round(item["cost_inr"] * scale, 2)
        appliances_list.append({
            **item,
            "consumption_kwh": scaled_kwh,
            "cost_inr": scaled_cost
        })
    
    total_consumption = sum(item["consumption_kwh"] for item in appliances_list)
    total_cost = sum(item["cost_inr"] for item in appliances_list)
    
    return {
        "total_daily_consumption_kwh": round(total_consumption, 2),
        "total_daily_cost_inr": round(total_cost, 2),
        "appliances": appliances_list
    }


@app.get("/api/dashboard")
def get_dashboard_data():
    return {
        "current_usage": latest_upload_metrics["total_consumption"],
        "next_forecast": latest_upload_metrics["total_consumption"],
        "estimated_bill": latest_upload_metrics["estimated_bill"],
        "potential_saving": "18%"
    }


@app.get("/api/dashboard-data")
def get_full_dashboard_data():
    recent_anomalies = []
    for item in live_anomaly_logs[:3]:
        recent_anomalies.append({
            "id": item["id"],
            "date": item["timestamp"],
            "usage": item["usage"],
            "severity": "High" if item["severity"] == "danger" else ("Medium" if item["severity"] == "warning" else "Low"),
            "reason": item["reason"]
        })
        
    scale = latest_upload_metrics["scale_factor"]
    
    appliance_breakdown = [
        {"name": "AC", "percentage": 38, "kwh": round(93.1 * scale, 1)},
        {"name": "Fridge", "percentage": 22, "kwh": round(53.9 * scale, 1)},
        {"name": "Lights", "percentage": 16, "kwh": round(39.2 * scale, 1)},
        {"name": "TV", "percentage": 8, "kwh": round(19.6 * scale, 1)},
        {"name": "Others", "percentage": 16, "kwh": round(39.2 * scale, 1)}
    ]

    return {
        "status": "success",
        "total_consumption": latest_upload_metrics["total_consumption"],
        "estimated_bill": latest_upload_metrics["estimated_bill"],
        "recent_anomalies": recent_anomalies,
        "appliance_breakdown": appliance_breakdown
    }


@app.get("/api/forecast")
def get_forecast_data():
    return {
        "weekly_prediction": latest_upload_metrics["weekly_prediction"],
        "peak_day": "Wednesday",
        "confidence_score": "94%"
    }


@app.get("/api/anomalies")
def get_anomalies_data():
    danger_count = sum(1 for item in live_anomaly_logs if item["severity"] == "danger")
    resolved_count = sum(1 for item in live_anomaly_logs if item["status"] == "Resolved")
    
    return {
        "total_anomalies": len(live_anomaly_logs),
        "high_severity": danger_count,
        "resolved_issues": resolved_count,
        "anomalies_list": live_anomaly_logs
    }


@app.get("/api/savings")
def get_savings_data():
    scale = latest_upload_metrics["scale_factor"]
    base_savings = int(870 * scale)
    
    return {
        "total_potential_savings": f"Rs. {base_savings} / month",
        "active_tips_count": 4,
        "savings_tips": [
            { "id": 1, "title": "Optimize AC Thermostat", "category": "HVAC", "impact": "High", "estimated_savings": f"Rs. {int(450 * scale)} / month", "description": "Set your AC temperature to 24-25°C. Every degree lower increases power consumption by 6%." },
            { "id": 2, "title": "Switch to LED Lighting", "category": "Lighting", "impact": "Medium", "estimated_savings": f"Rs. {int(180 * scale)} / month", "description": "Replace remaining traditional bulbs with energy-efficient LED alternatives." },
            { "id": 3, "title": "Unplug Idle Electronics", "category": "General", "impact": "Low", "estimated_savings": f"Rs. {int(90 * scale)} / month", "description": "Eliminate phantom power draw by turning off power strips when devices are not in use." },
            { "id": 4, "title": "Smart Refrigerator Placement", "category": "Kitchen", "impact": "Medium", "estimated_savings": f"Rs. {int(150 * scale)} / month", "description": "Keep your fridge away from direct sunlight and allow space for proper ventilation behind coils." }
        ]
    }


@app.get("/api/reports")
def get_reports_data():
    return {
        "status": "success",
        "reports": reports_audit_list
    }


@app.get("/api/reports/download/{report_id}")
def download_report_file(report_id: int):
    report = next((r for r in reports_audit_list if r["id"] == report_id), reports_audit_list[0])
    
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    p.setFillColor(colors.HexColor("#064e3b"))
    p.rect(0, height - 100, width, 100, fill=1, stroke=0)
    
    p.setFillColor(colors.white)
    p.setFont("Helvetica-Bold", 22)
    p.drawString(40, height - 50, "EcoWatt AI")
    p.setFont("Helvetica", 12)
    p.drawString(40, height - 72, "Smart Energy & Power Audit Report")
    
    p.setFillColor(colors.HexColor("#f8fafc"))
    p.setStrokeColor(colors.HexColor("#cbd5e1"))
    p.roundRect(40, height - 210, width - 80, 85, 8, fill=1, stroke=1)
    
    p.setFillColor(colors.HexColor("#0f172a"))
    p.setFont("Helvetica-Bold", 13)
    p.drawString(55, height - 140, f"Report: {report['title']}")
    
    p.setFont("Helvetica", 11)
    p.setFillColor(colors.HexColor("#475569"))
    p.drawString(55, height - 165, f"Audit Date: {report['date']}")
    p.drawString(280, height - 165, f"Format Type: {report['type']}")
    p.drawString(55, height - 185, f"File Size: {report['size']}")
    
    p.setFillColor(colors.HexColor("#064e3b"))
    p.setFont("Helvetica-Bold", 14)
    p.drawString(40, height - 260, "Executive Summary & Key Metrics")
    
    p.setFillColor(colors.HexColor("#ecfdf5"))
    p.setStrokeColor(colors.HexColor("#10b981"))
    p.roundRect(40, height - 390, width - 80, 105, 8, fill=1, stroke=1)
    
    p.setFillColor(colors.HexColor("#064e3b"))
    p.setFont("Helvetica-Bold", 11)
    p.drawString(60, height - 310, "Total Power Consumed:")
    p.setFont("Helvetica", 12)
    p.setFillColor(colors.HexColor("#0f172a"))
    p.drawString(240, height - 310, latest_upload_metrics["total_consumption"])
    
    p.setFillColor(colors.HexColor("#064e3b"))
    p.setFont("Helvetica-Bold", 11)
    p.drawString(60, height - 335, "Estimated Monthly Cost:")
    p.setFont("Helvetica", 12)
    p.setFillColor(colors.HexColor("#0f172a"))
    p.drawString(240, height - 335, latest_upload_metrics["estimated_bill"])
    
    p.setFillColor(colors.HexColor("#064e3b"))
    p.setFont("Helvetica-Bold", 11)
    p.drawString(60, height - 360, "Potential Monthly Savings:")
    p.setFont("Helvetica-Bold", 12)
    p.setFillColor(colors.HexColor("#10b981"))
    p.drawString(240, height - 360, "Rs. 870 / month")
    
    p.setStrokeColor(colors.HexColor("#e2e8f0"))
    p.line(40, 70, width - 40, 70)
    
    p.setFillColor(colors.HexColor("#64748b"))
    p.setFont("Helvetica-Oblique", 9)
    p.drawString(40, 50, "Generated automatically by EcoWatt AI System. Confidential Energy Audit Document.")
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    
    return StreamingResponse(
        buffer, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename={report['filename']}"}
    )