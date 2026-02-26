import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { Contact } from '@/lib/bridge/bridgeTypes';
import type { AttackState } from '@/types/shipCombatBridge';
import { SHIP_WEAPON_PRESETS, RANGE_BAND_LABELS, CRITICAL_LOCATIONS, CRITICAL_LOCATION_LABELS, type CriticalLocation } from '@/lib/bridge/shipCombatRules';
import { hexDistance, hexDistanceToRangeBand } from '@/lib/bridge/hexCombatUtils';
import { Target } from 'lucide-react';

interface AttackPanelProps {
  combatants: Contact[];
  attackPlans: Record<string, AttackState>;
  sensorLocks: Record<string, string>;
  gunnerAssist: Record<string, number>;
  dogfightAttackModifiers: Record<string, number>;
  onUpdateAttackPlan: (shipId: string, updates: Partial<AttackState>) => void;
  onResolveAttack: (attackerId: string) => void;
}

export function AttackPanel({
  combatants,
  attackPlans,
  sensorLocks,
  gunnerAssist,
  dogfightAttackModifiers,
  onUpdateAttackPlan,
  onResolveAttack,
}: AttackPanelProps) {
  const [expandedShip, setExpandedShip] = useState<string | null>(null);

  return (
    <div className="space-y-2 max-h-72 overflow-y-auto">
      <p className="text-terminal-text-dimmer text-[0.6rem] tracking-wider">
        SELECT TARGETS &middot; CHOOSE WEAPONS &middot; FIRE
      </p>

      {combatants.map(ship => {
        const plan = attackPlans[ship.id];
        const isExpanded = expandedShip === ship.id;
        const target = plan?.targetId ? combatants.find(c => c.id === plan.targetId) : null;
        const rangeBand = target
          ? hexDistanceToRangeBand(hexDistance(ship.hexQ, ship.hexR, target.hexQ, target.hexR))
          : null;
        const weapon = SHIP_WEAPON_PRESETS.find(w => w.id === (plan?.weaponId ?? 'pulse_laser'));
        const hasLock = sensorLocks[ship.id] === plan?.targetId;
        const assist = gunnerAssist[ship.id] ?? 0;
        const dogfightMod = dogfightAttackModifiers[ship.id] ?? 0;

        return (
          <div key={ship.id} className="border border-terminal-bg-border rounded p-2 space-y-1.5">
            <button
              onClick={() => setExpandedShip(isExpanded ? null : ship.id)}
              className="w-full flex justify-between items-center text-xs"
            >
              <span className={`font-bold ${
                ship.isPlayerShip ? 'text-terminal-primary-light' :
                ship.status === 'enemy' ? 'text-terminal-danger-alt' : 'text-terminal-secondary'
              }`}>
                {ship.name}
              </span>
              <span className="text-terminal-text-dimmer text-[0.6rem]">
                Gunner: {ship.gunnerSkill ?? 0}
                {target ? ` | Target: ${target.name}` : ''}
              </span>
            </button>

            {isExpanded && (
              <div className="space-y-1.5 pt-1 border-t border-terminal-bg-border/50">
                {/* Target selection */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="space-y-0.5">
                    <label className="text-[0.55rem] text-terminal-primary/50">Target</label>
                    <Select
                      value={plan?.targetId || ''}
                      onValueChange={v => onUpdateAttackPlan(ship.id, { targetId: v })}
                    >
                      <SelectTrigger className="h-6 text-[0.6rem] bg-black border-terminal-primary/30 text-terminal-primary px-1">
                        <SelectValue placeholder="Select target" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">
                        {combatants.filter(c => c.id !== ship.id && (c.hullCurrent ?? 1) > 0).map(c => (
                          <SelectItem key={c.id} value={c.id} className="text-xs">
                            {c.name} ({c.hullCurrent ?? 0}/{c.hullMax ?? 0} HP)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[0.55rem] text-terminal-primary/50">Weapon</label>
                    <Select
                      value={plan?.weaponId || 'pulse_laser'}
                      onValueChange={v => onUpdateAttackPlan(ship.id, { weaponId: v })}
                    >
                      <SelectTrigger className="h-6 text-[0.6rem] bg-black border-terminal-primary/30 text-terminal-primary px-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">
                        {SHIP_WEAPON_PRESETS.map(w => (
                          <SelectItem key={w.id} value={w.id} className="text-xs">
                            {w.name} ({w.damage})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Modifiers row */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="space-y-0.5">
                    <label className="text-[0.55rem] text-terminal-primary/50">Situational DM</label>
                    <Input
                      type="number"
                      value={plan?.situationalDM ?? 0}
                      onChange={e => onUpdateAttackPlan(ship.id, { situationalDM: parseInt(e.target.value) || 0 })}
                      className="h-6 text-[0.6rem] bg-black border-terminal-primary/30 text-terminal-primary px-1"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[0.55rem] text-terminal-primary/50">Called Shot</label>
                    <Select
                      value={plan?.calledShotLocation || 'none'}
                      onValueChange={v => onUpdateAttackPlan(ship.id, { calledShotLocation: v as CriticalLocation | 'none' })}
                    >
                      <SelectTrigger className="h-6 text-[0.6rem] bg-black border-terminal-primary/30 text-terminal-primary px-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">
                        <SelectItem value="none" className="text-xs">None</SelectItem>
                        {CRITICAL_LOCATIONS.map(loc => (
                          <SelectItem key={loc} value={loc} className="text-xs">{CRITICAL_LOCATION_LABELS[loc]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Info badges */}
                <div className="flex gap-1 flex-wrap text-[0.55rem]">
                  {rangeBand && (
                    <span className="px-1 py-0.5 rounded bg-terminal-primary/10 text-terminal-primary/70">
                      Range: {RANGE_BAND_LABELS[rangeBand]}
                    </span>
                  )}
                  {weapon && (
                    <span className="px-1 py-0.5 rounded bg-terminal-primary/10 text-terminal-primary/70">
                      DM+{weapon.attackModifier}
                    </span>
                  )}
                  {hasLock && (
                    <span className="px-1 py-0.5 rounded bg-yellow-500/10 text-yellow-300">
                      Lock +2
                    </span>
                  )}
                  {assist > 0 && (
                    <span className="px-1 py-0.5 rounded bg-blue-500/10 text-blue-300">
                      Aid +{assist}
                    </span>
                  )}
                  {dogfightMod !== 0 && (
                    <span className={`px-1 py-0.5 rounded ${dogfightMod > 0 ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                      Dogfight {dogfightMod > 0 ? '+' : ''}{dogfightMod}
                    </span>
                  )}
                </div>

                {/* Fire button */}
                <Button
                  onClick={() => onResolveAttack(ship.id)}
                  disabled={!plan?.targetId}
                  size="sm"
                  className="w-full bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30 text-xs h-7"
                >
                  <Target className="h-3 w-3 mr-1" /> FIRE {weapon?.name?.toUpperCase()}
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
