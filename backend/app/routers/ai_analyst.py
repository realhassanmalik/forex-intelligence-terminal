from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.news_item import NewsItem
from app.schemas.ai import AIMarketAnalysisRequest, AIMarketAnalysisResult
from app.services.ai_client import ai_client
from app.services.amd_engine import analyze_amd
from app.services.currency_strength_engine import compute_currency_strength
from app.services.liquidity_engine import analyze_liquidity
from app.services.structure_engine import analyze_structure

router = APIRouter(prefix="/api/ai", tags=["ai-analyst"])


@router.post("/market-analysis", response_model=AIMarketAnalysisResult)
def get_market_analysis(payload: AIMarketAnalysisRequest, db: Session = Depends(get_db)):
    amd = analyze_amd(payload.pair, payload.timeframe)
    liquidity = analyze_liquidity(payload.pair, payload.timeframe)
    structure = analyze_structure(payload.pair, payload.timeframe)
    strength = compute_currency_strength()
    news_items = db.query(NewsItem).order_by(NewsItem.published_at.desc()).limit(5).all()

    context = {
        "amd": amd.model_dump(),
        "liquidity": liquidity.model_dump(),
        "structure": structure.model_dump(),
        "currency_strength": [e.model_dump() for e in strength.entries],
        "news": [n.headline for n in news_items],
    }

    result = ai_client.market_analysis(payload.pair, payload.timeframe, context)
    return AIMarketAnalysisResult(**result)
