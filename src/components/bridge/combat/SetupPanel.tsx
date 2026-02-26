import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Contact } from '@/lib/bridge/bridgeTypes';
import { Plus, Gauge, Trash2, AlertTriangle, Dice6 } from 'lucide-react';

interface SetupPanelProps {
  combatants: Contact[];
  contacts: Contact[];
  onAddShipClick: () => void;
  onAddToCombat: (contactId: string) => void;
  onRemoveFromCombat: (contactId: string) => void;
  onRollInitiative: (manualRolls?: Record<string, number>) => void;
  onToggleSurprised: (contactId: string, val: boolean) => void;
}

export function SetupPanel({
  combatants,
  contacts,
  onAddShipClick,
  onAddToCombat,
  onRemoveFromCombat,
  onRollInitiative,
  onToggleSurprised,
}: SetupPanelProps) {
  const nonCombatContacts = contacts.filter(c => !c.isInCombat);
  // Per-ship initiative roll inputs (empty string = auto-roll)
  const [initiativeInputs, setInitiativeInputs] = useState<Record<string, string>>({});

  const handleRollInitiative = () => {
    const manualRolls: Record<string, number> = {};
    let hasAny = false;
    for (const [shipId, raw] of Object.entries(initiativeInputs)) {
      if (raw !== '') {
        const n = parseInt(raw);
        if (!isNaN(n)) {
          manualRolls[shipId] = n;
          hasAny = true;
        }
      }
    }
    onRollInitiative(hasAny ? manualRolls : undefined);
    setInitiativeInputs({});
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          onClick={onAddShipClick}
          size="sm"
          className="flex-1 bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" /> Add Ship
        </Button>
        <Button
          onClick={handleRollInitiative}
          disabled={combatants.length < 2}
          size="sm"
          className="flex-1 bg-blue-500/20 text-blue-300 border border-blue-500/50 hover:bg-blue-500/30 text-xs"
        >
          <Gauge className="h-3 w-3 mr-1" /> Roll Initiative
        </Button>
      </div>

      {/* Add existing contacts to combat */}
      {nonCombatContacts.length > 0 && (
        <div className="space-y-1">
          <span className="text-terminal-text-dimmer text-[0.6rem] tracking-wider">ADD EXISTING CONTACTS</span>
          {nonCombatContacts.map(c => (
            <button
              key={c.id}
              onClick={() => onAddToCombat(c.id)}
              className="w-full flex justify-between items-center px-2 py-1 text-xs font-mono text-terminal-text-dimmer hover:text-terminal-primary hover:bg-terminal-primary/5 rounded transition-all"
            >
              <span>{c.name}</span>
              <Plus className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}

      {/* Combatants with per-ship controls */}
      {combatants.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-terminal-text-dimmer text-[0.6rem] tracking-wider">IN COMBAT ({combatants.length})</span>
            <div className="flex items-center gap-1 text-[0.55rem] text-terminal-primary/40">
              <Dice6 className="h-2.5 w-2.5" />
              <span>initiative 2d6</span>
            </div>
          </div>
          {combatants.map(c => (
            <div key={c.id} className="flex justify-between items-center px-2 py-1 text-xs font-mono gap-1">
              <span className={`flex-1 truncate ${c.isPlayerShip ? 'text-terminal-primary-light' : c.status === 'enemy' ? 'text-terminal-danger-alt' : 'text-terminal-secondary'}`}>
                {c.name}
              </span>

              {/* Per-ship initiative roll input */}
              <Input
                type="number"
                min={2}
                max={12}
                placeholder="auto"
                value={initiativeInputs[c.id] ?? ''}
                onChange={e => setInitiativeInputs(prev => ({ ...prev, [c.id]: e.target.value }))}
                className="h-5 w-10 text-[0.55rem] bg-black border-terminal-primary/30 text-terminal-primary px-1 text-center placeholder:text-terminal-text-dimmer/40"
                title={`Manual initiative roll for ${c.name} (leave blank to auto-roll)`}
              />

              {/* Surprised toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSurprised(c.id, !c.surprised);
                }}
                className={`flex items-center gap-0.5 px-1.5 py-0.5 text-[0.55rem] rounded border transition-colors ${
                  c.surprised
                    ? 'border-yellow-500/70 text-yellow-300 bg-yellow-500/15'
                    : 'border-terminal-bg-border text-terminal-text-dimmer hover:border-yellow-500/40 hover:text-yellow-300/60'
                }`}
                title="Toggle surprised (ship cannot attack round 1)"
              >
                <AlertTriangle className="h-2.5 w-2.5" />
                {c.surprised ? 'SURP' : 'surp'}
              </button>

              {/* Remove from combat */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromCombat(c.id);
                }}
                className="p-1 text-terminal-text-dimmer hover:text-terminal-danger-alt hover:bg-terminal-danger-alt/10 rounded transition-colors"
                title="Remove from combat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {combatants.some(c => initiativeInputs[c.id]) && (
            <p className="text-[0.55rem] text-yellow-300/60 px-2">
              Ships with values use manual rolls; blank = auto-roll
            </p>
          )}
        </div>
      )}
    </div>
  );
}
