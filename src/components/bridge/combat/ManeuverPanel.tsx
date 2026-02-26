import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Contact } from '@/lib/bridge/bridgeTypes';
import { getEffectiveThrust } from '@/hooks/useShipCombat';
import { Crosshair, Gauge } from 'lucide-react';

interface ManeuverPanelProps {
  combatants: Contact[];
  onUpdateManeuver: (contactId: string, fields: {
    movementAllocation?: number;
    evasiveAllocation?: number;
    maneuverIntent?: 'hold' | 'close' | 'open';
    thrust?: number;
  }) => void;
  onApplyManeuver: () => void;
}

export function ManeuverPanel({ combatants, onUpdateManeuver, onApplyManeuver }: ManeuverPanelProps) {
  return (
    <div className="space-y-3">
      <p className="text-terminal-text-dimmer text-[0.6rem] tracking-wider">
        ALLOCATE THRUST &middot; CLICK HEXES TO MOVE SHIPS
      </p>

      <div className="space-y-2 max-h-[32rem] overflow-y-auto">
        {combatants.map(ship => {
          const baseThrust = ship.thrust ?? 0;
          const effectiveThrust = getEffectiveThrust(ship);
          const allocated = (ship.movementAllocation ?? 0) + (ship.evasiveAllocation ?? 0);
          const remaining = effectiveThrust - allocated;
          const pilotSkill = ship.pilotSkill ?? 0;
          const maxEvasive = Math.min(effectiveThrust, pilotSkill);

          return (
            <div key={ship.id} className="border border-terminal-bg-border rounded p-2 space-y-2">
              {/* Ship name + effective thrust summary */}
              <div className="flex justify-between items-center">
                <span className={`text-xs font-bold ${
                  ship.isPlayerShip ? 'text-terminal-primary-light' :
                  ship.status === 'enemy' ? 'text-terminal-danger-alt' : 'text-terminal-secondary'
                }`}>
                  {ship.name}
                </span>
                <span className={`text-[0.6rem] font-mono ${remaining < 0 ? 'text-terminal-danger-alt' : 'text-terminal-text-dimmer'}`}>
                  Effective: {effectiveThrust} &nbsp;|&nbsp; Remaining: {remaining}
                </span>
              </div>

              {/* M-Drive Rating row */}
              <div className="flex items-center gap-2 bg-terminal-bg-panel-alt rounded px-2 py-1">
                <Gauge className="h-3 w-3 text-terminal-primary/50 flex-shrink-0" />
                <span className="text-[0.6rem] text-terminal-primary/60 flex-shrink-0">M-Drive Rating</span>
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => onUpdateManeuver(ship.id, { thrust: Math.max(0, baseThrust - 1) })}
                    className="px-1.5 py-0.5 text-[0.6rem] bg-terminal-bg-border rounded hover:bg-terminal-primary/10 text-terminal-primary"
                  >-</button>
                  <span className="text-xs text-terminal-primary font-bold text-center w-5">{baseThrust}</span>
                  <button
                    onClick={() => onUpdateManeuver(ship.id, { thrust: baseThrust + 1 })}
                    className="px-1.5 py-0.5 text-[0.6rem] bg-terminal-bg-border rounded hover:bg-terminal-primary/10 text-terminal-primary"
                  >+</button>
                </div>
                {ship.activeThrustBoost ? (
                  <span className="text-[0.55rem] text-yellow-400 ml-1">+{ship.activeThrustBoost} boost</span>
                ) : null}
              </div>

              {/* Thrust allocation row */}
              <div className="grid grid-cols-3 gap-1.5">
                {/* Movement */}
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

                {/* Evasive */}
                <div className="space-y-0.5">
                  <label className="text-[0.55rem] text-terminal-primary/50 leading-tight">
                    Evasive{maxEvasive > 0 ? <span className="text-yellow-400/70"> (max {maxEvasive})</span> : null}
                  </label>
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

                {/* Intent */}
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

              {/* Evasive effect hint */}
              {(ship.evasiveAllocation ?? 0) > 0 && (
                <p className="text-[0.55rem] text-yellow-400/70">
                  Evasive {ship.evasiveAllocation} applies -{Math.min(ship.evasiveAllocation ?? 0, pilotSkill)} to attacks against this ship (capped by Pilot {pilotSkill})
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Button
        onClick={onApplyManeuver}
        size="sm"
        className="w-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 hover:bg-yellow-500/30 text-xs"
      >
        <Crosshair className="h-3 w-3 mr-1" /> Apply Maneuvers → Attack Phase
      </Button>
    </div>
  );
}
