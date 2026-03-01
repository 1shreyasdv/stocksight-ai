# ============================================================
# MAIN.PY — The Front Door of your Backend Server
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import stocks, predictions, sentiment, portfolio, auth, insights
from app.db.database import create_tables

app = FastAPI(
    title="StockSight AI",
    description="AI-Powered Stock Market Prediction Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routes
app.include_router(auth.router,        prefix="/api/auth",      tags=["Auth"])
app.include_router(stocks.router,      prefix="/api/stocks",    tags=["Stocks"])
app.include_router(predictions.router, prefix="/api/predict",   tags=["Predictions"])
app.include_router(sentiment.router,   prefix="/api/sentiment", tags=["Sentiment"])
app.include_router(portfolio.router,   prefix="/api/portfolio", tags=["Portfolio"])
app.include_router(insights.router,    prefix="/api/insights",  tags=["AI Insights"])

@app.on_event("startup")
def startup_event():
    print("🚀 StockSight AI Server is running!")

@app.get("/")
def home():
    return {
        "message": "Welcome to StockSight AI! 🚀",
        "status":  "Server is running!",
        "docs":    "Visit http://localhost:8000/docs to see all APIs"
    }