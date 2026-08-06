/**
 * Load an image file (including SVG) and produce a bitmap-backed Image element
 * ready to be used as a canvas layer.
 *
 * SVGs are rasterized to a PNG data URL so they:
 *   - have a known pixel size,
 *   - don't taint the canvas (which would break TGA export via getImageData).
 *
 * Calls onReady(url, width, height, imgElement).
 */
export function loadImageFile(file, onReady) {
  if (!file || !file.type.startsWith('image/')) return;

  const isSvg = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name || '');

  if (isSvg) {
    const reader = new FileReader();
    reader.onload = () => {
      const svgText = reader.result;
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, 'image/svg+xml');
      const svgEl = doc.documentElement;
      let w = parseFloat(svgEl.getAttribute('width')) || 0;
      let h = parseFloat(svgEl.getAttribute('height')) || 0;
      if ((!w || !h) && svgEl.getAttribute('viewBox')) {
        const vb = svgEl.getAttribute('viewBox').split(/[\s,]+/).map(Number);
        if (vb.length === 4) { w = w || vb[2]; h = h || vb[3]; }
      }
      if (!w || !h) { w = 1024; h = 1024; }
      const MAX = 2048;
      const scale = Math.min(1, MAX / Math.max(w, h));
      const rw = Math.max(1, Math.round(w * scale));
      const rh = Math.max(1, Math.round(h * scale));

      // Use a data: URL (not blob:) so the canvas isn't tainted on toDataURL().
      const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
      const svgImg = new Image();
      svgImg.crossOrigin = 'anonymous';
      svgImg.onload = () => {
        const off = document.createElement('canvas');
        off.width = rw; off.height = rh;
        off.getContext('2d').drawImage(svgImg, 0, 0, rw, rh);
        const pngUrl = off.toDataURL('image/png');
        const finalImg = new Image();
        finalImg.onload = () => onReady(pngUrl, finalImg.naturalWidth, finalImg.naturalHeight, finalImg);
        finalImg.src = pngUrl;
      };
      svgImg.src = svgDataUrl;
    };
    reader.readAsText(file);
    return;
  }

  // Use a data: URL (not a blob: object URL) so the image bytes are embedded in
  // the layer and survive being saved to the database and reloaded in a later
  // session. Blob URLs are only valid for the lifetime of the current document,
  // so a saved design would come back with a dead image reference.
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      // Cap the stored resolution. Images are embedded as base64 in the saved
      // design, so a full-res phone photo / 4K logo bloats the row and can make
      // the save exceed the database statement timeout. 2048px is plenty for a
      // livery and keeps rows small. Smaller images are passed through untouched
      // so we never needlessly re-encode (and lose quality on) a normal logo.
      const MAX = 2048;
      if (Math.max(w, h) <= MAX) {
        onReady(dataUrl, w, h, img);
        return;
      }
      const scale = MAX / Math.max(w, h);
      const rw = Math.max(1, Math.round(w * scale));
      const rh = Math.max(1, Math.round(h * scale));
      const off = document.createElement('canvas');
      off.width = rw;
      off.height = rh;
      off.getContext('2d').drawImage(img, 0, 0, rw, rh);
      // PNG keeps transparency (logos/decals rely on it).
      const scaledUrl = off.toDataURL('image/png');
      const finalImg = new Image();
      finalImg.onload = () => onReady(scaledUrl, finalImg.naturalWidth, finalImg.naturalHeight, finalImg);
      finalImg.src = scaledUrl;
    };
    img.src = dataUrl;
  };
  reader.readAsDataURL(file);
}