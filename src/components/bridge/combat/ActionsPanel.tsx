import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { Contact } from '@/lib/bridge/bridgeTypes';
import type { RepairState, SensorActionState, DogfightState, DockingState, MissileSalvo } from '@/types/shipCombatBridge';
import { CRITICAL_LOCATIONS, CRITICAL_LOCATION_LABELS, type CriticalLocation } from '@/lib/bridge/shipCombatRules';
import { getCriticalSeverity } from '@/hooks/useShipCombat';
import { Wrench, Radar, Swords, Anchor, Zap, Shield, Users, Navigation, Dice6 } from 'lucide-react';

interface ActionsPanelProps {
  combatants: Contact[];
  repairPlans: Record<string, RepairState>;
  sensorPlans: Record<string, SensorActionState>;
  dogfightPlans: Record<string, DogfightState>;
  dockingPlans: Record<string, DockingState>;
  sensorLocks: Record<string, string>;
  missileSalvos: MissileSalvo[];
  boardingPressure: Record<string, number>;
  onAttemptRepair: (shipId: string, manualRoll?: number) => void;
  onAttemptSensorLock: (shipId: string, manualRoll?: number) => void;
  onAttemptBreakSensorLock: (shipId: string, manualOwnRoll?: number, manualEnemyRoll?: number) => void;
  onResolveDogfight: (shipId: string, manualShipRoll?: number, manualTargetRoll?: number) => void;
  onAttemptDockOrBoard: (shipId: string, manualActorRoll?: number, manualBoardingRoll?: number) => void;
  onAttemptRepelBoarders: (shipId: string, manualRoll?: number) => void;
  onAttemptJump: (shipId: string, manualRoll?: number) => void;
  onAttemptImproveInitiative: (shipId: string, manualRoll?: number) => void;
  onAttemptAidGunners: (shipId: string, manualRoll?: number) => void;
  onAttemptOverloadDrive: (shipId: string, manualRoll?: number) => void;
  onAttemptOverloadPlant: (shipId: string, manualRoll?: number) => void;
  onResetOverloadPenalties: (shipId: string) => void;
  onAttemptPointDefense: (shipId: string, salvoId: string, manualRoll?: number) => void;
  onAttemptMissileEW: (shipId: string, salvoId: string, manualRoll?: number) => void;
  onUpdateRepairPlan: (shipId: string, updates: Partial<RepairState>) => void;
  onUpdateSensorPlan: (shipId: string, updates: Partial<SensorActionState>) => void;
  onUpdateDogfightPlan: (shipId: string, updates: Partial<DogfightState>) => void;
  onUpdateDockingPlan: (shipId: string, updates: Partial<DockingState>) => void;
}

// Per-ship, per-action roll state key format: `${shipId}:${actionKey}`
// actionKeys: repair, sensorLock, breakOwn, breakEnemy, dogfightSelf, dogfightTarget,
//             dockActor, dockBoard, repelBoarders, jump, improveInit, aidGunners,
//             overloadDrive, overloadPlant, pd:{salvoId}, ew:{salvoId}

function useManualRolls() {
  const [rolls, setRolls] = useState<Record<string, string>>({});
  const get = (key: string): number | undefined => {
    const v = rolls[key];
    if (v === undefined || v === '') return undefined;
    const n = parseInt(v, 10);
    return isNaN(n) ? undefined : n;
  };
  const set = (key: string, val: string) => setRolls(prev => ({ ...prev, [key]: val }));
  const clear = (...keys: string[]) => setRolls(prev => {
    const n = { ...prev };
    keys.forEach(k => delete n[k]);
    return n;
  });
  return { rolls, get, set, clear };
}

function RollInput({ label, value, onChange, className = '' }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-0.5 ${className}`}>
      <span className="text-[0.5rem] text-terminal-primary/40 leading-none">{label}</span>
      <Input
        type="number"
        min={2}
        max={12}
        placeholder="auto"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-5 w-8 text-[0.55rem] bg-black border-terminal-primary/30 text-terminal-primary px-1 text-center placeholder:text-terminal-text-dimmer/40"
      />
    </div>
  );
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
  const [actionTabs, setActionTabs] = useState<Record<string, string>>({});
  const getActionTab = (shipId: string) => actionTabs[shipId] ?? 'repair';
  const setActionTab = (shipId: string, tab: string) => setActionTabs(prev => ({ ...prev, [shipId]: tab }));
  const { rolls, get, set, clear } = useManualRolls();
  const k = (shipId: string, action: string) => `${shipId}:${action}`;

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
        const sid = ship.id;

        return (
          <div key={sid} className="border border-terminal-bg-border rounded p-2 space-y-1">
            <button
              onClick={() => setExpandedShip(isExpanded ? null : sid)}
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
                      onClick={() => setActionTab(sid, tab.key)}
                      className={`px-1.5 py-0.5 text-[0.55rem] rounded border transition-all ${
                        getActionTab(sid) === tab.key
                          ? 'border-terminal-primary/50 text-terminal-primary bg-terminal-primary/10'
                          : 'border-terminal-bg-border text-terminal-text-dimmer hover:border-terminal-primary/30'
                      }`}
                    >
                      <tab.icon className="h-2.5 w-2.5 inline mr-0.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* ── Repair tab ── */}
                {getActionTab(sid) === 'repair' && (
                  <div className="space-y-1">
                    <Select
                      value={repairPlans[sid]?.location || ''}
                      onValueChange={v => onUpdateRepairPlan(sid, { location: v as CriticalLocation | '' })}
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
                    <div className="flex items-end gap-1">
                      <RollInput label="2d6" value={rolls[k(sid, 'repair')] ?? ''} onChange={v => set(k(sid, 'repair'), v)} />
                      <Button
                        onClick={() => { onAttemptRepair(sid, get(k(sid, 'repair'))); clear(k(sid, 'repair')); }}
                        disabled={!repairPlans[sid]?.location}
                        size="sm"
                        className="flex-1 bg-green-500/20 text-green-300 border border-green-500/50 hover:bg-green-500/30 text-xs h-6"
                      >
                        <Wrench className="h-2.5 w-2.5 mr-1" /> Attempt Repair
                        {get(k(sid, 'repair')) !== undefined && <span className="ml-1 text-yellow-300/70">[manual]</span>}
                      </Button>
                    </div>
                  </div>
                )}

                {/* ── Sensors tab ── */}
                {getActionTab(sid) === 'sensors' && (
                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="space-y-0.5">
                        <label className="text-[0.55rem] text-terminal-primary/50">Lock Target</label>
                        <Select
                          value={sensorPlans[sid]?.lockTargetId || ''}
                          onValueChange={v => onUpdateSensorPlan(sid, { lockTargetId: v })}
                        >
                          <SelectTrigger className="h-6 text-[0.6rem] bg-black border-terminal-primary/30 text-terminal-primary px-1">
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">
                            {combatants.filter(c => c.id !== sid && (c.hullCurrent ?? 1) > 0).map(c => (
                              <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-end gap-1">
                          <RollInput label="2d6" value={rolls[k(sid, 'sensorLock')] ?? ''} onChange={v => set(k(sid, 'sensorLock'), v)} />
                          <Button
                            onClick={() => { onAttemptSensorLock(sid, get(k(sid, 'sensorLock'))); clear(k(sid, 'sensorLock')); }}
                            size="sm"
                            className="flex-1 text-[0.55rem] h-5 bg-blue-500/20 text-blue-300 border border-blue-500/50"
                          >
                            Lock{get(k(sid, 'sensorLock')) !== undefined && <span className="ml-0.5 text-yellow-300/70">*</span>}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[0.55rem] text-terminal-primary/50">Break Lock From</label>
                        <Select
                          value={sensorPlans[sid]?.breakLockFromShipId || ''}
                          onValueChange={v => onUpdateSensorPlan(sid, { breakLockFromShipId: v })}
                        >
                          <SelectTrigger className="h-6 text-[0.6rem] bg-black border-terminal-primary/30 text-terminal-primary px-1">
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">
                            {combatants.filter(c => c.id !== sid && sensorLocks[c.id]).map(c => (
                              <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-end gap-0.5">
                          <RollInput label="own" value={rolls[k(sid, 'breakOwn')] ?? ''} onChange={v => set(k(sid, 'breakOwn'), v)} />
                          <RollInput label="enemy" value={rolls[k(sid, 'breakEnemy')] ?? ''} onChange={v => set(k(sid, 'breakEnemy'), v)} />
                          <Button
                            onClick={() => { onAttemptBreakSensorLock(sid, get(k(sid, 'breakOwn')), get(k(sid, 'breakEnemy'))); clear(k(sid, 'breakOwn'), k(sid, 'breakEnemy')); }}
                            size="sm"
                            className="flex-1 text-[0.55rem] h-5 bg-orange-500/20 text-orange-300 border border-orange-500/50"
                          >
                            Break{(get(k(sid, 'breakOwn')) !== undefined || get(k(sid, 'breakEnemy')) !== undefined) && <span className="ml-0.5 text-yellow-300/70">*</span>}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Point defense / Missile EW */}
                    {incomingSalvos.length > 0 && (
                      <div className="space-y-0.5 border-t border-terminal-bg-border/50 pt-1">
                        <span className="text-[0.55rem] text-yellow-300">Incoming Missiles</span>
                        {incomingSalvos.map(salvo => (
                          <div key={salvo.id} className="space-y-0.5">
                            <span className="text-terminal-text-dimmer text-[0.55rem]">
                              {salvo.missilesRemaining} missiles ({salvo.roundsToImpact}rnd)
                            </span>
                            <div className="flex items-end gap-1">
                              <RollInput label="2d6" value={rolls[k(sid, `pd:${salvo.id}`)] ?? ''} onChange={v => set(k(sid, `pd:${salvo.id}`), v)} />
                              <Button
                                onClick={() => { onAttemptPointDefense(sid, salvo.id, get(k(sid, `pd:${salvo.id}`))); clear(k(sid, `pd:${salvo.id}`)); }}
                                size="sm"
                                className="flex-1 h-5 text-[0.5rem] px-1 bg-red-500/20 text-red-300 border border-red-500/50"
                              >
                                <Shield className="h-2 w-2 mr-0.5" />PD{get(k(sid, `pd:${salvo.id}`)) !== undefined && <span className="ml-0.5 text-yellow-300/70">*</span>}
                              </Button>
                              <RollInput label="2d6" value={rolls[k(sid, `ew:${salvo.id}`)] ?? ''} onChange={v => set(k(sid, `ew:${salvo.id}`), v)} />
                              <Button
                                onClick={() => { onAttemptMissileEW(sid, salvo.id, get(k(sid, `ew:${salvo.id}`))); clear(k(sid, `ew:${salvo.id}`)); }}
                                size="sm"
                                className="flex-1 h-5 text-[0.5rem] px-1 bg-purple-500/20 text-purple-300 border border-purple-500/50"
                              >
                                <Radar className="h-2 w-2 mr-0.5" />EW{get(k(sid, `ew:${salvo.id}`)) !== undefined && <span className="ml-0.5 text-yellow-300/70">*</span>}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Captain tab ── */}
                {getActionTab(sid) === 'captain' && (
                  <div className="space-y-1">
                    <div className="flex items-end gap-1">
                      <RollInput label="2d6" value={rolls[k(sid, 'improveInit')] ?? ''} onChange={v => set(k(sid, 'improveInit'), v)} />
                      <Button
                        onClick={() => { onAttemptImproveInitiative(sid, get(k(sid, 'improveInit'))); clear(k(sid, 'improveInit')); }}
                        size="sm"
                        className="flex-1 bg-blue-500/20 text-blue-300 border border-blue-500/50 text-[0.6rem] h-6"
                      >
                        Command: Improve Initiative{get(k(sid, 'improveInit')) !== undefined && <span className="ml-1 text-yellow-300/70">[m]</span>}
                      </Button>
                    </div>
                    <div className="flex items-end gap-1">
                      <RollInput label="2d6" value={rolls[k(sid, 'aidGunners')] ?? ''} onChange={v => set(k(sid, 'aidGunners'), v)} />
                      <Button
                        onClick={() => { onAttemptAidGunners(sid, get(k(sid, 'aidGunners'))); clear(k(sid, 'aidGunners')); }}
                        size="sm"
                        className="flex-1 bg-green-500/20 text-green-300 border border-green-500/50 text-[0.6rem] h-6"
                      >
                        Pilot: Aid Gunners{get(k(sid, 'aidGunners')) !== undefined && <span className="ml-1 text-yellow-300/70">[m]</span>}
                      </Button>
                    </div>
                    {pressure > 0 && (
                      <div className="flex items-end gap-1">
                        <RollInput label="2d6" value={rolls[k(sid, 'repelBoarders')] ?? ''} onChange={v => set(k(sid, 'repelBoarders'), v)} />
                        <Button
                          onClick={() => { onAttemptRepelBoarders(sid, get(k(sid, 'repelBoarders'))); clear(k(sid, 'repelBoarders')); }}
                          size="sm"
                          className="flex-1 bg-red-500/20 text-red-300 border border-red-500/50 text-[0.6rem] h-6"
                        >
                          <Shield className="h-2.5 w-2.5 mr-1" /> Repel Boarders ({pressure})
                          {get(k(sid, 'repelBoarders')) !== undefined && <span className="ml-1 text-yellow-300/70">[m]</span>}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Engineer tab ── */}
                {getActionTab(sid) === 'engineer' && (
                  <div className="space-y-1">
                    <div className="flex items-end gap-1">
                      <RollInput label="2d6" value={rolls[k(sid, 'overloadDrive')] ?? ''} onChange={v => set(k(sid, 'overloadDrive'), v)} />
                      <Button
                        onClick={() => { onAttemptOverloadDrive(sid, get(k(sid, 'overloadDrive'))); clear(k(sid, 'overloadDrive')); }}
                        size="sm"
                        className="flex-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 text-[0.6rem] h-6"
                      >
                        <Zap className="h-2.5 w-2.5 mr-1" /> Overload M-Drive
                        {get(k(sid, 'overloadDrive')) !== undefined && <span className="ml-1 text-yellow-300/70">[m]</span>}
                      </Button>
                    </div>
                    <div className="flex items-end gap-1">
                      <RollInput label="2d6" value={rolls[k(sid, 'overloadPlant')] ?? ''} onChange={v => set(k(sid, 'overloadPlant'), v)} />
                      <Button
                        onClick={() => { onAttemptOverloadPlant(sid, get(k(sid, 'overloadPlant'))); clear(k(sid, 'overloadPlant')); }}
                        size="sm"
                        className="flex-1 bg-orange-500/20 text-orange-300 border border-orange-500/50 text-[0.6rem] h-6"
                      >
                        <Zap className="h-2.5 w-2.5 mr-1" /> Overload Power Plant
                        {get(k(sid, 'overloadPlant')) !== undefined && <span className="ml-1 text-yellow-300/70">[m]</span>}
                      </Button>
                    </div>
                    <Button
                      onClick={() => onResetOverloadPenalties(sid)}
                      size="sm"
                      className="w-full bg-terminal-primary/20 text-terminal-primary border border-terminal-primary/50 text-[0.6rem] h-6"
                    >
                      Reset Overload Penalties
                    </Button>
                    <div className="flex items-end gap-1">
                      <RollInput label="2d6" value={rolls[k(sid, 'jump')] ?? ''} onChange={v => set(k(sid, 'jump'), v)} />
                      <Button
                        onClick={() => { onAttemptJump(sid, get(k(sid, 'jump'))); clear(k(sid, 'jump')); }}
                        size="sm"
                        className="flex-1 bg-purple-500/20 text-purple-300 border border-purple-500/50 text-[0.6rem] h-6"
                      >
                        <Navigation className="h-2.5 w-2.5 mr-1" /> Initiate Jump
                        {ship.jumpCommitted && ` (${ship.jumpChargeRounds}rnd)`}
                        {get(k(sid, 'jump')) !== undefined && <span className="ml-1 text-yellow-300/70">[m]</span>}
                      </Button>
                    </div>
                  </div>
                )}

                {/* ── Combat tab – dogfight, dock, board ── */}
                {getActionTab(sid) === 'combat' && (
                  <div className="space-y-1">
                    <div className="space-y-0.5">
                      <label className="text-[0.55rem] text-terminal-primary/50">Dogfight Target</label>
                      <div className="flex gap-1 flex-wrap items-end">
                        <Select
                          value={dogfightPlans[sid]?.targetId || ''}
                          onValueChange={v => onUpdateDogfightPlan(sid, { targetId: v })}
                        >
                          <SelectTrigger className="h-6 flex-1 min-w-0 text-[0.6rem] bg-black border-terminal-primary/30 text-terminal-primary px-1">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">
                            {combatants.filter(c => c.id !== sid && (c.hullCurrent ?? 1) > 0).map(c => (
                              <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end gap-1">
                        <RollInput label="self" value={rolls[k(sid, 'dogfightSelf')] ?? ''} onChange={v => set(k(sid, 'dogfightSelf'), v)} />
                        <RollInput label="target" value={rolls[k(sid, 'dogfightTarget')] ?? ''} onChange={v => set(k(sid, 'dogfightTarget'), v)} />
                        <Button
                          onClick={() => { onResolveDogfight(sid, get(k(sid, 'dogfightSelf')), get(k(sid, 'dogfightTarget'))); clear(k(sid, 'dogfightSelf'), k(sid, 'dogfightTarget')); }}
                          disabled={!dogfightPlans[sid]?.targetId}
                          size="sm"
                          className="flex-1 h-6 text-[0.55rem] bg-red-500/20 text-red-300 border border-red-500/50"
                        >
                          <Swords className="h-2.5 w-2.5 mr-0.5" /> Fight
                          {(get(k(sid, 'dogfightSelf')) !== undefined || get(k(sid, 'dogfightTarget')) !== undefined) && <span className="ml-1 text-yellow-300/70">*</span>}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[0.55rem] text-terminal-primary/50">Dock/Board Target</label>
                      <div className="flex gap-1 flex-wrap items-end">
                        <Select
                          value={dockingPlans[sid]?.targetId || ''}
                          onValueChange={v => onUpdateDockingPlan(sid, { targetId: v })}
                        >
                          <SelectTrigger className="h-6 flex-1 min-w-0 text-[0.6rem] bg-black border-terminal-primary/30 text-terminal-primary px-1">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">
                            {combatants.filter(c => c.id !== sid && (c.hullCurrent ?? 1) > 0).map(c => (
                              <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={dockingPlans[sid]?.mode || 'dock'}
                          onValueChange={v => onUpdateDockingPlan(sid, { mode: v as 'dock' | 'board' })}
                        >
                          <SelectTrigger className="h-6 w-16 text-[0.6rem] bg-black border-terminal-primary/30 text-terminal-primary px-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">
                            <SelectItem value="dock" className="text-xs">Dock</SelectItem>
                            <SelectItem value="board" className="text-xs">Board</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end gap-1">
                        <RollInput label="actor" value={rolls[k(sid, 'dockActor')] ?? ''} onChange={v => set(k(sid, 'dockActor'), v)} />
                        {dockingPlans[sid]?.mode === 'board' && (
                          <RollInput label="board" value={rolls[k(sid, 'dockBoard')] ?? ''} onChange={v => set(k(sid, 'dockBoard'), v)} />
                        )}
                        <Button
                          onClick={() => { onAttemptDockOrBoard(sid, get(k(sid, 'dockActor')), get(k(sid, 'dockBoard'))); clear(k(sid, 'dockActor'), k(sid, 'dockBoard')); }}
                          disabled={!dockingPlans[sid]?.targetId}
                          size="sm"
                          className="flex-1 h-6 text-[0.55rem] bg-orange-500/20 text-orange-300 border border-orange-500/50"
                        >
                          <Anchor className="h-2.5 w-2.5 mr-0.5" /> {dockingPlans[sid]?.mode === 'board' ? 'Board' : 'Dock'}
                          {(get(k(sid, 'dockActor')) !== undefined || get(k(sid, 'dockBoard')) !== undefined) && <span className="ml-1 text-yellow-300/70">*</span>}
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

      {combatants.length === 0 && (
        <p className="text-terminal-text-dimmer text-[0.6rem] text-center py-2">
          No ships in combat. Use Setup to add ships.
        </p>
      )}
    </div>
  );
}
