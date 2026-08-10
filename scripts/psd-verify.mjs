/**
 * Verification harness: prove the extraction mapping against a car whose PNGs
 * already ship in the app.
 *
 * Extracts the UV layer and several candidate sticker-group combinations from the
 * Aston Martin GT3 PSD, then pixel-diffs each against public/lmutemplates/*.png.
 * Whichever combination scores near-zero tells us the mapping the original PNGs
 * were made with, which we can then apply to LMP2/LMP3/Hypercar.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { loadPsd, topLayer, composite, findGroup } from './psd-lib.mjs';

const TEMPLATES =
  'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Le Mans Ultimate\\Support\\LiveryTemplates';
const SHIPPED = 'C:\\Users\\authe\\Desktop\\LMULIVERYDESIGNTOOL\\public\\lmutemplates';
const OUT = process.env.SCRATCH || 'C:\\Users\\authe\\AppData\\Local\\Temp\\claude\\psdverify';

const W = 4096;
const H = 4096;

/** Mean absolute per-channel difference + share of pixels differing by >8. */
async function diff(pathA, pathB) {
  const [a, b] = await Promise.all([loadImage(pathA), loadImage(pathB)]);
  const ca = createCanvas(W, H);
  ca.getContext('2d').drawImage(a, 0, 0, W, H);
  const cb = createCanvas(W, H);
  cb.getContext('2d').drawImage(b, 0, 0, W, H);
  const da = ca.getContext('2d').getImageData(0, 0, W, H).data;
  const db = cb.getContext('2d').getImageData(0, 0, W, H).data;

  let sum = 0;
  let bad = 0;
  const n = W * H;
  for (let i = 0; i < da.length; i += 4) {
    const d =
      Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
    const dA = Math.abs(da[i + 3] - db[i + 3]);
    sum += d / 3 + dA;
    if (d / 3 > 8 || dA > 8) bad++;
  }
  return { meanDiff: (sum / n).toFixed(3), pctPixelsDiffer: ((100 * bad) / n).toFixed(2) };
}

const psdFile = join(TEMPLATES, 'Template_GT3_AstonMartinVantage_2025.psd');
console.log(`Reading ${psdFile} ...`);
const psd = loadPsd(psdFile);
const roots = psd.children ?? [];

// --- 1. UV layer: top-most layer, whatever it is called -----------------------
const uv = topLayer(psd);
console.log(`Top layer detected: "${uv.name}" (hidden=${!!uv.hidden}, blend=${uv.blendMode})`);
{
  const c = createCanvas(W, H);
  c.getContext('2d').drawImage(uv.canvas, uv.left ?? 0, uv.top ?? 0);
  writeFileSync(join(OUT, 'aston_UV.png'), c.toBuffer('image/png'));
}

// --- 2. Sticker sheet candidates ---------------------------------------------
const candidates = {
  class_only: ['Class Stickers'],
  class_plus_car: ['Class Stickers', 'Car Stickers'],
  class_car_plates_LM: ['Class Stickers', 'Car Stickers', 'Number Plates (Don\'t Move)>LM'],
  class_car_plates_WEC: ['Class Stickers', 'Car Stickers', 'Number Plates (Don\'t Move)>WEC'],
};

for (const [label, groups] of Object.entries(candidates)) {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  const warnings = [];
  for (const spec of groups) {
    const [outer, inner] = spec.split('>');
    let node = findGroup(roots, outer);
    if (inner) node = findGroup(node ? [node] : [], inner);
    if (!node) {
      console.log(`  ! group not found: ${spec}`);
      continue;
    }
    composite(ctx, node.children ?? [], W, H, { force: true, warnings });
  }
  writeFileSync(join(OUT, `aston_TOP_${label}.png`), c.toBuffer('image/png'));
  if (warnings.length) console.log(`  (${label}) ${warnings.length} FX layers not reproduced`);
}

// --- 3. Diff against the shipped assets ---------------------------------------
console.log('\nDIFF vs shipped UV:');
console.log('  ', await diff(join(OUT, 'aston_UV.png'), join(SHIPPED, 'AstonMartinVantage_2025_UV.png')));

console.log('\nDIFF vs shipped TOP (lower is better):');
for (const label of Object.keys(candidates)) {
  const r = await diff(
    join(OUT, `aston_TOP_${label}.png`),
    join(SHIPPED, 'TOP_GT3_AstonMartinVantage_2025.png'),
  );
  console.log(`  ${label.padEnd(24)} meanDiff=${r.meanDiff}  differ=${r.pctPixelsDiffer}%`);
}
