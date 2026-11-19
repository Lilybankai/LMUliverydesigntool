/**
 * Targeted, pixel-level repairs to shipped sticker sheets, for defects that can be
 * fixed from the shipped assets alone (no PSD). Each repair is idempotent: it checks
 * the defect is still present before touching anything, so re-running is a no-op.
 *
 *   node scripts/patch-sheets.mjs            # apply
 *   node scripts/patch-sheets.mjs --dry      # report only
 *
 * Output is lossless WebP, written only after a read-back confirms every pixel
 * outside the repaired regions is unchanged.
 *
 * If a car is re-extracted from its PSD, its entry here should be re-checked (and
 * will normally report "already clean" and skip).
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const DIR = join(process.cwd(), 'public', 'lmutemplates');
const DRY = process.argv.includes('--dry');

async function load(file) {
  const { data, info } = await sharp(join(DIR, file)).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  return { d: Buffer.from(data), W: info.width, H: info.height };
}

/** The ELMS plate purple, sampled from the Duqueine D09 sheet (37k identical px). */
const ELMS_PURPLE = [109, 44, 118];

// ---------------------------------------------------------------------------------
// Ferrari 499P - the nose HYPERCAR tag is stamped twice, the second copy 28px below
// the first and drawn underneath it, so it peeks out as "HYPERR / CARR" and a second
// bottom border. Rows 3155-3166 and 3183-3194 are byte-identical, which pins the
// offset exactly. Repair: the top copy's own bottom rows (hidden under its border
// overlap) are restored from the matching rows of the lower copy, which are an exact
// duplicate, then everything of the lower copy below that is cleared.
//
// The UV guide has the same stickers baked in under its mesh, so it is repaired in
// the same pass. Its mesh is multiplied over the stickers (grey 57 over white, 53/11/10
// over red), so per pixel the mesh factor is guide / (old sticker over white), and the
// repaired guide is (new sticker over white) * that factor - the mesh lines survive.
// ---------------------------------------------------------------------------------
async function ferrari499pNoseTag() {
  const file = 'TOP_Ferrari499P_2025.webp';
  const img = await load(file);
  const { d, W } = img;
  const X0 = 945, X1 = 1063;          // tag columns (tag spans 951-1060)
  const TOP = 3044, DY = 28;          // top copy starts at 3044; lower copy +28
  const A_END = 3178;                 // last row of the top copy (lower copy ends 3206)
  const B_END = A_END + DY;

  const rowEq = (ya, yb) => {
    for (let x = X0; x < X1; x++) {
      const a = (ya * W + x) * 4, b = (yb * W + x) * 4;
      for (let k = 0; k < 4; k++) if (d[a + k] !== d[b + k]) return false;
    }
    return true;
  };
  const rowEmpty = (y) => {
    for (let x = X0; x < X1; x++) if (d[(y * W + x) * 4 + 3]) return false;
    return true;
  };
  // Defect signature: the lower copy's text rows duplicate the top copy's, and the
  // lower copy's bottom border is present below the top copy.
  if (!(rowEq(3155, 3155 + DY) && !rowEmpty(B_END - 2))) return { file, skipped: 'already clean' };
  if (!rowEmpty(TOP - 1) || !rowEmpty(B_END + 1)) throw new Error('499P: tag bounds moved');

  const orig = Buffer.from(d);
  const touched = [];
  // 1. Top copy rows (A_END-11 .. A_END): take them from the lower copy's last rows.
  for (let y = A_END - 11; y <= A_END; y++) {
    for (let x = X0; x < X1; x++) {
      const t = (y * W + x) * 4, s = ((y + DY) * W + x) * 4;
      for (let k = 0; k < 4; k++) d[t + k] = d[s + k];
    }
    touched.push([X0, y, X1, y + 1]);
  }
  // 2. Clear the rest of the lower copy.
  for (let y = A_END + 1; y <= B_END; y++) {
    for (let x = X0; x < X1; x++) d.fill(0, (y * W + x) * 4, (y * W + x) * 4 + 4);
  }
  touched.push([X0, A_END + 1, X1, B_END + 1]);

  const guideFile = 'Ferrari499P_2025_UV.webp';
  const guide = await load(guideFile);
  const g = guide.d;
  const overWhite = (buf, i, c) => Math.round(buf[i + c] * buf[i + 3] / 255 + 255 * (1 - buf[i + 3] / 255));
  const Y0 = A_END - 11;
  for (let y = Y0; y <= B_END; y++) {
    for (let x = X0; x < X1; x++) {
      const i = (y * W + x) * 4;
      let m = 1;
      // Mesh factor from the brightest channel of the old composite (most precise).
      let best = -1;
      for (let c = 0; c < 3; c++) {
        const o = overWhite(orig, i, c);
        if (o > best) { best = o; m = o ? Math.min(1, g[i + c] / o) : 0; }
      }
      for (let c = 0; c < 3; c++) g[i + c] = Math.round(overWhite(d, i, c) * m);
      g[i + 3] = 255;
    }
  }
  return {
    outputs: [
      { file, img, touched, note: 'removed duplicate nose HYPERCAR tag' },
      { file: guideFile, img: guide, touched: [[X0, Y0, X1, B_END + 1]], note: 'removed duplicate tag from UV guide' },
    ],
  };
}

// ---------------------------------------------------------------------------------
// ADESS AD25 LMP3 - the purple ELMS number panels were lost in extraction; only the
// white ELMS strips survived. On the two side plates the UV guide still carries a
// solid black, plate-shaped hole directly above each strip, so the panel shape is
// recovered exactly by flood-filling that hole. The nose has no hole; its panel is
// placed to the left of the nose strip, at the strip's height, with the width of the
// Duqueine D09 nose panel (200px against an 83x278 strip; ADESS strip is 83x285) -
// the same layout every ELMS LMP3 plate uses.
// ---------------------------------------------------------------------------------
async function adessPlates() {
  const file = 'TOP_AdessAD25LMP3.webp';
  const img = await load(file);
  const uv = await load('AdessAD25LMP3_UV.webp');
  const { d, W, H } = img;

  const isPurple = (i) => d[i + 3] === 255 &&
    d[i] === ELMS_PURPLE[0] && d[i + 1] === ELMS_PURPLE[1] && d[i + 2] === ELMS_PURPLE[2];
  const seeds = [[1870, 1250], [1870, 3880]];
  const nose = { x0: 650 - 205, x1: 650, y0: 2426, y1: 2711 };
  if (seeds.every(([x, y]) => isPurple((y * W + x) * 4))) return { file, skipped: 'already clean' };

  const black = (x, y) => {
    const i = (y * uv.W + x) * 4;
    return uv.d[i + 3] > 200 && uv.d[i] < 40 && uv.d[i + 1] < 40 && uv.d[i + 2] < 40;
  };
  // The wireframe border round a hole has 1px gaps that open onto the surround, so
  // the fill only moves through pixels whose whole 5x5 neighbourhood is black (which
  // a 1px gap is not), then is grown back by 2px + 2px of seam cover below.
  const solid = (x, y) => {
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (!black(x + dx, y + dy)) return false;
    return true;
  };
  const paint = new Uint8Array(W * H);
  const touched = [];
  for (const [sx, sy] of seeds) {
    if (!solid(sx, sy)) throw new Error(`ADESS: no plate hole at ${sx},${sy}`);
    // Bounded flood fill: a plate hole is ~290x210px; anything larger has leaked
    // into the surround and must not be painted.
    const box = { x0: sx - 260, x1: sx + 260, y0: sy - 200, y1: sy + 200 };
    const stack = [[sx, sy]];
    const seen = new Set();
    let n = 0, bx0 = 1e9, by0 = 1e9, bx1 = -1, by1 = -1;
    while (stack.length) {
      const [x, y] = stack.pop();
      if (x < box.x0 || x >= box.x1 || y < box.y0 || y >= box.y1) {
        throw new Error(`ADESS: hole at ${sx},${sy} is not enclosed`);
      }
      const k = y * W + x;
      if (seen.has(k) || !solid(x, y)) continue;
      seen.add(k);
      paint[k] = 1; n++;
      bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x); by1 = Math.max(by1, y);
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    if (n < 30000 || n > 120000) throw new Error(`ADESS: hole at ${sx},${sy} has implausible size ${n}`);
    // Grow 4px: 2px undoes the 5x5 test, 2px covers the anti-aliased seam.
    const G = 4;
    for (let y = by0 - G; y <= by1 + G; y++) {
      for (let x = bx0 - G; x <= bx1 + G; x++) {
        let hit = false;
        for (let dy = -G; dy <= G && !hit; dy++) {
          for (let dx = -G; dx <= G && !hit; dx++) if (seen.has((y + dy) * W + x + dx)) hit = true;
        }
        if (hit) paint[y * W + x] = 2;
      }
    }
    touched.push([bx0 - G, by0 - G, bx1 + G + 1, by1 + G + 1]);
  }
  for (let y = nose.y0; y < nose.y1; y++) for (let x = nose.x0; x < nose.x1; x++) paint[y * W + x] = 2;
  touched.push([nose.x0, nose.y0, nose.x1, nose.y1]);

  // Panel goes UNDER existing decals (the white strip and its logo stay on top).
  for (let k = 0; k < W * H; k++) {
    if (!paint[k]) continue;
    const i = k * 4;
    const a = d[i + 3] / 255;
    d[i] = Math.round(d[i] * a + ELMS_PURPLE[0] * (1 - a));
    d[i + 1] = Math.round(d[i + 1] * a + ELMS_PURPLE[1] * (1 - a));
    d[i + 2] = Math.round(d[i + 2] * a + ELMS_PURPLE[2] * (1 - a));
    d[i + 3] = 255;
  }
  return { outputs: [{ file, img, touched, note: 'restored 3 purple ELMS number panels' }] };
}

// The ADESS body mask was built from the same outline as the guide, so it carries the
// same two plate-shaped holes: the base colour skipped them, and `audit:assets` reports
// the restored panels as stranded (16%). The panels are on body panels, so the mask is
// made solid wherever the sheet now carries the ELMS purple.
async function adessMaskHoles() {
  const file = 'MASK_adess_ad25_lmp3.webp';
  const mask = await load(file);
  const top = await load('TOP_AdessAD25LMP3.webp');
  const f = top.W / mask.W;
  const m = mask.d;
  const isPurple = (i) => top.d[i + 3] === 255 && top.d[i] === ELMS_PURPLE[0] &&
    top.d[i + 1] === ELMS_PURPLE[1] && top.d[i + 2] === ELMS_PURPLE[2];

  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0;
  for (let y = 0; y < mask.H; y++) {
    for (let x = 0; x < mask.W; x++) {
      let hit = false;
      for (let dy = 0; dy < f && !hit; dy++) {
        for (let dx = 0; dx < f && !hit; dx++) hit = isPurple(((y * f + dy) * top.W + x * f + dx) * 4);
      }
      const i = (y * mask.W + x) * 4;
      if (!hit || (m[i + 3] === 255 && m[i] === 255 && m[i + 1] === 255 && m[i + 2] === 255)) continue;
      m[i] = m[i + 1] = m[i + 2] = m[i + 3] = 255;
      n++;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
  }
  if (!n) return { file, skipped: 'already clean' };
  return { outputs: [{ file, img: mask, touched: [[x0, y0, x1 + 1, y1 + 1]], note: `filled ${n} mask px under the ELMS panels` }] };
}

const inside = (x, y, rects) => rects.some(([x0, y0, x1, y1]) => x >= x0 && x < x1 && y >= y0 && y < y1);

for (const repair of [ferrari499pNoseTag, adessPlates, adessMaskHoles]) {
  const res = await repair();
  if (res.skipped) { console.log(`skip ${res.file}: ${res.skipped}`); continue; }
  for (const r of res.outputs) {
  if (DRY) { console.log(`would patch ${r.file}: ${r.note}`); continue; }

  const { d, W, H } = r.img;
  const buf = await sharp(d, { raw: { width: W, height: H, channels: 4 } })
    .webp({ lossless: true, effort: 6 }).toBuffer();

  // Read-back: repaired output must round-trip exactly, and nothing outside the
  // touched rectangles may differ from the original file.
  const orig = await load(r.file);
  const back = await sharp(buf).ensureAlpha().raw().toBuffer();
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const want = inside(x, y, r.touched) ? d : orig.d;
      if (want[i + 3] !== back[i + 3]) throw new Error(`${r.file}: alpha mismatch at ${x},${y}`);
      if (want[i + 3] && (want[i] !== back[i] || want[i + 1] !== back[i + 1] || want[i + 2] !== back[i + 2])) {
        throw new Error(`${r.file}: colour mismatch at ${x},${y}`);
      }
    }
  }
  writeFileSync(join(DIR, r.file), buf);
  console.log(`OK   ${r.file}: ${r.note} (${(buf.length / 1024).toFixed(0)} KB)`);
  }
}
