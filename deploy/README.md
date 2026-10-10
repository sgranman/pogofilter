# Deploying PoGoFilter

Live at **https://pogofilter.sgran.net**.

Production is one container (`pogofilter`) on sgran-ubuntu. It is nginx serving the static build on port 8080. It follows the host's conventions (see `~/docker/CLAUDE.md` there):

- The compose file lives in `~/docker/pogofilter/`.
- The container joins the shared external `web` network with **no published ports**. The `cloudflared` container reaches it by name, and the Zero Trust dashboard maps `pogofilter.sgran.net -> http://pogofilter:8080`.

## Everyday deploys

```sh
deploy/deploy.sh            # tests, builds, ships to sgran-ubuntu, rebuilds container
```

## Pieces

- **`deploy/Dockerfile`:** `nginx:1.27-alpine` plus the prebuilt `dist/`. deploy.sh ships it to `~/pogofilter` on the host, next to `dist/`, `nginx.conf` and `security-headers.conf`, and the image is built there. The host never runs npm.
- **`deploy/docker-compose.yml`:** lives at `~/docker/pogofilter/docker-compose.yml`. deploy.sh keeps it in sync.
- **No state:** the container is read-only. Players' cards live in their own browsers, so there is nothing to back up.

## Notes

- **Service worker updates:** nginx sends `sw.js`, `index.html` and the manifest with `Cache-Control: no-cache`. Installed copies then pick up a deploy on their next launch. Fingerprinted `/assets/` files are cached for a year.
- **Cloudflare cache:** Cloudflare's edge briefly caches 404s, about 3 minutes. Right after a route change, a stale 404 can outlive the fix.
