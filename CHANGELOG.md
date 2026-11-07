# Changelog

All notable changes to the LMU Livery Design Tool.

## Unreleased — 7 November 2026

### Fixed

- **Ferrari 499P: the nose HYPERCAR tag was stamped twice.** The sticker sheet carried a
  second copy 28px below the first, so the nose read "HYPERR / CARR" with a doubled
  border, and that was baked into every exported `.tga`. Removed from both the sticker
  sheet and the UV guide, keeping the guide's mesh lines.
- **ADESS AD25 LMP3: the purple ELMS number panels were missing.** Restored on both sides
  and on the nose. The side panels follow the plate-shaped holes the UV guide still
  carried; the nose panel uses the Duqueine D09's layout. The body mask had the same holes,
  so the base colour skipped those panels; they are filled now.
- Both repairs are in `scripts/patch-sheets.mjs`. It is idempotent, and before writing it
  checks that nothing outside the repaired areas changed.
- **Extractor:** a masked `Color Fill` layer was dropped as "full-canvas backing" because
  of its bounding box, which always covers the whole document, even when its mask cuts
  it down to a small plate. Coverage is now measured after the mask. This is the suspected
  cause of the missing LMP3 plates, but it can only be confirmed by re-running the
  extraction on the PSDs.

### Known, not yet fixed

- **Ginetta G61 Evo LMP3: purple ELMS panels still missing.** Unlike the ADESS, nothing in
  the shipped assets records where they go: no white strip and no hole in the guide. It
  needs `node scripts/psd-batch.mjs public/lmutemplates ginetta` (then `psd-masks.mjs`
  and `webp-convert.mjs`) on a machine with the game installed.
- **BMW M4 LMGT3: carbon parts are not marked.** Its UV guide predates the extraction
  pipeline and was made by hand, all white, so unlike the other GT3s it does not shade
  the carbon parts, and the base colour covers the whole car. Fixing this needs the
  BMW PSD's carbon layer.

## Unreleased — 21 September 2026

### Added

- **The ELMS 2026 Livery Contest.** A public page at `/elms-contest` (outside the login
  gate, so it can be shared on socials) with the brief, the prize, the four steps to enter,
  the contest and ELMS logo rules, the logo pack and brand guidelines to download, the ELMS
  palette, and a live countdown to the deadline of 6 October 2026, 12:00 CEST. Inside the
  editor: a dismissable banner under the top bar, a one-time announcement for returning
  users, and a sidebar card that, once the ELMS Oreca is selected, offers one-click ELMS and
  LMU logos and the ELMS colours. Everything reads from `src/lib/elmsContest.js` and switches
  itself off after the deadline. The contest car is the existing **Oreca 07 LMP2 (ELMS)**
  entry; the PSD in the media pack is byte-identical to the one already extracted.
- **`?vehicle=<id>` deep links** open the editor on that car. Unknown ids fall back to the
  default.
- **ELMS Orange, ELMS Navy and ELMS LMP2 Blue** in the base colour list.
- **Social card metadata** in `index.html`, currently set to the contest. It is site-wide, so
  it wants swapping back to generic copy once the contest closes.

## Unreleased — 16 September 2026

### Added

- **The GTE class, taking the roster from 34 to 38.** All four GTE cars from the
  official pack: **Aston Martin Vantage GTE**, **Corvette C8.R GTE**, **Ferrari 488
  GTE** and **Porsche 911 RSR GTE**. GTE is a retired, closed category — one template
  per car, no season or series variants — so unlike LMP2 these carry no WEC/ELMS badge,
  and unlike the 2026 cars there is no earlier entry for them to sit alongside. They
  appear under a new **GTE** option in the Class filter, listed last as the oldest
  category in the pack.
- **Five 2026-season cars** extracted in August but not previously released: Ferrari 296
  LMGT3 EVO, Ford Mustang LMGT3 EVO and Porsche 911 GT3 R in LMGT3, Toyota GR010 Hybrid
  and Cadillac V-Series.R EVO in Hypercar. Each is a **new entry alongside** its 2025
  counterpart, so existing designs keep the guide they were drawn on; cars without a new
  template are unchanged for 2026 (confirmed by the LMU dev team).

### Fixed

- **The Aston Martin Valkyrie's guide and mask are rebuilt.** Its outline now comes from
  the wireframe reconstruction rather than the bad `region > Region 1` override that was
  removed earlier: the paintable area goes from 37% of the texture to 69%, the black
  surround from 57% down to 19%, and its stranded-decal figure from a failing 37% to
  1.0%. These are the regenerated assets that change could not ship without a Le Mans
  Ultimate install.

## Unreleased — 10 August 2026

### Fixed

- **Aston Martin Valkyrie template was missing most of the car.** Its guide showed a
  scatter of panels on black and the base colour only reached 42% of the texture, so
  large parts of the car — including panels its own number plates and Michelin boards
  sit on — could not be coloured at all. The extraction pipeline had been pointed at
  `region > Region 1` as the car's body outline; that layer is one material selector
  out of several, not the outline, so every panel outside it was baked black in the
  guide and left out of the mask.

  The outline is now cross-checked against the UV wireframe, which is the one layer in
  the pack whose meaning never varies: an outline that drops a large part of the mesh
  is replaced by the shape reconstructed from the mesh itself, and one that disagrees
  in any other way is kept but reported. Files with no authored outline (the Valkyrie
  now among them) use the reconstruction directly.

  Two checks that need no PSD come with it: `npm run audit:assets` measures how much of
  each car's official decal work is stranded off its mask — the way this bug shows up
  in shipped assets — and `npm run test:silhouette` verifies the reconstruction against
  the templates whose outlines are known good.

  **The corrected Valkyrie assets are not in this commit**: regenerating them needs the
  official PSD from a Le Mans Ultimate install, which no CI or cloud checkout has. Run
  `psd-batch.mjs`, `psd-masks.mjs` and `webp-convert.mjs` on a machine with the game to
  produce them, then `npm run audit:assets` to confirm.

### Added

- **Draw Area tool (freeform selection + fill).** A new **Draw Area** button lets you
  outline any region directly on the car — click to drop points around a shape like a
  door or bonnet, or hold and drag to sketch it freehand — then fill *only* that region
  with a solid colour, a gradient, or any of the existing patterns/textures. The area
  becomes an ordinary layer: reselect it to change its colour or pattern, drag the whole
  shape to move it, drag the blue dots to reshape individual points, and duplicate, lock
  or delete it from the Layers panel. This is the answer to "I want to select an area and
  just change its colour" without having to warp a rectangular pattern to fit.
  - **Pattern transform inside an area.** When you fill a drawn area with a pattern or
    texture you now get independent **Scale**, **Rotation** and **Offset X/Y** controls,
    so you can size and angle the pattern within the area rather than being locked to the
    area's outline — the equivalent of resizing/rotating a normal pattern layer.
- **19 new cars, taking the roster from 10 to 29.** Every class in Le Mans Ultimate is
  now covered.
  - **Hypercar (13)** — Ferrari 499P, Toyota GR010 Hybrid, Porsche 963, Cadillac
    V-Series.R, Peugeot 9X8, BMW M Hybrid V8, Alpine A424, Lamborghini SC63, Aston
    Martin Valkyrie, Genesis GMR-001, Isotta Fraschini Tipo 6, Vanwall Vandervell 680,
    Glickenhaus SCG 007
  - **LMP2 (2)** — Oreca 07 in separate WEC and ELMS specifications
  - **LMP3 (4)** — Ligier JS P325, Duqueine D09, Ginetta G61 Evo, ADESS AD25
- **Class filter.** A new Class dropdown narrows the car list to Hypercar, LMP2, LMP3
  or LMGT3, and jumps to the first car in the class you pick. `All classes` keeps the
  full grouped list.
- **Series colour coding.** WEC entries read blue, ELMS entries amber, each with a
  badge in the car list and the colour carried through to the closed dropdown. LMP2 is
  the only class the official templates split by series — LMP3 is ELMS-only and
  Hypercar is WEC-only, so only those are labelled.
- **Base colour now paints the car, not the canvas.** Each vehicle ships a body-parts
  mask, so changing base colour fills the panels and leaves the surround dark. The
  exported `.tga` is unchanged and still bleeds colour past the island edges, which
  prevents dark fringing where texture filtering samples across UV seams.
- **Template extraction pipeline** (`scripts/`) — reads the official Studio 397 PSDs
  that ship with the game and produces app-ready assets. See the README for the
  layer conventions, the per-file overrides, and the probe scripts used to verify them.

### Changed

- **Vehicle list is grouped by class** (Hypercar / LMP2 / LMP3 / LMGT3) instead of one
  flat list of 29 entries.
- **All template assets converted to lossless WebP: 74.2 MB → 33.6 MB, 55% smaller.**
  Every file was verified pixel-for-pixel before its PNG was removed. Lossy WebP was
  measured and rejected: it shifts hard-edged decals against transparency by up to
  255/255 — which would be baked into exported liveries — and on the fine 1px UV mesh
  it encodes *larger* than the PNG.
- Aston Martin Vantage GT3's class label corrected from `GT3` to `LMGT3`, so it groups
  with the other nine GT3 cars.

### Fixed

- The editor no longer blocks behind a sign-in screen when no Supabase credentials are
  configured, since no login could succeed in that state. Builds with credentials gate
  normally.

### Notes for maintainers

- `id` values are persisted as `saved_designs.vehicle_id` (free text, no foreign key)
  and an unknown id silently falls back to the first vehicle — **never rename an
  existing id**. All 10 original GT3 ids are unchanged, so saved designs are unaffected.
- Adding a car is still a code change: an entry in `src/lib/vehicles.js` plus its three
  assets in `public/lmutemplates/`.
