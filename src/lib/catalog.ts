// Every search keyword PoGoFilter knows, with a plain-English reading.
//
// Compiled from community references in October 2026 and not verified
// in-game by this project. Niantic adds keywords over time: add new ones
// here and they show up in the builder automatically.

export interface Keyword {
  /** Exactly what gets typed into the game. */
  key: string;
  label: string;
  /** Reads naturally after "Pokémon that are…" / "…that". */
  yes: string;
  no: string;
  group: KeywordGroup;
  /** Plausibly valuable: offered as a one-tap "protect" in cleanup filters. */
  valuable?: boolean;
}

export type KeywordGroup = 'special' | 'size' | 'evolve' | 'source' | 'region' | 'gender' | 'other';

export const GROUP_LABELS: Record<KeywordGroup, string> = {
  special: 'Special',
  size: 'Size',
  evolve: 'Evolution',
  source: 'Where it came from',
  region: 'Region',
  gender: 'Gender',
  other: 'Other',
};

const k = (
  key: string,
  label: string,
  yes: string,
  no: string,
  group: KeywordGroup,
  valuable = false,
): Keyword => ({ key, label, yes, no, group, valuable });

export const KEYWORDS: Keyword[] = [
  k('shiny', 'Shiny', 'shiny', 'not shiny', 'special', true),
  k('lucky', 'Lucky', 'lucky', 'not lucky', 'special', true),
  k('legendary', 'Legendary', 'legendary', 'not legendary', 'special', true),
  k('mythical', 'Mythical', 'mythical', 'not mythical', 'special', true),
  k('ultrabeast', 'Ultra Beast', 'Ultra Beasts', 'not Ultra Beasts', 'special', true),
  k('shadow', 'Shadow', 'Shadow', 'not Shadow', 'special', true),
  k('purified', 'Purified', 'Purified', 'not Purified', 'special', true),
  k('costume', 'Costume', 'wearing a costume', 'not wearing a costume', 'special', true),
  k('background', 'Background', 'with a special background', 'without a special background', 'special', true),
  k('dynamax', 'Dynamax', 'able to Dynamax', 'not able to Dynamax', 'special', true),
  k('gigantamax', 'Gigantamax', 'able to Gigantamax', 'not able to Gigantamax', 'special', true),
  k('fusion', 'Fusion', 'fused', 'not fused', 'special', true),
  k('adventureeffect', 'Adventure effect', 'with an adventure effect', 'without an adventure effect', 'special', true),
  k('favorite', 'Favorite', 'favorited', 'not favorited', 'special', true),
  k('defender', 'Gym defender', 'defending a gym', 'not defending a gym', 'other'),

  k('xxs', 'XXS', 'XXS', 'not XXS', 'size', true),
  k('xs', 'XS', 'XS', 'not XS', 'size'),
  k('xl', 'XL', 'XL', 'not XL', 'size'),
  k('xxl', 'XXL', 'XXL', 'not XXL', 'size', true),

  k('evolve', 'Can evolve', 'ready to evolve now', 'not ready to evolve', 'evolve'),
  k('evolvenew', 'New dex entry', 'able to evolve into a new Pokédex entry', 'not a new Pokédex evolution', 'evolve'),
  k('item', 'Needs item', 'evolved with an item', 'not item evolutions', 'evolve'),
  k('tradeevolve', 'Trade evolve', 'free to evolve after a trade', 'not trade evolutions', 'evolve'),
  k('megaevolve', 'Can Mega Evolve', 'with enough energy to Mega Evolve', 'without energy to Mega Evolve', 'evolve'),

  k('hatched', 'Hatched', 'hatched from eggs', 'not hatched', 'source'),
  k('eggsonly', 'Egg-only', 'egg-only species', 'not egg-only species', 'source'),
  k('raid', 'Raid', 'caught in raids', 'not from raids', 'source'),
  k('remoteraid', 'Remote raid', 'caught in remote raids', 'not from remote raids', 'source'),
  k('megaraid', 'Mega raid', 'caught in Mega raids', 'not from Mega raids', 'source'),
  k('exraid', 'EX raid', 'caught in EX raids', 'not from EX raids', 'source'),
  k('primalraid', 'Primal raid', 'caught in Primal raids', 'not from Primal raids', 'source'),
  k('research', 'Research', 'research rewards', 'not research rewards', 'source'),
  k('gbl', 'GO Battle League', 'GO Battle League rewards', 'not GBL rewards', 'source'),
  k('rocket', 'Team GO Rocket', 'caught from Team GO Rocket', 'not from Team GO Rocket', 'source'),
  k('snapshot', 'Photobomb', 'photobomb encounters', 'not from photobombs', 'source'),
  k('traded', 'Traded', 'traded', 'not traded', 'source'),

  k('kanto', 'Kanto', 'from Kanto (Gen 1)', 'not from Kanto', 'region'),
  k('johto', 'Johto', 'from Johto (Gen 2)', 'not from Johto', 'region'),
  k('hoenn', 'Hoenn', 'from Hoenn (Gen 3)', 'not from Hoenn', 'region'),
  k('sinnoh', 'Sinnoh', 'from Sinnoh (Gen 4)', 'not from Sinnoh', 'region'),
  k('unova', 'Unova', 'from Unova (Gen 5)', 'not from Unova', 'region'),
  k('kalos', 'Kalos', 'from Kalos (Gen 6)', 'not from Kalos', 'region'),
  k('alola', 'Alola', 'from Alola (Gen 7)', 'not from Alola', 'region'),
  k('galar', 'Galar', 'from Galar (Gen 8)', 'not from Galar', 'region'),
  k('paldea', 'Paldea', 'from Paldea (Gen 9)', 'not from Paldea', 'region'),

  k('male', 'Male', 'male', 'not male', 'gender'),
  k('female', 'Female', 'female', 'not female', 'gender'),
  k('genderunknown', 'Genderless', 'genderless', 'not genderless', 'gender'),
];

export const KEYWORD_BY_KEY = new Map(KEYWORDS.map((kw) => [kw.key, kw]));

export interface PokeType {
  key: string;
  label: string;
  /** Chip fill; text color is chosen for contrast in `typeInk`. */
  color: string;
}

// Hues follow the series' long-standing type colors, which players read at a glance.
export const TYPES: PokeType[] = [
  { key: 'normal', label: 'Normal', color: '#a8a77a' },
  { key: 'fire', label: 'Fire', color: '#ee8130' },
  { key: 'water', label: 'Water', color: '#6390f0' },
  { key: 'electric', label: 'Electric', color: '#f7d02c' },
  { key: 'grass', label: 'Grass', color: '#7ac74c' },
  { key: 'ice', label: 'Ice', color: '#96d9d6' },
  { key: 'fighting', label: 'Fighting', color: '#c22e28' },
  { key: 'poison', label: 'Poison', color: '#a33ea1' },
  { key: 'ground', label: 'Ground', color: '#e2bf65' },
  { key: 'flying', label: 'Flying', color: '#a98ff3' },
  { key: 'psychic', label: 'Psychic', color: '#f95587' },
  { key: 'bug', label: 'Bug', color: '#a6b91a' },
  { key: 'rock', label: 'Rock', color: '#b6a136' },
  { key: 'ghost', label: 'Ghost', color: '#735797' },
  { key: 'dragon', label: 'Dragon', color: '#6f35fc' },
  { key: 'dark', label: 'Dark', color: '#705746' },
  { key: 'steel', label: 'Steel', color: '#b7b7ce' },
  { key: 'fairy', label: 'Fairy', color: '#d685ad' },
];

export const TYPE_BY_KEY = new Map(TYPES.map((t) => [t.key, t]));

/** Numeric searches: `<prefix><range>`. */
export interface RangeField {
  prefix: string;
  label: string;
  unit?: string;
  min: number;
  max: number;
  hint: string;
}

export const RANGES: RangeField[] = [
  { prefix: 'cp', label: 'CP', min: 10, max: 9999, hint: 'Combat Power' },
  { prefix: 'hp', label: 'HP', min: 1, max: 999, hint: 'Max HP' },
  { prefix: 'age', label: 'Days since caught', unit: 'days', min: 0, max: 4000, hint: '0 = caught today' },
  { prefix: 'year', label: 'Year caught', min: 2016, max: 2030, hint: '2016 onward' },
  { prefix: 'distance', label: 'Distance caught', unit: 'km', min: 0, max: 20000, hint: 'km from where you are now' },
  { prefix: 'buddy', label: 'Buddy level', min: 0, max: 5, hint: '0 never a buddy … 5 Best Buddy' },
  { prefix: 'mega', label: 'Mega level', min: 0, max: 3, hint: '0 never … 3 max' },
];

export const RANGE_BY_PREFIX = new Map(RANGES.map((r) => [r.prefix, r]));

export const STARS = [
  { n: 4, label: '4★', gloss: 'perfect IVs (hundo)' },
  { n: 3, label: '3★', gloss: '82–98% IVs' },
  { n: 2, label: '2★', gloss: '67–80% IVs' },
  { n: 1, label: '1★', gloss: '51–64% IVs' },
  { n: 0, label: '0★', gloss: 'under 51% IVs' },
];

export const IV_STATS = [
  { key: 'attack', label: 'Attack' },
  { key: 'defense', label: 'Defense' },
  { key: 'hp', label: 'HP' },
] as const;

/** What each appraisal bar count means in IV points. */
export const IV_BARS = ['0', '1–5', '6–10', '11–14', '15'];

export const BUDDY_LEVELS = ['never a buddy', 'a buddy with no hearts', 'Good Buddy', 'Great Buddy', 'Ultra Buddy', 'Best Buddy'];

export const MOVE_SLOTS = [
  { slot: '', label: 'Any move' },
  { slot: '1', label: 'Fast move' },
  { slot: '2', label: 'Charged move' },
  { slot: '3', label: '2nd charged move' },
] as const;
