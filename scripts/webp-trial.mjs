/**
 * Measure what WebP would actually cost in fidelity, on the real assets.
 *
 * Encodes a representative sticker sheet (baked into the exported .tga - fidelity
 * matters most here), a UV guide (fine 1px mesh - the hardest case for lossy) and a
 * body mask, then reports size AND exact pixel deviation from the PNG original.
 */
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const DIR = 'C:\\Users\\authe\\Desktop\\LMULIVERYDESIGNTOOL\\public\\lmutemplates';
const OUT = process.env.SCRATCH;

const SAMPLES = [
  ['sticker sheet (EXPORTED)', 'TOP_Ferrari499P_2025.png'],
  ['sticker sheet (EXPORTED)', 'TOP_Oreca07LMP2_2025_WEC.png'],
  ['UV guide (screen only)', 'Oreca07LMP2_2025_WEC_UV.png'],
  ['body mask (screen only)', 'MASK_ferrari_499p_hypercar.png'],
];

const kb = (n) => (n / 1024).toFixed(0).padStart(6) + ' KB';

/** Exact per-pixel comparison against the original RGBA. */
async function deviation(origBuf, encodedBuf) {
  const a = await sharp(origBuf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(encodedBuf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (a.data.length !== b.data.length) return { maxDelta: -1, changed: -1 };

  let maxDelta = 0;
  let changed = 0;
  const px = a.data.length / 4;
  for (let i = 0; i < a.data.length; i += 4) {
    let d = 0;
    for (let k = 0; k < 4; k++) d = Math.max(d, Math.abs(a.data[i + k] - b.data[i + k]));
    if (d > 0) changed++;
    if (d > maxDelta) maxDelta = d;
  }
  return { maxDelta, changed: (100 * changed) / px };
}

for (const [kind, file] of SAMPLES) {
  const src = join(DIR, file);
  const origSize = statSync(src).size;
  const origBuf = await sharp(src).png().toBuffer();
  console.log(`\n${file}   [${kind}]`);
  console.log(`  PNG (current)      ${kb(origSize)}`);

  const variants = [
    ['WebP lossless', { lossless: true, effort: 6 }],
    ['WebP lossy q95', { quality: 95, effort: 6 }],
    ['WebP lossy q80', { quality: 80, effort: 6 }],
  ];

  for (const [label, opts] of variants) {
    const buf = await sharp(src).webp(opts).toBuffer();
    const dev = await deviation(origBuf, buf);
    const saved = (100 * (1 - buf.length / origSize)).toFixed(0);
    const verdict =
      dev.maxDelta === 0
        ? 'IDENTICAL'
        : `max channel shift ${dev.maxDelta}/255 on ${dev.changed.toFixed(1)}% of pixels`;
    console.log(`  ${label.padEnd(18)} ${kb(buf.length)}  (${saved}% smaller)  ${verdict}`);
    if (OUT && label === 'WebP lossy q80') writeFileSync(join(OUT, `q80_${file.replace('.png', '.webp')}`), buf);
  }
}

// Whole-library projection for the lossless option.
let png = 0;
let webp = 0;
for (const f of readdirSync(DIR).filter((f) => f.endsWith('.png'))) {
  png += statSync(join(DIR, f)).size;
  webp += (await sharp(join(DIR, f)).webp({ lossless: true, effort: 6 }).toBuffer()).length;
}
console.log(`\nWHOLE LIBRARY, lossless WebP`);
console.log(`  PNG   ${(png / 1048576).toFixed(1)} MB`);
console.log(`  WebP  ${(webp / 1048576).toFixed(1)} MB   (${(100 * (1 - webp / png)).toFixed(0)}% smaller, pixel-identical)`);
