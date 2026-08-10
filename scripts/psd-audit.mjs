/**
 * Structural audit across every template in the manifest.
 *
 * The extractor assumes a common layer vocabulary. This reports, per file, which of
 * those elements actually exist - so inconsistent output can be traced to the source
 * files rather than guessed at.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readPsd } from 'ag-psd';
import { TEMPLATES } from './templates.manifest.mjs';

const DIR =
  'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Le Mans Ultimate\\Support\\LiveryTemplates';

const SURROUND = /^mask\s*\(disable for export\)$/i;
const BASE = /^(base|colou?r fill\s*\d*)$/i;
const PLATES = /^(number plates.*|numplate)$/i;

const rows = [];

for (const t of TEMPLATES) {
  try {
    const psd = readPsd(readFileSync(join(DIR, t.psd)), {
      skipLayerImageData: true,
      skipCompositeImageData: true,
      skipThumbnail: true,
    });
    const kids = psd.children ?? [];
    const top = kids[kids.length - 1];

    // Is the top-most element a usable single raster layer (the UV mesh)?
    const topIsGroup = !!top?.children;
    const topName = top?.name ?? '(none)';
    const topHidden = !!top?.hidden;

    const names = kids.map((k) => (k.name ?? '').trim());
    const hasSurround = names.some((n) => SURROUND.test(n));
    const hasBase = names.some((n) => BASE.test(n));
    const plateGroup = kids.find((k) => PLATES.test((k.name ?? '').trim()));
    let plateShape = '-';
    if (plateGroup?.children?.length) {
      const sub = plateGroup.children.map((c) => (c.name ?? '').trim());
      const hasSeries = sub.some((s) => /^(wec|lm|elms)$/i.test(s));
      const hasYear = sub.some((s) => /^\d{4}$/.test(s));
      plateShape = hasYear ? 'year>series' : hasSeries ? 'series' : 'flat';
    }

    rows.push({
      id: t.id,
      size: `${psd.width}x${psd.height}`,
      top: topName + (topIsGroup ? ' [GROUP!]' : '') + (topHidden ? ' [hidden]' : ''),
      uvOk: topIsGroup ? 'NO' : 'yes',
      surround: hasSurround ? 'yes' : 'NO',
      base: hasBase ? 'yes' : 'NO',
      plates: plateShape,
      series: t.series ?? '-',
    });
  } catch (err) {
    rows.push({ id: t.id, size: 'ERROR', top: err.message.slice(0, 40), uvOk: '?', surround: '?', base: '?', plates: '?', series: '?' });
  }
}

const pad = (s, n) => String(s).padEnd(n);
console.log(
  pad('id', 30) + pad('canvas', 11) + pad('top layer', 30) + pad('uv?', 5) + pad('surround', 10) + pad('base', 6) + pad('plates', 12) + 'series',
);
console.log('-'.repeat(112));
for (const r of rows) {
  console.log(
    pad(r.id, 30) + pad(r.size, 11) + pad(r.top, 30) + pad(r.uvOk, 5) + pad(r.surround, 10) + pad(r.base, 6) + pad(r.plates, 12) + r.series,
  );
}

const bad = (k, v) => rows.filter((r) => r[k] === v).map((r) => r.id);
console.log('\nSUMMARY');
console.log(`  missing surround plate : ${bad('surround', 'NO').join(', ') || 'none'}`);
console.log(`  missing base fill      : ${bad('base', 'NO').join(', ') || 'none'}`);
console.log(`  top layer is a group   : ${bad('uvOk', 'NO').join(', ') || 'none'}`);
console.log(`  failed to read         : ${bad('size', 'ERROR').join(', ') || 'none'}`);
