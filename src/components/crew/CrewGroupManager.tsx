import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCampaign } from '@/contexts/CampaignContext';
import { CREW_COLOR_PRESETS, type CrewGroup } from '@/types/database';
import { Plus, Pencil, Trash2, Ship, Users, ChevronUp, ChevronDown } from 'lucide-react';

interface CrewGroupManagerProps {
  onClose?: () => void;
}

export function CrewGroupManager({ onClose }: CrewGroupManagerProps) {
  const { crewGroups, vehicles, characters, saveCrewGroup, deleteCrewGroup, isGM } = useCampaign();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CrewGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<CrewGroup | null>(null);
  const [localOrder, setLocalOrder] = useState<string[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [color, setColor] = useState(CREW_COLOR_PRESETS[0].color);
  const [shipId, setShipId] = useState<string>('none');
  const [description, setDescription] = useState('');

  const openCreateDialog = () => {
    setEditingGroup(null);
    setName('');
    setColor(CREW_COLOR_PRESETS[0].color);
    setShipId('none');
    setDescription('');
    setDialogOpen(true);
  };

  const openEditDialog = (group: CrewGroup) => {
    setEditingGroup(group);
    setName(group.name);
    setColor(group.color);
    setShipId(group.ship_id || 'none');
    setDescription(group.description || '');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    await saveCrewGroup({
      ...(editingGroup ? { id: editingGroup.id } : {}),
      name: name.trim(),
      color,
      ship_id: shipId === 'none' ? undefined : shipId,
      description: description.trim() || undefined,
    });

    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingGroup) return;
    await deleteCrewGroup(deletingGroup.id);
    setDeletingGroup(null);
  };

  // Maintain local display order; sync when crewGroups change
  React.useEffect(() => {
    setLocalOrder(prev => {
      const ids = crewGroups.map(g => g.id);
      const kept = prev.filter(id => ids.includes(id));
      const added = ids.filter(id => !prev.includes(id));
      return [...kept, ...added];
    });
  }, [crewGroups]);

  const orderedGroups = localOrder
    .map(id => crewGroups.find(g => g.id === id))
    .filter(Boolean) as CrewGroup[];

  const moveGroup = (id: string, dir: -1 | 1) => {
    setLocalOrder(prev => {
      const idx = prev.indexOf(id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const getMemberCount = (groupId: string) =>
    characters.filter(c => c.crew_id === groupId).length;

  const getShipName = (shipId?: string) => {
    if (!shipId) return null;
    return vehicles.find(v => v.id === shipId)?.name || null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="panel-header mb-0">
          <span className="panel-title">CREW GROUPS</span>
          <span className="panel-status">{crewGroups.length} GROUPS</span>
        </div>
        {isGM && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-mono border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/20"
            onClick={openCreateDialog}
          >
            <Plus className="h-3 w-3 mr-1" />
            New Crew
          </Button>
        )}
      </div>

      {crewGroups.length === 0 ? (
        <div className="p-4 border border-primary/20 rounded font-mono text-sm text-[var(--text-dimmer)] text-center bg-background/30">
          No crew groups defined.{isGM ? ' Create one to get started.' : ''}
        </div>
      ) : (
        <div className="space-y-2">
          {orderedGroups.map((group, idx) => {
            const memberCount = getMemberCount(group.id);
            const shipName = getShipName(group.ship_id);
            return (
              <div
                key={group.id}
                className="p-3 border border-primary/20 rounded font-mono text-sm bg-background/40 flex items-center gap-3"
                style={{ borderLeftWidth: '4px', borderLeftColor: group.color }}
              >
                {/* Reorder arrows */}
                {isGM && orderedGroups.length > 1 && (
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button
                      className="h-4 w-4 flex items-center justify-center text-[var(--text-dimmer)] hover:text-[var(--primary)] disabled:opacity-20"
                      onClick={() => moveGroup(group.id, -1)}
                      disabled={idx === 0}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      className="h-4 w-4 flex items-center justify-center text-[var(--text-dimmer)] hover:text-[var(--primary)] disabled:opacity-20"
                      onClick={() => moveGroup(group.id, 1)}
                      disabled={idx === orderedGroups.length - 1}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Color dot */}
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: group.color, boxShadow: `0 0 6px ${group.color}` }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ color: group.color }} className="font-bold">
                      {group.name}
                    </span>
                    <span className="text-[var(--text-dimmer)] text-xs flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {memberCount}
                    </span>
                    {shipName && (
                      <span className="text-[var(--text-dimmer)] text-xs flex items-center gap-1">
                        <Ship className="h-3 w-3" />
                        {shipName}
                      </span>
                    )}
                  </div>
                  {group.description && (
                    <div className="text-[var(--text-dimmer)] text-xs mt-0.5 truncate">
                      {group.description}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {isGM && (
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-[var(--text-dimmer)] hover:text-[var(--primary)]"
                      onClick={() => openEditDialog(group)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-[var(--text-dimmer)] hover:text-red-400"
                      onClick={() => setDeletingGroup(group)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingGroup} onOpenChange={open => { if (!open) setDeletingGroup(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deletingGroup?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the crew group and unassign all {deletingGroup ? getMemberCount(deletingGroup.id) : 0} member(s). This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingGroup(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Crew Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono">
              {editingGroup ? 'EDIT CREW GROUP' : 'CREATE CREW GROUP'}
            </DialogTitle>
            <DialogDescription>
              {editingGroup ? 'Update crew group settings.' : 'Define a new color-coded crew group.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="font-mono text-xs text-[var(--text-dimmer)] mb-1 block">NAME</label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Red Crew, Harrier Crew"
                className="font-mono"
              />
            </div>

            {/* Color */}
            <div>
              <label className="font-mono text-xs text-[var(--text-dimmer)] mb-1 block">COLOR</label>
              <div className="flex gap-2 flex-wrap">
                {CREW_COLOR_PRESETS.map(preset => (
                  <button
                    key={preset.color}
                    className="w-8 h-8 rounded border-2 transition-all"
                    style={{
                      backgroundColor: preset.color,
                      borderColor: color === preset.color ? '#fff' : 'transparent',
                      boxShadow: color === preset.color ? `0 0 8px ${preset.color}` : 'none',
                    }}
                    onClick={() => setColor(preset.color)}
                    title={preset.name}
                  />
                ))}
                {/* Custom color input */}
                <Input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-8 h-8 p-0 border-0 cursor-pointer"
                  title="Custom color"
                />
              </div>
            </div>

            {/* Ship Assignment */}
            <div>
              <label className="font-mono text-xs text-[var(--text-dimmer)] mb-1 block">ASSIGNED SHIP (OPTIONAL)</label>
              <Select value={shipId} onValueChange={setShipId}>
                <SelectTrigger className="font-mono">
                  <SelectValue placeholder="No ship assigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No ship assigned</SelectItem>
                  {vehicles.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} ({v.class_type || v.vehicle_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <label className="font-mono text-xs text-[var(--text-dimmer)] mb-1 block">DESCRIPTION (OPTIONAL)</label>
              <Input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Notes about this crew..."
                className="font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              {editingGroup ? 'Save Changes' : 'Create Crew'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
