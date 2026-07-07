"""Liquidity level detection: equal highs/lows, PDH/PDL, weekly high/low, sweeps."""

from app.schemas.analysis import LiquidityLevel, LiquidityMap
from app.services.mock_market_data import generate_candles, pip_size


def _swing_highs(candles: list[dict], window: int = 2) -> list[float]:
    highs = []
    for i in range(window, len(candles) - window):
        h = candles[i]["high"]
        neighborhood = candles[i - window : i] + candles[i + 1 : i + window + 1]
        if all(h >= c["high"] for c in neighborhood):
            highs.append(h)
    return highs


def _swing_lows(candles: list[dict], window: int = 2) -> list[float]:
    lows = []
    for i in range(window, len(candles) - window):
        low = candles[i]["low"]
        neighborhood = candles[i - window : i] + candles[i + 1 : i + window + 1]
        if all(low <= c["low"] for c in neighborhood):
            lows.append(low)
    return lows


def _find_equal_cluster(values: list[float], tolerance: float) -> float | None:
    if not values:
        return None
    buckets: dict[int, list[float]] = {}
    for v in values:
        key = round(v / tolerance)
        buckets.setdefault(key, []).append(v)
    best = max(buckets.values(), key=len, default=[])
    if len(best) >= 2:
        return round(sum(best) / len(best), 5)
    # fall back to the two closest values overall so the scanner always has a level to show
    if len(values) >= 2:
        sorted_vals = sorted(values)
        closest_pair = min(
            (sorted_vals[i : i + 2] for i in range(len(sorted_vals) - 1)),
            key=lambda pair: abs(pair[0] - pair[1]),
        )
        return round(sum(closest_pair) / len(closest_pair), 5)
    return round(values[0], 5)


def analyze_liquidity(pair: str, timeframe: str = "H1") -> LiquidityMap:
    pip = pip_size(pair)
    tolerance = pip * 8

    candles = generate_candles(pair, timeframe, count=150)
    last_close = candles[-1]["close"]
    recent = candles[-30:]

    levels: list[LiquidityLevel] = []

    eq_high = _find_equal_cluster(_swing_highs(candles), tolerance)
    if eq_high is not None:
        swept = max(c["high"] for c in recent) > eq_high and last_close < eq_high
        levels.append(
            LiquidityLevel(
                kind="Equal Highs",
                price=eq_high,
                swept=swept,
                distance_pips=round(abs(eq_high - last_close) / pip, 1),
            )
        )

    eq_low = _find_equal_cluster(_swing_lows(candles), tolerance)
    if eq_low is not None:
        swept = min(c["low"] for c in recent) < eq_low and last_close > eq_low
        levels.append(
            LiquidityLevel(
                kind="Equal Lows",
                price=eq_low,
                swept=swept,
                distance_pips=round(abs(eq_low - last_close) / pip, 1),
            )
        )

    daily = generate_candles(pair, "D1", count=8)
    prev_day = daily[-2]
    pdh, pdl = prev_day["high"], prev_day["low"]
    levels.append(
        LiquidityLevel(
            kind="Previous Day High",
            price=pdh,
            swept=max(c["high"] for c in recent) > pdh and last_close < pdh,
            distance_pips=round(abs(pdh - last_close) / pip, 1),
        )
    )
    levels.append(
        LiquidityLevel(
            kind="Previous Day Low",
            price=pdl,
            swept=min(c["low"] for c in recent) < pdl and last_close > pdl,
            distance_pips=round(abs(pdl - last_close) / pip, 1),
        )
    )

    week_candles = daily[-6:-1]
    weekly_high = max(c["high"] for c in week_candles)
    weekly_low = min(c["low"] for c in week_candles)
    levels.append(
        LiquidityLevel(
            kind="Weekly High",
            price=weekly_high,
            swept=max(c["high"] for c in recent) > weekly_high and last_close < weekly_high,
            distance_pips=round(abs(weekly_high - last_close) / pip, 1),
        )
    )
    levels.append(
        LiquidityLevel(
            kind="Weekly Low",
            price=weekly_low,
            swept=min(c["low"] for c in recent) < weekly_low and last_close > weekly_low,
            distance_pips=round(abs(weekly_low - last_close) / pip, 1),
        )
    )

    return LiquidityMap(pair=pair.upper(), timeframe=timeframe, levels=levels)
