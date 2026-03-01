# ============================================================
# PORTFOLIO.PY — User Portfolio Management Routes
#
# This lets users track their stock portfolio.
# Like a virtual stock game — add stocks, track profits/losses.
#
# API Endpoints:
# GET    /api/portfolio              → View all my stocks
# POST   /api/portfolio/add          → Add a stock I bought
# DELETE /api/portfolio/{id}         → Remove a stock
# GET    /api/portfolio/performance  → See my total profit/loss
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import PortfolioPosition, User
from app.db.schemas import PortfolioAdd, PortfolioResponse
from app.api.routes.auth import get_current_user
from typing import List
import yfinance as yf

router = APIRouter()


@router.get("/", response_model=List[PortfolioResponse])
def get_portfolio(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all stocks in the current user's portfolio.
    Protected — must be logged in!
    """
    positions = db.query(PortfolioPosition).filter(
        PortfolioPosition.user_id == current_user.id
    ).all()

    return positions


@router.post("/add", response_model=PortfolioResponse)
def add_to_portfolio(
    position_data: PortfolioAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a stock position to portfolio.
    Example: I bought 10 shares of AAPL at $150 on 2024-01-15
    """
    # Validate ticker exists
    try:
        stock = yf.Ticker(position_data.ticker.upper())
        info  = stock.info
        if not info:
            raise HTTPException(status_code=404, detail=f"Stock {position_data.ticker} not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ticker symbol")

    new_position = PortfolioPosition(
        user_id       = current_user.id,
        ticker        = position_data.ticker.upper(),
        quantity      = position_data.quantity,
        avg_buy_price = position_data.avg_buy_price,
        buy_date      = position_data.buy_date,
        notes         = position_data.notes
    )

    db.add(new_position)
    db.commit()
    db.refresh(new_position)

    return new_position


@router.delete("/{position_id}")
def remove_from_portfolio(
    position_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a stock from portfolio.
    Only the owner can delete their own stocks!
    """
    position = db.query(PortfolioPosition).filter(
        PortfolioPosition.id      == position_id,
        PortfolioPosition.user_id == current_user.id
    ).first()

    if not position:
        raise HTTPException(status_code=404, detail="Position not found or not yours to delete")

    db.delete(position)
    db.commit()

    return {"message": f"Successfully removed {position.ticker} from portfolio"}


@router.get("/performance")
def get_portfolio_performance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calculate total portfolio value and profit/loss.

    Gets current price of each stock from yfinance,
    compares with buy price, calculates profit or loss.
    Like checking if your Pokemon cards went up in value!
    """
    positions = db.query(PortfolioPosition).filter(
        PortfolioPosition.user_id == current_user.id
    ).all()

    if not positions:
        return {
            "total_invested":    0,
            "current_value":     0,
            "total_pnl":         0,
            "total_pnl_percent": 0,
            "positions":         []
        }

    total_invested    = 0
    current_value     = 0
    detailed_positions = []

    for position in positions:
        try:
            stock         = yf.Ticker(position.ticker)
            info          = stock.info
            current_price = info.get("currentPrice", info.get("regularMarketPrice", 0))

            invested    = position.quantity * position.avg_buy_price
            current     = position.quantity * current_price
            pnl         = current - invested
            pnl_percent = ((current_price - position.avg_buy_price) / position.avg_buy_price) * 100

            total_invested += invested
            current_value  += current

            detailed_positions.append({
                "id":              position.id,
                "ticker":          position.ticker,
                "quantity":        position.quantity,
                "avg_buy_price":   position.avg_buy_price,
                "current_price":   round(current_price, 2),
                "invested_amount": round(invested, 2),
                "current_value":   round(current, 2),
                "pnl":             round(pnl, 2),
                "pnl_percent":     round(pnl_percent, 2),
                "status":          "profit" if pnl > 0 else "loss"
            })
        except Exception as e:
            print(f"Error fetching {position.ticker}: {e}")
            continue

    total_pnl         = current_value - total_invested
    total_pnl_percent = ((current_value - total_invested) / total_invested * 100) if total_invested > 0 else 0

    return {
        "total_invested":    round(total_invested, 2),
        "current_value":     round(current_value, 2),
        "total_pnl":         round(total_pnl, 2),
        "total_pnl_percent": round(total_pnl_percent, 2),
        "overall_status":    "profit" if total_pnl > 0 else "loss",
        "positions":         detailed_positions
    }