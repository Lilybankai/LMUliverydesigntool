/**
 * Dry-run PSD inspector for LMU livery templates.
 *
 * Prints the layer tree of one or more PSDs without writing any images, so we can
 * confirm which layer is the UV mesh and which groups hold the series decals
 * before committing to an extraction mapping.
 *
 * Usage:
 *   node --max-old-space-size=8192 scripts/psd-inspect.mjs <file-or-glob...>
 *   node --max-old-space-size=8192 scripts/psd-inspect.mjs --all
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { readPsd } from 'ag-psd';

const TEMPLATE_DIR =
  'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Le Mans Ultimate\\Support\\LiveryTemplates';

function describe(layer, depth, out) {
  const pad = '  '.repeat(depth);
  const kids = layer.children;
  const kind = kids ? 'GROUP' : 'layer';
  const w = (layer.right ?? 0) - (layer.left ?? 0);
  const h = (layer.bottom ?? 0) - (layer.top ?? 0);
  const bounds = w && h ? ` ${w}x${h}@${layer.left},${layer.top}` : ' (empty)';
  const hidden = layer.hidden ? ' [HIDDEN]' : '';
  const blend = layer.blendMode && layer.blendMode !== 'normal' ? ` blend=${layer.blendMode}` : '';
  const opacity = layer.opacity !== undefined && layer.opacity < 1 ? ` opacity=${layer.opacity}` : '';
  const clip = layer.clipping ? ' [CLIPPED]' : '';
  const fx = layer.effects ? ' [FX]' : '';
  const mask = layer.mask ? ' [MASK]' : '';

  out.push(`${pad}${kind} "${layer.name}"${bounds}${hidden}${blend}${opacity}${clip}${fx}${mask}`);
  if (kids) for (const c of kids) describe(c, depth + 1, out);
}

function inspect(file) {
  const out = [];
  const buf = readFileSync(file);
  // skipLayerImageData keeps memory sane on the 400MB+ files; we only want structure here.
  const psd = readPsd(buf, {
    skipLayerImageData: true,
    skipCompositeImageData: true,
    skipThumbnail: true,
  });

  out.push('='.repeat(78));
  out.push(`FILE: ${basename(file)}`);
  out.push(`CANVAS: ${psd.width}x${psd.height}  channels=${psd.channels} depth=${psd.bitsPerChannel}`);
  out.push(`TOP-LEVEL LAYERS: ${psd.children?.length ?? 0}  (listed top-most first)`);
  out.push('-'.repeat(78));

  // ag-psd returns children bottom-most first; reverse so the visual top layer is first,
  // which is where the UV mesh lives.
  const top = [...(psd.children ?? [])].reverse();
  for (const layer of top) describe(layer, 0, out);

  return out.join('\n');
}

const args = process.argv.slice(2);
let files;
if (args.length === 1 && args[0] === '--all') {
  files = readdirSync(TEMPLATE_DIR)
    .filter((f) => f.toLowerCase().endsWith('.psd'))
    .map((f) => join(TEMPLATE_DIR, f));
} else {
  files = args.map((a) => (a.includes('\\') || a.includes('/') ? a : join(TEMPLATE_DIR, a)));
}

for (const f of files) {
  try {
    console.log(inspect(f));
    console.log('');
  } catch (err) {
    console.log(`!! FAILED ${basename(f)}: ${err.message}`);
  }
}
