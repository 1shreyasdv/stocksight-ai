# ============================================================
# STOCKS.PY — Stock Data API Routes
#
# This file fetches real stock data using yfinance.
# yfinance is a free library that gets data from Yahoo Finance.
#
# API Endpoints:
# GET /api/stocks/trending              → Popular stocks for homepage
# GET /api/stocks/search?q=apple        → Search for stocks
# GET /api/stocks/{ticker}/overview     → Get stock info
# GET /api/stocks/{ticker}/history      → Get price history
# GET /api/stocks/{ticker}/indicators   → Get RSI, MACD etc.
# ============================================================

from fastapi import APIRouter, HTTPException, Query
from typing import List
import yfinance as yf
import pandas as pd

router = APIRouter()

# Popular stocks to show on homepage
TRENDING_TICKERS = ["AAPL", "TSLA", "GOOGL", "MSFT", "AMZN", "NVDA", "META", "NFLX"]


@router.get("/trending")
def get_trending_stocks():
    """
    Returns price info for popular/trending stocks.
    Shown on the homepage of the website.
    """
    results = []

    for ticker in TRENDING_TICKERS:
        try:
            stock = yf.Ticker(ticker)
            info = stock.info

            results.append({
                "ticker": ticker,
                "company_name": info.get("longName", ticker),
                "current_price": info.get("currentPrice", info.get("regularMarketPrice", 0)),
                "change_percent": info.get("regularMarketChangePercent", 0),
            })
        except Exception as e:
            print(f"Error fetching {ticker}: {e}")
            continue

    return results


@router.get("/search")
def search_stocks(q: str = Query(..., description="Stock name or ticker to search")):
    """
    Search for stocks by company name or ticker symbol.
    Example: /api/stocks/search?q=apple
    """
    try:
        ticker = yf.Ticker(q.upper())
        info = ticker.info

        if not info or "longName" not in info:
            raise HTTPException(status_code=404, detail=f"No stock found for '{q}'")

        return [{
            "ticker": q.upper(),
            "company_name": info.get("longName", q.upper()),
            "exchange": info.get("exchange", "N/A"),
            "sector": info.get("sector", "N/A"),
        }]
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Stock not found: {str(e)}")


@router.get("/{ticker}/overview")
def get_stock_overview(ticker: str):
    """
    Get detailed info about one specific stock.
    Example: /api/stocks/AAPL/overview

    Returns company name, price, P/E ratio, market cap etc.
    """
    try:
        stock = yf.Ticker(ticker.upper())
        info = stock.info

        if not info:
            raise HTTPException(status_code=404, detail=f"Stock {ticker} not found")

        return {
            "ticker": ticker.upper(),
            "company_name": info.get("longName", ticker),
            "current_price": info.get("currentPrice", info.get("regularMarketPrice", 0)),
            "change": info.get("regularMarketChange", 0),
            "change_percent": info.get("regularMarketChangePercent", 0),
            "market_cap": info.get("marketCap", None),
            "pe_ratio": info.get("trailingPE", None),
            "week_52_high": info.get("fiftyTwoWeekHigh", None),
            "week_52_low": info.get("fiftyTwoWeekLow", None),
            "volume": info.get("regularMarketVolume", None),
            "avg_volume": info.get("averageVolume", None),
            "dividend_yield": info.get("dividendYield", None),
            "sector": info.get("sector", "N/A"),
            "industry": info.get("industry", "N/A"),
            "description": info.get("longBusinessSummary", "No description available"),
            "website": info.get("website", "N/A"),
            "employees": info.get("fullTimeEmployees", None),
            "country": info.get("country", "N/A"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stock data: {str(e)}")


@router.get("/{ticker}/history")
def get_stock_history(
    ticker: str,
    period: str = Query(default="1y", description="Time period: 1mo, 3mo, 6mo, 1y, 2y"),
    interval: str = Query(default="1d", description="Data interval: 1d, 1wk, 1mo")
):
    """
    Get historical price data for a stock.
    Example: /api/stocks/AAPL/history?period=1y&interval=1d

    OHLCV = Open, High, Low, Close, Volume
    This data is used to draw the charts!
    """
    try:
        stock = yf.Ticker(ticker.upper())
        hist = stock.history(period=period, interval=interval)

        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No history found for {ticker}")

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

        return {
            "ticker": ticker.upper(),
            "period": period,
            "interval": interval,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/{ticker}/indicators")
def get_technical_indicators(ticker: str):
    """
    Calculate technical indicators for a stock.

    RSI  → Shows if stock is overbought (>70) or oversold (<30)
    MACD → Shows momentum and trend direction
    SMA  → Average price over N days
    BB   → Bollinger Bands upper and lower price boundaries
    """
    try:
        stock = yf.Ticker(ticker.upper())
        hist = stock.history(period="1y")

        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No data for {ticker}")

        close = hist["Close"]

        # RSI
        delta = close.diff()
        gain = delta.where(delta > 0, 0).rolling(window=14).mean()
        loss = -delta.where(delta < 0, 0).rolling(window=14).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))

        # SMA
        sma_20  = close.rolling(window=20).mean()
        sma_50  = close.rolling(window=50).mean()
        sma_200 = close.rolling(window=200).mean()

        # EMA and MACD
        ema_12       = close.ewm(span=12).mean()
        ema_26       = close.ewm(span=26).mean()
        macd_line    = ema_12 - ema_26
        signal_line  = macd_line.ewm(span=9).mean()
        macd_histogram = macd_line - signal_line

        # Bollinger Bands
        bb_middle = close.rolling(window=20).mean()
        bb_std    = close.rolling(window=20).std()
        bb_upper  = bb_middle + (bb_std * 2)
        bb_lower  = bb_middle - (bb_std * 2)

        n = 100
        dates = [str(d.date()) for d in hist.index[-n:]]

        return {
            "ticker": ticker.upper(),
            "dates": dates,
            "rsi": [round(v, 2) if not pd.isna(v) else None for v in rsi[-n:]],
            "current_rsi": round(float(rsi.iloc[-1]), 2),
            "rsi_signal": "Overbought" if rsi.iloc[-1] > 70 else "Oversold" if rsi.iloc[-1] < 30 else "Neutral",
            "sma_20":  [round(v, 2) if not pd.isna(v) else None for v in sma_20[-n:]],
            "sma_50":  [round(v, 2) if not pd.isna(v) else None for v in sma_50[-n:]],
            "sma_200": [round(v, 2) if not pd.isna(v) else None for v in sma_200[-n:]],
            "macd":          [round(v, 4) if not pd.isna(v) else None for v in macd_line[-n:]],
            "macd_signal":   [round(v, 4) if not pd.isna(v) else None for v in signal_line[-n:]],
            "macd_histogram":[round(v, 4) if not pd.isna(v) else None for v in macd_histogram[-n:]],
            "bb_upper":  [round(v, 2) if not pd.isna(v) else None for v in bb_upper[-n:]],
            "bb_middle": [round(v, 2) if not pd.isna(v) else None for v in bb_middle[-n:]],
            "bb_lower":  [round(v, 2) if not pd.isna(v) else None for v in bb_lower[-n:]],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")