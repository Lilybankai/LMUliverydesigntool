import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RotateCcw, RotateCw, FlipHorizontal2, FlipVertical2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronRight as ChevR, Link2, Link2Off } from 'lucide-react';
import HoldButton from './HoldButton';
import TextEditorPanel from './TextEditorPanel';
import GradientPanel from './GradientPanel';

export default function PropertiesPanel({ layer, onChange }) {
  const [nudgeStep, setNudgeStep] = useState(10);
  const [sizeStep, setSizeStep] = useState(10);
  const [distortOpen, setDistortOpen] = useState(false);
  const [aspectLocked, setAspectLocked] = useState(false);

  if (!layer) {
    return (
      <div className="text-xs text-muted-foreground text-center py-6 px-2">
        Select a layer to edit its properties
      </div>
    );
  }

  const update = (key, val) => onChange({ ...layer, [key]: val });
  const isPatternOrTexture = layer.type?.startsWith('pat_') || layer.type?.startsWith('tex_');
  const nudge = (dx, dy) => onChange({ ...layer, x: layer.x + dx, y: layer.y + dy });
  const dpadBtn = "w-7 h-7 flex items-center justify-center rounded bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors select-none";

  // Resize keeping the visual centre fixed
  const resize = (key, val) => {
    const cx = layer.x + layer.width / 2;
    const cy = layer.y + layer.height / 2;
    let newW = key === 'width' ? val : layer.width;
    let newH = key === 'height' ? val : layer.height;
    if (aspectLocked && layer.width > 0 && layer.height > 0) {
      const ratio = layer.width / layer.height;
      if (key === 'width') newH = Math.max(10, val / ratio);
      else newW = Math.max(10, val * ratio);
    }
    onChange({ ...layer, width: newW, height: newH, x: cx - newW / 2, y: cy - newH / 2 });
  };

  // Adjust both width & height symmetrically, keeping centre fixed
  const resizeDelta = (dw, dh) => {
    let newW = Math.max(10, layer.width + dw);
    let newH = Math.max(10, layer.height + dh);
    if (aspectLocked && layer.width > 0 && layer.height > 0) {
      const ratio = layer.width / layer.height;
      if (dw !== 0 && dh === 0) newH = Math.max(10, newW / ratio);
      else if (dh !== 0 && dw === 0) newW = Math.max(10, newH * ratio);
    }
    const cx = layer.x + layer.width / 2;
    const cy = layer.y + layer.height / 2;
    onChange({ ...layer, width: newW, height: newH, x: cx - newW / 2, y: cy - newH / 2 });
  };

  const isText = layer.type === 'text';
  const isImage = layer.type === 'image';
  // Gradient is available on vector shapes and text — not patterns/textures (they already use two colours)
  // and not images.
  const showGradient = !isPatternOrTexture && !isImage;

  return (
    <div className="flex flex-col gap-4 p-1">
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-rajdhani">Properties</p>

      {/* Text editor — only for text layers */}
      {isText && <TextEditorPanel layer={layer} onChange={onChange} />}

      {/* Colour */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">{isText ? 'Text Colour' : isPatternOrTexture ? 'Colour 1' : 'Colour'}</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={layer.colour}
            onChange={e => update('colour', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
          />
          <Input
            value={layer.colour}
            onChange={e => update('colour', e.target.value)}
            className="h-7 text-xs font-mono uppercase"
          />
        </div>
      </div>

      {/* Second colour for patterns/textures */}
      {isPatternOrTexture && (
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Colour 2</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={layer.colour2 || '#FFFFFF'}
              onChange={e => update('colour2', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
            />
            <Input
              value={layer.colour2 || '#FFFFFF'}
              onChange={e => update('colour2', e.target.value)}
              className="h-7 text-xs font-mono uppercase"
            />
          </div>
        </div>
      )}

      {/* Gradient fill */}
      {showGradient && <GradientPanel layer={layer} onChange={onChange} />}

      {/* Opacity */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <Label className="text-xs">Opacity</Label>
          <span className="text-xs text-muted-foreground">{Math.round(layer.opacity * 100)}%</span>
        </div>
        <Slider
          min={0} max={1} step={0.001}
          value={[layer.opacity]}
          onValueChange={([v]) => update('opacity', v)}
        />
      </div>

      {/* Rotation */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <Label className="text-xs">Rotation</Label>
          <span className="text-xs text-muted-foreground">{layer.rotation}°</span>
        </div>
        <div className="flex gap-1 items-center">
          <Slider
            min={-180} max={180} step={0.5}
            value={[layer.rotation]}
            onValueChange={([v]) => update('rotation', v)}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-1.5 text-[10px] flex-shrink-0"
            onClick={() => update('rotation', 0)}
            title="Reset rotation"
          >
            Reset
          </Button>
        </div>
        <div className="flex gap-1 mt-0.5">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-6 text-[10px] gap-1"
            onClick={() => update('rotation', ((layer.rotation - 90 + 180) % 360) - 180)}
          >
            <RotateCcw className="w-3 h-3" /> -90°
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-6 text-[10px] gap-1"
            onClick={() => update('rotation', ((layer.rotation + 90 + 180) % 360) - 180)}
          >
            <RotateCw className="w-3 h-3" /> +90°
          </Button>
        </div>
        <div className="flex gap-1 mt-1">
          <Button
            variant={layer.flipX ? "default" : "outline"}
            size="sm"
            className={`flex-1 h-6 text-[10px] gap-1 ${layer.flipX ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => update('flipX', !layer.flipX)}
            title="Flip horizontally"
          >
            <FlipHorizontal2 className="w-3 h-3" />
          </Button>
          <Button
            variant={layer.flipY ? "default" : "outline"}
            size="sm"
            className={`flex-1 h-6 text-[10px] gap-1 ${layer.flipY ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => update('flipY', !layer.flipY)}
            title="Flip vertically"
          >
            <FlipVertical2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Position — D-pad */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <Label className="text-xs">Position</Label>
          <div className="flex items-center gap-1">
            {[1, 10, 50].map(s => (
              <button
                key={s}
                onClick={() => setNudgeStep(s)}
                className={`text-[10px] px-1.5 h-5 rounded transition-colors ${nudgeStep === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/70'}`}
              >
                {s}px
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {/* D-pad */}
          <div className="grid grid-cols-3 gap-0.5 select-none" style={{ gridTemplateRows: 'repeat(3, 1.75rem)' }}>
            <span className="w-7 h-7" />
            <HoldButton className={dpadBtn} onAction={() => nudge(0, -nudgeStep)} title="Up"><ChevronUp className="w-4 h-4 stroke-[3]" /></HoldButton>
            <span className="w-7 h-7" />
            <HoldButton className={dpadBtn} onAction={() => nudge(-nudgeStep, 0)} title="Left"><ChevronLeft className="w-4 h-4 stroke-[3]" /></HoldButton>
            <span className="w-7 h-7" />
            <HoldButton className={dpadBtn} onAction={() => nudge(nudgeStep, 0)} title="Right"><ChevronRight className="w-4 h-4 stroke-[3]" /></HoldButton>
            <span className="w-7 h-7" />
            <HoldButton className={dpadBtn} onAction={() => nudge(0, nudgeStep)} title="Down"><ChevronDown className="w-4 h-4 stroke-[3]" /></HoldButton>
            <span className="w-7 h-7" />
          </div>
          {/* Numeric inputs */}
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground w-3">X</span>
              <Input type="number" value={Math.round(layer.x)} onChange={e => update('x', Number(e.target.value))} className="h-6 text-xs" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground w-3">Y</span>
              <Input type="number" value={Math.round(layer.y)} onChange={e => update('y', Number(e.target.value))} className="h-6 text-xs" />
            </div>
          </div>
        </div>
      </div>

      {/* Skew */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <Label className="text-xs">Skew X</Label>
          <span className="text-xs text-muted-foreground">{(layer.skewX ?? 0).toFixed(1)}°</span>
        </div>
        <Slider
          min={-60} max={60} step={0.5}
          value={[layer.skewX ?? 0]}
          onValueChange={([v]) => update('skewX', v)}
        />
      </div>

      {/* Size — D-pad */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <Label className="text-xs">Size</Label>
          <div className="flex items-center gap-1">
            {[1, 10, 50].map(s => (
              <button
                key={s}
                onClick={() => setSizeStep(s)}
                className={`text-[10px] px-1.5 h-5 rounded transition-colors ${sizeStep === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/70'}`}
              >
                {s}px
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {/* D-pad: up/down = height ±, left/right = width ± */}
          <div className="grid grid-cols-3 gap-0.5 select-none" style={{ gridTemplateRows: 'repeat(3, 1.75rem)' }}>
            <span className="w-7 h-7" />
            <HoldButton className={dpadBtn} onAction={() => resizeDelta(0, sizeStep)} title="Height +"><ChevronUp className="w-4 h-4 stroke-[3]" /></HoldButton>
            <span className="w-7 h-7" />
            <HoldButton className={dpadBtn} onAction={() => resizeDelta(-sizeStep, 0)} title="Width −"><ChevronLeft className="w-4 h-4 stroke-[3]" /></HoldButton>
            <button
              type="button"
              onClick={() => setAspectLocked(l => !l)}
              title={aspectLocked ? 'Aspect ratio locked — click to unlock' : 'Lock aspect ratio'}
              className={`w-7 h-7 flex items-center justify-center rounded transition-colors select-none ${aspectLocked ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-primary hover:text-primary-foreground'}`}
            >
              {aspectLocked ? <Link2 className="w-3.5 h-3.5" /> : <Link2Off className="w-3.5 h-3.5" />}
            </button>
            <HoldButton className={dpadBtn} onAction={() => resizeDelta(sizeStep, 0)} title="Width +"><ChevronRight className="w-4 h-4 stroke-[3]" /></HoldButton>
            <span className="w-7 h-7" />
            <HoldButton className={dpadBtn} onAction={() => resizeDelta(0, -sizeStep)} title="Height −"><ChevronDown className="w-4 h-4 stroke-[3]" /></HoldButton>
            <span className="w-7 h-7" />
          </div>
          {/* Numeric inputs */}
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground w-3">W</span>
              <Input type="number" value={Math.round(layer.width)} onChange={e => resize('width', Math.max(10, Number(e.target.value)))} className="h-6 text-xs" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground w-3">H</span>
              <Input type="number" value={Math.round(layer.height)} onChange={e => resize('height', Math.max(10, Number(e.target.value)))} className="h-6 text-xs" />
            </div>
          </div>
        </div>
      </div>

      {/* Width / Height sliders (large movements) */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <Label className="text-xs">Width</Label>
            <span className="text-xs text-muted-foreground">{Math.round(layer.width)}</span>
          </div>
          <Slider min={10} max={4096} step={10} value={[layer.width]} onValueChange={([v]) => resize('width', v)} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <Label className="text-xs">Height</Label>
            <span className="text-xs text-muted-foreground">{Math.round(layer.height)}</span>
          </div>
          <Slider min={10} max={4096} step={10} value={[layer.height]} onValueChange={([v]) => resize('height', v)} />
        </div>
      </div>

      {/* Distort dropdown */}
      <button
        onClick={() => setDistortOpen(o => !o)}
        className="flex items-center justify-between w-full text-left py-1 hover:text-foreground transition-colors"
      >
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-rajdhani">Distortion</span>
        <ChevR className={`w-3 h-3 text-muted-foreground transition-transform ${distortOpen ? 'rotate-90' : ''}`} />
      </button>
      {distortOpen && (<>
      {/* Distort corners */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-rajdhani">Corners</p>
        {['TL', 'TR', 'BR', 'BL'].map((label, i) => {
          const corners = layer.corners || [{ dx: 0, dy: 0 }, { dx: 0, dy: 0 }, { dx: 0, dy: 0 }, { dx: 0, dy: 0 }];
          const c = corners[i];
          const updateCorner = (axis, val) => {
            const newCorners = corners.map((cc, ci) => ci === i ? { ...cc, [axis]: val } : { ...cc });
            onChange({ ...layer, corners: newCorners });
          };
          return (
            <div key={label} className="flex flex-col gap-1 bg-secondary/30 rounded p-1.5">
              <span className="text-[10px] text-muted-foreground font-rajdhani uppercase">{label}</span>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">X</span>
                  <span className="text-[10px] text-muted-foreground">{Math.round(c.dx)}</span>
                </div>
                <Slider min={-500} max={500} step={5} value={[c.dx]} onValueChange={([v]) => updateCorner('dx', v)} />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">Y</span>
                  <span className="text-[10px] text-muted-foreground">{Math.round(c.dy)}</span>
                </div>
                <Slider min={-500} max={500} step={5} value={[c.dy]} onValueChange={([v]) => updateCorner('dy', v)} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Edge curvature */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-rajdhani">Edges (Curves)</p>
        {['Top', 'Right', 'Bottom', 'Left'].map((label, i) => {
          const edges = layer.edges || [{ dx: 0, dy: 0 }, { dx: 0, dy: 0 }, { dx: 0, dy: 0 }, { dx: 0, dy: 0 }];
          const e = edges[i];
          const updateEdge = (axis, val) => {
            const newEdges = edges.map((ee, ei) => ei === i ? { ...ee, [axis]: val } : { ...ee });
            onChange({ ...layer, edges: newEdges });
          };
          return (
            <div key={label} className="flex flex-col gap-1 bg-secondary/30 rounded p-1.5">
              <span className="text-[10px] text-muted-foreground font-rajdhani uppercase">{label}</span>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">X</span>
                  <span className="text-[10px] text-muted-foreground">{Math.round(e.dx)}</span>
                </div>
                <Slider min={-500} max={500} step={5} value={[e.dx]} onValueChange={([v]) => updateEdge('dx', v)} />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">Y</span>
                  <span className="text-[10px] text-muted-foreground">{Math.round(e.dy)}</span>
                </div>
                <Slider min={-500} max={500} step={5} value={[e.dy]} onValueChange={([v]) => updateEdge('dy', v)} />
              </div>
            </div>
          );
        })}
        <button
          className="text-[10px] text-muted-foreground hover:text-destructive text-left transition-colors"
          onClick={() => onChange({
            ...layer,
            corners: [{ dx: 0, dy: 0 }, { dx: 0, dy: 0 }, { dx: 0, dy: 0 }, { dx: 0, dy: 0 }],
            edges:   [{ dx: 0, dy: 0 }, { dx: 0, dy: 0 }, { dx: 0, dy: 0 }, { dx: 0, dy: 0 }],
          })}
        >
          Reset distort &amp; curves
        </button>
      </div>
      </>)}

    </div>
  );
}