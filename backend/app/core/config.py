from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Forex Intelligence Terminal API"
    environment: str = "development"

    # Portable default: a SQLite file next to the backend, resolved at runtime on
    # whatever machine this runs on. No .env editing needed. Override with a
    # postgresql+psycopg2://... URL (via .env) to use Postgres instead.
    database_url: str = f"sqlite:///{(BACKEND_DIR / 'forex_terminal.db').as_posix()}"

    cors_origins: list[str] = ["http://localhost:3000"]

    anthropic_api_key: str | None = None
    openai_api_key: str | None = None
    ai_provider: str = "mock"  # "claude" | "openai" | "mock"

    default_account_balance: float = 100_000.0
    default_daily_loss_limit_pct: float = 5.0
    default_weekly_loss_limit_pct: float = 8.0
    default_monthly_loss_limit_pct: float = 10.0


@lru_cache
def get_settings() -> Settings:
    return Settings()
