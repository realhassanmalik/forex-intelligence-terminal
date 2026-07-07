from datetime import datetime

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class NewsItem(Base):
    __tablename__ = "news_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    headline: Mapped[str] = mapped_column(String(300))
    source: Mapped[str] = mapped_column(String(80))
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    sentiment: Mapped[str] = mapped_column(String(10), default="Neutral")  # Bullish | Bearish | Neutral
    related_pairs: Mapped[str] = mapped_column(String(200), default="")  # comma-separated
    published_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
