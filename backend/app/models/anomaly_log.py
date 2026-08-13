from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base


class AnomalyLog(Base):
    """One row per detected anomaly, always tied to the user it belongs to.
    Replaces the old global in-memory `live_anomaly_logs` list, which was
    shared by every user on the app — a serious data-leak bug."""
    __tablename__ = "anomaly_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    timestamp = Column(String, nullable=False)
    usage = Column(String, nullable=False)
    severity = Column(String, nullable=False)  # "danger" | "warning"
    reason = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Unresolved")