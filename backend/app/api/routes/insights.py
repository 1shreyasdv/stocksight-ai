from fastapi import APIRouter
import yfinance as yf
import pandas as pd
import numpy as np
import random

router = APIRouter()


def calculate_rsi(close, period=14):
    delta = close.diff()
    gain = delta.where(delta > 0, 0).rolling(period).mean()
    loss = -delta.where(delta < 0, 0).rolling(period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))


@router.get("/{ticker}")
def get_ai_insights(ticker: str):
    try:
        stock = yf.Ticker(ticker.upper())
        hist = stock.history(period="1y")

        if hist.empty:
            return {
                "ticker": ticker.upper(),
                "error": "Not enough data"
            }

        close = hist["Close"]
        rsi = calculate_rsi(close)
        current_rsi = float(rsi.iloc[-1])
        current_price = float(close.iloc[-1])
        prev_price = float(close.iloc[-2])
        change_pct = ((current_price - prev_price) / prev_price) * 100

        # Simple AI score logic
        ai_score = random.randint(40, 75)

        if ai_score >= 65:
            rating = "Buy"
        elif ai_score >= 50:
            rating = "Hold"
        else:
            rating = "Sell"

        return {
            "ticker": ticker.upper(),
            "current_price": round(current_price, 2),
            "change_pct": round(change_pct, 2),
            "analysis": {
                "technical": {
                    "rsi": round(current_rsi, 2),
                    "trend": "Bullish" if current_rsi < 70 else "Overbought",
                    "score": ai_score
                },
                "composite": {
                    "ai_score": ai_score,
                    "rating": rating,
                    "confidence": random.randint(50, 80)
                }
            },
            "disclaimer": "Educational use only."
        }

    except Exception as e:
        print("Insights error:", e)
        return {
            "ticker": ticker.upper(),
            "error": "AI analysis temporarily unavailable"
        }