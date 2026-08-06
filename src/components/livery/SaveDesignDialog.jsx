const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Save, AlertTriangle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { VEHICLES } from '@/lib/vehicles';
import { MAX_DESIGNS } from '@/lib/savedDesigns';

export default function SaveDesignDialog({ open, onOpenChange, onSave, currentDesignId = null, currentDesignName = '' }) {
  const [name, setName] = useState('');
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [replaceId, setReplaceId] = useState(null);
  // 'update' overwrites the loaded design in place; 'new' saves a fresh copy.
  const [mode, setMode] = useState('new');

  useEffect(() => {
    if (!open) return;
    setName(currentDesignId ? (currentDesignName || '') : '');
    setMode(currentDesignId ? 'update' : 'new');
    setReplaceId(null);
    setLoading(true);
    db.entities.SavedDesign.list('-updated_date').then((list) => {
      setDesigns(list || []);
      setLoading(false);
    });
  }, [open, currentDesignId, currentDesignName]);

  const isUpdate = mode === 'update' && !!currentDesignId;
  // The design limit only matters when creating a NEW entry — overwriting an
  // existing one never adds a row, so it must work even when the user is full.
  const atLimit = !isUpdate && designs.length >= MAX_DESIGNS;
  const blockedByLimit = atLimit && !replaceId;

  const handleSave = async () => {
    if (!name.trim()) return;
    if (blockedByLimit) return;
    setBusy(true);
    try {
      if (atLimit && replaceId) {
        await db.entities.SavedDesign.delete(replaceId);
      }
      await onSave(name.trim(), { update: isUpdate });
      onOpenChange(false);
    } catch {
      // onSave surfaces its own error toast — keep the dialog open so the user
      // can retry rather than silently losing the click.
    } finally {
      setBusy(false);
    }
  };

  const vehicleName = (id) => VEHICLES.find(v => v.id === id)?.name || id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-rajdhani text-xl uppercase tracking-wide flex items-center gap-2">
            <Save className="w-5 h-5 text-primary" />
            Save Design
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Name your livery so you can recall it later. ({designs.length}/{MAX_DESIGNS} saved)
          </DialogDescription>
        </DialogHeader>

        {currentDesignId && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('update')}
              className={`rounded p-2 text-left text-xs border transition-colors ${
                mode === 'update'
                  ? 'bg-primary/15 border-primary text-foreground'
                  : 'bg-secondary border-border hover:bg-secondary/80 text-muted-foreground'
              }`}
            >
              <div className="font-semibold">Update this design</div>
              <div className="text-[10px] truncate">Overwrite "{currentDesignName}"</div>
            </button>
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`rounded p-2 text-left text-xs border transition-colors ${
                mode === 'new'
                  ? 'bg-primary/15 border-primary text-foreground'
                  : 'bg-secondary border-border hover:bg-secondary/80 text-muted-foreground'
              }`}
            >
              <div className="font-semibold">Save as new</div>
              <div className="text-[10px] truncate">Keep a separate copy</div>
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wider font-rajdhani">Design Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My awesome livery"
            maxLength={60}
            autoFocus
          />
        </div>

        {atLimit && (
          <div className="flex flex-col gap-2 p-3 rounded bg-destructive/10 border border-destructive/40">
            <div className="flex items-start gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-xs leading-relaxed">
                You've reached the {MAX_DESIGNS}-design limit. Choose one to replace:
              </p>
            </div>
            <div className="max-h-48 overflow-y-auto flex flex-col gap-1 mt-1">
              {loading && <p className="text-xs text-muted-foreground">Loading…</p>}
              {designs.map(d => (
                <button
                  key={d.id}
                  onClick={() => setReplaceId(d.id)}
                  className={`flex items-center gap-2 p-2 rounded text-left text-xs border transition-colors ${
                    replaceId === d.id
                      ? 'bg-destructive/20 border-destructive text-foreground'
                      : 'bg-secondary border-border hover:bg-secondary/80'
                  }`}
                >
                  <Trash2 className={`w-3.5 h-3.5 flex-shrink-0 ${replaceId === d.id ? 'text-destructive' : 'text-muted-foreground'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{d.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {vehicleName(d.vehicleId)} • {format(new Date(d.updated_date), 'MMM d, yyyy')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-1">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!name.trim() || busy || blockedByLimit}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-rajdhani font-semibold tracking-wide gap-2"
          >
            <Save className="w-4 h-4" />
            {isUpdate ? 'Update' : (atLimit && replaceId ? 'Replace & Save' : 'Save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}