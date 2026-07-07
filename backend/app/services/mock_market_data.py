"""Deterministic synthetic OHLC generator.

There is no live price feed wired up yet, so every analysis engine reads
from here. Candles are seeded from (pair, timeframe, calendar day) so a
given scan returns stable results throughout the day instead of jittering
on every request, which matters for a demo dashboard.

Swap this module's `generate_candles` for a real data provider (OANDA,
Polygon, etc.) later — every engine only depends on this function's
return shape, so nothing downstream needs to change.
"""

import random
from datetime import datetime, timedelta

TIMEFRAME_MINUTES = {
    "M5": 5,
    "M15": 15,
    "M30": 30,
    "H1": 60,
    "H4": 240,
    "D1": 1440,
}

PAIR_BASE_PRICE = {
    "EURUSD": 1.0850,
    "GBPUSD": 1.2650,
    "USDJPY": 155.50,
    "AUDUSD": 0.6550,
    "NZDUSD": 0.6050,
    "USDCHF": 0.9050,
    "USDCAD": 1.3650,
    "XAUUSD": 2350.0,
}


def _seed_for(pair: str, timeframe: str, salt: str = "") -> int:
    day_key = datetime.utcnow().strftime("%Y-%m-%d")
    return abs(hash(f"{pair}:{timeframe}:{day_key}:{salt}")) % (2**31)


def generate_candles(pair: str, timeframe: str = "H1", count: int = 200) -> list[dict]:
    rng = random.Random(_seed_for(pair, timeframe))
    base_price = PAIR_BASE_PRICE.get(pair.upper(), 1.0000)
    pip = base_price * 0.0001 if "JPY" not in pair.upper() and pair.upper() != "XAUUSD" else base_price * 0.01

    minutes = TIMEFRAME_MINUTES.get(timeframe, 60)
    now = datetime.utcnow()

    price = base_price
    candles = []
    for i in range(count):
        candle_time = now - timedelta(minutes=minutes * (count - i))
        drift = rng.uniform(-1, 1) * pip * rng.uniform(3, 15)
        open_price = price
        close_price = open_price + drift
        high_price = max(open_price, close_price) + abs(rng.uniform(0, pip * 6))
        low_price = min(open_price, close_price) - abs(rng.uniform(0, pip * 6))
        candles.append(
            {
                "time": candle_time.isoformat(),
                "open": round(open_price, 5),
                "high": round(high_price, 5),
                "low": round(low_price, 5),
                "close": round(close_price, 5),
            }
        )
        price = close_price

    return candles


def pip_size(pair: str) -> float:
    return 0.01 if "JPY" in pair.upper() or pair.upper() == "XAUUSD" else 0.0001
