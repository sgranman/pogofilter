import { describe as suite, expect, it } from 'vitest';
import { describe } from './describe';
import { clauseKey, guardGloss, guardLabel, isGuard } from './guards';
import { PRESET_BY_ID, PROTECT } from './presets';
import { SPECIES } from './species';
import { cleanTag, sweepSteps, targetFor, targetFromTerm } from './sweep';
import { parse } from './syntax';

const byName = (n: string) => SPECIES.find((s) => s.name === n)!;

suite('keep-safe guards', () => {
  it('names the PvP combination and reads it plainly', () => {
    const [c] = parse('!0-1attack,!3-4defense,!3-4hp');
    expect(isGuard(c)).toBe(true);
    expect(clauseKey(c)).toBe('!0-1attack,!3-4defense,!3-4hp');
    expect(guardLabel(c)).toBe('PvP IVs');
    expect(guardGloss(c)).toMatch(/low Attack, high Defense and HP/);
  });

  it('reads unnamed combinations as "all of these"', () => {
    const [c] = parse('!4attack,!4defense');
    expect(guardLabel(c)).toBe('Attack 4★ + Defense 4★');
    expect(guardGloss(c)).toBe('(Attack IV 15 and Defense IV 15)');
  });

  it('protects PvP IVs in every conservative cleanup', () => {
    expect(PROTECT).toContain('!0-1attack,!3-4defense,!3-4hp');
    expect(PRESET_BY_ID.get('trash-sweep')!.string.endsWith('&!0-1attack,!3-4defense,!3-4hp')).toBe(true);
    for (const k of PROTECT) expect(isGuard(parse(k)[0]), k).toBe(true);
  });
});

suite('species sweep', () => {
  const opts = { tag: 'keep', protectAllTags: true };

  it('builds every step around the species term', () => {
    const steps = sweepSteps(targetFor(byName('Eevee'), true), opts);
    expect(steps).toHaveLength(8);
    for (const s of steps) expect(s.string.startsWith('+eevee&'), s.id).toBe(true);
    expect(steps.find((s) => s.id === 'top3')!.string).toBe('+eevee&3*&4attack,4defense&4attack,4hp&4defense,4hp');
  });

  it('review steps never hide keepers; only the final step does', () => {
    const steps = sweepSteps(targetFor(byName('Pikachu'), false), { tag: 'keep', protectAllTags: false });
    for (const s of steps.filter((x) => !x.final)) expect(s.string, s.id).not.toContain('#');
    const rest = steps.at(-1)!;
    expect(rest.final).toBe(true);
    expect(rest.string).toBe('pikachu&!#keep&!favorite&!lucky&!@special&!buddy2-5&!mega1-3');
    expect(sweepSteps(targetFor(byName('Pikachu'), false), opts).at(-1)!.string.startsWith('pikachu&!#&')).toBe(true);
  });

  it('every step string is made of terms PoGoFilter understands', () => {
    for (const s of sweepSteps(targetFor(byName('Mew'), false), opts))
      for (const clause of parse(s.string))
        for (const t of clause) expect(describe(t).kind, `${s.id}: ${t.text}`).not.toBe('custom');
  });

  it('round-trips targets through the route and cleans tag names', () => {
    expect(targetFromTerm('+eevee')).toMatchObject({ family: true, term: '+eevee' });
    expect(targetFromTerm('151')!.species.name).toBe('Mew');
    expect(targetFromTerm('nope')).toBeNull();
    expect(cleanTag(' ##My Keep,s! ')).toBe('My Keeps');
    expect(cleanTag('')).toBe('keep');
  });
});
