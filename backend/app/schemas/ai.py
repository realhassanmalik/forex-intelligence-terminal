from pydantic import BaseModel


class AIMarketAnalysisRequest(BaseModel):
    pair: str
    timeframe: str = "H1"


class AIMarketAnalysisResult(BaseModel):
    pair: str
    timeframe: str
    market_bias: str
    trade_ideas: list[str]
    risk_factors: list[str]
    targets: list[str]
    provider: str  # claude | openai | mock


class WeeklyReport(BaseModel):
    week_start: str
    week_end: str
    trades_taken: int
    win_rate: float
    total_pnl: float
    mistakes: list[str]
    strengths: list[str]
    weaknesses: list[str]
    improvement_plan: list[str]
    focus_next_week: list[str]
