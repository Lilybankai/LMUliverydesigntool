import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, ChevronDown, Search } from 'lucide-react';
import { GOOGLE_FONTS, loadGoogleFont, ensureFontReady } from '@/lib/googleFonts';

function FontPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const current = value || 'Inter';
  const filtered = query
    ? GOOGLE_FONTS.filter(f => f.toLowerCase().includes(query.toLowerCase()))
    : GOOGLE_FONTS;

  // Preload current font so the trigger preview renders in the chosen face
  useEffect(() => { loadGoogleFont(current); }, [current]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-7 w-full text-xs bg-input border border-border rounded px-2 flex items-center justify-between gap-2"
          style={{ fontFamily: `"${current}", sans-serif` }}
        >
          <span className="truncate">{current}</span>
          <ChevronDown className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-2 border-b border-border flex items-center gap-2">
          <Search className="w-3 h-3 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search fonts..."
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-72 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="text-xs text-muted-foreground p-3 text-center">No fonts found</div>
          )}
          {filtered.map(f => (
            <FontRow
              key={f}
              name={f}
              selected={f === current}
              onSelect={() => {
                onChange(f);
                setOpen(false);
                setQuery('');
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FontRow({ name, selected, onSelect }) {
  // Load each font when its row mounts so the preview renders in its own face
  useEffect(() => { loadGoogleFont(name); }, [name]);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors ${selected ? 'bg-secondary' : ''}`}
      style={{ fontFamily: `"${name}", sans-serif` }}
    >
      {name}
    </button>
  );
}

export default function TextEditorPanel({ layer, onChange }) {
  // Strip any inherited CSS fallback list (e.g. "Rajdhani, sans-serif" → "Rajdhani")
  // and unquote so the picker matches Google Fonts entries.
  const rawFamily = layer.fontFamily || 'Inter';
  const fontName = rawFamily.split(',')[0].replace(/^["']|["']$/g, '').trim();
  const align = layer.textAlign || 'center';

  const update = (key, val) => onChange({ ...layer, [key]: val });

  // Ensure the font is available for canvas rendering whenever font/size/weight changes
  useEffect(() => {
    ensureFontReady(fontName, layer.fontSize || 96, layer.fontWeight === 'bold' ? '700' : '400', layer.fontStyle || 'normal');
  }, [fontName, layer.fontSize, layer.fontWeight, layer.fontStyle]);

  return (
    <div className="flex flex-col gap-3 bg-secondary/30 rounded p-2 border border-border/50">
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-rajdhani">Text</p>

      {/* Content */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Content</Label>
        <Textarea
          value={layer.text || ''}
          onChange={e => update('text', e.target.value)}
          rows={2}
          className="text-xs resize-none"
          placeholder="Type text..."
        />
      </div>

      {/* Font family — Google Fonts */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Font (Google Fonts)</Label>
        <FontPicker value={fontName} onChange={(name) => update('fontFamily', name)} />
      </div>

      {/* Font size */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <Label className="text-xs">Size</Label>
          <span className="text-xs text-muted-foreground">{Math.round(layer.fontSize || 96)}px</span>
        </div>
        <div className="flex gap-2 items-center">
          <Slider
            min={12} max={600} step={2}
            value={[layer.fontSize || 96]}
            onValueChange={([v]) => update('fontSize', v)}
            className="flex-1"
          />
          <Input
            type="number"
            value={Math.round(layer.fontSize || 96)}
            onChange={e => update('fontSize', Math.max(8, Number(e.target.value)))}
            className="h-6 w-16 text-xs"
          />
        </div>
      </div>

      {/* Style buttons */}
      <div className="flex gap-1">
        <Button
          variant={layer.fontWeight === 'bold' ? 'default' : 'outline'}
          size="sm"
          className={`flex-1 h-7 ${layer.fontWeight === 'bold' ? 'bg-primary text-primary-foreground' : ''}`}
          onClick={() => update('fontWeight', layer.fontWeight === 'bold' ? 'normal' : 'bold')}
          title="Bold"
        >
          <Bold className="w-3 h-3" />
        </Button>
        <Button
          variant={layer.fontStyle === 'italic' ? 'default' : 'outline'}
          size="sm"
          className={`flex-1 h-7 ${layer.fontStyle === 'italic' ? 'bg-primary text-primary-foreground' : ''}`}
          onClick={() => update('fontStyle', layer.fontStyle === 'italic' ? 'normal' : 'italic')}
          title="Italic"
        >
          <Italic className="w-3 h-3" />
        </Button>
      </div>

      {/* Alignment */}
      <div className="flex gap-1">
        {[
          { v: 'left', icon: AlignLeft },
          { v: 'center', icon: AlignCenter },
          { v: 'right', icon: AlignRight },
        ].map(({ v, icon: Icon }) => (
          <Button
            key={v}
            variant={align === v ? 'default' : 'outline'}
            size="sm"
            className={`flex-1 h-7 ${align === v ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => update('textAlign', v)}
            title={`Align ${v}`}
          >
            <Icon className="w-3 h-3" />
          </Button>
        ))}
      </div>

      {/* Letter spacing */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <Label className="text-xs">Letter Spacing</Label>
          <span className="text-xs text-muted-foreground">{(layer.letterSpacing ?? 0).toFixed(1)}</span>
        </div>
        <Slider
          min={-20} max={50} step={0.5}
          value={[layer.letterSpacing ?? 0]}
          onValueChange={([v]) => update('letterSpacing', v)}
        />
      </div>

      {/* Stroke */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-border/50">
        <Label className="text-xs">Outline</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={layer.strokeColour || '#000000'}
            onChange={e => update('strokeColour', e.target.value)}
            className="w-7 h-7 rounded cursor-pointer border border-border bg-transparent flex-shrink-0"
          />
          <Input
            value={layer.strokeColour || '#000000'}
            onChange={e => update('strokeColour', e.target.value)}
            className="h-7 text-xs font-mono uppercase"
          />
        </div>
        <div className="flex justify-between">
          <span className="text-[10px] text-muted-foreground">Width</span>
          <span className="text-[10px] text-muted-foreground">{(layer.strokeWidth ?? 0).toFixed(1)}px</span>
        </div>
        <Slider
          min={0} max={30} step={0.5}
          value={[layer.strokeWidth ?? 0]}
          onValueChange={([v]) => update('strokeWidth', v)}
        />
      </div>
    </div>
  );
}