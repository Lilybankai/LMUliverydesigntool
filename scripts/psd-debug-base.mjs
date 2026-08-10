/** Debug: what do the Base layer's raster and mask actually contain? */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createCanvas } from '@napi-rs/canvas';
import { loadPsd } from './psd-lib.mjs';

const TEMPLATES =
  'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Le Mans Ultimate\\Support\\LiveryTemplates';
const OUT = process.env.SCRATCH;
const S = 512;

const psd = loadPsd(join(TEMPLATES, 'Template_GT3_AstonMartinVantage_2025.psd'));
for (const layer of psd.children ?? []) {
  const m = layer.mask;
  console.log(
    `"${layer.name}" canvas=${!!layer.canvas} mask=${!!m} maskCanvas=${!!(m && m.canvas)} ` +
      `maskRect=${m ? `${m.left},${m.top},${m.right},${m.bottom}` : '-'} ` +
      `maskDefault=${m ? m.defaultColor : '-'} hidden=${!!layer.hidden}`,
  );
}

const base = (psd.children ?? []).find((l) => (l.name ?? '').toLowerCase() === 'base');
if (base) {
  if (base.canvas) {
    const c = createCanvas(S, S);
    c.getContext('2d').drawImage(base.canvas, 0, 0, S, S);
    writeFileSync(join(OUT, 'dbg_base_raster.png'), c.toBuffer('image/png'));
    console.log('wrote dbg_base_raster.png');
  }
  if (base.mask?.canvas) {
    const c = createCanvas(S, S);
    const x = c.getContext('2d');
    x.fillStyle = '#ff00ff';
    x.fillRect(0, 0, S, S);
    x.drawImage(base.mask.canvas, 0, 0, S, S);
    writeFileSync(join(OUT, 'dbg_base_mask.png'), c.toBuffer('image/png'));
    console.log('wrote dbg_base_mask.png');
  }
}
