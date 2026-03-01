# ============================================================
# SENTIMENT.PY — News Sentiment Analysis Route
#
# This file reads news headlines about a stock and figures out
# if the news is POSITIVE or NEGATIVE.
#
# We use VADER — a tool that reads text and gives a score:
# +1.0 = Very Positive  (like "Apple hits record profits!")
#  0.0 = Neutral        (like "Apple releases new product")
# -1.0 = Very Negative  (like "Apple faces massive lawsuit")
#
# API Endpoints:
# GET /api/sentiment/{ticker}/news   → News + sentiment scores
# GET /api/sentiment/{ticker}/score  → Overall sentiment summary
# ============================================================

from fastapi import APIRouter, HTTPException
import yfinance as yf
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

router = APIRouter()

# Create VADER analyzer — this is the "reader" that scores text
analyzer = SentimentIntensityAnalyzer()


def analyze_text(text: str) -> dict:
    """
    Analyze one piece of text and return sentiment scores.

    VADER returns 4 scores:
    - neg: how negative (0 to 1)
    - neu: how neutral (0 to 1)
    - pos: how positive (0 to 1)
    - compound: overall score (-1 to +1) ← we use this one!
    """
    scores   = analyzer.polarity_scores(text)
    compound = scores["compound"]

    if compound >= 0.05:
        label = "Positive"
    elif compound <= -0.05:
        label = "Negative"
    else:
        label = "Neutral"

    return {
        "score":           round(compound, 4),
        "label":           label,
        "positive_score":  round(scores["pos"], 4),
        "negative_score":  round(scores["neg"], 4),
        "neutral_score":   round(scores["neu"], 4),
    }


@router.get("/{ticker}/news")
def get_news_sentiment(ticker: str):
    """
    Get recent news headlines for a stock with sentiment scores.
    Uses yfinance to fetch news, then VADER to score each headline.
    """
    try:
        stock     = yf.Ticker(ticker.upper())
        news_data = stock.news

        if not news_data:
            return {
                "ticker":  ticker.upper(),
                "message": "No recent news found",
                "news":    []
            }

        analyzed_news = []

        for article in news_data[:10]:
            content    = article.get("content", {})
            title      = content.get("title", "No title")
            sentiment  = analyze_text(title)
            provider   = content.get("provider", {})
            source_name = provider.get("displayName", "Unknown Source") if isinstance(provider, dict) else str(provider)
            pub_date   = content.get("pubDate", "")

            analyzed_news.append({
                "title":           title,
                "source":          source_name,
                "url":             content.get("canonicalUrl", {}).get("url", "#") if isinstance(content.get("canonicalUrl"), dict) else "#",
                "published_at":    pub_date,
                "sentiment_score": sentiment["score"],
                "sentiment_label": sentiment["label"],
                "positive_score":  sentiment["positive_score"],
                "negative_score":  sentiment["negative_score"],
            })

        return {
            "ticker":         ticker.upper(),
            "total_articles": len(analyzed_news),
            "news":           analyzed_news
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching news: {str(e)}")


@router.get("/{ticker}/score")
def get_overall_sentiment(ticker: str):
    """
    Get the overall sentiment score for a stock.

    Averages all news scores and gives one simple answer:
    Bullish  = overall positive news
    Bearish  = overall negative news
    Neutral  = mixed or no clear direction
    """
    try:
        stock     = yf.Ticker(ticker.upper())
        news_data = stock.news

        if not news_data:
            return {
                "ticker":           ticker.upper(),
                "overall_score":    0,
                "overall_label":    "Neutral",
                "confidence":       "Low (no news found)",
                "articles_analyzed": 0
            }

        scores = []

        for article in news_data[:10]:
            content = article.get("content", {})
            title   = content.get("title", "")
            if title:
                sentiment = analyze_text(title)
                scores.append(sentiment["score"])

        overall_score = sum(scores) / len(scores) if scores else 0

        if overall_score >= 0.05:
            overall_label = "Bullish 📈"
            color         = "green"
        elif overall_score <= -0.05:
            overall_label = "Bearish 📉"
            color         = "red"
        else:
            overall_label = "Neutral ➡️"
            color         = "gray"

        positive_count = sum(1 for s in scores if s >= 0.05)
        negative_count = sum(1 for s in scores if s <= -0.05)
        neutral_count  = len(scores) - positive_count - negative_count

        return {
            "ticker":           ticker.upper(),
            "overall_score":    round(overall_score, 4),
            "overall_label":    overall_label,
            "color":            color,
            "articles_analyzed": len(scores),
            "breakdown": {
                "positive_articles": positive_count,
                "negative_articles": negative_count,
                "neutral_articles":  neutral_count
            },
            "confidence": "High" if len(scores) >= 5 else "Medium" if len(scores) >= 2 else "Low"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")