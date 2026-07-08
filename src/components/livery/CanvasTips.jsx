import { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

const TIPS = [
  { k: 'Right-click + drag', v: 'Pan the canvas view' },
  { k: 'Mouse wheel', v: 'Zoom in / out at cursor' },
  { k: 'Click a shape', v: 'Select it to edit' },
  { k: 'Drag a shape', v: 'Move it around the canvas' },
  { k: 'Drag yellow corners', v: 'Distort the shape' },
  { k: 'Drag blue edges', v: 'Curve the edges' },
  { k: 'Ctrl + Z / Shift+Z', v: 'Undo / Redo' },
];

export default function CanvasTips() {
  const [open, setOpen] = useState(true);

  return (
    <div className="w-48 bg-card/90 backdrop-blur-sm border border-border rounded-md shadow-lg overflow-hidden pointer-events-auto">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-rajdhani font-600 uppercase tracking-wider text-foreground/90 hover:bg-secondary/50 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Lightbulb className="w-3 h-3 text-primary" />
          Canvas Tips
        </span>
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <ul className="flex flex-col gap-1 px-2 pb-2 pt-1 border-t border-border">
          {TIPS.map((t) => (
            <li key={t.k} className="flex flex-col leading-tight">
              <span className="text-[10px] font-mono text-primary">{t.k}</span>
              <span className="text-[10px] text-muted-foreground">{t.v}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}