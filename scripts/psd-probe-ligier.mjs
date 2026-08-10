/**
 * Focused probe of the Ligier JS P325 "Numplate > Fill layer 1 / 3" layers.
 *
 * These are Photoshop fill layers that ship disabled with masks applied, so the body
 * outline could be in the raster mask, the inverse of it, or a vector mask. Dump all
 * three so the right one can be identified rather than guessed.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createCanvas } from '@napi-rs/canvas';
import { loadPsd, findByPath } from './psd-lib.mjs';

const DIR =
  'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Le Mans Ultimate\\Support\\LiveryTemplates';
const OUT = process.env.SCRATCH;

const psd = loadPsd(join(DIR, 'Template_LMP3_Ligier_JSP325.psd'));
const W = psd.width;
const H = psd.height;

for (const name of ['Numplate > Fill layer 1', 'Numplate > Fill layer 3']) {
  const l = findByPath(psd, name);
  if (!l) {
    console.log(`${name}: NOT FOUND`);
    continue;
  }
  const m = l.mask;
  console.log(`\n=== ${name}`);
  console.log(`  bounds      ${(l.right ?? 0) - (l.left ?? 0)}x${(l.bottom ?? 0) - (l.top ?? 0)} @${l.left},${l.top}`);
  console.log(`  hidden      ${!!l.hidden}   blend=${l.blendMode}   opacity=${l.opacity}`);
  console.log(`  canvas      ${!!l.canvas}`);
  console.log(`  raster mask ${m ? `${(m.right ?? 0) - (m.left ?? 0)}x${(m.bottom ?? 0) - (m.top ?? 0)} default=${m.defaultColor} disabled=${!!m.disabled} canvas=${!!m.canvas}` : 'none'}`);
  console.log(`  vectorMask  ${l.vectorMask ? `paths=${l.vectorMask.paths?.length ?? 0} invert=${l.vectorMask.invert}` : 'none'}`);
  console.log(`  vectorFill  ${l.vectorFill ? JSON.stringify(l.vectorFill).slice(0, 90) : 'none'}`);

  if (m?.canvas) {
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
    const pct = (100 * white) / (W * H);
    console.log(`  maskCoverage ${pct.toFixed(1)}%   inverted ${(100 - pct).toFixed(1)}%`);
    if (OUT) {
      const t = createCanvas(400, 400);
      t.getContext('2d').drawImage(c, 0, 0, 400, 400);
      writeFileSync(join(OUT, `ligier_mask_${name.slice(-1)}.png`), t.toBuffer('image/png'));
    }
  }

  if (l.canvas && OUT) {
    const t = createCanvas(400, 400);
    const tc = t.getContext('2d');
    tc.fillStyle = '#404040';
    tc.fillRect(0, 0, 400, 400);
    tc.drawImage(l.canvas, (l.left ?? 0) / (W / 400), (l.top ?? 0) / (H / 400), ((l.right ?? 0) - (l.left ?? 0)) / (W / 400), ((l.bottom ?? 0) - (l.top ?? 0)) / (H / 400));
    writeFileSync(join(OUT, `ligier_raster_${name.slice(-1)}.png`), t.toBuffer('image/png'));
  }
}
