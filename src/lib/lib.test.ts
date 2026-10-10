import { describe as suite, expect, it } from 'vitest';
import { describe, describeExpr, isProtectClause } from './describe';
import { PRESETS } from './presets';
import { readShared, shareUrl } from './share';
import { SPECIES, searchSpecies, speciesTerm } from './species';
import { exportCards, importCards, type SavedCard } from './storage';
import { normalize, parse, parseRange, rangeText, serialize } from './syntax';

suite('syntax', () => {
  it('parses AND of ORs with negation', () => {
    expect(parse('fire&3*,4*&!shiny')).toEqual([
      [{ text: 'fire', not: false }],
      [
        { text: '3*', not: false },
        { text: '4*', not: false },
      ],
      [{ text: 'shiny', not: true }],
    ]);
  });

  it('accepts the alternate operators and tidies whitespace', () => {
    expect(normalize(' fire | water ; ice : grass ,, & ')).toBe('fire&water,ice,grass');
    expect(normalize('!!shiny')).toBe('shiny');
  });

  it('round-trips every preset unchanged', () => {
    for (const p of PRESETS) expect(serialize(parse(p.string))).toBe(p.string);
  });

  it('formats and reads ranges', () => {
    expect(rangeText(null, 1500)).toBe('-1500');
    expect(rangeText(100, null)).toBe('100-');
    expect(rangeText(3, 4)).toBe('3-4');
    expect(rangeText(2, 2)).toBe('2');
    expect(parseRange('-1500')).toEqual({ min: null, max: 1500 });
    expect(parseRange('100-')).toEqual({ min: 100, max: null });
    expect(parseRange('7')).toEqual({ min: 7, max: 7 });
    expect(parseRange('abc')).toBeNull();
    expect(parseRange('-')).toBeNull();
  });
});

suite('describe', () => {
  const d = (text: string, not = false) => describe({ text, not });

  it('reads keywords and their negations', () => {
    expect(d('shiny').gloss).toBe('shiny');
    expect(d('shiny', true).gloss).toBe('not shiny');
    expect(d('Lucky').kind).toBe('keyword');
  });

  it('reads numeric ranges', () => {
    expect(d('cp-1500').gloss).toBe('CP 1500 or less');
    expect(d('cp-1500').label).toBe('CP ≤ 1500');
    expect(d('age0').label).toBe('Today');
    expect(d('age0-6').gloss).toBe('caught in the last 7 days');
    expect(d('age0-6').label).toBe('Last 7 days');
    expect(d('age-13').label).toBe('Last 14 days');
    expect(d('age31-').label).toBe('31+ days ago');
    expect(d('age31-').gloss).toBe('caught 31+ days ago');
    expect(d('age5').label).toBe('5 days ago');
    expect(d('distance100-').gloss).toBe('caught 100 km or more away');
    expect(d('buddy5').gloss).toBe('Best Buddy');
    expect(d('buddy2-5', true).gloss).toBe('not Good Buddy or better');
  });

  it('reads IVs and stars', () => {
    expect(d('4*').kind).toBe('stars');
    expect(d('0-1attack').gloss).toBe('Attack IV 0–5');
    expect(d('3-4hp').gloss).toBe('HP IV 11–15');
    expect(d('4defense').gloss).toBe('Defense IV 15');
  });

  it('tells HP stat ranges from HP IVs', () => {
    expect(d('hp100-').kind).toBe('range');
    expect(d('4hp').kind).toBe('iv');
  });

  it('reads moves, tags, dex numbers and species', () => {
    expect(d('@1fire').gloss).toBe('with a Fire-type fast move');
    expect(d('@special', true).gloss).toBe('without a legacy or event move');
    expect(d('@water gun').gloss).toBe('knowing Water Gun');
    expect(d('#', true).gloss).toBe('untagged');
    expect(d('#pvp').label).toBe('#pvp');
    expect(d('25').label).toBe('Pikachu');
    expect(d('+133').label).toBe('Eevee family');
    expect(d('1-151').gloss).toBe('Pokédex #1–151');
    expect(d('+eevee').label).toBe('Eevee family');
    expect(d('mew').warning).toMatch(/Mewtwo/);
    expect(d('xyzzy').kind).toBe('custom');
  });

  it('describes whole expressions and protect clauses', () => {
    const e = parse('fire,water&!shiny');
    expect(describeExpr(e)).toEqual(['Fire-type or Water-type', 'not shiny']);
    expect(isProtectClause(e[0])).toBe(false);
    expect(isProtectClause(e[1])).toBe(true);
  });

  it('knows every term used by the presets', () => {
    for (const p of PRESETS)
      for (const clause of parse(p.string))
        for (const term of clause) expect(describe(term).kind, `${p.id}: ${term.text}`).not.toBe('custom');
  });
});

suite('species', () => {
  const byName = (n: string) => SPECIES.find((s) => s.name === n)!;

  it('uses names when they are unambiguous', () => {
    expect(speciesTerm(byName('Pikachu'))).toBe('pikachu');
    expect(speciesTerm(byName('Eevee'), true)).toBe('+eevee');
  });

  it('falls back to dex numbers for prefixes and operator characters', () => {
    expect(speciesTerm(byName('Mew'))).toBe('151');
    expect(speciesTerm(byName('Porygon'))).toBe('137');
    expect(speciesTerm(byName('Ho-Oh'))).toBe('250');
    expect(speciesTerm(byName('Type: Null'))).toBe('772');
    expect(speciesTerm(byName('Mr. Mime'), true)).toBe('+122');
  });

  it('offers an exact name before longer ones', () => {
    expect(searchSpecies('mew').map((s) => s.name).slice(0, 2)).toEqual(['Mew', 'Mewtwo']);
    expect(searchSpecies('25')[0].name).toBe('Pikachu');
  });
});

suite('share links', () => {
  it('round-trips through the URL fragment', () => {
    const url = shareUrl({ name: 'Trash & more', string: 'age0&!shiny,!lucky' }, 'https://x.test/');
    expect(url.startsWith('https://x.test/#/new?')).toBe(true);
    expect(readShared(new URL(url).hash)).toEqual({ name: 'Trash & more', string: 'age0&!shiny,!lucky' });
  });

  it('ignores other fragments', () => {
    expect(readShared('#/')).toBeNull();
    expect(readShared('#/new?n=x')).toBeNull();
  });
});

suite('export and import', () => {
  const card = (name: string, string: string): SavedCard => ({ id: name, name, string, createdAt: 1, updatedAt: 1 });

  it('merges without duplicates and with fresh ids', () => {
    const mine = [card('A', 'shiny')];
    const file = exportCards([card('A', 'shiny'), card('B', 'lucky')]);
    const r = importCards(mine, file);
    expect(r.added).toBe(1);
    expect(r.skipped).toBe(1);
    expect(r.cards.map((c) => c.name)).toEqual(['B', 'A']);
    expect(r.cards[0].id).not.toBe('B');
  });

  it('rejects files that are not exports', () => {
    expect(() => importCards([], '{"hello":1}')).toThrow();
  });
});
