from pydantic import BaseModel


class AMDScanRequest(BaseModel):
    pair: str
    timeframe: str = "H1"


class AMDScanResult(BaseModel):
    pair: str
    timeframe: str
    phase: str  # Accumulation | Manipulation | Distribution
    confidence: float  # 0-100
    potential_target: float
    liquidity_location: str
    notes: str


class LiquidityLevel(BaseModel):
    kind: str  # Equal Highs | Equal Lows | PDH | PDL | Weekly High | Weekly Low
    price: float
    swept: bool = False
    distance_pips: float = 0.0


class LiquidityMap(BaseModel):
    pair: str
    timeframe: str
    levels: list[LiquidityLevel]


class StructurePoint(BaseModel):
    kind: str  # HH | HL | LH | LL
    price: float
    label: str | None = None


class MarketStructureResult(BaseModel):
    pair: str
    timeframe: str
    bias: str  # Bullish | Bearish | Neutral
    last_event: str  # BOS | CHOCH | None
    points: list[StructurePoint]


class CurrencyStrengthEntry(BaseModel):
    currency: str
    score: float  # 0-100
    rank: int


class CurrencyStrengthResult(BaseModel):
    entries: list[CurrencyStrengthEntry]
    computed_at: str
