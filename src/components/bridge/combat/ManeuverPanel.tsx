import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Contact } from '@/lib/bridge/bridgeTypes';
import { getEffectiveThrust } from '@/hooks/useShipCombat';
import { Crosshair } from 'lucide-react';

interface ManeuverPanelProps {
  combatants: Contact[];
  onUpdateManeuver: (contactId: string, fields: {
    movementAllocation?: number;
    evasiveAllocation?: number;
    maneuverIntent?: 'hold' | 'close' | 'open';
  }) => void;
  onApplyManeuver: () => void;
}

export function ManeuverPanel({ combatants, onUpdateManeuver, onApplyManeuver }: ManeuverPanelProps) {
  return (
    <div className="space-y-3">
      <p className="text-terminal-text-dimmer text-[0.6rem] tracking-wider">
        ALLOCATE THRUST &middot; CLICK HEXES TO MOVE SHIPS
      </p>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {combatants.map(ship => {
          const effectiveThrust = getEffectiveThrust(ship);
          const allocated = (ship.movementAllocation ?? 0) + (ship.evasiveAllocation ?? 0);
          const remaining = effectiveThrust - allocated;

          return (
            <div key={ship.id} className="border border-terminal-bg-border rounded p-2 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className={`text-xs font-bold ${
                  ship.isPlayerShip ? 'text-terminal-primary-light' :
                  ship.status === 'enemy' ? 'text-terminal-danger-alt' : 'text-terminal-secondary'
                }`}>
                  {ship.name}
                </span>
                <span className="text-[0.6rem] text-terminal-text-dimmer">
                  Thrust: {effectiveThrust} | Remaining: {remaining}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <div className="space-y-0.5">
                  <label className="text-[0.55rem] text-terminal-primary/50">Movement</label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onUpdateManeuver(ship.id, { movementAllocation: Math.max(0, (ship.movementAllocation ?? 0) - 1) })}
                      className="px-1.5 py-0.5 text-[0.6rem] bg-terminal-bg-border rounded hover:bg-terminal-primary/10 text-terminal-primary"
                    >-</button>
                    <span className="text-xs text-terminal-primary text-center flex-1">{ship.movementAllocation ?? 0}</span>
                    <button
                      onClick={() => onUpdateManeuver(ship.id, { movementAllocation: Math.min(effectiveThrust, (ship.movementAllocation ?? 0) + 1) })}
                      disabled={remaining <= 0}
                      className="px-1.5 py-0.5 text-[0.6rem] bg-terminal-bg-border rounded hover:bg-terminal-primary/10 text-terminal-primary disabled:opacity-30"
                    >+</button>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[0.55rem] text-terminal-primary/50">Evasive</label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onUpdateManeuver(ship.id, { evasiveAllocation: Math.max(0, (ship.evasiveAllocation ?? 0) - 1) })}
                      className="px-1.5 py-0.5 text-[0.6rem] bg-terminal-bg-border rounded hover:bg-terminal-primary/10 text-terminal-primary"
                    >-</button>
                    <span className="text-xs text-terminal-primary text-center flex-1">{ship.evasiveAllocation ?? 0}</span>
                    <button
                      onClick={() => onUpdateManeuver(ship.id, { evasiveAllocation: Math.min(effectiveThrust, (ship.evasiveAllocation ?? 0) + 1) })}
                      disabled={remaining <= 0}
                      className="px-1.5 py-0.5 text-[0.6rem] bg-terminal-bg-border rounded hover:bg-terminal-primary/10 text-terminal-primary disabled:opacity-30"
                    >+</button>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[0.55rem] text-terminal-primary/50">Intent</label>
                  <Select
                    value={ship.maneuverIntent ?? 'hold'}
                    onValueChange={(v) => onUpdateManeuver(ship.id, { maneuverIntent: v as 'hold' | 'close' | 'open' })}
                  >
                    <SelectTrigger className="h-6 text-[0.6rem] bg-black border-terminal-primary/30 text-terminal-primary px-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">
                      <SelectItem value="hold" className="text-xs">Hold</SelectItem>
                      <SelectItem value="close" className="text-xs">Close</SelectItem>
                      <SelectItem value="open" className="text-xs">Open</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        onClick={onApplyManeuver}
        size="sm"
        className="w-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 hover:bg-yellow-500/30 text-xs"
      >
        <Crosshair className="h-3 w-3 mr-1" /> Apply Maneuvers
      </Button>
    </div>
  );
}
