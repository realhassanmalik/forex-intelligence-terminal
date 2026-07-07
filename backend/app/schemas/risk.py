from pydantic import BaseModel


class PositionSizeRequest(BaseModel):
    account_id: int = 1
    entry: float
    stop: float
    risk_percent: float = 1.0
    pair: str = "EURUSD"


class PositionSizeResult(BaseModel):
    position_size_units: float
    position_size_lots: float
    risk_amount: float
    stop_distance_pips: float
    pip_value_per_lot: float


class DrawdownStatus(BaseModel):
    period: str  # daily | weekly | monthly
    pnl: float
    limit_pct: float
    limit_amount: float
    used_pct: float
    breached: bool


class RiskStatus(BaseModel):
    account_id: int
    balance: float
    daily: DrawdownStatus
    weekly: DrawdownStatus
    monthly: DrawdownStatus
    total_drawdown_pct: float
    alerts: list[str]
