from fastapi import APIRouter

from app.schemas.analysis import MarketStructureResult
from app.services.structure_engine import analyze_structure

router = APIRouter(prefix="/api/market-structure", tags=["market-structure"])


@router.get("", response_model=MarketStructureResult)
def get_market_structure(pair: str = "EURUSD", timeframe: str = "H1"):
    return analyze_structure(pair, timeframe)
