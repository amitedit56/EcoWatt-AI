import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./ecowatt.db"
)

# Support older postgres:// URLs
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgres://",
        "postgresql://",
        1
    )


# ============================================================
# DATABASE ENGINE
# ============================================================

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={
            "check_same_thread": False
        }
    )

else:
    # PostgreSQL / Neon
    #
    # Reuse existing connections instead of opening a new
    # PostgreSQL connection for every request.
    #
    # pool_pre_ping:
    # Checks whether a pooled connection is still alive.
    #
    # pool_recycle:
    # Recycles connections periodically to avoid stale
    # connections.
    #
    # pool_size:
    # Number of persistent connections kept ready.
    #
    # max_overflow:
    # Allows additional temporary connections under load.

    engine = create_engine(
        DATABASE_URL,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=1800,
        pool_timeout=30,
    )


# ============================================================
# SESSION
# ============================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# ============================================================
# BASE MODEL
# ============================================================

Base = declarative_base()


# ============================================================
# FASTAPI DATABASE DEPENDENCY
# ============================================================

def get_db():
    """
    Creates a database session for a request
    and closes it after the request finishes.
    """

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()