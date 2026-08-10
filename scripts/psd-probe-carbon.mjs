/**
 * Probe: does the carbon layer double as the body-parts mask?
 *
 * For the files that have no "Mask(Disable for export)" plate, render each candidate
 * top-level group on its own and report how much of the canvas its alpha covers. A
 * carbon layer acting as the silhouette should land in a plausible body range
 * (roughly 30-75%), not near 0% or near 100%.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createCanvas } from '@napi-rs/canvas';
import { loadPsd, composite } from './psd-lib.mjs';

const DIR =
  'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Le Mans Ultimate\\Support\\LiveryTemplates';
const OUT = process.env.SCRATCH;

const FILES = [
  'Template_HYPER_AstonMartinValkyrie.psd',
  'Template_HYPER_GenesisGMR001.psd',
  'Template_LMP3_Ligier_JSP325.psd',
];

for (const f of FILES) {
  const psd = loadPsd(join(DIR, f));
  const W = psd.width;
  const H = psd.height;
  console.log(`\n=== ${f}  ${W}x${H}`);

  const kids = psd.children ?? [];
  for (const node of kids) {
    const name = (node.name ?? '').trim();
    // Skip the obvious non-candidates: mesh is top-most, Region is scaffolding.
    if (node === kids[kids.length - 1] || /^region$/i.test(name)) continue;

    const c = createCanvas(W, H);
    composite(c.getContext('2d'), [node], W, H, { force: true, warnings: [] });
    const d = c.getContext('2d').getImageData(0, 0, W, H).data;
    let opaque = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 127) opaque++;
    const pct = (100 * opaque) / (W * H);
    const flag = pct >= 25 && pct <= 80 ? '  <-- plausible silhouette' : '';
    console.log(`  ${name.padEnd(32)} coverage=${pct.toFixed(1)}%${flag}`);

    if (flag && OUT) {
      const t = createCanvas(400, 400);
      t.getContext('2d').drawImage(c, 0, 0, 400, 400);
      writeFileSync(
        join(OUT, `carbon_${f.replace(/[^A-Za-z0-9]/g, '').slice(-18)}_${name.replace(/\W/g, '')}.png`),
        t.toBuffer('image/png'),
      );
    }
  }
}
