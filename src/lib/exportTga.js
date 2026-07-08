/**
 * Encodes a canvas as a TGA byte array.
 * Uses uncompressed 32-bit BGRA TGA type 2.
 */
export function getTgaBytes(canvas) {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');
  const pixels = ctx.getImageData(0, 0, width, height).data;

  const header = new Uint8Array(18);
  header[2] = 2; // uncompressed true-color
  header[12] = width & 0xFF;
  header[13] = (width >> 8) & 0xFF;
  header[14] = height & 0xFF;
  header[15] = (height >> 8) & 0xFF;
  header[16] = 32;    // bits per pixel
  header[17] = 0x28; // top-left origin + 8 alpha bits

  const pixelCount = width * height;
  const body = new Uint8Array(pixelCount * 4);
  for (let i = 0; i < pixelCount; i++) {
    const s = i * 4;
    body[s + 0] = pixels[s + 2]; // B
    body[s + 1] = pixels[s + 1]; // G
    body[s + 2] = pixels[s + 0]; // R
    body[s + 3] = pixels[s + 3]; // A
  }

  const tga = new Uint8Array(header.length + body.length);
  tga.set(header, 0);
  tga.set(body, header.length);
  return tga;
}

/**
 * Encodes a canvas as a TGA file and triggers a browser download.
 */
export function exportCanvasAsTga(canvas, filename = 'livery.tga') {
  const tga = getTgaBytes(canvas);
  const blob = new Blob([tga], { type: 'image/x-tga' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  // Defer cleanup so the browser can finish initiating the download
  // before the blob URL is revoked (fixes intermittent failure when
  // another window.open() steals focus right after).
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}