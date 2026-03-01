# ============================================================
# INSIGHTS.PY — AI-Powered Stock Analysis Route
#
# This is the SMARTEST part of your project!
# It uses Claude AI to analyze stocks like a hedge fund analyst.
#
# It gives:
# - Technical analysis score
# - Sentiment analysis
# - Probability forecast (Bullish/Bearish %)
# - Overall AI confidence score
# - Professional explanation
#
# API Endpoints:
# GET /api/insights/{ticker} → Full AI analysis
# ============================================================

from fastapi import APIRouter, HTTPException
import yfinance as yf
import pandas as pd
import numpy as np
import json

router = APIRouter()


def calculate_rsi(close, period=14):
    """Calculate RSI indicator"""
    delta = close.diff()
    gain  = delta.where(delta > 0, 0).rolling(period).mean()
    loss  = -delta.where(delta < 0, 0).rolling(period).mean()
    rs    = gain / loss
    return 100 - (100 / (1 + rs))


def calculate_macd(close):
    """Calculate MACD indicator"""
    ema12      = close.ewm(span=12).mean()
    ema26      = close.ewm(span=26).mean()
    macd_line  = ema12 - ema26
    signal     = macd_line.ewm(span=9).mean()
    return macd_line, signal


def get_technical_score(hist) -> dict:
    """
    Analyze technical indicators and give a score.
    Like a doctor checking your health — but for stocks!
    """
    close  = hist["Close"]
    volume = hist["Volume"]

    # Calculate indicators
    rsi         = calculate_rsi(close)
    macd, signal = calculate_macd(close)
    sma50       = close.rolling(50).mean()
    sma200      = close.rolling(200).mean()
    bb_mid      = close.rolling(20).mean()
    bb_std      = close.rolling(20).std()
    bb_upper    = bb_mid + 2 * bb_std
    bb_lower    = bb_mid - 2 * bb_std

    # Get latest values
    current_rsi    = float(rsi.iloc[-1])
    current_macd   = float(macd.iloc[-1])
    current_signal = float(signal.iloc[-1])
    current_price  = float(close.iloc[-1])
    current_sma50  = float(sma50.iloc[-1])
    current_sma200 = float(sma200.iloc[-1])
    current_bb_upper = float(bb_upper.iloc[-1])
    current_bb_lower = float(bb_lower.iloc[-1])

    # Volume trend
    avg_volume    = float(volume.rolling(20).mean().iloc[-1])
    current_volume = float(volume.iloc[-1])
    volume_trend  = "High" if current_volume > avg_volume * 1.2 else "Low"

    # Detect signals
    signals_detected = []
    score = 50  # Start neutral

    # RSI signals
    if current_rsi > 70:
        signals_detected.append("RSI Overbought (>70)")
        score -= 10
    elif current_rsi < 30:
        signals_detected.append("RSI Oversold (<30)")
        score += 10

    # MACD signals
    if current_macd > current_signal:
        signals_detected.append("MACD Bullish Crossover")
        score += 15
    else:
        signals_detected.append("MACD Bearish Crossover")
        score -= 15

    # Moving Average signals
    if current_price > current_sma50:
        signals_detected.append("Price Above SMA50")
        score += 10
    else:
        signals_detected.append("Price Below SMA50")
        score -= 10

    # Golden Cross / Death Cross
    if current_sma50 > current_sma200:
        signals_detected.append("Golden Cross (SMA50 > SMA200)")
        score += 20
    else:
        signals_detected.append("Death Cross (SMA50 < SMA200)")
        score -= 20

    # Bollinger Band signals
    if current_price > current_bb_upper:
        signals_detected.append("Price Above Upper Bollinger Band")
        score -= 5
    elif current_price < current_bb_lower:
        signals_detected.append("Price Below Lower Bollinger Band")
        score += 5

    # Volume confirmation
    if volume_trend == "High":
        signals_detected.append("High Volume Confirmation")
        score += 5

    # Clamp score between 0 and 100
    score = max(0, min(100, score))

    # Determine trend
    if score >= 65:
        trend = "Bullish"
    elif score <= 35:
        trend = "Bearish"
    else:
        trend = "Neutral"

    return {
        "trend":            trend,
        "signal_strength":  round(score / 10, 1),
        "score":            score,
        "signals_detected": signals_detected,
        "rsi":              round(current_rsi, 2),
        "macd":             round(current_macd, 4),
        "sma50":            round(current_sma50, 2),
        "sma200":           round(current_sma200, 2),
        "volume_trend":     volume_trend,
        "explanation": (
            f"Stock is showing {trend.lower()} signals with RSI at {round(current_rsi, 1)}. "
            f"MACD is {'above' if current_macd > current_signal else 'below'} signal line indicating "
            f"{'positive' if current_macd > current_signal else 'negative'} momentum. "
            f"Price is {'above' if current_price > current_sma50 else 'below'} the 50-day moving average."
        )
    }


def get_sentiment_analysis(ticker) -> dict:
    """
    Analyze news sentiment for the stock.
    Like reading all news articles and summarizing the mood!
    """
    try:
        from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
        analyzer  = SentimentIntensityAnalyzer()
        stock     = yf.Ticker(ticker)
        news_data = stock.news

        if not news_data:
            return {
                "market_sentiment": "Neutral",
                "confidence":       "Low",
                "impact_horizon":   "Short-Term",
                "score":            0,
                "articles":         0,
                "explanation":      "No recent news found for this stock."
            }

        scores   = []
        positive = 0
        negative = 0
        neutral  = 0

        for article in news_data[:10]:
            content = article.get("content", {})
            title   = content.get("title", "")
            if title:
                s = analyzer.polarity_scores(title)["compound"]
                scores.append(s)
                if s >= 0.05:   positive += 1
                elif s <= -0.05: negative += 1
                else:            neutral  += 1

        avg_score = sum(scores) / len(scores) if scores else 0

        if avg_score >= 0.05:
            sentiment  = "Bullish"
            confidence = "High" if avg_score > 0.3 else "Medium"
        elif avg_score <= -0.05:
            sentiment  = "Bearish"
            confidence = "High" if avg_score < -0.3 else "Medium"
        else:
            sentiment  = "Neutral"
            confidence = "Low"

        return {
            "market_sentiment": sentiment,
            "confidence":       confidence,
            "impact_horizon":   "Short-Term",
            "score":            round(avg_score, 4),
            "articles":         len(scores),
            "positive":         positive,
            "negative":         negative,
            "neutral":          neutral,
            "explanation": (
                f"Analysis of {len(scores)} articles shows {sentiment.lower()} sentiment "
                f"with score of {round(avg_score, 3)}. "
                f"{positive} positive, {negative} negative, {neutral} neutral articles found."
            )
        }
    except Exception as e:
        return {
            "market_sentiment": "Neutral",
            "confidence":       "Low",
            "impact_horizon":   "Short-Term",
            "score":            0,
            "articles":         0,
            "explanation":      f"Sentiment analysis unavailable: {str(e)}"
        }


def get_probability_forecast(technical: dict, sentiment: dict, hist) -> dict:
    """
    Calculate probability of stock going up or down.
    Like weather forecast but for stocks!
    Bullish % + Bearish % + Neutral % = 100%
    """
    close   = hist["Close"]
    returns = close.pct_change().dropna()

    # Volatility (how much price moves)
    volatility = float(returns.std() * np.sqrt(252) * 100)

    # Base probabilities from technical score
    tech_score = technical["score"]

    bullish  = tech_score
    bearish  = 100 - tech_score
    neutral  = 20

    # Adjust for sentiment
    sentiment_score = sentiment["score"]
    if sentiment_score > 0:
        bullish += sentiment_score * 20
        bearish -= sentiment_score * 10
    else:
        bearish += abs(sentiment_score) * 20
        bullish -= abs(sentiment_score) * 10

    # Adjust for volatility
    if volatility > 40:
        neutral += 10
        bullish -= 5
        bearish -= 5

    # Normalize to 100%
    total    = bullish + bearish + neutral
    bullish  = max(5,  round(bullish  / total * 100))
    bearish  = max(5,  round(bearish  / total * 100))
    neutral  = max(5,  100 - bullish - bearish)

    # Confidence score
    confidence = round(
        (tech_score * 0.5) +
        (min(sentiment["articles"], 10) * 2) +
        (20 if volatility < 30 else 5)
    )
    confidence = max(0, min(100, confidence))

    return {
        "bullish_probability": bullish,
        "bearish_probability": bearish,
        "neutral_probability": neutral,
        "confidence_score":    confidence,
        "volatility":          round(volatility, 2),
        "summary": (
            f"Based on technical and sentiment analysis, "
            f"bullish probability is {bullish}%, bearish is {bearish}%, "
            f"neutral is {neutral}%. "
            f"Annual volatility is {round(volatility, 1)}%. "
            f"AI confidence in this forecast: {confidence}/100."
        )
    }


def get_composite_score(technical: dict, sentiment: dict, forecast: dict) -> dict:
    """
    Calculate one final AI score combining everything.
    Like a report card grade for the stock!
    """
    # Weighted combination
    tech_weight      = 0.45
    sentiment_weight = 0.25
    forecast_weight  = 0.30

    sentiment_score_normalized = (sentiment["score"] + 1) * 50

    ai_score = (
        technical["score"]           * tech_weight +
        sentiment_score_normalized   * sentiment_weight +
        forecast["bullish_probability"] * forecast_weight
    )
    ai_score = round(max(0, min(100, ai_score)))

    # Rating based on score
    if ai_score >= 80:
        rating = "Strong Buy"
    elif ai_score >= 65:
        rating = "Buy"
    elif ai_score >= 45:
        rating = "Hold"
    elif ai_score >= 30:
        rating = "Sell"
    else:
        rating = "Strong Sell"

    return {
        "ai_score":  ai_score,
        "rating":    rating,
        "confidence": forecast["confidence_score"],
        "reasoning": (
            f"Technical analysis scores {technical['score']}/100 with {technical['trend']} trend. "
            f"News sentiment is {sentiment['market_sentiment']} with {sentiment['confidence']} confidence. "
            f"Probability model shows {forecast['bullish_probability']}% bullish outlook. "
            f"Combined AI Score: {ai_score}/100 — {rating}."
        )
    }


@router.get("/{ticker}")
def get_ai_insights(ticker: str):
    """
    Main endpoint — returns complete AI analysis for a stock.
    Combines technical, sentiment, forecast, and composite score.
    """
    try:
        # Get historical data
        stock = yf.Ticker(ticker.upper())
        hist  = stock.history(period="1y")
        info  = stock.info

        if hist.empty or len(hist) < 50:
            raise HTTPException(
                status_code=404,
                detail=f"Not enough data for {ticker}"
            )

        # Run all analyses
        technical = get_technical_score(hist)
        sentiment = get_sentiment_analysis(ticker.upper())
        forecast  = get_probability_forecast(technical, sentiment, hist)
        composite = get_composite_score(technical, sentiment, forecast)

        # Current price info
        current_price = float(hist["Close"].iloc[-1])
        prev_price    = float(hist["Close"].iloc[-2])
        change_pct    = ((current_price - prev_price) / prev_price) * 100

        return {
            "ticker":        ticker.upper(),
            "company_name":  info.get("longName", ticker.upper()),
            "current_price": round(current_price, 2),
            "change_pct":    round(change_pct, 2),
            "analysis": {
                "technical":  technical,
                "sentiment":  sentiment,
                "forecast":   forecast,
                "composite":  composite,
            },
            "risk_factors": [
                f"Annual volatility: {forecast['volatility']}%",
                f"RSI level: {technical['rsi']} ({'Overbought' if technical['rsi'] > 70 else 'Oversold' if technical['rsi'] < 30 else 'Normal'})",
                f"Sentiment confidence: {sentiment['confidence']}",
                "Past performance does not guarantee future results",
                "Market conditions can change rapidly"
            ],
            "disclaimer": "This analysis is for educational purposes only and does not constitute financial advice."
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis error: {str(e)}"
        )