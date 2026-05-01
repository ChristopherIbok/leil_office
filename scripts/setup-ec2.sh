#!/bin/bash

# EC2 Setup Script for LEILPORTAL Backend
# Run this as: chmod +x setup.sh && ./setup.sh

set -e

echo "=== LEILPORTAL EC2 Setup ==="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# Update and install dependencies
print_status "Updating system..."
sudo yum update -y

print_status "Installing PostgreSQL 15..."
sudo amazon-linux-extras install postgresql15 -y
sudo yum install -y postgresql15 postgresql15-server

print_status "Initializing PostgreSQL..."
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

print_status "Creating database..."
sudo -u postgres psql -c "CREATE DATABASE leptinportal;" 2>/dev/null || true

print_status "Installing Node.js via fnm..."
curl -fsSL https://fnm.vercel.app/install | bash
export PATH="$HOME/.local/share/fnm/node-versions/default/bin:$PATH"
fnm install --lts
fnm default lts/*

print_status "Installing pnpm..."
npm install -g pnpm

print_status "Installing PM2..."
npm install -g pm2

print_status "Installing nginx..."
sudo amazon-linux-extras install nginx1 -y

# Get instance IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "YOUR_EC2_IP")

print_status "Checking for project directory..."
if [ ! -d "Leil_office" ]; then
    print_warn "Project not found. Clone it manually:"
    echo "  cd /home/ec2-user"
    echo "  git clone https://github.com/ChristopherIbok/Leil_office.git"
    echo "  cd Leil_office/apps/api"
    exit 1
fi

cd /home/ec2-user/Leil_office/apps/api

# Create .env file if not exists
if [ ! -f ".env" ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/leilinportal?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# AWS (for S3 file uploads)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_BUCKET="leilinportal-files"

# Stripe
STRIPE_SECRET_KEY=""

# App
WEB_ORIGIN="http://${EC2_IP}:3000"
PORT=4000

# Notion (optional)
NOTION_API_KEY=""
NOTION_DATABASE_ID=""

# Email (optional)
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="noreply@leilportal.com"

# Slack (optional)
SLACK_WEBHOOK_URL=""
EOF
fi

print_status "Installing dependencies..."
pnpm install --frozen-lockfile

print_status "Generating Prisma client..."
npx prisma generate

print_status "Running database migrations..."
npx prisma migrate deploy || print_warn "Migration skipped or already applied"

print_status "Building application..."
pnpm run build

print_status "Starting application with PM2..."
pm2 delete leptinportal-api 2>/dev/null || true
pm2 start dist/main.js --name leptinportal-api
pm2 save

# Configure nginx (optional - for domain)
print_status "Setting up nginx reverse proxy..."
sudo tee /etc/nginx/conf.d/leilportal.conf > /dev/null << EOF
server {
    listen 80;
    server_name $EC2_IP;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo systemctl restart nginx

print_status "=== Setup Complete ==="
echo ""
echo "Your API is running at: http://${EC2_IP}:4000"
echo ""
echo "Commands:"
echo "  View logs:  pm2 logs leptinportal-api"
echo "  Restart:    pm2 restart leptinportal-api"
echo "  Stop:       pm2 stop leptinportal-api"
echo ""