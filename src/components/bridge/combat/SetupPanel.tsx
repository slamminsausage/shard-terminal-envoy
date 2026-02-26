import { Button } from '@/components/ui/button';
import type { Contact } from '@/lib/bridge/bridgeTypes';
import { Plus, Gauge, Trash2, AlertTriangle } from 'lucide-react';

interface SetupPanelProps {
  combatants: Contact[];
  contacts: Contact[];
  onAddShipClick: () => void;
  onAddToCombat: (contactId: string) => void;
  onRemoveFromCombat: (contactId: string) => void;
  onRollInitiative: () => void;
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
          onClick={onRollInitiative}
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

      {/* Remove from combat */}
      {combatants.length > 0 && (
        <div className="space-y-1">
          <span className="text-terminal-text-dimmer text-[0.6rem] tracking-wider">IN COMBAT ({combatants.length})</span>
          {combatants.map(c => (
            <div key={c.id} className="flex justify-between items-center px-2 py-1 text-xs font-mono gap-1">
              <span className={`flex-1 ${c.isPlayerShip ? 'text-terminal-primary-light' : c.status === 'enemy' ? 'text-terminal-danger-alt' : 'text-terminal-secondary'}`}>
                {c.name}
              </span>
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
        </div>
      )}
    </div>
  );
}
