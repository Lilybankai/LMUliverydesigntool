/**
 * Render every extracted template into two labelled contact sheets (UV guides and
 * sticker sheets) so the whole set can be eyeballed for consistency in one go.
 *
 * Usage: node scripts/psd-contactsheet.mjs <dir> [outDir]
 */
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { TEMPLATES } from './templates.manifest.mjs';

const dir = process.argv[2];
const outDir = process.argv[3] || dir;
const CELL = 300;
const LABEL = 22;
const COLS = 5;

async function sheet(kind, fileFor, ground) {
  const items = TEMPLATES.map((t) => ({ t, path: join(dir, fileFor(t)) })).filter((i) =>
    existsSync(i.path),
  );
  const rows = Math.ceil(items.length / COLS);
  const c = createCanvas(COLS * CELL, rows * (CELL + LABEL));
  const x = c.getContext('2d');
  x.fillStyle = '#202020';
  x.fillRect(0, 0, c.width, c.height);

  for (let i = 0; i < items.length; i++) {
    const cx = (i % COLS) * CELL;
    const cy = Math.floor(i / COLS) * (CELL + LABEL);

    x.fillStyle = ground;
    x.fillRect(cx, cy, CELL, CELL);
    try {
      x.drawImage(await loadImage(items[i].path), cx, cy, CELL, CELL);
    } catch {
      x.fillStyle = '#803030';
      x.fillRect(cx, cy, CELL, CELL);
    }

    x.fillStyle = '#e8e8e8';
    x.font = '13px sans-serif';
    x.fillText(items[i].t.name.slice(0, 34), cx + 5, cy + CELL + 15);
    x.strokeStyle = '#000';
    x.lineWidth = 1;
    x.strokeRect(cx + 0.5, cy + 0.5, CELL - 1, CELL - 1);
  }

  const out = join(outDir, `contact_${kind}.png`);
  writeFileSync(out, c.toBuffer('image/png'));
  console.log(`${out}  (${items.length} cars)`);
}

await sheet('UV', (t) => `${t.asset}_UV.png`, '#000000');
await sheet('TOP', (t) => `TOP_${t.asset}.png`, '#808080');
