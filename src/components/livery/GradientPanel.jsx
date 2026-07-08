import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

const DEFAULT_GRADIENT = {
  enabled: false,
  kind: 'linear', // 'linear' | 'radial'
  angle: 0,       // degrees, 0 = top->bottom
  stops: [
    { offset: 0, color: '#E63946' },
    { offset: 1, color: '#FFFFFF' },
  ],
};

export function getLayerGradient(layer) {
  return { ...DEFAULT_GRADIENT, ...(layer.gradient || {}) };
}

export default function GradientPanel({ layer, onChange }) {
  const g = getLayerGradient(layer);
  const [open, setOpen] = useState(!!layer.gradient?.enabled);

  const update = (patch) => onChange({ ...layer, gradient: { ...g, ...patch } });
  const setStop = (i, patch) => {
    const stops = g.stops.map((s, si) => si === i ? { ...s, ...patch } : s);
    update({ stops });
  };
  const addStop = () => {
    const last = g.stops[g.stops.length - 1];
    const second = g.stops[g.stops.length - 2] || { offset: 0 };
    const newOffset = Math.min(1, (last.offset + second.offset) / 2 + 0.1);
    update({ stops: [...g.stops, { offset: newOffset, color: '#888888' }].sort((a, b) => a.offset - b.offset) });
  };
  const removeStop = (i) => {
    if (g.stops.length <= 2) return;
    update({ stops: g.stops.filter((_, si) => si !== i) });
  };

  // CSS preview gradient
  const previewCss = `linear-gradient(to right, ${
    [...g.stops].sort((a, b) => a.offset - b.offset).map(s => `${s.color} ${s.offset * 100}%`).join(', ')
  })`;

  return (
    <div className="flex flex-col gap-2 bg-secondary/30 rounded p-2 border border-border/50">
      <div className="flex items-center justify-between">
        <Label htmlFor="grad-toggle" className="text-xs cursor-pointer">Gradient Fill</Label>
        <Switch
          id="grad-toggle"
          checked={g.enabled}
          onCheckedChange={(v) => { update({ enabled: v }); if (v) setOpen(true); }}
          className="data-[state=checked]:bg-primary scale-75"
        />
      </div>

      {g.enabled && (
        <>
          {/* Preview */}
          <div
            className="h-5 rounded border border-border"
            style={{ background: previewCss }}
          />

          {/* Type */}
          <div className="flex gap-1">
            {['linear', 'radial'].map(k => (
              <Button
                key={k}
                variant={g.kind === k ? 'default' : 'outline'}
                size="sm"
                className={`flex-1 h-6 text-[10px] capitalize ${g.kind === k ? 'bg-primary text-primary-foreground' : ''}`}
                onClick={() => update({ kind: k })}
              >
                {k}
              </Button>
            ))}
          </div>

          {/* Angle (linear only) */}
          {g.kind === 'linear' && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <Label className="text-xs">Angle</Label>
                <span className="text-xs text-muted-foreground">{Math.round(g.angle)}°</span>
              </div>
              <Slider
                min={0} max={360} step={1}
                value={[g.angle]}
                onValueChange={([v]) => update({ angle: v })}
              />
            </div>
          )}

          {/* Stops */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Colour Stops</Label>
              <button
                onClick={addStop}
                className="h-5 px-1.5 text-[10px] rounded bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-1"
                title="Add colour stop"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            {g.stops.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={s.color}
                  onChange={e => setStop(i, { color: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-border bg-transparent flex-shrink-0"
                />
                <Input
                  value={s.color}
                  onChange={e => setStop(i, { color: e.target.value })}
                  className="h-6 text-[10px] font-mono uppercase flex-1"
                />
                <Input
                  type="number"
                  min={0} max={100}
                  value={Math.round(s.offset * 100)}
                  onChange={e => setStop(i, { offset: Math.max(0, Math.min(1, Number(e.target.value) / 100)) })}
                  className="h-6 w-12 text-[10px]"
                  title="Position (%)"
                />
                <button
                  onClick={() => removeStop(i)}
                  disabled={g.stops.length <= 2}
                  className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Remove stop"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}