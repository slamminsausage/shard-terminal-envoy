import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { typeTextWithSound } from '@/lib/typing';
import CharacterSheet from "@/components/crew/CharacterSheet";
import { CharacterGenerator } from "@/components/character-gen/CharacterGenerator";
import { TradeInterface } from "@/components/trade/TradeInterface";
import { FinanceInterface } from "@/components/finance/FinanceInterface";
import { useCampaign } from "@/contexts/CampaignContext";
import { Users, UserPlus, Package, DollarSign } from 'lucide-react';

export default function CrewInterface() {
  const [displayText, setDisplayText] = useState("");
  const [activeCrewMember, setActiveCrewMember] = useState<string | null>(null);
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);
  const [activeTab, setActiveTab] = useState("crew");
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
      <div className="interface-container">
        <header className="interface-header">
          <h2 className="interface-title">CHARACTER SHEET INTERFACE</h2>
          <button className="terminal-btn text-xs sm:text-sm" onClick={handleBackToCrewInterface}>
            Back to Crew Management
          </button>
        </header>
        <div className="interface-content">
          <CharacterSheet characterId={activeCrewMember || undefined} />
        </div>
      </div>
    );
  }

  return (
    <div className="interface-container">
      <header className="interface-header">
        <div>
          <h2 className="interface-title">CREW & OPERATIONS</h2>
          <p className="interface-subtitle">Manage crew, character generation, trade, and finance</p>
        </div>
      </header>

      <div className="interface-content">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="terminal-tabs-list grid-cols-4 mb-4">
          <TabsTrigger value="crew" className="terminal-tab-trigger">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Crew</span>
          </TabsTrigger>
          <TabsTrigger value="chargen" className="terminal-tab-trigger">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Char Gen</span>
          </TabsTrigger>
          <TabsTrigger value="trade" className="terminal-tab-trigger">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Trade</span>
          </TabsTrigger>
          <TabsTrigger value="finance" className="terminal-tab-trigger">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Finance</span>
          </TabsTrigger>
        </TabsList>

        {/* Crew Management Tab */}
        <TabsContent value="crew">
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
      </TabsContent>

      {/* Character Generator Tab */}
      <TabsContent value="chargen">
        <CharacterGenerator />
      </TabsContent>

      {/* Trade System Tab */}
      <TabsContent value="trade">
        <TradeInterface />
      </TabsContent>

      {/* Finance Tab */}
      <TabsContent value="finance">
        <FinanceInterface />
      </TabsContent>
    </Tabs>
      </div>
    </div>
  );
}
