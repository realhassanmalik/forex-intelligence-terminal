from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.watchlist import WatchlistItem
from app.schemas.watchlist import WatchlistItemCreate, WatchlistItemOut

router = APIRouter(prefix="/api/watchlist", tags=["watchlist"])


@router.get("", response_model=list[WatchlistItemOut])
def list_watchlist(db: Session = Depends(get_db)):
    return db.query(WatchlistItem).order_by(WatchlistItem.added_at.desc()).all()


@router.post("", response_model=WatchlistItemOut, status_code=201)
def add_watchlist_item(payload: WatchlistItemCreate, db: Session = Depends(get_db)):
    item = WatchlistItem(pair=payload.pair.upper(), notes=payload.notes)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
def remove_watchlist_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(WatchlistItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found")
    db.delete(item)
    db.commit()
