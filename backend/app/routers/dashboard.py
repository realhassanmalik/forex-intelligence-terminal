from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.account import Account
from app.models.economic_event import EconomicEvent
from app.models.trade import Trade
from app.models.watchlist import WatchlistItem
from app.schemas.dashboard import DashboardSummary
from app.schemas.economic_event import EconomicEventOut
from app.services.ai_client import ai_client
from app.services.currency_strength_engine import compute_currency_strength
from app.services.risk_engine import compute_risk_status

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardSummary)
def get_dashboard(account_id: int = 1, db: Session = Depends(get_db)):
    account = db.get(Account, account_id)
    now = datetime.utcnow()

    trades = db.query(Trade).filter(Trade.account_id == account_id).all()
    daily_pnl = sum(t.pnl for t in trades if t.trade_date.date() == now.date())
    iso_year, iso_week, _ = now.isocalendar()
    weekly_pnl = sum(t.pnl for t in trades if t.trade_date.isocalendar()[:2] == (iso_year, iso_week))
    monthly_pnl = sum(t.pnl for t in trades if t.trade_date.year == now.year and t.trade_date.month == now.month)

    open_trades = [t for t in trades if t.result == "Open"]

    upcoming_events = (
        db.query(EconomicEvent)
        .filter(EconomicEvent.event_time >= now, EconomicEvent.event_time <= now + timedelta(days=7))
        .order_by(EconomicEvent.event_time.asc())
        .limit(5)
        .all()
    )

    strength = compute_currency_strength()
    watchlist = db.query(WatchlistItem).order_by(WatchlistItem.added_at.desc()).all()
    risk_status = compute_risk_status(account, trades) if account else None

    briefing_context = {
        "strongest_currency": strength.entries[0].currency if strength.entries else None,
        "weakest_currency": strength.entries[-1].currency if strength.entries else None,
        "top_event": upcoming_events[0].title if upcoming_events else None,
        "risk_alerts": risk_status.alerts if risk_status else [],
    }

    return DashboardSummary(
        account_balance=account.balance if account else 0.0,
        daily_pnl=round(daily_pnl, 2),
        weekly_pnl=round(weekly_pnl, 2),
        monthly_pnl=round(monthly_pnl, 2),
        open_trades=open_trades,
        upcoming_news=[EconomicEventOut.from_orm_split(e) for e in upcoming_events],
        currency_strength=strength.entries,
        watchlist=watchlist,
        ai_briefing=ai_client.daily_briefing(briefing_context),
    )
