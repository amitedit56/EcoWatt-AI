from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# NOTE: Using SQLite for now so everything works with zero extra setup.
# When you're ready for Phase 10 (deployment), just change this URL to your
# Postgres connection string (e.g. from Neon/Supabase) — nothing else changes.
DATABASE_URL = "sqlite:///./ecowatt.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # only needed for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency: gives each request its own DB session and closes it after."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()