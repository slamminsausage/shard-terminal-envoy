import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { typeTextWithSound } from '@/lib/typing';
import CharacterSheet from "@/components/crew/CharacterSheet";
import { CharacterGenerator } from "@/components/character-gen/CharacterGenerator";
import { NPCGenerator } from "@/components/crew/NPCGenerator";
import { TradeInterface } from "@/components/trade/TradeInterface";
import { FinanceInterface } from "@/components/finance/FinanceInterface";
import { useCampaign } from "@/contexts/CampaignContext";
import { Users, UserPlus, Package, DollarSign, Bot } from 'lucide-react';
import type { Character } from "@/types/database";

type RosterFilter = 'all' | 'pc' | 'npc';

/** Color config for character type/role badges */
function getCharacterBadge(character: Character): { label: string; color: string; borderColor: string; bgColor: string } {
  const charType = character.character_type || 'pc';
  if (charType === 'pc') {
    return { label: 'PC', color: '#00ff00', borderColor: 'rgba(0,255,0,0.5)', bgColor: 'rgba(0,255,0,0.1)' };
  }
  // NPC roles
  const role = character.npc_role || 'crew';
  switch (role) {
    case 'crew':
      return { label: 'NPC CREW', color: '#00ccff', borderColor: 'rgba(0,204,255,0.5)', bgColor: 'rgba(0,204,255,0.1)' };
    case 'enemy':
      return { label: 'NPC ENEMY', color: '#ff3344', borderColor: 'rgba(255,51,68,0.5)', bgColor: 'rgba(255,51,68,0.1)' };
    case 'contact':
      return { label: 'NPC CONTACT', color: '#ffaa00', borderColor: 'rgba(255,170,0,0.5)', bgColor: 'rgba(255,170,0,0.1)' };
    case 'patron':
      return { label: 'NPC PATRON', color: '#bb77ff', borderColor: 'rgba(187,119,255,0.5)', bgColor: 'rgba(187,119,255,0.1)' };
    default:
      return { label: 'NPC', color: '#00ccff', borderColor: 'rgba(0,204,255,0.5)', bgColor: 'rgba(0,204,255,0.1)' };
  }
}

/** Get the left border accent color for a character row */
function getRowBorderColor(character: Character): string {
  const charType = character.character_type || 'pc';
  if (charType === 'pc') return 'rgba(0,255,0,0.4)';
  const role = character.npc_role || 'crew';
  switch (role) {
    case 'crew': return 'rgba(0,204,255,0.4)';
    case 'enemy': return 'rgba(255,51,68,0.4)';
    case 'contact': return 'rgba(255,170,0,0.4)';
    case 'patron': return 'rgba(187,119,255,0.4)';
    default: return 'rgba(0,204,255,0.4)';
  }
}

export default function CrewInterface() {
  const [displayText, setDisplayText] = useState("");
  const [activeCrewMember, setActiveCrewMember] = useState<string | null>(null);
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);
  const [activeTab, setActiveTab] = useState("crew");
  const [rosterFilter, setRosterFilter] = useState<RosterFilter>('all');
  const { createNewCharacter, characters, vehicles, deleteCharacter, claimCharacter, currentPlayer, isGM } = useCampaign();
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

  useEffect(() => {
    if (!isGM && activeTab === "npcgen") {
      setActiveTab("crew");
    }
  }, [activeTab, isGM]);

  const filteredCharacters = useMemo(() => {
    if (rosterFilter === 'all') return characters;
    return characters.filter(c => {
      const type = c.character_type || 'pc';
      return type === rosterFilter;
    });
  }, [characters, rosterFilter]);

  // Counts for filter badges
  const pcCount = useMemo(() => characters.filter(c => (c.character_type || 'pc') === 'pc').length, [characters]);
  const npcCount = useMemo(() => characters.filter(c => c.character_type === 'npc').length, [characters]);

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
        <TabsList className={`terminal-tabs-list ${isGM ? 'grid-cols-5' : 'grid-cols-4'} mb-4`}>
          <TabsTrigger value="crew" className="terminal-tab-trigger">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Crew</span>
          </TabsTrigger>
          {isGM && (
            <TabsTrigger value="npcgen" className="terminal-tab-trigger">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">NPC Gen</span>
            </TabsTrigger>
          )}
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
                  <span className="panel-title">CREW ROSTER</span>
                  <span className="panel-status">{filteredCharacters.length} / {characters.length} RECORDS</span>
                </div>
                <div className="panel-content">
                  {/* Filter Controls */}
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <button
                      onClick={() => setRosterFilter('all')}
                      className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                        rosterFilter === 'all'
                          ? 'border-[var(--primary)] text-[var(--primary)] bg-[rgba(0,255,0,0.15)]'
                          : 'border-[var(--bg-border)] text-[var(--text-dimmer)] hover:border-[var(--primary-dim)] hover:text-[var(--primary)]'
                      }`}
                    >
                      ALL ({characters.length})
                    </button>
                    <button
                      onClick={() => setRosterFilter('pc')}
                      className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                        rosterFilter === 'pc'
                          ? 'border-[var(--primary)] text-[var(--primary)] bg-[rgba(0,255,0,0.15)]'
                          : 'border-[var(--bg-border)] text-[var(--text-dimmer)] hover:border-[var(--primary-dim)] hover:text-[var(--primary)]'
                      }`}
                    >
                      PCs ({pcCount})
                    </button>
                    <button
                      onClick={() => setRosterFilter('npc')}
                      className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                        rosterFilter === 'npc'
                          ? 'border-[#00ccff] text-[#00ccff] bg-[rgba(0,204,255,0.15)]'
                          : 'border-[var(--bg-border)] text-[var(--text-dimmer)] hover:border-[rgba(0,204,255,0.4)] hover:text-[#00ccff]'
                      }`}
                    >
                      NPCs ({npcCount})
                    </button>
                  </div>

                  <div className="space-y-2">
                    {filteredCharacters.length > 0 ? (
                      filteredCharacters.map((character, index) => {
                        const isOwner = currentPlayer?.id === character.player_id;
                        const isUnassignedPC = (character.character_type || 'pc') === 'pc' && character.player_id === 'campaign';
                        const canEdit = isGM || isOwner;
                        const canClaim = !isGM && isUnassignedPC;
                        const canDelete = isGM || isOwner;
                        const assignedVehicle = vehicles.find(vehicle =>
                          vehicle.crew_requirements &&
                          Object.keys(vehicle.crew_requirements).includes(character.id)
                        );
                        const assignmentStatus = assignedVehicle ? `Assigned to ${assignedVehicle.name}` : 'Unassigned';
                        const badge = getCharacterBadge(character);
                        const rowBorder = getRowBorderColor(character);

                        return (
                        <div
                          key={character.id}
                          className="p-2 sm:p-3 border border-primary/20 rounded font-mono text-xs sm:text-sm flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-background/40"
                          style={{ borderLeftWidth: '3px', borderLeftColor: rowBorder }}
                        >
                          <span className="text-primary break-words flex items-center gap-2 flex-wrap">
                            <span
                              className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider"
                              style={{
                                color: badge.color,
                                borderColor: badge.borderColor,
                                backgroundColor: badge.bgColor,
                              }}
                            >
                              {badge.label}
                            </span>
                            <span style={{ color: badge.color }}>
                              {character.name}
                            </span>
                            {character.career && (
                              <span className="text-[var(--text-dimmer)]">
                                [{character.career}{character.rank ? ` - ${character.rank}` : ''}]
                              </span>
                            )}
                            <span className="text-secondary text-[0.65rem]">{assignmentStatus}</span>
                          </span>
                           <div className="flex gap-2 flex-wrap">
                             <Button
                               variant="outline"
                               size="sm"
                               className="text-xs"
                               disabled={!canEdit}
                               onClick={() => {
                                 setActiveCrewMember(character.id);
                                 setShowCharacterSheet(true);
                               }}
                             >
                               Edit
                             </Button>
                             {canClaim && (
                               <Button
                                 variant="outline"
                                 size="sm"
                                 className="text-xs border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black"
                                 onClick={() => void claimCharacter(character.id)}
                               >
                                 Claim
                               </Button>
                             )}
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
                            {canDelete && (
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
                            )}
                           </div>
                        </div>
                        );
                      })
                    ) : (
                      rosterFilter !== 'all' ? (
                        <div className="p-3 border border-primary/20 rounded font-mono text-sm text-[var(--text-dimmer)] bg-background/30 text-center">
                          No {rosterFilter === 'pc' ? 'player characters' : 'NPCs'} found. {rosterFilter === 'npc' && isGM ? 'Use the NPC Gen tab to create some.' : ''}
                        </div>
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
                      )
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

      {/* NPC Generator Tab */}
      {isGM && (
        <TabsContent value="npcgen">
          <NPCGenerator onNPCSaved={() => setActiveTab('crew')} />
        </TabsContent>
      )}

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
