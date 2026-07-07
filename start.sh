#!/bin/bash
###############################################################################
#  Forex Intelligence Terminal — one-click launcher (Linux)
#  Run:  ./start.sh   (or double-click and choose "Run in Terminal")
#  Starts the backend + frontend and opens the terminal in your browser.
#  Press Ctrl+C to stop everything.
###############################################################################

set -uo pipefail
cd "$(dirname "$0")"
ROOT="$(pwd)"

BACKEND_PORT=8000
FRONTEND_PORT=3000

b()  { printf "\033[1;36m%s\033[0m\n" "$*"; }
ok() { printf "\033[1;32m✓ %s\033[0m\n" "$*"; }
warn(){ printf "\033[1;33m! %s\033[0m\n" "$*"; }
err(){ printf "\033[1;31m✗ %s\033[0m\n" "$*"; }

clear
b "════════════════════════════════════════════════"
b "   FOREX INTELLIGENCE TERMINAL — starting up"
b "════════════════════════════════════════════════"
echo

# --- prerequisites -----------------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  err "Node.js not found. Install Node 20+ (e.g. 'sudo apt install nodejs npm' or from https://nodejs.org)."
  read -rp "Press Enter to close." _; exit 1
fi
ok "Node $(node --version)"

PY="$(command -v python3 || command -v python || true)"
if [ -z "$PY" ]; then
  err "Python 3.10+ not found. Install it (e.g. 'sudo apt install python3 python3-venv')."
  read -rp "Press Enter to close." _; exit 1
fi
ok "$($PY --version)"

# --- backend -----------------------------------------------------------------
b "› Preparing backend..."
cd "$ROOT/backend"
if [ ! -x ".venv/bin/uvicorn" ]; then
  warn "Setting up Python environment (first run, ~1 min)..."
  [ -d ".venv" ] || "$PY" -m venv .venv
  ./.venv/bin/pip install --upgrade pip >/dev/null 2>&1
  ./.venv/bin/pip install -r requirements.txt
fi
ok "Backend dependencies ready"

# --- frontend ----------------------------------------------------------------
b "› Preparing frontend..."
cd "$ROOT/frontend"
[ -f ".env.local" ] || echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:$BACKEND_PORT" > .env.local
if [ ! -d "node_modules" ]; then
  warn "Installing frontend packages (first run, a few min)..."
  npm install
fi
ok "Frontend dependencies ready"

# --- launch ------------------------------------------------------------------
mkdir -p "$ROOT/logs"
cleanup() {
  echo; warn "Shutting down..."
  [ -n "${BACK_PID:-}" ] && kill "$BACK_PID" 2>/dev/null
  [ -n "${FRONT_PID:-}" ] && kill "$FRONT_PID" 2>/dev/null
  ok "Stopped."; exit 0
}
trap cleanup INT TERM

echo
b "› Starting backend  (http://localhost:$BACKEND_PORT)"
cd "$ROOT/backend"
./.venv/bin/uvicorn app.main:app --port $BACKEND_PORT > "$ROOT/logs/backend.log" 2>&1 &
BACK_PID=$!

b "› Starting frontend (http://localhost:$FRONTEND_PORT)"
cd "$ROOT/frontend"
npm run dev > "$ROOT/logs/frontend.log" 2>&1 &
FRONT_PID=$!

URL="http://localhost:$FRONTEND_PORT"
printf "Waiting for the terminal to come online"
for _ in $(seq 1 60); do
  if curl -s -o /dev/null "$URL" 2>/dev/null; then
    echo; ok "Terminal is live!"
    (command -v xdg-open >/dev/null && xdg-open "$URL") || echo "Open $URL in your browser."
    break
  fi
  printf "."; sleep 1
done

echo
b "════════════════════════════════════════════════"
ok "Running — UI: $URL   API docs: http://localhost:$BACKEND_PORT/docs"
warn "Keep this window open. Press Ctrl+C to stop."
b "════════════════════════════════════════════════"
wait
