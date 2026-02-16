import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Plus, Trash2, Heart, Swords, RefreshCw, ArrowUp, ArrowDown, User, Dices, GripVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCampaign } from '@/contexts/CampaignContext';
import type { Character, Combatant, CombatEncounter } from '@/types/database';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

// Calculate Traveller characteristic DM
function getCharacteristicDM(value: number): number {
  if (value === 0) return -3;
  if (value <= 2) return -2;
  if (value <= 5) return -1;
  if (value <= 8) return 0;
  if (value <= 11) return 1;
  if (value <= 14) return 2;
  return 3; // 15+
}

// Roll 2d6
function roll2d6(): number {
  return Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
}

export default function CombatInterface() {
  const { characters, saveCharacter } = useCampaign();
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addType, setAddType] = useState<'character' | 'npc'>('character');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');

  // NPC creation fields
  const [npcName, setNpcName] = useState('');
  const [npcInitiative, setNpcInitiative] = useState(0);
  const [npcHealthType, setNpcHealthType] = useState<'characteristics' | 'hits'>('hits');
  const [npcHits, setNpcHits] = useState(10);
  const [npcStr, setNpcStr] = useState(7);
  const [npcDex, setNpcDex] = useState(7);
  const [npcEnd, setNpcEnd] = useState(7);
  const [npcArmor, setNpcArmor] = useState(0);

  // Initiative roll dialog
  const [isInitiativeDialogOpen, setIsInitiativeDialogOpen] = useState(false);
  const [pendingCharacter, setPendingCharacter] = useState<Character | null>(null);
  const [initiativeCharacteristic, setInitiativeCharacteristic] = useState<'dex' | 'int'>('dex');
  const [initiativeRoll, setInitiativeRoll] = useState(0);
  const [initiativeBonus, setInitiativeBonus] = useState(0);
  const [useManualInitiative, setUseManualInitiative] = useState(false);
  const [manualInitiative, setManualInitiative] = useState(0);

  // Ref for debouncing auto-save
  const saveTimeoutRef = useRef<number | null>(null);

  // Drag and drop state
  const [draggedCombatantId, setDraggedCombatantId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Track the combatant who started the current round for round detection
  const [roundStartCombatantId, setRoundStartCombatantId] = useState<string | null>(null);

  // Sort combatants by turn order (memoized to prevent unnecessary re-sorts)
  const sortedCombatants = useMemo(() => {
    return [...combatants].sort((a, b) => a.turnOrder - b.turnOrder);
  }, [combatants]);

  const activeCombatant = sortedCombatants[currentTurnIndex];

  // Player ID for database queries (matches CampaignContext)
  const PLAYER_ID = 'campaign';

  // Load combat encounter from database
  const loadCombat = async () => {
    try {
      const { data, error } = await supabase
        .from('combat_encounters')
        .select('*')
        .eq('player_id', PLAYER_ID)
        .maybeSingle();

      if (error) {
        console.error('Error loading combat:', error);
        return;
      }

      if (data) {
        // Ensure all combatants have a turnOrder field (for backward compatibility)
        const combatantsWithTurnOrder = (data.combatants || []).map((c: Combatant) => ({
          ...c,
          turnOrder: c.turnOrder ?? c.initiative, // Initialize to initiative if missing
        }));
        setCombatants(combatantsWithTurnOrder);
        setCurrentRound(data.current_round);
        setCurrentTurnIndex(data.current_turn_index);

        // Initialize round start combatant (the first combatant in turn order)
        if (combatantsWithTurnOrder.length > 0) {
          const sorted = [...combatantsWithTurnOrder].sort((a, b) => a.turnOrder - b.turnOrder);
          setRoundStartCombatantId(sorted[0]?.id || null);
        }
      }
    } catch (error) {
      console.error('Error loading combat:', error);
    }
  };

  // Save combat encounter to database
  const saveCombat = useCallback(async () => {
    // Don't save if there are no combatants
    if (combatants.length === 0) return;

    try {
      const { error } = await supabase
        .from('combat_encounters')
        .upsert({
          player_id: PLAYER_ID,
          current_round: currentRound,
          current_turn_index: currentTurnIndex,
          combatants: combatants,
        }, {
          onConflict: 'player_id'
        });

      if (error) {
        console.error('Error saving combat:', error);
      }
    } catch (error) {
      console.error('Error saving combat:', error);
    }
  }, [combatants, currentRound, currentTurnIndex]);

  // Delete combat encounter from database
  const deleteCombat = async () => {
    try {
      const { error } = await supabase
        .from('combat_encounters')
        .delete()
        .eq('player_id', PLAYER_ID);

      if (error) {
        console.error('Error deleting combat:', error);
      }
    } catch (error) {
      console.error('Error deleting combat:', error);
    }
  };

  // Load combat on mount
  useEffect(() => {
    loadCombat();
  }, []);

  // Auto-save combat whenever it changes (debounced to prevent race conditions)
  useEffect(() => {
    // Clear any pending save
    if (saveTimeoutRef.current !== null) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save by 500ms
    if (combatants.length > 0) {
      saveTimeoutRef.current = window.setTimeout(() => {
        saveCombat();
        saveTimeoutRef.current = null;
      }, 500);
    }

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current !== null) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [combatants, currentRound, currentTurnIndex, saveCombat]);

  const handleAddCharacter = () => {
    const character = characters.find(c => c.id === selectedCharacterId);
    if (!character) return;

    // Close the add dialog and open initiative roll dialog
    setIsAddDialogOpen(false);
    setPendingCharacter(character);
    setInitiativeCharacteristic('dex'); // Default to DEX
    setInitiativeBonus(0); // Bonuses are situational (tactics, etc), not static
    setUseManualInitiative(false); // Default to rolling
    setManualInitiative(0);
    handleRollInitiative('dex', character);
    setIsInitiativeDialogOpen(true);
  };

  const handleRollInitiative = (characteristic: 'dex' | 'int', character: Character) => {
    const roll = roll2d6();
    const statValue = characteristic === 'dex'
      ? (character.current_dexterity ?? character.dexterity)
      : character.intellect;
    const dm = getCharacteristicDM(statValue);
    setInitiativeRoll(roll);
    setInitiativeCharacteristic(characteristic);
  };

  const handleConfirmInitiative = () => {
    if (!pendingCharacter) return;

    // Use manual initiative if selected, otherwise calculate from roll
    let total: number;
    if (useManualInitiative) {
      total = manualInitiative;
    } else {
      const characteristic = initiativeCharacteristic;
      const statValue = characteristic === 'dex'
        ? (pendingCharacter.current_dexterity ?? pendingCharacter.dexterity)
        : pendingCharacter.intellect;
      const dm = getCharacteristicDM(statValue);
      total = initiativeRoll + dm + initiativeBonus;
    }

    const newCombatant: Combatant = {
      id: Date.now().toString(),
      name: pendingCharacter.name,
      type: 'character',
      characterId: pendingCharacter.id,
      initiative: total,
      turnOrder: total, // Initialize turnOrder to initiative value
      healthType: 'characteristics',
      currentStr: pendingCharacter.current_strength ?? pendingCharacter.strength,
      maxStr: pendingCharacter.strength,
      currentDex: pendingCharacter.current_dexterity ?? pendingCharacter.dexterity,
      maxDex: pendingCharacter.dexterity,
      currentEnd: pendingCharacter.current_endurance ?? pendingCharacter.endurance,
      maxEnd: pendingCharacter.endurance,
      armor: 0,
      cover: 'none',
      range: 'medium',
      actionsRemaining: 2,
      reactionsRemaining: 1,
      hasMovedThisRound: false,
      isActive: true,
      isDowned: false,
      notes: ''
    };

    setCombatants([...combatants, newCombatant]);
    setIsInitiativeDialogOpen(false);
    setPendingCharacter(null);
    setSelectedCharacterId('');
  };

  const handleAddNPC = () => {
    if (!npcName.trim()) return;

    const newCombatant: Combatant = {
      id: Date.now().toString(),
      name: npcName,
      type: 'npc',
      initiative: npcInitiative,
      turnOrder: npcInitiative, // Initialize turnOrder to initiative value
      healthType: npcHealthType,
      // Set appropriate health values based on type
      ...(npcHealthType === 'hits' ? {
        hits: npcHits,
        hitsMax: npcHits,
      } : {
        currentStr: npcStr,
        maxStr: npcStr,
        currentDex: npcDex,
        maxDex: npcDex,
        currentEnd: npcEnd,
        maxEnd: npcEnd,
      }),
      armor: npcArmor,
      cover: 'none',
      range: 'medium',
      actionsRemaining: 2,
      reactionsRemaining: 1,
      hasMovedThisRound: false,
      isActive: true,
      isDowned: false,
      notes: ''
    };

    setCombatants([...combatants, newCombatant]);
    setIsAddDialogOpen(false);

    // Reset NPC form
    setNpcName('');
    setNpcInitiative(0);
    setNpcHealthType('hits');
    setNpcHits(10);
    setNpcStr(7);
    setNpcDex(7);
    setNpcEnd(7);
    setNpcArmor(0);
  };

  const handleRemoveCombatant = (id: string) => {
    setCombatants(combatants.filter(c => c.id !== id));
  };

  const handleNextTurn = () => {
    if (sortedCombatants.length === 0) return;

    // The active combatant is always at index 0
    const currentCombatant = sortedCombatants[0];

    // Check if this is the first turn of combat (round start combatant not yet set)
    const isFirstTurn = !roundStartCombatantId;

    // Check if we've completed a full round
    // This happens when we're back to the combatant who started the round
    const isCompletingRound = !isFirstTurn && currentCombatant.id === roundStartCombatantId;

    // Move current combatant to the end by setting their turnOrder higher than everyone else's
    const maxTurnOrder = Math.max(...sortedCombatants.map(c => c.turnOrder));

    const newCombatants = combatants.map(c => {
      if (c.id === currentCombatant.id) {
        // Move current to end
        return { ...c, turnOrder: maxTurnOrder + 1 };
      }
      return c;
    });

    if (isCompletingRound) {
      // Round completed - increment round and reset action economy
      setCurrentRound(currentRound + 1);
      setCombatants(newCombatants.map(c => ({
        ...c,
        actionsRemaining: 2,
        reactionsRemaining: 1,
        hasMovedThisRound: false
      })));
      // Set the new combatant at index 0 as the round start
      const newSorted = [...newCombatants].sort((a, b) => a.turnOrder - b.turnOrder);
      setRoundStartCombatantId(newSorted[0]?.id || null);
    } else {
      // Just move to next turn
      setCombatants(newCombatants);

      // If this was the first turn, set the round start combatant
      if (isFirstTurn) {
        // The combatant we just moved should be tracked as the round starter
        setRoundStartCombatantId(currentCombatant.id);
      }
    }

    // Always keep the active turn at index 0
    setCurrentTurnIndex(0);
  };

  const handlePreviousTurn = () => {
    if (sortedCombatants.length === 0) return;

    // Move the last combatant to the front by setting their turnOrder lower
    const lastCombatant = sortedCombatants[sortedCombatants.length - 1];
    const minTurnOrder = Math.min(...sortedCombatants.map(c => c.turnOrder));

    const newCombatants = combatants.map(c => {
      if (c.id === lastCombatant.id) {
        // Move last combatant to front (lower turnOrder value)
        return { ...c, turnOrder: minTurnOrder - 1 };
      }
      return c;
    });

    // Check if we're going back to the round start combatant (going back a round)
    if (lastCombatant.id === roundStartCombatantId && currentRound > 1) {
      setCurrentRound(currentRound - 1);
    }

    setCombatants(newCombatants);

    // Always keep the active turn at index 0
    setCurrentTurnIndex(0);
  };

  const handleUpdateCombatant = (id: string, updates: Partial<Combatant>) => {
    setCombatants(combatants.map(c =>
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, combatantId: string) => {
    setDraggedCombatantId(combatantId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!draggedCombatantId) return;

    const draggedIndex = sortedCombatants.findIndex(c => c.id === draggedCombatantId);
    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDraggedCombatantId(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder by adjusting turnOrder values
    const newCombatants = [...combatants];
    const draggedCombatant = sortedCombatants[draggedIndex];
    const targetCombatant = sortedCombatants[dropIndex];

    // Calculate new turnOrder for dragged combatant
    let newTurnOrder: number;
    if (dropIndex === 0) {
      // Moving to first position
      newTurnOrder = targetCombatant.turnOrder - 1;
    } else if (dropIndex === sortedCombatants.length - 1) {
      // Moving to last position
      newTurnOrder = targetCombatant.turnOrder + 1;
    } else if (draggedIndex < dropIndex) {
      // Moving down - place between target and next
      const nextCombatant = sortedCombatants[dropIndex + 1];
      newTurnOrder = (targetCombatant.turnOrder + nextCombatant.turnOrder) / 2;
    } else {
      // Moving up - place between previous and target
      const prevCombatant = sortedCombatants[dropIndex - 1];
      newTurnOrder = (prevCombatant.turnOrder + targetCombatant.turnOrder) / 2;
    }

    // Update the dragged combatant's turnOrder
    const updatedCombatants = newCombatants.map(c =>
      c.id === draggedCombatantId ? { ...c, turnOrder: newTurnOrder } : c
    );

    setCombatants(updatedCombatants);
    setDraggedCombatantId(null);
    setDragOverIndex(null);

    // The top combatant (index 0) is always considered active
    setCurrentTurnIndex(0);
  };

  const handleDragEnd = () => {
    setDraggedCombatantId(null);
    setDragOverIndex(null);
  };

  // Sync character stats back to character sheet
  const syncCharacterStats = async (combatant: Combatant) => {
    if (combatant.type !== 'character' || !combatant.characterId) return;

    const character = characters.find(c => c.id === combatant.characterId);
    if (!character) return;

    // Update character with current stats if using characteristics
    // Only update the CURRENT values, not the max/base values
    if (combatant.healthType === 'characteristics') {
      const updatedCharacter = {
        ...character,
        current_strength: combatant.currentStr,
        current_dexterity: combatant.currentDex,
        current_endurance: combatant.currentEnd,
      };
      await saveCharacter(updatedCharacter);
    }
  };

  const handleApplyDamage = (id: string, damage: number, stat?: 'str' | 'dex' | 'end') => {
    setCombatants(combatants.map(c => {
      if (c.id !== id) return c;

      let isDowned = false;
      const updated = { ...c };

      if (c.healthType === 'hits') {
        // Damage hits
        updated.hits = Math.max(0, (c.hits || 0) - damage);
        if (updated.hits === 0) {
          isDowned = true;
        }
      } else {
        // Damage characteristics - default to END if not specified
        const targetStat = stat || 'end';

        if (targetStat === 'str') {
          updated.currentStr = Math.max(0, (c.currentStr || 0) - damage);
        } else if (targetStat === 'dex') {
          updated.currentDex = Math.max(0, (c.currentDex || 0) - damage);
        } else {
          updated.currentEnd = Math.max(0, (c.currentEnd || 0) - damage);
        }

        // Check if downed (all characteristics at 0)
        if (updated.currentStr === 0 && updated.currentDex === 0 && updated.currentEnd === 0) {
          isDowned = true;
        }
      }

      updated.isDowned = isDowned;

      // Sync to character sheet if this is a character
      if (updated.type === 'character' && updated.healthType === 'characteristics') {
        syncCharacterStats(updated);
      }

      return updated;
    }));
  };

  const handleHeal = (id: string, amount: number, stat?: 'str' | 'dex' | 'end') => {
    setCombatants(combatants.map(c => {
      if (c.id !== id) return c;

      const updated = { ...c };

      if (c.healthType === 'hits') {
        // Heal hits
        updated.hits = Math.min(c.hitsMax || 0, (c.hits || 0) + amount);
        if (updated.hits > 0) {
          updated.isDowned = false;
        }
      } else {
        // Heal characteristics - default to END if not specified
        const targetStat = stat || 'end';

        if (targetStat === 'str') {
          updated.currentStr = Math.min(c.maxStr || 0, (c.currentStr || 0) + amount);
        } else if (targetStat === 'dex') {
          updated.currentDex = Math.min(c.maxDex || 0, (c.currentDex || 0) + amount);
        } else {
          updated.currentEnd = Math.min(c.maxEnd || 0, (c.currentEnd || 0) + amount);
        }

        // Remove downed status if any stat is above 0
        if ((updated.currentStr || 0) > 0 || (updated.currentDex || 0) > 0 || (updated.currentEnd || 0) > 0) {
          updated.isDowned = false;
        }
      }

      // Sync to character sheet if this is a character
      if (updated.type === 'character' && updated.healthType === 'characteristics') {
        syncCharacterStats(updated);
      }

      return updated;
    }));
  };

  const handleResetCombat = async () => {
    setCombatants([]);
    setCurrentRound(1);
    setCurrentTurnIndex(0);
    setRoundStartCombatantId(null);
    await deleteCombat(); // Remove from database
  };

  return (
    <div className="interface-container">
      {/* Header */}
      <header className="interface-header">
        <div>
          <h2 className="interface-title flex items-center gap-3">
            <Swords className="w-6 h-6" />
            Combat Tracker
          </h2>
          <p className="interface-subtitle">Manage initiative, health, and actions</p>
        </div>

        <div className="flex gap-2">
          <button className="terminal-btn" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2 inline" />
            Add Combatant
          </button>
          {combatants.length > 0 && (
            <button className="terminal-btn danger" onClick={handleResetCombat}>
              <RefreshCw className="w-4 h-4 mr-2 inline" />
              Reset
            </button>
          )}
        </div>
      </header>

      <div className="interface-content">
      {combatants.length === 0 ? (
        <div className="terminal-card">
          <div className="terminal-empty-state">
            <Swords className="terminal-empty-state-icon text-terminal-primary" />
            <h3 className="terminal-empty-state-title">No combatants yet</h3>
            <p className="terminal-empty-state-description">
              Add characters from your crew or create NPCs to start tracking combat
            </p>
            <button className="terminal-btn" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2 inline" />
              Add First Combatant
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Combat Controls */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">ROUND {currentRound}</span>
              <div className="flex gap-2">
                <button
                  className="terminal-btn text-xs py-1 px-3"
                  onClick={handlePreviousTurn}
                  disabled={currentRound === 1 && currentTurnIndex === 0}
                >
                  <ArrowUp className="w-3 h-3 mr-1 inline" />
                  Previous
                </button>
                <button
                  className="terminal-btn primary text-xs py-1 px-3"
                  onClick={handleNextTurn}
                >
                  Next Turn
                  <ArrowDown className="w-3 h-3 ml-1 inline" />
                </button>
              </div>
            </div>
          </div>

          {/* Combatants List */}
          <div className="grid gap-3">
            {sortedCombatants.map((combatant, index) => {
              const isCurrentTurn = index === currentTurnIndex;
              const isDragging = draggedCombatantId === combatant.id;
              const isDragOver = dragOverIndex === index;

              return (
                <div
                  key={combatant.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, combatant.id)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "terminal-card transition-all cursor-move",
                    isCurrentTurn && "ring-2 ring-terminal-primary shadow-[0_0_20px_rgba(0,255,0,0.3)]",
                    combatant.isDowned && "opacity-60",
                    isDragging && "opacity-50",
                    isDragOver && "ring-2 ring-terminal-secondary scale-[1.02]"
                  )}
                >
                  <div className="terminal-card-header">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-5 h-5 text-terminal-text-dimmer cursor-grab active:cursor-grabbing flex-shrink-0" />
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-terminal-primary/20 border-2 border-terminal-primary">
                          <div className="text-[0.6rem] text-terminal-text-dimmer">INIT</div>
                          <div className="text-lg font-bold font-['Orbitron'] text-terminal-primary">{combatant.initiative}</div>
                        </div>

                        <div>
                          <div className="terminal-card-title flex items-center gap-2">
                            {combatant.type === 'character' ? (
                              <User className="w-4 h-4 text-terminal-secondary" />
                            ) : (
                              <User className="w-4 h-4 text-terminal-warning" />
                            )}
                            {combatant.name}
                            {combatant.isDowned && (
                              <span className="terminal-badge danger">(DOWNED)</span>
                            )}
                          </div>
                          {isCurrentTurn && (
                            <p className="text-xs text-terminal-primary font-semibold tracking-wider mt-1">CURRENT TURN</p>
                          )}
                        </div>
                      </div>

                      <button
                        className="p-2 text-terminal-danger hover:bg-terminal-danger/20 rounded transition-colors"
                        onClick={() => handleRemoveCombatant(combatant.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="terminal-card-content space-y-4">
                    {/* Health */}
                    {combatant.healthType === 'hits' ? (
                      // Show Hits for inanimate objects, robots, animals
                      <div className="space-y-2">
                        <label className="flex items-center gap-1 text-xs text-terminal-text-dimmer uppercase tracking-wider">
                          <Heart className="w-3 h-3 text-terminal-danger" />
                          Hits
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            className="terminal-btn text-xs py-1 px-3"
                            onClick={() => handleApplyDamage(combatant.id, 1)}
                          >
                            -1
                          </button>
                          <div className="flex-1 text-center">
                            <span className={cn(
                              "text-2xl font-bold font-['Orbitron']",
                              combatant.hits === 0 ? "text-terminal-danger" : "text-terminal-primary"
                            )}>
                              {combatant.hits}
                            </span>
                            <span className="text-terminal-text-dimmer">/{combatant.hitsMax}</span>
                          </div>
                          <button
                            className="terminal-btn text-xs py-1 px-3"
                            onClick={() => handleHeal(combatant.id, 1)}
                          >
                            +1
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Show STR/DEX/END for characters (sophonts)
                      <div className="grid grid-cols-3 gap-2">
                        {/* STR */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-terminal-text-dimmer uppercase tracking-wider block text-center">STR</label>
                          <div className="flex flex-col items-center gap-1">
                            <button
                              className="terminal-btn text-xs py-1 px-2 w-full"
                              onClick={() => handleHeal(combatant.id, 1, 'str')}
                            >
                              +1
                            </button>
                            <div className="text-center">
                              <span className={cn(
                                "text-xl font-bold font-['Orbitron']",
                                combatant.currentStr === 0 ? "text-terminal-danger" : "text-terminal-primary"
                              )}>
                                {combatant.currentStr}
                              </span>
                              <span className="text-xs text-terminal-text-dimmer">/{combatant.maxStr}</span>
                            </div>
                            <button
                              className="terminal-btn text-xs py-1 px-2 w-full"
                              onClick={() => handleApplyDamage(combatant.id, 1, 'str')}
                            >
                              -1
                            </button>
                          </div>
                        </div>

                        {/* DEX */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-terminal-text-dimmer uppercase tracking-wider block text-center">DEX</label>
                          <div className="flex flex-col items-center gap-1">
                            <button
                              className="terminal-btn text-xs py-1 px-2 w-full"
                              onClick={() => handleHeal(combatant.id, 1, 'dex')}
                            >
                              +1
                            </button>
                            <div className="text-center">
                              <span className={cn(
                                "text-xl font-bold font-['Orbitron']",
                                combatant.currentDex === 0 ? "text-terminal-danger" : "text-terminal-primary"
                              )}>
                                {combatant.currentDex}
                              </span>
                              <span className="text-xs text-terminal-text-dimmer">/{combatant.maxDex}</span>
                            </div>
                            <button
                              className="terminal-btn text-xs py-1 px-2 w-full"
                              onClick={() => handleApplyDamage(combatant.id, 1, 'dex')}
                            >
                              -1
                            </button>
                          </div>
                        </div>

                        {/* END */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-terminal-text-dimmer uppercase tracking-wider block text-center">END</label>
                          <div className="flex flex-col items-center gap-1">
                            <button
                              className="terminal-btn text-xs py-1 px-2 w-full"
                              onClick={() => handleHeal(combatant.id, 1, 'end')}
                            >
                              +1
                            </button>
                            <div className="text-center">
                              <span className={cn(
                                "text-xl font-bold font-['Orbitron']",
                                combatant.currentEnd === 0 ? "text-terminal-danger" : "text-terminal-primary"
                              )}>
                                {combatant.currentEnd}
                              </span>
                              <span className="text-xs text-terminal-text-dimmer">/{combatant.maxEnd}</span>
                            </div>
                            <button
                              className="terminal-btn text-xs py-1 px-2 w-full"
                              onClick={() => handleApplyDamage(combatant.id, 1, 'end')}
                            >
                              -1
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Economy */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="terminal-stat">
                        <div className="terminal-stat-label">Actions</div>
                        <div className="terminal-stat-value text-base">{combatant.actionsRemaining}/2</div>
                      </div>
                      <div className="terminal-stat">
                        <div className="terminal-stat-label">Reactions</div>
                        <div className="terminal-stat-value text-base">{combatant.reactionsRemaining}/1</div>
                      </div>
                      <div className="terminal-stat">
                        <div className="terminal-stat-label">Movement</div>
                        <div className="terminal-stat-value text-base">
                          {combatant.hasMovedThisRound ? '✓' : '○'}
                        </div>
                      </div>
                    </div>

                    {/* Combat Status */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-terminal-text-dimmer uppercase tracking-wider block mb-1">Cover</label>
                        <select
                          value={combatant.cover}
                          onChange={(e) =>
                            handleUpdateCombatant(combatant.id, { cover: e.target.value as Combatant['cover'] })
                          }
                          className="terminal-input h-8 text-xs"
                        >
                          <option value="none">None</option>
                          <option value="partial">Partial</option>
                          <option value="full">Full</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-terminal-text-dimmer uppercase tracking-wider block mb-1">Range</label>
                        <select
                          value={combatant.range}
                          onChange={(e) =>
                            handleUpdateCombatant(combatant.id, { range: e.target.value as Combatant['range'] })
                          }
                          className="terminal-input h-8 text-xs"
                        >
                          <option value="close">Close</option>
                          <option value="short">Short</option>
                          <option value="medium">Medium</option>
                          <option value="long">Long</option>
                          <option value="extreme">Extreme</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-terminal-text-dimmer uppercase tracking-wider block mb-1">Armor</label>
                        <input
                          type="number"
                          value={combatant.armor}
                          onChange={(e) =>
                            handleUpdateCombatant(combatant.id, {
                              armor: parseInt(e.target.value) || 0
                            })
                          }
                          className="terminal-input h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>

      {/* Add Combatant Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md bg-terminal-bg-panel border-terminal-primary/50">
          <DialogHeader>
            <DialogTitle className="font-['Orbitron'] text-terminal-primary tracking-wider">Add Combatant</DialogTitle>
            <DialogDescription className="text-terminal-text-dimmer">
              Add a character from your crew or create a new NPC
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                className={cn("terminal-btn text-xs", addType === 'character' && "primary")}
                onClick={() => setAddType('character')}
              >
                Character
              </button>
              <button
                className={cn("terminal-btn text-xs", addType === 'npc' && "primary")}
                onClick={() => setAddType('npc')}
              >
                NPC
              </button>
            </div>

            {addType === 'character' ? (
              <div className="space-y-2">
                <label className="text-xs text-terminal-text-dimmer uppercase tracking-wider block">Select Character</label>
                <select
                  value={selectedCharacterId}
                  onChange={(e) => setSelectedCharacterId(e.target.value)}
                  className="terminal-input"
                >
                  <option value="">Choose a character...</option>
                  {characters.map(char => (
                    <option key={char.id} value={char.id}>
                      {char.name}
                    </option>
                  ))}
                </select>
                {characters.length === 0 && (
                  <p className="text-sm text-terminal-text-dimmer">
                    No characters available. Create one in the Crew tab first.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-terminal-text-dimmer uppercase tracking-wider block mb-1">Name</label>
                  <input
                    value={npcName}
                    onChange={(e) => setNpcName(e.target.value)}
                    placeholder="NPC Name"
                    className="terminal-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-terminal-text-dimmer uppercase tracking-wider block mb-1">Initiative</label>
                    <input
                      type="number"
                      value={npcInitiative}
                      onChange={(e) => setNpcInitiative(parseInt(e.target.value) || 0)}
                      className="terminal-input"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-terminal-text-dimmer uppercase tracking-wider block mb-1">Armor</label>
                    <input
                      type="number"
                      value={npcArmor}
                      onChange={(e) => setNpcArmor(parseInt(e.target.value) || 0)}
                      className="terminal-input"
                    />
                  </div>
                </div>

                {/* Health Type Selection */}
                <div>
                  <label className="text-xs text-terminal-text-dimmer uppercase tracking-wider block mb-1">Health Type</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      className={cn("terminal-btn text-xs", npcHealthType === 'hits' && "primary")}
                      onClick={() => setNpcHealthType('hits')}
                    >
                      Hits (Objects)
                    </button>
                    <button
                      type="button"
                      className={cn("terminal-btn text-xs", npcHealthType === 'characteristics' && "primary")}
                      onClick={() => setNpcHealthType('characteristics')}
                    >
                      Characteristics
                    </button>
                  </div>
                </div>

                {/* Health Fields */}
                {npcHealthType === 'hits' ? (
                  <div>
                    <label className="text-xs text-terminal-text-dimmer uppercase tracking-wider block mb-1">Hits</label>
                    <input
                      type="number"
                      value={npcHits}
                      onChange={(e) => setNpcHits(parseInt(e.target.value) || 10)}
                      className="terminal-input"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-terminal-text-dimmer uppercase tracking-wider block mb-1">STR</label>
                      <input
                        type="number"
                        value={npcStr}
                        onChange={(e) => setNpcStr(parseInt(e.target.value) || 7)}
                        className="terminal-input"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-terminal-text-dimmer uppercase tracking-wider block mb-1">DEX</label>
                      <input
                        type="number"
                        value={npcDex}
                        onChange={(e) => setNpcDex(parseInt(e.target.value) || 7)}
                        className="terminal-input"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-terminal-text-dimmer uppercase tracking-wider block mb-1">END</label>
                      <input
                        type="number"
                        value={npcEnd}
                        onChange={(e) => setNpcEnd(parseInt(e.target.value) || 7)}
                        className="terminal-input"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <button className="terminal-btn" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </button>
            <button
              className="terminal-btn primary"
              onClick={addType === 'character' ? handleAddCharacter : handleAddNPC}
              disabled={addType === 'character' ? !selectedCharacterId : !npcName.trim()}
            >
              Add Combatant
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Initiative Roll Dialog */}
      <Dialog open={isInitiativeDialogOpen} onOpenChange={setIsInitiativeDialogOpen}>
        <DialogContent className="max-w-md bg-terminal-bg-panel border-terminal-primary/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-['Orbitron'] text-terminal-primary tracking-wider">
              <Dices className="w-5 h-5" />
              Roll Initiative: {pendingCharacter?.name}
            </DialogTitle>
            <DialogDescription className="text-terminal-text-dimmer">
              Roll 2d6 + DEX or INT DM + bonuses for initiative
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Manual Entry Toggle */}
            <div>
              <label className="text-xs text-terminal-text-dimmer uppercase tracking-wider block mb-1">Initiative Entry Method</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  className={cn("terminal-btn text-xs", !useManualInitiative && "primary")}
                  onClick={() => setUseManualInitiative(false)}
                >
                  Roll Dice
                </button>
                <button
                  type="button"
                  className={cn("terminal-btn text-xs", useManualInitiative && "primary")}
                  onClick={() => setUseManualInitiative(true)}
                >
                  Manual Entry
                </button>
              </div>
            </div>

            {useManualInitiative ? (
              /* Manual Initiative Entry */
              <div className="border border-terminal-primary/30 bg-terminal-bg-panel-alt rounded p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-terminal-text-dimmer">Initiative Value:</span>
                  <input
                    type="number"
                    value={manualInitiative}
                    onChange={(e) => setManualInitiative(parseInt(e.target.value) || 0)}
                    className="terminal-input h-10 w-24 text-center text-xl font-bold font-['Orbitron']"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-terminal-text-dimmer">
                  Enter the initiative value rolled by the player at the table.
                </p>
              </div>
            ) : (
              <>
                {/* Characteristic Selection */}
                <div>
                  <label className="text-xs text-terminal-text-dimmer uppercase tracking-wider block mb-1">Use Characteristic</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      className={cn("terminal-btn text-xs", initiativeCharacteristic === 'dex' && "primary")}
                      onClick={() => {
                        setInitiativeCharacteristic('dex');
                        if (pendingCharacter) handleRollInitiative('dex', pendingCharacter);
                      }}
                    >
                      DEX ({pendingCharacter ? (pendingCharacter.current_dexterity ?? pendingCharacter.dexterity) : 0})
                    </button>
                    <button
                      type="button"
                      className={cn("terminal-btn text-xs", initiativeCharacteristic === 'int' && "primary")}
                      onClick={() => {
                        setInitiativeCharacteristic('int');
                        if (pendingCharacter) handleRollInitiative('int', pendingCharacter);
                      }}
                    >
                      INT ({pendingCharacter?.intellect || 0})
                    </button>
                  </div>
                </div>

                {/* Roll Display */}
                <div className="border border-terminal-primary/30 bg-terminal-bg-panel-alt rounded p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-terminal-text-dimmer">2d6 Roll:</span>
                    <span className="text-2xl font-bold font-['Orbitron'] text-terminal-primary">{initiativeRoll}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-terminal-text-dimmer">
                      {initiativeCharacteristic.toUpperCase()} DM:
                    </span>
                    <span className="text-xl font-bold font-['Orbitron'] text-terminal-primary">
                      {pendingCharacter && getCharacteristicDM(
                        initiativeCharacteristic === 'dex'
                          ? (pendingCharacter.current_dexterity ?? pendingCharacter.dexterity)
                          : pendingCharacter.intellect
                      ) >= 0 ? '+' : ''}
                      {pendingCharacter && getCharacteristicDM(
                        initiativeCharacteristic === 'dex'
                          ? (pendingCharacter.current_dexterity ?? pendingCharacter.dexterity)
                          : pendingCharacter.intellect
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-terminal-text-dimmer">Bonus:</span>
                    <input
                      type="number"
                      value={initiativeBonus}
                      onChange={(e) => setInitiativeBonus(parseInt(e.target.value) || 0)}
                      className="terminal-input h-8 w-20 text-center"
                    />
                  </div>
                  <div className="border-t border-terminal-primary/20 pt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-terminal-primary-light">Total Initiative:</span>
                    <span className="text-3xl font-bold font-['Orbitron'] text-terminal-primary drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]">
                      {pendingCharacter && (
                        initiativeRoll +
                        getCharacteristicDM(
                          initiativeCharacteristic === 'dex'
                            ? (pendingCharacter.current_dexterity ?? pendingCharacter.dexterity)
                            : pendingCharacter.intellect
                        ) +
                        initiativeBonus
                      )}
                    </span>
                  </div>
                </div>

                {/* Re-roll Button */}
                <button
                  className="terminal-btn w-full"
                  onClick={() => {
                    if (pendingCharacter) handleRollInitiative(initiativeCharacteristic, pendingCharacter);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2 inline" />
                  Re-roll Initiative
                </button>
              </>
            )}
          </div>

          <DialogFooter>
            <button className="terminal-btn" onClick={() => {
              setIsInitiativeDialogOpen(false);
              setPendingCharacter(null);
            }}>
              Cancel
            </button>
            <button className="terminal-btn primary" onClick={handleConfirmInitiative}>
              Add to Combat
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
