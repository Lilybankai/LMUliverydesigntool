# LMU Livery Design Tool

React/Vite livery design tool for Le Mans Ultimate.

## Local Development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Car Templates

Each car needs three lossless-WebP assets in `public/lmutemplates/`, registered as one
entry in [src/lib/vehicles.js](src/lib/vehicles.js):

- `<asset>_UV.webp` — 4096², the guide overlay. Drawn at partial opacity in the editor
  and **never exported**.
- `TOP_<asset>.webp` — 4096², the class/series sticker sheet, on transparency. This
  **is** baked into the exported `.tga`.
- `MASK_<vehicleId>.webp` — 2048², white where the car's panels are. Confines the base
  colour to the body instead of flooding the surround. Its path is derived from `id`,
  so it is not listed per entry.

`id` is persisted to `saved_designs.vehicle_id` as free text with no foreign key, and
an unrecognised id silently falls back to the first vehicle — so **never rename an
existing id**.

### Generating templates from the official PSDs

Templates are extracted from the Studio 397 pack that ships with the game:

```
C:\Program Files (x86)\Steam\steamapps\common\Le Mans Ultimate\Support\LiveryTemplates
```

```bash
# inspect a PSD's layer tree without writing anything
node --max-old-space-size=8192 scripts/psd-inspect.mjs Template_LMP2_Oreca07_2025.psd

# extract one car
node --max-old-space-size=8192 scripts/psd-extract.mjs \
  --psd Template_LMP2_Oreca07_2025.psd --name Oreca07LMP2_2025_WEC --series WEC \
  --out public/lmutemplates

# extract everything listed in scripts/templates.manifest.mjs
node scripts/psd-batch.mjs public/lmutemplates

# body-parts masks for every vehicle (includes the 10 hand-made GT3 cars)
node --max-old-space-size=28672 scripts/psd-masks.mjs

# final step: PNG -> lossless WebP, ~55% smaller (74MB -> 34MB)
node scripts/webp-convert.mjs

# check what shipped, from the assets alone - no PSDs needed
npm run audit:assets
npm run test:silhouette
```

The extract/mask scripts write PNG; `webp-convert.mjs` converts and deletes the PNGs,
verifying every file pixel-for-pixel first and keeping the PNG if a check fails. Use
**lossless** only — measured on these assets, lossy WebP shifts hard-edged decals
against transparency by up to 255/255 (which would be baked into exported liveries),
and on the fine 1px UV mesh it is actually *larger* than the PNG.

The check ignores colour behind fully-transparent pixels, which libwebp discards:
that is ~29% of a sticker sheet, none of it visible, and compositing never reads it.
Alpha, and colour anywhere alpha > 0, must match exactly.

Conventions the extractor relies on (verified across the pack, not assumed):

- The UV/wireframe is always the **top-most** layer; its name varies (`UVW`,
  `Wireframe`, `Background`), so it is selected by position.
- `Base` / `Color Fill 1` is the backing colour and is re-rendered white.
- `Mask(Disable for export)` supplies the black surround around the UV islands — it
  belongs in the UV guide but not the sticker sheet.
- `Region` and `Levels *` are authoring scaffolding and are dropped.
- Series plates live under `Number Plates (Don't Move)`, usually shipped hidden;
  `--series WEC|ELMS|LM` picks which subtree to render.

The pack has **no single naming convention** — files disagree on what the base fill is
called (`Base` / `Base Colour` / `Color Fill 1` / a `Car` group), and one even
misspells the mask layer as `Maks(Disable for export)`. Matching is therefore done on
patterns, with genuine one-offs declared per file in
[scripts/templates.manifest.mjs](scripts/templates.manifest.mjs):

- `exclude: ['Car']` — drop a group that would otherwise flood the sticker sheet
  (Ferrari 499P keeps its red paint there; Lamborghini SC63 has a stray
  `Class Stickers copy` plate).
- `silhouette: 'Car Stickers > Michelin > Michelin'` — name the layer carrying the body
  outline, for files with no `Mask(Disable for export)` plate. The extractor reads that
  layer's **mask** first and falls back to its **painted shape** when the mask is not
  the outline. Two files need this, each hiding it differently:

  | Car | Layer | Outline is its |
  |---|---|---|
  | Genesis GMR-001 | `Car Stickers > Michelin > Michelin` | mask (55%) |
  | Ligier JS P325 | `Numplate > Fill layer 1` | painted shape (51%) |

Verify a new override with `scripts/psd-probe-masks.mjs` (mask coverage for every
masked layer) — a body outline typically lands around 40–70%. If nothing shows up
there, the outline may be a fill layer's own pixels with its mask hiding them, as on
the Ligier; `scripts/psd-probe-ligier.mjs` shows how to dump both.

#### The silhouette is cross-checked against the wireframe

The body outline decides both what the guide paints white and what the mask lets you
colour, and a wrong one is nearly invisible: the guide just bakes black over the panels
it dropped, so it reads as a car with a sparse UV layout. The Aston Martin Valkyrie
shipped that way — `region > Region 1` was taken for its outline and is not one (the
`Region` group holds material selectors), so 58% of its texture, including panels the
car's own number plates sit on, came out black and unpaintable.

So the outline is now checked against the mesh before it is used. The wireframe is the
one layer whose meaning never varies between files and it is drawn on exactly the UV
islands, so closing its line work into solid shapes reconstructs the outline
independently (`silhouetteFromWire`). Given a file's authored outline, the extractor:

- **keeps it** when it covers the mesh — every sound template is within a few percent;
- **replaces it with the mesh shape** when it drops more than 15% of the mesh *and*
  sits entirely inside it, which is what a partial outline looks like;
- **keeps it and warns** when the two disagree some other way, since that is a
  different problem and swapping silently would bury it;
- **falls back to the mesh shape** when the file has no usable outline at all.

`npm run test:silhouette` checks both halves without a PSD: it reads the mesh back out
of the shipped guides and measures the reconstruction against those cars' authored
outlines (95–100% recovered, ≤8% over), then runs the decision above over hand-built
layer stacks.

`npm run audit:assets` checks what actually shipped, also without a PSD. It measures
the share of each car's official decals stranded away from its mask — a number plate is
positioned on a body panel, so ink far outside the islands means the outline lost the
panel under it. Sound templates sit at 0–6%; the Valkyrie sits at 37% and fails the
run, and the BMW M Hybrid V8 at 16% is worth a look.

Known limitations:

- Photoshop **layer effects** (drop shadows, strokes, glows) are not reproduced, since
  they are stored as metadata rather than pixels. The extractor prints a `warn` line
  naming every affected layer so they can be checked by eye.
- Material groups (`Carbon`, `Carbon Fibre`, `PARTS`, `plastic`) are dropped from both
  outputs; they vary wildly between files and Porsche 963's covers the whole canvas.

## Supabase Setup

Run [supabase-schema.sql](supabase-schema.sql) in the Supabase SQL Editor before enabling saves/login in production.

Supabase Auth notes:

- Enable the Google provider in Supabase Auth if you want the existing "Sign in with Google" button to work.
- Add your local and production URLs to Supabase Auth redirect URLs.
- The current checkout/paywall flow is not connected to a payment provider yet.

## Coolify Deployment

Use Coolify's static site or Nixpacks flow for this repository.

- Install command: `npm ci`
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 20 or newer

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```
