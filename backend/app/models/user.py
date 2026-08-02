from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    # Nullable now: users who sign up via Google never set a local password.
    hashed_password = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    # Per-user notification preferences (Settings > Notifications tab)
    email_alerts = Column(Boolean, nullable=False, default=True)
    anomaly_alerts = Column(Boolean, nullable=False, default=True)
    weekly_reports = Column(Boolean, nullable=False, default=False)
    # Set when the account was created/linked via "Sign in with Google"
    google_id = Column(String, unique=True, index=True, nullable=True)
    # Forgot-password flow: a short-lived random token + its expiry
    reset_token = Column(String, nullable=True)
    reset_token_expiry = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())