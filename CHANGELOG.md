# Changelog

All notable changes to the LMU Livery Design Tool.

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
