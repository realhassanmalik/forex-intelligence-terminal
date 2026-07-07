from fastapi import APIRouter

from app.schemas.analysis import LiquidityMap
from app.services.liquidity_engine import analyze_liquidity

router = APIRouter(prefix="/api/liquidity-scanner", tags=["liquidity-scanner"])


@router.get("", response_model=LiquidityMap)
def scan_liquidity(pair: str = "EURUSD", timeframe: str = "H1"):
    return analyze_liquidity(pair, timeframe)
