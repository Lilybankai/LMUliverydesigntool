/**
 * Audit the shipped template assets for silhouettes that dropped part of the car.
 *
 * A wrong body outline is close to invisible by eye: the UV guide simply bakes black
 * over the panels it dropped, so the guide looks like a car whose UV layout happens to
 * be sparse, and the mask - built from the same outline - leaves those panels
 * unpaintable in the editor. It only shows up when you know where the panels should be.
 *
 * The car's own decals are that reference. Number plates, Michelin boards and
 * manufacturer wordmarks are positioned on body panels in the official templates, so a
 * sticker stranded away from the mask means the mask lost the panel underneath it.
 * Plates are routinely drawn a little oversize and overhang their island, so only ink
 * further out than TOLERANCE counts. Cars with a sound outline then sit at 0-6%; the
 * Aston Martin Valkyrie shipped at 37%.
 *
 * Runs on public/lmutemplates alone - no PSDs, so it works anywhere.
 *
 * Usage: node scripts/assets-audit.mjs [--size 1024] [--fail-over 20]
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { VEHICLES } from '../src/lib/vehicles.js';

const DIR = join(process.cwd(), 'public', 'lmutemplates');

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? Number(process.argv[i + 1]) : dflt;
};
// Sampled rather than read at 4096: this is a proportion, and it converges long before
// full resolution while staying quick enough to run over the whole pack.
const SIZE = arg('size', 1024);
const FAIL_OVER = arg('fail-over', 20);
/** Sticker overhang allowed past the island edge, in pixels of the sampled canvas. */
const TOLERANCE = arg('tolerance', 8);

/** Binary box dilate via an integral image, so the tolerance costs one pass. */
function dilate(bin, W, H, r) {
  const I = new Uint32Array((W + 1) * (H + 1));
  for (let y = 0; y < H; y++) {
    let row = 0;
    for (let x = 0; x < W; x++) {
      row += bin[y * W + x];
      I[(y + 1) * (W + 1) + x + 1] = I[y * (W + 1) + x + 1] + row;
    }
  }
  const out = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    const y0 = Math.max(0, y - r);
    const y1 = Math.min(H - 1, y + r);
    for (let x = 0; x < W; x++) {
      const x0 = Math.max(0, x - r);
      const x1 = Math.min(W - 1, x + r);
      const sum =
        I[(y1 + 1) * (W + 1) + x1 + 1] -
        I[y0 * (W + 1) + x1 + 1] -
        I[(y1 + 1) * (W + 1) + x0] +
        I[y0 * (W + 1) + x0];
      out[y * W + x] = sum > 0 ? 1 : 0;
    }
  }
  return out;
}

const local = (url) => join(DIR, url.replace('/lmutemplates/', ''));

const plane = async (file, size) =>
  (await sharp(file).resize(size, size).ensureAlpha().raw().toBuffer({ resolveWithObject: true }))
    .data;

const rows = [];
const skipped = [];

for (const v of VEHICLES) {
  const mask = local(v.bodyMask);
  const stickers = v.classStickers ? local(v.classStickers) : null;
  if (!existsSync(mask) || !stickers || !existsSync(stickers)) {
    skipped.push(`${v.id} (missing ${!existsSync(mask) ? 'mask' : 'sticker sheet'})`);
    continue;
  }

  const [m, s] = await Promise.all([plane(mask, SIZE), plane(stickers, SIZE)]);
  const bin = new Uint8Array(SIZE * SIZE);
  let inside = 0;
  for (let i = 0, p = 3; i < bin.length; i++, p += 4) {
    if (m[p] > 127) {
      bin[i] = 1;
      inside++;
    }
  }
  const near = TOLERANCE > 0 ? dilate(bin, SIZE, SIZE, TOLERANCE) : bin;

  let ink = 0;
  let orphan = 0;
  for (let i = 0, p = 3; i < bin.length; i++, p += 4) {
    // Solid sticker pixels only: the sheets are full of soft edges and drop shadows,
    // which straddle the island boundary on every car and would drown the signal.
    if (s[p] > 200) {
      ink++;
      if (!near[i]) orphan++;
    }
  }
  rows.push({
    id: v.id,
    coverage: (100 * inside) / (SIZE * SIZE),
    orphan: ink ? (100 * orphan) / ink : 0,
  });
}

rows.sort((a, b) => b.orphan - a.orphan);

console.log(
  `\nsilhouette audit  (${rows.length} vehicles, sampled at ${SIZE}px, ${TOLERANCE}px overhang allowed)\n`,
);
console.log('  stranded    mask     vehicle');
for (const r of rows) {
  const flag = r.orphan > FAIL_OVER ? 'FAIL' : r.orphan > 10 ? 'warn' : '    ';
  console.log(
    `  ${flag} ${r.orphan.toFixed(1).padStart(5)}%  ${r.coverage.toFixed(1).padStart(5)}%     ${r.id}`,
  );
}
if (skipped.length) {
  console.log('\nskipped:');
  skipped.forEach((s) => console.log(`  ${s}`));
}

const failed = rows.filter((r) => r.orphan > FAIL_OVER);
if (failed.length) {
  console.log(
    `\n${failed.length} template(s) over ${FAIL_OVER}%: the silhouette dropped panels the car ` +
      'is decalled on. Re-extract from the PSD (scripts/psd-batch.mjs + scripts/psd-masks.mjs).',
  );
  process.exit(1);
}
console.log('\nno template drops a panel its own decals sit on.');
