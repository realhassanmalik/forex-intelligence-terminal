from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db.database import SessionLocal, init_db
from app.routers import (
    accounts,
    ai_analyst,
    ai_reviewer,
    amd_scanner,
    analytics,
    currency_strength,
    dashboard,
    economic_calendar,
    journal,
    liquidity_scanner,
    market_structure,
    news,
    replay,
    risk_center,
    watchlist,
    weekly_report,
)
from app.services.seed_data import seed_all

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    db = SessionLocal()
    try:
        seed_all(db)
    finally:
        db.close()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

# The API is stateless (no cookies/sessions), so we can safely allow any origin.
# When CORS_ORIGINS contains "*", credentials must be disabled per the CORS spec.
_origins = settings.cors_origins
_allow_all = "*" in _origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=not _allow_all,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router)
app.include_router(amd_scanner.router)
app.include_router(liquidity_scanner.router)
app.include_router(market_structure.router)
app.include_router(currency_strength.router)
app.include_router(economic_calendar.router)
app.include_router(news.router)
app.include_router(ai_analyst.router)
app.include_router(weekly_report.router)
app.include_router(risk_center.router)
app.include_router(accounts.router)
app.include_router(journal.router)
app.include_router(ai_reviewer.router)
app.include_router(analytics.router)
app.include_router(replay.router)
app.include_router(watchlist.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": settings.app_name}
