import { useState } from 'react';
import { Eye, EyeOff, Trash2, ChevronUp, ChevronDown, ChevronRight, Copy, FlipHorizontal, Lock, Unlock, Folder, FolderPlus, FolderMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function LayerPanel({
  layers, selectedId, onSelect, onToggleVisible, onToggleLock, onRename, onDelete, onReorder, onDuplicate, onMirror,
  onCreateGroup, onAddToGroup, onRemoveFromGroup, onRenameGroup, onToggleGroupVisible, onToggleGroupLock, onUngroup, onDeleteGroup,
}) {
  const [editingId, setEditingId] = useState(null); // a layer id, or `group:<gid>`
  const [draft, setDraft] = useState('');
  const [collapsed, setCollapsed] = useState(() => new Set());

  const toggleCollapsed = (gid) => setCollapsed(prev => {
    const next = new Set(prev);
    if (next.has(gid)) next.delete(gid); else next.add(gid);
    return next;
  });

  const startRename = (key, current) => { setEditingId(key); setDraft(current); };
  const commitLayerRename = (layer) => {
    const name = draft.trim();
    if (name && name !== layer.label) onRename(layer.id, name);
    setEditingId(null);
  };
  const commitGroupRename = (gid, current) => {
    const name = draft.trim();
    if (name && name !== current) onRenameGroup(gid, name);
    setEditingId(null);
  };

  // Existing groups, in first-seen order (for the "add to group" menu).
  const groups = [];
  const seen = new Set();
  for (const l of layers) {
    if (l.groupId && !seen.has(l.groupId)) { seen.add(l.groupId); groups.push({ id: l.groupId, name: l.groupName || 'Group' }); }
  }

  // Display list: one folder per groupId (all members collected, at the group's
  // frontmost position); ungrouped layers stand alone.
  const reversed = [...layers].reverse(); // top of panel = front-most
  const emitted = new Set();
  const items = [];
  for (const layer of reversed) {
    if (layer.groupId) {
      if (emitted.has(layer.groupId)) continue;
      emitted.add(layer.groupId);
      items.push({
        type: 'group',
        gid: layer.groupId,
        name: layer.groupName || 'Group',
        members: reversed.filter(l => l.groupId === layer.groupId),
      });
    } else {
      items.push({ type: 'layer', layer });
    }
  }

  const realIndexOf = (id) => layers.findIndex(l => l.id === id);

  const renderRow = (layer, indented) => {
    const realIdx = realIndexOf(layer.id);
    return (
      <div
        key={layer.id}
        onClick={() => onSelect(layer.id)}
        className={cn(
          'flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer group transition-colors text-xs',
          indented && 'ml-3',
          selectedId === layer.id
            ? 'bg-primary/20 text-primary border border-primary/30'
            : 'bg-secondary/40 hover:bg-secondary text-foreground border border-transparent'
        )}
      >
        <div className="w-3 h-3 rounded-sm flex-shrink-0 border border-border" style={{ background: layer.colour }} />

        {editingId === layer.id ? (
          <input
            autoFocus
            value={draft}
            maxLength={40}
            onClick={e => e.stopPropagation()}
            onChange={e => setDraft(e.target.value)}
            onBlur={() => commitLayerRename(layer)}
            onKeyDown={e => {
              if (e.key === 'Enter') commitLayerRename(layer);
              else if (e.key === 'Escape') setEditingId(null);
            }}
            className="flex-1 min-w-0 bg-background border border-primary/50 rounded px-1 py-0.5 text-xs outline-none"
          />
        ) : (
          <span
            className={cn('flex-1 truncate flex items-center gap-1', !layer.visible && 'opacity-40')}
            onDoubleClick={e => { e.stopPropagation(); startRename(layer.id, layer.label); }}
            title="Double-click to rename"
          >
            {layer.locked && <Lock className="w-3 h-3 flex-shrink-0 text-primary" />}
            <span className="truncate">{layer.label}</span>
          </span>
        )}

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

        {/* group assignment menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost" size="icon"
              className={cn('h-5 w-5', !layer.groupId && 'opacity-0 group-hover:opacity-60 hover:!opacity-100')}
              onClick={e => e.stopPropagation()}
              title={layer.groupId ? 'Grouping' : 'Add to a group'}
            >
              {layer.groupId ? <FolderMinus className="w-3 h-3 text-accent" /> : <FolderPlus className="w-3 h-3" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => onCreateGroup(layer.id)}>New group from layer</DropdownMenuItem>
            {groups.filter(g => g.id !== layer.groupId).length > 0 && <DropdownMenuSeparator />}
            {groups.filter(g => g.id !== layer.groupId).map(g => (
              <DropdownMenuItem key={g.id} onClick={() => onAddToGroup(layer.id, g.id)}>
                Add to “{g.name}”
              </DropdownMenuItem>
            ))}
            {layer.groupId && <DropdownMenuSeparator />}
            {layer.groupId && <DropdownMenuItem onClick={() => onRemoveFromGroup(layer.id)}>Remove from group</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost" size="icon"
          className={cn('h-5 w-5', !layer.locked && 'opacity-0 group-hover:opacity-60 hover:!opacity-100')}
          onClick={e => { e.stopPropagation(); onToggleLock(layer.id); }}
          title={layer.locked ? 'Unlock layer' : 'Lock layer'}
        >
          {layer.locked ? <Lock className="w-3 h-3 text-primary" /> : <Unlock className="w-3 h-3 text-muted-foreground" />}
        </Button>

        <Button
          variant="ghost" size="icon"
          className="h-5 w-5"
          onClick={e => { e.stopPropagation(); onToggleVisible(layer.id); }}
        >
          {layer.visible
            ? <Eye className="w-3 h-3 text-muted-foreground" />
            : <EyeOff className="w-3 h-3 text-muted-foreground opacity-40" />}
        </Button>

        <Button
          variant="ghost" size="icon"
          className="h-5 w-5 opacity-0 group-hover:opacity-60 hover:!opacity-100"
          onClick={e => { e.stopPropagation(); onDuplicate(layer.id); }}
          title="Duplicate"
        >
          <Copy className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost" size="icon"
          className="h-5 w-5 opacity-0 group-hover:opacity-60 hover:!opacity-100"
          onClick={e => { e.stopPropagation(); onMirror(layer.id); }}
          title="Mirror (duplicate + 180°)"
        >
          <FlipHorizontal className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost" size="icon"
          className="h-5 w-5 hover:text-destructive disabled:opacity-30"
          onClick={e => { e.stopPropagation(); onDelete(layer.id); }}
          disabled={layer.locked}
          title={layer.locked ? 'Unlock to delete' : 'Delete'}
        >
          <Trash2 className="w-3 h-3 text-muted-foreground" />
        </Button>
      </div>
    );
  };

  const renderGroup = (item) => {
    const { gid, name, members } = item;
    const isCollapsed = collapsed.has(gid);
    const anyVisible = members.some(m => m.visible);
    const allLocked = members.length > 0 && members.every(m => m.locked);
    return (
      <div key={`group:${gid}`} className="flex flex-col gap-1">
        <div className="flex items-center gap-1 px-2 py-1.5 rounded bg-secondary/70 border border-border text-xs">
          <button
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => toggleCollapsed(gid)}
            title={isCollapsed ? 'Expand group' : 'Collapse group'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <Folder className="w-3.5 h-3.5 flex-shrink-0 text-accent" />

          {editingId === `group:${gid}` ? (
            <input
              autoFocus
              value={draft}
              maxLength={40}
              onChange={e => setDraft(e.target.value)}
              onBlur={() => commitGroupRename(gid, name)}
              onKeyDown={e => {
                if (e.key === 'Enter') commitGroupRename(gid, name);
                else if (e.key === 'Escape') setEditingId(null);
              }}
              className="flex-1 min-w-0 bg-background border border-primary/50 rounded px-1 py-0.5 text-xs outline-none"
            />
          ) : (
            <span
              className="flex-1 truncate font-semibold"
              onDoubleClick={() => startRename(`group:${gid}`, name)}
              title="Double-click to rename group"
            >
              {name} <span className="text-muted-foreground font-normal">({members.length})</span>
            </span>
          )}

          <Button
            variant="ghost" size="icon" className="h-5 w-5"
            onClick={() => onToggleGroupVisible(gid)}
            title={anyVisible ? 'Hide group' : 'Show group'}
          >
            {anyVisible ? <Eye className="w-3 h-3 text-muted-foreground" /> : <EyeOff className="w-3 h-3 text-muted-foreground opacity-40" />}
          </Button>
          <Button
            variant="ghost" size="icon" className="h-5 w-5"
            onClick={() => onToggleGroupLock(gid)}
            title={allLocked ? 'Unlock group' : 'Lock group'}
          >
            {allLocked ? <Lock className="w-3 h-3 text-primary" /> : <Unlock className="w-3 h-3 text-muted-foreground" />}
          </Button>
          <Button
            variant="ghost" size="icon" className="h-5 w-5"
            onClick={() => onUngroup(gid)}
            title="Ungroup (keep layers)"
          >
            <FolderMinus className="w-3 h-3 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost" size="icon" className="h-5 w-5 hover:text-destructive"
            onClick={() => onDeleteGroup(gid)}
            title="Delete group and its layers"
          >
            <Trash2 className="w-3 h-3 text-muted-foreground" />
          </Button>
        </div>

        {!isCollapsed && members.map(m => renderRow(m, true))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-accent uppercase tracking-widest px-1 pb-1 font-rajdhani font-bold">Layers</p>
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground px-1 py-4 text-center">No layers yet.<br />Add a shape to begin.</p>
      )}
      {items.map(item => item.type === 'group' ? renderGroup(item) : renderRow(item.layer, false))}
    </div>
  );
}
