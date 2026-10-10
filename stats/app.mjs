// PoGoFilter's optional anonymous usage counters.
//
// The web app, when built with VITE_STATS=1, sends a fire-and-forget
// `POST /api/e {"e":"copy","p":"trash-today"}` on a handful of moments. Each
// one adds 1 to a daily total keyed by (day, event, preset). Nothing else is
// kept: no IP addresses, no ids, no cookies, no user agents, no timestamps
// finer than the day. The per-IP rate limit lives only in memory.
//
// /admin shows the totals, behind Cloudflare Access (or ADMIN_TOKEN).

import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { AccessVerifier, readCookie, secretsMatch } from './access.mjs';

/** Every event the app may send. Anything else is dropped. */
export const EVENTS = {
  open: 'App opened',
  preset: 'Suggestion opened',
  blank: 'Blank card started',
  shared: 'Share link opened',
  save: 'Card saved',
  copy: 'String copied',
  share: 'Share link made',
  export: 'Backup exported',
  import: 'Backup restored',
};

/** Suggestion ids are slugs; anything else is recorded without one. */
const PRESET_ID = /^[a-z0-9-]{1,40}$/;

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 60;
const MAX_BODY = 512;
const TOKEN_COOKIE = 'pogofilter_admin';

export function openDb(file) {
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS counts (
      day    TEXT NOT NULL,
      event  TEXT NOT NULL,
      preset TEXT NOT NULL DEFAULT '',
      n      INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (day, event, preset)
    );
  `);
  return db;
}

/** The calendar day in the configured zone, as YYYY-MM-DD. */
export function dayOf(date, timeZone = 'UTC') {
  return date.toLocaleDateString('en-CA', { timeZone });
}

export function record(db, { event, preset = '', day }) {
  db.prepare(
    `INSERT INTO counts (day, event, preset, n) VALUES (?, ?, ?, 1)
     ON CONFLICT (day, event, preset) DO UPDATE SET n = n + 1`,
  ).run(day, event, preset);
}

/** Totals for the admin page: per event, per day, and per suggestion. */
export function report(db, { days = 30, today }) {
  const since = shiftDay(today, -(days - 1));
  const weekStart = shiftDay(today, -6);
  const rows = db.prepare('SELECT day, event, preset, n FROM counts').all();

  const totals = {};
  for (const e of Object.keys(EVENTS)) totals[e] = { label: EVENTS[e], today: 0, week: 0, range: 0, all: 0 };
  const daily = new Map();
  const presets = new Map();

  for (const { day, event, preset, n } of rows) {
    const t = totals[event];
    if (!t) continue;
    t.all += n;
    if (day === today) t.today += n;
    if (day >= weekStart) t.week += n;
    if (day >= since) {
      t.range += n;
      const d = daily.get(day) ?? {};
      d[event] = (d[event] ?? 0) + n;
      daily.set(day, d);
      if (preset) {
        const p = presets.get(preset) ?? { preset, opened: 0, saved: 0, copied: 0 };
        if (event === 'preset') p.opened += n;
        if (event === 'save') p.saved += n;
        if (event === 'copy') p.copied += n;
        presets.set(preset, p);
      }
    }
  }

  const dayList = [];
  for (let i = 0; i < days; i++) {
    const day = shiftDay(today, -i);
    dayList.push({ day, counts: daily.get(day) ?? {} });
  }

  return {
    today,
    days,
    events: EVENTS,
    totals,
    daily: dayList,
    presets: [...presets.values()].sort((a, b) => b.copied - a.copied || b.opened - a.opened),
  };
}

function shiftDay(day, delta) {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/**
 * The whole service as one request handler, so tests can drive it without a
 * socket. `env` carries STATS_DB-independent config: TZ, CF_ACCESS_*,
 * ADMIN_TOKEN, NODE_ENV.
 */
export function createHandler({ db, env = process.env, fetchImpl = fetch, now = () => new Date() }) {
  const timeZone = env.TZ || 'UTC';
  const teamDomain = env.CF_ACCESS_TEAM_DOMAIN?.trim();
  const aud = env.CF_ACCESS_AUD?.trim();
  const verifier = teamDomain && aud ? new AccessVerifier(teamDomain, aud, fetchImpl) : null;
  const token = env.ADMIN_TOKEN?.trim() || null;
  const openInDev = !verifier && !token && env.NODE_ENV !== 'production';
  const page = readFileSync(new URL('./admin.html', import.meta.url), 'utf8');
  const script = readFileSync(new URL('./admin.js', import.meta.url), 'utf8');
  const hits = new Map();

  const send = (res, status, body = '', type = 'text/plain; charset=utf-8', headers = {}) => {
    res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', ...headers });
    res.end(body);
  };

  const limited = (req) => {
    // The address is used only as a key in this in-memory map, never stored.
    const ip = req.headers['cf-connecting-ip'] || req.socket?.remoteAddress || '?';
    const t = Date.now();
    const h = hits.get(ip);
    if (!h || t - h.start > RATE_WINDOW_MS) {
      hits.set(ip, { start: t, n: 1 });
      if (hits.size > 10_000) hits.clear();
      return false;
    }
    h.n += 1;
    return h.n > RATE_MAX;
  };

  async function event(req, res) {
    if (req.method !== 'POST') return send(res, 405, '', undefined, { Allow: 'POST' });
    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (body.length > MAX_BODY) return send(res, 413);
    }
    if (limited(req)) return send(res, 429);
    let msg;
    try {
      msg = JSON.parse(body);
    } catch {
      return send(res, 400);
    }
    if (!msg || typeof msg.e !== 'string' || !Object.hasOwn(EVENTS, msg.e)) return send(res, 400);
    const preset = typeof msg.p === 'string' && PRESET_ID.test(msg.p) ? msg.p : '';
    try {
      record(db, { event: msg.e, preset, day: dayOf(now(), timeZone) });
    } catch (e) {
      console.error('stats: write failed —', e);
    }
    return send(res, 204);
  }

  /** Returns an identity string, or sends a refusal and returns null. */
  async function admit(req, res, url) {
    if (verifier) {
      const assertion = req.headers['cf-access-jwt-assertion'] || readCookie(req.headers.cookie, 'CF_Authorization');
      if (assertion) {
        try {
          const who = await verifier.verify(assertion);
          if (who) return who.email ?? who.sub ?? 'cloudflare access';
        } catch (e) {
          console.error('admin: Access verification error —', e);
          send(res, 503, 'Could not verify Cloudflare Access right now.');
          return null;
        }
      }
    }
    if (token) {
      const header = req.headers.authorization ?? '';
      const bearer = header.startsWith('Bearer ') ? header.slice(7) : null;
      const query = url.searchParams.get('token');
      const supplied = bearer ?? query ?? readCookie(req.headers.cookie, TOKEN_COOKIE);
      if (supplied && secretsMatch(supplied, token)) {
        if (query) {
          // Trade the query string for a cookie so the secret stops riding
          // along in links and history.
          send(res, 303, '', undefined, {
            Location: url.pathname,
            'Set-Cookie': `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/admin; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 86400}`,
          });
          return null;
        }
        return 'token';
      }
    }
    if (openInDev) return 'dev (no auth configured)';
    if (!verifier && !token) {
      send(res, 503, 'Admin is disabled: set CF_ACCESS_TEAM_DOMAIN + CF_ACCESS_AUD, or ADMIN_TOKEN.');
      return null;
    }
    send(res, 401, 'Not authorised.');
    return null;
  }

  return async function handle(req, res) {
    const url = new URL(req.url, 'http://stats.local');
    try {
      if (url.pathname === '/api/e') return await event(req, res);
      if (url.pathname === '/healthz') return send(res, 200, 'ok\n');
      if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
        const who = await admit(req, res, url);
        if (!who) return;
        if (url.pathname === '/admin' || url.pathname === '/admin/') {
          const html = page.replace('<body>', `<body data-identity="${who.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)}">`);
          return send(res, 200, html, 'text/html; charset=utf-8');
        }
        if (url.pathname === '/admin/admin.js') return send(res, 200, script, 'text/javascript; charset=utf-8');
        if (url.pathname === '/admin/api/stats') {
          const days = Math.min(365, Math.max(1, Number(url.searchParams.get('days')) || 30));
          return send(res, 200, JSON.stringify(report(db, { days, today: dayOf(now(), timeZone) })), 'application/json');
        }
      }
      return send(res, 404, 'Not found.');
    } catch (e) {
      console.error('stats: request failed —', e);
      if (!res.headersSent) send(res, 500);
    }
  };
}
