from datetime import datetime

from pydantic import BaseModel


class NewsItemOut(BaseModel):
    id: int
    headline: str
    source: str
    summary: str | None = None
    sentiment: str
    related_pairs: list[str] = []
    published_at: datetime

    @classmethod
    def from_orm_split(cls, obj) -> "NewsItemOut":
        return cls(
            id=obj.id,
            headline=obj.headline,
            source=obj.source,
            summary=obj.summary,
            sentiment=obj.sentiment,
            related_pairs=[p for p in obj.related_pairs.split(",") if p],
            published_at=obj.published_at,
        )
