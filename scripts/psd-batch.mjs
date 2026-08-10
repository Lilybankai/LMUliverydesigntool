/**
 * Batch-extract every template in the manifest.
 *
 * Each PSD is processed in its own child process: the largest files are 300-400MB
 * and holding several decoded layer sets in one heap is what makes this fall over.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { TEMPLATES } from './templates.manifest.mjs';

const TEMPLATE_DIR =
  'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Le Mans Ultimate\\Support\\LiveryTemplates';
const outDir = process.argv[2] || join(process.cwd(), 'public', 'lmutemplates');
const only = process.argv[3];

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const results = [];
const list = only ? TEMPLATES.filter((t) => t.id.includes(only) || t.class === only) : TEMPLATES;

for (const t of list) {
  const psdPath = join(TEMPLATE_DIR, t.psd);
  if (!existsSync(psdPath)) {
    console.log(`SKIP ${t.id} - missing ${t.psd}`);
    results.push({ id: t.id, ok: false, reason: 'psd missing' });
    continue;
  }

  const args = [
    // The 300-400MB templates need real headroom while their layer stack decodes.
    '--max-old-space-size=28672',
    join(import.meta.dirname, 'psd-extract.mjs'),
    '--psd',
    psdPath,
    '--name',
    t.asset,
    '--out',
    outDir,
  ];
  if (t.series) args.push('--series', t.series);
  if (t.exclude?.length) args.push('--exclude', t.exclude.join(','));
  if (t.silhouette) args.push('--silhouette', t.silhouette);

  const r = spawnSync(process.execPath, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  const ok = r.status === 0;

  const uv = join(outDir, `${t.asset}_UV.png`);
  const top = join(outDir, `TOP_${t.asset}.png`);
  const mb = (p) => (existsSync(p) ? (statSync(p).size / 1048576).toFixed(2) : 'n/a');

  console.log(`${ok ? 'OK  ' : 'FAIL'} ${t.id.padEnd(30)} UV=${mb(uv)}MB TOP=${mb(top)}MB`);
  if (!ok) {
    const lines = out.split('\n');
    const msg = lines.find((l) => /Error|error:/i.test(l)) ?? lines.slice(-3).join(' ');
    console.log(`     reason: ${msg.trim()}`);
  }

  const warn = out.split('\n').find((l) => l.startsWith('warn'));
  if (warn) console.log(`     ${warn.trim()}`);

  results.push({ id: t.id, ok, uvMB: mb(uv), topMB: mb(top) });
}

const total = results
  .filter((r) => r.ok)
  .reduce((s, r) => s + Number(r.uvMB || 0) + Number(r.topMB || 0), 0);
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} extracted`);
console.log(`Total new asset weight: ${total.toFixed(1)} MB`);
