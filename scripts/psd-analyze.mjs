/**
 * Diagnostic: characterise the shipped template PNGs vs what we extract from the PSD,
 * so the extraction mapping is derived from evidence rather than assumption.
 */
import { createCanvas, loadImage } from '@napi-rs/canvas';

const W = 4096;
const H = 4096;

async function stats(label, path) {
  const img = await loadImage(path);
  const c = createCanvas(W, H);
  c.getContext('2d').drawImage(img, 0, 0, W, H);
  const d = c.getContext('2d').getImageData(0, 0, W, H).data;

  let opaque = 0;
  let transparent = 0;
  let partial = 0;
  let nearBlackOpaque = 0;
  let nearWhiteOpaque = 0;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let nonBlackPixels = 0;

  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3];
    if (a === 0) transparent++;
    else if (a === 255) opaque++;
    else partial++;

    if (a > 0) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      const lum = r * 0.299 + g * 0.587 + b * 0.114;
      if (a === 255 && lum < 12) nearBlackOpaque++;
      if (a === 255 && lum > 243) nearWhiteOpaque++;
      if (lum >= 12) {
        nonBlackPixels++;
        sumR += r;
        sumG += g;
        sumB += b;
      }
    }
  }
  const n = W * H;
  const pct = (x) => ((100 * x) / n).toFixed(2) + '%';
  console.log(`\n${label}`);
  console.log(`  path            ${path}`);
  console.log(`  alpha           opaque=${pct(opaque)} transparent=${pct(transparent)} partial=${pct(partial)}`);
  console.log(`  opaque near-black ${pct(nearBlackOpaque)}   opaque near-white ${pct(nearWhiteOpaque)}`);
  console.log(`  non-black px    ${pct(nonBlackPixels)}  avgRGB=${
    nonBlackPixels ? [sumR, sumG, sumB].map((s) => (s / nonBlackPixels).toFixed(0)).join(',') : 'n/a'
  }`);
}

const SHIPPED = 'C:\\Users\\authe\\Desktop\\LMULIVERYDESIGNTOOL\\public\\lmutemplates';
const OUT = process.env.SCRATCH;

await stats('SHIPPED UV  (AstonMartinVantage_2025_UV.png)', `${SHIPPED}\\AstonMartinVantage_2025_UV.png`);
await stats('EXTRACTED UV (top layer "Background")', `${OUT}\\aston_UV.png`);
await stats('SHIPPED TOP (TOP_GT3_AstonMartinVantage_2025.png)', `${SHIPPED}\\TOP_GT3_AstonMartinVantage_2025.png`);
await stats('EXTRACTED TOP (class_only)', `${OUT}\\aston_TOP_class_only.png`);
await stats('EXTRACTED TOP (class_car_plates_LM)', `${OUT}\\aston_TOP_class_car_plates_LM.png`);
