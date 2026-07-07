from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.trade import Trade
from app.schemas.trade import TradeCreate, TradeOut, TradeUpdate

router = APIRouter(prefix="/api/journal", tags=["journal"])


@router.get("", response_model=list[TradeOut])
def list_trades(account_id: int = 1, db: Session = Depends(get_db)):
    return db.query(Trade).filter(Trade.account_id == account_id).order_by(Trade.trade_date.desc()).all()


@router.post("", response_model=TradeOut, status_code=201)
def create_trade(payload: TradeCreate, db: Session = Depends(get_db)):
    trade = Trade(**payload.model_dump())
    db.add(trade)
    db.commit()
    db.refresh(trade)
    return trade


@router.get("/{trade_id}", response_model=TradeOut)
def get_trade(trade_id: int, db: Session = Depends(get_db)):
    trade = db.get(Trade, trade_id)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade


@router.put("/{trade_id}", response_model=TradeOut)
def update_trade(trade_id: int, payload: TradeUpdate, db: Session = Depends(get_db)):
    trade = db.get(Trade, trade_id)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(trade, field, value)
    db.commit()
    db.refresh(trade)
    return trade


@router.delete("/{trade_id}", status_code=204)
def delete_trade(trade_id: int, db: Session = Depends(get_db)):
    trade = db.get(Trade, trade_id)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    db.delete(trade)
    db.commit()
