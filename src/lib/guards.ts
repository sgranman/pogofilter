// "Keep safe" rules: clauses made only of excluded terms.
//
// A single `!shiny` hides shinies. A clause of several excluded terms,
// `!0-1attack,!3-4defense,!3-4hp`, hides anything matching *all* of the
// positive versions at once (not low Attack, or not high Defense, or not
// high HP). That is how the game spells "never show this combination", and
// it is the only way to protect, say, PvP-shaped IVs.

import { describe } from './describe';
import { parse, termString, type Clause } from './syntax';

export interface Combo {
  key: string;
  label: string;
  gloss: string;
}

/** Named combinations, so they read as one idea instead of three stamps. */
export const COMBOS: Combo[] = [
  {
    key: '!0-1attack,!3-4defense,!3-4hp',
    label: 'PvP IVs',
    gloss: 'PvP-shaped IVs (low Attack, high Defense and HP)',
  },
];

const COMBO_BY_KEY = new Map(COMBOS.map((c) => [c.key, c]));

export function clauseKey(c: Clause): string {
  return c.map(termString).join(',').toLowerCase().replace(/\s+/g, '');
}

export function isGuard(c: Clause): boolean {
  return c.length > 0 && c.every((t) => t.not);
}

export function guardClause(key: string): Clause {
  return parse(key)[0] ?? [];
}

/** Short label for a guard stamp. */
export function guardLabel(c: Clause): string {
  const combo = COMBO_BY_KEY.get(clauseKey(c));
  if (combo) return combo.label;
  return c.map((t) => describe({ ...t, not: false }).label).join(' + ');
}

/** What the guard keeps out, phrased after "never shows any that are…". */
export function guardGloss(c: Clause): string {
  const combo = COMBO_BY_KEY.get(clauseKey(c));
  if (combo) return combo.gloss;
  const parts = c.map((t) => describe({ ...t, not: false }).gloss);
  return parts.length === 1 ? parts[0] : `(${parts.join(' and ')})`;
}
