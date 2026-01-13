import React, { useState } from 'react';
import { Dices, X, Plus, Minus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  rollNormal,
  rollWithBoon,
  rollWithBane,
  rollDamageExpression,
  type BoonBaneRoll,
  type DamageRoll
} from '@/lib/dice';
import { cn } from '@/lib/utils';

interface RollHistoryEntry {
  id: string;
  timestamp: Date;
  type: 'skill' | 'damage';
  rollType?: 'normal' | 'boon' | 'bane';
  result: BoonBaneRoll | DamageRoll;
  modifiers: number;
  label?: string;
  total: number;
}

interface DiceRollerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DiceRoller({ isOpen, onClose }: DiceRollerProps) {
  const [rollType, setRollType] = useState<'normal' | 'boon' | 'bane'>('normal');
  const [modifier, setModifier] = useState<number>(0);
  const [damageExpression, setDamageExpression] = useState<string>('2d6');
  const [rollLabel, setRollLabel] = useState<string>('');
  const [history, setHistory] = useState<RollHistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'skill' | 'damage'>('skill');

  if (!isOpen) return null;

  const handleSkillRoll = () => {
    let result: BoonBaneRoll;

    switch (rollType) {
      case 'boon':
        result = rollWithBoon();
        break;
      case 'bane':
        result = rollWithBane();
        break;
      default:
        result = rollNormal();
    }

    const total = result.total + modifier;

    const entry: RollHistoryEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'skill',
      rollType,
      result,
      modifiers: modifier,
      label: rollLabel || undefined,
      total
    };

    setHistory([entry, ...history].slice(0, 20)); // Keep last 20 rolls
  };

  const handleDamageRoll = () => {
    const result = rollDamageExpression(damageExpression, modifier);

    const entry: RollHistoryEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'damage',
      result,
      modifiers: modifier,
      label: rollLabel || undefined,
      total: result.total
    };

    setHistory([entry, ...history].slice(0, 20));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const renderDiceDisplay = (roll: BoonBaneRoll) => {
    if (roll.type === 'normal') {
      return (
        <div className="flex gap-2 justify-center">
          {roll.kept.map((die, idx) => (
            <div
              key={idx}
              className="w-12 h-12 rounded-lg bg-primary/20 border-2 border-primary flex items-center justify-center text-2xl font-bold text-primary"
            >
              {die}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex gap-2 justify-center flex-wrap">
        {roll.rolls.map((die, idx) => {
          const isKept = roll.kept.includes(die) && (
            roll.kept.filter(d => d === die).length > roll.rolls.slice(0, idx).filter(d => d === die).length
          );
          const isDropped = die === roll.dropped && idx === roll.rolls.indexOf(roll.dropped);

          return (
            <div
              key={idx}
              className={cn(
                "w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all",
                isKept && "bg-primary/20 border-primary text-primary scale-110",
                isDropped && "bg-muted/50 border-muted-foreground/30 text-muted-foreground/50 line-through scale-90"
              )}
            >
              {die}
            </div>
          );
        })}
      </div>
    );
  };

  const renderHistoryEntry = (entry: RollHistoryEntry) => {
    if (entry.type === 'skill') {
      const result = entry.result as BoonBaneRoll;
      return (
        <div key={entry.id} className="p-3 bg-card/50 rounded-lg border border-border space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {entry.label && (
                <div className="text-sm font-medium text-foreground mb-1">{entry.label}</div>
              )}
              <div className="text-xs text-muted-foreground">
                {entry.rollType === 'boon' && '🎯 Boon'}
                {entry.rollType === 'bane' && '⚠️ Bane'}
                {entry.rollType === 'normal' && '🎲 Normal'}
                {' · '}
                {entry.timestamp.toLocaleTimeString()}
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {entry.total}
            </div>
          </div>
          <div className="flex gap-1 text-xs text-muted-foreground">
            {result.type !== 'normal' ? (
              <>
                Rolled: [{result.rolls.join(', ')}] → Kept: [{result.kept.join(', ')}]
                {entry.modifiers !== 0 && ` ${entry.modifiers >= 0 ? '+' : ''}${entry.modifiers}`}
              </>
            ) : (
              <>
                Rolled: {result.total}
                {entry.modifiers !== 0 && ` ${entry.modifiers >= 0 ? '+' : ''}${entry.modifiers}`}
              </>
            )}
          </div>
        </div>
      );
    } else {
      const result = entry.result as DamageRoll;
      return (
        <div key={entry.id} className="p-3 bg-card/50 rounded-lg border border-border space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {entry.label && (
                <div className="text-sm font-medium text-foreground mb-1">{entry.label}</div>
              )}
              <div className="text-xs text-muted-foreground">
                💥 Damage · {entry.timestamp.toLocaleTimeString()}
              </div>
            </div>
            <div className="text-2xl font-bold text-destructive">
              {entry.total}
            </div>
          </div>
          <div className="flex gap-1 text-xs text-muted-foreground">
            {result.expression}: [{result.diceResults.join(', ')}]
            {result.modifier !== 0 && ` ${result.modifier >= 0 ? '+' : ''}${result.modifier}`}
            {result.charMod !== 0 && ` ${result.charMod >= 0 ? '+' : ''}${result.charMod} (DM)`}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-2">
            <Dices className="w-5 h-5" />
            <CardTitle>Dice Roller</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto pt-4 space-y-4">
          {/* Tab Selection */}
          <div className="flex gap-2 border-b">
            <Button
              variant={activeTab === 'skill' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('skill')}
              className="rounded-b-none"
            >
              Skill Check
            </Button>
            <Button
              variant={activeTab === 'damage' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('damage')}
              className="rounded-b-none"
            >
              Damage Roll
            </Button>
          </div>

          {/* Skill Check Tab */}
          {activeTab === 'skill' && (
            <div className="space-y-4">
              {/* Roll Type Selection */}
              <div className="space-y-2">
                <Label>Roll Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={rollType === 'normal' ? 'default' : 'outline'}
                    onClick={() => setRollType('normal')}
                  >
                    Normal (2d6)
                  </Button>
                  <Button
                    variant={rollType === 'boon' ? 'default' : 'outline'}
                    onClick={() => setRollType('boon')}
                    className="text-green-600 dark:text-green-400"
                  >
                    🎯 Boon (3d6↑2)
                  </Button>
                  <Button
                    variant={rollType === 'bane' ? 'default' : 'outline'}
                    onClick={() => setRollType('bane')}
                    className="text-red-600 dark:text-red-400"
                  >
                    ⚠️ Bane (3d6↓2)
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {rollType === 'normal' && 'Roll 2d6 normally'}
                  {rollType === 'boon' && 'Roll 3d6, keep the best 2 dice'}
                  {rollType === 'bane' && 'Roll 3d6, keep the worst 2 dice'}
                </div>
              </div>

              {/* Modifier */}
              <div className="space-y-2">
                <Label>Modifiers (DM)</Label>
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setModifier(Math.max(modifier - 1, -10))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={modifier}
                    onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setModifier(Math.min(modifier + 1, 10))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Label */}
              <div className="space-y-2">
                <Label>Roll Label (Optional)</Label>
                <Input
                  placeholder="e.g., 'Electronics check', 'Melee attack'"
                  value={rollLabel}
                  onChange={(e) => setRollLabel(e.target.value)}
                />
              </div>

              {/* Roll Button */}
              <Button
                onClick={handleSkillRoll}
                className="w-full"
                size="lg"
              >
                <Dices className="w-4 h-4 mr-2" />
                Roll {rollType === 'normal' ? '2d6' : '3d6'}
              </Button>
            </div>
          )}

          {/* Damage Roll Tab */}
          {activeTab === 'damage' && (
            <div className="space-y-4">
              {/* Damage Expression */}
              <div className="space-y-2">
                <Label>Damage Expression</Label>
                <Input
                  placeholder="e.g., 2d6, 3d6+2, 1d6-1"
                  value={damageExpression}
                  onChange={(e) => setDamageExpression(e.target.value)}
                />
                <div className="text-xs text-muted-foreground">
                  Format: NdM+X (e.g., 2d6+2 for 2 six-sided dice plus 2)
                </div>
              </div>

              {/* Modifier */}
              <div className="space-y-2">
                <Label>Additional Modifier (DM)</Label>
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setModifier(Math.max(modifier - 1, -10))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={modifier}
                    onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setModifier(Math.min(modifier + 1, 10))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Label */}
              <div className="space-y-2">
                <Label>Roll Label (Optional)</Label>
                <Input
                  placeholder="e.g., 'Laser rifle damage', 'Blade attack'"
                  value={rollLabel}
                  onChange={(e) => setRollLabel(e.target.value)}
                />
              </div>

              {/* Roll Button */}
              <Button
                onClick={handleDamageRoll}
                className="w-full"
                size="lg"
                variant="destructive"
              >
                <Dices className="w-4 h-4 mr-2" />
                Roll Damage
              </Button>
            </div>
          )}

          {/* History Section */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">Roll History</h3>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                No rolls yet. Make your first roll!
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {history.map(renderHistoryEntry)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
