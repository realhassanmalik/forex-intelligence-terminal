from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AccountBase(BaseModel):
    name: str = "Main Account"
    broker: str | None = None
    is_prop_firm: bool = False
    starting_balance: float = 100_000.0
    balance: float = 100_000.0
    max_daily_loss_pct: float = 5.0
    max_weekly_loss_pct: float = 8.0
    max_monthly_loss_pct: float = 10.0
    max_total_drawdown_pct: float = 10.0
    default_risk_per_trade_pct: float = 1.0


class AccountUpdate(BaseModel):
    name: str | None = None
    broker: str | None = None
    is_prop_firm: bool | None = None
    balance: float | None = None
    max_daily_loss_pct: float | None = None
    max_weekly_loss_pct: float | None = None
    max_monthly_loss_pct: float | None = None
    max_total_drawdown_pct: float | None = None
    default_risk_per_trade_pct: float | None = None


class AccountOut(AccountBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
