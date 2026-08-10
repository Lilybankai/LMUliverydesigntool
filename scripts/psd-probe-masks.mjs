/**
 * Probe: find any layer whose MASK (not its pixels) describes the body silhouette.
 *
 * Walks the whole tree and reports mask coverage for every masked layer, so a carbon
 * layer that doubles as the body-parts mask shows up regardless of what it is called
 * or how little it actually paints.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createCanvas } from '@napi-rs/canvas';
import { loadPsd } from './psd-lib.mjs';

const DIR =
  'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Le Mans Ultimate\\Support\\LiveryTemplates';
const OUT = process.env.SCRATCH;

const FILES = [
  'Template_HYPER_AstonMartinValkyrie.psd',
  'Template_HYPER_GenesisGMR001.psd',
  'Template_LMP3_Ligier_JSP325.psd',
];

function maskCoverage(layer, W, H) {
  const m = layer.mask;
  if (!m?.canvas) return null;
  const mw = (m.right ?? 0) - (m.left ?? 0);
  const mh = (m.bottom ?? 0) - (m.top ?? 0);
  if (mw <= 0 || mh <= 0) return null;

  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = m.defaultColor ? '#ffffff' : '#000000';
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(m.canvas, m.left ?? 0, m.top ?? 0);
  const d = ctx.getImageData(0, 0, W, H).data;
  let white = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114 > 127) white++;
  }
  return { pct: (100 * white) / (W * H), canvas: c };
}

function walk(node, W, H, path, hits) {
  const name = (node.name ?? '').trim();
  const here = path ? `${path} > ${name}` : name;
  const cov = maskCoverage(node, W, H);
  if (cov) hits.push({ path: here, pct: cov.pct, canvas: cov.canvas });
  for (const c of node.children ?? []) walk(c, W, H, here, hits);
}

for (const f of FILES) {
  const psd = loadPsd(join(DIR, f), { withPixels: true });
  const W = psd.width;
  const H = psd.height;
  console.log(`\n=== ${f}`);
  const hits = [];
  for (const k of psd.children ?? []) walk(k, W, H, '', hits);

  if (!hits.length) console.log('  (no masked layers with raster data)');
  for (const h of hits.sort((a, b) => b.pct - a.pct)) {
    const flag = h.pct >= 25 && h.pct <= 85 ? '  <-- silhouette candidate' : '';
    console.log(`  ${h.path.slice(0, 52).padEnd(54)} maskCoverage=${h.pct.toFixed(1)}%${flag}`);
    if (flag && OUT) {
      const t = createCanvas(360, 360);
      t.getContext('2d').drawImage(h.canvas, 0, 0, 360, 360);
      const tag = f.replace(/Template_|\.psd/g, '').slice(0, 16);
      writeFileSync(join(OUT, `mask_${tag}_${h.path.replace(/\W/g, '').slice(-16)}.png`), t.toBuffer('image/png'));
    }
  }
}
