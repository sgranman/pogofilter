#!/usr/bin/env bash
# Deploy now instead of waiting for the scheduled check: push main, then run
# the server's update script immediately. (Pushing alone is enough; Ofelia
# picks it up within 15 minutes.)
# Usage: deploy/deploy.sh [host]   (default: sgran-ubuntu)
set -euo pipefail
cd "$(dirname "$0")/.."

HOST="${1:-sgran-ubuntu}"

npm test
git push origin main
ssh "$HOST" 'docker exec -u 1000 pogofilter-deployer bash /home/sgran/docker/pogofilter/deploy/update.sh'
echo "-> https://pogofilter.sgran.net"
