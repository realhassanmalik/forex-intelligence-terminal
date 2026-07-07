from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.trade import Trade
from app.schemas.ai import WeeklyReport
from app.services.ai_client import ai_client
from app.services.analytics_engine import compute_analytics_summary

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/weekly", response_model=WeeklyReport)
def get_weekly_report(account_id: int = 1, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    week_start = now - timedelta(days=now.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    week_end = week_start + timedelta(days=7)

    trades = (
        db.query(Trade)
        .filter(Trade.account_id == account_id, Trade.trade_date >= week_start, Trade.trade_date < week_end)
        .all()
    )

    summary = compute_analytics_summary(trades).model_dump()
    trade_dicts = [
        {
            "pair": t.pair,
            "session": t.session,
            "result": t.result,
            "pnl": t.pnl,
            "rr": t.rr,
            "emotion": t.emotion,
            "amd_phase": t.amd_phase,
        }
        for t in trades
    ]

    report = ai_client.weekly_report(week_start.date().isoformat(), (week_end - timedelta(days=1)).date().isoformat(), trade_dicts, summary)
    return WeeklyReport(**report)
