from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    total_trades: int
    win_rate: float
    average_rr: float
    profit_factor: float
    expectancy: float
    max_drawdown_pct: float
    best_session: str | None = None
    best_pair: str | None = None
    worst_pair: str | None = None
    best_setup: str | None = None


class EdgeFinderResult(BaseModel):
    most_profitable_pair: str | None = None
    most_profitable_session: str | None = None
    best_amd_pattern: str | None = None
    best_risk_model: str | None = None
    best_market_condition: str | None = None
    sample_size: int
