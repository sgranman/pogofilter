import data from '../data/species.json';

export interface Species {
  n: number;
  name: string;
}

export const SPECIES: Species[] = data;
const BY_NUMBER = new Map(SPECIES.map((s) => [s.n, s]));
const LOWER = SPECIES.map((s) => s.name.toLowerCase());

export function speciesByNumber(n: number): Species | undefined {
  return BY_NUMBER.get(n);
}

/**
 * The safest way to type a species into the game's search bar.
 *
 * The game matches names by prefix (`mew` also finds Mewtwo) and reads `-`,
 * `:` and friends as operators (`ho-oh` is a range, `type: null` is an OR),
 * so anything other than a plain, unambiguous name is written as its
 * Pokédex number, which always matches exactly.
 */
export function speciesTerm(s: Species, family = false): string {
  const lower = s.name.toLowerCase();
  const plain = /^[a-z]+$/.test(lower) && !LOWER.some((o) => o !== lower && o.startsWith(lower));
  return (family ? '+' : '') + (plain ? lower : String(s.n));
}

/** Species whose name starts with (or, failing that, contains) the query. */
export function searchSpecies(query: string, limit = 8): Species[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  if (/^\d+$/.test(q)) {
    const s = BY_NUMBER.get(Number(q));
    return s ? [s] : [];
  }
  // Exact name first, so "mew" offers Mew before Mewtwo.
  const starts = SPECIES.filter((_, i) => LOWER[i].startsWith(q)).sort(
    (a, b) => Number(b.name.toLowerCase() === q) - Number(a.name.toLowerCase() === q),
  );
  const contains = SPECIES.filter((_, i) => !LOWER[i].startsWith(q) && LOWER[i].includes(q));
  return [...starts, ...contains].slice(0, limit);
}

/** Species names the game would match for a typed name prefix. */
export function speciesMatchingPrefix(prefix: string): Species[] {
  const p = prefix.toLowerCase().replace(/\s+/g, '');
  const squashed = (i: number) => LOWER[i].replace(/\s+/g, '');
  const hits = SPECIES.filter((_, i) => squashed(i).startsWith(p));
  // An exact name leads, so `mew` reads as Mew (also matching Mewtwo), not the reverse.
  return hits.sort((a, b) => Number(b.name.toLowerCase().replace(/\s+/g, '') === p) - Number(a.name.toLowerCase().replace(/\s+/g, '') === p));
}
