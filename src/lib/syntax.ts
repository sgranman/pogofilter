// The Pokémon GO search syntax, as a data structure.
//
// The game has no parentheses. `&` (or `|`) splits the string into groups
// that must all match; inside a group, `,` (or `;` / `:`) means any of the
// terms may match; `!` negates the single term it prefixes. So every search
// string is an AND of ORs, which is exactly the shape below.

export interface Term {
  /** The term without its leading `!`, e.g. `cp-1500`, `@1fire`, `+eevee`. */
  text: string;
  not: boolean;
}

/** One `&`-separated group: matches when any of its terms match. */
export type Clause = Term[];

/** A whole search string: matches when every clause matches. */
export type Expr = Clause[];

const AND = /[&|]/;
const OR = /[,;:]/;

export function parse(input: string): Expr {
  const expr: Expr = [];
  for (const group of input.split(AND)) {
    const clause: Clause = [];
    for (const raw of group.split(OR)) {
      let text = raw.trim();
      let not = false;
      // `!!x` is legal in the game and means `x`; collapse it the same way.
      while (text.startsWith('!')) {
        not = !not;
        text = text.slice(1).trim();
      }
      if (text) clause.push({ text, not });
    }
    if (clause.length) expr.push(clause);
  }
  return expr;
}

export function termString(t: Term): string {
  return (t.not ? '!' : '') + t.text;
}

export function serialize(expr: Expr): string {
  return expr
    .filter((c) => c.length)
    .map((c) => c.map(termString).join(','))
    .join('&');
}

/** Re-serializes user input into the canonical form (trimmed, no empty groups). */
export function normalize(input: string): string {
  return serialize(parse(input));
}

/** Characters that can never appear inside a term, because the game reads them as operators. */
export const OPERATOR_CHARS = /[&|,;:!]/;

/** Formats a numeric range the way the game writes it: `5`, `5-`, `-5`, `5-10`. */
export function rangeText(min: number | null, max: number | null): string {
  if (min != null && max != null) return min === max ? `${min}` : `${min}-${max}`;
  if (min != null) return `${min}-`;
  if (max != null) return `-${max}`;
  return '';
}

/** The inverse of `rangeText`. Returns null when the text isn't a range. */
export function parseRange(text: string): { min: number | null; max: number | null } | null {
  const m = /^(\d+)?(-)?(\d+)?$/.exec(text.replace(/\s+/g, ''));
  if (!m || (!m[1] && !m[3])) return null;
  const a = m[1] != null ? Number(m[1]) : null;
  const b = m[3] != null ? Number(m[3]) : null;
  if (!m[2]) return { min: a, max: a };
  return { min: a, max: b };
}
