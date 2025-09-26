#!/usr/bin/env bash
# LangChain.md Ops Field Agent
# Automates Vercel linking, analytics enablement, and production deploys.

set -euo pipefail

if ! command -v vercel >/dev/null 2>&1; then
  echo "[ops-agent] vercel CLI is required (npm install -g vercel)." >&2
  exit 1
fi

: "${VERCEL_TOKEN:?Set VERCEL_TOKEN with a valid Vercel access token}"  # token
: "${VERCEL_PROJECT:?Set VERCEL_PROJECT to the Vercel project slug}"       # project slug
: "${VERCEL_ORG:?Set VERCEL_ORG to the Vercel org/team slug}"             # scope/team slug

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_FILE="${ROOT_DIR}/ops-agent.log"

log() {
  printf '[ops-agent] %s\n' "$1" | tee -a "$LOG_FILE"
}

log "Using project=${VERCEL_PROJECT}, org=${VERCEL_ORG}."

log "Linking local repo to Vercel project..."
vercel link \
  --cwd "$ROOT_DIR" \
  --project "$VERCEL_PROJECT" \
  --scope "$VERCEL_ORG" \
  --yes \
  --token "$VERCEL_TOKEN" | tee -a "$LOG_FILE"

log "Ensuring Vercel Web Analytics is enabled (CLI command deprecated on v48+)..."
if vercel help analytics >/dev/null 2>&1; then
  vercel analytics enable \
    --cwd "$ROOT_DIR" \
    --scope "$VERCEL_ORG" \
    --yes \
    --token "$VERCEL_TOKEN" | tee -a "$LOG_FILE"
else
  log "Analytics command unavailable; verify toggle in dashboard."
fi

log "Deploying to production..."
vercel deploy \
  --cwd "$ROOT_DIR" \
  --prod \
  --yes \
  --token "$VERCEL_TOKEN" | tee -a "$LOG_FILE"

log "Ops Field Agent run complete."
