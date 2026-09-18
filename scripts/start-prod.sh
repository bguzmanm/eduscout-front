#!/usr/bin/env bash
set -euo pipefail
mkdir -p .next/standalone/.next/static .next/standalone/public
cp -R .next/static/. .next/standalone/.next/static/
cp -R public/. .next/standalone/public/
NODE_ENV=production PORT="${PORT:-3000}" node .next/standalone/server.js