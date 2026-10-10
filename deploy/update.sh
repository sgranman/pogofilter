#!/usr/bin/env bash
#
# Automatic production update for PoGoFilter on the home server (sgran-ubuntu).
#
# Fetches origin/main; if it has moved, fast-forwards, rebuilds the image (the
# build runs the test suite first), recreates the container, and waits for it
# to report healthy. If main has not moved it is a no-op, so it is safe to run
# on a schedule.
#
# Runs unattended via the shared Ofelia scheduler: a [job-exec] block in the
# server's ~/docker/ofelia/config.ini execs this script into the long-running
# `pogofilter-deployer` sidecar (deploy/deployer.compose.yml).
#
# Manual run on the host:
#   docker exec -u 1000 pogofilter-deployer bash /home/sgran/docker/pogofilter/deploy/update.sh
# Force a rebuild even when up to date: append --force to that command.

set -euo pipefail

force=false
[ "${1:-}" = "--force" ] && force=true

cd "$(dirname "$0")/.."

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

branch="$(git rev-parse --abbrev-ref HEAD)"
git fetch --quiet origin "$branch"

local_rev="$(git rev-parse HEAD)"
remote_rev="$(git rev-parse "origin/$branch")"

if [ "$local_rev" = "$remote_rev" ] && ! $force; then
  log "already up to date at ${local_rev:0:7} on $branch — nothing to do"
  exit 0
fi

if [ "$local_rev" != "$remote_rev" ]; then
  log "update: ${local_rev:0:7} -> ${remote_rev:0:7} on $branch"
  git merge --ff-only "origin/$branch"
else
  log "forced rebuild at ${local_rev:0:7} on $branch"
fi

rev="$(git rev-parse --short HEAD)"
log "building & (re)starting pogofilter @ $rev"
# If the tests fail the build fails here, set -e stops us, and the running
# container is left untouched.
docker compose -f deploy/docker-compose.yml up -d --build --quiet-pull

log "waiting for container health"
deadline=$(( $(date +%s) + 90 ))
while true; do
  status="$(docker inspect -f '{{.State.Health.Status}}' pogofilter 2>/dev/null || echo missing)"
  [ "$status" = "healthy" ] && break
  if [ "$(date +%s)" -gt "$deadline" ]; then
    log "ERROR: pogofilter health=$status after 90s — check: docker logs pogofilter"
    exit 1
  fi
  sleep 3
done

# Reclaim space from the image we just replaced.
docker image prune -f >/dev/null 2>&1 || true

log "pogofilter $rev live and healthy (pogofilter.sgran.net via the tunnel)"
