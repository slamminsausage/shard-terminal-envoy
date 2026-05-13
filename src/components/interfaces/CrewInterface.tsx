import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Users, UserPlus, Package, DollarSign, Bot, Ship } from 'lucide-react';
import { CREW_POSITION_PRESETS, NPC_ROLE_STYLES } from "@/types/database";
import { AnimatedList } from "@/components/ui/AnimatedList";
import type { Character, CrewGroup } from "@/types/database";
import { getCharacteristicDM } from "@/lib/dice";

type RosterFilter = 'all' | 'pc' | 'npc';
type CrewFilter = 'all' | 'unassigned' | string; // 'all', 'unassigned', or a crew group ID
type GroupMode = 'flat' | 'grouped';

/** Color config for character type/role badges */
function getCharacterBadge(character: Character): { label: string; color: string; borderColor: string; bgColor: string } {
  const charType = character.character_type || 'pc';
  if (charType === 'pc') {
    return { label: 'PC', color: '#3ae2b3', borderColor: 'rgba(58, 226, 179,0.5)', bgColor: 'rgba(58, 226, 179,0.1)' };
  }
  const role = character.npc_role || 'crew';
  const style = NPC_ROLE_STYLES[role] ?? NPC_ROLE_STYLES.crew;
  return { label: style.label, color: style.hexColor, borderColor: style.borderColor, bgColor: style.bgColor };
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

const CHAR_STATS = [
  { label: 'STR', key: 'strength' as const },
  { label: 'DEX', key: 'dexterity' as const },
  { label: 'END', key: 'endurance' as const },
  { label: 'INT', key: 'intellect' as const },
  { label: 'EDU', key: 'education' as const },
  { label: 'SOC', key: 'social_standing' as const },
];

function ComparePanel({ a, b }: { a: Character; b: Character }) {
  return (
    <div className="grid grid-cols-2 gap-4 font-mono text-xs">
      {[a, b].map((c, ci) => (
        <div key={c.id} className={`space-y-3 ${ci === 1 ? 'border-l border-primary/20 pl-4' : ''}`}>
          <div className="text-sm font-bold text-[var(--primary)]">{c.name}</div>
          {c.career && <div className="text-[var(--text-dimmer)]">{c.career}{c.rank ? ` — ${c.rank}` : ''}</div>}
          <div className="grid grid-cols-3 gap-2">
            {CHAR_STATS.map(({ label, key }) => {
              const val = c[key] as number;
              const otherVal = (ci === 0 ? b : a)[key] as number;
              const better = val > otherVal;
              const worse = val < otherVal;
              return (
                <div key={label} className={`text-center p-1 rounded border ${better ? 'border-green-500/40 bg-green-500/5' : worse ? 'border-red-400/30 bg-red-400/5' : 'border-primary/20'}`}>
                  <div className="text-[0.55rem] text-[var(--text-dimmer)]">{label}</div>
                  <div className={`text-base font-bold ${better ? 'text-green-400' : worse ? 'text-red-400' : 'text-[var(--primary)]'}`}>{val}</div>
                  <div className="text-[0.55rem] text-[var(--text-dimmer)]">DM {getCharacteristicDM(val) >= 0 ? '+' : ''}{getCharacteristicDM(val)}</div>
                </div>
              );
            })}
          </div>
          {/* Trained skills */}
          {c.skills && typeof c.skills === 'object' && (
            <div>
              <div className="text-[var(--text-dimmer)] uppercase tracking-wide mb-1">Trained Skills</div>
              <div className="flex flex-wrap gap-1">
                {(Object.entries(c.skills) as [string, { proficient?: boolean; value?: string }][])
                  .filter(([, v]) => v.proficient || Number(v.value) > 0)
                  .sort(([, a], [, b]) => Number(b.value ?? 0) - Number(a.value ?? 0))
                  .slice(0, 10)
                  .map(([k, v]) => (
                    <span key={k} className="px-1.5 py-0.5 border border-primary/20 rounded text-[0.6rem] text-[var(--primary)]">
                      {k.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} {v.value}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CrewInterface() {
  const [displayText, setDisplayText] = useState("");
  const [selectedCharIds, setSelectedCharIds] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const [bulkCrewId, setBulkCrewId] = useState<string>('none');
  const [activeCrewMember, setActiveCrewMember] = useState<string | null>(null);
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);
  const [readOnlySheet, setReadOnlySheet] = useState(false);
  const [activeTab, setActiveTab] = useState("crew");
  const [rosterFilter, setRosterFilter] = useState<RosterFilter>(
    () => (sessionStorage.getItem('crew-roster-filter') as RosterFilter) || 'all'
  );
  const [crewFilter, setCrewFilter] = useState<CrewFilter>(
    () => sessionStorage.getItem('crew-crew-filter') || 'all'
  );
  const [groupMode, setGroupMode] = useState<GroupMode>(
    () => (sessionStorage.getItem('crew-group-mode') as GroupMode) || 'flat'
  );
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
    setReadOnlySheet(false);
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

  const handleBulkAssign = async () => {
    if (selectedCharIds.size === 0) return;
    const targetCrewId = bulkCrewId === 'none' ? null : bulkCrewId;
    for (const id of selectedCharIds) {
      const char = characters.find(c => c.id === id);
      if (!char) continue;
      const canEdit = isGM || currentPlayer?.id === char.player_id;
      if (!canEdit) continue;
      await assignCharacterToCrew(id, targetCrewId);
    }
    setSelectedCharIds(new Set());
    setBulkCrewId('none');
  };

  const toggleCharSelection = (id: string) => {
    setSelectedCharIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
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
    const rowBorder = crewGroup ? crewGroup.color : (character.character_type === 'npc' ? 'rgba(0,204,255,0.4)' : 'rgba(58, 226, 179,0.4)');

    const isSelected = selectedCharIds.has(character.id);
    return (
      <div
        key={character.id}
        className={`p-2 sm:p-3 border rounded font-mono text-xs sm:text-sm flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-background/40 transition-colors ${isSelected ? 'border-primary/60 bg-primary/5' : 'border-primary/20'}`}
        style={{ borderLeftWidth: '3px', borderLeftColor: rowBorder }}
      >
        <div className="text-primary break-words flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleCharSelection(character.id)}
              className="h-3 w-3 accent-[var(--primary)] cursor-pointer flex-shrink-0"
              title="Select for bulk action"
            />
            <span
              className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider"
              style={{ color: badge.color, borderColor: badge.borderColor, backgroundColor: badge.bgColor }}
            >
              {badge.label}
            </span>
            <span style={{ color: badge.color }}>{character.name}</span>
            {character.career && (
              <span className="text-[var(--text-dimmer)]">
                [{character.career}{character.rank ? ` — ${character.rank}` : ''}]
              </span>
            )}
            {/* Stat pills: show key characteristic DMs */}
            {[
              { key: 'STR', val: character.strength },
              { key: 'INT', val: character.intellect },
              { key: 'EDU', val: character.education },
            ].map(({ key, val }) => {
              if (!val) return null;
              const dm = getCharacteristicDM(val);
              return (
                <span key={key} className="text-[0.55rem] font-mono px-1 py-0.5 rounded border border-[var(--bg-border)] text-[var(--text-dimmer)]">
                  {key} {dm >= 0 ? '+' : ''}{dm}
                </span>
              );
            })}
          </div>
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
          {canEdit ? (
            <Button variant="outline" size="sm" className="text-xs"
              onClick={() => { setActiveCrewMember(character.id); setReadOnlySheet(false); setShowCharacterSheet(true); }}>
              Edit
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="text-xs"
              onClick={() => { setActiveCrewMember(character.id); setReadOnlySheet(true); setShowCharacterSheet(true); }}>
              View
            </Button>
          )}
          {canClaim && (
            <Button variant="outline" size="sm"
              className="text-xs border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black"
              onClick={() => void claimCharacter(character.id)}>
              Claim
            </Button>
          )}
          <Button onClick={() => window.open(`/character-view/${character.id}`, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')}
            variant="secondary" size="sm" className="text-xs">
            Pop Out
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

  // Derive compare pair from the current selection (only meaningful when exactly 2 are checked)
  const selectedIdsArray = useMemo(() => [...selectedCharIds], [selectedCharIds]);
  const compareCharA = selectedIdsArray[0] ? characters.find(c => c.id === selectedIdsArray[0]) : null;
  const compareCharB = selectedIdsArray[1] ? characters.find(c => c.id === selectedIdsArray[1]) : null;

  if (showCharacterSheet) {
    return (
      <div className="interface-container">
        <header className="interface-header">
          <h2 className="interface-title">
            {readOnlySheet ? 'CHARACTER SHEET (VIEW ONLY)' : 'CHARACTER SHEET INTERFACE'}
          </h2>
          <button className="terminal-btn text-xs sm:text-sm" onClick={handleBackToCrewInterface}>
            Back to Crew Management
          </button>
        </header>
        <div className="interface-content">
          <CharacterSheet characterId={activeCrewMember || undefined} readOnly={readOnlySheet} />
        </div>
      </div>
    );
  }

  return (
    <div className="interface-container">
      {/* Character compare dialog — only opens when exactly 2 are selected */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">CHARACTER COMPARISON</DialogTitle>
          </DialogHeader>
          {compareCharA && compareCharB ? (
            <ComparePanel a={compareCharA} b={compareCharB} />
          ) : (
            <p className="text-xs font-mono text-[var(--text-dimmer)]">
              Check the boxes next to exactly two characters, then click Compare in the selection bar.
            </p>
          )}
        </DialogContent>
      </Dialog>

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
                    <button onClick={() => { setRosterFilter('all'); sessionStorage.setItem('crew-roster-filter', 'all'); }}
                      className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                        rosterFilter === 'all'
                          ? 'border-[var(--primary)] text-[var(--primary)] bg-[rgba(58, 226, 179,0.15)]'
                          : 'border-[var(--bg-border)] text-[var(--text-dimmer)] hover:border-[var(--primary-dim)] hover:text-[var(--primary)]'
                      }`}>
                      ALL ({characters.length})
                    </button>
                    <button onClick={() => { setRosterFilter('pc'); sessionStorage.setItem('crew-roster-filter', 'pc'); }}
                      className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                        rosterFilter === 'pc'
                          ? 'border-[var(--primary)] text-[var(--primary)] bg-[rgba(58, 226, 179,0.15)]'
                          : 'border-[var(--bg-border)] text-[var(--text-dimmer)] hover:border-[var(--primary-dim)] hover:text-[var(--primary)]'
                      }`}>
                      PCs ({pcCount})
                    </button>
                    <button onClick={() => { setRosterFilter('npc'); sessionStorage.setItem('crew-roster-filter', 'npc'); }}
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
                    <Select value={crewFilter} onValueChange={v => { setCrewFilter(v); sessionStorage.setItem('crew-crew-filter', v); }}>
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
                        onClick={() => setGroupMode(prev => { const next = prev === 'flat' ? 'grouped' : 'flat'; sessionStorage.setItem('crew-group-mode', next); return next; })}
                        className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                          groupMode === 'grouped'
                            ? 'border-[var(--primary)] text-[var(--primary)] bg-[rgba(58, 226, 179,0.15)]'
                            : 'border-[var(--bg-border)] text-[var(--text-dimmer)] hover:border-[var(--primary-dim)] hover:text-[var(--primary)]'
                        }`}
                      >
                        {groupMode === 'grouped' ? 'Grouped' : 'Group by Crew'}
                      </button>
                    )}
                  </div>

                  {/* Bulk action bar */}
                  {selectedCharIds.size > 0 && (
                    <div className="flex items-center gap-2 p-2 mb-2 rounded border border-[var(--primary)]/40 bg-[var(--primary)]/5 font-mono text-xs flex-wrap">
                      <span className="text-[var(--primary)]">{selectedCharIds.size} selected</span>

                      {/* Compare — only available with exactly 2 selected */}
                      {selectedCharIds.size === 2 && (
                        <button
                          onClick={() => setCompareOpen(true)}
                          className="px-3 py-1 rounded border border-purple-400/60 text-purple-400 hover:bg-purple-400/10 transition-colors"
                        >
                          Compare
                        </button>
                      )}

                      {/* Crew assignment (any selection count) */}
                      <Select value={bulkCrewId} onValueChange={setBulkCrewId}>
                        <SelectTrigger className="h-7 text-xs font-mono w-auto min-w-[120px] px-2 border-[var(--primary)]/40">
                          <SelectValue placeholder="Assign to crew..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Remove from crew</SelectItem>
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
                      <button
                        onClick={handleBulkAssign}
                        className="px-3 py-1 rounded border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => setSelectedCharIds(new Set())}
                        className="px-3 py-1 rounded border border-[var(--bg-border)] text-[var(--text-dimmer)] hover:text-[var(--primary)] transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  )}

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
                        <AnimatedList className="space-y-2">
                          {filteredCharacters.map(renderCharacterRow)}
                        </AnimatedList>
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

              {/* Study Tracker */}
              {(() => {
                const studying = characters.filter(c => c.study_skill);
                if (studying.length === 0) return null;
                return (
                  <div className="panel mt-4">
                    <div className="panel-header">
                      <span className="panel-title">STUDY TRACKER</span>
                      <span className="panel-status">{studying.length} ACTIVE</span>
                    </div>
                    <div className="panel-content">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs font-mono">
                          <thead>
                            <tr className="border-b border-primary/20 text-[var(--text-dimmer)] uppercase tracking-wide">
                              <th className="text-left py-1 pr-3">Character</th>
                              <th className="text-left py-1 pr-3">Skill</th>
                              <th className="text-left py-1 pr-3">Weeks</th>
                              <th className="text-left py-1">Complete</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studying.map(c => (
                              <tr key={c.id} className="border-b border-primary/10">
                                <td className="py-1.5 pr-3 text-[var(--primary)]">{c.name}</td>
                                <td className="py-1.5 pr-3">{c.study_skill}</td>
                                <td className="py-1.5 pr-3 text-[var(--text-dimmer)]">{c.study_weeks || '—'}</td>
                                <td className="py-1.5 text-[var(--text-dimmer)]">{c.study_complete || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Crew Capacity Summary */}
              {crewGroups.length > 0 && (() => {
                const REQUIRED_POSITIONS = ['Pilot', 'Astrogator', 'Engineer'];
                return (
                  <div className="panel mt-4">
                    <div className="panel-header">
                      <span className="panel-title">CREW CAPACITY</span>
                    </div>
                    <div className="panel-content space-y-3">
                      {crewGroups.map(group => {
                        const members = characters.filter(c => c.crew_id === group.id);
                        const ship = vehicles.find(v => v.id === group.ship_id);
                        const filledPositions = new Set(members.map(m => m.crew_position).filter(Boolean));
                        const missingCritical = REQUIRED_POSITIONS.filter(p => !filledPositions.has(p));
                        return (
                          <div key={group.id} className="flex items-start gap-3">
                            <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: group.color, boxShadow: `0 0 4px ${group.color}` }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs" style={{ color: group.color }}>{group.name}</span>
                                {ship && <span className="text-[var(--text-dimmer)] text-[0.65rem] flex items-center gap-0.5"><Ship className="h-3 w-3" />{ship.name}</span>}
                                <span className="text-[var(--text-dimmer)] text-[0.65rem]">{members.length} crew</span>
                              </div>
                              {missingCritical.length > 0 && (
                                <div className="text-[0.6rem] text-amber-400/80 mt-0.5">
                                  Missing: {missingCritical.join(', ')}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-1 mt-1">
                                {members.map(m => (
                                  <span key={m.id} className="text-[0.55rem] px-1 py-0.5 rounded border border-[var(--bg-border)] text-[var(--text-dimmer)]">
                                    {m.crew_position || m.name.split(' ')[0]}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </TabsContent>

      {/* NPC Generator Tab */}
      {isGM && (
        <TabsContent value="npcgen">
          <NPCGenerator
            onNPCSaved={() => setActiveTab('crew')}
            defaultCrewId={crewFilter !== 'all' && crewFilter !== 'unassigned' ? crewFilter : undefined}
          />
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

export default React.memo(CrewInterface);
