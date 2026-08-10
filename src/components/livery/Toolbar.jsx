import { useState } from 'react';
import { SHAPE_TYPES, SHAPE_GROUPS } from '@/lib/shapes';
import { Button } from '@/components/ui/button';
import { Type, Lasso } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export default function Toolbar({ onAddShape, onAddText, onStartAreaDraw, areaDrawing = false, openGroup: openGroupProp, onOpenGroupChange }) {
  const [openGroupState, setOpenGroupState] = useState(null);
  const openGroup = openGroupProp !== undefined ? openGroupProp : openGroupState;
  const setOpenGroup = onOpenGroupChange || setOpenGroupState;

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2">
        {/* Add Text — top-level button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddText?.()}
          className="w-full justify-start gap-2 h-7 text-xs font-bold uppercase tracking-widest font-rajdhani hover:bg-primary/10 hover:text-primary hover:border-primary/40"
        >
          <Type className="w-3.5 h-3.5" />
          Add Text
        </Button>

        {/* Draw Area — freeform selection you can fill with a colour or pattern */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStartAreaDraw?.()}
              className={cn(
                "w-full justify-start gap-2 h-7 text-xs font-bold uppercase tracking-widest font-rajdhani",
                areaDrawing
                  ? "bg-accent/20 text-accent border-accent/60"
                  : "hover:bg-primary/10 hover:text-primary hover:border-primary/40"
              )}
            >
              <Lasso className="w-3.5 h-3.5" />
              {areaDrawing ? 'Drawing…' : 'Draw Area'}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Draw a freeform area, then fill it with a colour or pattern</TooltipContent>
        </Tooltip>

        {SHAPE_GROUPS.map(group => {
          const items = SHAPE_TYPES.filter(s => s.group === group.id);
          const isOpen = openGroup === group.id;
          return (
            <div key={group.id} data-tutorial-group={group.id} className="flex flex-col">
              <button
                className={cn(
                  "flex items-center justify-between px-2 py-1.5 text-xs font-bold uppercase tracking-widest font-rajdhani transition-colors",
                  isOpen ? "text-accent" : "text-foreground/80 hover:text-accent"
                )}
                onClick={() => setOpenGroup(isOpen ? null : group.id)}
              >
                <span>{group.label}</span>
                <span className="text-[10px]">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="flex flex-col gap-0.5 bg-card border border-border rounded-lg p-1.5">
                  {items.map(shape => (
                    <Tooltip key={shape.id}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2 h-7 text-xs font-medium hover:bg-primary/10 hover:text-primary"
                          onClick={() => onAddShape(shape.id)}
                        >
                          <span className="text-sm leading-none w-4 text-center">{shape.icon}</span>
                          <span className="truncate">{shape.label}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Add {shape.label}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}