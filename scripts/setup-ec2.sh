#!/bin/bash
# EC2 Setup Script for LEILPORTAL Backend
# Usage: chmod +x scripts/setup-ec2.sh && ./scripts/setup-ec2.sh
# Must be run from the repo root as ec2-user on Amazon Linux 2023

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB_NAME="leilportal"
DB_USER="leilportal"
DB_PASS="${DB_PASSWORD:-$(openssl rand -base64 24)}"
APP_NAME="leilportal-api"
EC2_IP=$(curl -sf http://169.254.169.254/latest/meta-data/public-ipv4 || echo "localhost")

info "Repo root: $REPO_ROOT"
info "EC2 public IP: $EC2_IP"

# ── System packages ──────────────────────────────────────────────────────────
info "Updating system packages..."
sudo dnf update -y
sudo dnf install -y git curl nginx

# ── PostgreSQL 15 ────────────────────────────────────────────────────────────
info "Installing PostgreSQL 15..."
sudo dnf install -y postgresql15 postgresql15-server

if ! sudo systemctl is-active --quiet postgresql; then
  sudo postgresql-setup --initdb
  sudo systemctl enable --now postgresql
fi

info "Creating database user and database..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

# Allow password auth for our user in pg_hba.conf
if ! sudo grep -q "^host.*${DB_USER}" /var/lib/pgsql/data/pg_hba.conf; then
  echo "host  ${DB_NAME}  ${DB_USER}  127.0.0.1/32  md5" | sudo tee -a /var/lib/pgsql/data/pg_hba.conf
  sudo systemctl reload postgresql
fi

# ── Node.js 20 via fnm ───────────────────────────────────────────────────────
if ! command -v node &>/dev/null || [[ "$(node -v)" != v20* ]]; then
  info "Installing Node.js 20 via fnm..."
  curl -fsSL https://fnm.vercel.app/install | bash -s -- --install-dir "$HOME/.fnm" --skip-shell
  export PATH="$HOME/.fnm:$PATH"
  eval "$(fnm env --use-on-cd)"
  fnm install 20
  fnm default 20

  # Persist in .bashrc
  if ! grep -q "fnm env" "$HOME/.bashrc"; then
    cat >> "$HOME/.bashrc" << 'BASHRC'

# fnm
export PATH="$HOME/.fnm:$PATH"
eval "$(fnm env --use-on-cd)"
BASHRC
  fi
fi

export PATH="$HOME/.fnm:$PATH"
eval "$(fnm env --use-on-cd 2>/dev/null)" || true
info "Node: $(node -v), npm: $(npm -v)"

# ── pnpm & PM2 ───────────────────────────────────────────────────────────────
info "Enabling corepack and installing pnpm..."
corepack enable
corepack prepare pnpm@9.12.3 --activate

info "Installing PM2 globally..."
npm install -g pm2

# ── Application ──────────────────────────────────────────────────────────────
cd "$REPO_ROOT"

# Write .env if it doesn't exist
if [ ! -f "apps/api/.env" ]; then
  info "Writing apps/api/.env ..."
  cat > apps/api/.env << EOF
NODE_ENV=production
API_PORT=4000

# Database
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}?schema=public"

# Auth — CHANGE THIS before going live
JWT_SECRET="$(openssl rand -base64 48)"
JWT_EXPIRES_IN=7d

# CORS — add Vercel URL if needed, comma-separated
WEB_ORIGIN="http://${EC2_IP}:3000,https://leil-office-web.vercel.app"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET="leilportal-files"

# Cognito
AWS_COGNITO_USER_POOL_ID=""
AWS_COGNITO_CLIENT_ID=""

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Email
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="noreply@leilportal.com"

# Integrations (optional)
SLACK_WEBHOOK_URL=""
NOTION_API_KEY=""
NOTION_DATABASE_ID=""
EOF
  warn "apps/api/.env created with generated secrets. Review and fill in AWS/Stripe/SMTP values."
else
  info "apps/api/.env already exists — skipping."
fi

info "Installing dependencies..."
pnpm install --frozen-lockfile

info "Generating Prisma client..."
pnpm prisma:generate

info "Running database migrations..."
pnpm prisma:migrate

info "Building API..."
pnpm --filter @leilportal/api build

# ── PM2 ──────────────────────────────────────────────────────────────────────
info "Starting API with PM2..."
pm2 delete "$APP_NAME" 2>/dev/null || true
pm2 start "$REPO_ROOT/apps/api/dist/main.js" \
  --name "$APP_NAME" \
  --env production \
  --env-file "$REPO_ROOT/apps/api/.env"
pm2 save
pm2 startup | tail -1 | sudo bash || warn "Run 'pm2 startup' manually to enable auto-restart on reboot."

# ── nginx ────────────────────────────────────────────────────────────────────
info "Configuring nginx reverse proxy..."
sudo tee /etc/nginx/conf.d/leilportal.conf > /dev/null << NGINX
server {
    listen 80;
    server_name $EC2_IP _;

    client_max_body_size 20M;

    location /api/ {
        proxy_pass         http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass         http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
    }
}
NGINX

sudo nginx -t && sudo systemctl enable --now nginx && sudo systemctl reload nginx

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
info "=== Setup Complete ==="
echo ""
echo "  API:        http://${EC2_IP}/api"
echo "  Health:     http://${EC2_IP}/api/health"
echo ""
echo "  DB user:    ${DB_USER}"
echo "  DB pass:    ${DB_PASS}  ← save this"
echo ""
echo "  PM2 logs:   pm2 logs ${APP_NAME}"
echo "  PM2 status: pm2 status"
echo "  Restart:    pm2 restart ${APP_NAME}"
echo ""
warn "Remember to set NEXT_PUBLIC_API_URL=http://${EC2_IP}/api on Vercel."
warn "Open port 80 (and optionally 443) in your EC2 security group."
