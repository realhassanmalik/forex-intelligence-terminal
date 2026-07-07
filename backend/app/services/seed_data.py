"""Seeds a fresh database with a starter account, watchlist, calendar and news
so the app has believable content on first run."""

from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.account import Account
from app.models.economic_event import EconomicEvent
from app.models.news_item import NewsItem
from app.models.watchlist import WatchlistItem


def seed_all(db: Session) -> None:
    settings = get_settings()

    if not db.query(Account).first():
        db.add(
            Account(
                name="Main Account",
                broker="Demo Prop Firm",
                is_prop_firm=True,
                starting_balance=settings.default_account_balance,
                balance=settings.default_account_balance,
                max_daily_loss_pct=settings.default_daily_loss_limit_pct,
                max_weekly_loss_pct=settings.default_weekly_loss_limit_pct,
                max_monthly_loss_pct=settings.default_monthly_loss_limit_pct,
            )
        )

    if not db.query(WatchlistItem).first():
        for pair, note in [
            ("EURUSD", "Watching for London session liquidity sweep"),
            ("GBPUSD", "Range-bound, waiting for NY breakout"),
            ("XAUUSD", "Strong bullish structure, tracking pullbacks"),
            ("USDJPY", "BOJ intervention risk near highs"),
        ]:
            db.add(WatchlistItem(pair=pair, notes=note))

    if not db.query(EconomicEvent).first():
        now = datetime.utcnow()
        events = [
            ("US CPI m/m", "USD", "High", 1, "0.3%", "0.2%", "EURUSD,USDJPY,XAUUSD"),
            ("Non-Farm Payrolls", "USD", "High", 2, "180K", "175K", "EURUSD,GBPUSD,USDJPY"),
            ("FOMC Statement", "USD", "High", 3, "-", "-", "EURUSD,GBPUSD,USDJPY,XAUUSD"),
            ("ECB Interest Rate Decision", "EUR", "High", 1, "4.25%", "4.25%", "EURUSD,EURGBP"),
            ("UK GDP m/m", "GBP", "Medium", 0, "0.2%", "0.1%", "GBPUSD"),
            ("Manufacturing PMI", "USD", "Medium", 4, "49.8", "49.2", "EURUSD,USDJPY"),
            ("Unemployment Claims", "USD", "Medium", 5, "215K", "220K", "EURUSD,USDJPY"),
            ("RBA Interest Rate Decision", "AUD", "High", 2, "4.35%", "4.35%", "AUDUSD"),
        ]
        for title, currency, impact, days_out, forecast, previous, pairs in events:
            db.add(
                EconomicEvent(
                    title=title,
                    currency=currency,
                    impact=impact,
                    event_time=now + timedelta(days=days_out, hours=2),
                    forecast=forecast,
                    previous=previous,
                    affected_pairs=pairs,
                )
            )

    if not db.query(NewsItem).first():
        now = datetime.utcnow()
        news = [
            ("Fed officials signal patience on rate cuts amid sticky inflation", "Reuters", "Bearish", "USD", "EURUSD,XAUUSD", 1),
            ("ECB's Lagarde hints at gradual easing path for H2", "Bloomberg", "Bearish", "EUR", "EURUSD", 3),
            ("Gold rallies on safe-haven demand as geopolitical tensions rise", "Forex Factory", "Bullish", "USD", "XAUUSD", 2),
            ("UK retail sales beat expectations, GBP firms across the board", "FXStreet", "Bullish", "GBP", "GBPUSD", 5),
            ("BOJ maintains ultra-loose policy, yen weakens further", "Nikkei", "Bearish", "JPY", "USDJPY", 6),
        ]
        for headline, source, sentiment, currency, pairs, hours_ago in news:
            db.add(
                NewsItem(
                    headline=headline,
                    source=source,
                    summary=f"{currency} focused coverage relevant to {pairs}.",
                    sentiment=sentiment,
                    related_pairs=pairs,
                    published_at=now - timedelta(hours=hours_ago),
                )
            )

    db.commit()
