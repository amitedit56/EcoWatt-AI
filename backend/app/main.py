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
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas

from app.core.database import Base, engine, get_db, SessionLocal
from app.core.migrations import run_auto_migrations
from app.models import user  # noqa: F401 - needed so SQLAlchemy knows about the User table
from app.models.user import User
from app.models.dashboard_metrics import DashboardMetrics
from app.models.anomaly_log import AnomalyLog
from app.models.upload_history import UploadHistory
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


# ---------------------------------------------------------------------------
# Per-user data helpers
#
# Everything below used to live in global in-memory variables shared by every
# user of the app (a serious bug — one user could see/edit another user's
# anomalies, dashboard numbers, and upload history). Now every value is
# looked up from the database, scoped to the logged-in user's id.
# ---------------------------------------------------------------------------

DEFAULT_METRICS = {
    "total_consumption": "245 kWh",
    "estimated_bill": "$34.56",
    "weekly_prediction": "1,450 kWh",
    "status": "Default Dataset",
    "scale_factor": 1.0,
}


def _get_or_create_metrics(db: Session, user_id: int) -> DashboardMetrics:
    row = db.query(DashboardMetrics).filter(DashboardMetrics.user_id == user_id).first()
    if row is None:
        row = DashboardMetrics(user_id=user_id, **DEFAULT_METRICS)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


# In-memory storage for the (not-yet-real) 2FA toggle placeholder
user_settings = {
    "security": {
        "twoFactor": False
    }
}


# 2. Flexible Request Schema for Anomaly Detection (Supports both list and float input)
class AnomalyInput(BaseModel):
    features: list[float] | float


@app.post("/api/detect-anomaly")
def detect_anomaly(
    data: AnomalyInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if anomaly_model is None:
        raise HTTPException(status_code=500, detail="Anomaly model not loaded on server.")

    try:
        feature_vals = data.features if isinstance(data.features, list) else [data.features, 0.0, 0.0]
        input_df = pd.DataFrame([feature_vals])
        prediction = anomaly_model.predict(input_df)

        is_anomaly = bool(prediction[0] == -1)
        message = "Anomaly detected! Unusual power spike." if is_anomaly else "Normal energy usage."

        if is_anomaly:
            new_log = AnomalyLog(
                user_id=current_user.id,
                timestamp="Just now",
                usage=f"{feature_vals[0]} kWh",
                severity="danger",
                reason="Live Isolation Forest Model Spike",
                status="Unresolved",
            )
            db.add(new_log)
            db.commit()

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
def update_anomaly_status(
    anomaly_id: int,
    data: StatusUpdateInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(AnomalyLog).filter(
        AnomalyLog.id == anomaly_id, AnomalyLog.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    item.status = data.status
    db.commit()
    return {"status": "success", "message": "Status updated successfully"}


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
def predict_forecast(
    data: ForecastInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if prophet_model is None:
        raise HTTPException(status_code=500, detail="Prophet model not loaded on server.")

    metrics = _get_or_create_metrics(db, current_user.id)

    # New users (or anyone who hasn't uploaded a dataset yet) shouldn't see
    # a forecast at all — the underlying Prophet model is generic/pre-trained,
    # not tied to any real user's data, so showing it before an upload would
    # be misleading demo data pretending to be personalized.
    if metrics.status == "Default Dataset":
        return {
            "status": "success",
            "has_data": False,
            "forecast_data": [],
        }

    try:
        future = prophet_model.make_future_dataframe(periods=data.periods)
        forecast = prophet_model.predict(future)

        result_subset = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(data.periods).copy()

        try:
            scale_factor = metrics.scale_factor
            if scale_factor != 1.0:
                result_subset['yhat'] = result_subset['yhat'] * (scale_factor * 0.1)
                result_subset['yhat_lower'] = result_subset['yhat_lower'] * (scale_factor * 0.1)
                result_subset['yhat_upper'] = result_subset['yhat_upper'] * (scale_factor * 0.1)
        except Exception:
            pass

        forecast_list = result_subset.to_dict(orient="records")

        return {
            "status": "success",
            "has_data": True,
            "forecast_data": forecast_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 6. Dataset Upload Endpoint with Full Feature Sync
@app.post("/api/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        # Store each user's uploads in their own subfolder so filenames
        # never collide between different accounts.
        user_upload_dir = os.path.join("uploads", str(current_user.id))
        os.makedirs(user_upload_dir, exist_ok=True)
        save_path = os.path.join(user_upload_dir, file.filename)
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
                    new_anomaly = AnomalyLog(
                        user_id=current_user.id,
                        timestamp="Just now (From Upload)",
                        usage=f"{round(max_val, 2)} kWh",
                        severity="danger",
                        reason=f"High Peak Spike detected in {file.filename}",
                        status="Unresolved",
                    )
                    db.add(new_anomaly)

        scale_factor = total_kwh / 245.0 if total_kwh != 245.0 else 1.0
        weekly_pred_val = round(total_kwh * 4.2, 2)

        metrics = _get_or_create_metrics(db, current_user.id)
        metrics.total_consumption = f"{total_kwh} kWh"
        metrics.estimated_bill = f"Rs. {int(total_kwh * 8.5)}"
        metrics.weekly_prediction = f"{weekly_pred_val:,.1f} kWh"
        metrics.status = f"Processed {file.filename}"
        metrics.scale_factor = scale_factor

        history_entry = UploadHistory(
            user_id=current_user.id,
            filename=file.filename,
            upload_date=datetime.now().strftime("%d %b %Y"),
            size=f"{os.path.getsize(save_path) / (1024 * 1024):.1f} MB",
            status="Processed",
            total_consumption=metrics.total_consumption,
            estimated_bill=metrics.estimated_bill,
        )
        db.add(history_entry)
        db.commit()

        return {
            "status": "success",
            "filename": file.filename,
            "message": f"Dataset uploaded! Calculated total usage: {total_kwh} kWh",
            "metrics": {
                "total_consumption": metrics.total_consumption,
                "estimated_bill": metrics.estimated_bill,
                "weekly_prediction": metrics.weekly_prediction,
                "status": metrics.status,
                "scale_factor": metrics.scale_factor,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/upload-history")
def get_upload_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(UploadHistory)
        .filter(UploadHistory.user_id == current_user.id)
        .order_by(UploadHistory.id.desc())
        .all()
    )
    return {
        "status": "success",
        "history": [
            {
                "id": r.id,
                "filename": r.filename,
                "date": r.upload_date,
                "size": r.size,
                "status": r.status,
            }
            for r in rows
        ],
    }


# 7. Appliances Breakdown Endpoint with Dynamic Scaling
@app.get("/api/appliances")
def get_appliances_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    metrics = _get_or_create_metrics(db, current_user.id)
    scale = metrics.scale_factor

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
def get_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    metrics = _get_or_create_metrics(db, current_user.id)
    return {
        "current_usage": metrics.total_consumption,
        "next_forecast": metrics.total_consumption,
        "estimated_bill": metrics.estimated_bill,
        "potential_saving": "18%"
    }


@app.get("/api/dashboard-data")
def get_full_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    anomaly_rows = (
        db.query(AnomalyLog)
        .filter(AnomalyLog.user_id == current_user.id)
        .order_by(AnomalyLog.id.desc())
        .limit(3)
        .all()
    )
    recent_anomalies = [
        {
            "id": item.id,
            "date": item.timestamp,
            "usage": item.usage,
            "severity": "High" if item.severity == "danger" else ("Medium" if item.severity == "warning" else "Low"),
            "reason": item.reason,
        }
        for item in anomaly_rows
    ]

    metrics = _get_or_create_metrics(db, current_user.id)
    scale = metrics.scale_factor

    appliance_breakdown = [
        {"name": "AC", "percentage": 38, "kwh": round(93.1 * scale, 1)},
        {"name": "Fridge", "percentage": 22, "kwh": round(53.9 * scale, 1)},
        {"name": "Lights", "percentage": 16, "kwh": round(39.2 * scale, 1)},
        {"name": "TV", "percentage": 8, "kwh": round(19.6 * scale, 1)},
        {"name": "Others", "percentage": 16, "kwh": round(39.2 * scale, 1)}
    ]

    return {
        "status": "success",
        "total_consumption": metrics.total_consumption,
        "estimated_bill": metrics.estimated_bill,
        "recent_anomalies": recent_anomalies,
        "appliance_breakdown": appliance_breakdown
    }


@app.get("/api/forecast")
def get_forecast_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    metrics = _get_or_create_metrics(db, current_user.id)
    return {
        "has_data": metrics.status != "Default Dataset",
        "weekly_prediction": metrics.weekly_prediction,
        "peak_day": "Wednesday",
        "confidence_score": "94%"
    }


@app.get("/api/anomalies")
def get_anomalies_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(AnomalyLog)
        .filter(AnomalyLog.user_id == current_user.id)
        .order_by(AnomalyLog.id.desc())
        .all()
    )
    danger_count = sum(1 for item in rows if item.severity == "danger")
    resolved_count = sum(1 for item in rows if item.status == "Resolved")

    return {
        "total_anomalies": len(rows),
        "high_severity": danger_count,
        "resolved_issues": resolved_count,
        "anomalies_list": [
            {
                "id": item.id,
                "timestamp": item.timestamp,
                "usage": item.usage,
                "severity": item.severity,
                "reason": item.reason,
                "status": item.status,
            }
            for item in rows
        ],
    }


@app.get("/api/savings")
def get_savings_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    metrics = _get_or_create_metrics(db, current_user.id)
    scale = metrics.scale_factor
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
def get_reports_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Reports are now generated from the user's own uploaded datasets —
    # no more shared hardcoded demo reports. Each upload becomes one
    # downloadable audit report reflecting that upload's own numbers.
    rows = (
        db.query(UploadHistory)
        .filter(UploadHistory.user_id == current_user.id)
        .order_by(UploadHistory.id.desc())
        .all()
    )
    return {
        "status": "success",
        "reports": [
            {
                "id": r.id,
                "title": f"Energy Audit — {r.filename}",
                "date": r.upload_date,
                "size": r.size,
                "type": "PDF",
                "filename": f"ecowatt_audit_{r.id}.pdf",
            }
            for r in rows
        ],
    }


@app.get("/api/reports/download/{report_id}")
def download_report_file(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.query(UploadHistory).filter(
        UploadHistory.id == report_id, UploadHistory.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Report not found.")

    report = {
        "title": f"Energy Audit — {record.filename}",
        "date": record.upload_date,
        "type": "PDF",
        "size": record.size,
        "filename": f"ecowatt_audit_{record.id}.pdf",
    }
    # Fall back to the user's current metrics if this is an older row from
    # before snapshots were captured per-upload.
    total_consumption = record.total_consumption or _get_or_create_metrics(db, current_user.id).total_consumption
    estimated_bill = record.estimated_bill or _get_or_create_metrics(db, current_user.id).estimated_bill

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
    p.drawString(240, height - 310, total_consumption)

    p.setFillColor(colors.HexColor("#064e3b"))
    p.setFont("Helvetica-Bold", 11)
    p.drawString(60, height - 335, "Estimated Monthly Cost:")
    p.setFont("Helvetica", 12)
    p.setFillColor(colors.HexColor("#0f172a"))
    p.drawString(240, height - 335, estimated_bill)

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