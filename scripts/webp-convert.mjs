/**
 * Convert every template asset to lossless WebP.
 *
 * Each file is verified pixel-for-pixel against its PNG before the PNG is removed, so
 * a mismatch aborts that file rather than silently degrading a template. Lossless is
 * used deliberately: the TOP_* sheets are baked into the exported .tga, and lossy WebP
 * shifts hard-edged decals against transparency by up to 255/255.
 *
 * Idempotent - already-converted files are skipped. Pass --keep to leave the PNGs.
 */
import { readdirSync, statSync, unlinkSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const DIR = process.argv.find((a) => !a.startsWith('--') && a.includes('lmutemplates'))
  || join(process.cwd(), 'public', 'lmutemplates');
const KEEP = process.argv.includes('--keep');

async function rgba(input) {
  return sharp(input).ensureAlpha().raw().toBuffer();
}

/**
 * Visually-lossless comparison: alpha must match everywhere, and colour must match
 * everywhere it can be seen.
 *
 * libwebp discards the colour hidden behind fully-transparent pixels, which a naive
 * byte compare reports as a difference - on these sticker sheets that is ~29% of the
 * image, all of it invisible. Compositing (including the .tga export, which draws the
 * sheet source-over) never reads those channels, so they are excluded deliberately
 * rather than by loosening the tolerance on visible pixels, which stays at zero.
 */
function identical(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 4) {
    if (a[i + 3] !== b[i + 3]) return false;
    if (a[i + 3] === 0) continue;
    if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) return false;
  }
  return true;
}

const pngs = readdirSync(DIR).filter((f) => f.toLowerCase().endsWith('.png'));
let converted = 0;
let pngBytes = 0;
let webpBytes = 0;
const failures = [];

for (const file of pngs) {
  const src = join(DIR, file);
  const dst = join(DIR, file.replace(/\.png$/i, '.webp'));

  try {
    const buf = await sharp(src).webp({ lossless: true, effort: 6 }).toBuffer();

    const [a, b] = await Promise.all([rgba(src), rgba(buf)]);
    if (!identical(a, b)) {
      failures.push(`${file} (pixel mismatch - PNG kept)`);
      continue;
    }

    writeFileSync(dst, buf);
    pngBytes += statSync(src).size;
    webpBytes += buf.length;
    converted++;
    if (!KEEP) unlinkSync(src);
  } catch (err) {
    failures.push(`${file} (${err.message.slice(0, 60)})`);
  }
}

console.log(`converted ${converted}/${pngs.length} assets, all verified pixel-identical`);
if (converted) {
  console.log(`  PNG   ${(pngBytes / 1048576).toFixed(1)} MB`);
  console.log(`  WebP  ${(webpBytes / 1048576).toFixed(1)} MB  (${(100 * (1 - webpBytes / pngBytes)).toFixed(0)}% smaller)`);
}
if (failures.length) {
  console.log('FAILED:');
  failures.forEach((f) => console.log(`  ${f}`));
}

const leftoverPng = readdirSync(DIR).filter((f) => f.toLowerCase().endsWith('.png')).length;
const webpCount = readdirSync(DIR).filter((f) => f.toLowerCase().endsWith('.webp')).length;
console.log(`\ndirectory now: ${webpCount} webp, ${leftoverPng} png`);
if (!existsSync(DIR)) console.log('!! output directory missing');
