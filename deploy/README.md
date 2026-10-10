# Deploying PoGoFilter

Live at **https://pogofilter.sgran.net**.

## Everyday deploys

**Push to `main`.** Within 15 minutes the server fetches the push, rebuilds and restarts. The image build runs the test suite first, so a failing commit never replaces the running site. To go live right away instead:

```sh
deploy/deploy.sh            # npm test, git push, then run the server's update now
```

## How it works

The server follows its own conventions (see `~/docker/CLAUDE.md` there) and mirrors the sussketch auto-deploy.

- **`~/docker/pogofilter`:** a checkout of this repo, owned by `sgran`, fetching over HTTPS. The repo is public, so it needs no deploy key.
- **`deploy/docker-compose.yml`:** the production stack, compose project `pogofilter`.
  - It builds the repo-root Dockerfile: tests, then `vite build`, then nginx on 8080.
  - The container `pogofilter` is read-only and on the shared external `web` network, with **no published ports**.
  - The `cloudflared` container reaches it by name. The Zero Trust dashboard maps `pogofilter.sgran.net -> http://pogofilter:8080`.
- **`deploy/deployer.compose.yml` and `deploy/deployer.Dockerfile`:** `pogofilter-deployer`, an idle Alpine sidecar.
  - It has docker, compose and git, plus the host Docker socket.
  - It runs as uid 1000 with the host's docker group, so nothing in the checkout becomes root-owned.
- **`deploy/update.sh`:** fetches `origin/main` and does nothing if it hasn't moved. Otherwise it fast-forwards, runs `compose up -d --build`, waits for the container's healthcheck, and prunes the old image.
- **`pogofilter-stats`:** the optional anonymous counters, on a private network that only the site's nginx can reach. `deploy/nginx-stats.conf` routes `/api/e` and `/admin/` to it. Its `/admin` credentials live in `deploy/stats.env` on the server, which is git-ignored. See [../stats/README.md](../stats/README.md).
- **Ofelia (`~/docker/ofelia/config.ini`):** execs the update script every 15 minutes.

  ```ini
  [job-exec "pogofilter-autodeploy"]
  schedule = @every 15m
  container = pogofilter-deployer
  user = 1000
  command = bash /home/sgran/docker/pogofilter/deploy/update.sh
  ```

## Useful commands (on the host)

```sh
docker exec -u 1000 pogofilter-deployer bash /home/sgran/docker/pogofilter/deploy/update.sh --force   # rebuild now
docker logs ofelia 2>&1 | grep pogofilter-autodeploy                                                   # job history
cd ~/docker/pogofilter && docker compose -f deploy/deployer.compose.yml up -d --build                 # (re)create the sidecar
```

## Notes

- **State:** players' cards live in their own browsers. The only server-side state is the stats total in the `pogofilter_stats-data` volume, which is nice to keep but not precious.
- **Service worker updates:** nginx sends `sw.js`, `index.html` and the manifest with `Cache-Control: no-cache`. Installed copies pick up a deploy on their next launch.
- **Cloudflare cache:** Cloudflare's edge briefly caches 404s, about 3 minutes. Right after a route change, a stale 404 can outlive the fix.
