import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useCampaign } from "@/contexts/CampaignContext";
import { Character, Vehicle } from "@/types/database";
import { useToast } from "@/hooks/use-toast";

interface CrewAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle;
  onAssignmentComplete: (vehicleId: string, assignedCrew: string[]) => void;
}

export default function CrewAssignmentDialog({ 
  open, 
  onOpenChange, 
  vehicle, 
  onAssignmentComplete 
}: CrewAssignmentDialogProps) {
  const { characters, saveVehicle } = useCampaign();
  const { toast } = useToast();
  const [selectedCrewIds, setSelectedCrewIds] = useState<string[]>(
    Object.keys(vehicle.crew_requirements || {})
  );

  const handleCrewToggle = (characterId: string, characterName: string) => {
    setSelectedCrewIds(prev => 
      prev.includes(characterId) 
        ? prev.filter(id => id !== characterId)
        : [...prev, characterId]
    );
  };

  const handleSaveAssignment = async () => {
    try {
      // Create crew requirements object with character names
      const crewRequirements: { [key: string]: string } = {};
      selectedCrewIds.forEach(id => {
        const character = characters.find(c => c.id === id);
        if (character) {
          crewRequirements[id] = character.name;
        }
      });

      // Update vehicle with new crew assignments
      const updatedVehicle = {
        ...vehicle,
        crew_requirements: crewRequirements
      };

      await saveVehicle(updatedVehicle);
      onAssignmentComplete(vehicle.id, selectedCrewIds);
      onOpenChange(false);

      toast({
        title: "Crew Assigned",
        description: `Successfully assigned ${selectedCrewIds.length} crew members to ${vehicle.name}.`,
      });
    } catch (error) {
      console.error('Failed to save crew assignment:', error);
      toast({
        title: "Assignment Error",
        description: "Failed to save crew assignment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono">CREW ASSIGNMENT - {vehicle.name.toUpperCase()}</DialogTitle>
          <DialogDescription>
            Select characters to assign as crew members for this {vehicle.vehicle_type?.toLowerCase() || 'vehicle'}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Assignment Status */}
          <div className="p-4 border border-primary/20 rounded bg-card/30">
            <div className="font-mono text-sm font-semibold mb-2">CURRENT CREW ASSIGNMENT</div>
            <div className="flex flex-wrap gap-2">
              {selectedCrewIds.length > 0 ? (
                selectedCrewIds.map(id => {
                  const character = characters.find(c => c.id === id);
                  return character ? (
                    <Badge key={id} variant="outline" className="font-mono text-xs">
                      {character.name}
                    </Badge>
                  ) : null;
                })
              ) : (
                <span className="font-mono text-xs opacity-50">No crew assigned</span>
              )}
            </div>
          </div>

          {/* Available Characters */}
          <div className="space-y-2">
            <div className="font-mono text-sm font-semibold">AVAILABLE CHARACTERS</div>
            {characters.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {characters.map((character) => (
                  <Card key={character.id} className="bg-card/30">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`crew-${character.id}`}
                          checked={selectedCrewIds.includes(character.id)}
                          onCheckedChange={() => handleCrewToggle(character.id, character.name)}
                        />
                        <div className="flex-1">
                          <div className="font-mono text-sm font-semibold">{character.name}</div>
                          <div className="font-mono text-xs opacity-70">
                            {character.career && character.rank 
                              ? `${character.career} ${character.rank}` 
                              : character.career || 'No Career Listed'}
                          </div>
                          <div className="font-mono text-xs opacity-50">
                            Skills: {Object.keys(character.skills || {}).length} | 
                            Age: {character.age || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-4 border border-primary/20 rounded border-dashed opacity-50">
                <div className="font-mono text-sm text-center">
                  No characters available. Create characters in the Crew interface first.
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveAssignment}>
            Save Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}