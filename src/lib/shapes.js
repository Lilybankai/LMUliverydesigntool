export const SHAPE_TYPES = [
  // --- Basic Shapes ---
  { id: 'rectangle',     label: 'Rectangle',      icon: '▬', group: 'shapes', defaultProps: { width: 400, height: 200, rx: 0 } },
  { id: 'roundrect',     label: 'Rounded Rect',   icon: '▢', group: 'shapes', defaultProps: { width: 400, height: 200, rx: 40 } },
  { id: 'stripe',        label: 'Full Stripe',    icon: '▐', group: 'shapes', defaultProps: { width: 80, height: 4096, rx: 0 } },
  { id: 'circle',        label: 'Circle',         icon: '●', group: 'shapes', defaultProps: { width: 200, height: 200 } },
  { id: 'ellipse',       label: 'Ellipse',        icon: '⬭', group: 'shapes', defaultProps: { width: 400, height: 200 } },
  { id: 'triangle',      label: 'Triangle',       icon: '▲', group: 'shapes', defaultProps: { width: 300, height: 300 } },
  { id: 'right_triangle',label: 'Right Triangle', icon: '◺', group: 'shapes', defaultProps: { width: 300, height: 300 } },
  { id: 'diamond',       label: 'Diamond',        icon: '◆', group: 'shapes', defaultProps: { width: 250, height: 350 } },
  { id: 'pentagon',      label: 'Pentagon',       icon: '⬠', group: 'shapes', defaultProps: { width: 280, height: 280 } },
  { id: 'hexagon',       label: 'Hexagon',        icon: '⬡', group: 'shapes', defaultProps: { width: 280, height: 280 } },
  { id: 'star',          label: 'Star',           icon: '★', group: 'shapes', defaultProps: { width: 260, height: 260 } },
  { id: 'arrow',         label: 'Arrow',          icon: '➤', group: 'shapes', defaultProps: { width: 400, height: 200 } },
  { id: 'chevron',       label: 'Chevron',        icon: '❯', group: 'shapes', defaultProps: { width: 300, height: 300 } },
  { id: 'diagonal_band', label: 'Diagonal Band',  icon: '╱', group: 'shapes', defaultProps: { width: 200, height: 600 } },
  { id: 'parallelogram', label: 'Parallelogram',  icon: '▱', group: 'shapes', defaultProps: { width: 400, height: 180 } },
  { id: 'trapezoid',     label: 'Trapezoid',      icon: '⏢', group: 'shapes', defaultProps: { width: 400, height: 200 } },

  // --- Patterns ---
  { id: 'pat_stripes',      label: 'Racing Stripes',  icon: '≡', group: 'patterns', defaultProps: { width: 600, height: 400 } },
  { id: 'pat_checker',      label: 'Checkerboard',    icon: '⊞', group: 'patterns', defaultProps: { width: 400, height: 400 } },
  { id: 'pat_polka',        label: 'Polka Dots',      icon: '⁙', group: 'patterns', defaultProps: { width: 500, height: 400 } },
  { id: 'pat_zigzag',       label: 'Zigzag',          icon: '⩕', group: 'patterns', defaultProps: { width: 600, height: 300 } },
  { id: 'pat_houndstooth',  label: 'Houndstooth',     icon: '◪', group: 'patterns', defaultProps: { width: 500, height: 500 } },
  { id: 'pat_crosshatch',   label: 'Crosshatch',      icon: '⊠', group: 'patterns', defaultProps: { width: 500, height: 400 } },
  { id: 'pat_diagonal_stripes', label: 'Diagonal Stripes', icon: '▨', group: 'patterns', defaultProps: { width: 600, height: 400 } },
  { id: 'pat_honeycomb',    label: 'Honeycomb',       icon: '⬡', group: 'patterns', defaultProps: { width: 600, height: 500 } },
  { id: 'pat_carbon',       label: 'Carbon Fibre',    icon: '▦', group: 'patterns', defaultProps: { width: 500, height: 500 } },
  { id: 'pat_herringbone',  label: 'Herringbone',     icon: '❮❯', group: 'patterns', defaultProps: { width: 600, height: 400 } },

  // --- Textures ---
  { id: 'tex_waves',        label: 'Waves',           icon: '〜', group: 'textures', defaultProps: { width: 700, height: 300 } },
  { id: 'tex_wavy_lines',   label: 'Wavy Lines',      icon: '≈', group: 'textures', defaultProps: { width: 700, height: 400 } },
  { id: 'tex_camo',         label: 'Camouflage',      icon: '🟢', group: 'textures', defaultProps: { width: 700, height: 500 } },
  { id: 'tex_noise',        label: 'Grain / Noise',   icon: '░', group: 'textures', defaultProps: { width: 500, height: 500 } },
  { id: 'tex_brushed',      label: 'Brushed Metal',   icon: '▤', group: 'textures', defaultProps: { width: 600, height: 400 } },
  { id: 'tex_circuit',      label: 'Circuit Board',   icon: '⌗', group: 'textures', defaultProps: { width: 700, height: 500 } },
  { id: 'tex_scales',       label: 'Fish Scales',     icon: '〾', group: 'textures', defaultProps: { width: 600, height: 500 } },
  { id: 'tex_leopard',      label: 'Leopard Spots',   icon: '❂', group: 'textures', defaultProps: { width: 600, height: 500 } },
  { id: 'tex_splatter',     label: 'Paint Splatter',  icon: '✦', group: 'textures', defaultProps: { width: 600, height: 500 } },
  { id: 'tex_halftone',     label: 'Halftone',        icon: '∷', group: 'textures', defaultProps: { width: 600, height: 500 } },
];

export const SHAPE_GROUPS = [
  { id: 'shapes',   label: 'Shapes' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'textures', label: 'Textures' },
];

export const TEXT_DEFAULTS = {
  text: 'TEXT',
  fontFamily: 'Rajdhani',
  fontSize: 144,
  fontWeight: 'bold',
  fontStyle: 'normal',
  textAlign: 'center',
  letterSpacing: 0,
  strokeColour: '#000000',
  strokeWidth: 0,
};

// corners: [TL, TR, BR, BL] each {dx, dy} offset from the base corner position
export const DEFAULT_CORNERS = [
  { dx: 0, dy: 0 },
  { dx: 0, dy: 0 },
  { dx: 0, dy: 0 },
  { dx: 0, dy: 0 },
];

// edges: [Top, Right, Bottom, Left] each {dx, dy} offset (in local coords) from
// the straight edge midpoint. Used as the control point of a quadratic Bezier
// curve between two adjacent corners — allowing the user to bend each edge.
export const DEFAULT_EDGES = [
  { dx: 0, dy: 0 },
  { dx: 0, dy: 0 },
  { dx: 0, dy: 0 },
  { dx: 0, dy: 0 },
];

export function createTextLayer(canvasWidth, canvasHeight) {
  const width = 800;
  const height = 200;
  return {
    id: crypto.randomUUID(),
    type: 'text',
    x: canvasWidth / 2 - width / 2,
    y: canvasHeight / 2 - height / 2,
    width,
    height,
    rx: 0,
    rotation: 0,
    skewX: 0,
    flipX: false,
    flipY: false,
    corners: DEFAULT_CORNERS.map(c => ({ ...c })),
    edges: DEFAULT_EDGES.map(e => ({ ...e })),
    colour: '#FFFFFF',
    colour2: '#FFFFFF',
    opacity: 1,
    visible: true,
    label: 'Text',
    ...TEXT_DEFAULTS,
  };
}

export function createLayer(shapeType, canvasWidth, canvasHeight) {
  const type = SHAPE_TYPES.find(s => s.id === shapeType);
  const defaults = type?.defaultProps || { width: 300, height: 200 };
  return {
    id: crypto.randomUUID(),
    type: shapeType,
    x: canvasWidth / 2 - (defaults.width || 300) / 2,
    y: canvasHeight / 2 - (defaults.height || 200) / 2,
    width: defaults.width || 300,
    height: defaults.height || 200,
    rx: defaults.rx || 0,
    rotation: 0,
    skewX: 0,
    flipX: false,
    flipY: false,
    corners: DEFAULT_CORNERS.map(c => ({ ...c })),
    edges: DEFAULT_EDGES.map(e => ({ ...e })),
    colour: '#E63946',
    colour2: '#FFFFFF',
    opacity: 1,
    visible: true,
    label: type?.label || shapeType,
  };
}

// Mirror an array of canvas-space points around the layer's centre, respecting
// flipX/flipY. Also reorders the array so that the logical role of each index
// (TL/TR/BR/BL for corners or Top/Right/Bottom/Left for edges) stays consistent
// with what's rendered after a flip.
function applyFlipToPoints(pts, layer, isEdges) {
  if (!layer.flipX && !layer.flipY) return pts;
  const cx = layer.x + layer.width / 2;
  const cy = layer.y + layer.height / 2;
  let out = pts.map(p => ({
    x: layer.flipX ? cx - (p.x - cx) : p.x,
    y: layer.flipY ? cy - (p.y - cy) : p.y,
  }));
  if (layer.flipX) {
    // corners [TL,TR,BR,BL] -> swap TL<->TR, BL<->BR
    // edges   [Top,Right,Bottom,Left] -> swap Right<->Left
    out = isEdges
      ? [out[0], out[3], out[2], out[1]]
      : [out[1], out[0], out[3], out[2]];
  }
  if (layer.flipY) {
    // corners [TL,TR,BR,BL] -> swap TL<->BL, TR<->BR
    // edges   [Top,Right,Bottom,Left] -> swap Top<->Bottom
    out = isEdges
      ? [out[2], out[1], out[0], out[3]]
      : [out[3], out[2], out[1], out[0]];
  }
  return out;
}

// Returns the 4 actual canvas points [TL, TR, BR, BL] for a layer (after rotation+skew+distort+flip)
export function getLayerCornerPoints(layer) {
  const corners = layer.corners || DEFAULT_CORNERS;
  const hw = layer.width / 2;
  const hh = layer.height / 2;
  const cx = layer.x + hw;
  const cy = layer.y + hh;
  const rad = (layer.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const skewTan = Math.tan(((layer.skewX || 0) * Math.PI) / 180);

  const localPts = [
    { x: -hw + corners[0].dx, y: -hh + corners[0].dy },
    { x:  hw + corners[1].dx, y: -hh + corners[1].dy },
    { x:  hw + corners[2].dx, y:  hh + corners[2].dy },
    { x: -hw + corners[3].dx, y:  hh + corners[3].dy },
  ];

  const pts = localPts.map(({ x, y }) => {
    const sx = x + y * skewTan;
    const sy = y;
    return {
      x: cx + sx * cos - sy * sin,
      y: cy + sx * sin + sy * cos,
    };
  });
  return applyFlipToPoints(pts, layer, false);
}

// Returns the 4 edge-midpoint handle positions in canvas space [Top, Right, Bottom, Left].
// Each is the quadratic Bezier control point — when dragged, it bends the edge.
export function getLayerEdgePoints(layer) {
  const edges = layer.edges || DEFAULT_EDGES;
  const hw = layer.width / 2;
  const hh = layer.height / 2;
  const cx = layer.x + hw;
  const cy = layer.y + hh;
  const rad = (layer.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const skewTan = Math.tan(((layer.skewX || 0) * Math.PI) / 180);

  // Top, Right, Bottom, Left midpoints in local coords + edge offsets
  const localPts = [
    { x:   0 + edges[0].dx, y: -hh + edges[0].dy }, // Top
    { x:  hw + edges[1].dx, y:   0 + edges[1].dy }, // Right
    { x:   0 + edges[2].dx, y:  hh + edges[2].dy }, // Bottom
    { x: -hw + edges[3].dx, y:   0 + edges[3].dy }, // Left
  ];

  const pts = localPts.map(({ x, y }) => {
    const sx = x + y * skewTan;
    const sy = y;
    return {
      x: cx + sx * cos - sy * sin,
      y: cy + sx * sin + sy * cos,
    };
  });
  return applyFlipToPoints(pts, layer, true);
}

// Quadratic Bezier interpolation at parameter t between two corners
// with the edge's offset midpoint as control point. The edge offset is doubled
// because for a quadratic Bezier, the curve passes 1/2 way toward the control point.
function bezierEdgePoint(p0, p1, edgeMid, t) {
  // Straight midpoint
  const sm = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
  // Control point that makes the curve pass exactly through edgeMid at t=0.5:
  // edgeMid = 0.25*p0 + 0.5*ctrl + 0.25*p1  =>  ctrl = 2*edgeMid - 0.5*(p0+p1)
  const ctrl = { x: 2 * edgeMid.x - sm.x, y: 2 * edgeMid.y - sm.y };
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * ctrl.x + t * t * p1.x,
    y: mt * mt * p0.y + 2 * mt * t * ctrl.y + t * t * p1.y,
  };
}

// ─── Gradient fill helper ───────────────────────────────────────────────────

// Build a CanvasGradient for a layer's gradient settings, applied inside the
// rectangle [x1,y1] -> [x2,y2] in the CURRENT ctx coord space.
// Returns null if the layer has no gradient enabled.
function buildLayerGradient(ctx, layer, x1, y1, x2, y2) {
  const g = layer.gradient;
  if (!g || !g.enabled || !g.stops || g.stops.length < 2) return null;
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const w = x2 - x1;
  const h = y2 - y1;

  let grad;
  if (g.kind === 'radial') {
    const r = Math.max(Math.abs(w), Math.abs(h)) / 2;
    grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  } else {
    // Linear — angle in degrees, 0° = top -> bottom (vertical)
    const rad = ((g.angle ?? 0) - 90) * Math.PI / 180;
    // Project onto the diagonal so the gradient spans the rect fully
    const diag = (Math.abs(Math.cos(rad)) * Math.abs(w) + Math.abs(Math.sin(rad)) * Math.abs(h)) / 2;
    const dx = Math.cos(rad) * diag;
    const dy = Math.sin(rad) * diag;
    grad = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
  }
  const stops = [...g.stops].sort((a, b) => a.offset - b.offset);
  for (const s of stops) {
    grad.addColorStop(Math.max(0, Math.min(1, s.offset)), s.color);
  }
  return grad;
}

// Returns the fillStyle to use — gradient if enabled, otherwise the fallback.
// `localBox` is [x1,y1,x2,y2] of the layer's bounding rect in the ctx's current coord space.
function fillStyleFor(ctx, layer, fallback, localBox) {
  const grad = buildLayerGradient(ctx, layer, ...localBox);
  return grad || fallback;
}

// ─── Pattern / Texture drawing helpers ─────────────────────────────────────

// Render fn into an offscreen canvas, then warp it onto the distorted quad
// using affine-mapped triangles (the only way to do quad warping in Canvas 2D).
// When edges are curved, we subdivide into an NxN grid of triangles so the bend
// is approximated smoothly.
// `centered` = true means fn draws in coords centred at (0,0) (-hw..hw, -hh..hh).
// `centered` = false means fn draws in top-left coords (0..w, 0..h).
function drawWarped(ctx, layer, fn, centered = true) {
  const w = layer.width;
  const h = layer.height;
  const hw = w / 2;
  const hh = h / 2;

  // Draw content into offscreen canvas at natural size
  const off = document.createElement('canvas');
  off.width = Math.ceil(w);
  off.height = Math.ceil(h);
  const oc = off.getContext('2d');
  if (centered) oc.translate(hw, hh);
  fn(oc, hw, hh, w, h);
  oc.setTransform(1, 0, 0, 1, 0, 0);

  // Get the 4 destination points in canvas space [TL, TR, BR, BL]
  // (already includes flip mirroring via getLayerCornerPoints/getLayerEdgePoints)
  const pts = getLayerCornerPoints(layer);
  const edgePts = getLayerEdgePoints(layer);
  const edges = layer.edges || DEFAULT_EDGES;
  const edgesBent = edges.some(e => e.dx !== 0 || e.dy !== 0);

  ctx.save();
  ctx.globalAlpha = layer.opacity;

  if (!edgesBent) {
    // Fast path — two triangles cover the straight-edged quad
    drawTriangle(ctx, off,
      pts[0], pts[1], pts[2],
      { x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }
    );
    drawTriangle(ctx, off,
      pts[0], pts[2], pts[3],
      { x: 0, y: 0 }, { x: w, y: h }, { x: 0, y: h }
    );
    ctx.restore();
    return;
  }

  // Curved-edge path — build an N×N grid where each row/col is a Bezier curve.
  const N = 16;
  // Precompute destination grid (canvas-space) and source grid (offscreen-space)
  // pts: [TL=0, TR=1, BR=2, BL=3]; edgePts: [Top=0, Right=1, Bottom=2, Left=3]
  const dst = [];
  for (let j = 0; j <= N; j++) {
    const t = j / N;
    // Left/Right edges at row t (interpolate corner pairs along left & right curves)
    const leftPt  = bezierEdgePoint(pts[0], pts[3], edgePts[3], t);
    const rightPt = bezierEdgePoint(pts[1], pts[2], edgePts[1], t);
    const row = [];
    for (let i = 0; i <= N; i++) {
      const s = i / N;
      // Top/Bottom edges at col s
      const topPt    = bezierEdgePoint(pts[0], pts[1], edgePts[0], s);
      const bottomPt = bezierEdgePoint(pts[3], pts[2], edgePts[2], s);
      // Coons-style blend: average horizontal and vertical interpolations,
      // minus the bilinear blend of the 4 corners (standard transfinite Coons patch).
      const hX = (1 - s) * leftPt.x + s * rightPt.x;
      const hY = (1 - s) * leftPt.y + s * rightPt.y;
      const vX = (1 - t) * topPt.x + t * bottomPt.x;
      const vY = (1 - t) * topPt.y + t * bottomPt.y;
      const bX = (1 - s) * (1 - t) * pts[0].x + s * (1 - t) * pts[1].x
               + s * t * pts[2].x + (1 - s) * t * pts[3].x;
      const bY = (1 - s) * (1 - t) * pts[0].y + s * (1 - t) * pts[1].y
               + s * t * pts[2].y + (1 - s) * t * pts[3].y;
      row.push({ x: hX + vX - bX, y: hY + vY - bY });
    }
    dst.push(row);
  }

  // Source grid is a uniform N×N rectangle in offscreen coords
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const s0x = (i / N) * w, s0y = (j / N) * h;
      const s1x = ((i + 1) / N) * w, s1y = (j / N) * h;
      const s2x = ((i + 1) / N) * w, s2y = ((j + 1) / N) * h;
      const s3x = (i / N) * w, s3y = ((j + 1) / N) * h;

      drawTriangle(ctx, off,
        dst[j][i], dst[j][i + 1], dst[j + 1][i + 1],
        { x: s0x, y: s0y }, { x: s1x, y: s1y }, { x: s2x, y: s2y }
      );
      drawTriangle(ctx, off,
        dst[j][i], dst[j + 1][i + 1], dst[j + 1][i],
        { x: s0x, y: s0y }, { x: s2x, y: s2y }, { x: s3x, y: s3y }
      );
    }
  }

  ctx.restore();
}

// Draw a triangle of `img` mapped from src points to dst points using affine transform.
function drawTriangle(ctx, img, d0, d1, d2, s0, s1, s2) {
  ctx.save();

  // Clip to destination triangle
  ctx.beginPath();
  ctx.moveTo(d0.x, d0.y);
  ctx.lineTo(d1.x, d1.y);
  ctx.lineTo(d2.x, d2.y);
  ctx.closePath();
  ctx.clip();

  // Solve affine transform: src -> dst
  // [a c e] [sx]   [dx]
  // [b d f] [sy] = [dy]
  // We have 3 point correspondences → 6 equations for 6 unknowns
  const denom = (s0.x * (s1.y - s2.y) + s1.x * (s2.y - s0.y) + s2.x * (s0.y - s1.y));
  if (Math.abs(denom) < 1e-10) { ctx.restore(); return; }

  const a = ((d0.x * (s1.y - s2.y) + d1.x * (s2.y - s0.y) + d2.x * (s0.y - s1.y)) / denom);
  const b = ((d0.y * (s1.y - s2.y) + d1.y * (s2.y - s0.y) + d2.y * (s0.y - s1.y)) / denom);
  const c = ((s0.x * (d1.x - d2.x) + s1.x * (d2.x - d0.x) + s2.x * (d0.x - d1.x)) / denom);
  const d = ((s0.x * (d1.y - d2.y) + s1.x * (d2.y - d0.y) + s2.x * (d0.y - d1.y)) / denom);
  const e = d0.x - a * s0.x - c * s0.y;
  const f = d0.y - b * s0.x - d * s0.y;

  ctx.transform(a, b, c, d, e, f);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

function withClipRect(ctx, layer, fn) {
  const hw = layer.width / 2;
  const hh = layer.height / 2;
  const corners = layer.corners || DEFAULT_CORNERS;
  const edges = layer.edges || DEFAULT_EDGES;
  const hasDistort = corners.some(c => c.dx !== 0 || c.dy !== 0)
                  || edges.some(e => e.dx !== 0 || e.dy !== 0);

  if (hasDistort) {
    drawWarped(ctx, layer, fn);
    return;
  }

  // No distortion — simple transform + clip
  ctx.save();
  ctx.globalAlpha = layer.opacity;
  const cx = layer.x + hw;
  const cy = layer.y + hh;
  ctx.translate(cx, cy);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  if (layer.flipX) ctx.scale(-1, 1);
  if (layer.flipY) ctx.scale(1, -1);
  if (layer.skewX) ctx.transform(1, 0, Math.tan((layer.skewX * Math.PI) / 180), 1, 0, 0);
  ctx.beginPath();
  ctx.rect(-hw, -hh, layer.width, layer.height);
  ctx.clip();
  fn(ctx, hw, hh, layer.width, layer.height);
  ctx.restore();
}

function drawPatStripes(ctx, layer) {
  const c1 = layer.colour;
  const c2 = layer.colour2 || '#FFFFFF';
  withClipRect(ctx, layer, (c, hw, hh, w, h) => {
    const stripeW = Math.max(20, w / 8);
    c.fillStyle = c2;
    c.fillRect(-hw, -hh, w, h);
    c.fillStyle = c1;
    for (let x = -hw; x < hw; x += stripeW * 2) {
      c.fillRect(x, -hh, stripeW, h);
    }
  });
}

function drawPatChecker(ctx, layer) {
  const c1 = layer.colour;
  const c2 = layer.colour2 || '#FFFFFF';
  withClipRect(ctx, layer, (c, hw, hh, w, h) => {
    const sz = Math.max(20, Math.min(w, h) / 8);
    c.fillStyle = c2;
    c.fillRect(-hw, -hh, w, h);
    c.fillStyle = c1;
    for (let row = -hh; row < hh; row += sz) {
      for (let col = -hw; col < hw; col += sz) {
        const r = Math.round((row + hh) / sz);
        const cc = Math.round((col + hw) / sz);
        if ((r + cc) % 2 === 0) c.fillRect(col, row, sz, sz);
      }
    }
  });
}

function drawPatPolka(ctx, layer) {
  const c1 = layer.colour;
  const c2 = layer.colour2 || '#FFFFFF';
  withClipRect(ctx, layer, (c, hw, hh, w, h) => {
    const spacing = Math.max(30, Math.min(w, h) / 7);
    const r = spacing * 0.35;
    c.fillStyle = c2;
    c.fillRect(-hw, -hh, w, h);
    c.fillStyle = c1;
    for (let row = -hh + spacing / 2; row < hh; row += spacing) {
      for (let col = -hw + spacing / 2; col < hw; col += spacing) {
        c.beginPath();
        c.arc(col, row, r, 0, Math.PI * 2);
        c.fill();
      }
    }
  });
}

function drawPatZigzag(ctx, layer) {
  const c1 = layer.colour;
  const c2 = layer.colour2 || '#FFFFFF';
  withClipRect(ctx, layer, (c, hw, hh, w, h) => {
    c.fillStyle = c2;
    c.fillRect(-hw, -hh, w, h);
    const zw = Math.max(30, w / 10);
    const zh = Math.max(20, h / 8);
    c.strokeStyle = c1;
    c.lineWidth = Math.max(6, zh * 0.5);
    c.lineJoin = 'miter';
    for (let row = -hh; row < hh + zh; row += zh * 2) {
      c.beginPath();
      let up = true;
      for (let x = -hw; x <= hw + zw; x += zw) {
        c.lineTo(x, row + (up ? 0 : zh));
        up = !up;
      }
      c.stroke();
    }
  });
}

function drawPatHoundstooth(ctx, layer) {
  const c1 = layer.colour;
  const c2 = layer.colour2 || '#FFFFFF';
  withClipRect(ctx, layer, (c, hw, hh, w, h) => {
    const sz = Math.max(24, Math.min(w, h) / 9);
    c.fillStyle = c2;
    c.fillRect(-hw, -hh, w, h);
    c.fillStyle = c1;
    for (let row = -hh; row < hh + sz * 2; row += sz * 2) {
      for (let col = -hw; col < hw + sz * 2; col += sz * 2) {
        // top-left half square
        c.beginPath();
        c.moveTo(col, row); c.lineTo(col + sz, row); c.lineTo(col, row + sz); c.closePath(); c.fill();
        // bottom-right half square
        c.beginPath();
        c.moveTo(col + sz, row + sz); c.lineTo(col + sz * 2, row + sz); c.lineTo(col + sz * 2, row + sz * 2); c.lineTo(col + sz, row + sz * 2); c.closePath(); c.fill();
        // small top-right notch
        c.beginPath();
        c.moveTo(col + sz, row); c.lineTo(col + sz * 2, row); c.lineTo(col + sz * 2, row + sz); c.closePath(); c.fill();
        // small bottom-left notch
        c.beginPath();
        c.moveTo(col, row + sz); c.lineTo(col + sz, row + sz); c.lineTo(col, row + sz * 2); c.closePath(); c.fill();
      }
    }
  });
}

function drawPatCrosshatch(ctx, layer) {
  const c1 = layer.colour;
  const c2 = layer.colour2 || '#FFFFFF';
  withClipRect(ctx, layer, (c, hw, hh, w, h) => {
    c.fillStyle = c2;
    c.fillRect(-hw, -hh, w, h);
    const spacing = Math.max(20, Math.min(w, h) / 10);
    c.strokeStyle = c1;
    c.lineWidth = Math.max(2, spacing * 0.12);
    for (let x = -hw; x <= hw; x += spacing) {
      c.beginPath(); c.moveTo(x, -hh); c.lineTo(x, hh); c.stroke();
    }
    for (let y = -hh; y <= hh; y += spacing) {
      c.beginPath(); c.moveTo(-hw, y); c.lineTo(hw, y); c.stroke();
    }
  });
}

function drawPatDiagonalStripes(ctx, layer) {
  const c1 = layer.colour;
  const c2 = layer.colour2 || '#FFFFFF';
  withClipRect(ctx, layer, (c, hw, hh, w, h) => {
    const stripeW = Math.max(20, Math.min(w, h) / 8);
    c.fillStyle = c2;
    c.fillRect(-hw, -hh, w, h);
    c.fillStyle = c1;
    const diag = w + h;
    for (let i = -diag; i < diag; i += stripeW * 2) {
      c.beginPath();
      c.moveTo(-hw + i, -hh);
      c.lineTo(-hw + i + stripeW, -hh);
      c.lineTo(-hw + i + stripeW - h, hh);
      c.lineTo(-hw + i - h, hh);
      c.closePath();
      c.fill();
    }
  });
}

function drawPatHoneycomb(ctx, layer) {
  const c1 = layer.colour;
  const c2 = layer.colour2 || '#FFFFFF';
  withClipRect(ctx, layer, (c, hw, hh, w, h) => {
    c.fillStyle = c2;
    c.fillRect(-hw, -hh, w, h);
    const r = Math.max(18, Math.min(w, h) / 10);
    const hexH = r * Math.sqrt(3);
    c.strokeStyle = c1;
    c.lineWidth = Math.max(2, r * 0.12);
    const hexPath = (cx, cy) => {
      c.beginPath();
      for (let a = 0; a < 6; a++) {
        const angle = (Math.PI / 180) * (60 * a - 30);
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        a === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
      }
      c.closePath();
      c.stroke();
    };
    for (let row = -hh - r; row < hh + r; row += hexH) {
      for (let col = -hw - r; col < hw + r; col += r * 3) {
        hexPath(col, row);
        hexPath(col + r * 1.5, row + hexH / 2);
      }
    }
  });
}

function drawPatCarbon(ctx, layer) {
  const c1 = layer.colour;
  const c2 = layer.colour2 || '#222222';
  withClipRect(ctx, layer, (c, hw, hh, w, h) => {
    const sz = Math.max(12, Math.min(w, h) / 16);
    c.fillStyle = c2;
    c.fillRect(-hw, -hh, w, h);
    for (let row = -hh; row < hh; row += sz * 2) {
      for (let col = -hw; col < hw; col += sz * 2) {
        // Weave pattern
        const grad1 = c.createLinearGradient(col, row, col + sz, row + sz);
        grad1.addColorStop(0, c1);
        grad1.addColorStop(1, c2);
        c.fillStyle = grad1;
        c.fillRect(col, row, sz, sz);
        const grad2 = c.createLinearGradient(col + sz, row + sz, col + sz * 2, row + sz * 2);
        grad2.addColorStop(0, c1);
        grad2.addColorStop(1, c2);
        c.fillStyle = grad2;
        c.fillRect(col + sz, row + sz, sz, sz);
        // Other cells darker
        c.fillStyle = c2;
        c.fillRect(col + sz, row, sz, sz);
        c.fillRect(col, row + sz, sz, sz);
      }
    }
  });
}

function drawPatHerringbone(ctx, layer) {
  const c1 = layer.colour;
  const c2 = layer.colour2 || '#FFFFFF';
  withClipRect(ctx, layer, (c, hw, hh, w, h) => {
    c.fillStyle = c2;
    c.fillRect(-hw, -hh, w, h);
    const sz = Math.max(16, Math.min(w, h) / 10);
    c.fillStyle = c1;
    for (let row = -hh - sz * 2; row < hh + sz * 2; row += sz * 2) {
      for (let col = -hw - sz * 2; col < hw + sz * 2; col += sz * 4) {
        // Right-leaning bar
        c.save();
        c.translate(col + sz, row + sz);
        c.rotate(Math.PI / 4);
        c.fillRect(-sz * 0.3, -sz, sz * 0.6, sz * 2);
        c.restore();
        // Left-leaning bar
        c.save();
        c.translate(col + sz * 3, row + sz);
        c.rotate(-Math.PI / 4);
        c.fillRect(-sz * 0.3, -sz, sz * 0.6, sz * 2);
        c.restore();
      }
    }
  });
}

// ─── Texture drawing helpers ─────────────────────────────────────────────────

function drawTexWaves(ctx, layer) {
  const c1 = layer.colour;
  const c2 = layer.colour2 || '#FFFFFF';
  withClipRect(ctx, layer, (c, hw, hh, w, h) => {
    c.fillStyle = c2;
    c.fillRect(-hw, -hh, w, h);
    const waveH = Math.max(20, h / 6);
    const freq = (Math.PI * 2) / Math.max(100, w / 3);
    c.fillStyle = c1;
    for (let wy = -hh; wy < hh; wy += waveH * 2) {
      c.beginPath();
      c.moveTo(-hw, wy);
      for (let x = -hw; x <= hw; x += 4) {
        c.lineTo(x, wy + Math.sin(x * freq) * (waveH * 0.5));
      }
      c.lineTo(hw, wy + waveH);
      for (let x = hw; x >= -hw; x -= 4) {
        c.lineTo(x, wy + waveH + Math.sin(x * freq) * (waveH * 0.5));
      }
      c.closePath();
      c.fill();
    }
  });
}

function drawTexWavyLines(ctx, layer) {
  const c1 = layer.colour;
  const c2 = layer.colour2 || '#FFFFFF';
  withClipRect(ctx, layer, (c, hw, hh, w, h) => {
    c.fillStyle = c2;
    c.fillRect(-hw, -hh, w, h);
    const spacing = Math.max(18, h / 10);
    const amp = spacing * 0.45;
    const freq = (Math.PI * 2) / Math.max(80, w / 4);
    c.strokeStyle = c1;
    c.lineWidth = Math.max(2, spacing * 0.15);
    for (let wy = -hh + spacing / 2; wy < hh; wy += spacing) {
      c.beginPath();
      for (let x = -hw; x <= hw; x += 3) {
        const y = wy + Math.sin(x * freq) * amp;
        x === -hw ? c.moveTo(x, y) : c.lineTo(x, y);
      }
      c.stroke();
    }
  });
}

function drawTexCamo(ctx, layer) {
  const c1 = layer.colour;
  const c2 = layer.colour2 || '#4a5e3a';
  const c3 = '#2b3a1e';
  const c4 = '#8a7a5a';
  withClipRect(ctx, layer, (c, hw, hh, w, h) => {
    c.fillStyle = c2;
    c.fillRect(-hw, -hh, w, h);
    // Deterministic pseudo-random blobs
    const seed = layer.id ? layer.id.charCodeAt(0) : 42;
    const rand = (n) => Math.abs(Math.sin(n * seed * 9301 + 49297)) % 1;
    const colors = [c1, c2, c3, c4];
    for (let i = 0; i < 40; i++) {
      const bx = -hw + rand(i) * w;
      const by = -hh + rand(i + 100) * h;
      const bw = (0.08 + rand(i + 200) * 0.18) * Math.min(w, h);
      const bh = bw * (0.5 + rand(i + 300) * 0.8);
      c.fillStyle = colors[Math.floor(rand(i + 400) * colors.length)];
      c.beginPath();
      c.ellipse(bx, by, bw, bh, rand(i + 500) * Math.PI, 0, Math.PI * 2);
      c.fill();
    }
  });
}

function drawTexNoise(ctx, layer) {
  const c1 = layer.colour;
  const c2 = layer.colour2 || '#FFFFFF';
  withClipRect(ctx, layer, (c, hw, hh, w, h) => {
    c.fillStyle = c2;
    c.fillRect(-hw, -hh, w, h);
    const dotSize = Math.max(3, Math.min(w, h) / 80);
    const seed = layer.id ? layer.id.charCodeAt(0) : 1;
    const rand = (n) => Math.abs(Math.sin(n * seed * 127.1 + 311.7)) % 1;
    c.fillStyle = c1;
    let i = 0;
    for (let y = -hh; y < hh; y += dotSize * 2) {
      for (let x = -hw; x < hw; x += dotSize * 2) {
        if (rand(i++) > 0.5) c.fillRect(x, y, dotSize, dotSize);
      }
    }
  });
}

function drawTexBrushed(ctx, layer) {
  const c1 = layer.colour;
  const c2 = layer.colour2 || '#888888';
  withClipRect(ctx, layer, (c, hw, hh, w, h) => {
    c.fillStyle = c1;
    c.fillRect(-hw, -hh, w, h);
    const lineCount = Math.floor(h / 2);
    for (let i = 0; i < lineCount; i++) {
      const y = -hh + (i / lineCount) * h;
      const alpha = 0.03 + Math.abs(Math.sin(i * 0.3)) * 0.07;
      c.strokeStyle = c2;
      c.globalAlpha *= (alpha + 0.5);
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(-hw, y);
      c.lineTo(hw, y);
      c.stroke();
      c.globalAlpha = layer.opacity;
    }
  });
}

function drawTexCircuit(ctx, layer) {
  const c1 = layer.colour;
  const c2 = layer.colour2 || '#00FF88';
  withClipRect(ctx, layer, (c, hw, hh, w, h) => {
    c.fillStyle = c1;
    c.fillRect(-hw, -hh, w, h);
    const grid = Math.max(30, Math.min(w, h) / 8);
    c.strokeStyle = c2;
    c.lineWidth = Math.max(1.5, grid * 0.06);
    const seed = layer.id ? layer.id.charCodeAt(0) : 7;
    const rand = (n) => Math.abs(Math.sin(n * seed * 9301 + 49297)) % 1;
    let i = 0;
    for (let y = -hh; y < hh; y += grid) {
      for (let x = -hw; x < hw; x += grid) {
        if (rand(i++) > 0.5) {
          c.beginPath();
          c.moveTo(x, y);
          const dir = Math.floor(rand(i) * 4);
          if (dir === 0) c.lineTo(x + grid, y);
          else if (dir === 1) c.lineTo(x, y + grid);
          else if (dir === 2) { c.lineTo(x + grid, y); c.lineTo(x + grid, y + grid); }
          else { c.lineTo(x, y + grid); c.lineTo(x + grid, y + grid); }
          c.stroke();
          if (rand(i + 50) > 0.7) {
            c.beginPath();
            c.arc(x, y, grid * 0.12, 0, Math.PI * 2);
            c.fillStyle = c2;
            c.fill();
          }
        }
      }
    }
  });
}

function drawTexScales(ctx, layer) {
  const c1 = layer.colour;
  const c2 = layer.colour2 || '#FFFFFF';
  withClipRect(ctx, layer, (c, hw, hh, w, h) => {
    c.fillStyle = c2;
    c.fillRect(-hw, -hh, w, h);
    const r = Math.max(16, Math.min(w, h) / 10);
    c.strokeStyle = c1;
    c.lineWidth = Math.max(1.5, r * 0.08);
    for (let row = -hh - r; row < hh + r; row += r) {
      const offset = Math.floor((row + hh) / r) % 2 === 0 ? 0 : r;
      for (let col = -hw - r + offset; col < hw + r; col += r * 2) {
        c.beginPath();
        c.arc(col, row, r, 0, Math.PI);
        c.stroke();
      }
    }
  });
}

function drawTexLeopard(ctx, layer) {
  const c1 = layer.colour;
  const c2 = layer.colour2 || '#C8A84B';
  withClipRect(ctx, layer, (c, hw, hh, w, h) => {
    c.fillStyle = c2;
    c.fillRect(-hw, -hh, w, h);
    const seed = layer.id ? layer.id.charCodeAt(0) : 3;
    const rand = (n) => Math.abs(Math.sin(n * seed * 9301 + 49297)) % 1;
    const spotCount = 30;
    for (let i = 0; i < spotCount; i++) {
      const sx = -hw + rand(i) * w;
      const sy = -hh + rand(i + 100) * h;
      const sr = (0.03 + rand(i + 200) * 0.04) * Math.min(w, h);
      // Outer ring
      c.strokeStyle = c1;
      c.lineWidth = sr * 0.5;
      c.beginPath();
      for (let a = 0; a < 5; a++) {
        const angle = (a / 5) * Math.PI * 2;
        const jitter = 0.6 + rand(i * 10 + a) * 0.8;
        const px = sx + Math.cos(angle) * sr * jitter;
        const py = sy + Math.sin(angle) * sr * jitter * 0.7;
        a === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
      }
      c.closePath();
      c.stroke();
    }
  });
}

function drawTexSplatter(ctx, layer) {
  const c1 = layer.colour;
  const c2 = layer.colour2 || '#FFFFFF';
  withClipRect(ctx, layer, (c, hw, hh, w, h) => {
    c.fillStyle = c2;
    c.fillRect(-hw, -hh, w, h);
    const seed = layer.id ? layer.id.charCodeAt(0) : 5;
    const rand = (n) => Math.abs(Math.sin(n * seed * 9301 + 49297)) % 1;
    c.fillStyle = c1;
    for (let i = 0; i < 60; i++) {
      const sx = -hw + rand(i) * w;
      const sy = -hh + rand(i + 100) * h;
      const sr = (0.005 + rand(i + 200) * 0.03) * Math.min(w, h);
      c.beginPath();
      c.arc(sx, sy, sr, 0, Math.PI * 2);
      c.fill();
      // drip
      if (rand(i + 300) > 0.5) {
        const dripH = sr * (1 + rand(i + 400) * 3);
        c.fillRect(sx - sr * 0.3, sy, sr * 0.6, dripH);
      }
    }
  });
}

function drawTexHalftone(ctx, layer) {
  const c1 = layer.colour;
  const c2 = layer.colour2 || '#FFFFFF';
  withClipRect(ctx, layer, (c, hw, hh, w, h) => {
    c.fillStyle = c2;
    c.fillRect(-hw, -hh, w, h);
    const spacing = Math.max(16, Math.min(w, h) / 12);
    c.fillStyle = c1;
    for (let row = -hh + spacing / 2; row < hh; row += spacing) {
      for (let col = -hw + spacing / 2; col < hw; col += spacing) {
        // Dot size varies with distance from centre
        const dx = col / hw;
        const dy = row / hh;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const r = spacing * 0.45 * (1 - dist * 0.5);
        if (r > 1) {
          c.beginPath();
          c.arc(col, row, r, 0, Math.PI * 2);
          c.fill();
        }
      }
    }
  });
}

// Draws a shape's geometry centered at (0,0) into ctx (with current fillStyle).
// Used by the curved-edge warp path. Does NOT apply rotation/flip/skew — those
// are handled by the destination quad mapping.
function drawShapeGeometry(ctx, type, hw, hh, rx = 0) {
  switch (type) {
    case 'rectangle':
    case 'stripe':
    case 'roundrect': {
      const r = Math.min(rx, hw, hh);
      ctx.beginPath();
      ctx.moveTo(-hw + r, -hh);
      ctx.lineTo(hw - r, -hh);
      ctx.arcTo(hw, -hh, hw, -hh + r, r);
      ctx.lineTo(hw, hh - r);
      ctx.arcTo(hw, hh, hw - r, hh, r);
      ctx.lineTo(-hw + r, hh);
      ctx.arcTo(-hw, hh, -hw, hh - r, r);
      ctx.lineTo(-hw, -hh + r);
      ctx.arcTo(-hw, -hh, -hw + r, -hh, r);
      ctx.closePath(); ctx.fill();
      break;
    }
    case 'circle':
    case 'ellipse':
      ctx.beginPath(); ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2); ctx.fill();
      break;
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(0, -hh); ctx.lineTo(hw, hh); ctx.lineTo(-hw, hh);
      ctx.closePath(); ctx.fill();
      break;
    case 'right_triangle':
      ctx.beginPath();
      ctx.moveTo(-hw, -hh); ctx.lineTo(hw, -hh); ctx.lineTo(-hw, hh);
      ctx.closePath(); ctx.fill();
      break;
    case 'diamond':
      ctx.beginPath();
      ctx.moveTo(0, -hh); ctx.lineTo(hw, 0); ctx.lineTo(0, hh); ctx.lineTo(-hw, 0);
      ctx.closePath(); ctx.fill();
      break;
    case 'pentagon':
      ctx.beginPath();
      for (let a = 0; a < 5; a++) {
        const ang = (Math.PI / 180) * (72 * a - 90);
        const px = Math.cos(ang) * hw, py = Math.sin(ang) * hh;
        a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
      break;
    case 'hexagon':
      ctx.beginPath();
      for (let a = 0; a < 6; a++) {
        const ang = (Math.PI / 180) * (60 * a - 30);
        const px = Math.cos(ang) * hw, py = Math.sin(ang) * hh;
        a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
      break;
    case 'star': {
      const outerR = Math.min(hw, hh);
      const innerR = outerR * 0.4;
      ctx.beginPath();
      for (let a = 0; a < 10; a++) {
        const ang = (Math.PI / 180) * (36 * a - 90);
        const r = a % 2 === 0 ? outerR : innerR;
        const px = Math.cos(ang) * r * (hw / outerR);
        const py = Math.sin(ang) * r * (hh / outerR);
        a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
      break;
    }
    case 'arrow': {
      const headW = 0.4, shaft = 0.45;
      ctx.beginPath();
      ctx.moveTo(hw, 0);
      ctx.lineTo(hw - hw * headW * 2, -hh);
      ctx.lineTo(hw - hw * headW * 2, -hh * (1 - shaft * 2));
      ctx.lineTo(-hw, -hh * (1 - shaft * 2));
      ctx.lineTo(-hw, hh * (1 - shaft * 2));
      ctx.lineTo(hw - hw * headW * 2, hh * (1 - shaft * 2));
      ctx.lineTo(hw - hw * headW * 2, hh);
      ctx.closePath(); ctx.fill();
      break;
    }
    case 'chevron': {
      const depth = 0.4;
      ctx.beginPath();
      ctx.moveTo(-hw, -hh);
      ctx.lineTo(hw, -hh);
      ctx.lineTo(hw - 2 * hw * (1 - depth), hh);
      ctx.lineTo(0, hh);
      ctx.lineTo(-hw + 2 * hw * depth, hh);
      // Simpler chevron:
      ctx.closePath(); ctx.fill();
      break;
    }
    case 'parallelogram': {
      const shear = hw * 0.3;
      ctx.beginPath();
      ctx.moveTo(-hw + shear, -hh);
      ctx.lineTo(hw + shear, -hh);
      ctx.lineTo(hw - shear, hh);
      ctx.lineTo(-hw - shear, hh);
      ctx.closePath(); ctx.fill();
      break;
    }
    case 'trapezoid': {
      const inset = hw * 0.25;
      ctx.beginPath();
      ctx.moveTo(-hw + inset, -hh);
      ctx.lineTo(hw - inset, -hh);
      ctx.lineTo(hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.closePath(); ctx.fill();
      break;
    }
    case 'diagonal_band':
    default:
      ctx.fillRect(-hw, -hh, hw * 2, hh * 2);
  }
}

// ─── Text drawing ───────────────────────────────────────────────────────────

function drawTextLayer(ctx, layer) {
  const text = (layer.text ?? '').toString();
  const fontSize = layer.fontSize || 96;
  const rawFamily = layer.fontFamily || 'Inter';
  // Wrap multi-word family names in quotes (canvas font string requirement)
  const fontFamily = /[",]/.test(rawFamily) ? rawFamily : `"${rawFamily}", sans-serif`;
  const fontWeight = layer.fontWeight || 'normal';
  const fontStyle = layer.fontStyle || 'normal';
  const align = layer.textAlign || 'center';
  const letterSpacing = layer.letterSpacing || 0;
  const strokeWidth = layer.strokeWidth || 0;
  const strokeColour = layer.strokeColour || '#000000';
  const lines = text.split('\n');
  const lineHeight = fontSize * 1.2;

  ctx.save();
  ctx.globalAlpha = layer.opacity;
  const cx = layer.x + layer.width / 2;
  const cy = layer.y + layer.height / 2;
  ctx.translate(cx, cy);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  if (layer.flipX) ctx.scale(-1, 1);
  if (layer.flipY) ctx.scale(1, -1);
  if (layer.skewX) ctx.transform(1, 0, Math.tan((layer.skewX * Math.PI) / 180), 1, 0, 0);

  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  const tHw = layer.width / 2;
  const tHh = layer.height / 2;
  ctx.fillStyle = fillStyleFor(ctx, layer, layer.colour || '#FFFFFF', [-tHw, -tHh, tHw, tHh]);
  if (strokeWidth > 0) {
    ctx.strokeStyle = strokeColour;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = 'round';
  }

  const hw = layer.width / 2;
  // X anchor based on alignment (within the layer box)
  const anchorX = align === 'left' ? -hw : align === 'right' ? hw : 0;
  // Vertical centering of multi-line block
  const totalH = lines.length * lineHeight;
  const startY = -totalH / 2 + lineHeight / 2;

  const drawLine = (line, y) => {
    if (!letterSpacing) {
      if (strokeWidth > 0) ctx.strokeText(line, anchorX, y);
      ctx.fillText(line, anchorX, y);
      return;
    }
    // Letter spacing — measure & draw char by char
    const widths = [];
    let total = 0;
    for (const ch of line) {
      const w = ctx.measureText(ch).width + letterSpacing;
      widths.push(w);
      total += w;
    }
    total -= letterSpacing; // no trailing space
    let startX;
    if (align === 'left') startX = anchorX;
    else if (align === 'right') startX = anchorX - total;
    else startX = -total / 2;

    let x = startX;
    ctx.textAlign = 'left';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (strokeWidth > 0) ctx.strokeText(ch, x, y);
      ctx.fillText(ch, x, y);
      x += widths[i];
    }
    ctx.textAlign = align;
  };

  lines.forEach((line, i) => {
    drawLine(line, startY + i * lineHeight);
  });

  ctx.restore();
}

// ─── Main draw dispatcher ───────────────────────────────────────────────────

export function drawShape(ctx, layer) {
  // Pattern types
  const patternMap = {
    pat_stripes: drawPatStripes,
    pat_checker: drawPatChecker,
    pat_polka: drawPatPolka,
    pat_zigzag: drawPatZigzag,
    pat_houndstooth: drawPatHoundstooth,
    pat_crosshatch: drawPatCrosshatch,
    pat_diagonal_stripes: drawPatDiagonalStripes,
    pat_honeycomb: drawPatHoneycomb,
    pat_carbon: drawPatCarbon,
    pat_herringbone: drawPatHerringbone,
  };
  const textureMap = {
    tex_waves: drawTexWaves,
    tex_wavy_lines: drawTexWavyLines,
    tex_camo: drawTexCamo,
    tex_noise: drawTexNoise,
    tex_brushed: drawTexBrushed,
    tex_circuit: drawTexCircuit,
    tex_scales: drawTexScales,
    tex_leopard: drawTexLeopard,
    tex_splatter: drawTexSplatter,
    tex_halftone: drawTexHalftone,
  };

  if (patternMap[layer.type]) { patternMap[layer.type](ctx, layer); return; }
  if (textureMap[layer.type]) { textureMap[layer.type](ctx, layer); return; }

  // ── Image type ─────────────────────────────────────────────────────────────
  if (layer.type === 'image' && layer._imgElement) {
    const corners = layer.corners || DEFAULT_CORNERS;
    const edges = layer.edges || DEFAULT_EDGES;
    const hasDistort = corners.some(c => c.dx !== 0 || c.dy !== 0)
                    || edges.some(e => e.dx !== 0 || e.dy !== 0);
    if (hasDistort) {
      // Draw image into offscreen at natural size (top-left coords), warp onto distorted quad
      drawWarped(ctx, layer, (c, hw, hh, w, h) => {
        c.drawImage(layer._imgElement, 0, 0, w, h);
      }, false);
    } else {
      ctx.save();
      ctx.globalAlpha = layer.opacity;
      const cx = layer.x + layer.width / 2;
      const cy = layer.y + layer.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      if (layer.flipX) ctx.scale(-1, 1);
      if (layer.flipY) ctx.scale(1, -1);
      if (layer.skewX) ctx.transform(1, 0, Math.tan((layer.skewX * Math.PI) / 180), 1, 0, 0);
      ctx.drawImage(layer._imgElement, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
      ctx.restore();
    }
    return;
  }

  // ── Text ───────────────────────────────────────────────────────────────────
  if (layer.type === 'text') {
    drawTextLayer(ctx, layer);
    return;
  }

  // ── Vector shapes ──────────────────────────────────────────────────────────
  const corners = layer.corners || DEFAULT_CORNERS;
  const edges = layer.edges || DEFAULT_EDGES;
  const hw = layer.width / 2;
  const hh = layer.height / 2;
  const hasCornerDistort = corners.some(c => c.dx !== 0 || c.dy !== 0);
  const edgesBent = edges.some(e => e.dx !== 0 || e.dy !== 0);

  // When edges are bent, render shape geometry into offscreen and warp it.
  // This handles ALL shape types uniformly with curved edges.
  if (edgesBent) {
    drawWarped(ctx, layer, (c, chw, chh, w, h) => {
      c.fillStyle = fillStyleFor(c, layer, layer.colour, [-chw, -chh, chw, chh]);
      drawShapeGeometry(c, layer.type, chw, chh, layer.rx || 0);
    }, true);
    return;
  }

  ctx.save();
  ctx.globalAlpha = layer.opacity;

  const cx = layer.x + hw;
  const cy = layer.y + hh;

  if (hasCornerDistort || ['triangle', 'right_triangle', 'chevron', 'diagonal_band', 'diamond', 'arrow', 'parallelogram', 'trapezoid'].includes(layer.type)) {
    // pts already include flip mirroring from getLayerCornerPoints
    const pts = getLayerCornerPoints(layer);
    // For canvas-space paths, build the gradient in canvas space using the layer's bounding box
    ctx.fillStyle = fillStyleFor(ctx, layer, layer.colour, [layer.x, layer.y, layer.x + layer.width, layer.y + layer.height]);

    switch (layer.type) {
      case 'circle':
      case 'ellipse': {
        ctx.translate(cx, cy);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        if (layer.flipX) ctx.scale(-1, 1);
        if (layer.flipY) ctx.scale(1, -1);
        if (layer.skewX) ctx.transform(1, 0, Math.tan((layer.skewX * Math.PI) / 180), 1, 0, 0);
        ctx.fillStyle = fillStyleFor(ctx, layer, layer.colour, [-hw, -hh, hw, hh]);
        ctx.beginPath();
        ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'triangle': {
        const top = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(pts[2].x, pts[2].y);
        ctx.lineTo(pts[3].x, pts[3].y);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'right_triangle': {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[1].x, pts[1].y);
        ctx.lineTo(pts[3].x, pts[3].y);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'chevron': {
        const depth = 0.4;
        const bMid = { x: (pts[2].x + pts[3].x) / 2, y: (pts[2].y + pts[3].y) / 2 };
        const lMid = { x: pts[3].x + (pts[2].x - pts[3].x) * (1 - depth), y: pts[3].y + (pts[2].y - pts[3].y) * (1 - depth) };
        const rMid = { x: pts[3].x + (pts[2].x - pts[3].x) * depth, y: pts[3].y + (pts[2].y - pts[3].y) * depth };
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[1].x, pts[1].y);
        ctx.lineTo(rMid.x, rMid.y);
        ctx.lineTo(bMid.x, bMid.y);
        ctx.lineTo(lMid.x, lMid.y);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'diamond': {
        ctx.beginPath();
        ctx.moveTo((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2);
        ctx.lineTo((pts[1].x + pts[2].x) / 2, (pts[1].y + pts[2].y) / 2);
        ctx.lineTo((pts[2].x + pts[3].x) / 2, (pts[2].y + pts[3].y) / 2);
        ctx.lineTo((pts[3].x + pts[0].x) / 2, (pts[3].y + pts[0].y) / 2);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'arrow': {
        const headW = 0.4;
        const shaft = 0.45;
        // pts: TL=0, TR=1, BR=2, BL=3
        const top = { x: (pts[1].x + pts[2].x) / 2, y: (pts[1].y + pts[2].y) / 2 };
        const bot = { x: (pts[0].x + pts[3].x) / 2, y: (pts[0].y + pts[3].y) / 2 };
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(pts[1].x, pts[1].y);
        const midR = { x: pts[0].x + (pts[1].x - pts[0].x) * (1 - headW), y: pts[0].y + (pts[1].y - pts[0].y) * (1 - headW) };
        const midL = { x: pts[0].x + (pts[1].x - pts[0].x) * headW, y: pts[0].y + (pts[1].y - pts[0].y) * headW };
        const shaftR = { x: midR.x + (pts[2].x - pts[1].x) * shaft, y: midR.y + (pts[2].y - pts[1].y) * shaft };
        const shaftL = { x: midL.x + (pts[3].x - pts[0].x) * shaft, y: midL.y + (pts[3].y - pts[0].y) * shaft };
        ctx.lineTo(midR.x, midR.y);
        ctx.lineTo(shaftR.x, shaftR.y);
        ctx.lineTo(shaftL.x, shaftL.y);
        ctx.lineTo(midL.x, midL.y);
        ctx.lineTo(pts[0].x, pts[0].y);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'parallelogram': {
        const shear = hw * 0.3;
        ctx.translate(cx, cy);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        if (layer.flipX) ctx.scale(-1, 1);
        if (layer.flipY) ctx.scale(1, -1);
        if (layer.skewX) ctx.transform(1, 0, Math.tan((layer.skewX * Math.PI) / 180), 1, 0, 0);
        ctx.fillStyle = fillStyleFor(ctx, layer, layer.colour, [-hw, -hh, hw, hh]);
        ctx.beginPath();
        ctx.moveTo(-hw + shear, -hh);
        ctx.lineTo(hw + shear, -hh);
        ctx.lineTo(hw - shear, hh);
        ctx.lineTo(-hw - shear, hh);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'trapezoid': {
        const inset = hw * 0.25;
        ctx.translate(cx, cy);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        if (layer.flipX) ctx.scale(-1, 1);
        if (layer.flipY) ctx.scale(1, -1);
        if (layer.skewX) ctx.transform(1, 0, Math.tan((layer.skewX * Math.PI) / 180), 1, 0, 0);
        ctx.fillStyle = fillStyleFor(ctx, layer, layer.colour, [-hw, -hh, hw, hh]);
        ctx.beginPath();
        ctx.moveTo(-hw + inset, -hh);
        ctx.lineTo(hw - inset, -hh);
        ctx.lineTo(hw, hh);
        ctx.lineTo(-hw, hh);
        ctx.closePath();
        ctx.fill();
        break;
      }
      default: {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[1].x, pts[1].y);
        ctx.lineTo(pts[2].x, pts[2].y);
        ctx.lineTo(pts[3].x, pts[3].y);
        ctx.closePath();
        ctx.fill();
        break;
      }
    }
  } else {
    ctx.translate(cx, cy);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    if (layer.flipX) ctx.scale(-1, 1);
    if (layer.flipY) ctx.scale(1, -1);
    if (layer.skewX) ctx.transform(1, 0, Math.tan((layer.skewX * Math.PI) / 180), 1, 0, 0);
    ctx.fillStyle = fillStyleFor(ctx, layer, layer.colour, [-hw, -hh, hw, hh]);

    switch (layer.type) {
      case 'rectangle':
      case 'stripe':
      case 'roundrect': {
        const rx = Math.min(layer.rx || 0, hw, hh);
        ctx.beginPath();
        ctx.moveTo(-hw + rx, -hh);
        ctx.lineTo(hw - rx, -hh);
        ctx.arcTo(hw, -hh, hw, -hh + rx, rx);
        ctx.lineTo(hw, hh - rx);
        ctx.arcTo(hw, hh, hw - rx, hh, rx);
        ctx.lineTo(-hw + rx, hh);
        ctx.arcTo(-hw, hh, -hw, hh - rx, rx);
        ctx.lineTo(-hw, -hh + rx);
        ctx.arcTo(-hw, -hh, -hw + rx, -hh, rx);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'circle':
      case 'ellipse': {
        ctx.beginPath();
        ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'pentagon': {
        ctx.beginPath();
        for (let a = 0; a < 5; a++) {
          const angle = (Math.PI / 180) * (72 * a - 90);
          const px = Math.cos(angle) * hw;
          const py = Math.sin(angle) * hh;
          a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'hexagon': {
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const angle = (Math.PI / 180) * (60 * a - 30);
          const px = Math.cos(angle) * hw;
          const py = Math.sin(angle) * hh;
          a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'star': {
        const outerR = Math.min(hw, hh);
        const innerR = outerR * 0.4;
        ctx.beginPath();
        for (let a = 0; a < 10; a++) {
          const angle = (Math.PI / 180) * (36 * a - 90);
          const r = a % 2 === 0 ? outerR : innerR;
          const px = Math.cos(angle) * r * (hw / outerR);
          const py = Math.sin(angle) * r * (hh / outerR);
          a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'diagonal_band':
      default:
        ctx.fillRect(-hw, -hh, layer.width, layer.height);
    }
  }

  ctx.restore();
}

export function hitTest(layer, px, py) {
  const cx = layer.x + layer.width / 2;
  const cy = layer.y + layer.height / 2;
  const rad = (-layer.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = px - cx;
  const dy = py - cy;
  const lx = cos * dx - sin * dy;
  const ly = sin * dx + cos * dy;
  const hw = layer.width / 2;
  const hh = layer.height / 2;

  switch (layer.type) {
    case 'circle':
    case 'ellipse':
      return (lx / hw) ** 2 + (ly / hh) ** 2 <= 1;
    default:
      return lx >= -hw && lx <= hw && ly >= -hh && ly <= hh;
  }
}