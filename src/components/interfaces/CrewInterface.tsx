import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { typeTextWithSound } from '@/lib/typing';
import CharacterSheet from "@/components/crew/CharacterSheet";
import { CharacterGenerator } from "@/components/character-gen/CharacterGenerator";
import { NPCGenerator } from "@/components/crew/NPCGenerator";
import { TradeInterface } from "@/components/trade/TradeInterface";
import { FinanceInterface } from "@/components/finance/FinanceInterface";
import { CrewGroupManager } from "@/components/crew/CrewGroupManager";
import { useCampaign } from "@/contexts/CampaignContext";
import { Users, UserPlus, Package, DollarSign, Bot, Ship, Briefcase } from 'lucide-react';
import { CREW_POSITION_PRESETS } from "@/types/database";
import type { Character, CrewGroup } from "@/types/database";

type RosterFilter = 'all' | 'pc' | 'npc';
type CrewFilter = 'all' | 'unassigned' | string; // 'all', 'unassigned', or a crew group ID
type GroupMode = 'flat' | 'grouped';

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

/** Inline crew assignment widget for character rows */
function CrewAssignmentInline({
  character,
  crewGroups,
  isGM,
  isOwner,
  onAssign,
}: {
  character: Character;
  crewGroups: CrewGroup[];
  isGM: boolean;
  isOwner: boolean;
  onAssign: (charId: string, crewId: string | null, position?: string) => void;
}) {
  const canAssign = isGM || isOwner;
  const [editingPosition, setEditingPosition] = useState(false);
  const currentCrew = crewGroups.find(g => g.id === character.crew_id);

  if (!canAssign) {
    // Read-only display
    return (
      <span className="flex items-center gap-1.5 flex-wrap">
        {currentCrew ? (
          <>
            <span
              className="w-2 h-2 rounded-full inline-block flex-shrink-0"
              style={{ backgroundColor: currentCrew.color, boxShadow: `0 0 4px ${currentCrew.color}` }}
            />
            <span className="text-[0.65rem]" style={{ color: currentCrew.color }}>{currentCrew.name}</span>
          </>
        ) : (
          <span className="text-[0.65rem] text-[var(--text-dimmer)]">No Crew</span>
        )}
        {character.crew_position && (
          <span className="text-[0.6rem] px-1 py-0.5 rounded border border-[var(--bg-border)] text-[var(--text-dimmer)]">
            {character.crew_position}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 flex-wrap">
      {/* Crew selector */}
      <Select
        value={character.crew_id || 'none'}
        onValueChange={v => onAssign(character.id, v === 'none' ? null : v, character.crew_position)}
      >
        <SelectTrigger className="h-6 text-[0.65rem] font-mono w-auto min-w-[100px] max-w-[160px] px-2 py-0 border-[var(--bg-border)]">
          <SelectValue placeholder="No Crew" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No Crew</SelectItem>
          {crewGroups.map(g => (
            <SelectItem key={g.id} value={g.id}>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: g.color }} />
                {g.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Position selector — only if assigned to a crew */}
      {character.crew_id && (
        <Select
          value={character.crew_position || 'none'}
          onValueChange={v => onAssign(character.id, character.crew_id || null, v === 'none' ? undefined : v)}
        >
          <SelectTrigger className="h-6 text-[0.65rem] font-mono w-auto min-w-[90px] max-w-[130px] px-2 py-0 border-[var(--bg-border)]">
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-- Position --</SelectItem>
            {CREW_POSITION_PRESETS.map(pos => (
              <SelectItem key={pos} value={pos}>{pos}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </span>
  );
}

export default function CrewInterface() {
  const [displayText, setDisplayText] = useState("");
  const [activeCrewMember, setActiveCrewMember] = useState<string | null>(null);
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);
  const [activeTab, setActiveTab] = useState("crew");
  const [rosterFilter, setRosterFilter] = useState<RosterFilter>('all');
  const [crewFilter, setCrewFilter] = useState<CrewFilter>('all');
  const [groupMode, setGroupMode] = useState<GroupMode>('flat');
  const {
    createNewCharacter, characters, vehicles, crewGroups,
    deleteCharacter, claimCharacter, assignCharacterToCrew,
    currentPlayer, isGM,
  } = useCampaign();

  useEffect(() => {
    const initMessage = "CREW MANAGEMENT SYSTEM ONLINE\nAccess crew records and character sheets...\n\n";
    const cancelTyping = typeTextWithSound(initMessage, setDisplayText, undefined, { delay: 40 });
    return () => { if (typeof cancelTyping === 'function') cancelTyping(); };
  }, []);

  useEffect(() => {
    if (!isGM && activeTab === "npcgen") setActiveTab("crew");
  }, [activeTab, isGM]);

  // Apply filters
  const filteredCharacters = useMemo(() => {
    let result = characters;

    // Type filter
    if (rosterFilter !== 'all') {
      result = result.filter(c => (c.character_type || 'pc') === rosterFilter);
    }

    // Crew filter
    if (crewFilter === 'unassigned') {
      result = result.filter(c => !c.crew_id);
    } else if (crewFilter !== 'all') {
      result = result.filter(c => c.crew_id === crewFilter);
    }

    return result;
  }, [characters, rosterFilter, crewFilter]);

  // Counts
  const pcCount = useMemo(() => characters.filter(c => (c.character_type || 'pc') === 'pc').length, [characters]);
  const npcCount = useMemo(() => characters.filter(c => c.character_type === 'npc').length, [characters]);
  const unassignedCount = useMemo(() => characters.filter(c => !c.crew_id).length, [characters]);

  // Group by crew
  const groupedCharacters = useMemo(() => {
    if (groupMode !== 'grouped') return null;

    const groups: { crew: CrewGroup | null; members: Character[] }[] = [];

    // Each crew group
    for (const group of crewGroups) {
      const members = filteredCharacters.filter(c => c.crew_id === group.id);
      if (members.length > 0 || crewFilter === 'all') {
        groups.push({ crew: group, members });
      }
    }

    // Unassigned
    const unassigned = filteredCharacters.filter(c => !c.crew_id);
    if (unassigned.length > 0) {
      groups.push({ crew: null, members: unassigned });
    }

    return groups;
  }, [groupMode, crewGroups, filteredCharacters, crewFilter]);

  const handleBackToCrewInterface = () => {
    setShowCharacterSheet(false);
    setActiveCrewMember(null);
  };

  const handleAddNewCrewMember = async () => {
    const newCharacter = await createNewCharacter();
    if (newCharacter) setShowCharacterSheet(true);
  };

  const handleDeleteCharacter = async (characterId: string) => {
    await deleteCharacter(characterId);
  };

  const handleAssign = async (charId: string, crewId: string | null, position?: string) => {
    await assignCharacterToCrew(charId, crewId, position);
  };

  /** Render a single character row */
  const renderCharacterRow = (character: Character) => {
    const isOwner = currentPlayer?.id === character.player_id;
    const isUnassignedPC = (character.character_type || 'pc') === 'pc' && character.player_id === 'campaign';
    const canEdit = isGM || isOwner;
    const canClaim = !isGM && isUnassignedPC;
    const canDelete = isGM || isOwner;
    const badge = getCharacterBadge(character);
    const crewGroup = crewGroups.find(g => g.id === character.crew_id);
    const rowBorder = crewGroup ? crewGroup.color : (character.character_type === 'npc' ? 'rgba(0,204,255,0.4)' : 'rgba(0,255,0,0.4)');

    return (
      <div
        key={character.id}
        className="p-2 sm:p-3 border border-primary/20 rounded font-mono text-xs sm:text-sm flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-background/40"
        style={{ borderLeftWidth: '3px', borderLeftColor: rowBorder }}
      >
        <div className="text-primary break-words flex flex-col gap-1 flex-1 min-w-0">
          <span className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider"
              style={{ color: badge.color, borderColor: badge.borderColor, backgroundColor: badge.bgColor }}
            >
              {badge.label}
            </span>
            <span style={{ color: badge.color }}>{character.name}</span>
            {character.career && (
              <span className="text-[var(--text-dimmer)]">
                [{character.career}{character.rank ? ` - ${character.rank}` : ''}]
              </span>
            )}
          </span>
          {/* Crew assignment inline */}
          <CrewAssignmentInline
            character={character}
            crewGroups={crewGroups}
            isGM={isGM}
            isOwner={isOwner}
            onAssign={handleAssign}
          />
        </div>
        <div className="flex gap-2 flex-wrap flex-shrink-0">
          <Button variant="outline" size="sm" className="text-xs" disabled={!canEdit}
            onClick={() => { setActiveCrewMember(character.id); setShowCharacterSheet(true); }}>
            Edit
          </Button>
          {canClaim && (
            <Button variant="outline" size="sm"
              className="text-xs border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black"
              onClick={() => void claimCharacter(character.id)}>
              Claim
            </Button>
          )}
          <Button onClick={() => window.open(`/character-view/${character.id}`, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')}
            variant="secondary" size="sm" className="text-xs">
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
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteCharacter(character.id)} className="bg-red-600 hover:bg-red-700">
                    Delete Permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    );
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

              {/* Crew Group Manager */}
              <div className="mb-4">
                <CrewGroupManager />
              </div>

          <div className="space-y-4 mt-4">
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">CREW ROSTER</span>
                  <span className="panel-status">{filteredCharacters.length} / {characters.length} RECORDS</span>
                </div>
                <div className="panel-content">
                  {/* Filter Controls */}
                  <div className="flex gap-2 mb-3 flex-wrap items-center">
                    {/* Type filters */}
                    <button onClick={() => setRosterFilter('all')}
                      className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                        rosterFilter === 'all'
                          ? 'border-[var(--primary)] text-[var(--primary)] bg-[rgba(0,255,0,0.15)]'
                          : 'border-[var(--bg-border)] text-[var(--text-dimmer)] hover:border-[var(--primary-dim)] hover:text-[var(--primary)]'
                      }`}>
                      ALL ({characters.length})
                    </button>
                    <button onClick={() => setRosterFilter('pc')}
                      className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                        rosterFilter === 'pc'
                          ? 'border-[var(--primary)] text-[var(--primary)] bg-[rgba(0,255,0,0.15)]'
                          : 'border-[var(--bg-border)] text-[var(--text-dimmer)] hover:border-[var(--primary-dim)] hover:text-[var(--primary)]'
                      }`}>
                      PCs ({pcCount})
                    </button>
                    <button onClick={() => setRosterFilter('npc')}
                      className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                        rosterFilter === 'npc'
                          ? 'border-[#00ccff] text-[#00ccff] bg-[rgba(0,204,255,0.15)]'
                          : 'border-[var(--bg-border)] text-[var(--text-dimmer)] hover:border-[rgba(0,204,255,0.4)] hover:text-[#00ccff]'
                      }`}>
                      NPCs ({npcCount})
                    </button>

                    {/* Separator */}
                    <div className="w-px h-5 bg-[var(--bg-border)] mx-1" />

                    {/* Crew filter */}
                    <Select value={crewFilter} onValueChange={v => setCrewFilter(v)}>
                      <SelectTrigger className="h-7 text-xs font-mono w-auto min-w-[120px] px-2 border-[var(--bg-border)]">
                        <SelectValue placeholder="All Crews" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Crews</SelectItem>
                        <SelectItem value="unassigned">Unassigned ({unassignedCount})</SelectItem>
                        {crewGroups.map(g => (
                          <SelectItem key={g.id} value={g.id}>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: g.color }} />
                              {g.name} ({characters.filter(c => c.crew_id === g.id).length})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Group toggle */}
                    {crewGroups.length > 0 && (
                      <button
                        onClick={() => setGroupMode(prev => prev === 'flat' ? 'grouped' : 'flat')}
                        className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                          groupMode === 'grouped'
                            ? 'border-[var(--primary)] text-[var(--primary)] bg-[rgba(0,255,0,0.15)]'
                            : 'border-[var(--bg-border)] text-[var(--text-dimmer)] hover:border-[var(--primary-dim)] hover:text-[var(--primary)]'
                        }`}
                      >
                        {groupMode === 'grouped' ? 'Grouped' : 'Group by Crew'}
                      </button>
                    )}
                  </div>

                  {/* Character list */}
                  <div className="space-y-2">
                    {groupMode === 'grouped' && groupedCharacters ? (
                      // Grouped view
                      groupedCharacters.map(({ crew, members }) => (
                        <div key={crew?.id || 'unassigned'} className="space-y-2">
                          {/* Group header */}
                          <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded font-mono text-xs font-bold border"
                            style={{
                              borderColor: crew ? crew.color + '60' : 'var(--bg-border)',
                              backgroundColor: crew ? crew.color + '10' : 'transparent',
                              color: crew ? crew.color : 'var(--text-dimmer)',
                            }}
                          >
                            {crew ? (
                              <>
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: crew.color, boxShadow: `0 0 4px ${crew.color}` }} />
                                {crew.name}
                                {(() => {
                                  const ship = vehicles.find(v => v.id === crew.ship_id);
                                  return ship ? (
                                    <span className="text-[var(--text-dimmer)] font-normal flex items-center gap-1">
                                      <Ship className="h-3 w-3" /> {ship.name}
                                    </span>
                                  ) : null;
                                })()}
                                <span className="ml-auto text-[var(--text-dimmer)] font-normal">
                                  {members.length} members
                                </span>
                              </>
                            ) : (
                              <>
                                UNASSIGNED
                                <span className="ml-auto font-normal">{members.length} members</span>
                              </>
                            )}
                          </div>
                          {members.length > 0 ? (
                            members.map(renderCharacterRow)
                          ) : (
                            <div className="p-2 text-xs font-mono text-[var(--text-dimmer)] text-center border border-primary/10 rounded">
                              No members
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      // Flat view
                      filteredCharacters.length > 0 ? (
                        filteredCharacters.map(renderCharacterRow)
                      ) : (
                        rosterFilter !== 'all' || crewFilter !== 'all' ? (
                          <div className="p-3 border border-primary/20 rounded font-mono text-sm text-[var(--text-dimmer)] bg-background/30 text-center">
                            No characters match the current filters.
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
