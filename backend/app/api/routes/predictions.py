# ============================================================
# PREDICTIONS.PY — AI Stock Price Prediction Routes
#
# This is the BRAIN of your project!
# It uses ML models to predict future stock prices.
#
# We use 2 models:
# 1. PROPHET — Made by Facebook. Finds patterns in time.
#    Like noticing "stock goes up every December" patterns.
# 2. XGBOOST — Uses many technical indicators as features.
#    Like a student who studied 50 different factors before predicting.
#
# API Endpoints:
# GET /api/predict/{ticker}?days=30       → Prophet prediction
# GET /api/predict/{ticker}/xgboost       → XGBoost prediction
# GET /api/predict/{ticker}/models        → Both models together
# ============================================================

from fastapi import APIRouter, HTTPException, Query
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

router = APIRouter()


def calculate_accuracy_metrics(actual: list, predicted: list) -> dict:
    """
    Calculate how accurate the model is.

    MAE  = average mistake in dollars
    RMSE = penalizes big mistakes more
    MAPE = average % mistake
    """
    actual    = np.array(actual)
    predicted = np.array(predicted)

    mae  = np.mean(np.abs(actual - predicted))
    rmse = np.sqrt(np.mean((actual - predicted) ** 2))
    mape = np.mean(np.abs((actual - predicted) / actual)) * 100

    return {
        "mae":  round(float(mae), 4),
        "rmse": round(float(rmse), 4),
        "mape": round(float(mape), 2)
    }


def get_verdict(predictions: list) -> str:
    """
    Based on predictions, give a simple verdict.
    Price goes UP → Bullish
    Price goes DOWN → Bearish
    """
    if len(predictions) < 2:
        return "Neutral"

    first_price = predictions[0]["predicted_price"]
    last_price  = predictions[-1]["predicted_price"]
    change_pct  = ((last_price - first_price) / first_price) * 100

    if change_pct > 2:
        return "Bullish 📈"
    elif change_pct < -2:
        return "Bearish 📉"
    else:
        return "Neutral ➡️"


@router.get("/{ticker}")
def get_prediction(
    ticker: str,
    days: int = Query(default=30, ge=7, le=90, description="Days to predict: 7 to 90")
):
    """
    Main prediction using Facebook Prophet model.

    HOW PROPHET WORKS:
    1. Give it historical prices
    2. It finds yearly, monthly, weekly patterns
    3. It extends those patterns into the future
    Like predicting next year's allowance based on past patterns!
    """
    try:
        from prophet import Prophet

        # Get Historical Data
        stock = yf.Ticker(ticker.upper())
        hist  = stock.history(period="2y")

        if hist.empty or len(hist) < 60:
            raise HTTPException(status_code=404, detail=f"Not enough data for {ticker}")

        # Prophet needs columns named 'ds' (date) and 'y' (value)
        df = pd.DataFrame({
            "ds": hist.index.tz_localize(None),
            "y":  hist["Close"].values
        })

        # Train Prophet Model
        model = Prophet(
            daily_seasonality=False,
            weekly_seasonality=True,
            yearly_seasonality=True,
            changepoint_prior_scale=0.05,
            interval_width=0.80
        )
        model.fit(df)

        # Make Future Predictions
        future   = model.make_future_dataframe(periods=days, freq="B")
        forecast = model.predict(future)

        # Get only future predictions
        future_forecast = forecast.tail(days)

        predictions = []
        for _, row in future_forecast.iterrows():
            predictions.append({
                "date":            str(row["ds"].date()),
                "predicted_price": round(float(row["yhat"]), 2),
                "lower_bound":     round(float(row["yhat_lower"]), 2),
                "upper_bound":     round(float(row["yhat_upper"]), 2),
            })

        # Calculate Accuracy on last 30 days
        historical_forecast = forecast[forecast["ds"].isin(df["ds"].tail(30))]
        actual_prices       = df["y"].tail(30).tolist()
        predicted_prices    = historical_forecast["yhat"].tolist()
        min_len             = min(len(actual_prices), len(predicted_prices))
        metrics             = calculate_accuracy_metrics(
            actual_prices[:min_len],
            predicted_prices[:min_len]
        )

        verdict = get_verdict(predictions)

        return {
            "ticker":        ticker.upper(),
            "model_name":    "Prophet (Facebook)",
            "days_predicted": days,
            "current_price": round(float(hist["Close"].iloc[-1]), 2),
            "predictions":   predictions,
            "accuracy":      metrics,
            "verdict":       verdict
        }

    except ImportError:
        raise HTTPException(status_code=500, detail="Prophet not installed. Run: pip install prophet")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.get("/{ticker}/xgboost")
def get_xgboost_prediction(
    ticker: str,
    days: int = Query(default=30, ge=7, le=90)
):
    """
    XGBoost prediction using technical indicators as features.

    HOW XGBOOST WORKS:
    Like a student who studies 50 subjects before the exam.
    Features = RSI, MACD, Moving Averages, volume, lag prices.
    XGBoost learns: when these look like X, price usually goes Y!
    """
    try:
        from xgboost import XGBRegressor

        # Get Data
        stock = yf.Ticker(ticker.upper())
        hist  = stock.history(period="2y")

        if len(hist) < 100:
            raise HTTPException(status_code=400, detail="Not enough historical data")

        df    = hist.copy()
        close = df["Close"]

        # Create Features
        for lag in [1, 3, 5, 10, 20]:
            df[f"lag_{lag}"] = close.shift(lag)

        for window in [7, 14, 30]:
            df[f"rolling_mean_{window}"] = close.rolling(window).mean()
            df[f"rolling_std_{window}"]  = close.rolling(window).std()

        # RSI
        delta = close.diff()
        gain  = delta.where(delta > 0, 0).rolling(14).mean()
        loss  = -delta.where(delta < 0, 0).rolling(14).mean()
        rs    = gain / loss
        df["rsi"] = 100 - (100 / (1 + rs))

        # MACD
        ema12      = close.ewm(span=12).mean()
        ema26      = close.ewm(span=26).mean()
        df["macd"] = ema12 - ema26

        # Bollinger Band position
        bb_mid              = close.rolling(20).mean()
        bb_std              = close.rolling(20).std()
        df["bb_position"]   = (close - (bb_mid - 2*bb_std)) / (4*bb_std)

        # Volume ratio
        df["volume_ratio"]  = df["Volume"] / df["Volume"].rolling(20).mean()

        # Target = next day's closing price
        df["target"] = close.shift(-1)
        df.dropna(inplace=True)

        # Split Features and Target
        feature_cols = [c for c in df.columns if c not in
                        ["target", "Open", "High", "Low", "Close", "Volume", "Dividends", "Stock Splits"]]
        X     = df[feature_cols]
        y     = df["target"]
        split = int(len(df) * 0.8)

        X_train, X_test = X[:split], X[split:]
        y_train, y_test = y[:split], y[split:]

        # Train XGBoost
        model = XGBRegressor(
            n_estimators=100,
            learning_rate=0.05,
            max_depth=4,
            random_state=42
        )
        model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

        # Calculate Accuracy
        test_preds = model.predict(X_test)
        metrics    = calculate_accuracy_metrics(y_test.tolist(), test_preds.tolist())

        # Predict Future Prices
        predictions = []
        last_row    = X.iloc[-1:].copy()
        last_price  = float(close.iloc[-1])
        base_date   = hist.index[-1]

        for i in range(days):
            pred_price  = float(model.predict(last_row)[0])
            future_date = base_date + timedelta(days=i+1)

            # Skip weekends
            while future_date.weekday() >= 5:
                future_date += timedelta(days=1)

            predictions.append({
                "date":            str(future_date.date()),
                "predicted_price": round(pred_price, 2),
                "lower_bound":     round(pred_price * 0.97, 2),
                "upper_bound":     round(pred_price * 1.03, 2),
            })

            # Update lag for next prediction
            last_row = last_row.copy()
            if "lag_1" in last_row.columns:
                last_row["lag_1"] = pred_price

        verdict = get_verdict(predictions)

        return {
            "ticker":         ticker.upper(),
            "model_name":     "XGBoost",
            "days_predicted": days,
            "current_price":  round(last_price, 2),
            "predictions":    predictions,
            "accuracy":       metrics,
            "verdict":        verdict
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"XGBoost error: {str(e)}")


@router.get("/{ticker}/models")
def get_all_model_predictions(
    ticker: str,
    days: int = Query(default=30)
):
    """
    Returns predictions from both models side by side.
    Frontend can show a comparison!
    """
    results = {}

    try:
        results["prophet"] = get_prediction(ticker, days)
    except Exception as e:
        results["prophet"] = {"error": str(e)}

    try:
        results["xgboost"] = get_xgboost_prediction(ticker, days)
    except Exception as e:
        results["xgboost"] = {"error": str(e)}

    return {
        "ticker":  ticker.upper(),
        "days":    days,
        "models":  results
    }