# PoGoFilter

**Build Pokémon GO storage search strings with taps, save the ones you use, and paste them into the game.**

Live at **https://pogofilter.sgran.net**

Pokémon GO only lets you manage storage through a search bar with a terse, undocumented syntax (`0-1attack&3-4defense&3-4hp&cp-1500`). PoGoFilter turns that syntax into a stamp card:

- **Stations are AND.** Every rule on the card's route must match.
- **Stamps at one station are OR.** Any of them may match.
- **Red hollow stamps are "keep safe".** Anything matching one never shows up. Cleanup cards protect shinies, luckies, legendaries, costumes, backgrounds, XXL/XXS, 3–4★, legacy moves, buddies, tagged and favorited Pokémon, and more.

Every card shows the exact string and a plain-English reading of it. Tap **Copy**, switch to Pokémon GO, and paste the string into the search bar in your Pokémon storage.

## Species sweep (advanced)

When even the safe cleanup leaves thousands of "good" Pokémon, sweep one species or family at a time. Each step has its own search and Copy button, and its station gets stamped when you've done it:

1. Shinies.
2. Backgrounds and costumes.
3. Shadows and purified.
4. XXL and XXS.
5. Hundos.
6. The best 3★s, with two or three perfect stats.
7. PvP IVs.
8. "Transfer the rest".

Each review step shows every match, including last time's keepers, so you can swap in better ones and move your keep tag (`#keep` by default). Only the last step leaves tagged Pokémon out. It also always keeps favorites, luckies, legacy moves, buddies and Mega-evolved Pokémon, and by default anything with any tag. Progress is remembered per species on your device.

Two tricks behind it are also in the stamp picker:

- **Split 3★ by perfect stats.** `3*&4attack,4defense&4attack,4hp&4defense,4hp` means "at least two of three stats are 15".
- **Keep PvP IVs safe.** `!0-1attack,!3-4defense,!3-4hp` means "not low Attack with high Defense and HP". Every cleanup suggestion now includes it.

## Privacy

- **No accounts:** no logins and no cookies.
- **No analytics by default:** the build has no tracking code. A deployment can opt in to anonymous totals, such as "strings copied today", with no ids, cookies or IP addresses kept. pogofilter.sgran.net does, and says so in its footer. See [stats/README.md](stats/README.md).
- **Local storage:** saved cards live in your browser's `localStorage`, on that device only.
- **Share links:** the filter is carried after the `#`, which browsers never send to the server.
- **Backups:** Back up / Restore exports and imports your cards as a JSON file.

## Search syntax cheat sheet

| Write | Means |
| --- | --- |
| `a&b` | a **and** b (also `\|`) |
| `a,b` | a **or** b (also `;` `:`) |
| `!a` | **not** a |
| `cp-1500`, `cp2500-`, `cp1400-1500` | at most, at least, between |
| `+eevee` | the whole evolution family |
| `@1fire`, `@2ice`, `@special` | fast move type, charged move type, legacy move |
| `#`, `!#`, `#pvp` | any tag, no tag, a specific tag |

There are no parentheses. `&` groups everything, so `fire&3*,4*` means fire **and** (3★ **or** 4★). Names match from the start, so `mew` also finds Mewtwo. PoGoFilter writes the Pokédex number in cases like that.

Keywords live in [`src/lib/catalog.ts`](src/lib/catalog.ts) and suggestions in [`src/lib/presets.ts`](src/lib/presets.ts). Niantic adds keywords over time. If one is missing or has stopped working, open an issue or a PR.

## Development

```sh
npm install
npm run dev       # http://localhost:5173
npm test          # parser, descriptions, presets, share links, import/export
npm run build     # static site in dist/, including the service worker
npm run species   # refresh src/data/species.json from PokeAPI
```

The stack is Vite, React and TypeScript, made installable and offline-capable with `vite-plugin-pwa`. The fonts are self-hosted from Fontsource and the icons come from Lucide.

## Deploying

The site is static. To run it on your own machine:

```sh
docker compose up -d --build    # http://localhost:8080
```

The root Dockerfile runs the tests, builds the site, and serves `dist/` with nginx on port 8080. It sends a strict Content-Security-Policy and keeps no access logs.

Production (pogofilter.sgran.net) redeploys itself from `main`. See [deploy/README.md](deploy/README.md).

## Disclaimer

PoGoFilter is fan-made and unofficial. It is not affiliated with Niantic, Nintendo, Creatures, GAME FREAK or The Pokémon Company. Pokémon and Pokémon GO are trademarks of their respective owners. Species names come from [PokeAPI](https://pokeapi.co/).

## License

MIT
