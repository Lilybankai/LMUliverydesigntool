/**
 * Generate a body-parts mask per vehicle: MASK_<vehicleId>.png
 *
 * White where the car's UV islands are, transparent everywhere else. The editor uses
 * it to confine the base colour to the body, so changing colour no longer floods the
 * black surround around the islands.
 *
 * Written at 2048px rather than 4096: it only ever fills a flat colour, and the UV
 * guide is drawn over its edges anyway, so half resolution is invisible and a quarter
 * of the weight.
 *
 * Usage: node --max-old-space-size=28672 scripts/psd-masks.mjs [outDir]
 */
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createCanvas } from '@napi-rs/canvas';
import { loadPsd, buildSilhouette } from './psd-lib.mjs';
import { TEMPLATES } from './templates.manifest.mjs';

const DIR =
  'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Le Mans Ultimate\\Support\\LiveryTemplates';
const OUT = process.argv[2] || join(process.cwd(), 'public', 'lmutemplates');
const SIZE = 2048;

/**
 * The 10 GT3 cars predate the extraction pipeline - their UV/TOP PNGs were made by
 * hand - but they still need a mask, so they are mapped to their source PSDs here.
 */
const GT3 = [
  ['aston_martin_gt3', 'Template_GT3_AstonMartinVantage_2025.psd'],
  ['corvette_z06_lmgt3', 'Template_GT3_CorvetteZ06LMGT3_2025.psd'],
  ['ferrari_296_lmgt3', 'Template_GT3_Ferrari296LMGT3_2025.psd'],
  ['bmw_m4_lmgt3', 'Template_GT3_BMWM4LMGT3_2025.psd'],
  ['ford_mustang_lmgt3', 'Template_GT3_FordMustangLMGT3_2025.psd'],
  ['lamborghini_huracan_lmgt3', 'Template_GT3_LamborghiniHuracan.psd'],
  ['lexus_rcf_lmgt3', 'Template_GT3_LexusRCF_2025.psd'],
  ['mclaren_720evo_lmgt3', 'Template_GT3_McLaren720EVO_2025.psd'],
  ['mercedes_amg_lmgt3', 'Template_GT3_MercedesAMG_2025.psd'],
  ['porsche_911_lmgt3', 'Template_GT3_Porsche911LMGT3R_2025.psd'],
];

const jobs = [
  ...TEMPLATES.map((t) => ({ id: t.id, psd: t.psd, silhouette: t.silhouette })),
  ...GT3.map(([id, psd]) => ({ id, psd, silhouette: undefined })),
];

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

let ok = 0;
const failed = [];

for (const j of jobs) {
  const path = join(DIR, j.psd);
  if (!existsSync(path)) {
    failed.push(`${j.id} (missing ${j.psd})`);
    continue;
  }
  try {
    const psd = loadPsd(path);
    const sil = buildSilhouette(psd, psd.width, psd.height, j.silhouette);
    if (!sil?.canvas) {
      failed.push(`${j.id} (${sil?.rejected ?? 'no silhouette'})`);
      continue;
    }
    const out = createCanvas(SIZE, SIZE);
    out.getContext('2d').drawImage(sil.canvas, 0, 0, SIZE, SIZE);
    const file = join(OUT, `MASK_${j.id}.png`);
    writeFileSync(file, out.toBuffer('image/png'));
    const kb = (statSync(file).size / 1024).toFixed(0);
    console.log(`OK   ${j.id.padEnd(30)} ${String(kb).padStart(5)} KB   ${sil.source}`);
    ok++;
  } catch (err) {
    failed.push(`${j.id} (${err.message.slice(0, 50)})`);
  }
}

console.log(`\n${ok}/${jobs.length} masks written to ${OUT}`);
if (failed.length) {
  console.log('FAILED:');
  failed.forEach((f) => console.log(`  ${f}`));
}
