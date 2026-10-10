// Turns terms into chip labels and plain English.

import {
  BUDDY_LEVELS,
  IV_BARS,
  KEYWORD_BY_KEY,
  RANGE_BY_PREFIX,
  STARS,
  TYPE_BY_KEY,
  type PokeType,
} from './catalog';
import { speciesByNumber, speciesMatchingPrefix } from './species';
import { parseRange, type Clause, type Expr, type Term } from './syntax';

export type TermKind =
  | 'keyword'
  | 'type'
  | 'stars'
  | 'iv'
  | 'range'
  | 'dex'
  | 'move'
  | 'effective'
  | 'tag'
  | 'species'
  | 'custom';

export interface Described {
  kind: TermKind;
  /** Short chip text, e.g. "CP ≤ 1500". */
  label: string;
  /** Reads after "Pokémon that are …"; already negated when the term is. */
  gloss: string;
  /** Type color for type-flavored terms. */
  type?: PokeType;
  /** Something the player should know before relying on this term. */
  warning?: string;
}

const squash = (s: string) => s.toLowerCase().replace(/\s+/g, '');

function rangePhrase(min: number | null, max: number | null, unit = ''): string {
  const u = unit ? ` ${unit}` : '';
  if (min != null && max != null) return min === max ? `${min}${u}` : `${min}–${max}${u}`;
  if (min != null) return `${min}${u} or more`;
  return `${max}${u} or less`;
}

function rangeLabel(min: number | null, max: number | null): string {
  if (min != null && max != null) return min === max ? `${min}` : `${min}–${max}`;
  if (min != null) return `≥ ${min}`;
  return `≤ ${max}`;
}

function ageLabel(min: number | null, max: number | null): string {
  if (min === 0 && max === 0) return 'Today';
  if ((min ?? 0) === 0 && max != null) return `Last ${max + 1} days`;
  if (max == null) return `${min}+ days ago`;
  if (min === max) return `${min} days ago`;
  return `${min}–${max} days ago`;
}

function ageGloss(min: number | null, max: number | null): string {
  if (min === 0 && max === 0) return 'caught today';
  if ((min ?? 0) === 0 && max != null) return `caught in the last ${max + 1} days`;
  if (max == null) return `caught ${min}+ days ago`;
  if (min === max) return `caught ${min} days ago`;
  return `caught ${rangePhrase(min, max, 'days')} ago`;
}

function buddyGloss(min: number | null, max: number | null): string {
  const lo = min ?? 0;
  const hi = max ?? 5;
  if (lo === hi) return BUDDY_LEVELS[lo] ?? `buddy level ${lo}`;
  if (lo === 0) return `up to ${BUDDY_LEVELS[hi] ?? `buddy level ${hi}`}`;
  if (hi === 5) return `${BUDDY_LEVELS[lo] ?? `buddy level ${lo}`} or better`;
  return `buddy level ${lo}–${hi}`;
}

function ivGloss(stat: string, min: number | null, max: number | null): string {
  const lo = min ?? 0;
  const hi = max ?? 4;
  const pts = lo === hi ? IV_BARS[lo] : `${IV_BARS[lo].split('–')[0]}–${IV_BARS[hi].split('–').at(-1)}`;
  return `${stat} IV ${pts}`;
}

function negate(d: Omit<Described, 'gloss'> & { gloss: string }, not: boolean, no?: string): Described {
  if (!not) return d;
  return { ...d, gloss: no ?? `not ${d.gloss}` };
}

export function describe(term: Term): Described {
  const raw = term.text.trim();
  const t = squash(raw);
  const { not } = term;

  const kw = KEYWORD_BY_KEY.get(t);
  if (kw) return { kind: 'keyword', label: kw.label, gloss: not ? kw.no : kw.yes };

  const type = TYPE_BY_KEY.get(t);
  if (type) return negate({ kind: 'type', label: type.label, gloss: `${type.label}-type`, type }, not);

  let m = /^([0-4])\*$/.exec(t);
  if (m) {
    const s = STARS.find((x) => x.n === Number(m![1]))!;
    return negate({ kind: 'stars', label: s.label, gloss: `${s.label} (${s.gloss})` }, not);
  }

  m = /^([\d-]+)(attack|defense|hp)$/.exec(t);
  if (m) {
    const r = parseRange(m[1]);
    if (r) {
      const stat = m[2] === 'hp' ? 'HP' : m[2][0].toUpperCase() + m[2].slice(1);
      const bars = rangeLabel(r.min, r.max).replace('≥ ', '').replace('≤ ', '≤');
      return negate({ kind: 'iv', label: `${stat} ${bars}★`, gloss: ivGloss(stat, r.min, r.max) }, not);
    }
  }

  m = /^(cp|hp|age|year|distance|buddy|mega)([\d-]+)$/.exec(t);
  if (m) {
    const r = parseRange(m[2]);
    const field = RANGE_BY_PREFIX.get(m[1])!;
    if (r) {
      let gloss: string;
      if (m[1] === 'age') gloss = ageGloss(r.min, r.max);
      else if (m[1] === 'buddy') gloss = buddyGloss(r.min, r.max);
      else if (m[1] === 'year') gloss = `caught in ${rangePhrase(r.min, r.max)}`;
      else if (m[1] === 'distance') gloss = `caught ${rangePhrase(r.min, r.max, 'km')} away`;
      else gloss = `${field.label} ${rangePhrase(r.min, r.max)}`;
      const label = m[1] === 'age' ? ageLabel(r.min, r.max) : `${field.label} ${rangeLabel(r.min, r.max)}`;
      return negate({ kind: 'range', label, gloss }, not);
    }
  }

  m = /^(\+)?([\d-]+)$/.exec(t);
  if (m) {
    const r = parseRange(m[2]);
    if (r) {
      const family = !!m[1];
      if (r.min != null && r.min === r.max) {
        const s = speciesByNumber(r.min);
        const name = s ? s.name : `#${r.min}`;
        return negate(
          {
            kind: 'dex',
            label: family ? `${name} family` : name,
            gloss: family ? `in the ${name} family` : name,
          },
          not,
        );
      }
      return negate({ kind: 'dex', label: `Dex ${rangeLabel(r.min, r.max)}`, gloss: `Pokédex #${rangePhrase(r.min, r.max)}` }, not);
    }
  }

  m = /^@([123])?(.+)$/.exec(raw.replace(/^@\s*/, '@'));
  if (m) {
    const slot = m[1];
    const what = squash(m[2]);
    const slotName = slot === '1' ? 'fast move' : slot === '2' ? 'charged move' : slot === '3' ? 'second charged move' : 'move';
    const mt = TYPE_BY_KEY.get(what);
    if (mt) {
      return negate({ kind: 'move', label: `${slot ? `@${slot} ` : '@'}${mt.label}`, gloss: `with a ${mt.label}-type ${slotName}`, type: mt }, not, `without a ${mt.label}-type ${slotName}`);
    }
    if (what === 'special') {
      return negate({ kind: 'move', label: 'Legacy move', gloss: `with a legacy or event ${slotName}` }, not, `without a legacy or event ${slotName}`);
    }
    if (what === 'weather') {
      return negate({ kind: 'move', label: 'Weather move', gloss: `with a weather-boosted ${slotName}` }, not, `without a weather-boosted ${slotName}`);
    }
    const moveName = m[2].trim().replace(/\b\w/g, (c) => c.toUpperCase());
    return negate({ kind: 'move', label: `@${moveName}`, gloss: `knowing ${moveName}` }, not, `not knowing ${moveName}`);
  }

  m = /^([<>])(.+)$/.exec(t);
  if (m) {
    const et = TYPE_BY_KEY.get(m[2]);
    if (et) {
      return m[1] === '>'
        ? negate({ kind: 'effective', label: `Beats ${et.label}`, gloss: `strong against ${et.label}`, type: et }, not)
        : negate({ kind: 'effective', label: `Weak to ${et.label}`, gloss: `weak to ${et.label}`, type: et }, not);
    }
  }

  m = /^#(.*)$/.exec(raw);
  if (m) {
    const tag = m[1].trim();
    if (!tag) return { kind: 'tag', label: 'Any tag', gloss: not ? 'untagged' : 'tagged' };
    return negate({ kind: 'tag', label: `#${tag}`, gloss: `tagged “${tag}”` }, not, `not tagged “${tag}”`);
  }

  m = /^(\+)?([a-z][a-z.' -]*)$/i.exec(raw);
  if (m) {
    const family = !!m[1];
    const matches = speciesMatchingPrefix(m[2]);
    if (matches.length) {
      const first = matches[0].name;
      const label = family ? `${first} family` : matches.length > 1 ? `${m[2].trim()}…` : first;
      const gloss = family
        ? `in the ${first} family`
        : matches.length > 1
          ? `named ${matches.slice(0, 3).map((s) => s.name).join(', ')}${matches.length > 3 ? '…' : ''}`
          : first;
      const warning =
        !family && matches.length > 1
          ? `Names match from the start, so this also finds ${matches.slice(1, 4).map((s) => s.name).join(', ')}${matches.length > 4 ? ', …' : ''}.`
          : undefined;
      return negate({ kind: 'species', label, gloss, warning }, not);
    }
  }

  return negate(
    {
      kind: 'custom',
      label: raw,
      gloss: `matching “${raw}”`,
      warning: 'Not a keyword PoGoFilter knows. The game treats unknown words as a nickname search.',
    },
    not,
    `not matching “${raw}”`,
  );
}

function joinOr(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')} or ${parts.at(-1)}`;
}

export function describeClause(clause: Clause): string {
  return joinOr(clause.map((t) => describe(t).gloss));
}

/** One sentence per clause, e.g. ["4★ (perfect IVs)", "not shiny", …]. */
export function describeExpr(expr: Expr): string[] {
  return expr.map(describeClause);
}

/** True when the clause only excludes things — a "protect" rule in cleanup filters. */
export function isProtectClause(clause: Clause): boolean {
  return clause.length > 0 && clause.every((t) => t.not);
}
