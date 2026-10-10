// Gate for /admin. Ported from sussketch (server/src/stats/access.ts).
//
// Cloudflare Access authenticates at the edge and forwards a signed
// assertion. We verify that assertion ourselves rather than trusting the
// header's presence, so the route stays shut even if the service is ever
// reached without going through the tunnel.

import { constants, createPublicKey, timingSafeEqual, verify as verifySignature } from 'node:crypto';

const JWKS_TTL_MS = 10 * 60_000;
/** Tolerance for clock drift between us and Cloudflare, in seconds. */
const SKEW_S = 60;

const decodeSegment = (segment) => JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'));

export class AccessVerifier {
  #keys = new Map();
  #fetchedAt = 0;
  #inflight = null;

  constructor(teamDomain, aud, fetchImpl = fetch) {
    this.issuer = `https://${teamDomain}`;
    this.aud = aud;
    this.fetchImpl = fetchImpl;
  }

  /** Load the signing keys, at most one fetch in flight at a time. */
  async #loadKeys(force) {
    if (!force && this.#keys.size > 0 && Date.now() - this.#fetchedAt < JWKS_TTL_MS) return;
    if (this.#inflight) return this.#inflight;
    this.#inflight = (async () => {
      const res = await this.fetchImpl(`${this.issuer}/cdn-cgi/access/certs`);
      if (!res.ok) throw new Error(`Access certs fetch failed: HTTP ${res.status}`);
      const body = await res.json();
      const next = new Map();
      for (const jwk of body.keys ?? []) {
        if (!jwk.kid || jwk.kty !== 'RSA' || !jwk.n || !jwk.e) continue;
        next.set(jwk.kid, createPublicKey({ key: jwk, format: 'jwk' }));
      }
      if (next.size === 0) throw new Error('Access certs contained no usable RSA keys');
      this.#keys = next;
      this.#fetchedAt = Date.now();
    })().finally(() => {
      this.#inflight = null;
    });
    return this.#inflight;
  }

  /** Verify an Access assertion, returning `{ email, sub }` or null. */
  async verify(token) {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [rawHeader, rawPayload, rawSignature] = parts;
    let header;
    let claims;
    try {
      header = decodeSegment(rawHeader);
      claims = decodeSegment(rawPayload);
    } catch {
      return null;
    }
    if (header.alg !== 'RS256' || !header.kid) return null;

    await this.#loadKeys(false);
    let key = this.#keys.get(header.kid);
    if (!key) {
      // Unknown kid usually means Cloudflare rotated its keys early.
      await this.#loadKeys(true);
      key = this.#keys.get(header.kid);
    }
    if (!key) return null;

    const ok = verifySignature(
      'sha256',
      Buffer.from(`${rawHeader}.${rawPayload}`, 'utf8'),
      { key, padding: constants.RSA_PKCS1_PADDING },
      Buffer.from(rawSignature, 'base64url'),
    );
    if (!ok) return null;

    const now = Math.floor(Date.now() / 1000);
    if (claims.iss !== this.issuer) return null;
    if (typeof claims.exp !== 'number' || claims.exp + SKEW_S < now) return null;
    if (typeof claims.nbf === 'number' && claims.nbf - SKEW_S > now) return null;
    const audiences = Array.isArray(claims.aud) ? claims.aud : claims.aud ? [claims.aud] : [];
    if (!audiences.includes(this.aud)) return null;
    return { email: claims.email ?? null, sub: claims.sub ?? null };
  }
}

/** Constant-time string comparison that tolerates differing lengths. */
export function secretsMatch(a, b) {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/** Read one cookie out of a raw Cookie header. */
export function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1 || part.slice(0, eq).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(eq + 1).trim());
    } catch {
      return part.slice(eq + 1).trim();
    }
  }
  return null;
}
