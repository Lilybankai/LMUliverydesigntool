/**
 * Self-test for the wireframe-derived silhouette, without needing a PSD.
 *
 * `silhouetteFromWire` is the fallback that decides what a car's paintable body is
 * when the template's own outline layer is missing or wrong, so it needs to be shown
 * to agree with the outlines that ARE right rather than trusted on the one file that
 * needed it.
 *
 * A shipped guide is white islands + dark mesh on a black surround, so the mesh can be
 * read straight back out of it: dark pixels inside the car are line work. Feeding that
 * to the reconstruction and comparing the result against the same car's shipped mask
 * measures the thing that matters - given only the mesh, how closely is the authored
 * outline recovered?
 *
 * The second half checks the decision `buildSilhouette` makes with that
 * reconstruction in hand - keep the authored outline, replace it, or keep it and warn -
 * against hand-built layer stacks, since the real ones live in 300MB PSDs that only
 * exist on a machine with the game installed.
 *
 * Usage: node --max-old-space-size=8192 scripts/silhouette-selftest.mjs [id ...]
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createCanvas } from '@napi-rs/canvas';
import sharp from 'sharp';
import { buildSilhouette, silhouetteFromWire } from './psd-lib.mjs';
import { VEHICLES } from '../src/lib/vehicles.js';

const DIR = join(process.cwd(), 'public', 'lmutemplates');
const local = (url) => join(DIR, url.replace('/lmutemplates/', ''));

/**
 * Cars whose shipped outline is known-good (the audit puts every one of them at 0%
 * stranded decals) and whose layouts differ enough to be worth testing: dense small
 * islands, big flat panels, and the sparsest mesh in the pack.
 */
const DEFAULT_IDS = ['oreca_07_lmp2_wec', 'ferrari_499p_hypercar', 'lexus_rcf_lmgt3'];

/** The reconstruction has to find essentially all of the car and invent little. */
const MAX_MISS = 8;
const MAX_EXTRA = 8;

const ids = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_IDS;
let failures = 0;

for (const id of ids) {
  const v = VEHICLES.find((x) => x.id === id);
  if (!v) {
    console.log(`SKIP ${id} - not a vehicle id`);
    continue;
  }
  const guide = local(v.uvMap);
  const maskFile = local(v.bodyMask);
  if (!existsSync(guide) || !existsSync(maskFile)) {
    console.log(`SKIP ${id} - assets missing`);
    continue;
  }

  const g = await sharp(guide).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = g.info.width;
  const H = g.info.height;
  const ch = g.info.channels;
  const mask = await sharp(maskFile)
    .resize(W, H, { kernel: 'nearest' })
    .ensureAlpha()
    .raw()
    .toBuffer();

  // Rebuild a wire render from the guide: white line work on black, as the PSD ships.
  const wire = createCanvas(W, H);
  const wctx = wire.getContext('2d');
  const wid = wctx.createImageData(W, H);
  for (let i = 0, p = 0, q = 0; i < W * H; i++, p += ch, q += 4) {
    const lum = g.data[p] * 0.299 + g.data[p + 1] * 0.587 + g.data[p + 2] * 0.114;
    const line = mask[q + 3] > 127 && lum < 200;
    wid.data[q] = wid.data[q + 1] = wid.data[q + 2] = line ? 255 : 0;
    wid.data[q + 3] = 255;
  }
  wctx.putImageData(wid, 0, 0);

  const sil = silhouetteFromWire({ canvas: wire, left: 0, top: 0 }, W, H);
  let hit = 0;
  let miss = 0;
  let extra = 0;
  let truth = 0;
  for (let i = 0, q = 3; i < W * H; i++, q += 4) {
    const got = sil.inside[i] === 1;
    const want = mask[q] > 127;
    if (want) truth++;
    if (got && want) hit++;
    else if (want) miss++;
    else if (got) extra++;
  }
  const pct = (n) => (100 * n) / truth;
  const ok = pct(miss) <= MAX_MISS && pct(extra) <= MAX_EXTRA;
  if (!ok) failures++;
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} ${id.padEnd(24)} ${W}x${H}  ` +
      `recovered ${pct(hit).toFixed(1)}%  missed ${pct(miss).toFixed(1)}%  ` +
      `over ${pct(extra).toFixed(1)}%`,
  );
}

// --- buildSilhouette's decision, on synthetic layer stacks -------------------
const N = 512;
/** Two islands, 43% of the canvas between them. */
const ISLANDS = [
  [40, 40, 220, 300],
  [300, 60, 180, 380],
];

/** A wire render: mesh lines on black, drawn over the islands. */
function wireLayer() {
  const c = createCanvas(N, N);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, N, N);
  ctx.strokeStyle = '#8fbcd4';
  ctx.lineWidth = 1;
  for (const [x, y, w, h] of ISLANDS) {
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    for (let gx = x + 20; gx < x + w; gx += 20) {
      ctx.beginPath();
      ctx.moveTo(gx + 0.5, y);
      ctx.lineTo(gx + 0.5, y + h);
      ctx.stroke();
    }
    for (let gy = y + 20; gy < y + h; gy += 20) {
      ctx.beginPath();
      ctx.moveTo(x, gy + 0.5);
      ctx.lineTo(x + w, gy + 0.5);
      ctx.stroke();
    }
  }
  return { name: 'UVW', canvas: c, left: 0, top: 0 };
}

/**
 * A "Mask(Disable for export)" plate: its Photoshop mask is white over the surround
 * and black over the body, which is why buildSilhouette inverts it.
 */
function surroundPlate(rects) {
  const m = createCanvas(N, N);
  const ctx = m.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, N, N);
  ctx.fillStyle = '#000000';
  for (const [x, y, w, h] of rects) ctx.fillRect(x, y, w, h);
  return {
    name: 'Mask(Disable for export)',
    canvas: createCanvas(N, N),
    left: 0,
    top: 0,
    mask: { canvas: m, left: 0, top: 0, right: N, bottom: N, defaultColor: 255 },
  };
}

const CASES = [
  {
    name: 'sound outline is kept',
    plate: ISLANDS,
    expect: (r) => /^Mask\(Disable for export\)/.test(r.source) && !r.warning,
  },
  {
    name: 'outline missing an island is replaced by the mesh',
    plate: [ISLANDS[0]],
    expect: (r) => r.source.startsWith('wireframe') && r.source.includes('replaces'),
  },
  {
    name: 'outline somewhere else is kept, with a warning',
    plate: [[10, 350, 280, 150]],
    expect: (r) => /^Mask\(Disable for export\)/.test(r.source) && !!r.warning,
  },
  {
    name: 'no outline at all falls back to the mesh',
    plate: null,
    expect: (r) => r.source?.startsWith('wireframe') && r.source.includes('no authored outline'),
  },
];

console.log('');
for (const c of CASES) {
  const children = c.plate ? [surroundPlate(c.plate), wireLayer()] : [wireLayer()];
  const r = buildSilhouette({ children, width: N, height: N }, N, N);
  const ok = !!r && c.expect(r);
  if (!ok) failures++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${c.name.padEnd(46)} -> ${r?.source ?? r?.rejected}`);
  if (r?.warning) console.log(`     warn ${r.warning}`);
}

if (failures) {
  console.log(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('\nwireframe reconstruction tracks the authored outlines, and is chosen only when it should be.');
