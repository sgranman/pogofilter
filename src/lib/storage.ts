// Saved cards live in this browser's localStorage and nowhere else.

export interface SavedCard {
  id: string;
  name: string;
  string: string;
  notes?: string;
  /** The suggestion this card started from, if any. */
  presetId?: string;
  createdAt: number;
  updatedAt: number;
}

const KEY = 'pogofilter:cards:v1';

export function loadCards(): SavedCard[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCard) : [];
  } catch {
    return [];
  }
}

/** Returns false when the browser refuses to store (private mode, storage full). */
export function saveCards(cards: SavedCard[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(cards));
    return true;
  } catch {
    return false;
  }
}

export function isCard(x: unknown): x is SavedCard {
  if (!x || typeof x !== 'object') return false;
  const c = x as Record<string, unknown>;
  return typeof c.id === 'string' && typeof c.name === 'string' && typeof c.string === 'string';
}

export function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ---- Export / import -------------------------------------------------------

interface ExportFile {
  app: 'pogofilter';
  version: 1;
  exportedAt: string;
  cards: SavedCard[];
}

export function exportCards(cards: SavedCard[]): string {
  const file: ExportFile = { app: 'pogofilter', version: 1, exportedAt: new Date().toISOString(), cards };
  return JSON.stringify(file, null, 2);
}

/**
 * Merges an export file into the existing cards. Cards already present
 * (same name and string) are skipped, so importing the same backup twice is
 * harmless. Imported cards get fresh ids so they can never overwrite one.
 */
export function importCards(
  existing: SavedCard[],
  json: string,
): { cards: SavedCard[]; added: number; skipped: number } {
  const parsed = JSON.parse(json);
  const list: unknown[] = Array.isArray(parsed) ? parsed : parsed?.cards;
  if (!Array.isArray(list)) throw new Error('This file doesn’t contain PoGoFilter cards.');
  const seen = new Set(existing.map((c) => `${c.name}\u0000${c.string}`));
  const now = Date.now();
  const added: SavedCard[] = [];
  let skipped = 0;
  for (const item of list) {
    if (!isCard(item)) {
      skipped++;
      continue;
    }
    const sig = `${item.name}\u0000${item.string}`;
    if (seen.has(sig)) {
      skipped++;
      continue;
    }
    seen.add(sig);
    added.push({
      id: newId(),
      name: item.name.slice(0, 80),
      string: item.string.slice(0, 2000),
      notes: typeof item.notes === 'string' ? item.notes.slice(0, 2000) : undefined,
      presetId: typeof item.presetId === 'string' ? item.presetId : undefined,
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : now,
      updatedAt: now,
    });
  }
  return { cards: [...added, ...existing], added: added.length, skipped };
}
