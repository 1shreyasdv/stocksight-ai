# ============================================================
# DATABASE.PY — Connects Python to your MySQL Database
#
# This file is like a phone call setup between Python and MySQL.
# Before Python can talk to MySQL, it needs to "dial the number"
# (create engine) and "pick up the phone" (create session).
# ============================================================

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.db.models import Base

# Engine = the actual connection to MySQL
# Like dialing the phone number of your database
engine = create_engine(
    settings.DATABASE_URL,
    echo=True   # Shows SQL queries in terminal (helpful for debugging!)
)

# SessionLocal = a factory that creates database sessions
# Each "session" is like one phone call — open it, do stuff, close it
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_tables():
    """
    Creates all tables in MySQL if they don't exist yet.
    Run this once when starting the project for first time.
    It reads all our Model classes from models.py and creates tables.
    """
    Base.metadata.create_all(bind=engine)
    print("✅ All database tables created successfully!")


def get_db():
    """
    This gives each API request its own database session,
    then closes it automatically when request is done.

    Think of it like:
    Open database connection → handle request → close connection
    """
    db = SessionLocal()
    try:
        yield db        # Give the session to whoever asked for it
    finally:
        db.close()      # Always close, even if there was an error!