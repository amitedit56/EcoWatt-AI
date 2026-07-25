from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="EcoWatt AI API", version="1.0.0")

# Enable CORS for React Frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to EcoWatt AI Backend API"}

@app.get("/api/forecast")
def get_forecast():
    return {
        "total_forecast": 275,
        "average_per_day": 9.17,
        "highest_day": 12.3,
        "lowest_day": 6.4
    }

@app.get("/api/anomalies")
def get_anomalies():
    return [
        {"id": 1, "timestamp": "14 Jun 2024, 8:30 PM", "usage": "8.3 kWh", "severity": "High", "reason": "AC Overuse Spike Detected"},
        {"id": 2, "timestamp": "10 Jun 2024, 11:15 PM", "usage": "7.1 kWh", "severity": "Medium", "reason": "Unusual Night Activity"}
    ]