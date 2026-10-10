// Share links carry the card in the URL fragment (after `#`). Browsers never
// send the fragment to the server, so a shared filter reaches only the person
// who opens the link.

export interface SharedCard {
  name: string;
  string: string;
}

export function shareUrl(card: SharedCard, origin = location.origin + location.pathname): string {
  const p = new URLSearchParams({ s: card.string, n: card.name });
  return `${origin}#/new?${p.toString()}`;
}

/** Reads `#/new?s=…&n=…`. Returns null for any other fragment. */
export function readShared(hash: string): SharedCard | null {
  const m = /^#\/new\?(.*)$/.exec(hash);
  if (!m) return null;
  const p = new URLSearchParams(m[1]);
  const string = p.get('s');
  if (!string) return null;
  return { string: string.slice(0, 2000), name: (p.get('n') || 'Shared card').slice(0, 80) };
}
