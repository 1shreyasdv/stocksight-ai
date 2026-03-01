# ============================================================
# MODELS.PY — Database Tables as Python Classes
#
# Instead of writing SQL like "CREATE TABLE users (...)"
# We write Python classes and SQLAlchemy converts them to SQL tables.
#
# Think of each class = one table in your MySQL database.
# Think of each variable inside = one column in that table.
# ============================================================

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

# Base is like a parent class all our models inherit from
Base = declarative_base()


class User(Base):
    """
    Users Table — stores everyone who registers on the website
    Like a school register with each student's details!
    """
    __tablename__ = "users"

    id               = Column(Integer, primary_key=True, index=True)
    email            = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password  = Column(String(255), nullable=False)
    full_name        = Column(String(255))
    created_at       = Column(DateTime, default=datetime.utcnow)

    portfolio        = relationship("PortfolioPosition", back_populates="user")
    watchlist        = relationship("Watchlist", back_populates="user")


class Watchlist(Base):
    """
    Watchlist Table — stocks user wants to keep an eye on
    Like your YouTube watch later list, but for stocks!
    """
    __tablename__ = "watchlist"

    id        = Column(Integer, primary_key=True, index=True)
    user_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    ticker    = Column(String(10), nullable=False)
    added_at  = Column(DateTime, default=datetime.utcnow)

    user      = relationship("User", back_populates="watchlist")


class PortfolioPosition(Base):
    """
    Portfolio Table — stocks user has bought (or pretend bought)
    Stores how many shares, at what price, on what date.
    """
    __tablename__ = "portfolio_positions"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"), nullable=False)
    ticker         = Column(String(10), nullable=False)
    quantity       = Column(Float, nullable=False)
    avg_buy_price  = Column(Float, nullable=False)
    buy_date       = Column(String(20), nullable=False)
    notes          = Column(Text)
    created_at     = Column(DateTime, default=datetime.utcnow)

    user           = relationship("User", back_populates="portfolio")


class PredictionCache(Base):
    """
    Saves ML predictions so we don't recalculate every time.
    Like saving a game — no need to start from scratch!
    """
    __tablename__ = "prediction_cache"

    id               = Column(Integer, primary_key=True, index=True)
    ticker           = Column(String(10), nullable=False)
    model_name       = Column(String(50), nullable=False)
    prediction_json  = Column(Text, nullable=False)
    accuracy_metrics = Column(Text)
    created_at       = Column(DateTime, default=datetime.utcnow)
    expires_at       = Column(DateTime, nullable=False)


class SentimentCache(Base):
    """
    Saves news sentiment results so we don't re-analyze every time.
    """
    __tablename__ = "sentiment_cache"

    id              = Column(Integer, primary_key=True, index=True)
    ticker          = Column(String(10), nullable=False)
    sentiment_data  = Column(Text, nullable=False)
    created_at      = Column(DateTime, default=datetime.utcnow)
    expires_at      = Column(DateTime, nullable=False)