# ============================================================
# SCHEMAS.PY — Data Shapes for API Requests and Responses
#
# When someone sends data to your API, how should it look?
# Schemas define the EXACT shape of data coming in and going out.
#
# Like a form at school — it has specific fields you must fill.
# If you miss a required field, it rejects the form!
# ============================================================

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ─── AUTH SCHEMAS ────────────────────────────────────────────

class UserRegister(BaseModel):
    """Data needed to register a new user"""
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    """Data needed to login"""
    email: EmailStr
    password: str

class Token(BaseModel):
    """What we send back after successful login"""
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    """User info we send back (never include password!)"""
    id: int
    email: str
    full_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── WATCHLIST SCHEMAS ───────────────────────────────────────

class WatchlistAdd(BaseModel):
    """Add a stock to watchlist"""
    ticker: str

class WatchlistResponse(BaseModel):
    id: int
    ticker: str
    added_at: datetime

    class Config:
        from_attributes = True


# ─── PORTFOLIO SCHEMAS ───────────────────────────────────────

class PortfolioAdd(BaseModel):
    """Add a stock position to portfolio"""
    ticker: str
    quantity: float
    avg_buy_price: float
    buy_date: str
    notes: Optional[str] = None

class PortfolioResponse(BaseModel):
    id: int
    ticker: str
    quantity: float
    avg_buy_price: float
    buy_date: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── STOCK SCHEMAS ───────────────────────────────────────────

class StockOverview(BaseModel):
    """Basic info about a stock"""
    ticker: str
    company_name: str
    current_price: float
    change: float
    change_percent: float
    market_cap: Optional[float]
    pe_ratio: Optional[float]
    week_52_high: Optional[float]
    week_52_low: Optional[float]
    volume: Optional[int]

class PricePoint(BaseModel):
    """One data point in price history"""
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


# ─── PREDICTION SCHEMAS ──────────────────────────────────────

class PredictionPoint(BaseModel):
    """One predicted price point"""
    date: str
    predicted_price: float
    lower_bound: float
    upper_bound: float

class PredictionResponse(BaseModel):
    """Full prediction response"""
    ticker: str
    model_name: str
    predictions: List[PredictionPoint]
    mae: Optional[float]
    rmse: Optional[float]
    mape: Optional[float]
    verdict: str


# ─── SENTIMENT SCHEMAS ───────────────────────────────────────

class NewsItem(BaseModel):
    """One news headline with sentiment"""
    title: str
    source: str
    url: str
    published_at: str
    sentiment_score: float
    sentiment_label: str

class SentimentResponse(BaseModel):
    """Overall sentiment for a stock"""
    ticker: str
    overall_score: float
    overall_label: str
    news: List[NewsItem]