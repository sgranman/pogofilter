import { Readable } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { createHandler, dayOf, openDb, record, report } from './app.mjs';

/** Drives the handler with a fake request and captures the response. */
async function call(handle, { method = 'GET', url, body, headers = {} }) {
  const req = Readable.from(body ? [body] : []);
  Object.assign(req, { method, url, headers, socket: { remoteAddress: '10.0.0.1' } });
  const res = {
    status: 0,
    headers: {},
    body: '',
    headersSent: false,
    writeHead(status, headers) {
      this.status = status;
      this.headers = headers;
      this.headersSent = true;
    },
    end(chunk = '') {
      this.body = String(chunk);
    },
  };
  await handle(req, res);
  return res;
}

const at = new Date('2026-10-10T18:00:00Z');
const make = (env = {}) => {
  const db = openDb(':memory:');
  return { db, handle: createHandler({ db, env: { NODE_ENV: 'production', ...env }, now: () => at }) };
};
const post = (handle, payload) => call(handle, { method: 'POST', url: '/api/e', body: JSON.stringify(payload) });

describe('event intake', () => {
  it('counts known events per day and suggestion', async () => {
    const { db, handle } = make();
    expect((await post(handle, { e: 'copy', p: 'trash-today' })).status).toBe(204);
    await post(handle, { e: 'copy', p: 'trash-today' });
    await post(handle, { e: 'save' });
    const rows = db.prepare('SELECT day, event, preset, n FROM counts ORDER BY event').all().map((r) => ({ ...r }));
    expect(rows).toEqual([
      { day: '2026-10-10', event: 'copy', preset: 'trash-today', n: 2 },
      { day: '2026-10-10', event: 'save', preset: '', n: 1 },
    ]);
  });

  it('rejects unknown events, junk and oversized bodies, and drops bad suggestion ids', async () => {
    const { db, handle } = make();
    expect((await post(handle, { e: 'hack' })).status).toBe(400);
    expect((await call(handle, { method: 'POST', url: '/api/e', body: 'not json' })).status).toBe(400);
    expect((await call(handle, { method: 'POST', url: '/api/e', body: 'x'.repeat(600) })).status).toBe(413);
    expect((await call(handle, { method: 'GET', url: '/api/e' })).status).toBe(405);
    await post(handle, { e: 'preset', p: '<script>' });
    expect(db.prepare("SELECT preset FROM counts WHERE event = 'preset'").get().preset).toBe('');
  });

  it('rate-limits one address without storing it', async () => {
    const { db, handle } = make();
    let last;
    for (let i = 0; i < 61; i++) last = await post(handle, { e: 'open' });
    expect(last.status).toBe(429);
    expect(db.prepare('SELECT n FROM counts').get().n).toBe(60);
    const cols = db.prepare('PRAGMA table_info(counts)').all().map((c) => c.name);
    expect(cols).toEqual(['day', 'event', 'preset', 'n']);
  });

  it('uses the configured time zone for the day', () => {
    expect(dayOf(new Date('2026-10-11T02:00:00Z'), 'UTC')).toBe('2026-10-11');
    expect(dayOf(new Date('2026-10-11T02:00:00Z'), 'America/Los_Angeles')).toBe('2026-10-10');
  });
});

describe('report', () => {
  it('rolls totals up by today, week, range and all time', () => {
    const db = openDb(':memory:');
    record(db, { event: 'copy', preset: 'hundos', day: '2026-10-10' });
    record(db, { event: 'copy', preset: 'hundos', day: '2026-10-05' });
    record(db, { event: 'copy', day: '2026-08-01' });
    record(db, { event: 'preset', preset: 'hundos', day: '2026-10-09' });
    const r = report(db, { days: 30, today: '2026-10-10' });
    expect(r.totals.copy).toMatchObject({ today: 1, week: 2, range: 2, all: 3 });
    expect(r.presets).toEqual([{ preset: 'hundos', opened: 1, saved: 0, copied: 2 }]);
    expect(r.daily).toHaveLength(30);
    expect(r.daily[0]).toEqual({ day: '2026-10-10', counts: { copy: 1 } });
  });
});

describe('admin gate', () => {
  it('refuses to serve without any auth configured in production', async () => {
    const { handle } = make();
    expect((await call(handle, { url: '/admin/' })).status).toBe(503);
    expect((await call(handle, { url: '/admin/api/stats' })).status).toBe(503);
  });

  it('accepts ADMIN_TOKEN and trades a ?token= link for a cookie', async () => {
    const { handle } = make({ ADMIN_TOKEN: 's3cret' });
    expect((await call(handle, { url: '/admin/' })).status).toBe(401);
    const link = await call(handle, { url: '/admin/?token=s3cret' });
    expect(link.status).toBe(303);
    expect(link.headers['Set-Cookie']).toMatch(/^pogofilter_admin=s3cret; Path=\/admin; HttpOnly; Secure/);
    const page = await call(handle, { url: '/admin/', headers: { cookie: 'pogofilter_admin=s3cret' } });
    expect(page.status).toBe(200);
    expect(page.body).toContain('data-identity="token"');
    const api = await call(handle, { url: '/admin/api/stats?days=7', headers: { authorization: 'Bearer s3cret' } });
    expect(JSON.parse(api.body).days).toBe(7);
  });

  it('rejects a forged Access header when Access is configured', async () => {
    const fetchImpl = async () => new Response(JSON.stringify({ keys: [] }));
    const db = openDb(':memory:');
    const handle = createHandler({
      db,
      env: { NODE_ENV: 'production', CF_ACCESS_TEAM_DOMAIN: 'x.cloudflareaccess.com', CF_ACCESS_AUD: 'aud' },
      fetchImpl,
    });
    const res = await call(handle, { url: '/admin/', headers: { 'cf-access-jwt-assertion': 'a.b.c' } });
    expect(res.status).toBe(401);
  });
});
