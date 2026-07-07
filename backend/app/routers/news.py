from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.news_item import NewsItem
from app.schemas.news_item import NewsItemOut

router = APIRouter(prefix="/api/news", tags=["news"])


@router.get("", response_model=list[NewsItemOut])
def list_news(db: Session = Depends(get_db)):
    items = db.query(NewsItem).order_by(NewsItem.published_at.desc()).all()
    return [NewsItemOut.from_orm_split(n) for n in items]
