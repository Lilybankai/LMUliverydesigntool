import { Eye, EyeOff, Trash2, ChevronUp, ChevronDown, Copy, FlipHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function LayerPanel({ layers, selectedId, onSelect, onToggleVisible, onDelete, onReorder, onDuplicate, onMirror }) {
  const reversedLayers = [...layers].reverse();

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-foreground/80 uppercase tracking-widest px-1 pb-1 font-rajdhani font-bold">Layers</p>
      {reversedLayers.length === 0 && (
        <p className="text-xs text-muted-foreground px-1 py-4 text-center">No layers yet.<br />Add a shape to begin.</p>
      )}
      {reversedLayers.map((layer, revIdx) => {
        const realIdx = layers.length - 1 - revIdx;
        return (
          <div
            key={layer.id}
            onClick={() => onSelect(layer.id)}
            className={cn(
              'flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer group transition-colors text-xs',
              selectedId === layer.id
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-secondary/40 hover:bg-secondary text-foreground border border-transparent'
            )}
          >
            {/* colour swatch */}
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0 border border-border"
              style={{ background: layer.colour }}
            />
            {/* label */}
            <span className={cn('flex-1 truncate', !layer.visible && 'opacity-40')}>{layer.label}</span>
            {/* reorder */}
            <Button
              variant="ghost" size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-60 hover:!opacity-100"
              onClick={e => { e.stopPropagation(); onReorder(realIdx, realIdx + 1); }}
              disabled={realIdx === layers.length - 1}
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost" size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-60 hover:!opacity-100"
              onClick={e => { e.stopPropagation(); onReorder(realIdx, realIdx - 1); }}
              disabled={realIdx === 0}
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
            {/* visible toggle */}
            <Button
              variant="ghost" size="icon"
              className="h-5 w-5"
              onClick={e => { e.stopPropagation(); onToggleVisible(layer.id); }}
            >
              {layer.visible
                ? <Eye className="w-3 h-3 text-muted-foreground" />
                : <EyeOff className="w-3 h-3 text-muted-foreground opacity-40" />}
            </Button>
            {/* duplicate */}
            <Button
              variant="ghost" size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-60 hover:!opacity-100"
              onClick={e => { e.stopPropagation(); onDuplicate(layer.id); }}
              title="Duplicate"
            >
              <Copy className="w-3 h-3" />
            </Button>
            {/* mirror — duplicate + rotate 180° */}
            <Button
              variant="ghost" size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-60 hover:!opacity-100"
              onClick={e => { e.stopPropagation(); onMirror(layer.id); }}
              title="Mirror (duplicate + 180°)"
            >
              <FlipHorizontal className="w-3 h-3" />
            </Button>
            {/* delete */}
            <Button
              variant="ghost" size="icon"
              className="h-5 w-5 hover:text-destructive"
              onClick={e => { e.stopPropagation(); onDelete(layer.id); }}
            >
              <Trash2 className="w-3 h-3 text-muted-foreground" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}