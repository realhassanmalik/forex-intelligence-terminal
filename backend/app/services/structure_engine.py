"""Market structure detection: HH/HL/LH/LL swing sequence, BOS/CHOCH, bias."""

from app.schemas.analysis import MarketStructureResult, StructurePoint
from app.services.mock_market_data import generate_candles


def _pivot_sequence(candles: list[dict], window: int = 3) -> list[dict]:
    raw = []
    for i in range(window, len(candles) - window):
        h, low = candles[i]["high"], candles[i]["low"]
        neighborhood = candles[i - window : i] + candles[i + 1 : i + window + 1]
        if all(h >= c["high"] for c in neighborhood):
            raw.append({"index": i, "price": h, "type": "high"})
        if all(low <= c["low"] for c in neighborhood):
            raw.append({"index": i, "price": low, "type": "low"})
    raw.sort(key=lambda p: p["index"])

    pivots: list[dict] = []
    for p in raw:
        if pivots and pivots[-1]["type"] == p["type"]:
            more_extreme = (p["type"] == "high" and p["price"] > pivots[-1]["price"]) or (
                p["type"] == "low" and p["price"] < pivots[-1]["price"]
            )
            if more_extreme:
                pivots[-1] = p
        else:
            pivots.append(p)
    return pivots


def _bias_from_kinds(kinds: list[str]) -> str:
    bullish = kinds.count("HH") + kinds.count("HL")
    bearish = kinds.count("LH") + kinds.count("LL")
    if bullish > bearish:
        return "Bullish"
    if bearish > bullish:
        return "Bearish"
    return "Neutral"


def analyze_structure(pair: str, timeframe: str = "H1") -> MarketStructureResult:
    candles = generate_candles(pair, timeframe, count=150)
    pivots = _pivot_sequence(candles)

    classified = []
    last_high = last_low = None
    for p in pivots:
        if p["type"] == "high":
            kind = "HH" if last_high is None or p["price"] > last_high else "LH"
            last_high = p["price"]
        else:
            kind = "HL" if last_low is None or p["price"] > last_low else "LL"
            last_low = p["price"]
        classified.append({"kind": kind, "price": p["price"], "index": p["index"]})

    points = [
        StructurePoint(kind=c["kind"], price=round(c["price"], 5), label=f"{c['kind']} @ candle {c['index']}")
        for c in classified[-8:]
    ]

    bias = _bias_from_kinds([c["kind"] for c in classified[-4:]])

    last_event = "None"
    if len(classified) >= 3:
        prior_bias = _bias_from_kinds([c["kind"] for c in classified[-3:-1]])
        if prior_bias != "Neutral" and bias != "Neutral" and prior_bias != bias:
            last_event = "CHOCH"
        elif bias != "Neutral":
            last_event = "BOS"

    return MarketStructureResult(
        pair=pair.upper(),
        timeframe=timeframe,
        bias=bias,
        last_event=last_event,
        points=points,
    )
