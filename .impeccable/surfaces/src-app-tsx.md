---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

# PoGoFilter app shell (home + card builder)

Scope: the whole single-page app, including the home screen (saved cards and suggestion rails) and the stamp-card builder. Visitor mode: **Operate**. One-handed phone use, next to Pokémon GO. The job is to build or pick a filter, copy it, and paste it in-game. Code-led build (no image generation).

## Direction contract

THESIS: Every filter is a Pokémon stamp rally card. The route's stations are AND groups, the stamps inked at one station are OR terms, and the keep-safe stamps are hollow void-red marks. It refuses the category default of a checkbox form above an output textarea.

OWN-WORLD: A saturated route-teal page ground printed with faint dotted route lines. White die-cut cards with big rounded corners and a punched lanyard hole. Navy print ink. Stamps are chunky rounded chips filled with the 18 type inks, slightly rotated with a rough ink edge, and crisp text. Protect stamps are hollow vermilion rings with a strike. Dela Gothic One sets station and card names. M PLUS Rounded 1c is the UI face, and M PLUS 1 Code prints the string. The Copy action is a sunny yellow ticket button.

STORY: A trainer sees suggested cards grouped by job, opens one, and reads in plain English what each station matches. They tap stamps to change or protect them, then tear off the string: Copy, switch apps, paste. They save the card for next time, or share it as a link.

FIRST VIEWPORT (builder, 390px): The card fills the width. It has a name in display type, a vertical dotted route on the left joining station circles, wrapped stamps per station, and a plain-English gloss under each. A "Keep safe" panel sits below with hollow stamps. A perforated ticket stub is fixed in the thumb zone, holding the mono string (fixed height, updates in place), the rule and character count, and a big yellow Copy button. Signature interaction: Copy slams a rubber "COPIED" stamp onto the stub, scaling and sharpening from an ink blur. The same landing motion plays when a stamp is added to the card. There is no other motion.

FORM: Stamp Rally Card, #6 of the grounded list. Seed key f7503760. The raises are a fixed-cell in-place string readout (split-flap), a plain-English gloss per stamp and station (lexicon), suggestion snap-rails grouped by job (streaming wall), and protect versus select as two distinct stamp classes (star atlas).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
