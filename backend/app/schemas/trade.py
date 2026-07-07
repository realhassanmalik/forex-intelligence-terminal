from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TradeBase(BaseModel):
    account_id: int = 1
    trade_date: datetime
    pair: str
    session: str
    direction: str
    setup: str
    amd_phase: str | None = None
    entry: float
    stop: float
    target: float
    rr: float = 0.0
    risk_percent: float = 1.0
    result: str = "Open"
    pnl: float = 0.0
    screenshot_url: str | None = None
    emotion: str | None = None
    notes: str | None = None


class TradeCreate(TradeBase):
    pass


class TradeUpdate(BaseModel):
    pair: str | None = None
    session: str | None = None
    direction: str | None = None
    setup: str | None = None
    amd_phase: str | None = None
    entry: float | None = None
    stop: float | None = None
    target: float | None = None
    rr: float | None = None
    risk_percent: float | None = None
    result: str | None = None
    pnl: float | None = None
    screenshot_url: str | None = None
    emotion: str | None = None
    notes: str | None = None


class TradeOut(TradeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ai_review_score: int | None = None
    ai_review_summary: str | None = None
    created_at: datetime


class AIReviewOut(BaseModel):
    trade_id: int
    entry_quality: int
    rule_compliance: int
    risk_management: int
    execution_quality: int
    psychology: int
    overall_score: int
    summary: str
