from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base


class UploadHistory(Base):
    """One row per uploaded dataset, tied to the user who uploaded it.
    Replaces the old browser-localStorage-based history, which leaked
    between different accounts sharing the same browser.

    total_consumption / estimated_bill are a snapshot of the metrics
    computed AT UPLOAD TIME, so a downloadable report for an older upload
    still shows that upload's own numbers, even after a newer upload has
    changed the user's "current" dashboard metrics.
    """
    __tablename__ = "upload_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    filename = Column(String, nullable=False)
    upload_date = Column(String, nullable=False)
    size = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Processed")
    total_consumption = Column(String, nullable=True)
    estimated_bill = Column(String, nullable=True)