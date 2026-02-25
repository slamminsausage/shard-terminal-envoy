import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCampaign } from '@/contexts/CampaignContext';
import { CREW_COLOR_PRESETS, type CrewGroup } from '@/types/database';
import { Plus, Pencil, Trash2, Ship, Users } from 'lucide-react';

interface CrewGroupManagerProps {
  onClose?: () => void;
}

export function CrewGroupManager({ onClose }: CrewGroupManagerProps) {
  const { crewGroups, vehicles, characters, saveCrewGroup, deleteCrewGroup, isGM } = useCampaign();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CrewGroup | null>(null);

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

  const handleDelete = async (groupId: string) => {
    await deleteCrewGroup(groupId);
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
          {crewGroups.map(group => {
            const memberCount = getMemberCount(group.id);
            const shipName = getShipName(group.ship_id);
            return (
              <div
                key={group.id}
                className="p-3 border border-primary/20 rounded font-mono text-sm bg-background/40 flex items-center gap-3"
                style={{ borderLeftWidth: '4px', borderLeftColor: group.color }}
              >
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
                      onClick={() => handleDelete(group.id)}
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
