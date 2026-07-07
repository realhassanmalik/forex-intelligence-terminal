from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.trade import Trade
from app.schemas.trade import AIReviewOut
from app.services.ai_client import ai_client

router = APIRouter(prefix="/api/journal", tags=["ai-reviewer"])


@router.post("/{trade_id}/ai-review", response_model=AIReviewOut)
def review_trade(trade_id: int, db: Session = Depends(get_db)):
    trade = db.get(Trade, trade_id)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    trade_dict = {
        "id": trade.id,
        "pair": trade.pair,
        "direction": trade.direction,
        "setup": trade.setup,
        "amd_phase": trade.amd_phase,
        "entry": trade.entry,
        "stop": trade.stop,
        "target": trade.target,
        "rr": trade.rr,
        "risk_percent": trade.risk_percent,
        "result": trade.result,
        "emotion": trade.emotion,
        "notes": trade.notes,
    }
    review = ai_client.trade_review(trade_dict)

    trade.ai_review_score = review["overall_score"]
    trade.ai_review_summary = review["summary"]
    db.commit()

    return AIReviewOut(**review)
