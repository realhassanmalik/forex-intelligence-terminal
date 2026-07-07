from fastapi import APIRouter

from app.schemas.analysis import AMDScanResult
from app.services.amd_engine import analyze_amd

router = APIRouter(prefix="/api/amd-scanner", tags=["amd-scanner"])


@router.get("", response_model=AMDScanResult)
def scan_amd(pair: str = "EURUSD", timeframe: str = "H1"):
    return analyze_amd(pair, timeframe)
