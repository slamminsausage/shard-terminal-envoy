import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Heart, Shield, RefreshCw, ArrowUp, ArrowDown, User } from 'lucide-react';
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

  // Health
  lifeblood: number;
  lifebloodMax: number;
  stamina: number;
  staminaMax: number;

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
  const { characters } = useCampaign();
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addType, setAddType] = useState<'character' | 'npc'>('character');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');

  // NPC creation fields
  const [npcName, setNpcName] = useState('');
  const [npcInitiative, setNpcInitiative] = useState(0);
  const [npcLifeblood, setNpcLifeblood] = useState(10);
  const [npcStamina, setNpcStamina] = useState(10);
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
      lifeblood: character.lifeblood,
      lifebloodMax: character.lifeblood,
      stamina: character.stamina,
      staminaMax: character.stamina,
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
      lifeblood: npcLifeblood,
      lifebloodMax: npcLifeblood,
      stamina: npcStamina,
      staminaMax: npcStamina,
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
    setNpcLifeblood(10);
    setNpcStamina(10);
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

  const handleApplyDamage = (id: string, damage: number, targetStamina: boolean = true) => {
    setCombatants(combatants.map(c => {
      if (c.id !== id) return c;

      let newLifeblood = c.lifeblood;
      let newStamina = c.stamina;
      let isDowned = false;

      if (targetStamina && c.stamina > 0) {
        // Damage stamina first
        newStamina = Math.max(0, c.stamina - damage);
        const overflow = damage - c.stamina;
        if (overflow > 0) {
          newLifeblood = Math.max(0, c.lifeblood - overflow);
        }
      } else {
        // Damage lifeblood directly
        newLifeblood = Math.max(0, c.lifeblood - damage);
      }

      // Check if downed (lifeblood at 0)
      if (newLifeblood === 0) {
        isDowned = true;
      }

      return {
        ...c,
        lifeblood: newLifeblood,
        stamina: newStamina,
        isDowned
      };
    }));
  };

  const handleHeal = (id: string, amount: number, healStamina: boolean = true) => {
    setCombatants(combatants.map(c => {
      if (c.id !== id) return c;

      if (healStamina) {
        return {
          ...c,
          stamina: Math.min(c.staminaMax, c.stamina + amount)
        };
      } else {
        return {
          ...c,
          lifeblood: Math.min(c.lifebloodMax, c.lifeblood + amount),
          isDowned: false
        };
      }
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
            <span className="text-3xl">🔫</span>
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
            <div className="text-6xl mb-4">🔫</div>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-red-500" />
                          Lifeblood
                        </Label>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApplyDamage(combatant.id, 1, false)}
                          >
                            -1
                          </Button>
                          <div className="flex-1 text-center">
                            <span className={cn(
                              "text-2xl font-bold",
                              combatant.lifeblood === 0 && "text-destructive"
                            )}>
                              {combatant.lifeblood}
                            </span>
                            <span className="text-muted-foreground">/{combatant.lifebloodMax}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleHeal(combatant.id, 1, false)}
                          >
                            +1
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-blue-500" />
                          Stamina
                        </Label>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApplyDamage(combatant.id, 1, true)}
                          >
                            -1
                          </Button>
                          <div className="flex-1 text-center">
                            <span className="text-2xl font-bold">{combatant.stamina}</span>
                            <span className="text-muted-foreground">/{combatant.staminaMax}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleHeal(combatant.id, 1, true)}
                          >
                            +1
                          </Button>
                        </div>
                      </div>
                    </div>

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
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Lifeblood</Label>
                    <Input
                      type="number"
                      value={npcLifeblood}
                      onChange={(e) => setNpcLifeblood(parseInt(e.target.value) || 10)}
                    />
                  </div>
                  <div>
                    <Label>Stamina</Label>
                    <Input
                      type="number"
                      value={npcStamina}
                      onChange={(e) => setNpcStamina(parseInt(e.target.value) || 10)}
                    />
                  </div>
                </div>
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
