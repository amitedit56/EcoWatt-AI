from sqlalchemy import Column, Integer, String, Float
from app.core.database import Base


class DashboardMetrics(Base):
    """
    Single-row table that stores the latest processed dataset's metrics, so
    the Dashboard shows real numbers even after the backend restarts. There
    is only ever one row (id=1) — it's a persistent replacement for what used
    to be an in-memory Python dict that reset every time the server restarted.
    """
    __tablename__ = "dashboard_metrics"

    id = Column(Integer, primary_key=True, default=1)
    total_consumption = Column(String, nullable=False, default="245 kWh")
    estimated_bill = Column(String, nullable=False, default="$34.56")
    weekly_prediction = Column(String, nullable=False, default="1,450 kWh")
    status = Column(String, nullable=False, default="Default Dataset")
    scale_factor = Column(Float, nullable=False, default=1.0)