from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.trade import Trade
from app.schemas.analytics import AnalyticsSummary, EdgeFinderResult
from app.services.analytics_engine import compute_analytics_summary, compute_edge_finder

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def get_summary(account_id: int = 1, db: Session = Depends(get_db)):
    trades = db.query(Trade).filter(Trade.account_id == account_id).all()
    return compute_analytics_summary(trades)


@router.get("/edge-finder", response_model=EdgeFinderResult)
def get_edge_finder(account_id: int = 1, db: Session = Depends(get_db)):
    trades = db.query(Trade).filter(Trade.account_id == account_id).all()
    return compute_edge_finder(trades)
