import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { typeTextWithSound } from '@/lib/typing';
import CharacterSheet from "@/components/crew/CharacterSheet";
import { useCampaign } from "@/contexts/CampaignContext";

export default function CrewInterface() {
  const [displayText, setDisplayText] = useState("");
  const [activeCrewMember, setActiveCrewMember] = useState<string | null>(null);
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);
  const { createNewCharacter, characters, vehicles, deleteCharacter } = useCampaign();
  const [characterToDelete, setCharacterToDelete] = useState<string | null>(null);

  useEffect(() => {
    const initMessage = "CREW MANAGEMENT SYSTEM ONLINE\nAccess crew records and character sheets...\n\n";
    const cancelTyping = typeTextWithSound(initMessage, setDisplayText, undefined, { delay: 40 });
    
    return () => {
      if (typeof cancelTyping === 'function') {
        cancelTyping();
      }
    };
  }, []);

  const handleCharacterSheetAccess = () => {
    setShowCharacterSheet(true);
  };

  const handleBackToCrewInterface = () => {
    setShowCharacterSheet(false);
    setActiveCrewMember(null);
  };

  const handleAddNewCrewMember = async () => {
    const newCharacter = await createNewCharacter();
    if (newCharacter) {
      setShowCharacterSheet(true);
    }
  };

  const handleDeleteCharacter = async (characterId: string) => {
    const success = await deleteCharacter(characterId);
    if (success) {
      setCharacterToDelete(null);
    }
  };

  if (showCharacterSheet) {
    return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-xl font-['Orbitron'] tracking-[0.15em] sm:tracking-[0.2em] text-primary drop-shadow-[0_0_10px_rgba(0,255,0,0.4)]">CHARACTER SHEET INTERFACE</h2>
          <button className="terminal-btn text-xs sm:text-sm w-full sm:w-auto" onClick={handleBackToCrewInterface}>
            Back to Crew Management
          </button>
        </div>
        <CharacterSheet characterId={activeCrewMember || undefined} />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-base sm:text-xl font-['Orbitron'] tracking-[0.15em] sm:tracking-[0.2em] text-primary drop-shadow-[0_0_10px_rgba(0,255,0,0.4)]">CREW MANAGEMENT SYSTEM</h2>
      </div>

      <div className="panel">
        <div className="panel-content">
          <div className="terminal terminal-flicker h-[200px] overflow-auto mb-4 border border-primary/30 rounded">
            <div className="font-mono text-xs sm:text-sm whitespace-pre-wrap p-3 sm:p-4 text-primary">
              {displayText}
            </div>
          </div>

          <div className="space-y-4 mt-4">
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">ACTIVE CREW MEMBERS</span>
                </div>
                <div className="panel-content">
                  <div className="space-y-2">
                    {characters.length > 0 ? (
                      characters.map((character, index) => {
                        const assignedVehicle = vehicles.find(vehicle => 
                          vehicle.crew_requirements && 
                          Object.keys(vehicle.crew_requirements).includes(character.id)
                        );
                        const assignmentStatus = assignedVehicle ? `Assigned to ${assignedVehicle.name}` : 'Unassigned';
                        
                        return (
                        <div key={character.id} className="p-2 sm:p-3 border border-primary/20 rounded font-mono text-xs sm:text-sm flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-background/40">
                          <span className="text-primary break-words">
                            SLOT {String(index + 1).padStart(2, '0')}: {character.name} - <span className="text-secondary">{assignmentStatus}</span>
                          </span>
                           <div className="flex gap-2 flex-wrap">
                             <Button
                               variant="outline"
                               size="sm"
                               className="text-xs"
                               onClick={() => {
                                 setActiveCrewMember(character.id);
                                 setShowCharacterSheet(true);
                               }}
                             >
                               Edit
                             </Button>
                             <Button
                               onClick={() => {
                                 const url = `/character-view/${character.id}`;
                                 window.open(url, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                               }}
                               variant="secondary"
                               size="sm"
                               className="text-xs"
                             >
                               View
                             </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-xs text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Character</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to permanently delete "{character.name}"? This action cannot be undone. 
                                    The character will be removed from any ship crew assignments.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteCharacter(character.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Permanently
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                             </AlertDialog>
                           </div>
                        </div>
                        );
                      })
                    ) : (
                      <>
                        <div className="p-3 border border-primary/20 rounded font-mono text-sm text-primary bg-background/30">
                          SLOT 01: [VACANT] - Assign crew member
                        </div>
                        <div className="p-3 border border-primary/20 rounded font-mono text-sm text-primary bg-background/30">
                          SLOT 02: [VACANT] - Assign crew member
                        </div>
                        <div className="p-3 border border-primary/20 rounded font-mono text-sm text-primary bg-background/30">
                          SLOT 03: [VACANT] - Assign crew member
                        </div>
                        <div className="p-3 border border-primary/20 rounded font-mono text-sm text-primary bg-background/30">
                          SLOT 04: [VACANT] - Assign crew member
                        </div>
                      </>
                    )}
                  </div>
                  <button className="terminal-btn w-full mt-4" onClick={handleAddNewCrewMember}>
                    Add New Crew Member
                  </button>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
