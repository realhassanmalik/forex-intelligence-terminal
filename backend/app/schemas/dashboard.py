from pydantic import BaseModel

from app.schemas.analysis import CurrencyStrengthEntry
from app.schemas.economic_event import EconomicEventOut
from app.schemas.trade import TradeOut
from app.schemas.watchlist import WatchlistItemOut


class DashboardSummary(BaseModel):
    account_balance: float
    daily_pnl: float
    weekly_pnl: float
    monthly_pnl: float
    open_trades: list[TradeOut]
    upcoming_news: list[EconomicEventOut]
    currency_strength: list[CurrencyStrengthEntry]
    watchlist: list[WatchlistItemOut]
    ai_briefing: str
