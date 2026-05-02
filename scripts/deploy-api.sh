#!/bin/bash
# Deploy API updates to EC2
# Usage: ./scripts/deploy-api.sh
# Run from the repo root on the EC2 instance after a git pull

set -euo pipefail

GREEN='\033[0;32m'
NC='\033[0m'
info() { echo -e "${GREEN}[INFO]${NC}  $1"; }

APP_NAME="leilportal-api"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$REPO_ROOT"

info "Pulling latest code..."
git pull origin main

info "Installing dependencies..."
pnpm install --frozen-lockfile

info "Generating Prisma client..."
pnpm prisma:generate

info "Running migrations..."
pnpm prisma:migrate

info "Building API..."
pnpm --filter @leilportal/api build

info "Restarting API..."
pm2 restart "$APP_NAME"

info "=== Deploy complete ==="
pm2 status "$APP_NAME"
