from fastapi import APIRouter

from app.schemas.analysis import CurrencyStrengthResult
from app.services.currency_strength_engine import compute_currency_strength

router = APIRouter(prefix="/api/currency-strength", tags=["currency-strength"])


@router.get("", response_model=CurrencyStrengthResult)
def get_currency_strength():
    return compute_currency_strength()
