# Design Brief — "Chart & Current"

**North star:** A mariner's chart come alive. The San Juan Islands rendered with the
precision of a hand-drawn NOAA nautical chart, the warmth of a WPA national-park
poster, and quiet, respectful nods to Coast Salish design language and island
maritime culture. Every screen should feel like *this place* — the Salish Sea —
and nowhere else. Bar: "site of the day" award quality.

---

## 1 · Inspiration sources

1. **NOAA nautical charts of the Salish Sea** (e.g. chart 18421 / 18434) — the
   backbone aesthetic for all cartography: buff land, pale-teal water,
   graticules and edge ticks, scattered depth soundings in small numerals,
   dashed rhumb/ferry lines, compass roses, letterspaced uppercase hydrographic
   labels that curve along channels ("HARO STRAIT"), double-rule chart frames,
   title cartouches ("SOUNDINGS IN FATHOMS").
2. **WPA / national-park poster school** — flat layered landscapes, stratified
   dusk gradients, silhouette depth stacking, limited confident palette. Drives
   the hero, section dividers, and illustrated vignettes.
3. **Coast Salish design language — abstract homage only.** Ovoids, U-forms,
   crescents, and trigons as *geometric ornament* (border runs, corner marks,
   divider rules) in cedar/char/salmon hues. Keep the existing disclaimer
   visible wherever the motif appears. Never imitate crest figures or creatures,
   never claim authenticity. This is an educational homage, not Indigenous art.
4. **Washington State Ferries** — the white-and-green vessels, dashed route
   lines with a small ferry glyph in motion, terminal-signage typographic
   accents. The islands' circulatory system.
5. **The naturalist's field journal** (Friday Harbor Labs energy) — kraft paper,
   specimen labels, ink stamps, hand annotations, collection checklists. Drives
   wildlife guide, scavenger hunt, quiz results.
6. **Lime Kiln light & maritime instruments** — brass, sweeping beams, Fresnel
   lens geometry, signal flags, ship's telegraph. Drives controls, HUDs, the
   footer horizon.

## 2 · Palette (extends existing tokens — keep those)

```
--chart-paper:#f2e9d8   chart land / card stock      --chart-water:#dcebe7  pale chart sea
--chart-ink:#2b3a42     chart linework               --cedar:#8f4a2e        Coast Salish cedar red
--salmon:#e07a5f        accent warm                  --char:#12181d         formline black / night
--prairie:#d9b45b       Garry-oak prairie gold       --fog:#c9d6d4          morning fog
--brass:#c9a227         instruments / light          --night-water:#081824  deep channel
--wsf-green:#0f5132     ferry green
```

Existing `--sea-*`, `--kelp`, `--madrona`, `--gold` tokens stay and mix with these.

## 3 · Typography

- **Display:** Cormorant Garamond (keep). Tighter leading on hero, optical sizes.
- **Body:** DM Sans (keep).
- **Chart labels / data:** JetBrains Mono or letterspaced DM Sans small-caps.
- Utility class `.chart-label`: uppercase, 0.16–0.2em tracking, 10–12px, muted.

## 4 · Iconography — zero emoji

One inline SVG sprite (`<svg hidden><symbol id="i-…">`) on a 24×24 grid;
1.75px round-cap strokes or solid silhouettes; consistent visual weight.
Needed: fox, orca-fin, orca, ferry, lighthouse, compass, anchor, wave, tide,
kelp, seastar, anemone, urchin, crab, chiton, mussel, barnacle, sculpin, salmon,
heron, eagle, oystercatcher, deer, rabbit, sea-lion, murrelet, bluebird,
oak-leaf, madrona-leaf, seaweed, binoculars, marker, camp, flag, cannon,
microscope, sonar, ship, droplet, star-stamp, check-stamp, arrow.
Helper `SJI.icon(name, cls)` returns `<svg class="icon …"><use href="#i-…"/></svg>`.
**Every emoji currently used as UI must be replaced.** (Find them:
`perl -ne 'print "$ARGV:$.: $_" if /[\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}\x{2B00}-\x{2BFF}]/' index.html js/*.js`)

## 5 · Texture, ornament, structure

- **Paper grain**: subtle SVG-noise data-URI overlay on light sections/cards.
- **Wave pattern**: fine repeating wave-line band (chart style) for rules/edges.
- **Section dividers**: layered SVG bands between sections — (a) wave band,
  (b) landform silhouette band, (c) formline-ornament rule (abstract, with
  disclaimer kept nearby in the map section). Colors bridge the two adjacent
  section backgrounds so the page reads as one continuous shoreline journey.
- **Cards**: paper stock + ink shadow (soft, cool, never default gray blur),
  occasional corner ticks like chart margins.
- **Buttons/chips**: crafted, maritime — e.g. chart-tab shapes with tick marks,
  brass-ring toggles — anything but default rounded pills.

## 6 · Motion — "everything breathes like tide"

Ambient loops 8–24s, `--ease`, transform/opacity only. Fog drifts, water
shimmers, kelp sways, fins surface, the ferry crosses, the lighthouse beam
sweeps. One or two focal motions per viewport, never a carnival. Honor
`prefers-reduced-motion` (freeze ambients, keep functional transitions).

## 7 · Per-section directives

- **Hero** — layered WPA dusk seascape (inline SVG + CSS): stratified sky,
  Olympic range, recognizable island silhouettes (Turtleback ridge, Mt.
  Constitution), shimmering water, drifting fog, surfacing orca fins, a small
  ferry with wake, foreground kelp/madrona frame; gentle scroll parallax.
  Title composition balanced against the illustration; stats as brass/chart
  data blocks.
- **Map** — the crown jewel. Default = stylized **chart view** (full NOAA
  treatment per §1.1, recognizable island shapes, curved water labels, compass
  rose, soundings, animated ferry route, framed cartouche). Leaflet **live
  view** stays as toggle: light tiles, warm chart filter, custom SVG markers
  (no default dots), styled popups, chart frame. Panel = ship's-manifest card.
- **History** — fill the empty right half with a sticky illustrated era vignette
  that crossfades as the timeline scrolls (canoe & reef net → survey ships →
  crossed flags & the pig → ferries & orchards → orca & hydrophone). Redesigned
  markers, richer Pig War scene.
- **Whales** — canvas paints a full strait scene *on load*: bathymetric depth
  shading, land silhouettes, contour lines; pods as dorsal-fin glyphs with
  fading trails; Bigg's distinct; ships glide the lanes; seasonal light shifts;
  instrument-styled HUD; sighting pins glow. No dead space, no flat navy void.
- **Ecology / Tidepools** — replace clip-art with painterly layered SVG:
  textured gradients, underwater god-rays, swaying kelp, darting fish, wet-rock
  speculars, breathing anemones. Side panels always show rich default content.
- **Wildlife** — photo-forward cards and modal (photos exist in
  `assets/photos/wildlife/`), icon type-badges, field-guide flavor.
- **Explore** — topo maps framed as charts, island-silhouette tabs, postcard tips.
- **Lime Kiln** — gallery with brass-plaque captions, light-beam accent.
- **Hunt** — field-journal: kraft card, ink-stamp checkboxes, print-friendly.
- **Discover (quiz)** — nautical instrument card: rotating compass progress,
  signal-flag accents, "ship's log" results with ranks (Deckhand → Keeper of
  the Light).
- **Footer** — illustrated night horizon: lighthouse with sweeping beam, wave
  band, stars; colophon + sources styled as chart legend.

## 8 · Quality bar (what review enforces)

1. Zero emoji-as-UI anywhere. Zero default-looking widgets.
2. No dead voids or empty half-sections at 1440×900 or 390×844.
3. The map reads as a beautiful chart at a glance; islands recognizable.
4. The whale canvas is a painted scene before any interaction.
5. Cohesion: one palette, one type system, dividers stitching sections.
6. Sense of place: a stranger should guess "Pacific Northwest islands" in 3 s.
7. Text contrast ≥ WCAG AA; focus states visible; reduced-motion respected.
8. No console errors; 60fps ambient motion (transform/opacity).

## 9 · Cultural respect guardrails

Coast Salish influence stays abstract and ornamental; keep the existing
disclaimer copy near the formline motif; never generate crest-style creatures;
credit language stays in the footer/README. The history section centers Coast
Salish presence as living culture ("since time immemorial," "continues today")
— keep and honor that copy.
