#!/usr/bin/env bash
# Test, build and deploy to the home server (Docker flow).
# Ships dist/ + the nginx config + deploy/Dockerfile to ~/pogofilter, keeps
# ~/docker/pogofilter/docker-compose.yml in sync, then rebuilds and restarts
# the `pogofilter` container and checks it over the `web` network.
# Usage: deploy/deploy.sh [host]   (default: sgran-ubuntu)
set -euo pipefail
cd "$(dirname "$0")/.."

HOST="${1:-sgran-ubuntu}"

npm test
npm run build

tar -C dist -czf - . | ssh "$HOST" 'rm -rf ~/pogofilter/dist && mkdir -p ~/pogofilter/dist && tar -C ~/pogofilter/dist -xzf -'
tar -czf - nginx.conf security-headers.conf -C deploy Dockerfile | ssh "$HOST" 'tar -C ~/pogofilter -xzf -'
tar -C deploy -czf - docker-compose.yml | ssh "$HOST" 'mkdir -p ~/docker/pogofilter && tar -C ~/docker/pogofilter -xzf -'

ssh "$HOST" '
  set -e
  cd ~/docker/pogofilter
  docker compose up -d --build --quiet-pull 2>&1 | tail -1
  sleep 2
  docker run --rm --network web curlimages/curl:latest -sf http://pogofilter:8080/healthz >/dev/null && echo "healthz ok (web network)"
'
echo "deployed to $HOST -> https://pogofilter.sgran.net"
