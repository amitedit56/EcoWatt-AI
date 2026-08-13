from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.core.database import Base


class DashboardMetrics(Base):
    """
    One row per user, storing their latest processed dataset's metrics, so
    the Dashboard shows real numbers even after the backend restarts, and
    each user only ever sees their own data (not a shared global row).
    """
    __tablename__ = "dashboard_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True, index=True)
    total_consumption = Column(String, nullable=False, default="245 kWh")
    estimated_bill = Column(String, nullable=False, default="$34.56")
    weekly_prediction = Column(String, nullable=False, default="1,450 kWh")
    status = Column(String, nullable=False, default="Default Dataset")
    scale_factor = Column(Float, nullable=False, default=1.0)