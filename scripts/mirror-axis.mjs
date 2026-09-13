/**
 * Measure each car's mirror axis - the line in the texture about which the two flanks
 * of the car reflect onto each other.
 *
 * An LMU livery is a texture, not a picture: the body panels are unwrapped and scattered
 * across the sheet, so the driver's side and the passenger's side land in two separate
 * places. Anything that paints the sheet without knowing where that pair sits - an image
 * model especially - designs the two sides independently, and they come out different.
 * That is the "same design on both sides" problem.
 *
 * The pairs are laid out as a horizontal mirror, so the axis is recoverable from the
 * mask alone: reflect the mask about every candidate row and keep the row where it best
 * lands on itself (intersection over union). Every car in the pack scores 0.66-0.94.
 *
 * The score is a symmetry measure, not a confidence: the missing share is the genuinely
 * one-sided geometry - driver's window, fuel filler, exhaust exit, and the top-down
 * bonnet islands, which mirror about their own local line rather than this one. So the
 * axis is a default to mirror layers about, not a transform to apply to a finished
 * texture. The Mercedes-AMG (0.658) is the one worth checking by eye.
 *
 * Cross-checked against an independent signal: optimising the axis from the official
 * decal sheets (TOP_*.webp, which carry the real WEC door and quarter plates) instead of
 * the mask recovers the same axis - to the pixel on the Ferrari 296 and BMW M4, and
 * within one pixel on the Alpine A424. Pass --decals to re-run that check.
 *
 * Runs on public/lmutemplates alone - no PSDs, so it works anywhere.
 *
 * Usage: node scripts/mirror-axis.mjs [--size 384] [--decals] [--json]
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
const flag = (name) => process.argv.includes(`--${name}`);

// Sampled rather than read at 4096: the axis is a proportion and converges well before
// full resolution, while the search stays O(size^3) and has to run over the whole pack.
const SIZE = arg('size', 384);
// Candidate rows are confined to the middle of the sheet. An axis out at the very edge
// reflects almost nothing onto anything and scores as noise.
const MARGIN = 0.15;

/**
 * Best horizontal mirror axis for a binary image, as a fraction of height.
 * Rows outside the reflected image are skipped rather than counted as misses, so a
 * near-edge axis is not penalised for the part of the sheet it cannot reach.
 */
function bestAxis(bin, size) {
  let best = 0;
  let bestRow = size / 2;
  for (let axis = Math.round(size * MARGIN); axis < size * (1 - MARGIN); axis++) {
    let intersection = 0;
    let union = 0;
    for (let y = 0; y < size; y++) {
      const mirrored = 2 * axis - y;
      if (mirrored < 0 || mirrored >= size) continue;
      const row = y * size;
      const mirroredRow = mirrored * size;
      for (let x = 0; x < size; x++) {
        const a = bin[row + x];
        const b = bin[mirroredRow + x];
        if (a | b) union++;
        if (a & b) intersection++;
      }
    }
    const score = union ? intersection / union : 0;
    if (score > best) {
      best = score;
      bestRow = axis;
    }
  }
  return { axis: bestRow / size, score: best };
}

/** The mask is white on the car's panels: threshold luminance. */
async function maskBitmap(file, size) {
  const raw = await sharp(file).resize(size, size, { fit: 'fill' }).greyscale().raw().toBuffer();
  const bin = new Uint8Array(size * size);
  for (let i = 0; i < bin.length; i++) bin[i] = raw[i] > 127 ? 1 : 0;
  return bin;
}

/** The decal sheet is ink on transparency: threshold alpha instead. */
async function decalBitmap(file, size) {
  const raw = await sharp(file)
    .resize(size, size, { fit: 'fill' })
    .ensureAlpha()
    .extractChannel(3)
    .raw()
    .toBuffer();
  const bin = new Uint8Array(size * size);
  for (let i = 0; i < bin.length; i++) bin[i] = raw[i] > 40 ? 1 : 0;
  return bin;
}

const rows = [];
for (const vehicle of VEHICLES) {
  const maskPath = join(DIR, `MASK_${vehicle.id}.webp`);
  if (!existsSync(maskPath)) {
    console.warn(`warn  ${vehicle.id}: no mask at ${maskPath}`);
    continue;
  }
  const { axis, score } = bestAxis(await maskBitmap(maskPath, SIZE), SIZE);
  const row = { id: vehicle.id, name: vehicle.name, class: vehicle.class, axis, score };

  if (flag('decals')) {
    const sheet = join(DIR, vehicle.classStickers.replace(/^\/lmutemplates\//, ''));
    if (existsSync(sheet)) {
      const fromDecals = bestAxis(await decalBitmap(sheet, SIZE), SIZE);
      row.decalAxis = fromDecals.axis;
      // Agreement in pixels of the sampled canvas - this is the number that matters,
      // not the decal IoU, which is legitimately lower because plenty of plates
      // (windscreen banner, roof number, bonnet boards) are one-sided by design.
      row.decalDeltaPx = Math.abs(fromDecals.axis - axis) * SIZE;
    }
  }
  rows.push(row);
}

if (flag('json')) {
  console.log(JSON.stringify(rows, null, 2));
} else {
  const head = ['vehicle', 'class', 'mirrorAxisY', 'symmetry'];
  if (flag('decals')) head.push('decalAxis', 'agree(px)');
  console.log(head[0].padEnd(30) + head[1].padEnd(10) + head.slice(2).join('  '));
  for (const r of rows) {
    let line =
      r.name.padEnd(30) +
      String(r.class).padEnd(10) +
      r.axis.toFixed(4).padEnd(13) +
      r.score.toFixed(3);
    if (flag('decals') && r.decalAxis !== undefined) {
      line += '   ' + r.decalAxis.toFixed(4).padEnd(10) + r.decalDeltaPx.toFixed(1);
    }
    console.log(line);
  }
  const weakest = rows.reduce((a, b) => (a.score < b.score ? a : b));
  console.log(
    `\n${rows.length} vehicles. Weakest symmetry: ${weakest.name} at ${weakest.score.toFixed(3)}.`,
  );
}
