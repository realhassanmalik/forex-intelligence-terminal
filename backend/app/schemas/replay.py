from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ReplaySessionCreate(BaseModel):
    trade_id: int | None = None
    pair: str
    setup: str
    chart_screenshot_url: str | None = None
    entry_screenshot_url: str | None = None
    exit_screenshot_url: str | None = None
    notes: str | None = None


class ReplaySessionOut(ReplaySessionCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
