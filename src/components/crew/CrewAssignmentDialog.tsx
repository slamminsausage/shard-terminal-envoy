import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useCampaign } from "@/contexts/CampaignContext";
import { CREW_POSITION_PRESETS, type Vehicle } from "@/types/database";
import { useToast } from "@/hooks/use-toast";

interface CrewAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle;
  onAssignmentComplete: (vehicleId: string, assignedCrew: string[]) => void;
}

interface CrewMemberState {
  selected: boolean;
  position: string;
  customPosition: string;
}

export default function CrewAssignmentDialog({
  open,
  onOpenChange,
  vehicle,
  onAssignmentComplete
}: CrewAssignmentDialogProps) {
  const { characters, crewGroups, saveVehicle, assignCharacterToCrew } = useCampaign();
  const { toast } = useToast();

  // Find crew group linked to this vehicle
  const linkedCrew = crewGroups.find(g => g.ship_id === vehicle.id);

  // Build initial state: characters currently in the crew linked to this ship
  const [memberStates, setMemberStates] = useState<Record<string, CrewMemberState>>({});

  useEffect(() => {
    const initial: Record<string, CrewMemberState> = {};
    characters.forEach(c => {
      const isAssigned = linkedCrew ? c.crew_id === linkedCrew.id :
        Object.keys(vehicle.crew_requirements || {}).includes(c.id);
      initial[c.id] = {
        selected: isAssigned,
        position: c.crew_position && CREW_POSITION_PRESETS.includes(c.crew_position as any)
          ? c.crew_position
          : c.crew_position ? 'custom' : '',
        customPosition: c.crew_position && !CREW_POSITION_PRESETS.includes(c.crew_position as any)
          ? c.crew_position : '',
      };
    });
    setMemberStates(initial);
  }, [open, characters, linkedCrew, vehicle]);

  const handleToggle = (charId: string) => {
    setMemberStates(prev => ({
      ...prev,
      [charId]: { ...prev[charId], selected: !prev[charId]?.selected },
    }));
  };

  const handlePositionChange = (charId: string, value: string) => {
    setMemberStates(prev => ({
      ...prev,
      [charId]: { ...prev[charId], position: value, customPosition: value === 'custom' ? prev[charId]?.customPosition || '' : '' },
    }));
  };

  const handleCustomPositionChange = (charId: string, value: string) => {
    setMemberStates(prev => ({
      ...prev,
      [charId]: { ...prev[charId], customPosition: value },
    }));
  };

  const getResolvedPosition = (state: CrewMemberState): string => {
    if (state.position === 'custom') return state.customPosition;
    return state.position;
  };

  // Validate: no selected character has position='custom' with empty customPosition
  const hasInvalidCustomPosition = Object.entries(memberStates).some(
    ([, state]) => state.selected && state.position === 'custom' && !state.customPosition.trim()
  );

  const handleSaveAssignment = async () => {
    try {
      const selectedIds: string[] = [];
      const crewRequirements: Record<string, string> = {};

      for (const [charId, state] of Object.entries(memberStates)) {
        const character = characters.find(c => c.id === charId);
        if (!character) continue;

        const position = getResolvedPosition(state);

        if (state.selected) {
          selectedIds.push(charId);
          crewRequirements[charId] = character.name;

          // Update character crew_id and crew_position
          if (linkedCrew) {
            await assignCharacterToCrew(charId, linkedCrew.id, position || undefined);
          }
        } else if (linkedCrew && character.crew_id === linkedCrew.id) {
          // Character was unselected — remove from this crew
          await assignCharacterToCrew(charId, null, undefined);
        }
      }

      // Also keep vehicle.crew_requirements in sync for backward compat
      await saveVehicle({
        ...vehicle,
        crew_requirements: crewRequirements,
      });

      onAssignmentComplete(vehicle.id, selectedIds);
      onOpenChange(false);

      toast({
        title: "Crew Assigned",
        description: `Assigned ${selectedIds.length} crew to ${vehicle.name}.`,
      });
    } catch (error) {
      console.error('Failed to save crew assignment:', error);
      toast({
        title: "Assignment Error",
        description: "Failed to save crew assignment.",
        variant: "destructive",
      });
    }
  };

  const selectedCount = Object.values(memberStates).filter(s => s.selected).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono">CREW ASSIGNMENT - {vehicle.name.toUpperCase()}</DialogTitle>
          <DialogDescription>
            Assign characters to this {vehicle.vehicle_type?.toLowerCase() || 'vehicle'} and set their position.
            {linkedCrew && (
              <span style={{ color: linkedCrew.color }}> Linked to {linkedCrew.name}.</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="p-3 border border-primary/20 rounded bg-card/30 font-mono text-xs">
            <span className="text-[var(--text-dimmer)]">ASSIGNED:</span>{' '}
            <span className="text-[var(--primary)]">{selectedCount}</span> crew members
          </div>

          {/* Character list */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {characters.length > 0 ? characters.map(character => {
              const state = memberStates[character.id] || { selected: false, position: '', customPosition: '' };
              const charType = character.character_type || 'pc';
              const typeColor = charType === 'pc' ? '#3ae2b3' : '#00ccff';

              return (
                <Card key={character.id} className={`bg-card/30 transition-all ${state.selected ? 'border-[var(--primary)]/50' : ''}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`crew-${character.id}`}
                        checked={state.selected}
                        onCheckedChange={() => handleToggle(character.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-[0.6rem] font-bold px-1 py-0.5 rounded border uppercase tracking-wider"
                            style={{ color: typeColor, borderColor: typeColor + '80' }}
                          >
                            {charType.toUpperCase()}
                          </span>
                          <span className="font-mono text-sm font-semibold">{character.name}</span>
                          <span className="font-mono text-xs opacity-50">
                            {character.career || 'No Career'}
                          </span>
                        </div>

                        {/* Position selector — only shown when selected */}
                        {state.selected && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-mono text-xs text-[var(--text-dimmer)] flex-shrink-0">Position:</span>
                            <Select
                              value={state.position || 'unset'}
                              onValueChange={v => handlePositionChange(character.id, v === 'unset' ? '' : v)}
                            >
                              <SelectTrigger className="h-7 text-xs font-mono flex-1">
                                <SelectValue placeholder="Select position..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unset">-- None --</SelectItem>
                                {CREW_POSITION_PRESETS.map(pos => (
                                  <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                                ))}
                                <SelectItem value="custom">Custom...</SelectItem>
                              </SelectContent>
                            </Select>
                            {state.position === 'custom' && (
                              <Input
                                value={state.customPosition}
                                onChange={e => handleCustomPositionChange(character.id, e.target.value)}
                                placeholder="Custom position"
                                className="h-7 text-xs font-mono w-36"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }) : (
              <div className="p-4 border border-primary/20 rounded border-dashed opacity-50">
                <div className="font-mono text-sm text-center">
                  No characters available.
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          {hasInvalidCustomPosition && (
            <p className="text-xs font-mono text-red-400 flex-1 mr-2">Enter a custom position name for all selected crew.</p>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSaveAssignment} disabled={hasInvalidCustomPosition}>Save Assignment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
