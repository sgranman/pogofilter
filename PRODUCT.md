# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: Vite + React + TypeScript, built to a static site with no backend, and installable as a PWA (vite-plugin-pwa). It is served by an nginx container on the owner's home server (sgran-ubuntu) behind a Cloudflare Tunnel at https://pogofilter.sgran.net. The repo is public on GitHub.

## Users

Any Pokémon GO player, including many who have never typed a search string. They are on their phone, next to the game. The loop is: build or pick a filter, copy it, switch to Pokémon GO, paste it into the storage search bar, and act on the results (mass transfer, trade, evolve, tag). They often use it one-handed and quickly, between other things.

## Product Purpose

Pokémon GO only manages storage through a text search bar with a terse, undocumented filter syntax. PoGoFilter turns that syntax into controls and plain-English descriptions. The player builds a correct filter string without memorizing keywords, keeps the ones they reuse, and pastes them into the game. Success means the right Pokémon show up in the game on the first paste, and the player never transfers something they wanted to keep.

## Positioning

PoGoFilter is a builder, not a cheat sheet. The player starts from a suggested filter or from scratch, adjusts it with controls, and sees the exact string plus a plain-English reading of what it will match. Nothing is required: there are no accounts and no server-side data.

## Operating Context

- **Pasting:** players paste into the Pokémon GO storage search on iOS and Android, so the copy-to-clipboard step is the critical action.
- **Search syntax:**
  - `&` is AND and splits the string into groups.
  - `,` is OR within a group.
  - `!` negates the next term.
  - `-` makes ranges, and `+` matches an evolution family.
  - There are no parentheses.
  - Names match by prefix, so `mew` also matches Mewtwo.
  - The keywords are English only here, because the game localizes them.
- **Changing keywords:** Niantic adds keywords over time, so the catalog must be easy to update.

## Capabilities and Constraints

- **Privacy:** no logins, accounts, or personal data. Nothing about a player's filters is ever sent to the server.
- **Optional usage counts:** a deployment can opt in at build time (`VITE_STATS=1`, see stats/README.md). It then records anonymous daily totals of events such as cards saved, strings copied and suggestions opened. No ids, cookies, IPs or card contents are kept, and the footer says so. pogofilter.sgran.net opts in; the open-source default is off.
- **Saved filters:** stored in the browser's localStorage, per device.
- **Portability:**
  - Share links carry the filter in the URL #fragment, which never reaches the server.
  - A JSON export and import serves as a backup.
- **Suggested filters:** starting points for common jobs, such as clearing trash, PvP candidates, trade fodder, and hundos. Every one can be customized.
- **Building from scratch:** UI controls, plus editing the raw string directly. Raw strings round-trip into the controls where possible.
- **Offline:** the app works offline once installed.

## Brand Commitments

- **Name:** PoGoFilter, served at pogofilter.sgran.net.
- **No official assets:** no official Pokémon, Niantic, or Nintendo artwork, logos, or sprites. Species names are fine.
- **Unofficial:** the site must not imply it is official, and carries a clear fan-made disclaimer.

## Evidence on Hand

- **Species list:** the 1025 English species names and dex numbers in `src/data/species.json`, generated from PokeAPI's CSV data by `scripts/build-species.mjs`.
- **Keyword catalog:** compiled from community references in October 2026. Nothing has been verified in-game by the project.
- **No social proof:** there are no testimonials, user counts, or endorsements, and none may be invented.

## Product Principles

1. **Never cost a player a Pokémon.** Cleanup presets are very conservative and protect anything plausibly valuable by default. The player loosens them deliberately, and destructive intent always comes with a plain warning.
2. **Show what it means.** Every filter shows the exact string and a plain-English reading of it.
3. **Copy is the hero.** The path from opening the app to having the string on the clipboard is as short as possible on a phone.
4. **Teach without gatekeeping.** Beginners get labels and explanations, and experienced players can edit the raw string directly.
5. **Private by construction.** No accounts and nothing personal on the server. Any counting is anonymous, aggregate, opt-in per deployment, and disclosed.

## Accessibility & Inclusion

- **Touch targets:** at least 44px, because people use it one-handed on a phone.
- **No color-only meaning:** type chips keep their text labels.
- **Contrast and motion:** text meets WCAG AA contrast, and the app respects reduced motion.
