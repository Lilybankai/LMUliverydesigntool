const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useRef, useEffect, useState, useCallback } from 'react';
import { Plus, Minus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { drawShape, hitTest, getLayerCornerPoints, getLayerEdgePoints, storedHandleIndex, pointInPolygon, withFreeformBBox, DEFAULT_CORNERS, DEFAULT_EDGES } from '@/lib/shapes';
import { loadGoogleFont } from '@/lib/googleFonts';
import CanvasTips from './CanvasTips';

const UV_OPACITY = 0.5;
const CORNER_HANDLE_RADIUS = 18;
const EDGE_HANDLE_RADIUS = 14;
const VERTEX_HANDLE_RADIUS = 14;

function hitTestPoint(pts, x, y, threshold) {
  for (let i = 0; i < pts.length; i++) {
    const dx = pts[i].x - x;
    const dy = pts[i].y - y;
    if (Math.sqrt(dx * dx + dy * dy) <= threshold) return i;
  }
  return -1;
}

// Build a smooth quadratic-Bezier outline through corners & edge midpoints
function buildCurvedOutlinePath(corners, edgeMids) {
  // corners: [TL, TR, BR, BL], edgeMids: [Top, Right, Bottom, Left]
  // Each edge i connects corners[i] -> corners[(i+1)%4], with edgeMids[i] as the
  // point the curve must pass through at t=0.5. Quadratic Bezier control point:
  //   ctrl = 2*mid - 0.5*(p0+p1)
  const segs = [];
  for (let i = 0; i < 4; i++) {
    const p0 = corners[i];
    const p1 = corners[(i + 1) % 4];
    const mid = edgeMids[i];
    const sm = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
    const ctrl = { x: 2 * mid.x - sm.x, y: 2 * mid.y - sm.y };
    segs.push({ p0, ctrl, p1 });
  }
  return segs;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const PAN_STEP = 50;

export default function LiveryCanvas({ vehicle, baseColour, baseOpacity = 1, layers, selectedId, onSelect, onLayerChange, onLayerCommit, uvVisible, stickersVisible, guidesVisible = false, drawMode = false, onFinishDraw, onCancelDraw }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const uvImageRef = useRef(null);
  const stickersImageRef = useRef(null);
  const bodyMaskRef = useRef(null);
  // Cached base-colour plate, already clipped to the body mask. Rebuilt only when the
  // vehicle or colour changes, so the 4K masking pass never runs on a redraw.
  const basePlateRef = useRef({ canvas: null, key: null });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(null);
  const [cornerDrag, setCornerDrag] = useState(null);
  const [panning, setPanning] = useState(null);
  const [hoverCursor, setHoverCursor] = useState('crosshair');

  // ── Area-draw (freeform selection) state ──────────────────────────────────
  // `draft` holds the in-progress polygon points (canvas coords). A ref mirror is
  // kept so the mouse handlers always read the latest points synchronously.
  const [draft, setDraft] = useState([]);
  const draftRef = useRef([]);
  const [draftCursor, setDraftCursor] = useState(null); // rubber-band end point
  const gestureRef = useRef(null); // tracks a click-vs-freehand mouse gesture
  const commitDraft = useCallback((next) => {
    draftRef.current = next;
    setDraft(next);
  }, []);

  const finishDraw = useCallback(() => {
    const pts = draftRef.current;
    if (pts && pts.length >= 3) onFinishDraw?.(pts);
    commitDraft([]);
    setDraftCursor(null);
    gestureRef.current = null;
  }, [onFinishDraw, commitDraft]);

  const cancelDraw = useCallback(() => {
    commitDraft([]);
    setDraftCursor(null);
    gestureRef.current = null;
    onCancelDraw?.();
  }, [commitDraft, onCancelDraw]);

  // Leaving draw mode clears any half-drawn outline.
  useEffect(() => {
    if (!drawMode) {
      commitDraft([]);
      setDraftCursor(null);
      gestureRef.current = null;
    }
  }, [drawMode, commitDraft]);

  // Enter finishes the area, Escape cancels it — only while drawing.
  useEffect(() => {
    if (!drawMode) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); cancelDraw(); }
      else if (e.key === 'Enter') { e.preventDefault(); finishDraw(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawMode, cancelDraw, finishDraw]);
  const [uvLoaded, setUvLoaded] = useState(false);
  const [stickersLoaded, setStickersLoaded] = useState(false);
  const [maskLoaded, setMaskLoaded] = useState(0);
  const [fontTick, setFontTick] = useState(0);

  // Re-render the canvas whenever a new web font finishes loading
  useEffect(() => {
    if (!document.fonts || !document.fonts.addEventListener) return;
    const handler = () => setFontTick(t => t + 1);
    document.fonts.addEventListener('loadingdone', handler);
    return () => document.fonts.removeEventListener('loadingdone', handler);
  }, []);
  // Guide line positions stored in CANVAS (texture) coordinates so they stay
  // anchored to the artwork when the user zooms or pans.
  const [guideH, setGuideH] = useState(() => vehicle.canvasHeight / 2);
  const [guideV, setGuideV] = useState(() => vehicle.canvasWidth / 2);
  const [guideDrag, setGuideDrag] = useState(null);

  // Re-centre guides when the vehicle (and therefore canvas size) changes
  useEffect(() => {
    setGuideH(vehicle.canvasHeight / 2);
    setGuideV(vehicle.canvasWidth / 2);
  }, [vehicle.canvasWidth, vehicle.canvasHeight]);

  // Make sure every Google Font used by a text layer is loaded
  useEffect(() => {
    for (const l of layers) {
      if (l.type === 'text' && l.fontFamily) loadGoogleFont(l.fontFamily);
    }
  }, [layers]);

  useEffect(() => {
    setUvLoaded(false);
    uvImageRef.current = null;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { uvImageRef.current = img; setUvLoaded(true); };
    img.src = vehicle.uvMap;
  }, [vehicle.uvMap]);

  useEffect(() => {
    bodyMaskRef.current = null;
    basePlateRef.current = { canvas: null, key: null };
    if (!vehicle.bodyMask) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    // A missing mask is not an error: the canvas falls back to filling the whole
    // texture, which is exactly the old behaviour.
    img.onload = () => { bodyMaskRef.current = img; setMaskLoaded((n) => n + 1); };
    img.src = vehicle.bodyMask;
  }, [vehicle.bodyMask]);

  useEffect(() => {
    setStickersLoaded(false);
    stickersImageRef.current = null;
    if (!vehicle.classStickers) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { stickersImageRef.current = img; setStickersLoaded(true); };
    img.src = vehicle.classStickers;
  }, [vehicle.classStickers]);

  useEffect(() => {
    const resize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      const s = Math.min(width / vehicle.canvasWidth, height / vehicle.canvasHeight) * 0.95;
      setScale(s);
      setOffset({
        x: (width - vehicle.canvasWidth * s) / 2,
        y: (height - vehicle.canvasHeight * s) / 2,
      });
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [vehicle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = vehicle.canvasWidth;
    const H = vehicle.canvasHeight;
    canvas.width = W;
    canvas.height = H;

    // Neutral dark base so UV map shows clearly when base opacity is low
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, W, H);

    if (baseOpacity > 0) {
      ctx.save();
      ctx.globalAlpha = baseOpacity;

      const mask = bodyMaskRef.current;
      if (mask) {
        // Paint the colour only inside the car's panels, leaving the surround dark.
        const key = `${vehicle.id}|${baseColour}|${W}x${H}`;
        if (basePlateRef.current.key !== key) {
          const plate = document.createElement('canvas');
          plate.width = W;
          plate.height = H;
          const pctx = plate.getContext('2d');
          pctx.fillStyle = baseColour;
          pctx.fillRect(0, 0, W, H);
          pctx.globalCompositeOperation = 'destination-in';
          pctx.drawImage(mask, 0, 0, W, H);
          basePlateRef.current = { canvas: plate, key };
        }
        ctx.drawImage(basePlateRef.current.canvas, 0, 0);
      } else {
        // No mask available for this vehicle — fill the whole texture as before.
        ctx.fillStyle = baseColour;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();
    }

    for (const layer of layers) {
      if (!layer.visible) continue;
      drawShape(ctx, layer);
    }

    if (uvVisible && uvImageRef.current) {
      ctx.save();
      // Show UV at full opacity when base is transparent, blend down as base fills in
      ctx.globalAlpha = UV_OPACITY + (1 - UV_OPACITY) * (1 - baseOpacity);
      ctx.drawImage(uvImageRef.current, 0, 0, W, H);
      ctx.restore();
    }

    // Class stickers — always rendered on top
    if (stickersVisible && stickersImageRef.current) {
      ctx.drawImage(stickersImageRef.current, 0, 0, W, H);
    }

    if (selectedId && !drawMode) {
      const layer = layers.find(l => l.id === selectedId);
      if (layer && layer.type === 'freeform') {
        // Freeform selection — dashed polygon outline + round vertex handles.
        const pts = layer.points || [];
        if (pts.length) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
          ctx.closePath();
          ctx.setLineDash([14, 7]);
          ctx.strokeStyle = 'rgba(0,0,0,0.7)';
          ctx.lineWidth = 7;
          ctx.stroke();
          ctx.strokeStyle = layer.locked ? '#F5C400' : '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.setLineDash([]);
          if (!layer.locked) {
            for (const p of pts) {
              ctx.beginPath();
              ctx.arc(p.x, p.y, VERTEX_HANDLE_RADIUS + 3, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(0,0,0,0.5)';
              ctx.fill();
              ctx.beginPath();
              ctx.arc(p.x, p.y, VERTEX_HANDLE_RADIUS, 0, Math.PI * 2);
              ctx.fillStyle = '#FFFFFF';
              ctx.fill();
              ctx.beginPath();
              ctx.arc(p.x, p.y, VERTEX_HANDLE_RADIUS * 0.45, 0, Math.PI * 2);
              ctx.fillStyle = '#2196F3';
              ctx.fill();
            }
          }
          ctx.restore();
        }
      } else if (layer) {
        const cornerPts = getLayerCornerPoints(layer);
        const edgePts = getLayerEdgePoints(layer);

        // Edge ordering: [Top(TL→TR), Right(TR→BR), Bottom(BL→BR), Left(TL→BL)]
        // getLayerEdgePoints returns [Top, Right, Bottom, Left]
        // Outline goes TL→TR (Top), TR→BR (Right), BR→BL (Bottom reversed), BL→TL (Left reversed)
        const segs = buildCurvedOutlinePath(cornerPts, edgePts);

        // Draw outline as curves
        const drawOutline = (style, width) => {
          ctx.save();
          ctx.strokeStyle = style;
          ctx.lineWidth = width;
          ctx.setLineDash([14, 7]);
          ctx.beginPath();
          ctx.moveTo(segs[0].p0.x, segs[0].p0.y);
          for (const seg of segs) {
            ctx.quadraticCurveTo(seg.ctrl.x, seg.ctrl.y, seg.p1.x, seg.p1.y);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        };
        drawOutline('rgba(0,0,0,0.7)', 7);
        // Locked layers show a distinct amber outline and no transform handles,
        // so it's clear they can't be moved or reshaped.
        drawOutline(layer.locked ? '#F5C400' : '#FFFFFF', 3);

        // Locked layers are not editable — skip the drag handles entirely.
        if (!layer.locked) {
        // Corner handles (white circles with gold centre)
        for (const pt of cornerPts) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, CORNER_HANDLE_RADIUS + 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, CORNER_HANDLE_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, CORNER_HANDLE_RADIUS * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = '#F5C400';
          ctx.fill();
        }

        // Edge midpoint handles (smaller, blue centre)
        for (const pt of edgePts) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, EDGE_HANDLE_RADIUS + 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, EDGE_HANDLE_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, EDGE_HANDLE_RADIUS * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = '#2196F3';
          ctx.fill();
        }
        }
      }
    }

    // In-progress freeform outline while the area-draw tool is active.
    if (drawMode && draft.length) {
      const pathThrough = (extraCursor) => {
        ctx.beginPath();
        ctx.moveTo(draft[0].x, draft[0].y);
        for (let i = 1; i < draft.length; i++) ctx.lineTo(draft[i].x, draft[i].y);
        if (extraCursor && draftCursor) ctx.lineTo(draftCursor.x, draftCursor.y);
      };
      ctx.save();
      // Faint fill preview of the enclosed area
      if (draft.length >= 3) {
        pathThrough(false);
        ctx.closePath();
        ctx.fillStyle = 'rgba(34,211,238,0.15)';
        ctx.fill();
      }
      // Outline with a rubber-band segment to the cursor
      ctx.lineJoin = 'round';
      pathThrough(true);
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 8;
      ctx.setLineDash([]);
      ctx.stroke();
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 4;
      ctx.setLineDash([18, 10]);
      ctx.stroke();
      ctx.setLineDash([]);
      // Vertices — first point larger/gold so the user can see where it closes
      for (let i = 0; i < draft.length; i++) {
        const p = draft[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, i === 0 ? 16 : 10, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? '#F5C400' : '#FFFFFF';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [layers, baseColour, baseOpacity, selectedId, uvVisible, uvLoaded, stickersVisible, stickersLoaded, maskLoaded, scale, fontTick, drawMode, draft, draftCursor]);

  // Zoom centred on a point (container-relative px coords)
  const applyZoom = useCallback((factor, originX, originY) => {
    setZoom(prevZoom => {
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prevZoom * factor));
      // Shift pan so the point under the cursor stays fixed
      setPan(prevPan => ({
        x: originX - (originX - prevPan.x) * (newZoom / prevZoom),
        y: originY - (originY - prevPan.y) * (newZoom / prevZoom),
      }));
      return newZoom;
    });
  }, []);

  // Wheel zoom centred on mouse
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const rect = containerRef.current.getBoundingClientRect();
    applyZoom(factor, e.clientX - rect.left, e.clientY - rect.top);
  }, [applyZoom]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Button zoom centred on canvas centre
  const adjustZoom = useCallback((factor) => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    applyZoom(factor, width / 2, height / 2);
  }, [applyZoom]);

  const toCanvas = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (vehicle.canvasWidth / rect.width),
      y: (e.clientY - rect.top) * (vehicle.canvasHeight / rect.height),
    };
  }, [vehicle]);

  const handleMouseDown = useCallback((e) => {
    // Right-click — start panning the canvas view (works even while drawing)
    if (e.button === 2) {
      e.preventDefault();
      setPanning({ startX: e.clientX, startY: e.clientY, origPan: { ...pan } });
      return;
    }
    if (e.button !== 0) return;
    const { x, y } = toCanvas(e);

    // Area-draw tool: defer the click-vs-freehand decision to mouse-move / up.
    if (drawMode) {
      gestureRef.current = { startX: x, startY: y, freehand: false };
      return;
    }

    // Editing a selected freeform area — drag a vertex, or move the whole shape.
    if (selectedId) {
      const fl = layers.find(l => l.id === selectedId);
      if (fl && fl.type === 'freeform' && !fl.locked) {
        const pxScale = vehicle.canvasWidth / canvasRef.current.getBoundingClientRect().width;
        const vThreshold = VERTEX_HANDLE_RADIUS * pxScale * 2;
        const vi = hitTestPoint(fl.points || [], x, y, vThreshold);
        if (vi !== -1) {
          setCornerDrag({ kind: 'vertex', idx: vi, startX: x, startY: y, origPoints: fl.points.map(p => ({ ...p })) });
          return;
        }
        if (pointInPolygon(fl.points, x, y)) {
          setDragging({ layerId: fl.id, mode: 'freeform', startX: x, startY: y, origPoints: fl.points.map(p => ({ ...p })) });
          return;
        }
      }
    }

    if (selectedId) {
      const layer = layers.find(l => l.id === selectedId);
      if (layer && layer.type !== 'freeform' && !layer.locked) {
        const cornerPts = getLayerCornerPoints(layer);
        const edgePts = getLayerEdgePoints(layer);
        const pxScale = vehicle.canvasWidth / canvasRef.current.getBoundingClientRect().width;
        const cornerThreshold = CORNER_HANDLE_RADIUS * pxScale * 2;
        const edgeThreshold = EDGE_HANDLE_RADIUS * pxScale * 2;

        // Edge handles take priority (smaller, may overlap corners visually less but test first)
        const ei = hitTestPoint(edgePts, x, y, edgeThreshold);
        if (ei !== -1) {
          setCornerDrag({
            kind: 'edge',
            idx: ei,
            startX: x,
            startY: y,
            origEdges: (layer.edges || DEFAULT_EDGES).map(e => ({ ...e })),
          });
          return;
        }

        const ci = hitTestPoint(cornerPts, x, y, cornerThreshold);
        if (ci !== -1) {
          setCornerDrag({
            kind: 'corner',
            idx: ci,
            startX: x,
            startY: y,
            origCorners: (layer.corners || DEFAULT_CORNERS).map(c => ({ ...c })),
          });
          return;
        }
      }
    }

    let hit = null;
    for (let i = layers.length - 1; i >= 0; i--) {
      // Locked layers are click-through — you can't select or move them on the
      // canvas (unlock them from the Layers panel first).
      if (layers[i].visible && !layers[i].locked && hitTest(layers[i], x, y)) {
        hit = layers[i];
        break;
      }
    }

    if (hit) {
      onSelect(hit.id);
      if (hit.type === 'freeform') {
        setDragging({ layerId: hit.id, mode: 'freeform', startX: x, startY: y, origPoints: (hit.points || []).map(p => ({ ...p })) });
      } else {
        setDragging({ layerId: hit.id, startX: x, startY: y, origX: hit.x, origY: hit.y });
      }
    } else {
      onSelect(null);
    }
  }, [layers, selectedId, toCanvas, onSelect, vehicle, pan, drawMode]);

  const handleMouseMove = useCallback((e) => {
    // Pan with right mouse button
    if (panning) {
      setPan({
        x: panning.origPan.x + (e.clientX - panning.startX),
        y: panning.origPan.y + (e.clientY - panning.startY),
      });
      return;
    }

    const { x, y } = toCanvas(e);

    // Area-draw tool: build the outline as the user clicks / drags freehand.
    if (drawMode) {
      const g = gestureRef.current;
      if (g) {
        const pxScale = vehicle.canvasWidth / canvasRef.current.getBoundingClientRect().width;
        const moveThreshold = 5 * pxScale;
        const spacing = 10 * pxScale;
        if (g.freehand || Math.hypot(x - g.startX, y - g.startY) > moveThreshold) {
          const arr = draftRef.current.slice();
          if (!g.freehand) {
            g.freehand = true;
            arr.push({ x: g.startX, y: g.startY }); // seed with the press point
          }
          const last = arr[arr.length - 1];
          if (!last || Math.hypot(x - last.x, y - last.y) >= spacing) {
            arr.push({ x, y });
            commitDraft(arr);
          }
        }
      } else {
        setDraftCursor({ x, y }); // rubber-band preview between clicks
      }
      return;
    }

    // Update hover cursor when not actively dragging
    if (!dragging && !cornerDrag) {
      let next = 'crosshair';
      let onHandle = false;
      if (selectedId) {
        const layer = layers.find(l => l.id === selectedId);
        if (layer && layer.type === 'freeform' && !layer.locked) {
          const pxScale = vehicle.canvasWidth / canvasRef.current.getBoundingClientRect().width;
          const vThreshold = VERTEX_HANDLE_RADIUS * pxScale * 2;
          if (hitTestPoint(layer.points || [], x, y, vThreshold) !== -1) onHandle = true;
        } else if (layer && !layer.locked) {
          const cornerPts = getLayerCornerPoints(layer);
          const edgePts = getLayerEdgePoints(layer);
          const pxScale = vehicle.canvasWidth / canvasRef.current.getBoundingClientRect().width;
          const cornerThreshold = CORNER_HANDLE_RADIUS * pxScale * 2;
          const edgeThreshold = EDGE_HANDLE_RADIUS * pxScale * 2;
          if (hitTestPoint(edgePts, x, y, edgeThreshold) !== -1 || hitTestPoint(cornerPts, x, y, cornerThreshold) !== -1) {
            onHandle = true;
          }
        }
      }
      if (!onHandle) {
        for (let i = layers.length - 1; i >= 0; i--) {
          if (layers[i].visible && !layers[i].locked && hitTest(layers[i], x, y)) {
            next = 'grab';
            break;
          }
        }
      }
      setHoverCursor(next);
    }

    if (cornerDrag && selectedId) {
      const layer = layers.find(l => l.id === selectedId);
      if (!layer) return;

      // Freeform vertex drag — move just the grabbed point.
      if (cornerDrag.kind === 'vertex') {
        const dvx = x - cornerDrag.startX;
        const dvy = y - cornerDrag.startY;
        const newPoints = cornerDrag.origPoints.map((p, i) =>
          i === cornerDrag.idx ? { x: p.x + dvx, y: p.y + dvy } : { ...p }
        );
        onLayerChange(withFreeformBBox({ ...layer, points: newPoints }));
        return;
      }

      // Convert world delta -> layer-local delta. The flip mirrors handle
      // positions in world space (see applyFlipToPoints), so un-mirror the world
      // delta on any flipped axis BEFORE inverse-rotating — otherwise dragging a
      // handle moves it in the opposite direction once the shape is flipped.
      const rad = -(layer.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const sx = layer.flipX ? -1 : 1;
      const sy = layer.flipY ? -1 : 1;
      const wdx = (x - cornerDrag.startX) * sx;
      const wdy = (y - cornerDrag.startY) * sy;
      const ldx = wdx * cos - wdy * sin;
      const ldy = wdx * sin + wdy * cos;

      // The hit index is a slot in the flip-reordered handle array; map it back
      // to the entry in the stored (un-flipped) corners/edges array before
      // editing, so the handle the user grabbed is the one that actually moves.
      const isEdge = cornerDrag.kind === 'edge';
      const storedIdx = storedHandleIndex(layer, cornerDrag.idx, isEdge);

      if (isEdge) {
        const newEdges = cornerDrag.origEdges.map((e, i) =>
          i === storedIdx ? { dx: e.dx + ldx, dy: e.dy + ldy } : { ...e }
        );
        onLayerChange({ ...layer, edges: newEdges });
      } else {
        const newCorners = cornerDrag.origCorners.map((c, i) =>
          i === storedIdx ? { dx: c.dx + ldx, dy: c.dy + ldy } : { ...c }
        );
        onLayerChange({ ...layer, corners: newCorners });
      }
      return;
    }

    if (dragging) {
      const dx = x - dragging.startX;
      const dy = y - dragging.startY;
      const layer = layers.find(l => l.id === dragging.layerId);
      if (!layer) return;
      if (dragging.mode === 'freeform') {
        const newPoints = dragging.origPoints.map(p => ({ x: p.x + dx, y: p.y + dy }));
        onLayerChange(withFreeformBBox({ ...layer, points: newPoints }));
        return;
      }
      onLayerChange({ ...layer, x: dragging.origX + dx, y: dragging.origY + dy });
    }
  }, [cornerDrag, dragging, panning, selectedId, layers, toCanvas, onLayerChange, vehicle, drawMode, commitDraft]);

  const handleMouseUp = useCallback((e) => {
    // Area-draw tool: finish a freehand stroke, or place / close a polygon point.
    if (drawMode && e?.button !== 2) {
      const g = gestureRef.current;
      gestureRef.current = null;
      if (g) {
        if (g.freehand) {
          // A dragged stroke auto-closes when it encloses an area.
          finishDraw();
        } else {
          // A plain click adds a vertex — or closes if it lands on the start point.
          const pxScale = vehicle.canvasWidth / canvasRef.current.getBoundingClientRect().width;
          const closeThreshold = 18 * pxScale;
          const arr = draftRef.current.slice();
          if (arr.length >= 3 && Math.hypot(g.startX - arr[0].x, g.startY - arr[0].y) <= closeThreshold) {
            finishDraw();
          } else {
            arr.push({ x: g.startX, y: g.startY });
            commitDraft(arr);
          }
        }
      }
      setPanning(null);
      return;
    }
    if (dragging || cornerDrag) onLayerCommit?.();
    setDragging(null);
    setCornerDrag(null);
    setPanning(null);
  }, [dragging, cornerDrag, onLayerCommit, drawMode, finishDraw, commitDraft, vehicle]);

  // Drag handlers for guide lines (attached to window so dragging works smoothly)
  useEffect(() => {
    if (!guideDrag) return;
    const onMove = (e) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (guideDrag === 'h') {
        const y = (e.clientY - rect.top) * (vehicle.canvasHeight / rect.height);
        setGuideH(Math.max(0, Math.min(vehicle.canvasHeight, y)));
      } else {
        const x = (e.clientX - rect.left) * (vehicle.canvasWidth / rect.width);
        setGuideV(Math.max(0, Math.min(vehicle.canvasWidth, x)));
      }
    };
    const onUp = () => setGuideDrag(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [guideDrag, vehicle.canvasWidth, vehicle.canvasHeight]);

  const cursor = panning ? 'grabbing' : drawMode ? 'crosshair' : cornerDrag ? 'crosshair' : dragging ? 'grabbing' : hoverCursor;

  // Guide pixel positions in container space (so they line up with the canvas regardless of zoom/pan)
  const guideScale = scale * zoom;
  const guideLeft = offset.x + pan.x;
  const guideTop = offset.y + pan.y;
  const guideHPx = guideTop + guideH * guideScale;
  const guideVPx = guideLeft + guideV * guideScale;
  const canvasRightPx = guideLeft + vehicle.canvasWidth * guideScale;
  const canvasBottomPx = guideTop + vehicle.canvasHeight * guideScale;

  const canvasStyle = {
    position: 'absolute',
    left: offset.x + pan.x,
    top: offset.y + pan.y,
    width: vehicle.canvasWidth * scale * zoom,
    height: vehicle.canvasHeight * scale * zoom,
    imageRendering: 'crisp-edges',
    cursor,
    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
  };

  const btnCls = "w-7 h-7 flex items-center justify-center rounded bg-primary/80 text-primary-foreground transition-colors hover:bg-primary";

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden bg-[#0d0f12]"
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor }}
    >
      <canvas
        ref={canvasRef}
        style={canvasStyle}
      />

      {/* Area-draw instructions + finish/cancel controls */}
      {drawMode && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 select-none"
          onMouseDown={(e) => e.stopPropagation()}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <div className="px-3 py-2 rounded-lg bg-card/95 border border-accent/50 shadow-lg text-center max-w-xs">
            <p className="text-xs font-rajdhani font-bold uppercase tracking-widest text-accent">Draw Area</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Click to add points around a shape, or hold and drag to draw freehand.
              Close on the first point, or press <span className="text-foreground font-semibold">Finish</span>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={finishDraw}
              disabled={draft.length < 3}
              className="px-3 h-8 rounded-md bg-primary text-primary-foreground text-xs font-rajdhani font-bold uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow"
            >
              Finish Area
            </button>
            <button
              onClick={cancelDraw}
              className="px-3 h-8 rounded-md bg-secondary text-foreground text-xs font-rajdhani font-bold uppercase tracking-wide hover:bg-secondary/70 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Draggable guide lines */}
      {guidesVisible && (
        <>
          {/* Horizontal guide */}
          <div
            onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); setGuideDrag('h'); }}
            style={{
              position: 'absolute',
              left: guideLeft,
              top: guideHPx - 4,
              width: Math.max(0, canvasRightPx - guideLeft),
              height: 9,
              cursor: 'ns-resize',
              zIndex: 20,
            }}
          >
            <div style={{
              position: 'absolute', left: 0, right: 0, top: 4, height: 1,
              background: '#22d3ee', boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
              pointerEvents: 'none',
            }} />
          </div>
          {/* Vertical guide */}
          <div
            onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); setGuideDrag('v'); }}
            style={{
              position: 'absolute',
              top: guideTop,
              left: guideVPx - 4,
              height: Math.max(0, canvasBottomPx - guideTop),
              width: 9,
              cursor: 'ew-resize',
              zIndex: 20,
            }}
          >
            <div style={{
              position: 'absolute', top: 0, bottom: 0, left: 4, width: 1,
              background: '#22d3ee', boxShadow: '0 0 0 1px rgba(0,0,0,0.4)',
              pointerEvents: 'none',
            }} />
          </div>
        </>
      )}

      {/* Sponsor Logo */}
      <div className="absolute bottom-3 right-3 flex flex-col items-center gap-2 select-none">
        <span className="text-[18px] text-muted-foreground font-rajdhani uppercase tracking-widest pointer-events-none">Officially Sponsored By</span>
        <img
          src="/apexchill-logo.jpg"
          alt="ApexChill"
          className="h-[8.5rem] rounded-lg object-contain pointer-events-none"
        />
        <a
          href="https://discord.gg/3sKF42Pk8e"
          target="_blank"
          rel="noopener noreferrer"
          onMouseDown={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#23A55A] hover:bg-[#1E8E4E] active:bg-[#1A7D45] text-white text-sm font-semibold transition-colors shadow-md"
        >
          <svg width="18" height="14" viewBox="0 0 71 55" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1633 3.4046 32.7338 3.4046 27.3879 4.2216C26.9036 3.0581 26.1871 1.6353 25.5602 0.525289C25.5126 0.443589 25.4203 0.40133 25.3278 0.41542C20.2569 1.2888 15.4042 2.8186 10.8761 4.8978C10.8369 4.9147 10.8033 4.9429 10.781 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2316 37.3253 17.3505 34.1182 17.3505 30.1779C17.3505 26.2375 20.1755 23.0304 23.7259 23.0304C27.3038 23.0304 30.1568 26.2657 30.1008 30.1779C30.1008 34.1182 27.2757 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8234 37.3253 40.9424 34.1182 40.9424 30.1779C40.9424 26.2375 43.7674 23.0304 47.3178 23.0304C50.8957 23.0304 53.7487 26.2657 53.6927 30.1779C53.6927 34.1182 50.8957 37.3253 47.3178 37.3253Z" />
          </svg>
          Go to Server
        </a>
      </div>

      {/* Zoom & Pan controls */}
      <div
        className="absolute top-3 right-3 flex flex-col items-center gap-2 select-none pointer-events-auto"
        onMouseDown={(e) => e.stopPropagation()}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
      <div className="flex flex-col items-center gap-1">
        {/* Zoom */}
        <div className="flex items-center gap-1 mb-1">
          <button className={btnCls} onClick={() => adjustZoom(0.8333)}><Minus className="w-4 h-4 stroke-[3]" /></button>
          <span className="text-[10px] text-muted-foreground w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
          <button className={btnCls} onClick={() => adjustZoom(1.2)}><Plus className="w-4 h-4 stroke-[3]" /></button>
        </div>
        {/* D-pad */}
        <div className="grid grid-cols-3 gap-0.5" style={{ gridTemplateRows: 'repeat(3, 1.75rem)' }}>
          <span className="w-7 h-7" />
          <button className={btnCls} onClick={() => setPan(p => ({ ...p, y: p.y + PAN_STEP }))}><ChevronUp className="w-4 h-4 stroke-[3]" /></button>
          <span className="w-7 h-7" />
          <button className={btnCls} onClick={() => setPan(p => ({ ...p, x: p.x + PAN_STEP }))}><ChevronLeft className="w-4 h-4 stroke-[3]" /></button>
          <button className={`${btnCls} text-[10px]`} onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }}>↺</button>
          <button className={btnCls} onClick={() => setPan(p => ({ ...p, x: p.x - PAN_STEP }))}><ChevronRight className="w-4 h-4 stroke-[3]" /></button>
          <span className="w-7 h-7" />
          <button className={btnCls} onClick={() => setPan(p => ({ ...p, y: p.y - PAN_STEP }))}><ChevronDown className="w-4 h-4 stroke-[3]" /></button>
          <span className="w-7 h-7" />
        </div>
      </div>
        <CanvasTips />
      </div>
    </div>
  );
}