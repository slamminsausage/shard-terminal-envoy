import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Contact } from '@/lib/bridge/bridgeTypes';
import type { RepairState, SensorActionState, DogfightState, DockingState, MissileSalvo } from '@/types/shipCombatBridge';
import { CRITICAL_LOCATIONS, CRITICAL_LOCATION_LABELS, type CriticalLocation } from '@/lib/bridge/shipCombatRules';
import { getCriticalSeverity } from '@/hooks/useShipCombat';
import { Wrench, Radar, Swords, Anchor, Zap, Shield, Users, Navigation } from 'lucide-react';

interface ActionsPanelProps {
  combatants: Contact[];
  repairPlans: Record<string, RepairState>;
  sensorPlans: Record<string, SensorActionState>;
  dogfightPlans: Record<string, DogfightState>;
  dockingPlans: Record<string, DockingState>;
  sensorLocks: Record<string, string>;
  missileSalvos: MissileSalvo[];
  boardingPressure: Record<string, number>;
  onAttemptRepair: (shipId: string) => void;
  onAttemptSensorLock: (shipId: string) => void;
  onAttemptBreakSensorLock: (shipId: string) => void;
  onResolveDogfight: (shipId: string) => void;
  onAttemptDockOrBoard: (shipId: string) => void;
  onAttemptRepelBoarders: (shipId: string) => void;
  onAttemptJump: (shipId: string) => void;
  onAttemptImproveInitiative: (shipId: string) => void;
  onAttemptAidGunners: (shipId: string) => void;
  onAttemptOverloadDrive: (shipId: string) => void;
  onAttemptOverloadPlant: (shipId: string) => void;
  onResetOverloadPenalties: (shipId: string) => void;
  onAttemptPointDefense: (shipId: string, salvoId: string) => void;
  onAttemptMissileEW: (shipId: string, salvoId: string) => void;
  onUpdateRepairPlan: (shipId: string, updates: Partial<RepairState>) => void;
  onUpdateSensorPlan: (shipId: string, updates: Partial<SensorActionState>) => void;
  onUpdateDogfightPlan: (shipId: string, updates: Partial<DogfightState>) => void;
  onUpdateDockingPlan: (shipId: string, updates: Partial<DockingState>) => void;
}

export function ActionsPanel({
  combatants,
  repairPlans,
  sensorPlans,
  dogfightPlans,
  dockingPlans,
  sensorLocks,
  missileSalvos,
  boardingPressure,
  onAttemptRepair,
  onAttemptSensorLock,
  onAttemptBreakSensorLock,
  onResolveDogfight,
  onAttemptDockOrBoard,
  onAttemptRepelBoarders,
  onAttemptJump,
  onAttemptImproveInitiative,
  onAttemptAidGunners,
  onAttemptOverloadDrive,
  onAttemptOverloadPlant,
  onResetOverloadPenalties,
  onAttemptPointDefense,
  onAttemptMissileEW,
  onUpdateRepairPlan,
  onUpdateSensorPlan,
  onUpdateDogfightPlan,
  onUpdateDockingPlan,
}: ActionsPanelProps) {
  const [expandedShip, setExpandedShip] = useState<string | null>(null);
  const [actionTab, setActionTab] = useState<string>('repair');

  return (
    <div className="space-y-2 max-h-72 overflow-y-auto">
      <p className="text-terminal-text-dimmer text-[0.6rem] tracking-wider">
        CREW ACTIONS &middot; REPAIRS &middot; SPECIAL MANEUVERS
      </p>

      {combatants.map(ship => {
        const isExpanded = expandedShip === ship.id;
        const incomingSalvos = missileSalvos.filter(s => s.targetId === ship.id);
        const pressure = boardingPressure[ship.id] ?? 0;
        const hasCriticals = Object.keys(ship.criticals ?? {}).length > 0;

        return (
          <div key={ship.id} className="border border-terminal-bg-border rounded p-2 space-y-1">
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
              <div className="flex gap-1">
                {hasCriticals && <span className="text-[0.5rem] text-terminal-danger-alt">DMG</span>}
                {incomingSalvos.length > 0 && <span className="text-[0.5rem] text-yellow-300">MSL:{incomingSalvos.length}</span>}
                {pressure > 0 && <span className="text-[0.5rem] text-red-300">BRD:{pressure}</span>}
              </div>
            </button>

            {isExpanded && (
              <div className="space-y-1.5 pt-1 border-t border-terminal-bg-border/50">
                {/* Action tabs */}
                <div className="flex gap-1 flex-wrap">
                  {[
                    { key: 'repair', label: 'Repair', icon: Wrench },
                    { key: 'sensors', label: 'Sensors', icon: Radar },
                    { key: 'captain', label: 'Captain', icon: Users },
                    { key: 'engineer', label: 'Engineer', icon: Zap },
                    { key: 'combat', label: 'Combat', icon: Swords },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActionTab(tab.key)}
                      className={`px-1.5 py-0.5 text-[0.55rem] rounded border transition-all ${
                        actionTab === tab.key
                          ? 'border-terminal-primary/50 text-terminal-primary bg-terminal-primary/10'
                          : 'border-terminal-bg-border text-terminal-text-dimmer hover:border-terminal-primary/30'
                      }`}
                    >
                      <tab.icon className="h-2.5 w-2.5 inline mr-0.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Repair tab */}
                {actionTab === 'repair' && (
                  <div className="space-y-1">
                    <Select
                      value={repairPlans[ship.id]?.location || ''}
                      onValueChange={v => onUpdateRepairPlan(ship.id, { location: v as CriticalLocation | '' })}
                    >
                      <SelectTrigger className="h-6 text-[0.6rem] bg-black border-terminal-primary/30 text-terminal-primary px-1">
                        <SelectValue placeholder="Select system to repair" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">
                        {CRITICAL_LOCATIONS.filter(loc => getCriticalSeverity(ship, loc) > 0).map(loc => (
                          <SelectItem key={loc} value={loc} className="text-xs">
                            {CRITICAL_LOCATION_LABELS[loc]} (Sev: {getCriticalSeverity(ship, loc)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => onAttemptRepair(ship.id)}
                      disabled={!repairPlans[ship.id]?.location}
                      size="sm"
                      className="w-full bg-green-500/20 text-green-300 border border-green-500/50 hover:bg-green-500/30 text-xs h-6"
                    >
                      <Wrench className="h-2.5 w-2.5 mr-1" /> Attempt Repair
                    </Button>
                  </div>
                )}

                {/* Sensors tab */}
                {actionTab === 'sensors' && (
                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="space-y-0.5">
                        <label className="text-[0.55rem] text-terminal-primary/50">Lock Target</label>
                        <Select
                          value={sensorPlans[ship.id]?.lockTargetId || ''}
                          onValueChange={v => onUpdateSensorPlan(ship.id, { lockTargetId: v })}
                        >
                          <SelectTrigger className="h-6 text-[0.6rem] bg-black border-terminal-primary/30 text-terminal-primary px-1">
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">
                            {combatants.filter(c => c.id !== ship.id).map(c => (
                              <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={() => onAttemptSensorLock(ship.id)} size="sm" className="w-full text-[0.55rem] h-5 bg-blue-500/20 text-blue-300 border border-blue-500/50">
                          Lock
                        </Button>
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[0.55rem] text-terminal-primary/50">Break Lock From</label>
                        <Select
                          value={sensorPlans[ship.id]?.breakLockFromShipId || ''}
                          onValueChange={v => onUpdateSensorPlan(ship.id, { breakLockFromShipId: v })}
                        >
                          <SelectTrigger className="h-6 text-[0.6rem] bg-black border-terminal-primary/30 text-terminal-primary px-1">
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">
                            {combatants.filter(c => c.id !== ship.id && sensorLocks[c.id]).map(c => (
                              <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={() => onAttemptBreakSensorLock(ship.id)} size="sm" className="w-full text-[0.55rem] h-5 bg-orange-500/20 text-orange-300 border border-orange-500/50">
                          Break
                        </Button>
                      </div>
                    </div>
                    {/* Point defense / Missile EW */}
                    {incomingSalvos.length > 0 && (
                      <div className="space-y-0.5 border-t border-terminal-bg-border/50 pt-1">
                        <span className="text-[0.55rem] text-yellow-300">Incoming Missiles</span>
                        {incomingSalvos.map(salvo => (
                          <div key={salvo.id} className="flex gap-1 items-center text-[0.55rem]">
                            <span className="text-terminal-text-dimmer flex-1">
                              {salvo.missilesRemaining} missiles ({salvo.roundsToImpact}rnd)
                            </span>
                            <Button onClick={() => onAttemptPointDefense(ship.id, salvo.id)} size="sm" className="h-5 text-[0.5rem] px-1 bg-red-500/20 text-red-300 border border-red-500/50">
                              <Shield className="h-2 w-2 mr-0.5" />PD
                            </Button>
                            <Button onClick={() => onAttemptMissileEW(ship.id, salvo.id)} size="sm" className="h-5 text-[0.5rem] px-1 bg-purple-500/20 text-purple-300 border border-purple-500/50">
                              <Radar className="h-2 w-2 mr-0.5" />EW
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Captain tab */}
                {actionTab === 'captain' && (
                  <div className="space-y-1">
                    <Button onClick={() => onAttemptImproveInitiative(ship.id)} size="sm" className="w-full bg-blue-500/20 text-blue-300 border border-blue-500/50 text-[0.6rem] h-6">
                      Command: Improve Initiative
                    </Button>
                    <Button onClick={() => onAttemptAidGunners(ship.id)} size="sm" className="w-full bg-green-500/20 text-green-300 border border-green-500/50 text-[0.6rem] h-6">
                      Pilot: Aid Gunners
                    </Button>
                    {pressure > 0 && (
                      <Button onClick={() => onAttemptRepelBoarders(ship.id)} size="sm" className="w-full bg-red-500/20 text-red-300 border border-red-500/50 text-[0.6rem] h-6">
                        <Shield className="h-2.5 w-2.5 mr-1" /> Repel Boarders (Pressure: {pressure})
                      </Button>
                    )}
                  </div>
                )}

                {/* Engineer tab */}
                {actionTab === 'engineer' && (
                  <div className="space-y-1">
                    <Button onClick={() => onAttemptOverloadDrive(ship.id)} size="sm" className="w-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 text-[0.6rem] h-6">
                      <Zap className="h-2.5 w-2.5 mr-1" /> Overload M-Drive
                    </Button>
                    <Button onClick={() => onAttemptOverloadPlant(ship.id)} size="sm" className="w-full bg-orange-500/20 text-orange-300 border border-orange-500/50 text-[0.6rem] h-6">
                      <Zap className="h-2.5 w-2.5 mr-1" /> Overload Power Plant
                    </Button>
                    <Button onClick={() => onResetOverloadPenalties(ship.id)} size="sm" className="w-full bg-terminal-primary/20 text-terminal-primary border border-terminal-primary/50 text-[0.6rem] h-6">
                      Reset Overload Penalties
                    </Button>
                    <Button onClick={() => onAttemptJump(ship.id)} size="sm" className="w-full bg-purple-500/20 text-purple-300 border border-purple-500/50 text-[0.6rem] h-6">
                      <Navigation className="h-2.5 w-2.5 mr-1" /> Initiate Jump
                      {ship.jumpCommitted && ` (${ship.jumpChargeRounds}rnd)`}
                    </Button>
                  </div>
                )}

                {/* Combat tab - dogfight, dock, board */}
                {actionTab === 'combat' && (
                  <div className="space-y-1">
                    <div className="space-y-0.5">
                      <label className="text-[0.55rem] text-terminal-primary/50">Dogfight Target</label>
                      <div className="flex gap-1">
                        <Select
                          value={dogfightPlans[ship.id]?.targetId || ''}
                          onValueChange={v => onUpdateDogfightPlan(ship.id, { targetId: v })}
                        >
                          <SelectTrigger className="h-6 flex-1 text-[0.6rem] bg-black border-terminal-primary/30 text-terminal-primary px-1">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">
                            {combatants.filter(c => c.id !== ship.id).map(c => (
                              <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={() => onResolveDogfight(ship.id)} disabled={!dogfightPlans[ship.id]?.targetId} size="sm" className="h-6 text-[0.55rem] bg-red-500/20 text-red-300 border border-red-500/50">
                          <Swords className="h-2.5 w-2.5 mr-0.5" /> Fight
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[0.55rem] text-terminal-primary/50">Dock/Board Target</label>
                      <div className="flex gap-1">
                        <Select
                          value={dockingPlans[ship.id]?.targetId || ''}
                          onValueChange={v => onUpdateDockingPlan(ship.id, { targetId: v })}
                        >
                          <SelectTrigger className="h-6 flex-1 text-[0.6rem] bg-black border-terminal-primary/30 text-terminal-primary px-1">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">
                            {combatants.filter(c => c.id !== ship.id).map(c => (
                              <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={dockingPlans[ship.id]?.mode || 'dock'}
                          onValueChange={v => onUpdateDockingPlan(ship.id, { mode: v as 'dock' | 'board' })}
                        >
                          <SelectTrigger className="h-6 w-16 text-[0.6rem] bg-black border-terminal-primary/30 text-terminal-primary px-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">
                            <SelectItem value="dock" className="text-xs">Dock</SelectItem>
                            <SelectItem value="board" className="text-xs">Board</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={() => onAttemptDockOrBoard(ship.id)} disabled={!dockingPlans[ship.id]?.targetId} size="sm" className="h-6 text-[0.55rem] bg-orange-500/20 text-orange-300 border border-orange-500/50">
                          <Anchor className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
