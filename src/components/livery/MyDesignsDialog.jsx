const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

import { FolderOpen, Trash2, Upload, CopyX } from 'lucide-react';
import { format } from 'date-fns';
import { VEHICLES } from '@/lib/vehicles';
import { MAX_DESIGNS, findDuplicateIds } from '@/lib/savedDesigns';

export default function MyDesignsDialog({ open, onOpenChange, onLoad }) {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deduping, setDeduping] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const { toast } = useToast();

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
    // The list is metadata-only, so fetch the full design (with layers) now.
    setLoadingId(design.id);
    try {
      const full = await db.entities.SavedDesign.get(design.id);
      await onLoad(full);
      onOpenChange(false);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not open design',
        description: err?.message || 'Please try again.',
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    await db.entities.SavedDesign.delete(id);
    refresh();
  };

  // Ids of redundant copies (older duplicates that share a name + vehicle).
  const duplicateIds = findDuplicateIds(designs);

  const handleRemoveDuplicates = async () => {
    if (duplicateIds.length === 0) return;
    setDeduping(true);
    try {
      await Promise.all(duplicateIds.map(id => db.entities.SavedDesign.delete(id)));
      toast({
        title: 'Duplicates removed',
        description: `Removed ${duplicateIds.length} duplicate ${duplicateIds.length === 1 ? 'copy' : 'copies'}, keeping the newest of each.`,
      });
      await refresh();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not remove duplicates',
        description: err?.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setDeduping(false);
    }
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
            {designs.length}/{MAX_DESIGNS} saved designs. Click one to load it.
          </DialogDescription>
        </DialogHeader>

        {duplicateIds.length > 0 && !loading && (
          <div className="flex items-center gap-3 p-3 rounded bg-accent/10 border border-accent/40">
            <CopyX className="w-4 h-4 flex-shrink-0 text-accent" />
            <p className="flex-1 text-xs leading-relaxed text-foreground">
              You have {duplicateIds.length} duplicate {duplicateIds.length === 1 ? 'design' : 'designs'} (same
              name and vehicle). Remove them to free up space — the newest copy of each is kept.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRemoveDuplicates}
              disabled={deduping}
              className="flex-shrink-0 gap-1.5"
            >
              <CopyX className="w-3.5 h-3.5" />
              {deduping ? 'Removing…' : `Remove ${duplicateIds.length}`}
            </Button>
          </div>
        )}

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
                  {vehicleName(d.vehicleId)} • {format(new Date(d.updated_date), 'MMM d, yyyy')}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleLoad(d)}
                disabled={loadingId === d.id}
                className="gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                {loadingId === d.id ? 'Loading…' : 'Load'}
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