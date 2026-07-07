#!/bin/bash
cd "$(dirname "$0")"
export PATH="$HOME/.local/opt/node/bin:$PATH"
exec npm run dev
