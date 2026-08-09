// Shared image-optimisation helpers used by the admin "Optimise storage"
// migration. Runs in the browser (needs a canvas to re-encode to WebP).

const MAX = 2048;

// Re-encode a data: image URL to WebP (capped at 2048px). Returns the input
// unchanged for non-data URLs, images that fail to load, or images that are
// already small WebP (nothing to gain). Never rejects.
export function reencodeToWebp(dataUrl) {
  return new Promise((resolve) => {
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const alreadyWebp = dataUrl.startsWith('data:image/webp');
      if (alreadyWebp && Math.max(w, h) <= MAX) { resolve(dataUrl); return; }
      const scale = Math.min(1, MAX / Math.max(w, h));
      const rw = Math.max(1, Math.round(w * scale));
      const rh = Math.max(1, Math.round(h * scale));
      const canvas = document.createElement('canvas');
      canvas.width = rw;
      canvas.height = rh;
      canvas.getContext('2d').drawImage(img, 0, 0, rw, rh);
      let out = dataUrl;
      try {
        const webp = canvas.toDataURL('image/webp', 0.92);
        // Only adopt it if it's genuinely WebP and actually smaller.
        if (webp.startsWith('data:image/webp') && webp.length < dataUrl.length) out = webp;
      } catch {
        /* keep original */
      }
      resolve(out);
    };
    img.onerror = () => resolve(dataUrl); // dead image — leave untouched
    img.src = dataUrl;
  });
}

// Reverse the in-design `ref:<layerId>` de-duplication back to real URLs.
function resolveRefs(layers) {
  const byId = new Map((layers || []).map((l) => [l.id, l]));
  return (layers || []).map((l) => {
    if (l.type === 'image' && typeof l.imageUrl === 'string' && l.imageUrl.startsWith('ref:')) {
      const target = byId.get(l.imageUrl.slice(4));
      return { ...l, imageUrl: target?.imageUrl ?? null };
    }
    return l;
  });
}

// De-duplicate identical image bytes within a design: keep the first, point the
// rest at it via `ref:<layerId>`.
function dedupe(layers) {
  const firstByUrl = new Map();
  return layers.map((l) => {
    if (l.type === 'image' && typeof l.imageUrl === 'string' && !l.imageUrl.startsWith('ref:')) {
      const owner = firstByUrl.get(l.imageUrl);
      if (owner) return { ...l, imageUrl: `ref:${owner}` };
      firstByUrl.set(l.imageUrl, l.id);
    }
    return l;
  });
}

// Optimise one design's layers: resolve refs → re-encode each unique image to
// WebP → de-duplicate. Returns { layers, before, after } where before/after are
// serialized byte lengths (a good proxy for the row size, which is dominated by
// the base64 image data). Only re-encodes images; every other field is
// preserved untouched, and the result is idempotent (re-running is a no-op).
export async function optimizeDesignLayers(layers) {
  const before = JSON.stringify(layers || []).length;
  const resolved = resolveRefs(layers);
  const cache = new Map(); // original url -> re-encoded url (encode each once)
  const reencoded = [];
  for (const layer of resolved) {
    if (layer.type === 'image' && typeof layer.imageUrl === 'string' && layer.imageUrl.startsWith('data:')) {
      if (!cache.has(layer.imageUrl)) cache.set(layer.imageUrl, await reencodeToWebp(layer.imageUrl));
      reencoded.push({ ...layer, imageUrl: cache.get(layer.imageUrl) });
    } else {
      reencoded.push(layer);
    }
  }
  const optimized = dedupe(reencoded);
  const after = JSON.stringify(optimized).length;
  return { layers: optimized, before, after };
}
