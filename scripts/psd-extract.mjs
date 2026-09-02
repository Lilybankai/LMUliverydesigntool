/**
 * Extract app-ready template assets from an official LMU livery PSD.
 *
 * Produces the same two assets the app already expects per car:
 *   <name>_UV.png   opaque 4096x4096 guide: white base + all markings + UV wireframe
 *   TOP_<name>.png  transparent 4096x4096 sticker sheet baked into the exported .tga
 *
 * Layer conventions across the official templates (verified by inspection):
 *   - The UV/wireframe is ALWAYS the top-most top-level layer, but its name varies
 *     ("UVW", "Wireframe", "Background") - so it is selected by position.
 *   - Structural/base layers are excluded by name (see STRUCTURAL).
 *   - Everything else is car/class markings, which belong in both outputs.
 *   - Series-specific number plates live in nested groups (WEC / LM / ELMS / year),
 *     mostly shipped hidden; --series picks which subtree to force visible.
 *
 * Usage:
 *   node --max-old-space-size=8192 scripts/psd-extract.mjs \
 *     --psd "Template_LMP2_Oreca07_2025.psd" --name Oreca07_2025 --series WEC --out public/lmutemplates
 *   ... add --verify <shippedUV> <shippedTOP> to diff against known-good assets.
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, isAbsolute } from 'node:path';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { loadPsd, composite, findGroup, buildSilhouette, WIRE_NOISE_FLOOR } from './psd-lib.mjs';

const TEMPLATES =
  'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Le Mans Ultimate\\Support\\LiveryTemplates';

/**
 * The pack has no single naming convention - every file was authored differently
 * ("Base" / "Base Colour" / "Color Fill 1" / "Background"; "Number Plates (Don't
 * Move)" / "Number Plates(don't move)" / "Number Board(Don't Move)" / "Numplate").
 * Matching on patterns rather than exact strings is what makes output consistent
 * across cars; anything genuinely unique is handled by a per-file --exclude.
 *
 * Base fills are dropped rather than drawn: the white islands come from the
 * silhouette instead, so a file that lacks a base fill looks the same as one that
 * has it. ("background" is safe here - the UV mesh is picked by position first, so
 * an Aston-style top layer named "Background" is never reached by this test.)
 */
const SCAFFOLD_RE =
  /^(region|levels?\s*\d*|hue\/saturation\s*\d*|clamp|ma[sk]{2}\s*[-(]?\s*disable\s*for\s*export\s*\)?|base|base\s*colou?rs?|colou?r\s*fill\s*\d*|background)$/i;

/**
 * Material texture groups (carbon weave, plastics, body "PARTS"). Dropped from BOTH
 * outputs: they are decorative, they differ wildly between files - Porsche 963's
 * carbon covers the entire canvas and turned its guide black at 23MB - and the UV is
 * only ever a reference overlay. Excluding them keeps every car legible and light.
 */
const SHADING_RE = /^(carbon|carbon\s*fibre|carbon\s*fiber|plastic|parts)$/i;

/** Groups holding series-specific number plates. */
const PLATES_RE = /^(number\s*(plates?|board).*|numplate)$/i;

const nameOf = (n) => (n.name ?? '').trim();
/** Extra group names to drop entirely, supplied per file via --exclude. */
let EXCLUDE = [];
const isExcluded = (n) => EXCLUDE.some((e) => e.toLowerCase() === nameOf(n).toLowerCase());
const isScaffold = (n) => SCAFFOLD_RE.test(nameOf(n));
const isShading = (n) => SHADING_RE.test(nameOf(n));
const isPlateGroup = (n) => PLATES_RE.test(nameOf(n));

function parseArgs(argv) {
  const out = { verify: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--psd') out.psd = argv[++i];
    else if (a === '--name') out.name = argv[++i];
    else if (a === '--series') out.series = argv[++i];
    else if (a === '--out') out.out = argv[++i];
    else if (a === '--exclude') out.exclude = argv[++i];
    else if (a === '--silhouette') out.silhouette = argv[++i];
    else if (a === '--verify') out.verify = [argv[++i], argv[++i]];
  }
  return out;
}

/**
 * Choose which plate subtree to render for the requested series.
 * Handles both `Plates > WEC` and `Plates > <year> > WEC` shapes; when the series
 * is absent (e.g. LMP3, which is ELMS-only) the newest/only subtree is used.
 */
function selectPlateSubtree(group, series) {
  if (!group?.children?.length) return { nodes: [], note: 'no plates' };

  if (series) {
    const direct = findGroup(group.children, series);
    if (direct) return { nodes: [direct], note: `plates: ${series}` };
  }

  // Year-style subgroups: prefer the highest numeric name.
  const years = group.children.filter((c) => c.children && /^\d{4}$/.test((c.name ?? '').trim()));
  if (years.length) {
    const newest = years.sort((a, b) => Number(b.name) - Number(a.name))[0];
    if (series) {
      const inner = findGroup(newest.children, series);
      if (inner) return { nodes: [inner], note: `plates: ${newest.name}>${series}` };
    }
    return { nodes: [newest], note: `plates: ${newest.name} (series not present)` };
  }

  return { nodes: group.children, note: 'plates: flat' };
}

/**
 * Split the top-level layers, preserving Photoshop's bottom-to-top order.
 *   uv       - the wireframe (top-most layer)
 *   plan     - ordered render plan for the UV guide, tagged by role
 *   markings - the subset that also forms the transparent sticker sheet
 */
function classify(psd, series) {
  const kids = psd.children ?? [];
  const uv = kids[kids.length - 1] ?? null; // top-most
  const plan = [];
  const markings = [];
  const notes = [];

  for (const node of kids) {
    if (node === uv || isScaffold(node)) continue;
    if (isExcluded(node)) {
      notes.push(`excluded: "${node.name}"`);
      continue;
    }

    if (isShading(node)) continue;
    if (isPlateGroup(node)) {
      // The chosen series subtree ships hidden, so this is the one place we
      // override Photoshop's visibility.
      const { nodes, note } = selectPlateSubtree(node, series);
      notes.push(note);
      for (const n of nodes) {
        plan.push({ role: 'marking', node: n, force: true });
        markings.push({ node: n, force: true });
      }
      continue;
    }
    plan.push({ role: 'marking', node, force: false });
    markings.push({ node, force: false });
  }
  return { uv, plan, markings, notes };
}

async function diff(a, b, W, H) {
  const [ia, ib] = await Promise.all([loadImage(a), loadImage(b)]);
  const ca = createCanvas(W, H);
  ca.getContext('2d').drawImage(ia, 0, 0, W, H);
  const cb = createCanvas(W, H);
  cb.getContext('2d').drawImage(ib, 0, 0, W, H);
  const da = ca.getContext('2d').getImageData(0, 0, W, H).data;
  const db = cb.getContext('2d').getImageData(0, 0, W, H).data;
  let sum = 0;
  let bad = 0;
  for (let i = 0; i < da.length; i += 4) {
    const d =
      (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2])) /
        3 +
      Math.abs(da[i + 3] - db[i + 3]);
    sum += d;
    if (d > 8) bad++;
  }
  const n = W * H;
  return `meanDiff=${(sum / n).toFixed(2)} differ=${((100 * bad) / n).toFixed(2)}%`;
}

const args = parseArgs(process.argv.slice(2));
if (!args.psd || !args.name || !args.out) {
  console.error('usage: --psd <file> --name <basename> --out <dir> [--series WEC|LM|ELMS]');
  process.exit(2);
}

const psdPath = isAbsolute(args.psd) ? args.psd : join(TEMPLATES, args.psd);
const outDir = isAbsolute(args.out) ? args.out : join(process.cwd(), args.out);
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

EXCLUDE = (args.exclude ?? '').split(',').map((s) => s.trim()).filter(Boolean);

console.log(`\n=== ${args.name} ===`);
console.log(`psd    ${psdPath}`);
const psd = loadPsd(psdPath);
const W = psd.width;
const H = psd.height;
const { uv, plan, markings, notes } = classify(psd, args.series);

console.log(`canvas ${W}x${H}`);
console.log(`uv     "${uv?.name}" (top-most layer)`);
console.log(`plan   ${plan.map((p) => `${p.role}:"${p.node.name}"`).join(', ')}`);
notes.forEach((n) => console.log(`       ${n}`));

const warnings = [];

// --- TOP: markings only, on transparency ------------------------------------
const topCanvas = createCanvas(W, H);
{
  const tctx = topCanvas.getContext('2d');
  for (const { node, force } of markings) {
    composite(tctx, [node], W, H, { force, warnings });
  }
}
const topPath = join(outDir, `TOP_${args.name}.png`);
writeFileSync(topPath, topCanvas.toBuffer('image/png'));
console.log(`wrote  ${topPath}`);

// --- UV: black ground, white islands, shading, markings, wireframe ----------
const uvCanvas = createCanvas(W, H);
const uctx = uvCanvas.getContext('2d');
uctx.fillStyle = '#000000';
uctx.fillRect(0, 0, W, H);

// One reconstructed silhouette replaces the per-file base fill AND surround plate,
// so every car gets white islands on black regardless of which layers its PSD has.
const sil = buildSilhouette(psd, W, H, args.silhouette);
if (sil?.rejected) console.log(`silh   rejected (${sil.rejected})`);
if (sil?.warning) warnings.push(`silhouette: ${sil.warning}`);
if (sil?.canvas) {
  console.log(`silh   ${sil.source}`);
  uctx.drawImage(sil.canvas, 0, 0);
} else {
  console.log('silh   NONE - falling back to full-canvas white base');
  uctx.fillStyle = '#ffffff';
  uctx.fillRect(0, 0, W, H);
}

for (const { node, force } of plan) {
  composite(uctx, [node], W, H, { force: !!force, warnings });
}

// The wireframe raster is light lines on an opaque black ground. Screen-blending it
// over a white base would erase it, so invert to dark-on-white and multiply - which
// is what makes the mesh legible in the shipped guides.
if (uv?.canvas) {
  const wf = createCanvas(W, H);
  const wctx = wf.getContext('2d');
  wctx.drawImage(uv.canvas, uv.left ?? 0, uv.top ?? 0);
  const id = wctx.getImageData(0, 0, W, H);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    // Flatten to intensity first: the mesh is drawn in mixed colours, and inverting
    // per-channel would tint the guide (green mesh -> magenta lines).
    const lit = Math.max(d[i], d[i + 1], d[i + 2]);
    // Some wire renders (BMW M4 GT3) carry faint noise across their black ground
    // instead of true black. Inverted it becomes a near-white haze that multiply
    // leaves visually identical but that costs ~3MB of WebP - the clean files are
    // essentially two-tone. Snapping the floor to black is invisible and keeps
    // every guide in the same weight class as the rest of the pack.
    const v = 255 - (lit <= WIRE_NOISE_FLOOR ? 0 : lit);
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = 255;
  }
  wctx.putImageData(id, 0, 0);
  uctx.save();
  uctx.globalCompositeOperation = 'multiply';
  uctx.drawImage(wf, 0, 0);
  uctx.restore();
}
const uvPath = join(outDir, `${args.name}_UV.png`);
writeFileSync(uvPath, uvCanvas.toBuffer('image/png'));
console.log(`wrote  ${uvPath}`);

if (warnings.length) {
  const uniq = [...new Set(warnings)];
  console.log(`warn   ${uniq.length} layer(s) use effects that are not reproduced:`);
  uniq.slice(0, 8).forEach((w) => console.log(`       - ${w}`));
}

if (args.verify) {
  const [refUv, refTop] = args.verify;
  console.log(`verify UV  ${await diff(uvPath, refUv, W, H)}`);
  console.log(`verify TOP ${await diff(topPath, refTop, W, H)}`);
}
