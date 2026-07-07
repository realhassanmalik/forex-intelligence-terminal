"""Currency strength meter: aggregates each currency's % move across the majors."""

from datetime import datetime

from app.schemas.analysis import CurrencyStrengthEntry, CurrencyStrengthResult
from app.services.mock_market_data import generate_candles

MAJOR_PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "NZDUSD", "USDCHF", "USDCAD", "XAUUSD"]

# (currency, sign) contribution per pair: +1 if currency is the base, -1 if it's the quote
CURRENCY_CONTRIBUTIONS = {
    "USD": [("EURUSD", -1), ("GBPUSD", -1), ("USDJPY", 1), ("AUDUSD", -1), ("NZDUSD", -1), ("USDCHF", 1), ("USDCAD", 1), ("XAUUSD", -1)],
    "EUR": [("EURUSD", 1)],
    "GBP": [("GBPUSD", 1)],
    "JPY": [("USDJPY", -1)],
    "AUD": [("AUDUSD", 1)],
    "NZD": [("NZDUSD", 1)],
    "CHF": [("USDCHF", -1)],
    "CAD": [("USDCAD", -1)],
    "XAU": [("XAUUSD", 1)],
}


def compute_currency_strength() -> CurrencyStrengthResult:
    pct_change: dict[str, float] = {}
    for pair in MAJOR_PAIRS:
        candles = generate_candles(pair, "H1", count=50)
        first_close, last_close = candles[0]["close"], candles[-1]["close"]
        pct_change[pair] = (last_close - first_close) / first_close * 100

    raw_scores: dict[str, float] = {}
    for currency, contributions in CURRENCY_CONTRIBUTIONS.items():
        total = sum(sign * pct_change[pair] for pair, sign in contributions)
        raw_scores[currency] = total / len(contributions)

    values = list(raw_scores.values())
    lo, hi = min(values), max(values)
    spread = max(hi - lo, 1e-9)

    entries = [
        CurrencyStrengthEntry(currency=currency, score=round((score - lo) / spread * 100, 1), rank=0)
        for currency, score in raw_scores.items()
    ]
    entries.sort(key=lambda e: e.score, reverse=True)
    for i, entry in enumerate(entries):
        entry.rank = i + 1

    return CurrencyStrengthResult(entries=entries, computed_at=datetime.utcnow().isoformat())
