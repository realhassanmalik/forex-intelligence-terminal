from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.account import Account
from app.models.trade import Trade
from app.schemas.risk import PositionSizeRequest, PositionSizeResult, RiskStatus
from app.services.risk_engine import calculate_position_size, compute_risk_status

router = APIRouter(prefix="/api/risk", tags=["risk-center"])


@router.post("/position-size", response_model=PositionSizeResult)
def get_position_size(payload: PositionSizeRequest, db: Session = Depends(get_db)):
    account = db.get(Account, payload.account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return calculate_position_size(payload.entry, payload.stop, payload.risk_percent, account.balance, payload.pair)


@router.get("/status", response_model=RiskStatus)
def get_risk_status(account_id: int = 1, db: Session = Depends(get_db)):
    account = db.get(Account, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    trades = db.query(Trade).filter(Trade.account_id == account_id).all()
    return compute_risk_status(account, trades)
