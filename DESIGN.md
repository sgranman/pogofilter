---
name: PoGoFilter
description: Pokémon GO search strings built as stamp rally cards, then copied and pasted.
colors:
  route-teal: "#0e7f78"
  on-ground: "#ffffff"
  on-ground-soft: "rgb(255 255 255 / 0.84)"
  card-stock: "#ffffff"
  card-stock-tint: "#eef5f4"
  print-navy: "#1d2742"
  print-soft: "#4b5674"
  perforation-rule: "#cfdcdc"
  void-vermilion: "#d23a2f"
  ticket-yellow: "#ffcb3d"
  ticket-yellow-edge: "#d99e00"
  ink-special: "#e8604c"
  ink-stars: "#f2b705"
  ink-number: "#2f4a8a"
  ink-species: "#0e7f78"
  ink-tag: "#8e4ec6"
  ink-slate: "#56637f"
  ink-custom: "#8a8f9c"
typography:
  display:
    fontFamily: "'Dela Gothic One', 'M PLUS Rounded 1c', system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 12vw, 4.25rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Dela Gothic One', 'M PLUS Rounded 1c', system-ui, sans-serif"
    fontSize: "1.7rem"
    fontWeight: 400
    lineHeight: 1.2
  title:
    fontFamily: "'Dela Gothic One', 'M PLUS Rounded 1c', system-ui, sans-serif"
    fontSize: "1.4rem"
    fontWeight: 400
    lineHeight: 1.2
  title-small:
    fontFamily: "'Dela Gothic One', 'M PLUS Rounded 1c', system-ui, sans-serif"
    fontSize: "1.08rem"
    fontWeight: 400
    lineHeight: 1.2
  body:
    fontFamily: "'M PLUS Rounded 1c', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.5
  body-small:
    fontFamily: "'M PLUS Rounded 1c', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.45
  label:
    fontFamily: "'M PLUS Rounded 1c', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "14px"
    fontWeight: 800
    lineHeight: 1.5
  stamp:
    fontFamily: "'M PLUS Rounded 1c', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "15px"
    fontWeight: 800
    lineHeight: 1.1
  code:
    fontFamily: "'M PLUS 1 Code', ui-monospace, 'SFMono-Regular', Menlo, monospace"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  code: "6px"
  ticket-button: "10px"
  field: "14px"
  ticket: "18px"
  card-small: "22px"
  sheet: "26px"
  card: "28px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "22px"
  section: "32px"
components:
  button:
    backgroundColor: "{colors.card-stock}"
    textColor: "{colors.print-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "44px"
  button-ink:
    backgroundColor: "{colors.print-navy}"
    textColor: "{colors.card-stock}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "44px"
  button-yellow:
    backgroundColor: "{colors.ticket-yellow}"
    textColor: "{colors.print-navy}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "44px"
  button-void:
    backgroundColor: "{colors.card-stock}"
    textColor: "{colors.void-vermilion}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "44px"
  copy-ticket:
    backgroundColor: "{colors.ticket-yellow}"
    textColor: "{colors.print-navy}"
    rounded: "{rounded.ticket-button}"
    padding: "0 26px 0 36px"
    height: "56px"
  stamp:
    typography: "{typography.stamp}"
    rounded: "{rounded.pill}"
    padding: "0 15px"
    height: "44px"
  stamp-small:
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "28px"
  pill:
    textColor: "{colors.print-navy}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "42px"
  pill-on:
    backgroundColor: "{colors.print-navy}"
    textColor: "{colors.card-stock}"
    rounded: "{rounded.pill}"
  input:
    backgroundColor: "{colors.card-stock}"
    textColor: "{colors.print-navy}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "8px 12px"
    height: "46px"
  rally-card:
    backgroundColor: "{colors.card-stock}"
    textColor: "{colors.print-navy}"
    rounded: "{rounded.card}"
    padding: "34px 18px 18px"
  suggestion-card:
    backgroundColor: "{colors.card-stock}"
    textColor: "{colors.print-navy}"
    rounded: "{rounded.card-small}"
    padding: "30px 16px 14px"
  saved-ticket:
    backgroundColor: "{colors.card-stock}"
    textColor: "{colors.print-navy}"
    rounded: "{rounded.ticket}"
    padding: "12px 16px"
  note:
    backgroundColor: "{colors.card-stock-tint}"
    textColor: "{colors.print-navy}"
    typography: "{typography.body-small}"
    rounded: "{rounded.field}"
    padding: "10px 12px"
  sheet:
    backgroundColor: "{colors.card-stock}"
    textColor: "{colors.print-navy}"
    rounded: "{rounded.sheet}"
    padding: "0 16px 24px"
  toast:
    backgroundColor: "{colors.print-navy}"
    textColor: "{colors.card-stock}"
    rounded: "{rounded.pill}"
    padding: "10px 10px 10px 18px"
    height: "48px"
---

# Design System: PoGoFilter

## Overview

**Creative North Star: "The Stamp Rally Card"**

Every filter is a rally card a trainer carries along a route. The page is a saturated route-teal ground printed with faint dotted paths and station rings; on it sit white die-cut cards with big rounded corners and a punched lanyard hole. The card's route is a vertical dotted line joining station circles: each station is an AND group, the stamps inked at it are OR terms, and the keep-safe stamps below a perforation are hollow vermilion rings with a strike. The search string is the torn-off stub, pinned in the thumb zone with a sunny yellow ticket for Copy.

The world is chunky, rounded and printed. Stamps are fat pills filled with type inks, tilted a few degrees and roughened at the edge by an SVG ink filter, while their text stays crisp. Navy is the print ink on card stock; white is the print on the ground. Density is phone-first and one-handed: 44px minimum targets everywhere, a single 600px column for the builder, and horizontally snapping suggestion rails on home.

Motion is a single gesture: a stamp landing. A fresh stamp drops in from scale and ink blur to its resting tilt (300ms), and Copy slams a double-ruled "COPIED!" stamp onto the stub (1600ms). Nothing else animates beyond a 1px press.

**Key Characteristics:**
- Route-teal ground with a 240px tiled dotted-route SVG; white card stock on top.
- Pill stamps in type and house inks, tilted per term, ink-filtered edges, crisp labels.
- Protect stamps are a different class: hollow vermilion rings with a ban glyph, never filled.
- Dela Gothic One for names and headings; M PLUS Rounded 1c for UI; M PLUS 1 Code for the string.
- Perforations, scallops and punched holes cut through to the ground, not painted on.
- One motion grammar: the stamp landing.

## Colors

A saturated teal ground, white stock, navy print, one vermilion warning ink, one yellow action, and a full set of Pokémon type inks reserved for stamps.

### Primary
- **Route Teal** (`route-teal`): the page ground under everything, and the color seen through every punched hole, scallop and perforation notch. Dark mode deepens it to `#061a19`.
- **Ticket Yellow** (`ticket-yellow`): the action color. Copy ticket, the primary home button ("Blank card"), the saved-ticket copy tab, how-to step counters, toast actions and text selection. Its dashed tear line is **Ticket Yellow Edge** (`ticket-yellow-edge`). Stays yellow in dark mode.

### Secondary
- **Void Vermilion** (`void-vermilion`): protect/exclude stamps, the keep-safe shield, warning notes (mixed 11% into stock), destructive link buttons and the "COPIED!" slam. Dark mode lifts it to `#ff7366`.

### Tertiary
- **Stamp Inks**: the 18 conventional type colors live in `src/lib/catalog.ts` and are used only as stamp fills. Non-type stamps use the house inks in `src/lib/ink.ts`: Special Coral (`ink-special`), Star Gold (`ink-stars`), Number Navy-Blue (`ink-number`), Species Teal (`ink-species`), Tag Violet (`ink-tag`), Move Slate (`ink-slate`), Custom Grey (`ink-custom`). Label color is computed per ink: navy or white, whichever has higher contrast.

### Neutral
- **Card Stock** (`card-stock`): card, sheet, stub and button faces. Dark mode `#123634`.
- **Stock Tint** (`card-stock-tint`): notes, the stub's string well, segmented-control track, "Reads as" panel, inline code. Dark mode `#18433f`.
- **Print Navy** (`print-navy`): all text and strokes on card stock; filled selected pills and tabs; the toast. Dark mode flips print to `#eaf6f4`.
- **Print Soft** (`print-soft`): glosses, sub-labels, meta counts, ghost stamps. Dark mode `#a8cbc6`.
- **Perforation Rule** (`perforation-rule`): pill and field borders, dashed perforations. Dark mode `#2c5a55`.
- **On Ground** (`on-ground`, `on-ground-soft`): white print directly on the teal ground (wordmark, rail heads, colophon); translucent white fills (12-15%) and borders (45%) make ground-level buttons and the empty-state frame.

### Named Rules
**The Navy-On-Yellow Rule.** Yellow always carries the fixed navy `#1d2742` (the `--navy` constant), in both color schemes. Print ink flips in dark mode; text on yellow does not.

**The Inks Are For Stamps Rule.** Type and house inks fill stamps and nothing else. UI chrome stays in teal, stock, navy, vermilion and yellow.

## Typography

**Display Font:** Dela Gothic One (with M PLUS Rounded 1c, system-ui)
**Body Font:** M PLUS Rounded 1c, weights 500 and 800 only (with system-ui, -apple-system, Segoe UI)
**Label/Mono Font:** M PLUS 1 Code 500 (with ui-monospace, SFMono-Regular, Menlo)

**Character:** A heavy, squat rubber-stamp display face over a soft rounded UI sans; the monospaced code face prints the literal string like a ticket serial.

### Hierarchy
- **Display** (400, clamp(2.5rem, 12vw, 4.25rem), 1): the PoGoFilter wordmark only.
- **Headline** (400, 1.7rem, 1.2): the card's editable name.
- **Title** (400, 1.2-1.4rem, 1.2): home section heads, sheet titles, "Keep safe".
- **Title Small** (400, 1.08rem, 1.2): suggestion card names.
- **Body** (500, 16px, 1.5): default text; ledes at 17px capped near 34ch; prose capped at 52-70ch.
- **Body Small** (500, 13.5-15px, 1.4-1.5): glosses, blurbs, notes, hints.
- **Label** (800, 12.5-15px): buttons, pills, tabs, sub-heads, meta counts, rail heads.
- **Stamp** (800, 15px; 12.5px small, 1.1): stamp labels.
- **Code** (500, 14px, 1.5): the search string, range inputs, IV bars, raw editor.

### Named Rules
**The Display Word-Spacing Rule.** Every use of Dela Gothic One carries `word-spacing: 0.14em` (`--display-spacing`); the face sets words too tight without it.

**The Two Weights Rule.** M PLUS Rounded 1c ships at 500 and 800 only. Weight is either text or label; there is no middle weight.

## Layout

A single centered column: 600px max for the builder and sheets, 1080px for home, 16px side gutters, top padding respecting the safe-area inset. The builder reserves 200px (plus the bottom inset) under the content for the fixed stub, which is 600px wide on phones and 568px past 600px so it aligns with the card edges.

Home stacks a masthead, saved tickets (one column, two at 760px and up), and suggestion rails. Rails are horizontal snap-scrolling tracks of cards at min(76%, 270px), bleeding to the screen edge on phones; from 900px they become an auto-fill grid with 240px minimum columns. Sheets dock to the bottom on phones (88dvh max) and center as dialogs from 700px.

Spacing runs on a loose 4px rhythm: 4/8/12/16/22px within cards, 32-48px between home sections. Stamp groups wrap with 8px row and 6px column gaps.

## Elevation & Depth

Depth is physical card stock lifted off a printed ground. One soft, teal-tinted drop shadow lifts every card, ticket and toast; holes and perforations are cut through to the ground rather than shaded. No hard offset shadows.

### Shadow Vocabulary
- **Card lift** (`box-shadow: 0 14px 30px -14px rgb(3 40 37 / 0.6), 0 2px 4px rgb(3 40 37 / 0.12)`; dark: black at 0.8 / 0.3): rally card, suggestion cards, saved tickets, toast.
- **Yellow button lift** (`box-shadow: 0 6px 14px -6px rgb(3 32 30 / 0.55)`): the primary yellow button on the ground.
- **Stub lift** (`filter: drop-shadow(0 -4px 12px rgb(3 32 30 / 0.3))`): the fixed stub, cast upward.
- **Punched hole** (`box-shadow: inset 0 2px 3px rgb(0 0 0 / 0.35), 0 0 0 1.5px` print at 14%): lanyard holes; ground color fill.

### Named Rules
**The Cut-Through Rule.** Holes, scallops and perforation notches are filled with or masked to the actual ground (teal and its route tile), so they read as holes, not dots.

## Shapes

Everything is rounded. Interactive elements are full pills (999px). Cards take large radii by size: 28px rally card, 26px sheet, 22px suggestion card and stub top, 18px saved ticket, 14px notes and fields, 10-12px string well and ticket button, 6px inline code. Circles mark stations (27px, 3.5px navy ring; stamped stations fill navy, tilt -8deg and take the ink filter) and step counters (32px, tilted -4deg).

Paper geometry carries meaning: dashed lines are perforations and "add" affordances; the dotted line is the route; scalloped edges (CSS masks) mark the torn stub top and the Copy ticket's notched ends. Rotation belongs to stamped things only: stamps tilt -1.8 to +1.8deg from a stable hash of their text.

## Components

### Buttons
Chunky, printed and pill-shaped.
- **Shape:** full pill (999px), 2px border, 44px minimum height; wide variant 52px.
- **Default:** card stock face, navy border and text, 800 weight 15px.
- **Ink / Yellow / Void / Ground:** navy fill with stock text; yellow fill with navy text and soft lift; vermilion outline and text; translucent white on the teal ground.
- **Press:** `translateY(1px)` on active. Disabled is 40% opacity.
- **Icon buttons:** 44px circles, transparent on stock, 12% white on the ground. Link buttons are vermilion underlined text, 44px tall.

### Chips (pills, tabs, segmented)
- **Style:** 2px Perforation Rule border, no fill, label weight 14px, 40-42px tall.
- **State:** selected fills navy with stock text. Quick-pick pills use a dashed border. The segmented control is a Stock Tint track with a navy thumb; its exclude option turns vermilion.

### Cards / Containers
- **Corner Style:** 28px rally card, 22px suggestion card, 18px saved ticket.
- **Background:** Card Stock, navy print.
- **Shadow Strategy:** Card lift (see Elevation).
- **Border:** none; a centered 12px punched lanyard hole near the top of rally and suggestion cards.
- **Internal Padding:** 34px top / 18px sides on the rally card, 30px / 16px on suggestions.

### Inputs / Fields
- **Style:** 2px Perforation Rule border, Card Stock fill, 14px radius, 46px tall, 16px text. Range, raw-string and IV inputs use the code face.
- **Focus:** border turns navy. The card-name field is borderless display type with a 2px dotted underline that appears on focus.
- **Focus ring (global):** 3px solid outline, 2px offset; navy on stock, yellow on the ground.

### Stamp (signature)
A pill with an ink layer behind crisp text. The ink layer takes the `#ink` SVG filter (fractal-noise displacement plus voids) for a rubber edge. Solid stamps fill with their ink plus an inset 4.5px white-at-50% ring; label is navy or white by contrast. Void stamps are hollow: a 2.5px vermilion inset ring, a second 1.5px ring inset 6px, a ban icon, vermilion text. Small stamps (28px) appear on suggestion cards. Fresh stamps play the landing motion.

### Route and Stations
A 3px dotted navy-at-40% vertical line joins station circles; between stations a small uppercase "and" connector (11px, 800, 0.06em) sits on a stock patch; between stamps a lowercase "or". Each station has a print-soft gloss beneath. Add actions are dashed pills.

### Keep-Safe Perforation
A 2px dashed perforation across the card with 22px half-circle notches cut to the ground at both edges; below it, the vermilion shield heading and the void stamps, plus dashed "ghost" pills for unstamped protections.

### Ticket Stub and Copy
The fixed stub has a scalloped top edge (5px radius scallops every 16px), a 22px top radius and an upward drop shadow. It holds a fixed-height (4.5em) Stock Tint well with the mono string, which fades its last line when more is below, and a meta row of tabular counts. Copy is a 56px yellow ticket with notched ends (8px), a dashed yellow-edge tear line and display-face label. On copy, a "COPIED!" stamp in a 4px double vermilion border slams onto the stub.

### Toast
A navy pill at the bottom center (raised above the stub on the builder) with a yellow action pill.

## Do's and Don'ts

### Do:
- **Do** set every name and heading in Dela Gothic One with the 0.14em word spacing, and everything else in M PLUS Rounded 1c at 500 or 800.
- **Do** print literal search strings in M PLUS 1 Code.
- **Do** keep every tappable target at least 44px tall.
- **Do** fill holes, notches and scallops with the real ground so they read as cut-through.
- **Do** give each stamp a stable hashed tilt and apply the ink filter to its ink layer only.
- **Do** compute stamp label color per ink with `inkText()` (navy or white by contrast).
- **Do** reserve the landing motion for stamps arriving and the Copy slam, and honor reduced motion.

### Don't:
- **Don't** fill a protect/exclude stamp; void stamps are always hollow vermilion rings with a ban icon.
- **Don't** apply the `#ink` filter to text; labels stay crisp.
- **Don't** use type or house inks outside stamps.
- **Don't** put print ink on yellow in dark mode; yellow always carries the fixed navy.
- **Don't** add motion beyond the stamp landing, the slam and the 1px press.
- **Don't** use official Pokémon, Niantic or Nintendo artwork, logos or sprites anywhere in the world.
