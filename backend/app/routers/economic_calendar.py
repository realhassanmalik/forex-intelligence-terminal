from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.economic_event import EconomicEvent
from app.schemas.economic_event import EconomicEventOut

router = APIRouter(prefix="/api/economic-calendar", tags=["economic-calendar"])


@router.get("", response_model=list[EconomicEventOut])
def list_events(db: Session = Depends(get_db)):
    events = db.query(EconomicEvent).order_by(EconomicEvent.event_time.asc()).all()
    return [EconomicEventOut.from_orm_split(e) for e in events]
