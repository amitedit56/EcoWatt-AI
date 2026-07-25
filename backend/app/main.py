from fastapi import FastAPI

app = FastAPI(
    title="EcoWatt AI API",
    description="AI Powered Household Energy Forecasting API",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "message": "Welcome to EcoWatt AI 🚀"
    }