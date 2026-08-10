/**
 * Render 512px thumbnails (transparency flattened onto mid-grey) so template
 * candidates can be eyeballed side by side.
 */
import { writeFileSync } from 'node:fs';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const S = 512;
const OUT = process.env.SCRATCH;
const SHIPPED = 'C:\\Users\\authe\\Desktop\\LMULIVERYDESIGNTOOL\\public\\lmutemplates';

async function thumb(src, dst, { checker = true } = {}) {
  const img = await loadImage(src);
  const c = createCanvas(S, S);
  const ctx = c.getContext('2d');
  if (checker) {
    // mid-grey ground so transparent regions read clearly
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, S, S);
  }
  ctx.drawImage(img, 0, 0, S, S);
  writeFileSync(dst, c.toBuffer('image/png'));
}

const jobs = [
  [`${SHIPPED}\\AstonMartinVantage_2025_UV.png`, `${OUT}\\t_shipped_UV.png`],
  [`${OUT}\\aston_UV.png`, `${OUT}\\t_extracted_UV.png`],
  [`${SHIPPED}\\TOP_GT3_AstonMartinVantage_2025.png`, `${OUT}\\t_shipped_TOP.png`],
  [`${OUT}\\aston_TOP_class_only.png`, `${OUT}\\t_extr_TOP_class_only.png`],
  [`${OUT}\\aston_TOP_class_car_plates_LM.png`, `${OUT}\\t_extr_TOP_LM.png`],
];

for (const [src, dst] of jobs) {
  await thumb(src, dst);
  console.log(`wrote ${dst}`);
}
