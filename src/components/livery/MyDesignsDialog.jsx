const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { FolderOpen, Trash2, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { VEHICLES } from '@/lib/vehicles';

export default function MyDesignsDialog({ open, onOpenChange, onLoad }) {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const list = await db.entities.SavedDesign.list('-updated_date');
    setDesigns(list || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const vehicleName = (id) => VEHICLES.find(v => v.id === id)?.name || id;

  const handleLoad = async (design) => {
    await onLoad(design);
    onOpenChange(false);
  };

  const handleDelete = async (id) => {
    await db.entities.SavedDesign.delete(id);
    refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-rajdhani text-xl uppercase tracking-wide flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            My Designs
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {designs.length}/10 saved designs. Click one to load it.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto flex flex-col gap-2">
          {loading && <p className="text-sm text-muted-foreground text-center py-6">Loading…</p>}
          {!loading && designs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No saved designs yet. Use <span className="text-primary font-semibold">Save Design</span> to store one.
            </p>
          )}
          {designs.map(d => (
            <div
              key={d.id}
              className="flex items-center gap-2 p-3 rounded bg-secondary border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{d.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {vehicleName(d.vehicleId)} • {(d.layers?.length || 0)} layers • {format(new Date(d.updated_date), 'MMM d, yyyy')}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleLoad(d)}
                className="gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Load
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(d.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}