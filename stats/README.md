# Optional anonymous usage counts

**Off by default.** A plain `npm run build` (or the root `docker-compose.yml`) contains none of this: the app makes no requests and its footer says "no tracking". The pieces below only switch on when a deployment asks for them. pogofilter.sgran.net does, through `deploy/docker-compose.yml`.

## What is counted

With `VITE_STATS=1` at build time, the app sends one fire-and-forget `POST /api/e` at each of these moments:

| Event | When | Also sends |
| --- | --- | --- |
| `open` | the app is opened (once per tab) | |
| `preset` | a suggestion is opened | the suggestion id, e.g. `trash-today` |
| `blank` | a blank card is started | |
| `shared` | a share link is opened | |
| `save` | a card is saved | the suggestion id it started from, if any |
| `copy` | a search string is copied | the suggestion id it started from, if any |
| `share` | a share link is made | |
| `export` / `import` | a backup is downloaded / restored | |
| `sweep` | a species sweep is started | |

Copies made from a sweep step are counted as `copy`, with `sweep-<step>` in place of a suggestion id, e.g. `sweep-rest`.

The service adds 1 to a running total keyed by **(day, event, suggestion id)**, and that is all the database holds.
- **Never sent:** card names, search strings, ids or cookies.
- **Never stored:** IP addresses, user agents or timestamps finer than the day.
- **The one use of an IP address:** it keys an in-memory rate limit of 60 events a minute, then is forgotten.
- **Counts moments, not people:** one person copying twice counts twice.

## Pieces

- **`stats/`:** a dependency-free Node 22 service.
  - It uses the built-in `node:sqlite`.
  - `POST /api/e` takes events.
  - `/admin/` is a small dashboard.
  - `/healthz` is for the container healthcheck.
- **`deploy/nginx-stats.conf`:** mounted into the site container by the production compose. It forwards `/api/e` and `/admin/` to the service. The site's nginx includes `snippets/stats*.conf`, so without the file it serves only static files.
- **`deploy/docker-compose.yml`:** builds the site with `VITE_STATS=1` and runs `pogofilter-stats` on a private network that only nginx can reach. The data lives in the `stats-data` volume at `/data/stats.db`.

## /admin access

The admin gate is the same as sussketch's. It checks these in order:

1. **Cloudflare Access.** Set `CF_ACCESS_TEAM_DOMAIN` (e.g. `yourteam.cloudflareaccess.com`) and `CF_ACCESS_AUD`, the Application Audience tag of an Access application that covers `pogofilter.sgran.net/admin`. The service verifies the signed `Cf-Access-Jwt-Assertion` itself (RS256, issuer, audience, expiry), so the route stays shut even if it is reached without going through Cloudflare.
2. **`ADMIN_TOKEN`.** Send it as `Authorization: Bearer …`, or open `/admin/?token=…` once. The link is traded for an HttpOnly cookie.
3. **Neither set.** `/admin` answers 503 in production. An unauthenticated dashboard is never served by accident.

On the server these go in `deploy/stats.env`, which is git-ignored and read by the compose file.

## Trying it locally

```sh
STATS_DB=/tmp/pogofilter-stats.db node stats/server.mjs     # :8090, /admin open in dev
VITE_STATS=1 npm run dev                                     # Vite proxies /api and /admin to it
```

## Turning it off

Remove the `VITE_STATS` build arg, the `nginx-stats.conf` mount and the `stats` service from `deploy/docker-compose.yml`. The footer goes back to "no tracking" on the next deploy.
