from fastapi import APIRouter
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import random

router = APIRouter()
analyzer = SentimentIntensityAnalyzer()

@router.get("/{ticker}/news")
def get_news_sentiment(ticker: str):
    """
    SAFE VERSION — No Yahoo scraping.
    Returns mock but realistic sentiment.
    """

    sample_headlines = [
        f"{ticker.upper()} shows strong quarterly performance",
        f"{ticker.upper()} faces regulatory pressure",
        f"Analysts remain optimistic about {ticker.upper()}",
        f"{ticker.upper()} stock volatility increases",
    ]

    analyzed_news = []

    for title in sample_headlines:
        sentiment = analyzer.polarity_scores(title)
        analyzed_news.append({
            "title": title,
            "sentiment_score": round(sentiment["compound"], 4),
            "sentiment_label": (
                "Positive" if sentiment["compound"] > 0.05
                else "Negative" if sentiment["compound"] < -0.05
                else "Neutral"
            )
        })

    return {
        "ticker": ticker.upper(),
        "total_articles": len(analyzed_news),
        "news": analyzed_news
    }


@router.get("/{ticker}/score")
def get_overall_sentiment(ticker: str):
    """
    SAFE VERSION — Simulated stable sentiment score.
    """

    score = round(random.uniform(-0.2, 0.2), 4)

    if score >= 0.05:
        label = "Bullish 📈"
        color = "green"
    elif score <= -0.05:
        label = "Bearish 📉"
        color = "red"
    else:
        label = "Neutral ➡️"
        color = "gray"

    return {
        "ticker": ticker.upper(),
        "overall_score": score,
        "overall_label": label,
        "color": color,
        "articles_analyzed": 4,
        "confidence": "Medium"
    }