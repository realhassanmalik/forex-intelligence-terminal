"""AMD (Accumulation / Manipulation / Distribution) phase detection.

Runs a simple, explainable heuristic over synthetic candles: split the
lookback window into thirds, check whether the middle third swept beyond
the first third's range (manipulation), then check whether price is now
trending away from that range with expansion (distribution). This is a
stand-in for real smart-money-concept detection against live price data.
"""

import random

from app.schemas.analysis import AMDScanResult
from app.services.liquidity_engine import analyze_liquidity
from app.services.mock_market_data import generate_candles


def _thirds(candles: list[dict]) -> tuple[list[dict], list[dict], list[dict]]:
    n = len(candles)
    a, b = n // 3, (2 * n) // 3
    return candles[:a], candles[a:b], candles[b:]


def analyze_amd(pair: str, timeframe: str = "H1") -> AMDScanResult:
    candles = generate_candles(pair, timeframe, count=150)
    part1, part2, part3 = _thirds(candles)

    range1_high = max(c["high"] for c in part1)
    range1_low = min(c["low"] for c in part1)
    range1 = range1_high - range1_low

    all_high = max(c["high"] for c in candles)
    all_low = min(c["low"] for c in candles)
    range_all = max(all_high - all_low, 1e-9)

    compression_ratio = range1 / range_all

    swept_high = max(c["high"] for c in part2) > range1_high
    swept_low = min(c["low"] for c in part2) < range1_low
    manipulation_detected = swept_high or swept_low

    recent = candles[-20:]
    recent_range = max(c["high"] for c in recent) - min(c["low"] for c in recent)
    expansion_ratio = recent_range / range_all

    last_close = candles[-1]["close"]
    part1_mid = (range1_high + range1_low) / 2
    trend_direction = last_close - part1_mid
    is_bullish = trend_direction >= 0

    if manipulation_detected and expansion_ratio > 0.45:
        phase = "Distribution"
    elif manipulation_detected:
        phase = "Manipulation"
    elif compression_ratio < 0.45:
        phase = "Accumulation"
    else:
        phase = "Distribution"

    rng = random.Random(hash((pair, timeframe, "amd_confidence")) % (2**31))
    base_confidence = 55.0
    base_confidence += (1 - compression_ratio) * 15 if phase == "Accumulation" else 0
    base_confidence += 15 if manipulation_detected else 0
    base_confidence += expansion_ratio * 10 if phase == "Distribution" else 0
    base_confidence += rng.uniform(-5, 5)
    confidence = round(min(max(base_confidence, 40.0), 96.0), 1)

    measured_move = range1
    if phase == "Accumulation":
        potential_target = round(range1_high if is_bullish else range1_low, 5)
    elif is_bullish:
        potential_target = round(last_close + measured_move, 5)
    else:
        potential_target = round(last_close - measured_move, 5)

    liquidity_map = analyze_liquidity(pair, timeframe)
    unswept = [lvl for lvl in liquidity_map.levels if not lvl.swept]
    if unswept:
        nearest = min(unswept, key=lambda lvl: abs(lvl.price - last_close))
        liquidity_location = f"{nearest.kind} at {nearest.price}"
    else:
        liquidity_location = "No unswept liquidity nearby"

    notes_by_phase = {
        "Accumulation": "Range compression detected — price is coiling before an expected liquidity grab.",
        "Manipulation": "A sweep beyond the prior range has occurred; watch for a reversal back into range before continuation.",
        "Distribution": "Price is expanding directionally after a liquidity sweep, consistent with the distribution phase.",
    }

    return AMDScanResult(
        pair=pair.upper(),
        timeframe=timeframe,
        phase=phase,
        confidence=confidence,
        potential_target=potential_target,
        liquidity_location=liquidity_location,
        notes=notes_by_phase[phase],
    )
