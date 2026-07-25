from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os
import numpy as np

app = FastAPI(title="EcoWatt AI Backend with Trained Models", version="1.0")

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


# In-memory storage for live dynamic anomaly logs
live_anomaly_logs = [
    { "id": 1, "timestamp": "14 Jun 2024, 8:30 PM", "usage": "8.3 kWh", "severity": "danger", "reason": "AC Overuse Spike Detected", "status": "Unresolved" },
    { "id": 2, "timestamp": "10 Jun 2024, 11:15 PM", "usage": "7.1 kWh", "severity": "warning", "reason": "Unusual Night Activity", "status": "Reviewed" },
    { "id": 3, "timestamp": "05 Jun 2024, 2:00 PM", "usage": "9.5 kWh", "severity": "danger", "reason": "Simultaneous Heavy Appliances Running", "status": "Resolved" }
]


# 2. Request Schema for Anomaly Detection (Isolation Forest)
class AnomalyInput(BaseModel):
    features: list[float]  # Jaise: [usage_kwh]


@app.post("/api/detect-anomaly")
def detect_anomaly(data: AnomalyInput):
    """Isolation Forest model se check karega ki data normal hai ya anomaly."""
    if anomaly_model is None:
        raise HTTPException(status_code=500, detail="Anomaly model not loaded on server.")
    
    try:
        input_data = np.array([data.features])
        prediction = anomaly_model.predict(input_data)
        
        is_anomaly = bool(prediction[0] == -1)
        message = "Anomaly detected! Unusual power spike." if is_anomaly else "Normal energy usage."
        
        if is_anomaly:
            new_log = {
                "id": len(live_anomaly_logs) + 1,
                "timestamp": "Just now",
                "usage": f"{data.features[0]} kWh",
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
    """Kisi specific anomaly ka status update karne ke liye ( jaise 'Resolved' )"""
    for item in live_anomaly_logs:
        if item["id"] == anomaly_id:
            item["status"] = data.status
            return {"status": "success", "message": "Status updated successfully"}
    raise HTTPException(status_code=404, detail="Anomaly not found")


# 4. Request Schema for Prophet Forecasting
class ForecastInput(BaseModel):
    periods: int = 30


@app.post("/api/predict-forecast")
def predict_forecast(data: ForecastInput):
    if prophet_model is None:
        raise HTTPException(status_code=500, detail="Prophet model not loaded on server.")
    
    try:
        future = prophet_model.make_future_dataframe(periods=data.periods)
        forecast = prophet_model.predict(future)
        
        result_subset = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(data.periods)
        forecast_list = result_subset.to_dict(orient="records")
        
        return {
            "status": "success",
            "forecast_data": forecast_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard")
def get_dashboard_data():
    return {
        "current_usage": "245 kWh",
        "next_forecast": "245 kWh",
        "estimated_bill": "$34.56",
        "potential_saving": "18%"
    }


@app.get("/api/forecast")
def get_forecast_data():
    return {
        "weekly_prediction": "1,450 kWh",
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
    return {
        "total_potential_savings": "₹870 / month",
        "active_tips_count": 4
    }