// Regenerates src/data/species.json from PokeAPI's CSV dumps.
// Run with `npm run species` when new Pokémon are released; the output is
// committed so builds never depend on the network.
import { writeFile } from 'node:fs/promises';

const BASE = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/';
const ENGLISH = '9';

async function csv(name) {
  const res = await fetch(BASE + name);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const [header, ...rows] = (await res.text()).trim().split('\n').map((l) => l.split(','));
  return rows.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

const names = await csv('pokemon_species_names.csv');
const species = names
  .filter((r) => r.local_language_id === ENGLISH)
  .map((r) => ({ n: Number(r.pokemon_species_id), name: r.name }))
  .filter((s) => s.n > 0 && s.n < 10000 && s.name)
  .sort((a, b) => a.n - b.n);

await writeFile(new URL('../src/data/species.json', import.meta.url), JSON.stringify(species) + '\n');
console.log(`wrote ${species.length} species (last: #${species.at(-1).n} ${species.at(-1).name})`);
