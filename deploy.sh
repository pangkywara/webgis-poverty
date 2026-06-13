#!/usr/bin/env bash
set -euo pipefail

# Deploys the current main branch to production over SSH + Docker Compose.
# Usage: ./deploy.sh

SERVER="root@159.223.38.184"
SSH_KEY="$HOME/.ssh/id_ed25519"
APP_DIR="/root/pba-new"

ssh -i "$SSH_KEY" "$SERVER" "cd $APP_DIR && git pull --ff-only && docker compose -f docker-compose.prod.yml --env-file .env up -d --build && docker compose -f docker-compose.prod.yml ps"
