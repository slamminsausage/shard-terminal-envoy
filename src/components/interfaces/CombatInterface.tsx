import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Heart, Shield, Swords, RefreshCw, ArrowUp, ArrowDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCampaign } from '@/contexts/CampaignContext';
import type { Character } from '@/types/database';
import { cn } from '@/lib/utils';

interface Combatant {
  id: string;
  name: string;
  type: 'character' | 'npc';
  characterId?: string;

  // Initiative
  initiative: number;

  // Health - flexible system for Traveller
  healthType: 'characteristics' | 'hits'; // Characters use characteristics, inanimate/animals use hits

  // For characters (sophonts) - track STR, DEX, END
  currentStr?: number;
  maxStr?: number;
  currentDex?: number;
  maxDex?: number;
  currentEnd?: number;
  maxEnd?: number;

  // For inanimate objects, robots, animals - track Hits
  hits?: number;
  hitsMax?: number;

  // Combat stats
  armor: number;
  cover: 'none' | 'partial' | 'full';
  range: 'close' | 'short' | 'medium' | 'long' | 'extreme';

  // Action economy
  actionsRemaining: number;
  reactionsRemaining: number;
  hasMovedThisRound: boolean;

  // Status
  isActive: boolean;
  isDowned: boolean;
  notes: string;
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

  // Sort combatants by initiative
  const sortedCombatants = [...combatants].sort((a, b) => b.initiative - a.initiative);
  const activeCombatant = sortedCombatants[currentTurnIndex];

  const handleAddCharacter = () => {
    const character = characters.find(c => c.id === selectedCharacterId);
    if (!character) return;

    const newCombatant: Combatant = {
      id: Date.now().toString(),
      name: character.name,
      type: 'character',
      characterId: character.id,
      initiative: character.initiative || 0,
      healthType: 'characteristics', // Characters track STR/DEX/END
      currentStr: character.strength,
      maxStr: character.strength,
      currentDex: character.dexterity,
      maxDex: character.dexterity,
      currentEnd: character.endurance,
      maxEnd: character.endurance,
      armor: 0, // TODO: Calculate from character armor
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
    setSelectedCharacterId('');
  };

  const handleAddNPC = () => {
    if (!npcName.trim()) return;

    const newCombatant: Combatant = {
      id: Date.now().toString(),
      name: npcName,
      type: 'npc',
      initiative: npcInitiative,
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

    const nextIndex = (currentTurnIndex + 1) % sortedCombatants.length;

    // If we've wrapped around, it's a new round
    if (nextIndex === 0) {
      setCurrentRound(currentRound + 1);
      // Reset all action economy
      setCombatants(combatants.map(c => ({
        ...c,
        actionsRemaining: 2,
        reactionsRemaining: 1,
        hasMovedThisRound: false
      })));
    }

    setCurrentTurnIndex(nextIndex);
  };

  const handlePreviousTurn = () => {
    if (sortedCombatants.length === 0) return;

    const prevIndex = currentTurnIndex === 0 ? sortedCombatants.length - 1 : currentTurnIndex - 1;

    // If we've wrapped around backwards, go to previous round
    if (currentTurnIndex === 0 && currentRound > 1) {
      setCurrentRound(currentRound - 1);
    }

    setCurrentTurnIndex(prevIndex);
  };

  const handleUpdateCombatant = (id: string, updates: Partial<Combatant>) => {
    setCombatants(combatants.map(c =>
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  // Sync character stats back to character sheet
  const syncCharacterStats = async (combatant: Combatant) => {
    if (combatant.type !== 'character' || !combatant.characterId) return;

    const character = characters.find(c => c.id === combatant.characterId);
    if (!character) return;

    // Update character with current stats if using characteristics
    if (combatant.healthType === 'characteristics') {
      const updatedCharacter = {
        ...character,
        strength: combatant.currentStr || character.strength,
        dexterity: combatant.currentDex || character.dexterity,
        endurance: combatant.currentEnd || character.endurance,
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

  const handleResetCombat = () => {
    setCombatants([]);
    setCurrentRound(1);
    setCurrentTurnIndex(0);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Swords className="w-8 h-8" />
            Combat Tracker
          </h2>
          <p className="text-muted-foreground">Manage initiative, health, and actions</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Combatant
          </Button>
          {combatants.length > 0 && (
            <Button variant="destructive" onClick={handleResetCombat}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Combat
            </Button>
          )}
        </div>
      </div>

      {combatants.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Swords className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No combatants yet</h3>
            <p className="text-muted-foreground mb-4">
              Add characters from your crew or create NPCs to start tracking combat
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Combatant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Combat Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Round {currentRound}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousTurn}
                    disabled={currentRound === 1 && currentTurnIndex === 0}
                  >
                    <ArrowUp className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleNextTurn}
                  >
                    Next Turn
                    <ArrowDown className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Combatants List */}
          <div className="grid gap-4">
            {sortedCombatants.map((combatant, index) => {
              const isCurrentTurn = index === currentTurnIndex;

              return (
                <Card
                  key={combatant.id}
                  className={cn(
                    "transition-all",
                    isCurrentTurn && "ring-2 ring-primary shadow-lg",
                    combatant.isDowned && "opacity-60"
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-primary/20 border-2 border-primary">
                          <div className="text-xs text-muted-foreground">Init</div>
                          <div className="text-lg font-bold">{combatant.initiative}</div>
                        </div>

                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {combatant.type === 'character' ? (
                              <User className="w-4 h-4 text-blue-500" />
                            ) : (
                              <User className="w-4 h-4 text-orange-500" />
                            )}
                            {combatant.name}
                            {combatant.isDowned && (
                              <span className="text-sm text-destructive font-normal">(DOWNED)</span>
                            )}
                          </CardTitle>
                          {isCurrentTurn && (
                            <p className="text-sm text-primary font-semibold">CURRENT TURN</p>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCombatant(combatant.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Health */}
                    {combatant.healthType === 'hits' ? (
                      // Show Hits for inanimate objects, robots, animals
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-red-500" />
                          Hits
                        </Label>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApplyDamage(combatant.id, 1)}
                          >
                            -1
                          </Button>
                          <div className="flex-1 text-center">
                            <span className={cn(
                              "text-2xl font-bold",
                              combatant.hits === 0 && "text-destructive"
                            )}>
                              {combatant.hits}
                            </span>
                            <span className="text-muted-foreground">/{combatant.hitsMax}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleHeal(combatant.id, 1)}
                          >
                            +1
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Show STR/DEX/END for characters (sophonts)
                      <div className="grid grid-cols-3 gap-2">
                        {/* STR */}
                        <div className="space-y-2">
                          <Label className="text-xs font-bold">STR</Label>
                          <div className="flex flex-col items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-full"
                              onClick={() => handleHeal(combatant.id, 1, 'str')}
                            >
                              +1
                            </Button>
                            <div className="text-center">
                              <span className={cn(
                                "text-xl font-bold",
                                combatant.currentStr === 0 && "text-destructive"
                              )}>
                                {combatant.currentStr}
                              </span>
                              <span className="text-xs text-muted-foreground">/{combatant.maxStr}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-full"
                              onClick={() => handleApplyDamage(combatant.id, 1, 'str')}
                            >
                              -1
                            </Button>
                          </div>
                        </div>

                        {/* DEX */}
                        <div className="space-y-2">
                          <Label className="text-xs font-bold">DEX</Label>
                          <div className="flex flex-col items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-full"
                              onClick={() => handleHeal(combatant.id, 1, 'dex')}
                            >
                              +1
                            </Button>
                            <div className="text-center">
                              <span className={cn(
                                "text-xl font-bold",
                                combatant.currentDex === 0 && "text-destructive"
                              )}>
                                {combatant.currentDex}
                              </span>
                              <span className="text-xs text-muted-foreground">/{combatant.maxDex}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-full"
                              onClick={() => handleApplyDamage(combatant.id, 1, 'dex')}
                            >
                              -1
                            </Button>
                          </div>
                        </div>

                        {/* END */}
                        <div className="space-y-2">
                          <Label className="text-xs font-bold">END</Label>
                          <div className="flex flex-col items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-full"
                              onClick={() => handleHeal(combatant.id, 1, 'end')}
                            >
                              +1
                            </Button>
                            <div className="text-center">
                              <span className={cn(
                                "text-xl font-bold",
                                combatant.currentEnd === 0 && "text-destructive"
                              )}>
                                {combatant.currentEnd}
                              </span>
                              <span className="text-xs text-muted-foreground">/{combatant.maxEnd}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-full"
                              onClick={() => handleApplyDamage(combatant.id, 1, 'end')}
                            >
                              -1
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Economy */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-muted rounded">
                        <div className="text-xs text-muted-foreground">Actions</div>
                        <div className="text-lg font-bold">{combatant.actionsRemaining}/2</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="text-xs text-muted-foreground">Reactions</div>
                        <div className="text-lg font-bold">{combatant.reactionsRemaining}/1</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="text-xs text-muted-foreground">Movement</div>
                        <div className="text-lg font-bold">
                          {combatant.hasMovedThisRound ? '✓' : '○'}
                        </div>
                      </div>
                    </div>

                    {/* Combat Status */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Cover</Label>
                        <Select
                          value={combatant.cover}
                          onValueChange={(value: any) =>
                            handleUpdateCombatant(combatant.id, { cover: value })
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="partial">Partial</SelectItem>
                            <SelectItem value="full">Full</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">Range</Label>
                        <Select
                          value={combatant.range}
                          onValueChange={(value: any) =>
                            handleUpdateCombatant(combatant.id, { range: value })
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="close">Close</SelectItem>
                            <SelectItem value="short">Short</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="long">Long</SelectItem>
                            <SelectItem value="extreme">Extreme</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">Armor</Label>
                        <Input
                          type="number"
                          value={combatant.armor}
                          onChange={(e) =>
                            handleUpdateCombatant(combatant.id, {
                              armor: parseInt(e.target.value) || 0
                            })
                          }
                          className="h-8"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Add Combatant Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Combatant</DialogTitle>
            <DialogDescription>
              Add a character from your crew or create a new NPC
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={addType === 'character' ? 'default' : 'outline'}
                onClick={() => setAddType('character')}
              >
                Character
              </Button>
              <Button
                variant={addType === 'npc' ? 'default' : 'outline'}
                onClick={() => setAddType('npc')}
              >
                NPC
              </Button>
            </div>

            {addType === 'character' ? (
              <div className="space-y-2">
                <Label>Select Character</Label>
                <Select value={selectedCharacterId} onValueChange={setSelectedCharacterId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a character..." />
                  </SelectTrigger>
                  <SelectContent>
                    {characters.map(char => (
                      <SelectItem key={char.id} value={char.id}>
                        {char.name} (Initiative: {char.initiative || 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {characters.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No characters available. Create one in the Crew tab first.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={npcName}
                    onChange={(e) => setNpcName(e.target.value)}
                    placeholder="NPC Name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Initiative</Label>
                    <Input
                      type="number"
                      value={npcInitiative}
                      onChange={(e) => setNpcInitiative(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Armor</Label>
                    <Input
                      type="number"
                      value={npcArmor}
                      onChange={(e) => setNpcArmor(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Health Type Selection */}
                <div>
                  <Label>Health Type</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={npcHealthType === 'hits' ? 'default' : 'outline'}
                      onClick={() => setNpcHealthType('hits')}
                    >
                      Hits (Objects/Animals)
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={npcHealthType === 'characteristics' ? 'default' : 'outline'}
                      onClick={() => setNpcHealthType('characteristics')}
                    >
                      Characteristics (Sophonts)
                    </Button>
                  </div>
                </div>

                {/* Health Fields */}
                {npcHealthType === 'hits' ? (
                  <div>
                    <Label>Hits</Label>
                    <Input
                      type="number"
                      value={npcHits}
                      onChange={(e) => setNpcHits(parseInt(e.target.value) || 10)}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label>STR</Label>
                      <Input
                        type="number"
                        value={npcStr}
                        onChange={(e) => setNpcStr(parseInt(e.target.value) || 7)}
                      />
                    </div>
                    <div>
                      <Label>DEX</Label>
                      <Input
                        type="number"
                        value={npcDex}
                        onChange={(e) => setNpcDex(parseInt(e.target.value) || 7)}
                      />
                    </div>
                    <div>
                      <Label>END</Label>
                      <Input
                        type="number"
                        value={npcEnd}
                        onChange={(e) => setNpcEnd(parseInt(e.target.value) || 7)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={addType === 'character' ? handleAddCharacter : handleAddNPC}
              disabled={addType === 'character' ? !selectedCharacterId : !npcName.trim()}
            >
              Add Combatant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
