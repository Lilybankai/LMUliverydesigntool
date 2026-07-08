import { useState } from 'react';
import { SHAPE_TYPES, SHAPE_GROUPS } from '@/lib/shapes';
import { Button } from '@/components/ui/button';
import { Type } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function Toolbar({ onAddShape, onAddText, openGroup: openGroupProp, onOpenGroupChange }) {
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
        {SHAPE_GROUPS.map(group => {
          const items = SHAPE_TYPES.filter(s => s.group === group.id);
          const isOpen = openGroup === group.id;
          return (
            <div key={group.id} data-tutorial-group={group.id} className="flex flex-col">
              <button
                className="flex items-center justify-between px-2 py-1.5 text-xs font-bold uppercase tracking-widest font-rajdhani text-foreground/80 hover:text-foreground transition-colors"
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