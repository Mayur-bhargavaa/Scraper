#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_USER="${SUDO_USER:-${USER:-$(id -un)}}"
DEPLOY_HOME="${HOME:-$(getent passwd "$DEPLOY_USER" | cut -d: -f6)}"
APP_NAME="stitchbyte"
SERVER_PORT="${SERVER_PORT:-5000}"

log() {
  printf '\n[%s] %s\n' "$APP_NAME" "$1"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$1" >&2
    exit 1
  fi
}

prompt_if_empty() {
  local name="$1"
  local prompt="$2"
  local default_value="${3:-}"
  local current_value="${!name:-}"

  if [[ -z "$current_value" ]]; then
    if [[ -n "$default_value" ]]; then
      read -r -p "$prompt [$default_value]: " current_value
      current_value="${current_value:-$default_value}"
    else
      read -r -p "$prompt: " current_value
    fi
  fi

  printf -v "$name" '%s' "$current_value"
}

generate_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
  else
    date +%s | sha256sum | cut -d' ' -f1
  fi
}

compose_up() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    log "Starting MongoDB and Redis with Docker Compose"
    (cd "$PROJECT_DIR" && docker compose up -d)
  else
    log "Docker Compose is not available; skipping MongoDB and Redis startup"
  fi
}

install_system_packages() {
  if command -v apt-get >/dev/null 2>&1; then
    log "Installing Nginx and Certbot"
    sudo apt-get update
    sudo apt-get install -y nginx certbot python3-certbot-nginx
    sudo systemctl enable --now nginx
  else
    log "apt-get was not found; install Nginx and Certbot manually before continuing"
  fi
}

write_env_file() {
  local env_file="$PROJECT_DIR/.env"
  local client_url="https://$DOMAIN"
  local jwt_secret_value="${JWT_SECRET:-}"

  if [[ -z "$jwt_secret_value" ]]; then
    jwt_secret_value="$(generate_secret)"
  fi

  cat > "$env_file" <<EOF
PORT=$SERVER_PORT
NODE_ENV=production

MONGODB_URI=$MONGODB_URI

REDIS_HOST=$REDIS_HOST
REDIS_PORT=$REDIS_PORT
REDIS_USERNAME=$REDIS_USERNAME
REDIS_PASSWORD=$REDIS_PASSWORD

JWT_SECRET=$jwt_secret_value
JWT_EXPIRES_IN=${JWT_EXPIRES_IN:-7d}

GOOGLE_PLACES_API_KEY=${GOOGLE_PLACES_API_KEY:-}

PROXY_ENABLED=${PROXY_ENABLED:-false}
PROXY_PROVIDER=${PROXY_PROVIDER:-brightdata}
PROXY_HOST=${PROXY_HOST:-}
PROXY_PORT=${PROXY_PORT:-}
PROXY_USERNAME=${PROXY_USERNAME:-}
PROXY_PASSWORD=${PROXY_PASSWORD:-}

CAPTCHA_ENABLED=${CAPTCHA_ENABLED:-false}
CAPTCHA_PROVIDER=${CAPTCHA_PROVIDER:-2captcha}
CAPTCHA_API_KEY=${CAPTCHA_API_KEY:-}

SCRAPER_MAX_CONCURRENCY=${SCRAPER_MAX_CONCURRENCY:-3}
SCRAPER_MIN_DELAY=${SCRAPER_MIN_DELAY:-2000}
SCRAPER_MAX_DELAY=${SCRAPER_MAX_DELAY:-7000}
SCRAPER_HEADLESS=${SCRAPER_HEADLESS:-true}

CLIENT_URL=$client_url
EOF
}

install_dependencies() {
  log "Installing workspace dependencies"
  (cd "$PROJECT_DIR" && npm install)
}

install_playwright() {
  log "Installing Playwright Chromium"
  (cd "$PROJECT_DIR/server" && npx playwright install chromium)
}

build_client() {
  log "Building client"
  (cd "$PROJECT_DIR" && npm run build --workspace=client)
}

install_pm2() {
  if ! command -v pm2 >/dev/null 2>&1; then
    log "Installing PM2 globally"
    sudo env PATH="$PATH" npm install -g pm2
  fi
}

configure_nginx() {
  local nginx_available="/etc/nginx/sites-available/${APP_NAME}.conf"
  local nginx_enabled="/etc/nginx/sites-enabled/${APP_NAME}.conf"
  local server_names="$DOMAIN"

  if [[ "$DOMAIN" != www.* ]]; then
    server_names="$DOMAIN www.$DOMAIN"
  fi

  log "Writing Nginx configuration"
  sudo tee "$nginx_available" >/dev/null <<EOF
server {
  listen 80;
  server_name $server_names;
  client_max_body_size 20m;

  root $PROJECT_DIR/client/dist;
  index index.html;

  location /api/ {
    proxy_pass http://127.0.0.1:$SERVER_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /socket.io/ {
    proxy_pass http://127.0.0.1:$SERVER_PORT;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location / {
    try_files \$uri \$uri/ /index.html;
  }
}
EOF

  sudo ln -sf "$nginx_available" "$nginx_enabled"
  sudo nginx -t
  sudo systemctl reload nginx
}

issue_certificate() {
  if command -v certbot >/dev/null 2>&1; then
    log "Requesting SSL certificate with Certbot"
    sudo certbot --nginx -d "$DOMAIN" -m "$EMAIL" --agree-tos --non-interactive --redirect
  else
    log "Certbot is not installed; skipping SSL issuance"
  fi
}

start_pm2() {
  log "Starting application with PM2"
  pm2 delete stitchbyte >/dev/null 2>&1 || true
  (cd "$PROJECT_DIR" && pm2 start ecosystem.config.cjs --env production --only stitchbyte)
  pm2 save
  sudo env PATH="$PATH" pm2 startup systemd -u "$DEPLOY_USER" --hp "$DEPLOY_HOME"
}

main() {
  require_command npm
  require_command sudo

  if [[ ! -f "$PROJECT_DIR/.env.example" ]]; then
    printf '.env.example not found in project root.\n' >&2
    exit 1
  fi

  prompt_if_empty DOMAIN "Production domain" "example.com"
  prompt_if_empty EMAIL "Certbot email address" "admin@${DOMAIN}"
  prompt_if_empty MONGODB_URI "MongoDB connection string" "mongodb://127.0.0.1:27017/stitchbyte"
  prompt_if_empty REDIS_HOST "Redis host" "127.0.0.1"
  prompt_if_empty REDIS_PORT "Redis port" "6379"
  prompt_if_empty REDIS_USERNAME "Redis username" "default"
  prompt_if_empty REDIS_PASSWORD "Redis password" ""

  install_dependencies
  compose_up
  install_system_packages
  write_env_file
  install_playwright
  build_client
  install_pm2
  configure_nginx
  issue_certificate
  start_pm2

  log "Deployment complete"
  printf 'Site: https://%s\n' "$DOMAIN"
}

main "$@"