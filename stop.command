#!/bin/bash
# Stop the Forex Intelligence Terminal (frees ports 8000 and 3000)
printf "\033[1;33mStopping Forex Intelligence Terminal...\033[0m\n"
lsof -ti tcp:8000 | xargs kill 2>/dev/null && echo "  backend stopped"  || echo "  backend was not running"
lsof -ti tcp:3000 | xargs kill 2>/dev/null && echo "  frontend stopped" || echo "  frontend was not running"
printf "\033[1;32mDone. You can close this window.\033[0m\n"
