// Species sweep: an advanced workflow for paring back one Pokémon at a time.
//
// The game can't count or rank, so "keep the best few of each special kind"
// becomes a route of searches. Each review step shows *every* match for the
// species, including ones tagged last time, so keepers can be compared with
// newcomers and swapped. Only the final step leaves the keep tag out.

import { speciesByNumber, SPECIES, speciesTerm, type Species } from './species';

export interface SweepTarget {
  species: Species;
  family: boolean;
  /** What gets typed into the game: `eevee`, `+eevee`, `151`, `+133`. */
  term: string;
}

export interface SweepOptions {
  tag: string;
  /** Final step also keeps anything with *any* tag (your other tags). */
  protectAllTags: boolean;
}

export interface SweepStep {
  id: string;
  title: string;
  tip: string;
  string: string;
  final?: boolean;
}

export const DEFAULT_OPTIONS: SweepOptions = { tag: 'keep', protectAllTags: true };

/** Always safe in the final step: things a sweep shouldn't decide. */
export const FINAL_GUARDS = ['!favorite', '!lucky', '!@special', '!buddy2-5', '!mega1-3'];

export function targetFor(species: Species, family: boolean): SweepTarget {
  return { species, family, term: speciesTerm(species, family) };
}

/** Reads a target back from its term (the route), e.g. `+eevee` or `151`. */
export function targetFromTerm(term: string): SweepTarget | null {
  const family = term.startsWith('+');
  const bare = (family ? term.slice(1) : term).toLowerCase();
  const species = /^\d+$/.test(bare) ? speciesByNumber(Number(bare)) : SPECIES.find((s) => s.name.toLowerCase() === bare);
  return species ? targetFor(species, family) : null;
}

export function cleanTag(tag: string): string {
  return tag.trim().replace(/^#+/, '').replace(/[&|,;:!]/g, '').slice(0, 30) || 'keep';
}

export function sweepSteps(t: SweepTarget, o: SweepOptions): SweepStep[] {
  const sp = t.term;
  const tag = `#${cleanTag(o.tag)}`;
  const review = `Sort by CP and compare. Tag the ones worth keeping ${tag}, and untag any that a better one replaces.`;
  return [
    { id: 'shiny', title: 'Shinies', tip: review, string: `${sp}&shiny` },
    { id: 'special', title: 'Backgrounds & costumes', tip: review, string: `${sp}&background,costume&!shiny` },
    { id: 'shadow', title: 'Shadows & purified', tip: review, string: `${sp}&shadow,purified&!shiny` },
    { id: 'size', title: 'XXL & XXS', tip: review, string: `${sp}&xxl,xxs&!shiny&!background&!costume` },
    {
      id: 'hundo',
      title: 'Hundos',
      tip: `Most people keep every one. Tag them ${tag} so the last step leaves them alone.`,
      string: `${sp}&4*`,
    },
    {
      id: 'top3',
      title: 'Best 3★ (two perfect stats)',
      tip: `The top of the 3★ band, 91–98%. Tag the few you want ${tag}. The rest of your 3★s go in the last step.`,
      string: `${sp}&3*&4attack,4defense&4attack,4hp&4defense,4hp`,
    },
    {
      id: 'pvp',
      title: 'PvP IVs',
      tip: `Low Attack, high Defense and HP. Sort by CP and tag the best for each league you play ${tag}.`,
      string: `${sp}&0-1attack&3-4defense&3-4hp`,
    },
    {
      id: 'rest',
      title: 'Transfer the rest',
      tip: `Everything untagged, including shinies and 3★s you passed over. Favorites, luckies, legacy moves, buddies and Mega-evolved stay out${
        o.protectAllTags ? ', and so does anything with any tag' : ''
      }. Scroll the list before you transfer. It can’t be undone.`,
      string: [sp, o.protectAllTags ? '!#' : `!${tag}`, ...FINAL_GUARDS].join('&'),
      final: true,
    },
  ];
}

export const STEP_COUNT = 8;

// ---- Progress, per species, on this device ---------------------------------

export interface SweepRecord {
  term: string;
  label: string;
  done: string[];
  at: number;
}

interface SweepState {
  options: SweepOptions;
  sweeps: Record<string, SweepRecord>;
}

const KEY = 'pogofilter:sweep:v1';

export function loadSweeps(): SweepState {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (raw && typeof raw === 'object') {
      return {
        options: { ...DEFAULT_OPTIONS, ...(raw.options ?? {}) },
        sweeps: raw.sweeps && typeof raw.sweeps === 'object' ? raw.sweeps : {},
      };
    }
  } catch {
    // Fall through to a fresh state.
  }
  return { options: DEFAULT_OPTIONS, sweeps: {} };
}

export function saveSweeps(s: SweepState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Progress is a convenience; losing it never blocks a sweep.
  }
}

export function targetLabel(t: SweepTarget): string {
  return t.family ? `${t.species.name} family` : t.species.name;
}
