#!/bin/bash
###############################################################################
#  Forex Intelligence Terminal — one-click launcher (macOS)
#  Double-click this file in Finder. It starts the backend + frontend and
#  opens the terminal in your browser. Close the window (or press Ctrl+C)
#  to stop everything.
###############################################################################

set -uo pipefail
cd "$(dirname "$0")"
ROOT="$(pwd)"

BACKEND_PORT=8000
FRONTEND_PORT=3000

# --- pretty output -----------------------------------------------------------
b()  { printf "\033[1;36m%s\033[0m\n" "$*"; }   # cyan bold
ok() { printf "\033[1;32m✓ %s\033[0m\n" "$*"; } # green
warn(){ printf "\033[1;33m! %s\033[0m\n" "$*"; } # yellow
err(){ printf "\033[1;31m✗ %s\033[0m\n" "$*"; } # red

clear
b "════════════════════════════════════════════════"
b "   FOREX INTELLIGENCE TERMINAL — starting up"
b "════════════════════════════════════════════════"
echo

# --- make sure Node is on PATH ----------------------------------------------
export PATH="$HOME/.local/opt/node/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
# pick up nvm if present
if [ -s "$HOME/.nvm/nvm.sh" ]; then . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1; fi

if ! command -v node >/dev/null 2>&1; then
  err "Node.js not found. Install it from https://nodejs.org then re-run."
  echo "Press any key to close."; read -n 1 -s; exit 1
fi
ok "Node $(node --version)"

# =============================================================================
# BACKEND
# =============================================================================
b "› Preparing backend..."
cd "$ROOT/backend"

# venv + dependencies (self-healing)
if [ ! -x ".venv/bin/uvicorn" ]; then
  warn "Setting up Python environment (first run, ~1 min)..."
  if [ ! -d ".venv" ]; then
    PY="$(command -v python3.12 || command -v python3 || command -v python)"
    "$PY" -m venv .venv
  fi
  ./.venv/bin/pip install --upgrade pip >/dev/null 2>&1
  ./.venv/bin/pip install -r requirements.txt
fi
ok "Backend dependencies ready"

# .env (defaults to SQLite — no Postgres needed)
if [ ! -f ".env" ]; then
  cat > .env <<ENV
DATABASE_URL=sqlite:///$ROOT/backend/forex_terminal.db
CORS_ORIGINS=["http://localhost:3000"]
AI_PROVIDER=mock
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
DEFAULT_ACCOUNT_BALANCE=100000
DEFAULT_DAILY_LOSS_LIMIT_PCT=5
DEFAULT_WEEKLY_LOSS_LIMIT_PCT=8
DEFAULT_MONTHLY_LOSS_LIMIT_PCT=10
ENV
  ok "Created backend/.env (SQLite)"
fi

# =============================================================================
# FRONTEND
# =============================================================================
b "› Preparing frontend..."
cd "$ROOT/frontend"

if [ ! -f ".env.local" ]; then
  echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:$BACKEND_PORT" > .env.local
  ok "Created frontend/.env.local"
fi

if [ ! -d "node_modules" ]; then
  warn "Installing frontend packages (first run, a few min)..."
  npm install
fi
ok "Frontend dependencies ready"

# =============================================================================
# LAUNCH
# =============================================================================
mkdir -p "$ROOT/logs"

cleanup() {
  echo
  warn "Shutting down..."
  [ -n "${BACK_PID:-}" ] && kill "$BACK_PID" 2>/dev/null
  [ -n "${FRONT_PID:-}" ] && kill "$FRONT_PID" 2>/dev/null
  # also free the ports in case children linger
  lsof -ti tcp:$BACKEND_PORT | xargs kill 2>/dev/null
  lsof -ti tcp:$FRONTEND_PORT | xargs kill 2>/dev/null
  ok "Stopped. You can close this window."
  exit 0
}
trap cleanup INT TERM

# free ports if something is already using them
lsof -ti tcp:$BACKEND_PORT | xargs kill 2>/dev/null
lsof -ti tcp:$FRONTEND_PORT | xargs kill 2>/dev/null

echo
b "› Starting backend  (http://localhost:$BACKEND_PORT)"
cd "$ROOT/backend"
./.venv/bin/uvicorn app.main:app --port $BACKEND_PORT > "$ROOT/logs/backend.log" 2>&1 &
BACK_PID=$!

b "› Starting frontend (http://localhost:$FRONTEND_PORT)"
cd "$ROOT/frontend"
npm run dev > "$ROOT/logs/frontend.log" 2>&1 &
FRONT_PID=$!

# --- wait for the frontend to answer, then open the browser ------------------
echo
printf "Waiting for the terminal to come online"
URL="http://localhost:$FRONTEND_PORT"
for i in $(seq 1 60); do
  if curl -s -o /dev/null "$URL"; then
    echo; ok "Terminal is live!"
    open "$URL"
    break
  fi
  # bail early if a server died
  if ! kill -0 "$BACK_PID" 2>/dev/null; then echo; err "Backend crashed — see logs/backend.log"; fi
  printf "."
  sleep 1
done

echo
b "════════════════════════════════════════════════"
ok "Forex Intelligence Terminal is running"
echo "   Terminal UI : $URL"
echo "   API docs    : http://localhost:$BACKEND_PORT/docs"
echo "   Logs        : $ROOT/logs/"
echo
warn "Keep this window open. Press Ctrl+C (or close it) to stop."
b "════════════════════════════════════════════════"

# keep the script alive while the servers run
wait
