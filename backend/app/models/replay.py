from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class ReplaySession(Base):
    """Archived visual record of a trade, used for review and pattern search."""

    __tablename__ = "replay_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    trade_id: Mapped[int | None] = mapped_column(ForeignKey("trades.id"), nullable=True)

    pair: Mapped[str] = mapped_column(String(20))
    setup: Mapped[str] = mapped_column(String(80))

    chart_screenshot_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    entry_screenshot_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    exit_screenshot_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
