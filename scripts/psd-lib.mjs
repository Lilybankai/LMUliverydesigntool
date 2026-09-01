/**
 * Shared PSD -> PNG helpers for the LMU livery template pipeline.
 *
 * Two things are extracted from each official Studio 397 template PSD:
 *   - the UV/wireframe guide  : always the TOP-MOST top-level layer, but its name
 *                               varies per file ("UVW", "Wireframe", "Background"),
 *                               so we select it by position, never by name.
 *   - the class sticker sheet : one or more named groups composited together, which
 *                               the app bakes into the exported .tga.
 *
 * ag-psd hands back per-layer rasters only; it does not composite. Group compositing
 * (masks, blend modes, nesting) is implemented here.
 */
import { readFileSync } from 'node:fs';
import { createCanvas, ImageData } from '@napi-rs/canvas';
import { initializeCanvas, readPsd } from 'ag-psd';

// Second argument is an ImageData factory, not an image loader.
initializeCanvas(
  (w, h) => createCanvas(w, h),
  (w, h) => new ImageData(w, h),
);

/** Photoshop blend mode -> canvas globalCompositeOperation. */
const BLEND = {
  normal: 'source-over',
  multiply: 'multiply',
  screen: 'screen',
  overlay: 'overlay',
  darken: 'darken',
  lighten: 'lighten',
  'color dodge': 'color-dodge',
  'color burn': 'color-burn',
  'hard light': 'hard-light',
  'soft light': 'soft-light',
  difference: 'difference',
  exclusion: 'exclusion',
  hue: 'hue',
  saturation: 'saturation',
  color: 'color',
  luminosity: 'luminosity',
  'linear dodge': 'lighter',
  'pass through': 'source-over',
};

/**
 * ag-psd caps total decoded pixel memory at 2GB by default, which the largest
 * templates (Toyota GR010 at 434MB, Glickenhaus at 325MB) blow through while
 * decoding their layer stack. Raised here rather than disabled, so a corrupt file
 * still fails fast instead of exhausting the machine.
 */
const MEMORY_LIMIT = 24 * 1024 * 1024 * 1024;

export function loadPsd(file, { withPixels = true } = {}) {
  const buf = readFileSync(file);
  return readPsd(buf, {
    skipLayerImageData: !withPixels,
    skipCompositeImageData: true,
    skipThumbnail: true,
    useImageData: false,
    totalMemoryLimit: MEMORY_LIMIT,
  });
}

/** ag-psd orders children bottom-most first; the visual top layer is the last entry. */
export function topLayer(psd) {
  const kids = psd.children ?? [];
  return kids.length ? kids[kids.length - 1] : null;
}

/**
 * Apply a Photoshop layer mask to a layer raster.
 * Photoshop masks are greyscale (white = show, black = hide); canvas needs that
 * luminance moved into the alpha channel before `destination-in` will work.
 */
export function applyMask(layerCanvas, layer, W, H) {
  const mask = layer.mask;
  if (!mask || !mask.canvas) return layerCanvas;

  const out = createCanvas(W, H);
  const ctx = out.getContext('2d');
  ctx.drawImage(layerCanvas, 0, 0);

  const mw = (mask.right ?? 0) - (mask.left ?? 0);
  const mh = (mask.bottom ?? 0) - (mask.top ?? 0);
  if (mw <= 0 || mh <= 0) return out;

  // Build a full-canvas alpha plate from the mask luminance.
  const plate = createCanvas(W, H);
  const pctx = plate.getContext('2d');
  // Areas the mask does not cover take its defaultColor (0 = hidden, 255 = shown).
  const dflt = mask.defaultColor ?? 0;
  pctx.fillStyle = `rgba(0,0,0,${dflt ? 1 : 0})`;
  pctx.fillRect(0, 0, W, H);
  pctx.drawImage(mask.canvas, mask.left ?? 0, mask.top ?? 0);

  const img = pctx.getImageData(0, 0, W, H);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    // Luminance -> alpha. Mask pixels outside the mask rect were filled above.
    const lum = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0;
    d[i + 3] = d[i + 3] === 0 ? (dflt ? 255 : 0) : lum;
  }
  pctx.putImageData(img, 0, 0);

  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(plate, 0, 0);
  return out;
}

/**
 * Solid-fill plates that span (virtually) the whole canvas are backing colour, never
 * decals - e.g. Porsche 963 nests a full-size "Color Fill 1" inside its number-plate
 * group, which would otherwise smother the entire transparent sticker sheet.
 * Matched on name AND near-full coverage so genuine large decals are untouched.
 */
const FILL_NAME = /^(color fill|fill layer|colour fill)\s*\d*$/i;

/**
 * The plate masked to cover everything OUTSIDE the UV islands. Its name is spelled
 * three different ways across the pack, including one outright typo, so all are
 * matched: "Mask(Disable for export)", "Mask - Disable for export", "Maks(...)".
 */
export const SURROUND_RE = /^ma[sk]{2}\s*[-(]?\s*disable\s*for\s*export\s*\)?$/i;

function isFullCanvasFill(layer, W, H) {
  if (!FILL_NAME.test((layer.name ?? '').trim())) return false;
  const w = (layer.right ?? 0) - (layer.left ?? 0);
  const h = (layer.bottom ?? 0) - (layer.top ?? 0);
  return w >= W * 0.98 && h >= H * 0.98;
}

/**
 * Composite a layer/group tree onto ctx.
 * `force` renders a subtree even when Photoshop had it hidden (used to pick the
 * series-specific number-plate subgroup that ships hidden in the source file).
 */
export function composite(ctx, nodes, W, H, { force = false, warnings = [] } = {}) {
  for (const layer of nodes) {
    if (layer.hidden && !force) continue;

    if (layer.effects && Object.keys(layer.effects).length) {
      warnings.push(`layer effects not reproduced: "${layer.name}"`);
    }

    if (layer.children) {
      composite(ctx, layer.children, W, H, { force, warnings });
      continue;
    }
    if (!layer.canvas) continue;

    if (isFullCanvasFill(layer, W, H)) {
      warnings.push(`skipped full-canvas fill: "${layer.name}"`);
      continue;
    }

    const w = (layer.right ?? 0) - (layer.left ?? 0);
    const h = (layer.bottom ?? 0) - (layer.top ?? 0);
    if (w <= 0 || h <= 0) continue;

    // Place the layer raster at its document offset, then mask it.
    let plate = createCanvas(W, H);
    plate.getContext('2d').drawImage(layer.canvas, layer.left ?? 0, layer.top ?? 0);
    plate = applyMask(plate, layer, W, H);

    ctx.save();
    ctx.globalAlpha = layer.opacity ?? 1;
    ctx.globalCompositeOperation = BLEND[layer.blendMode] ?? 'source-over';
    ctx.drawImage(plate, 0, 0);
    ctx.restore();
  }
}

/**
 * Read a Photoshop mask into a full-canvas greyscale plate (white = mask shows).
 * Returns null when the layer has no usable mask raster.
 */
function maskPlate(layer, W, H) {
  const m = layer?.mask;
  if (!m?.canvas) return null;
  const mw = (m.right ?? 0) - (m.left ?? 0);
  const mh = (m.bottom ?? 0) - (m.top ?? 0);
  if (mw <= 0 || mh <= 0) return null;

  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = m.defaultColor ? '#ffffff' : '#000000';
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(m.canvas, m.left ?? 0, m.top ?? 0);
  return ctx.getImageData(0, 0, W, H);
}

/**
 * Build the body-part silhouette: alpha 255 inside the UV islands, 0 outside.
 *
 * The official PSDs are inconsistent about which layers they carry, so this tries
 * each known source in turn rather than assuming one exists:
 *   1. "Mask(Disable for export)" - a plate masked to cover everything OUTSIDE the
 *      islands, so its mask is inverted to get the inside.
 *   2. The "Region" group - per-region masks whose union is the inside directly.
 * Returns null only if a file has neither, in which case the caller falls back to a
 * full-canvas base (the pre-existing behaviour).
 */
/**
 * Resolve a layer by "Parent > Child > Layer" path (case-insensitive). Falls back to
 * a unique bare-name match so short overrides work too.
 */
export function findByPath(psd, path) {
  const want = path.split('>').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const matches = [];

  const walk = (nodes, trail) => {
    for (const n of nodes ?? []) {
      const t = [...trail, (n.name ?? '').trim().toLowerCase()];
      const tail = t.slice(-want.length);
      if (tail.length === want.length && tail.every((s, i) => s === want[i])) matches.push(n);
      if (n.children) walk(n.children, t);
    }
  };
  walk(psd.children, []);

  // Duplicate names are common in these files (Genesis has several layers called
  // "Michelin"), so prefer a match that actually carries a mask.
  return matches.find((m) => m.mask?.canvas) ?? matches[0] ?? null;
}

/**
 * Wrap an alpha plate as a silhouette result. `inside` is the binary form the
 * cross-checks below run on, kept alongside the canvas so nothing has to re-read
 * 16M pixels back out of it.
 */
function silhouetteResult(canvas, id, W, H) {
  const inside = new Uint8Array(W * H);
  let n = 0;
  for (let i = 0, p = 3; i < inside.length; i++, p += 4) {
    if (id.data[p] > 127) {
      inside[i] = 1;
      n++;
    }
  }
  canvas.getContext('2d').putImageData(id, 0, 0);
  return { canvas, inside, coverage: n / (W * H) };
}

/** Turn a layer's mask into an inside-the-body silhouette plate. */
function silhouetteFromMask(layer, W, H, invert) {
  const mp = maskPlate(layer, W, H);
  if (!mp) return null;
  const out = createCanvas(W, H);
  const id = out.getContext('2d').createImageData(W, H);
  for (let i = 0; i < id.data.length; i += 4) {
    const lum = (mp.data[i] * 0.299 + mp.data[i + 1] * 0.587 + mp.data[i + 2] * 0.114) | 0;
    id.data[i] = id.data[i + 1] = id.data[i + 2] = 255;
    id.data[i + 3] = invert ? 255 - lum : lum;
  }
  return silhouetteResult(out, id, W, H);
}

/** Silhouette from a layer's own painted pixels, ignoring any mask on it. */
function silhouetteFromAlpha(layer, W, H) {
  if (!layer.canvas) return null;
  const src = createCanvas(W, H);
  src.getContext('2d').drawImage(layer.canvas, layer.left ?? 0, layer.top ?? 0);
  const sd = src.getContext('2d').getImageData(0, 0, W, H).data;

  const out = createCanvas(W, H);
  const id = out.getContext('2d').createImageData(W, H);
  for (let i = 0; i < id.data.length; i += 4) {
    id.data[i] = id.data[i + 1] = id.data[i + 2] = 255;
    id.data[i + 3] = sd[i + 3];
  }
  return silhouetteResult(out, id, W, H);
}

/**
 * Wire-layer intensities at or below this count as the black ground rather than mesh.
 * Real mesh lines sit far higher (the dimmest are ~100); this only catches the render
 * noise some files carry across their black ground (BMW M4 GT3 is the worst).
 */
export const WIRE_NOISE_FLOOR = 8;

/**
 * Closing radius used to turn mesh lines into solid islands, in 4096-canvas pixels.
 * Big enough to bridge the gap across one mesh quad, small enough not to weld
 * neighbouring islands together across the gutters between them - measured against
 * the shipped guides, 2 gives ~95% IoU with the authored outlines and 4 starts
 * bleeding into the surround.
 */
const WIRE_CLOSE_RADIUS = 2;

/**
 * Binary box dilate/erode via an integral image: O(pixels) regardless of radius,
 * which matters at 4096x4096.
 */
function boxMorph(bin, W, H, r, mode) {
  const I = new Uint32Array((W + 1) * (H + 1));
  for (let y = 0; y < H; y++) {
    let row = 0;
    for (let x = 0; x < W; x++) {
      row += bin[y * W + x];
      I[(y + 1) * (W + 1) + x + 1] = I[y * (W + 1) + x + 1] + row;
    }
  }
  const out = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    const y0 = Math.max(0, y - r);
    const y1 = Math.min(H - 1, y + r);
    for (let x = 0; x < W; x++) {
      const x0 = Math.max(0, x - r);
      const x1 = Math.min(W - 1, x + r);
      const sum =
        I[(y1 + 1) * (W + 1) + x1 + 1] -
        I[y0 * (W + 1) + x1 + 1] -
        I[(y1 + 1) * (W + 1) + x0] +
        I[y0 * (W + 1) + x0];
      const area = (x1 - x0 + 1) * (y1 - y0 + 1);
      out[y * W + x] = mode === 'dilate' ? (sum > 0 ? 1 : 0) : sum === area ? 1 : 0;
    }
  }
  return out;
}

/** Set every background pixel that cannot reach the canvas edge - i.e. fill holes. */
function fillEnclosed(bin, W, H) {
  const out = Uint8Array.from(bin);
  const seen = new Uint8Array(W * H);
  const queue = new Int32Array(W * H);
  let head = 0;
  let tail = 0;
  const push = (i) => {
    if (!seen[i] && !bin[i]) {
      seen[i] = 1;
      queue[tail++] = i;
    }
  };
  for (let x = 0; x < W; x++) {
    push(x);
    push((H - 1) * W + x);
  }
  for (let y = 0; y < H; y++) {
    push(y * W);
    push(y * W + W - 1);
  }
  while (head < tail) {
    const i = queue[head++];
    const x = i % W;
    const y = (i / W) | 0;
    if (x > 0) push(i - 1);
    if (x < W - 1) push(i + 1);
    if (y > 0) push(i - W);
    if (y < H - 1) push(i + W);
  }
  for (let i = 0; i < out.length; i++) if (!bin[i] && !seen[i]) out[i] = 1;
  return out;
}

/**
 * Silhouette reconstructed from the UV wireframe itself.
 *
 * Every template ships the mesh as its top-most layer, and the mesh is drawn on
 * exactly the UV islands - so closing the line work into solid shapes recovers the
 * body outline from the one layer whose meaning never varies between files. That
 * makes it the safety net for files whose authored outline is missing or wrong,
 * which is otherwise invisible: the guide simply bakes black over the panels it
 * dropped, and the mask leaves them unpaintable in the editor.
 */
export function silhouetteFromWire(wire, W, H, { floor = WIRE_NOISE_FLOOR } = {}) {
  if (!wire?.canvas) return null;
  const src = createCanvas(W, H);
  src.getContext('2d').drawImage(wire.canvas, wire.left ?? 0, wire.top ?? 0);
  const d = src.getContext('2d').getImageData(0, 0, W, H).data;

  const lines = new Uint8Array(W * H);
  for (let i = 0, p = 0; i < lines.length; i++, p += 4) {
    // Same intensity test the guide's inversion uses, so "is this mesh?" is answered
    // identically in both places.
    lines[i] = d[p + 3] > 0 && Math.max(d[p], d[p + 1], d[p + 2]) > floor ? 1 : 0;
  }

  const r = Math.max(1, Math.round((WIRE_CLOSE_RADIUS * Math.max(W, H)) / 4096));
  const solid = boxMorph(fillEnclosed(boxMorph(lines, W, H, r, 'dilate'), W, H), W, H, r, 'erode');

  const out = createCanvas(W, H);
  const id = out.getContext('2d').createImageData(W, H);
  for (let i = 0, p = 0; i < solid.length; i++, p += 4) {
    id.data[p] = id.data[p + 1] = id.data[p + 2] = 255;
    id.data[p + 3] = solid[i] ? 255 : 0;
  }
  return silhouetteResult(out, id, W, H);
}

/** Share of `b`'s pixels that `a` also covers. */
function overlap(a, b) {
  let both = 0;
  let n = 0;
  for (let i = 0; i < b.length; i++) {
    if (!b[i]) continue;
    n++;
    if (a[i]) both++;
  }
  return n ? both / n : 0;
}

/**
 * A wire silhouette this far outside the usual 40-75% island coverage is not a body
 * outline - a mesh render that failed to threshold would land at 0% or 100% - so it
 * is not trusted to overrule an authored outline.
 */
const WIRE_SANE = [0.15, 0.9];

/**
 * How much of the mesh an authored outline may drop before the wire replaces it.
 * The shipped-and-correct outlines track the mesh to within a few percent; the Aston
 * Valkyrie's `region > Region 1` - one material selector out of several, not the body
 * outline - dropped well over half of it.
 */
const MAX_DROPPED = 0.15;

/** The outline as the PSD's author drew it, before it is checked against the mesh. */
function authoredSilhouette(psd, W, H, explicitPath) {
  const kids = psd.children ?? [];

  // An explicit override wins: several files carry the body outline on a layer whose
  // name gives no clue (Genesis GMR-001 has it under "Car Stickers > Michelin >
  // Michelin"), so those are named in the manifest rather than guessed at by coverage
  // heuristics.
  if (explicitPath) {
    const layer = findByPath(psd, explicitPath);
    if (!layer) return { rejected: `layer not found: ${explicitPath}` };

    const r = silhouetteFromMask(layer, W, H, false);
    if (r && r.coverage >= 0.05) {
      return { ...r, source: `${explicitPath} mask ${(r.coverage * 100).toFixed(0)}%` };
    }

    // Some files keep the outline in the fill layer's own pixels and use the mask to
    // hide it instead (Ligier JS P325 does this with "Numplate > Fill layer 1"), so
    // fall back to the layer's raster alpha, ignoring the mask entirely.
    const a = silhouetteFromAlpha(layer, W, H);
    if (a && a.coverage >= 0.05) {
      return { ...a, source: `${explicitPath} shape ${(a.coverage * 100).toFixed(0)}%` };
    }
    return { rejected: `no usable outline on: ${explicitPath}` };
  }

  // Three spellings occur in the shipped pack: "Mask(Disable for export)",
  // "Mask - Disable for export" (Mercedes AMG) and the typo "Maks(...)" (SC63).
  const surround = kids.find((k) => SURROUND_RE.test((k.name ?? '').trim()));
  const sp = surround ? maskPlate(surround, W, H) : null;
  if (!sp) return { rejected: 'no surround plate' };

  const out = createCanvas(W, H);
  const id = out.getContext('2d').createImageData(W, H);
  for (let i = 0; i < id.data.length; i += 4) {
    const lum = (sp.data[i] * 0.299 + sp.data[i + 1] * 0.587 + sp.data[i + 2] * 0.114) | 0;
    id.data[i] = id.data[i + 1] = id.data[i + 2] = 255;
    id.data[i + 3] = 255 - lum; // plate covers OUTSIDE -> invert for inside
  }
  const plate = silhouetteResult(out, id, W, H);
  // A silhouette covering almost nothing means this file uses the plate for
  // something other than the body outline (Porsche 963 does).
  if (plate.coverage < 0.05) {
    return { rejected: `surround coverage ${(plate.coverage * 100).toFixed(1)}%` };
  }
  return { ...plate, source: `Mask(Disable for export) ${(plate.coverage * 100).toFixed(0)}%` };
}

/**
 * Build the body-part silhouette: alpha 255 inside the UV islands, 0 outside.
 *
 * The authored outline is preferred - it is what the template's author drew, edges
 * and all - but it is only kept if it agrees with the wireframe, which is the one
 * layer in the pack whose meaning never varies. An outline that drops a large part of
 * the mesh is not an outline, and the mesh-derived shape replaces it.
 *
 * NOTE: the "Region" group is deliberately NOT used as a fallback. Its children are
 * material selectors (Carbon Fibre / Chrome / Car Wrap / ...), not a body outline -
 * unioning them yields either the whole canvas or almost none of it, and picking one
 * of them yields the panels made of that one material. That is what left the Aston
 * Martin Valkyrie's guide and mask covering 42% of its islands.
 */
export function buildSilhouette(psd, W, H, explicitPath) {
  const authored = authoredSilhouette(psd, W, H, explicitPath);
  const wire = silhouetteFromWire(topLayer(psd), W, H);
  const wireSane = wire && wire.coverage >= WIRE_SANE[0] && wire.coverage <= WIRE_SANE[1];
  const wireSource = wire ? `wireframe ${(wire.coverage * 100).toFixed(0)}%` : null;

  if (authored.canvas) {
    if (!wireSane) return { canvas: authored.canvas, source: authored.source };

    const dropped = 1 - overlap(authored.inside, wire.inside);
    if (dropped <= MAX_DROPPED) {
      return { canvas: authored.canvas, source: `${authored.source}, mesh -${(dropped * 100).toFixed(0)}%` };
    }
    // Only overrule an outline the mesh *contains*: a shape that sits somewhere else
    // entirely is a different problem, and silently swapping it would hide it.
    if (overlap(wire.inside, authored.inside) >= 0.9) {
      return {
        canvas: wire.canvas,
        source: `${wireSource} (replaces ${authored.source}: dropped ${(dropped * 100).toFixed(0)}% of the mesh)`,
      };
    }
    return {
      canvas: authored.canvas,
      source: authored.source,
      warning: `outline disagrees with the mesh: drops ${(dropped * 100).toFixed(0)}% of it`,
    };
  }

  if (wireSane) return { canvas: wire.canvas, source: `${wireSource} (no authored outline: ${authored.rejected})` };
  return { canvas: null, source: null, rejected: authored.rejected };
}

/** Find a top-level (or nested) group by exact name, case-insensitive. */
export function findGroup(nodes, name) {
  const want = name.trim().toLowerCase();
  for (const n of nodes ?? []) {
    if (n.name && n.name.trim().toLowerCase() === want) return n;
    if (n.children) {
      const hit = findGroup(n.children, name);
      if (hit) return hit;
    }
  }
  return null;
}
