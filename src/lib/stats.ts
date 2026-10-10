// Optional anonymous usage counts. Unless the site is built with VITE_STATS=1,
// this module compiles down to nothing and the app makes no requests at all.
// When on, each call sends one event name (and, for suggestions, the
// suggestion's id) to the stats service in ./stats.
// No ids, cookies or card contents are ever sent.

export type StatEvent =
  | 'open'
  | 'preset'
  | 'blank'
  | 'shared'
  | 'save'
  | 'copy'
  | 'share'
  | 'export'
  | 'import'
  | 'sweep';

export const STATS_ENABLED = import.meta.env.VITE_STATS === '1';

export function track(e: StatEvent, preset?: string): void {
  if (!STATS_ENABLED) return;
  try {
    const body = JSON.stringify(preset ? { e, p: preset } : { e });
    // sendBeacon survives the page being backgrounded mid-copy; fetch is the fallback.
    if (navigator.sendBeacon?.('/api/e', new Blob([body], { type: 'text/plain' }))) return;
    void fetch('/api/e', { method: 'POST', body, keepalive: true }).catch(() => {});
  } catch {
    // Counting must never get in the way of using the app.
  }
}

/** Counts an app open once per tab, not once per screen. */
export function trackOpen(): void {
  if (!STATS_ENABLED) return;
  try {
    if (sessionStorage.getItem('pogofilter:opened')) return;
    sessionStorage.setItem('pogofilter:opened', '1');
  } catch {
    // Storage blocked: count anyway; at worst a reload counts twice.
  }
  track('open');
}
