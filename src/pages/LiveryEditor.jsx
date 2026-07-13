const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useCallback, useRef, useEffect } from 'react';

import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { VEHICLES } from '@/lib/vehicles';

const MOZA_LINK = 'https://mozaracing.com/XILEGTSIMRACING';
const ADS = [
  { imageUrl: 'https://media.db.com/images/public/6a0c25ca8273ff880fbe6f1c/1a6296c3f_1689229122434.png', linkUrl: MOZA_LINK, title: 'MOZA Racing R12' },
  { imageUrl: 'https://media.db.com/images/public/6a0c25ca8273ff880fbe6f1c/8a2bd148d_1689229122434.png', linkUrl: MOZA_LINK, title: 'MOZA Racing KS Wheel' },
  { imageUrl: 'https://media.db.com/images/public/6a0c25ca8273ff880fbe6f1c/6e3325c66_1678434668438.png', linkUrl: MOZA_LINK, title: 'MOZA Racing R5 Bundle' },
  { imageUrl: 'https://media.db.com/images/public/6a0c25ca8273ff880fbe6f1c/e61ea5338_1678434788622.jpg', linkUrl: MOZA_LINK, title: 'MOZA Racing GS Wheel' },
  { imageUrl: 'https://media.db.com/images/public/6a0c25ca8273ff880fbe6f1c/acc57cb54_1689229073282.png', linkUrl: MOZA_LINK, title: 'MOZA Racing SRP2 Pedals' },
  { imageUrl: 'https://media.db.com/images/public/6a0c25ca8273ff880fbe6f1c/85f6217e7_Screenshot2026-05-23112321.png', linkUrl: 'https://my.trophi.ai/get-trophi?via=scot', title: 'Trophi.ai - Your Ultimate Cockpit Companion' },
  { imageUrl: 'https://media.db.com/images/public/6a0c25ca8273ff880fbe6f1c/bc49e074c_Screenshot2026-05-23143745.png', linkUrl: MOZA_LINK, title: 'MOZA Lamborghini Revuelto Steering Wheel' },
  { imageUrl: 'https://media.db.com/images/public/6a0c25ca8273ff880fbe6f1c/fa74c12a9_Screenshot2026-05-23143645.png', linkUrl: MOZA_LINK, title: 'MOZA R25 Ultra' },
  { imageUrl: 'https://media.db.com/images/public/6a0c25ca8273ff880fbe6f1c/ddc17e5bd_Screenshot2026-05-23143315.png', linkUrl: MOZA_LINK, title: 'MOZA KS Pro Steering Wheel' },
  { imageUrl: 'https://media.db.com/images/public/6a0c25ca8273ff880fbe6f1c/d8db524de_Screenshot2026-05-23112712.png', linkUrl: 'https://my.trophi.ai/get-trophi?via=scot', title: 'Trophi.ai - Discord Reviews' },
  { imageUrl: 'https://media.db.com/images/public/6a0c25ca8273ff880fbe6f1c/90c3ae6dd_Screenshot2026-05-23112456.png', linkUrl: 'https://my.trophi.ai/get-trophi?via=scot', title: 'Trophi.ai - Get Faster in Less Time' },
  { imageUrl: 'https://media.db.com/images/public/6a0c25ca8273ff880fbe6f1c/946d6eb87_Screenshot2026-05-23112406.png', linkUrl: 'https://my.trophi.ai/get-trophi?via=scot', title: 'Trophi.ai - Champions are Made Here' },
];
import { createLayer, createTextLayer, drawShape } from '@/lib/shapes';
import { exportCanvasAsTga } from '@/lib/exportTga';
import { loadImageFile } from '@/lib/importImage';
import TopBar from '@/components/livery/TopBar';
import Toolbar from '@/components/livery/Toolbar';
import LayerPanel from '@/components/livery/LayerPanel';
import PropertiesPanel from '@/components/livery/PropertiesPanel';
import LiveryCanvas from '@/components/livery/LiveryCanvas';
import ImageImport from '@/components/livery/ImageImport';
import ExportAdDialog from '@/components/livery/ExportAdDialog';
import InteractiveTutorial from '@/components/livery/InteractiveTutorial';
import MobileWarningDialog from '@/components/livery/MobileWarningDialog';
import SaveDesignDialog from '@/components/livery/SaveDesignDialog';
import MyDesignsDialog from '@/components/livery/MyDesignsDialog';
import PaywallDialog from '@/components/livery/PaywallDialog';
import SuggestionDialog from '@/components/livery/SuggestionDialog';
import { isAdminEmail } from '@/lib/admin';
import useHistory from '@/hooks/useHistory';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

// Paywall is disabled for now (login is required up front, downloads are free).
// Flip to true to re-enable the free-export limit + subscription gate.
const PAYWALL_ENABLED = false;

export default function LiveryEditor() {
  const [vehicleId, setVehicleId] = useState(VEHICLES[0].id);
  const [baseColour, setBaseColour] = useState('#1E6FA8');
  const [customColour, setCustomColour] = useState('#FF0000');
  const { state: layers, set: setLayers, commit: commitLayers, undo, redo, canUndo, canRedo, reset: resetLayers } = useHistory([]);
  const [selectedId, setSelectedId] = useState(null);

  // Keyboard shortcuts: Ctrl/Cmd+Z = undo, Ctrl/Cmd+Shift+Z or Ctrl+Y = redo
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      } else if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);
  const [uvVisible, setUvVisible] = useState(true);
  const [stickersVisible, setStickersVisible] = useState(true);
  const [guidesVisible, setGuidesVisible] = useState(false);
  const [baseOpacity, setBaseOpacity] = useState(1);
  const [adOpen, setAdOpen] = useState(false);
  const [currentAd, setCurrentAd] = useState(null);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [toolbarGroup, setToolbarGroup] = useState(null);
  const [canvasDragging, setCanvasDragging] = useState(false);

  // Auto-show tutorial on first visit
  useEffect(() => {
    if (!localStorage.getItem('lmu_tutorial_seen')) {
      const t = setTimeout(() => setTutorialOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  // Save/Load state
  const { isAuthenticated, user, checkUserAuth, logout } = useAuth();
  const { toast } = useToast();
  const [saveOpen, setSaveOpen] = useState(false);
  const [myDesignsOpen, setMyDesignsOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [hasActiveSub, setHasActiveSub] = useState(false);

  // Check subscription status for logged-in users.
  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      setHasActiveSub(false);
      return;
    }
    let cancelled = false;
    db.entities.Subscription
      .filter({ user_email: user.email, status: 'active' }, '-created_date', 1)
      .then(rows => { if (!cancelled) setHasActiveSub(rows && rows.length > 0); })
      .catch(() => { if (!cancelled) setHasActiveSub(false); });
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.email]);

  const stickersImgRef = useRef(null);

  const vehicle = VEHICLES.find(v => v.id === vehicleId) || VEHICLES[0];

  const resolvedBase = baseColour === 'custom' ? customColour : baseColour;

  useEffect(() => {
    stickersImgRef.current = null;
    if (!vehicle.classStickers) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { stickersImgRef.current = img; };
    img.src = vehicle.classStickers;
  }, [vehicle.classStickers]);

  const handleVehicleChange = useCallback((id) => {
    setVehicleId(id);
    resetLayers([]);
    setSelectedId(null);
  }, [resetLayers]);

  // Returns "<base> N" where N is the next unused index among existing layers
  // whose label starts with the same base name.
  const nextLabel = useCallback((base, existing) => {
    const re = new RegExp('^' + base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+(\\d+)(?:\\s|$)', 'i');
    let max = 0;
    for (const l of existing) {
      const m = (l.label || '').match(re);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
    return `${base} ${max + 1}`;
  }, []);

  const handleAddShape = useCallback((type) => {
    const layer = createLayer(type, vehicle.canvasWidth, vehicle.canvasHeight);
    setLayers(prev => {
      layer.label = nextLabel(layer.label, prev);
      return [...prev, layer];
    });
    setSelectedId(layer.id);
  }, [vehicle, setLayers, nextLabel]);

  const handleAddText = useCallback(() => {
    const layer = createTextLayer(vehicle.canvasWidth, vehicle.canvasHeight);
    setLayers(prev => {
      layer.label = nextLabel('Text', prev);
      return [...prev, layer];
    });
    setSelectedId(layer.id);
  }, [vehicle, setLayers, nextLabel]);

  // Normal layer change — commits to history (used by properties panel, etc.)
  const handleLayerChange = useCallback((updated) => {
    setLayers(prev => prev.map(l => l.id === updated.id ? updated : l));
  }, [setLayers]);

  // Live update during canvas drag — does NOT commit; the top of history is replaced
  const handleLayerDrag = useCallback((updated) => {
    setLayers(prev => prev.map(l => l.id === updated.id ? updated : l), { commit: false });
  }, [setLayers]);

  // Called by canvas on mouse-up to snapshot the drag result into history
  const handleLayerCommit = useCallback(() => {
    commitLayers();
  }, [commitLayers]);

  const handleToggleVisible = useCallback((id) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  }, [setLayers]);

  const handleDelete = useCallback((id) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    setSelectedId(prev => prev === id ? null : prev);
  }, [setLayers]);

  const handleDuplicate = useCallback((id) => {
    setLayers(prev => {
      const idx = prev.findIndex(l => l.id === id);
      if (idx === -1) return prev;
      const src = prev[idx];
      // Strip any trailing " N" so incremental naming continues from the base name.
      const base = (src.label || 'Layer').replace(/\s+\d+(?:\s*\(Mirror\))?$/i, '').replace(/\s*\(Mirror\)$/i, '');
      const copy = {
        ...src,
        id: crypto.randomUUID(),
        x: src.x + 30,
        y: src.y + 30,
        corners: (src.corners || [{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0}]).map(c => ({ ...c })),
        edges: (src.edges || [{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0}]).map(e => ({ ...e })),
        label: nextLabel(base, prev),
      };
      const arr = [...prev];
      arr.splice(idx + 1, 0, copy);
      return arr;
    });
  }, [setLayers, nextLabel]);

  // Mirror: duplicate the layer and rotate it 180° (offset slightly so it's visible).
  const handleMirror = useCallback((id) => {
    setLayers(prev => {
      const idx = prev.findIndex(l => l.id === id);
      if (idx === -1) return prev;
      const src = prev[idx];
      const base = (src.label || 'Layer').replace(/\s+\d+(?:\s*\(Mirror\))?$/i, '').replace(/\s*\(Mirror\)$/i, '');
      const copy = {
        ...src,
        id: crypto.randomUUID(),
        x: src.x + 30,
        y: src.y + 30,
        rotation: ((src.rotation || 0) + 180) % 360,
        corners: (src.corners || [{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0}]).map(c => ({ ...c })),
        edges: (src.edges || [{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0}]).map(e => ({ ...e })),
        label: `${nextLabel(base, prev)} (Mirror)`,
      };
      const arr = [...prev];
      arr.splice(idx + 1, 0, copy);
      return arr;
    });
  }, [setLayers, nextLabel]);

  const handleImageLayer = useCallback((url, imgW, imgH, imgEl) => {
    const maxSize = Math.min(vehicle.canvasWidth, vehicle.canvasHeight) * 0.4;
    const scale = Math.min(maxSize / imgW, maxSize / imgH, 1);
    const w = imgW * scale;
    const h = imgH * scale;
    const layer = {
      id: crypto.randomUUID(),
      type: 'image',
      x: vehicle.canvasWidth / 2 - w / 2,
      y: vehicle.canvasHeight / 2 - h / 2,
      width: w,
      height: h,
      rx: 0,
      rotation: 0,
      skewX: 0,
      flipX: false,
      flipY: false,
      corners: [{ dx: 0, dy: 0 }, { dx: 0, dy: 0 }, { dx: 0, dy: 0 }, { dx: 0, dy: 0 }],
      edges: [{ dx: 0, dy: 0 }, { dx: 0, dy: 0 }, { dx: 0, dy: 0 }, { dx: 0, dy: 0 }],
      colour: '#FFFFFF',
      colour2: '#FFFFFF',
      opacity: 1,
      visible: true,
      label: 'Image',
      imageUrl: url,
      _imgElement: imgEl,
    };
    setLayers(prev => {
      layer.label = nextLabel('Image', prev);
      return [...prev, layer];
    });
    setSelectedId(layer.id);
  }, [vehicle, setLayers, nextLabel]);

  const handleReorder = useCallback((fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= layers.length) return;
    setLayers(prev => {
      const arr = [...prev];
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
  }, [layers, setLayers]);

  const selectedLayer = layers.find(l => l.id === selectedId) || null;

  // Strip non-serializable / transient fields from layers (e.g. cached _imgElement)
  const serializeLayers = useCallback((arr) => {
    return arr.map(({ _imgElement, ...rest }) => rest);
  }, []);

  // Login is required to reach the tool, so these are always available.
  const requestSaveDesign = useCallback(() => setSaveOpen(true), []);

  const requestMyDesigns = useCallback(() => setMyDesignsOpen(true), []);

  const handleSaveDesign = useCallback(async (name) => {
    await db.entities.SavedDesign.create({
      name,
      vehicleId,
      baseColour,
      customColour,
      baseOpacity,
      layers: serializeLayers(layers),
    });
    db.analytics.track({
      eventName: 'livery_saved',
      properties: { vehicle_id: vehicleId, vehicle_name: vehicle.name, layer_count: layers.length },
    });
    toast({ title: 'Design saved', description: `"${name}" was saved to your designs.` });
  }, [vehicleId, vehicle.name, baseColour, customColour, baseOpacity, layers, serializeLayers, toast]);

  // Image layers are saved with their imageUrl but not the live HTMLImageElement
  // (_imgElement is stripped before saving). Rebuild that element from the URL so
  // drawShape has something to draw — otherwise loaded images render as blank.
  const rehydrateImageLayers = useCallback((arr) => Promise.all(
    (arr || []).map((layer) => {
      if (layer.type !== 'image' || !layer.imageUrl) return layer;
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ ...layer, _imgElement: img });
        img.onerror = () => resolve(layer); // dead URL (e.g. old blob:) — keep layer, just no image
        img.src = layer.imageUrl;
      });
    })
  ), []);

  const handleLoadDesign = useCallback(async (design) => {
    setVehicleId(design.vehicleId);
    if (design.baseColour) setBaseColour(design.baseColour);
    if (design.customColour) setCustomColour(design.customColour);
    if (typeof design.baseOpacity === 'number') setBaseOpacity(design.baseOpacity);
    const layers = await rehydrateImageLayers(design.layers || []);
    resetLayers(layers);
    setSelectedId(null);
    toast({ title: 'Design loaded', description: `"${design.name}" is ready to edit.` });
  }, [rehydrateImageLayers, resetLayers, toast]);

  const renderOffscreen = useCallback(() => {
    const offscreen = document.createElement('canvas');
    offscreen.width = vehicle.canvasWidth;
    offscreen.height = vehicle.canvasHeight;
    const ctx = offscreen.getContext('2d');
    ctx.fillStyle = resolvedBase;
    ctx.fillRect(0, 0, offscreen.width, offscreen.height);
    for (const layer of layers) {
      if (!layer.visible) continue;
      drawShape(ctx, layer);
    }
    // Class stickers — always on top for export
    if (stickersVisible && stickersImgRef.current) {
      ctx.drawImage(stickersImgRef.current, 0, 0, offscreen.width, offscreen.height);
    }
    return offscreen;
  }, [vehicle, resolvedBase, layers, stickersVisible]);

  // Paywall logic:
  //  • Anonymous users get 1 free export (tracked in localStorage).
  //  • Signed-in users get a 7-day unlimited free trial from signup, then 1 free
  //    export beyond that, then must subscribe.
  const TRIAL_DAYS = 7;
  const isInFreeTrial = useCallback(() => {
    if (!isAuthenticated || !user?.created_date) return false;
    const signupMs = new Date(user.created_date).getTime();
    if (Number.isNaN(signupMs)) return false;
    return (Date.now() - signupMs) < TRIAL_DAYS * 24 * 60 * 60 * 1000;
  }, [isAuthenticated, user]);

  const hasUsedFreeExport = useCallback(() => {
    if (isAuthenticated && user) return !!user.free_export_used;
    try { return localStorage.getItem('lmu_free_export_used') === '1'; } catch { return false; }
  }, [isAuthenticated, user]);

  const markFreeExportUsed = useCallback(async () => {
    if (isAuthenticated && user && !user.free_export_used) {
      try {
        await db.auth.updateMe({ free_export_used: true });
        checkUserAuth();
      } catch (e) { /* non-fatal */ }
    } else if (!isAuthenticated) {
      try { localStorage.setItem('lmu_free_export_used', '1'); } catch (e) { /* ignore */ }
    }
  }, [isAuthenticated, user, checkUserAuth]);

  const handleExport = useCallback(() => {
    db.analytics.track({
      eventName: 'export_dialog_opened',
      properties: {
        vehicle_id: vehicleId,
        vehicle_name: vehicle.name,
        layer_count: layers.length,
        base_colour: resolvedBase,
      },
    });
    // Gate: active subscribers and trial-window users pass. Otherwise honor the free export.
    if (PAYWALL_ENABLED && !hasActiveSub && !isInFreeTrial() && hasUsedFreeExport()) {
      setPaywallOpen(true);
      return;
    }
    const randomAd = ADS[Math.floor(Math.random() * ADS.length)];
    setCurrentAd(randomAd);
    setAdOpen(true);
  }, [vehicleId, vehicle.name, layers.length, resolvedBase, hasUsedFreeExport, hasActiveSub]);

  const handleDownload = useCallback(() => {
    db.analytics.track({
      eventName: 'livery_downloaded',
      properties: {
        vehicle_id: vehicleId,
        vehicle_name: vehicle.name,
        layer_count: layers.length,
        base_colour: resolvedBase,
      },
    });
    exportCanvasAsTga(renderOffscreen(), 'customskin.tga');
    // Only consume the "free export" if the user is NOT a subscriber AND not in their trial window.
    if (PAYWALL_ENABLED && !hasActiveSub && !isInFreeTrial()) markFreeExportUsed();
  }, [renderOffscreen, vehicleId, vehicle.name, layers.length, resolvedBase, hasActiveSub, isInFreeTrial, markFreeExportUsed]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <TopBar
        vehicleId={vehicleId}
        onVehicleChange={handleVehicleChange}
        baseColour={baseColour}
        onBaseColourChange={setBaseColour}
        customColour={customColour}
        onCustomColourChange={setCustomColour}
        onExport={handleExport}
        onStartTutorial={() => setTutorialOpen(true)}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onSaveDesign={requestSaveDesign}
        onOpenMyDesigns={requestMyDesigns}
        onOpenSuggestions={() => setSuggestOpen(true)}
        isAdmin={isAdminEmail(user?.email)}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={() => logout(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — shape toolbar */}
        <aside className="w-44 flex-shrink-0 border-r border-border bg-card p-2 flex flex-col gap-3 overflow-y-auto">
          <div data-tutorial="toolbar">
            <Toolbar
              onAddShape={handleAddShape}
              onAddText={handleAddText}
              openGroup={toolbarGroup}
              onOpenGroupChange={setToolbarGroup}
            />
          </div>
          <div data-tutorial="image-import">
            <ImageImport onImageLayer={handleImageLayer} />
          </div>

          <div data-tutorial="base-controls" className="mt-auto flex flex-col gap-3 pb-1">
            {/* Base colour controls */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-rajdhani">Base</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={baseColour === 'custom' ? customColour : baseColour}
                  onChange={e => {
                    setCustomColour(e.target.value);
                    setBaseColour('custom');
                  }}
                  className="w-7 h-7 rounded cursor-pointer border border-border bg-transparent flex-shrink-0"
                />
                <Input
                  value={baseColour === 'custom' ? customColour : baseColour}
                  onChange={e => {
                    setCustomColour(e.target.value);
                    setBaseColour('custom');
                  }}
                  className="h-7 text-xs font-mono uppercase"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">Opacity</span>
                <span className="text-[10px] text-muted-foreground">{Math.round(baseOpacity * 100)}%</span>
              </div>
              <Slider
                min={0} max={1} step={0.01}
                value={[baseOpacity]}
                onValueChange={([v]) => setBaseOpacity(v)}
              />
            </div>

            {/* UV Guide toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="uv-toggle"
                checked={uvVisible}
                onCheckedChange={setUvVisible}
                className="data-[state=checked]:bg-primary scale-75"
              />
              <Label htmlFor="uv-toggle" className="text-xs text-muted-foreground cursor-pointer">UV Guide</Label>
            </div>

            {/* Class Stickers toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="stickers-toggle"
                checked={stickersVisible}
                onCheckedChange={setStickersVisible}
                disabled={!vehicle.classStickers}
                className="data-[state=checked]:bg-primary scale-75"
              />
              <Label htmlFor="stickers-toggle" className={`text-xs cursor-pointer ${vehicle.classStickers ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
                Class Stickers
              </Label>
            </div>

            {/* Guide Lines toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="guides-toggle"
                checked={guidesVisible}
                onCheckedChange={setGuidesVisible}
                className="data-[state=checked]:bg-primary scale-75"
              />
              <Label htmlFor="guides-toggle" className="text-xs text-muted-foreground cursor-pointer">Guide Lines</Label>
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <div
          data-tutorial="canvas"
          className="flex-1 flex overflow-hidden relative"
          onDragOver={e => { e.preventDefault(); setCanvasDragging(true); }}
          onDragLeave={e => {
            // Only clear when leaving the wrapper itself, not child elements
            if (e.currentTarget === e.target) setCanvasDragging(false);
          }}
          onDrop={e => {
            e.preventDefault();
            setCanvasDragging(false);
            const file = e.dataTransfer.files?.[0];
            loadImageFile(file, handleImageLayer);
          }}
        >
        {canvasDragging && (
          <div className="pointer-events-none absolute inset-3 z-10 border-2 border-dashed border-primary bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="text-primary text-sm font-rajdhani font-bold uppercase tracking-widest">Drop image to add</span>
          </div>
        )}
        <LiveryCanvas
          vehicle={vehicle}
          baseColour={resolvedBase}
          baseOpacity={baseOpacity}
          layers={layers}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onLayerChange={handleLayerDrag}
          onLayerCommit={handleLayerCommit}
          uvVisible={uvVisible}
          stickersVisible={stickersVisible}
          guidesVisible={guidesVisible}
        />
        </div>

        {/* Right panel — layers + properties */}
        <aside className="w-80 flex-shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-2">
            <div data-tutorial="layers">
            <LayerPanel
              layers={layers}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onToggleVisible={handleToggleVisible}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onMirror={handleMirror}
              onReorder={handleReorder}
            />
            </div>

            <div data-tutorial="properties">
            {selectedLayer && (
              <>
                <div className="my-3 h-px bg-border" />
                <PropertiesPanel
                  layer={selectedLayer}
                  onChange={handleLayerChange}
                />
              </>
            )}
            </div>
          </ScrollArea>
        </aside>
      </div>

      <MobileWarningDialog />
      <SaveDesignDialog open={saveOpen} onOpenChange={setSaveOpen} onSave={handleSaveDesign} />
      <MyDesignsDialog open={myDesignsOpen} onOpenChange={setMyDesignsOpen} onLoad={handleLoadDesign} />
      <ExportAdDialog open={adOpen} onOpenChange={setAdOpen} ad={currentAd} onDownload={handleDownload} />
      <PaywallDialog open={paywallOpen} onOpenChange={setPaywallOpen} />
      <SuggestionDialog open={suggestOpen} onOpenChange={setSuggestOpen} />
      <InteractiveTutorial
        open={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        onStepChange={(step) => { if (step?.group) setToolbarGroup(step.group); }}
      />
    </div>
  );
}