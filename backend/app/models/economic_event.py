from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class EconomicEvent(Base):
    __tablename__ = "economic_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    currency: Mapped[str] = mapped_column(String(10))
    impact: Mapped[str] = mapped_column(String(10))  # High | Medium | Low
    event_time: Mapped[datetime] = mapped_column(DateTime)

    forecast: Mapped[str | None] = mapped_column(String(40), nullable=True)
    previous: Mapped[str | None] = mapped_column(String(40), nullable=True)
    actual: Mapped[str | None] = mapped_column(String(40), nullable=True)

    affected_pairs: Mapped[str] = mapped_column(String(200), default="")  # comma-separated
