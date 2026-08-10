/**
 * Hypothesis test: is the shipped *_UV.png simply the PSD's own flattened
 * composite (what Photoshop shows on open), rather than any single layer?
 *
 * Photoshop stores that composite in the file, so if this matches we get a
 * pixel-exact UV asset for free, with no layer compositing risk at all.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createCanvas, loadImage, ImageData } from '@napi-rs/canvas';
import { initializeCanvas, readPsd } from 'ag-psd';

initializeCanvas(
  (w, h) => createCanvas(w, h),
  (w, h) => new ImageData(w, h),
);

const TEMPLATES =
  'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Le Mans Ultimate\\Support\\LiveryTemplates';
const SHIPPED = 'C:\\Users\\authe\\Desktop\\LMULIVERYDESIGNTOOL\\public\\lmutemplates';
const OUT = process.env.SCRATCH;
const W = 4096;
const H = 4096;

async function diff(pathA, pathB) {
  const [a, b] = await Promise.all([loadImage(pathA), loadImage(pathB)]);
  const ca = createCanvas(W, H);
  ca.getContext('2d').drawImage(a, 0, 0, W, H);
  const cb = createCanvas(W, H);
  cb.getContext('2d').drawImage(b, 0, 0, W, H);
  const da = ca.getContext('2d').getImageData(0, 0, W, H).data;
  const db = cb.getContext('2d').getImageData(0, 0, W, H).data;
  let sum = 0;
  let bad = 0;
  for (let i = 0; i < da.length; i += 4) {
    const d =
      Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
    sum += d / 3;
    if (d / 3 > 8) bad++;
  }
  const n = W * H;
  return { meanDiff: (sum / n).toFixed(3), pctPixelsDiffer: ((100 * bad) / n).toFixed(2) };
}

const file = join(TEMPLATES, 'Template_GT3_AstonMartinVantage_2025.psd');
console.log('Reading composite from PSD...');
const psd = readPsd(readFileSync(file), {
  skipLayerImageData: true,
  skipCompositeImageData: false,
  skipThumbnail: true,
});

if (!psd.canvas) {
  console.log('!! PSD has no stored composite (saved without "Maximize Compatibility")');
  process.exit(1);
}

const c = createCanvas(W, H);
c.getContext('2d').drawImage(psd.canvas, 0, 0);
const dst = join(OUT, 'aston_COMPOSITE.png');
writeFileSync(dst, c.toBuffer('image/png'));
console.log(`wrote ${dst}`);

console.log('\nDIFF composite vs shipped UV:');
console.log('  ', await diff(dst, join(SHIPPED, 'AstonMartinVantage_2025_UV.png')));
