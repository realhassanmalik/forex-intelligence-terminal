from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Trade(Base):
    """A single journal entry: a planned or executed trade."""

    __tablename__ = "trades"

    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), default=1)

    trade_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    pair: Mapped[str] = mapped_column(String(20))
    session: Mapped[str] = mapped_column(String(20))  # Asia | London | New York | Overlap
    direction: Mapped[str] = mapped_column(String(10))  # Long | Short
    setup: Mapped[str] = mapped_column(String(80))
    amd_phase: Mapped[str | None] = mapped_column(String(20), nullable=True)  # Accumulation | Manipulation | Distribution

    entry: Mapped[float] = mapped_column(Float)
    stop: Mapped[float] = mapped_column(Float)
    target: Mapped[float] = mapped_column(Float)
    rr: Mapped[float] = mapped_column(Float, default=0.0)
    risk_percent: Mapped[float] = mapped_column(Float, default=1.0)

    result: Mapped[str] = mapped_column(String(10), default="Open")  # Win | Loss | Breakeven | Open
    pnl: Mapped[float] = mapped_column(Float, default=0.0)

    screenshot_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    emotion: Mapped[str | None] = mapped_column(String(40), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    ai_review_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    ai_review_summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
