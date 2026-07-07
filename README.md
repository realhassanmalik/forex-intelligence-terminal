# Forex Intelligence Terminal

An AI-powered forex trading terminal: AMD analysis, liquidity mapping, market
structure, an economic calendar, news intelligence, a trade journal with AI
review, performance analytics, an edge finder, a risk center, an AI coach,
and a replay/pattern-search archive.

This is a scaffold: every module is wired end-to-end (backend routes → real
FastAPI logic → frontend pages), but price/news/calendar data is synthetic
and AI calls default to a deterministic mock. Swap in real providers later
without changing the shape of anything downstream — see "What's mocked"
below.

## Stack

- **Frontend**: Next.js (App Router) + React + TypeScript + Tailwind CSS
- **Backend**: Python + FastAPI + SQLAlchemy
- **Database**: PostgreSQL
- **AI**: Claude API / OpenAI API (optional — falls back to mock)

## Prerequisites

This scaffold was written on a machine with no Node, Python packages, or
Postgres installed, so nothing has been run or tested end-to-end yet. You'll
need, locally:

- **Node.js 20+** and npm
- **Python 3.10+** (the backend uses `X | None` type hints, which require
  3.10+; the system Python on this Mac was 3.9.6, so install a newer one via
  [python.org](https://www.python.org/downloads/) or `pyenv`)
- **PostgreSQL 14+**, running locally with a database created for this app
  (or skip it entirely for a quick local run — see below)

## Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

createdb forex_terminal   # or create it however you normally manage Postgres

cp .env.example .env      # edit DATABASE_URL / AI keys if needed

uvicorn app.main:app --reload --port 8000
```

**Don't want to install Postgres?** Set `DATABASE_URL=sqlite:///./forex_terminal.db`
in `backend/.env` instead — SQLAlchemy talks to it with no extra setup and
the app works identically. Swap back to a `postgresql+psycopg2://...` URL
whenever you're ready for the real thing. This was verified working (Node
24, Python 3.12, SQLite) during this session.

On first boot the app creates all tables and seeds a starter account,
watchlist, economic calendar, and news items. API docs are at
`http://localhost:8000/docs`.

## Frontend setup

```bash
cd frontend
npm install
cp .env.local.example .env.local   # points at http://localhost:8000 by default

npm run dev
```

Open `http://localhost:3000`.

## What's mocked (and how to make it real)

| Module | Current state | To go live |
|---|---|---|
| Price data (AMD, liquidity, structure, currency strength) | Deterministic synthetic candles seeded per pair/timeframe/day (`backend/app/services/mock_market_data.py`) | Replace `generate_candles` with a call to a real feed (OANDA, Polygon, etc.); every engine only depends on its return shape |
| Economic calendar / news | Seeded sample rows in Postgres (`backend/app/services/seed_data.py`) | Replace with a scheduled ingest job from a calendar/news API |
| AI Market Analyst, Trade Reviewer, Weekly Report, Daily Briefing | Deterministic, data-grounded templates (`backend/app/services/ai_client.py`) | Set `AI_PROVIDER=claude` or `openai` and the matching API key in `backend/.env` — the real-provider code path is already implemented, just untested without a key |
| TradingView charts | Not wired up | The Charting Library requires a separate licensed download; drop it into the frontend and point it at your price feed once one exists |

## Project layout

```
backend/
  app/
    core/       # settings
    db/         # SQLAlchemy session/engine
    models/     # ORM tables
    schemas/    # Pydantic request/response types
    services/   # mock data + AMD/liquidity/structure/risk/analytics engines, AI client
    routers/    # FastAPI endpoints, one file per module
frontend/
  app/          # one route per sidebar item (Dashboard, AMD Scanner, ...)
  components/   # shared layout + UI + scanner controls
  lib/          # typed API client, shared types, formatting helpers
```

## Notes

- All money/account state lives in a single seeded `Account` (id=1) for
  simplicity — multi-account support would mean adding an account switcher
  in the frontend and passing `account_id` through, which the API already
  supports.
- Position sizing and pip values use simplified constants (10 USD/pip/lot for
  non-JPY pairs, gold treated as a 100oz lot) — good enough for a demo,
  not precise enough for a real broker's contract specs.
