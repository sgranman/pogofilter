// Suggested starting points. Cleanup presets are deliberately conservative:
// they protect anything a player might plausibly want to keep, and the
// player loosens them on purpose.

export type PresetGroup = 'cleanup' | 'pvp' | 'collect' | 'trade' | 'evolve' | 'battle';

export const PRESET_GROUPS: { id: PresetGroup; label: string; blurb: string }[] = [
  { id: 'cleanup', label: 'Clean up', blurb: 'Find what’s safe to transfer.' },
  { id: 'pvp', label: 'PvP', blurb: 'Battle League candidates.' },
  { id: 'collect', label: 'Collect', blurb: 'Find the good stuff.' },
  { id: 'trade', label: 'Trade', blurb: 'Pick trade fodder.' },
  { id: 'evolve', label: 'Evolve', blurb: 'XP and Pokédex.' },
  { id: 'battle', label: 'Raids', blurb: 'Line up attackers.' },
];

export interface Preset {
  id: string;
  group: PresetGroup;
  name: string;
  blurb: string;
  string: string;
  /** Shown as a caution on the card: this filter is meant for mass transfer. */
  destructive?: boolean;
  tip?: string;
}

/** Everything a cleanup filter should refuse to show. */
export const PROTECT = [
  'shiny', 'lucky', 'legendary', 'mythical', 'ultrabeast', 'shadow', 'purified',
  'costume', 'background', 'dynamax', 'gigantamax', 'fusion', 'adventureeffect',
  'xxl', 'xxs', 'favorite', '4*', '3*', '@special', 'buddy2-5', 'mega1-3', '#',
];

const protect = PROTECT.map((t) => `!${t}`).join('&');

export const PRESETS: Preset[] = [
  {
    id: 'trash-sweep',
    group: 'cleanup',
    name: 'Safe trash sweep',
    blurb: 'Everything that isn’t plausibly valuable.',
    string: protect,
    destructive: true,
    tip: 'Tag or favorite anything you love first. Tagged and favorited Pokémon never show up here.',
  },
  {
    id: 'trash-today',
    group: 'cleanup',
    name: 'Today’s trash',
    blurb: 'Clear out today’s catches after a play session.',
    string: `age0&${protect}`,
    destructive: true,
  },
  {
    id: 'trash-week',
    group: 'cleanup',
    name: 'This week’s trash',
    blurb: 'A weekly tidy of anything caught in the last 7 days.',
    string: `age0-6&${protect}`,
    destructive: true,
  },
  {
    id: 'low-iv',
    group: 'cleanup',
    name: 'Low-IV extras',
    blurb: '0★ and 1★ Pokémon that aren’t special.',
    string: `0*,1*&${protect}`,
    destructive: true,
  },
  {
    id: 'shadow-junk',
    group: 'cleanup',
    name: 'Shadow junk',
    blurb: 'Low-IV Shadows that aren’t rare.',
    string: 'shadow&0*,1*,2*&!shiny&!legendary&!mythical&!ultrabeast&!costume&!xxl&!xxs&!favorite&!#',
    destructive: true,
    tip: 'Some low-IV Shadows are still great attackers. Check the species before you transfer.',
  },
  {
    id: 'great-league',
    group: 'pvp',
    name: 'Great League candidates',
    blurb: 'Low Attack, high Defense and HP, under 1500 CP.',
    string: '0-1attack&3-4defense&3-4hp&cp-1500',
  },
  {
    id: 'ultra-league',
    group: 'pvp',
    name: 'Ultra League candidates',
    blurb: 'Low Attack, high Defense and HP, under 2500 CP.',
    string: '0-1attack&3-4defense&3-4hp&cp-2500',
  },
  {
    id: 'master-league',
    group: 'pvp',
    name: 'Master League hopefuls',
    blurb: 'Near-perfect legendaries and mythicals.',
    string: 'legendary,mythical,ultrabeast&4attack&3-4defense&3-4hp',
  },
  {
    id: 'hundos',
    group: 'collect',
    name: 'Hundos',
    blurb: 'Every perfect-IV Pokémon.',
    string: '4*',
  },
  {
    id: 'nundos',
    group: 'collect',
    name: 'Nundos',
    blurb: 'Perfectly zero IVs. Rarer than hundos.',
    string: '0attack&0defense&0hp',
  },
  {
    id: 'keepers',
    group: 'collect',
    name: 'Keepers to tag',
    blurb: 'Anything special. Tag these before a cleanup.',
    string: 'shiny,lucky,legendary,mythical,ultrabeast,shadow,costume,background,xxl,xxs,4*,dynamax,gigantamax&!#',
    tip: 'Shows special Pokémon that aren’t tagged yet. Select all, tag them, and they’re protected from every cleanup card.',
  },
  {
    id: 'review-week',
    group: 'collect',
    name: 'Untagged this week',
    blurb: 'Recent catches you haven’t sorted yet.',
    string: 'age0-6&!#&!favorite',
  },
  {
    id: 'distance-fodder',
    group: 'trade',
    name: 'Distance trade fodder',
    blurb: 'Caught 100 km+ away: bonus candy when traded.',
    string: 'distance100-&!traded&!shiny&!lucky&!legendary&!mythical&!favorite&!#',
  },
  {
    id: 'lucky-hopefuls',
    group: 'trade',
    name: 'Lucky trade hopefuls',
    blurb: 'Old catches that trade up to Lucky more often.',
    string: 'year2016-2020&!traded&!lucky',
  },
  {
    id: 'trade-evolve',
    group: 'trade',
    name: 'Trade evolutions',
    blurb: 'Evolve for free after a trade.',
    string: 'tradeevolve&!traded',
  },
  {
    id: 'new-dex',
    group: 'evolve',
    name: 'New Pokédex entries',
    blurb: 'Evolutions that register something new.',
    string: 'evolvenew',
  },
  {
    id: 'mass-evolve',
    group: 'evolve',
    name: 'Mass evolve for XP',
    blurb: 'Junk that can evolve now. Pop a Lucky Egg first.',
    string: 'evolve&!evolvenew&!shiny&!lucky&!legendary&!costume&!xxl&!xxs&!favorite&!#&!3*&!4*',
  },
  {
    id: 'not-best-buddy',
    group: 'evolve',
    name: 'Unfinished buddies',
    blurb: 'Buddies that aren’t Best Buddy yet.',
    string: 'buddy1-4',
  },
  {
    id: 'ice-attackers',
    group: 'battle',
    name: 'Ice attackers',
    blurb: 'Strong Ice movesets, for Dragon raids.',
    string: '@1ice&@2ice&cp2000-',
    tip: 'Swap the Ice stamps for any type to build counters for other bosses.',
  },
  {
    id: 'legacy-moves',
    group: 'battle',
    name: 'Legacy moves',
    blurb: 'Pokémon with Community Day or event moves.',
    string: '@special',
  },
];

export const PRESET_BY_ID = new Map(PRESETS.map((p) => [p.id, p]));
