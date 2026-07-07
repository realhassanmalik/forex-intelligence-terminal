from datetime import datetime

from sqlalchemy import DateTime, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), default="Main Account")
    broker: Mapped[str | None] = mapped_column(String(120), nullable=True)
    is_prop_firm: Mapped[bool] = mapped_column(default=False)

    starting_balance: Mapped[float] = mapped_column(Float, default=100_000.0)
    balance: Mapped[float] = mapped_column(Float, default=100_000.0)

    max_daily_loss_pct: Mapped[float] = mapped_column(Float, default=5.0)
    max_weekly_loss_pct: Mapped[float] = mapped_column(Float, default=8.0)
    max_monthly_loss_pct: Mapped[float] = mapped_column(Float, default=10.0)
    max_total_drawdown_pct: Mapped[float] = mapped_column(Float, default=10.0)
    default_risk_per_trade_pct: Mapped[float] = mapped_column(Float, default=1.0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
