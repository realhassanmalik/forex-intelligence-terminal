from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.replay import ReplaySession
from app.schemas.replay import ReplaySessionCreate, ReplaySessionOut

router = APIRouter(prefix="/api/replay", tags=["replay"])


@router.get("", response_model=list[ReplaySessionOut])
def list_replays(pair: str | None = None, setup: str | None = None, db: Session = Depends(get_db)):
    query = db.query(ReplaySession)
    if pair:
        query = query.filter(ReplaySession.pair == pair.upper())
    if setup:
        query = query.filter(ReplaySession.setup.ilike(f"%{setup}%"))
    return query.order_by(ReplaySession.created_at.desc()).all()


@router.post("", response_model=ReplaySessionOut, status_code=201)
def create_replay(payload: ReplaySessionCreate, db: Session = Depends(get_db)):
    session = ReplaySession(**payload.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/{replay_id}", response_model=ReplaySessionOut)
def get_replay(replay_id: int, db: Session = Depends(get_db)):
    session = db.get(ReplaySession, replay_id)
    if not session:
        raise HTTPException(status_code=404, detail="Replay session not found")
    return session


@router.delete("/{replay_id}", status_code=204)
def delete_replay(replay_id: int, db: Session = Depends(get_db)):
    session = db.get(ReplaySession, replay_id)
    if not session:
        raise HTTPException(status_code=404, detail="Replay session not found")
    db.delete(session)
    db.commit()
