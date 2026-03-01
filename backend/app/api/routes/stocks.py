# ============================================================
# STOCKS.PY — Optimized & Rate-Limit Safe Version
# ============================================================

from fastapi import APIRouter, HTTPException, Query
import yfinance as yf
import pandas as pd
import time

router = APIRouter()

# ─────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────

TRENDING_TICKERS = ["AAPL", "TSLA", "NVDA"]  # Reduced to 3 (IMPORTANT)
CACHE = {}
CACHE_TTL = 300  # 5 minutes


def get_from_cache(key: str):
    if key in CACHE:
        data, timestamp = CACHE[key]
        if time.time() - timestamp < CACHE_TTL:
            return data
    return None


def set_cache(key: str, data):
    CACHE[key] = (data, time.time())


# ─────────────────────────────────────────────────────────────
# TRENDING STOCKS
# ─────────────────────────────────────────────────────────────

@router.get("/trending")
def get_trending_stocks():
    cache_key = "trending"

    cached = get_from_cache(cache_key)
    if cached:
        return cached

    results = []

    for ticker in TRENDING_TICKERS:
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(period="2d")

            if hist.empty:
                continue

            latest = hist.iloc[-1]
            previous = hist.iloc[-2] if len(hist) > 1 else latest

            change_percent = (
                (latest["Close"] - previous["Close"]) / previous["Close"]
            ) * 100

            results.append({
                "ticker": ticker,
                "company_name": ticker,
                "current_price": round(float(latest["Close"]), 2),
                "change_percent": round(float(change_percent), 2),
            })

        except Exception as e:
            print(f"Trending error {ticker}: {e}")
            continue

    set_cache(cache_key, results)
    return results


# ─────────────────────────────────────────────────────────────
# SEARCH STOCK
# ─────────────────────────────────────────────────────────────

@router.get("/search")
def search_stocks(q: str = Query(...)):
    try:
        ticker = q.upper()
        stock = yf.Ticker(ticker)
        hist = stock.history(period="1d")

        if hist.empty:
            raise HTTPException(status_code=404, detail="Stock not found")

        return [{
            "ticker": ticker,
            "company_name": ticker,
        }]

    except Exception:
        raise HTTPException(status_code=404, detail="Stock not found")


# ─────────────────────────────────────────────────────────────
# STOCK OVERVIEW
# ─────────────────────────────────────────────────────────────

@router.get("/{ticker}/overview")
def get_stock_overview(ticker: str):
    ticker = ticker.upper()
    cache_key = f"overview_{ticker}"

    cached = get_from_cache(cache_key)
    if cached:
        return cached

    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period="5d")

        if hist.empty:
            raise HTTPException(status_code=404, detail="No data found")

        latest = hist.iloc[-1]
        previous = hist.iloc[-2] if len(hist) > 1 else latest

        change = latest["Close"] - previous["Close"]
        change_percent = (change / previous["Close"]) * 100

        data = {
            "ticker": ticker,
            "company_name": ticker,
            "current_price": round(float(latest["Close"]), 2),
            "change": round(float(change), 2),
            "change_percent": round(float(change_percent), 2),
            "volume": int(latest["Volume"]),
        }

        set_cache(cache_key, data)
        return data

    except Exception as e:
        print(f"Overview error {ticker}: {e}")
        return {
            "ticker": ticker,
            "error": "Rate limited. Please try again later."
        }


# ─────────────────────────────────────────────────────────────
# STOCK HISTORY
# ─────────────────────────────────────────────────────────────

@router.get("/{ticker}/history")
def get_stock_history(
    ticker: str,
    period: str = Query(default="1y"),
    interval: str = Query(default="1d")
):
    ticker = ticker.upper()
    cache_key = f"history_{ticker}_{period}_{interval}"

    cached = get_from_cache(cache_key)
    if cached:
        return cached

    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period, interval=interval)

        if hist.empty:
            raise HTTPException(status_code=404, detail="No history found")

        result = []
        for date, row in hist.iterrows():
            result.append({
                "date": str(date.date()),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"])
            })

        response = {
            "ticker": ticker,
            "period": period,
            "interval": interval,
            "data": result
        }

        set_cache(cache_key, response)
        return response

    except Exception as e:
        print(f"History error {ticker}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching history")


# ─────────────────────────────────────────────────────────────
# TECHNICAL INDICATORS
# ─────────────────────────────────────────────────────────────

@router.get("/{ticker}/indicators")
def get_technical_indicators(ticker: str):
    ticker = ticker.upper()
    cache_key = f"indicators_{ticker}"

    cached = get_from_cache(cache_key)
    if cached:
        return cached

    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period="1y")

        if hist.empty:
            raise HTTPException(status_code=404, detail="No data found")

        close = hist["Close"]

        # RSI
        delta = close.diff()
        gain = delta.where(delta > 0, 0).rolling(window=14).mean()
        loss = -delta.where(delta < 0, 0).rolling(window=14).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))

        # SMA
        sma_20 = close.rolling(20).mean()
        sma_50 = close.rolling(50).mean()

        # MACD
        ema_12 = close.ewm(span=12).mean()
        ema_26 = close.ewm(span=26).mean()
        macd = ema_12 - ema_26

        n = 100
        response = {
            "ticker": ticker,
            "dates": [str(d.date()) for d in hist.index[-n:]],
            "rsi": [round(v, 2) if not pd.isna(v) else None for v in rsi[-n:]],
            "sma_20": [round(v, 2) if not pd.isna(v) else None for v in sma_20[-n:]],
            "sma_50": [round(v, 2) if not pd.isna(v) else None for v in sma_50[-n:]],
            "macd": [round(v, 4) if not pd.isna(v) else None for v in macd[-n:]],
        }

        set_cache(cache_key, response)
        return response

    except Exception as e:
        print(f"Indicator error {ticker}: {e}")
        raise HTTPException(status_code=500, detail="Error calculating indicators")