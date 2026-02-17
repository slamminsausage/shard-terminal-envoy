import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertTriangle,
  Crosshair,
  Gauge,
  ListOrdered,
  Plus,
  Rocket,
  Settings,
  Shield,
  Target,
  Trash2,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { useCampaign } from '@/contexts/CampaignContext';
import { roll2d6, rollDamageExpression } from '@/lib/dice';
import {
  COMBAT_PHASE_LABELS,
  COMBAT_PHASES,
  CRITICAL_LOCATION_LABELS,
  CRITICAL_LOCATIONS,
  type CriticalLocation,
  type CombatPhase,
  getRangeBandShift,
  isWeaponInRange,
  RANGE_ATTACK_MODIFIERS,
  RANGE_BAND_LABELS,
  RANGE_BAND_RULES,
  type ShipRangeBand,
  SHIP_WEAPON_PRESETS,
} from '@/lib/bridge/shipCombatRules';

interface ShipCombatant {
  id: string;
  name: string;
  isPlayerShip: boolean;
  hullCurrent: number;
  hullMax: number;
  thrust: number;
  armor: number;
  tonnage: number;
  pilotSkill: number;
  gunnerSkill: number;
  engineerSkill: number;
  sensorSkill: number;
  captainSkill: number;
  tacticsEffect: number;
  initiative?: number;
  initiativeDetail?: string;
  rangeBand: ShipRangeBand;
  surprised: boolean;
  movementAllocation: number;
  evasiveAllocation: number;
  maneuverIntent: 'hold' | 'close' | 'open';
  criticals: Partial<Record<CriticalLocation, number>>;
  sustainedDamageCounter: number;
  repairProgress: Partial<Record<CriticalLocation, number>>;
  pendingThrustBoost: number;
  activeThrustBoost: number;
  pendingPowerBypass: boolean;
  activePowerBypass: boolean;
  overloadDrivePenalty: number;
  overloadPlantPenalty: number;
  missileAmmo: number;
  sandAmmo: number;
  sandReloadRounds: number;
  sandScreen: number;
  jumpChargeRounds: number;
  jumpCommitted: boolean;
}

interface CombatLogEntry {
  id: string;
  round: number;
  phase: CombatPhase;
  message: string;
  gmOnly?: boolean;
}

interface AttackState {
  targetId: string;
  weaponId: string;
  situationalDM: number;
  calledShotLocation: CriticalLocation | 'none';
}

interface RepairState {
  location: CriticalLocation | '';
}

interface SensorActionState {
  lockTargetId: string;
  breakLockFromShipId: string;
}

interface DogfightState {
  targetId: string;
}

interface DockingState {
  targetId: string;
  mode: 'dock' | 'board';
}

interface MissileSalvo {
  id: string;
  attackerId: string;
  targetId: string;
  missilesRemaining: number;
  roundsToImpact: number;
  launchedRangeBand: ShipRangeBand;
  launchedRound: number;
}

const rangeBandColors: Record<ShipRangeBand, string> = {
  adjacent: 'bg-red-500/20 text-red-300 border-red-500/50',
  close: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
  short: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  medium: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  long: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  very_long: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50',
  distant: 'bg-slate-500/20 text-slate-300 border-slate-500/50',
};

const getDefaultAttackState = (): AttackState => ({ targetId: '', weaponId: SHIP_WEAPON_PRESETS[0].id, situationalDM: 0, calledShotLocation: 'none' });
const getDefaultRepairState = (): RepairState => ({ location: '' });

function pickRandomCriticalLocation(): CriticalLocation {
  return CRITICAL_LOCATIONS[Math.floor(Math.random() * CRITICAL_LOCATIONS.length)];
}

function getCriticalSeverity(ship: ShipCombatant, location: CriticalLocation): number {
  return ship.criticals[location] ?? 0;
}

function getEffectiveArmor(ship: ShipCombatant): number {
  return Math.max(0, ship.armor - getCriticalSeverity(ship, 'armor'));
}

function getEffectiveThrust(ship: ShipCombatant): number {
  const mDriveSeverity = getCriticalSeverity(ship, 'm_drive');
  const baseThrust = ship.thrust + ship.activeThrustBoost;
  const powerPenalty = ship.activePowerBypass ? 0 : getPowerPlantThrustPenalty(ship);
  if (mDriveSeverity >= 5) return 0;
  if (powerPenalty >= 99) return 0;
  const mDrivePenalty = mDriveSeverity >= 2 ? 1 : 0;
  return Math.max(0, baseThrust - mDrivePenalty - powerPenalty);
}

function getPilotCriticalPenalty(ship: ShipCombatant): number {
  return getCriticalSeverity(ship, 'm_drive') >= 1 ? -1 : 0;
}

function getGunnerCriticalPenalty(ship: ShipCombatant): number {
  return getCriticalSeverity(ship, 'weapon') >= 1 ? -1 : 0;
}

function getSensorCriticalPenalty(ship: ShipCombatant): number {
  return getCriticalSeverity(ship, 'sensors') >= 1 ? -2 : 0;
}

function getBridgeCriticalPenalty(ship: ShipCombatant): number {
  return getCriticalSeverity(ship, 'bridge') >= 1 ? -1 : 0;
}

function getCrewCriticalPenalty(ship: ShipCombatant): number {
  return getCriticalSeverity(ship, 'crew') >= 3 ? -1 : 0;
}

function getPowerPlantThrustPenalty(ship: ShipCombatant): number {
  const severity = getCriticalSeverity(ship, 'power_plant');
  if (severity >= 4) return 99;
  if (severity >= 3) return 1;
  return 0;
}

function getSystemFlags(ship: ShipCombatant): string[] {
  const flags: string[] = [];
  if (getCriticalSeverity(ship, 'power_plant') >= 4) flags.push('Power 0%');
  if (getCriticalSeverity(ship, 'm_drive') >= 5) flags.push('Thrust 0');
  if (getCriticalSeverity(ship, 'sensors') >= 4) flags.push('Sensors severely degraded');
  if (getCriticalSeverity(ship, 'weapon') >= 2) flags.push('Weapons disabled risk');
  return flags;
}

function getDogfightSizePenalty(tonnage: number): number {
  if (tonnage < 50) return 0;
  if (tonnage < 100) return -1;
  return -2 - Math.floor((tonnage - 100) / 100);
}

function getMissileFlightRounds(rangeBand: ShipRangeBand): number {
  if (rangeBand === 'long') return 1;
  if (rangeBand === 'very_long') return 4;
  if (rangeBand === 'distant') return 10;
  return 0;
}

export const ShipCombatTracker: React.FC = () => {
  const { isGM } = useCampaign();
  const [ships, setShips] = useState<ShipCombatant[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [phase, setPhase] = useState<CombatPhase>('setup');
  const [showAddShip, setShowAddShip] = useState(false);
  const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([]);
  const [attackPlans, setAttackPlans] = useState<Record<string, AttackState>>({});
  const [repairPlans, setRepairPlans] = useState<Record<string, RepairState>>({});
  const [sensorPlans, setSensorPlans] = useState<Record<string, SensorActionState>>({});
  const [dogfightPlans, setDogfightPlans] = useState<Record<string, DogfightState>>({});
  const [dockingPlans, setDockingPlans] = useState<Record<string, DockingState>>({});
  const [boardingPressure, setBoardingPressure] = useState<Record<string, number>>({});
  const [dockedWith, setDockedWith] = useState<Record<string, string>>({});
  const [sensorLocks, setSensorLocks] = useState<Record<string, string>>({});
  const [initiativeModifiers, setInitiativeModifiers] = useState<Record<string, number>>({});
  const [dogfightAttackModifiers, setDogfightAttackModifiers] = useState<Record<string, number>>({});
  const [dogfightMomentum, setDogfightMomentum] = useState<Record<string, number>>({});
  const [gunnerAssist, setGunnerAssist] = useState<Record<string, number>>({});
  const [missileSalvos, setMissileSalvos] = useState<MissileSalvo[]>([]);

  const [newShipName, setNewShipName] = useState('');
  const [newShipHull, setNewShipHull] = useState('20');
  const [newShipThrust, setNewShipThrust] = useState('2');
  const [newShipArmor, setNewShipArmor] = useState('0');
  const [newShipTonnage, setNewShipTonnage] = useState('200');
  const [newPilotSkill, setNewPilotSkill] = useState('1');
  const [newGunnerSkill, setNewGunnerSkill] = useState('1');
  const [newEngineerSkill, setNewEngineerSkill] = useState('1');
  const [newSensorSkill, setNewSensorSkill] = useState('1');
  const [newCaptainSkill, setNewCaptainSkill] = useState('1');
  const [newTacticsEffect, setNewTacticsEffect] = useState('0');
  const [newShipIsPlayer, setNewShipIsPlayer] = useState(true);
  const [newRangeBand, setNewRangeBand] = useState<ShipRangeBand>('very_long');
  const [selectedPreMadeShipId, setSelectedPreMadeShipId] = useState<string>('custom');

  const initiativeOrder = useMemo(() => [...ships].sort((a, b) => (b.initiative ?? -999) - (a.initiative ?? -999)), [ships]);

  const addLog = (message: string, gmOnly = false) => {
    setCombatLog((prev) => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, round: currentRound, phase, message, gmOnly },
      ...prev,
    ]);
  };

  const upsertShip = (shipId: string, updater: (ship: ShipCombatant) => ShipCombatant) => {
    setShips((prev) => prev.map((ship) => (ship.id === shipId ? updater(ship) : ship)));
  };

  const applyDamageToShip = (
    shipId: string,
    rawDamage: number,
    source: string,
    criticalEffect?: number,
    forcedCriticalLocation?: CriticalLocation,
  ) => {
    upsertShip(shipId, (ship) => {
      let nextHull = Math.max(0, ship.hullCurrent - rawDamage);
      const damageTaken = ship.hullCurrent - nextHull;
      const threshold = Math.max(1, Math.floor(ship.hullMax * 0.1));
      let sustained = ship.sustainedDamageCounter + damageTaken;

      const applyCriticalHit = (location: CriticalLocation, incomingSeverity: number, reason: string) => {
        const currentSeverity = ship.criticals[location] ?? 0;
        const nextSeverity = Math.min(6, Math.max(incomingSeverity, currentSeverity + 1));
        ship = {
          ...ship,
          criticals: { ...ship.criticals, [location]: nextSeverity },
        };
        addLog(`${ship.name} takes critical hit at ${CRITICAL_LOCATION_LABELS[location]} (severity ${nextSeverity})${reason ? `: ${reason}` : ''}.`, true);

        if (location === 'hull') {
          const hullSplash = rollDamageExpression(`${nextSeverity}d6`).total;
          nextHull = Math.max(0, nextHull - hullSplash);
          addLog(`${ship.name} suffers additional hull critical damage ${hullSplash}.`, true);
        }
      };

      while (sustained >= threshold) {
        sustained -= threshold;
        const loc = pickRandomCriticalLocation();
        applyCriticalHit(loc, 1, 'threshold damage');
      }

      if (criticalEffect && criticalEffect >= 6 && damageTaken > 0) {
        const loc = forcedCriticalLocation ?? pickRandomCriticalLocation();
        const severity = Math.min(6, criticalEffect - 5);
        applyCriticalHit(loc, severity, forcedCriticalLocation ? 'called shot' : 'high-effect attack');
      }

      return {
        ...ship,
        hullCurrent: nextHull,
        sustainedDamageCounter: sustained,
      };
    });

    addLog(`${source} deals ${rawDamage} damage.`);
  };

  const applyPreMadeShip = (shipId: string) => {
    setSelectedPreMadeShipId(shipId);
    if (shipId === 'custom') return;

    const preset = PRE_MADE_SHIPS.find((entry) => entry.id === shipId);
    if (!preset) return;

    setNewShipName(`${preset.name}${preset.designation ? ` (${preset.designation})` : ''}`);
    setNewShipHull(String(Math.max(1, Math.round(preset.hullPoints / 2))));
    setNewShipArmor(String(Math.max(0, preset.design.armorProtection ?? 0)));
    setNewShipTonnage(String(Math.max(1, Math.round(preset.tonnage))));
    setNewShipThrust(String(Math.max(0, preset.design.manoeuvreRating ?? 0)));
  };

  const addShip = () => {
    if (!newShipName.trim()) return;

    const hull = Math.max(1, parseInt(newShipHull, 10) || 20);
    const newShip: ShipCombatant = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: newShipName.trim(),
      isPlayerShip: newShipIsPlayer,
      hullCurrent: hull,
      hullMax: hull,
      thrust: Math.max(0, parseInt(newShipThrust, 10) || 0),
      armor: Math.max(0, parseInt(newShipArmor, 10) || 0),
      tonnage: Math.max(1, parseInt(newShipTonnage, 10) || 100),
      pilotSkill: parseInt(newPilotSkill, 10) || 0,
      gunnerSkill: parseInt(newGunnerSkill, 10) || 0,
      engineerSkill: parseInt(newEngineerSkill, 10) || 0,
      sensorSkill: parseInt(newSensorSkill, 10) || 0,
      captainSkill: parseInt(newCaptainSkill, 10) || 0,
      tacticsEffect: parseInt(newTacticsEffect, 10) || 0,
      rangeBand: newRangeBand,
      surprised: false,
      movementAllocation: 0,
      evasiveAllocation: 0,
      maneuverIntent: 'hold',
      criticals: {},
      sustainedDamageCounter: 0,
      repairProgress: {},
      pendingThrustBoost: 0,
      activeThrustBoost: 0,
      pendingPowerBypass: false,
      activePowerBypass: false,
      overloadDrivePenalty: 0,
      overloadPlantPenalty: 0,
      missileAmmo: 12,
      sandAmmo: 6,
      sandReloadRounds: 0,
      sandScreen: 0,
      jumpChargeRounds: 0,
      jumpCommitted: false,
    };

    setShips((prev) => [...prev, newShip]);
    setAttackPlans((prev) => ({ ...prev, [newShip.id]: getDefaultAttackState() }));
    setRepairPlans((prev) => ({ ...prev, [newShip.id]: getDefaultRepairState() }));
    setSensorPlans((prev) => ({ ...prev, [newShip.id]: { lockTargetId: '', breakLockFromShipId: '' } }));
    setDogfightPlans((prev) => ({ ...prev, [newShip.id]: { targetId: '' } }));
    setDockingPlans((prev) => ({ ...prev, [newShip.id]: { targetId: '', mode: 'dock' } }));
    addLog(`Added ${newShip.name} (${newShip.isPlayerShip ? 'Player' : 'Hostile'}) at ${RANGE_BAND_LABELS[newShip.rangeBand]}.`, true);
    setNewShipName('');
    setSelectedPreMadeShipId('custom');
    setShowAddShip(false);
  };

  const deleteShip = (shipId: string) => {
    const target = ships.find((ship) => ship.id === shipId);
    setShips((prev) => prev.filter((ship) => ship.id !== shipId));
    setAttackPlans((prev) => {
      const next = { ...prev };
      delete next[shipId];
      return next;
    });
    setRepairPlans((prev) => {
      const next = { ...prev };
      delete next[shipId];
      return next;
    });
    setSensorPlans((prev) => {
      const next = { ...prev };
      delete next[shipId];
      return next;
    });
    setSensorLocks((prev) => Object.fromEntries(Object.entries(prev).filter(([locker, target]) => locker !== shipId && target !== shipId)));
    setDogfightPlans((prev) => { const next = { ...prev }; delete next[shipId]; return next; });
    setDockingPlans((prev) => { const next = { ...prev }; delete next[shipId]; return next; });
    setBoardingPressure((prev) => { const next = { ...prev }; delete next[shipId]; return next; });
    setDockedWith((prev) => {
      const next = { ...prev };
      const partner = next[shipId];
      delete next[shipId];
      if (partner) delete next[partner];
      return next;
    });
    setInitiativeModifiers((prev) => { const next = { ...prev }; delete next[shipId]; return next; });
    setGunnerAssist((prev) => { const next = { ...prev }; delete next[shipId]; return next; });
    setDogfightAttackModifiers((prev) => { const next = { ...prev }; delete next[shipId]; return next; });
    setDogfightMomentum((prev) => { const next = { ...prev }; delete next[shipId]; return next; });
    setMissileSalvos((prev) => prev.filter((salvo) => salvo.attackerId !== shipId && salvo.targetId !== shipId));
    if (target) addLog(`Removed ${target.name} from encounter.`, true);
  };

  const updateShip = (shipId: string, updates: Partial<ShipCombatant>) => {
    setShips((prev) => prev.map((ship) => (ship.id === shipId ? { ...ship, ...updates } : ship)));
  };

  const updateAttackPlan = (shipId: string, updates: Partial<AttackState>) => {
    setAttackPlans((prev) => ({ ...prev, [shipId]: { ...(prev[shipId] ?? getDefaultAttackState()), ...updates } }));
  };

  const updateRepairPlan = (shipId: string, updates: Partial<RepairState>) => {
    setRepairPlans((prev) => ({ ...prev, [shipId]: { ...(prev[shipId] ?? getDefaultRepairState()), ...updates } }));
  };

  const updateSensorPlan = (shipId: string, updates: Partial<SensorActionState>) => {
    setSensorPlans((prev) => ({
      ...prev,
      [shipId]: {
        lockTargetId: '',
        breakLockFromShipId: '',
        ...(prev[shipId] ?? {}),
        ...updates,
      },
    }));
  };

  const updateDogfightPlan = (shipId: string, updates: Partial<DogfightState>) => {
    setDogfightPlans((prev) => ({ ...prev, [shipId]: { targetId: '', ...(prev[shipId] ?? {}), ...updates } }));
  };

  const updateDockingPlan = (shipId: string, updates: Partial<DockingState>) => {
    setDockingPlans((prev) => ({ ...prev, [shipId]: { targetId: '', mode: 'dock', ...(prev[shipId] ?? {}), ...updates } }));
  };

  const rollInitiative = () => {
    setShips((prev) =>
      prev.map((ship) => {
        const dice = roll2d6();
        const commandMod = initiativeModifiers[ship.id] ?? 0;
        const pilotScore = ship.pilotSkill + getPilotCriticalPenalty(ship) + getCrewCriticalPenalty(ship) - Math.min(3, boardingPressure[ship.id] ?? 0);
        const thrustScore = getEffectiveThrust(ship);
        const bridgePenalty = getBridgeCriticalPenalty(ship);
        const total = dice + pilotScore + thrustScore + ship.tacticsEffect + commandMod + bridgePenalty;
        return {
          ...ship,
          initiative: total,
          initiativeDetail: `${dice} + Pilot ${pilotScore} + Thrust ${thrustScore} + Tactics ${ship.tacticsEffect}${commandMod ? ` + Command ${commandMod}` : ''}${bridgePenalty ? ` ${bridgePenalty}` : ''}`,
        };
      }),
    );
    addLog('Initiative rolled for all ships.');
    setInitiativeModifiers({});
    setPhase('maneuver');
  };

  const applyManeuverStep = () => {
    setShips((prev) =>
      prev.map((ship) => {
        const effectiveThrust = getEffectiveThrust(ship);
        const totalAllocated = ship.movementAllocation + ship.evasiveAllocation;
        if (totalAllocated > effectiveThrust) {
          addLog(`${ship.name} over-allocated thrust (${totalAllocated}/${effectiveThrust}). Allocation reset.`, true);
          return { ...ship, movementAllocation: 0, evasiveAllocation: 0, maneuverIntent: 'hold' };
        }

        const required = RANGE_BAND_RULES.find((band) => band.key === ship.rangeBand)?.thrustRequired ?? 1;
        const canShift = ship.movementAllocation >= required;
        const nextRange = canShift && ship.maneuverIntent !== 'hold' ? getRangeBandShift(ship.rangeBand, ship.maneuverIntent) : ship.rangeBand;
        if (nextRange !== ship.rangeBand) {
          addLog(`${ship.name} shifts range to ${RANGE_BAND_LABELS[nextRange]}.`);
        }

        return { ...ship, rangeBand: nextRange };
      }),
    );
    setPhase('attack');
  };



  const resolveDogfight = (shipId: string) => {
    const ship = ships.find((entry) => entry.id === shipId);
    const targetId = dogfightPlans[shipId]?.targetId;
    const target = ships.find((entry) => entry.id === targetId);
    if (!ship || !target) return;

    if (!['adjacent', 'close'].includes(ship.rangeBand) || !['adjacent', 'close'].includes(target.rangeBand)) {
      addLog(`${ship.name} cannot dogfight ${target.name} outside Close/Adjacent range.`, true);
      return;
    }

    const shipRoll = roll2d6();
    const targetRoll = roll2d6();
    const shipScore = shipRoll + ship.pilotSkill + getPilotCriticalPenalty(ship) + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship) + getDogfightSizePenalty(ship.tonnage) + Math.min(getEffectiveThrust(ship), ship.movementAllocation) + (dogfightMomentum[ship.id] ?? 0);
    const targetScore = targetRoll + target.pilotSkill + getPilotCriticalPenalty(target) + getBridgeCriticalPenalty(target) + getCrewCriticalPenalty(target) + getDogfightSizePenalty(target.tonnage) + Math.min(getEffectiveThrust(target), target.movementAllocation) + (dogfightMomentum[target.id] ?? 0);

    if (shipScore === targetScore) {
      setDogfightAttackModifiers((prev) => ({ ...prev, [ship.id]: 0, [target.id]: 0 }));
      addLog(`Dogfight between ${ship.name} and ${target.name} is a draw (${shipScore} vs ${targetScore}).`, true);
      return;
    }

    const winner = shipScore > targetScore ? ship : target;
    const loser = winner.id === ship.id ? target : ship;
    const diff = Math.abs(shipScore - targetScore);
    setDogfightAttackModifiers((prev) => ({ ...prev, [winner.id]: 2, [loser.id]: -2 }));
    setDogfightMomentum((prev) => ({ ...prev, [winner.id]: diff, [loser.id]: 0 }));
    addLog(`${winner.name} wins dogfight against ${loser.name} (${shipScore} vs ${targetScore}); +2/-2 attack DM this round.`, true);
  };


  const attemptDockOrBoard = (shipId: string) => {
    const ship = ships.find((entry) => entry.id === shipId);
    const plan = dockingPlans[shipId];
    if (!ship || !plan?.targetId) return;

    const target = ships.find((entry) => entry.id === plan.targetId);
    if (!target) return;

    if (ship.rangeBand !== 'adjacent' || target.rangeBand !== 'adjacent') {
      addLog(`${ship.name} can only ${plan.mode} at Adjacent range.`, true);
      return;
    }

    const actor = roll2d6()
      + ship.pilotSkill
      + getPilotCriticalPenalty(ship)
      + getBridgeCriticalPenalty(ship)
      + getCrewCriticalPenalty(ship)
      + Math.min(getEffectiveThrust(ship), ship.movementAllocation)
      - Math.min(3, boardingPressure[ship.id] ?? 0);
    const defender = roll2d6()
      + target.pilotSkill
      + getPilotCriticalPenalty(target)
      + getBridgeCriticalPenalty(target)
      + getCrewCriticalPenalty(target)
      + Math.min(getEffectiveThrust(target), target.movementAllocation)
      - Math.min(3, boardingPressure[target.id] ?? 0);

    if (actor <= defender) {
      addLog(`${ship.name} fails to ${plan.mode} with ${target.name} (${actor} vs ${defender}).`, true);
      return;
    }

    setDockedWith((prev) => ({ ...prev, [ship.id]: target.id, [target.id]: ship.id }));
    if (plan.mode === 'dock') {
      addLog(`${ship.name} docks with ${target.name} (${actor} vs ${defender}).`, true);
      return;
    }

    const boardingRoll = roll2d6() + ship.engineerSkill + ship.captainSkill + getCrewCriticalPenalty(ship);
    const defenseRoll = roll2d6() + target.engineerSkill + target.captainSkill + getCrewCriticalPenalty(target);
    if (boardingRoll > defenseRoll) {
      const pressureGain = Math.max(1, Math.min(3, boardingRoll - defenseRoll));
      setBoardingPressure((prev) => ({ ...prev, [target.id]: Math.min(6, (prev[target.id] ?? 0) + pressureGain) }));
      addLog(`${ship.name} boards ${target.name}; boarding pressure +${pressureGain} (${boardingRoll} vs ${defenseRoll}).`, true);
      return;
    }

    addLog(`${ship.name} fails boarding action on ${target.name} (${boardingRoll} vs ${defenseRoll}).`, true);
  };

  const attemptRepelBoarders = (shipId: string) => {
    const ship = ships.find((entry) => entry.id === shipId);
    if (!ship) return;

    const pressure = boardingPressure[shipId] ?? 0;
    if (pressure <= 0) {
      addLog(`${ship.name} has no active boarding pressure to repel.`, true);
      return;
    }

    const total = roll2d6() + ship.engineerSkill + ship.captainSkill + getCrewCriticalPenalty(ship);
    const relief = total >= 8 ? Math.max(1, total - 8) : 0;
    if (relief <= 0) {
      addLog(`${ship.name} fails to repel boarders (roll ${total}).`, true);
      return;
    }

    setBoardingPressure((prev) => ({ ...prev, [shipId]: Math.max(0, (prev[shipId] ?? 0) - relief) }));
    addLog(`${ship.name} repels boarders; boarding pressure -${relief} (roll ${total}).`, true);
  };

  const attemptJump = (shipId: string) => {
    const ship = ships.find((entry) => entry.id === shipId);
    if (!ship) return;

    if (ship.jumpCommitted) {
      addLog(`${ship.name} is already charging jump drive (${ship.jumpChargeRounds} rounds remaining).`, true);
      return;
    }

    const jumpDriveSeverity = getCriticalSeverity(ship, 'jump_drive');
    if (jumpDriveSeverity >= 4) {
      addLog(`${ship.name} cannot jump: jump drive critically offline.`, true);
      return;
    }

    const total = roll2d6() + ship.engineerSkill + ship.sensorSkill + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship) - jumpDriveSeverity;
    if (total < 10) {
      addLog(`${ship.name} fails to initialize jump sequence (roll ${total}).`, true);
      return;
    }

    const charge = jumpDriveSeverity >= 2 ? 3 : 2;
    upsertShip(shipId, (current) => ({ ...current, jumpCommitted: true, jumpChargeRounds: charge }));
    addLog(`${ship.name} initiates jump; transition in ${charge} rounds.`, true);
  };

  const resolveAttack = (attackerId: string) => {
    const attacker = ships.find((ship) => ship.id === attackerId);
    const plan = attackPlans[attackerId] ?? getDefaultAttackState();
    const weapon = SHIP_WEAPON_PRESETS.find((item) => item.id === plan.weaponId);
    const targetId = weapon?.id === 'sandcaster' ? (plan.targetId || attackerId) : plan.targetId;
    const target = ships.find((ship) => ship.id === targetId);
    if (!attacker || !target || !weapon) return;

    if (attacker.surprised && currentRound === 1) {
      addLog(`${attacker.name} is surprised and cannot attack this round.`, true);
      return;
    }

    if (!isWeaponInRange(weapon.maxRange, target.rangeBand)) {
      addLog(`${attacker.name} cannot fire ${weapon.name}: ${target.name} is out of range (${RANGE_BAND_LABELS[target.rangeBand]}).`);
      return;
    }

    if (plan.calledShotLocation !== 'none' && (weapon.id === 'missile_rack' || (target.rangeBand !== 'adjacent' && target.rangeBand !== 'close' && target.rangeBand !== 'short'))) {
      addLog(`${attacker.name} cannot use called shot here (requires non-missile at Short range or closer).`, true);
    }

    const dice = roll2d6();
    const rangeMod = RANGE_ATTACK_MODIFIERS[target.rangeBand];
    const sizeMod = Math.min(6, Math.floor(target.tonnage / 1000));
    const targetPilotSkill = Math.max(0, target.pilotSkill + getPilotCriticalPenalty(target) + getCrewCriticalPenalty(target));
    const evasivePenalty = Math.min(target.evasiveAllocation, targetPilotSkill);
    const assistBonus = gunnerAssist[attacker.id] ?? 0;
    const attackerGunnerSkill = attacker.gunnerSkill + getGunnerCriticalPenalty(attacker) + getBridgeCriticalPenalty(attacker) + getCrewCriticalPenalty(attacker);
    const canCallShot = target.rangeBand === 'adjacent' || target.rangeBand === 'close' || target.rangeBand === 'short';
    const calledShotEligible = plan.calledShotLocation !== 'none' && weapon.id !== 'missile_rack' && canCallShot;
    const calledShotPenalty = calledShotEligible ? -2 : 0;
    const dogfightMod = dogfightAttackModifiers[attacker.id] ?? 0;
    const sandPenalty = Math.max(0, target.sandScreen);
    const total = dice + attackerGunnerSkill + assistBonus + rangeMod + weapon.attackModifier + sizeMod + plan.situationalDM + calledShotPenalty + dogfightMod - evasivePenalty - sandPenalty;
    const lockBonus = sensorLocks[attacker.id] === target.id ? 2 : 0;
    const grandTotal = total + lockBonus;
    const effect = grandTotal - 8;

    if (grandTotal < 8) {
      addLog(`${attacker.name} misses ${target.name} with ${weapon.name} (${grandTotal}${sandPenalty ? ` incl. sand -${sandPenalty}` : ''}).`);
      return;
    }

    if (weapon.id === 'sandcaster') {
      if (attacker.sandAmmo <= 0) {
        addLog(`${attacker.name} cannot fire sandcaster: no sand canisters remaining.`, true);
        return;
      }
      if (attacker.sandReloadRounds > 0) {
        addLog(`${attacker.name} sandcaster is reloading (${attacker.sandReloadRounds} round(s) remaining).`, true);
        return;
      }
      upsertShip(attacker.id, (current) => ({
        ...current,
        sandAmmo: Math.max(0, current.sandAmmo - 1),
        sandReloadRounds: 1,
        sandScreen: 2,
      }));
      addLog(`${attacker.name} deploys sand screen (DM-2 against incoming fire this round).`, true);
      return;
    }

    if (weapon.id === 'missile_rack') {
      if (attacker.missileAmmo <= 0) {
        addLog(`${attacker.name} cannot fire missiles: magazine empty.`, true);
        return;
      }
      upsertShip(attacker.id, (current) => ({ ...current, missileAmmo: Math.max(0, current.missileAmmo - 1) }));
      const missiles = Math.min(6, 1 + Math.max(0, effect));
      const roundsToImpact = getMissileFlightRounds(target.rangeBand);
      setMissileSalvos((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          attackerId: attacker.id,
          targetId: target.id,
          missilesRemaining: missiles,
          roundsToImpact,
          launchedRangeBand: target.rangeBand,
          launchedRound: currentRound,
        },
        ...prev,
      ]);
      addLog(`${attacker.name} launches missile salvo (${missiles}) at ${target.name}; impact ${roundsToImpact === 0 ? 'immediate' : `in ${roundsToImpact} round(s)`}.`, true);
      return;
    }

    const baseDamage = rollDamageExpression(weapon.damage).total;
    const modifiedDamage = baseDamage + Math.max(0, effect);
    const effectiveTargetArmor = getEffectiveArmor(target);
    const finalDamage = Math.max(0, modifiedDamage - effectiveTargetArmor);

    applyDamageToShip(
      target.id,
      finalDamage,
      `${attacker.name} hits ${target.name} with ${weapon.name} (roll ${grandTotal}${lockBonus ? ` incl. lock +${lockBonus}` : ''}${assistBonus ? ` incl. aid +${assistBonus}` : ''}${dogfightMod ? ` incl. dogfight ${dogfightMod >= 0 ? '+' : ''}${dogfightMod}` : ''}${sandPenalty ? ` incl. sand -${sandPenalty}` : ''}${calledShotEligible ? ' with called shot' : ''}, effect ${effect}, armor ${effectiveTargetArmor})`,
      effect,
      calledShotEligible ? plan.calledShotLocation : undefined,
    );
  };

  const resolveMissileImpacts = (salvos: MissileSalvo[]) => {
    salvos.forEach((salvo) => {
      const attacker = ships.find((ship) => ship.id === salvo.attackerId);
      const target = ships.find((ship) => ship.id === salvo.targetId);
      if (!attacker || !target || salvo.missilesRemaining <= 0) return;

      const dice = roll2d6();
      const evasivePenalty = Math.min(target.evasiveAllocation, Math.max(0, target.pilotSkill + getPilotCriticalPenalty(target)));
      const distantPenalty = salvo.launchedRangeBand === 'distant' ? -2 : 0;
      const total = dice + salvo.missilesRemaining + distantPenalty - evasivePenalty;
      const effect = total - 8;

      if (total < 8) {
        addLog(`${attacker.name}'s missile salvo misses ${target.name} (${total}).`, true);
        return;
      }

      const baseDamage = rollDamageExpression('4d6').total;
      const multiplier = Math.max(1, Math.min(Math.max(0, effect), salvo.missilesRemaining));
      const effectiveArmor = getEffectiveArmor(target);
      const finalDamage = Math.max(0, baseDamage * multiplier - effectiveArmor);
      applyDamageToShip(target.id, finalDamage, `${attacker.name}'s missiles hit ${target.name} (roll ${total}, x${multiplier}, armor ${effectiveArmor})`, effect);
    });
  };

  const attemptPointDefense = (shipId: string, salvoId: string) => {
    const ship = ships.find((entry) => entry.id === shipId);
    if (!ship) return;

    const salvo = missileSalvos.find((entry) => entry.id === salvoId && entry.targetId === shipId);
    if (!salvo) return;

    const total = roll2d6() + ship.gunnerSkill + getGunnerCriticalPenalty(ship) + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship);
    const effect = total - 8;
    if (total < 8) {
      addLog(`${ship.name} point defence fails against incoming missiles (roll ${total}).`, true);
      return;
    }

    const removed = Math.max(1, effect);
    setMissileSalvos((prev) => prev
      .map((entry) => (entry.id === salvoId ? { ...entry, missilesRemaining: Math.max(0, entry.missilesRemaining - removed) } : entry))
      .filter((entry) => entry.missilesRemaining > 0));
    addLog(`${ship.name} point defence removes ${removed} missile(s) from incoming salvo (roll ${total}).`, true);
  };

  const attemptMissileEW = (shipId: string, salvoId: string) => {
    const ship = ships.find((entry) => entry.id === shipId);
    if (!ship) return;

    const salvo = missileSalvos.find((entry) => entry.id === salvoId && entry.targetId === shipId);
    if (!salvo) return;

    const total = roll2d6() + ship.sensorSkill + getSensorCriticalPenalty(ship) + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship);
    const effect = total - 10;
    if (total < 10) {
      addLog(`${ship.name} EW fails to disrupt incoming missiles (roll ${total}).`, true);
      return;
    }

    const removed = Math.max(1, effect);
    setMissileSalvos((prev) => prev
      .map((entry) => (entry.id === salvoId ? { ...entry, missilesRemaining: Math.max(0, entry.missilesRemaining - removed) } : entry))
      .filter((entry) => entry.missilesRemaining > 0));
    addLog(`${ship.name} EW strips ${removed} missile(s) from incoming salvo (roll ${total}).`, true);
  };

  const attemptSensorLock = (shipId: string) => {
    const ship = ships.find((entry) => entry.id === shipId);
    const plan = sensorPlans[shipId];
    if (!ship || !plan?.lockTargetId) return;

    const target = ships.find((entry) => entry.id === plan.lockTargetId);
    if (!target) return;

    const total = roll2d6() + ship.sensorSkill + getSensorCriticalPenalty(ship) + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship);
    if (total >= 8) {
      setSensorLocks((prev) => ({ ...prev, [shipId]: target.id }));
      addLog(`${ship.name} establishes sensor lock on ${target.name} (roll ${total}).`, true);
      return;
    }

    addLog(`${ship.name} fails to lock ${target.name} (roll ${total}).`, true);
  };

  const attemptBreakSensorLock = (shipId: string) => {
    const ship = ships.find((entry) => entry.id === shipId);
    const plan = sensorPlans[shipId];
    if (!ship || !plan?.breakLockFromShipId) return;

    const locker = ships.find((entry) => entry.id === plan.breakLockFromShipId);
    if (!locker) return;

    const lockedTarget = sensorLocks[locker.id];
    if (!lockedTarget) {
      addLog(`${ship.name} cannot break lock: ${locker.name} has no active lock.`, true);
      return;
    }

    const ownRoll = roll2d6() + ship.sensorSkill + getSensorCriticalPenalty(ship) + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship);
    const enemyRoll = roll2d6() + locker.sensorSkill + getSensorCriticalPenalty(locker) + getBridgeCriticalPenalty(locker) + getCrewCriticalPenalty(locker);
    if (ownRoll > enemyRoll) {
      setSensorLocks((prev) => {
        const next = { ...prev };
        delete next[locker.id];
        return next;
      });
      const targetShip = ships.find((entry) => entry.id === lockedTarget);
      addLog(`${ship.name} breaks ${locker.name}'s lock${targetShip ? ` on ${targetShip.name}` : ''} (${ownRoll} vs ${enemyRoll}).`, true);
      return;
    }

    addLog(`${ship.name} fails to break ${locker.name}'s lock (${ownRoll} vs ${enemyRoll}).`, true);
  };



  const attemptImproveInitiative = (shipId: string) => {
    const ship = ships.find((entry) => entry.id === shipId);
    if (!ship) return;

    const total = roll2d6() + ship.captainSkill + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship);
    const effect = total - 8;
    setInitiativeModifiers((prev) => ({ ...prev, [shipId]: effect }));
    addLog(`${ship.name} command check sets next-round initiative modifier to ${effect >= 0 ? '+' : ''}${effect} (roll ${total}).`, true);
  };

  const attemptAidGunners = (shipId: string) => {
    const ship = ships.find((entry) => entry.id === shipId);
    if (!ship) return;

    const total = roll2d6() + ship.pilotSkill + getPilotCriticalPenalty(ship) + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship);
    if (total < 8) {
      setGunnerAssist((prev) => ({ ...prev, [shipId]: 0 }));
      addLog(`${ship.name} fails to aid gunners (roll ${total}).`, true);
      return;
    }

    const effect = total - 8;
    setGunnerAssist((prev) => ({ ...prev, [shipId]: effect }));
    addLog(`${ship.name} aids gunners with DM+${effect} this round (roll ${total}).`, true);
  };



  const applyManualCritical = (shipId: string, location: CriticalLocation, severity: number, reason: string) => {
    upsertShip(shipId, (ship) => {
      const currentSeverity = ship.criticals[location] ?? 0;
      const nextSeverity = Math.min(6, Math.max(severity, currentSeverity + 1));
      addLog(`${ship.name} suffers ${CRITICAL_LOCATION_LABELS[location]} critical severity ${nextSeverity} (${reason}).`, true);
      return { ...ship, criticals: { ...ship.criticals, [location]: nextSeverity } };
    });
  };

  const attemptOverloadDrive = (shipId: string) => {
    const ship = ships.find((entry) => entry.id === shipId);
    if (!ship) return;

    const total = roll2d6() + ship.engineerSkill - ship.overloadDrivePenalty + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship);
    const effect = total - 10;

    upsertShip(shipId, (current) => ({ ...current, overloadDrivePenalty: current.overloadDrivePenalty + 2 }));

    if (total >= 10) {
      upsertShip(shipId, (current) => ({ ...current, pendingThrustBoost: Math.max(current.pendingThrustBoost, 1) }));
      addLog(`${ship.name} overloads M-drive successfully (roll ${total}); +1 Thrust next round.`, true);
      return;
    }

    if (effect <= -6) {
      applyManualCritical(shipId, 'm_drive', 1, 'overload drive failure');
    }
    addLog(`${ship.name} fails to overload M-drive (roll ${total}).`, true);
  };

  const attemptOverloadPlant = (shipId: string) => {
    const ship = ships.find((entry) => entry.id === shipId);
    if (!ship) return;

    const total = roll2d6() + ship.engineerSkill - ship.overloadPlantPenalty + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship);
    const effect = total - 10;

    upsertShip(shipId, (current) => ({ ...current, overloadPlantPenalty: current.overloadPlantPenalty + 2 }));

    if (total >= 10) {
      upsertShip(shipId, (current) => ({ ...current, pendingPowerBypass: true }));
      addLog(`${ship.name} overloads power plant (roll ${total}); power penalties bypassed next round.`, true);
      return;
    }

    if (effect <= -6) {
      applyManualCritical(shipId, 'power_plant', 1, 'overload plant failure');
    }
    addLog(`${ship.name} fails to overload power plant (roll ${total}).`, true);
  };

  const resetOverloadPenalties = (shipId: string) => {
    const ship = ships.find((entry) => entry.id === shipId);
    if (!ship) return;

    upsertShip(shipId, (current) => ({ ...current, overloadDrivePenalty: 0, overloadPlantPenalty: 0 }));
    addLog(`${ship.name} stabilizes drives and clears overload penalties.`, true);
  };

  const attemptRepair = (shipId: string) => {
    const ship = ships.find((entry) => entry.id === shipId);
    const plan = repairPlans[shipId] ?? getDefaultRepairState();
    if (!ship || !plan.location) return;

    const severity = ship.criticals[plan.location] ?? 0;
    if (severity <= 0) return;

    const progress = ship.repairProgress[plan.location] ?? 0;
    const dice = roll2d6();
    const total = dice + ship.engineerSkill + progress - severity;

    if (total >= 8) {
      upsertShip(shipId, (current) => {
        const nextSeverity = Math.max(0, (current.criticals[plan.location] ?? 0) - 1);
        const nextCriticals = { ...current.criticals };
        if (nextSeverity <= 0) {
          delete nextCriticals[plan.location];
        } else {
          nextCriticals[plan.location] = nextSeverity;
        }

        return {
          ...current,
          criticals: nextCriticals,
          repairProgress: { ...current.repairProgress, [plan.location]: 0 },
        };
      });
      addLog(`${ship.name} repair success on ${CRITICAL_LOCATION_LABELS[plan.location]} (roll ${total}).`, true);
      return;
    }

    upsertShip(shipId, (current) => ({
      ...current,
      repairProgress: { ...current.repairProgress, [plan.location]: Math.min(6, (current.repairProgress[plan.location] ?? 0) + 1) },
    }));
    addLog(`${ship.name} repair failed on ${CRITICAL_LOCATION_LABELS[plan.location]} (roll ${total}).`, true);
  };

  const advancePhase = () => {
    const currentIdx = COMBAT_PHASES.indexOf(phase);
    const nextIdx = currentIdx + 1;

    if (nextIdx >= COMBAT_PHASES.length) {
      const updatedSalvos = missileSalvos
        .map((salvo) => ({ ...salvo, roundsToImpact: Math.max(0, salvo.roundsToImpact - 1) }))
        .filter((salvo) => salvo.roundsToImpact <= 9 && ships.some((ship) => ship.id === salvo.attackerId) && ships.some((ship) => ship.id === salvo.targetId));
      const impacting = updatedSalvos.filter((salvo) => salvo.roundsToImpact === 0);
      const pending = updatedSalvos.filter((salvo) => salvo.roundsToImpact > 0);
      if (impacting.length > 0) {
        resolveMissileImpacts(impacting);
      }
      setMissileSalvos(pending);
      setCurrentRound((prev) => prev + 1);
      setPhase('maneuver');
      setShips((prev) => prev.map((ship) => ({
        ...ship,
        movementAllocation: 0,
        evasiveAllocation: 0,
        maneuverIntent: 'hold',
        activeThrustBoost: ship.pendingThrustBoost,
        pendingThrustBoost: 0,
        activePowerBypass: ship.pendingPowerBypass,
        pendingPowerBypass: false,
        sandReloadRounds: Math.max(0, ship.sandReloadRounds - 1),
        sandScreen: 0,
        jumpChargeRounds: ship.jumpCommitted ? Math.max(0, ship.jumpChargeRounds - 1) : 0,
      })));
      setShips((prev) => {
        const jumpingShips = prev.filter((ship) => ship.jumpCommitted && ship.jumpChargeRounds <= 1);
        if (jumpingShips.length > 0) {
          jumpingShips.forEach((ship) => addLog(`${ship.name} transitions to jump space and exits combat.`, true));
        }
        return prev.filter((ship) => !(ship.jumpCommitted && ship.jumpChargeRounds <= 1));
      });
      setSensorLocks((prev) => Object.fromEntries(Object.entries(prev).filter(([locker, target]) => ships.some((ship) => ship.id === locker) && ships.some((ship) => ship.id === target))));
      setGunnerAssist({});
      setDogfightAttackModifiers({});
      addLog('New round started.');
      return;
    }

    setPhase(COMBAT_PHASES[nextIdx]);
  };

  return (
    <div className="h-full flex flex-col bg-black text-terminal-primary font-mono">
      <div className="border-b border-terminal-primary/30 p-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-terminal-primary flex items-center gap-2"><Rocket className="h-6 w-6" />SHIP COMBAT TRACKER</h1>
            <p className="text-terminal-primary/70 text-sm mt-1">Round {currentRound} · {COMBAT_PHASE_LABELS[phase]}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isGM && (
              <>
                <Button onClick={() => setShowAddShip((prev) => !prev)} className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"><Plus className="h-4 w-4 mr-2" /> Add Ship</Button>
                <Button onClick={rollInitiative} disabled={ships.length === 0} className="bg-blue-500/20 text-blue-300 border border-blue-500/50 hover:bg-blue-500/30"><Gauge className="h-4 w-4 mr-2" /> Roll Initiative</Button>
                {phase === 'maneuver' && (
                  <Button onClick={applyManeuverStep} disabled={ships.length === 0} className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 hover:bg-yellow-500/30"><Crosshair className="h-4 w-4 mr-2" /> Apply Maneuver</Button>
                )}
                <Button onClick={advancePhase} disabled={ships.length === 0 || phase === 'setup'} className="bg-green-500/20 text-green-300 border border-green-500/50 hover:bg-green-500/30"><Zap className="h-4 w-4 mr-2" /> Advance Phase</Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {showAddShip && isGM && (
          <Card className="bg-black border-terminal-primary/50">
            <CardHeader><CardTitle className="text-terminal-primary text-sm flex items-center gap-2"><Settings className="h-4 w-4" /> Encounter Setup</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="md:col-span-2 space-y-1">
                  <span className="text-terminal-primary/70">Load Ship Preset</span>
                  <Select value={selectedPreMadeShipId} onValueChange={applyPreMadeShip}>
                    <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary"><SelectValue placeholder="Custom / Manual" /></SelectTrigger>
                    <SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary max-h-64">
                      <SelectItem value="custom">Custom / Manual</SelectItem>
                      {PRE_MADE_SHIPS.map((preset) => (
                        <SelectItem key={preset.id} value={preset.id}>{preset.name}{preset.designation ? ` (${preset.designation})` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <span className="text-terminal-primary/70">Ship Name</span>
                  <Input placeholder="Enter ship name" value={newShipName} onChange={(e) => setNewShipName(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary" />
                </div>

                <div className="space-y-1"><span className="text-terminal-primary/70">Hull Points</span><Input type="number" min="1" value={newShipHull} onChange={(e) => setNewShipHull(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary" /></div>
                <div className="space-y-1"><span className="text-terminal-primary/70">Armor</span><Input type="number" min="0" value={newShipArmor} onChange={(e) => setNewShipArmor(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary" /></div>
                <div className="space-y-1"><span className="text-terminal-primary/70">Tonnage</span><Input type="number" min="1" value={newShipTonnage} onChange={(e) => setNewShipTonnage(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary" /></div>
                <div className="space-y-1"><span className="text-terminal-primary/70">Thrust</span><Input type="number" min="0" value={newShipThrust} onChange={(e) => setNewShipThrust(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary" /></div>

                <div className="space-y-1"><span className="text-terminal-primary/70">Pilot Skill</span><Input type="number" value={newPilotSkill} onChange={(e) => setNewPilotSkill(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary" /></div>
                <div className="space-y-1"><span className="text-terminal-primary/70">Gunner Skill</span><Input type="number" value={newGunnerSkill} onChange={(e) => setNewGunnerSkill(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary" /></div>
                <div className="space-y-1"><span className="text-terminal-primary/70">Engineer Skill</span><Input type="number" value={newEngineerSkill} onChange={(e) => setNewEngineerSkill(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary" /></div>
                <div className="space-y-1"><span className="text-terminal-primary/70">Sensor Skill</span><Input type="number" value={newSensorSkill} onChange={(e) => setNewSensorSkill(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary" /></div>

                <div className="space-y-1"><span className="text-terminal-primary/70">Captain Skill</span><Input type="number" value={newCaptainSkill} onChange={(e) => setNewCaptainSkill(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary" /></div>
                <div className="space-y-1"><span className="text-terminal-primary/70">Tactics Effect</span><Input type="number" value={newTacticsEffect} onChange={(e) => setNewTacticsEffect(e.target.value)} className="bg-black border-terminal-primary/50 text-terminal-primary" /></div>
                <div className="space-y-1"><span className="text-terminal-primary/70">Starting Range Band</span><Select value={newRangeBand} onValueChange={(value: ShipRangeBand) => setNewRangeBand(value)}>
                  <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">
                    {RANGE_BAND_RULES.map((band) => (<SelectItem key={band.key} value={band.key}>{band.label}</SelectItem>))}
                  </SelectContent>
                </Select></div>
                <div className="space-y-1"><span className="text-terminal-primary/70">Role</span><label className="text-xs text-terminal-primary/80 flex items-center gap-2 border border-terminal-primary/40 rounded px-3 h-10"><input type="checkbox" checked={newShipIsPlayer} onChange={(e) => setNewShipIsPlayer(e.target.checked)} /> Player Ship</label></div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addShip} disabled={!newShipName.trim()} size="sm" className="bg-terminal-primary/20 hover:bg-terminal-primary/30 text-terminal-primary">Add</Button>
                <Button onClick={() => setShowAddShip(false)} size="sm" variant="outline" className="border-terminal-primary/50 text-terminal-primary">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-black border-terminal-primary/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-terminal-primary/90 flex items-center gap-2"><Crosshair className="h-4 w-4" />Range Band Reference</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-xs">
            {RANGE_BAND_RULES.map((band) => (
              <div key={band.key} className="border border-terminal-primary/20 rounded px-2 py-1 flex justify-between"><span>{band.label} ({band.distance})</span><span>Δ Thrust {band.thrustRequired}</span></div>
            ))}
          </CardContent>
        </Card>

        {ships.length === 0 ? (
          <Card className="bg-black border-terminal-primary/30"><CardContent className="p-8 text-center text-terminal-primary/70">No ships in encounter. {isGM ? 'Use Add Ship to create the initial battle state.' : 'Waiting for GM to initialize encounter.'}</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
            <div className="space-y-3">
              <Card className="bg-black border-terminal-primary/30">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-terminal-primary/90 flex items-center gap-2"><Users className="h-4 w-4" />Initiative Order</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {initiativeOrder.map((ship, idx) => (
                    <div key={ship.id} className="border border-terminal-primary/25 rounded p-2 flex items-center justify-between gap-2">
                      <div><div className="flex items-center gap-2"><span className="text-terminal-primary/60 w-6">#{idx + 1}</span><span>{ship.name}</span>{ship.surprised && <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">Surprised</Badge>}</div>{ship.initiativeDetail && <div className="text-xs text-terminal-primary/60">{ship.initiativeDetail}</div>}</div>
                      <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/40">{ship.initiative ?? '—'}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {initiativeOrder.map((ship) => {
                const hullPercent = Math.max(0, Math.round((ship.hullCurrent / ship.hullMax) * 100));
                const plan = attackPlans[ship.id] ?? getDefaultAttackState();
                const repairPlan = repairPlans[ship.id] ?? getDefaultRepairState();
                const sensorPlan = sensorPlans[ship.id] ?? { lockTargetId: '', breakLockFromShipId: '' };
                const dogfightPlan = dogfightPlans[ship.id] ?? { targetId: '' };
                const dockingPlan = dockingPlans[ship.id] ?? { targetId: '', mode: 'dock' as const };
                const targets = initiativeOrder.filter((candidate) => candidate.id !== ship.id);
                const activeCriticals = Object.entries(ship.criticals)
                  .filter(([, severity]) => (severity ?? 0) > 0)
                  .map(([loc, severity]) => ({ loc: loc as CriticalLocation, severity: severity as number }));
                const shipsWithLocks = initiativeOrder.filter((entry) => sensorLocks[entry.id]);
                const incomingSalvos = missileSalvos.filter((salvo) => salvo.targetId === ship.id);
                const dogfightTargets = targets.filter((target) => ['adjacent', 'close'].includes(target.rangeBand));
                const dockingTargets = targets.filter((target) => target.rangeBand === 'adjacent');
                const attackTargets = plan.weaponId === 'sandcaster' ? [ship, ...targets] : targets;

                return (
                  <Card key={ship.id} className={`bg-black ${ship.isPlayerShip ? 'border-green-500/50' : 'border-red-500/50'}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2"><Rocket className="h-4 w-4 text-terminal-primary/70" /><span className="font-bold text-terminal-primary">{ship.name}</span><Badge className={ship.isPlayerShip ? 'bg-green-500/20 text-green-300 border-green-500/50' : 'bg-red-500/20 text-red-300 border-red-500/50'}>{ship.isPlayerShip ? 'Player' : 'Hostile'}</Badge><Badge className={rangeBandColors[ship.rangeBand]}>{RANGE_BAND_LABELS[ship.rangeBand]}</Badge></div>
                          <div className="text-xs text-terminal-primary/70 mt-1">Armor {getEffectiveArmor(ship)} · Engineer {ship.engineerSkill} · Sensor {ship.sensorSkill + getSensorCriticalPenalty(ship)} · Captain {ship.captainSkill + getBridgeCriticalPenalty(ship)} · Init = 2D + Pilot {ship.pilotSkill + getPilotCriticalPenalty(ship)} + Thrust {getEffectiveThrust(ship)} + Tactics {ship.tacticsEffect}</div>
                          <div className="text-xs text-terminal-primary/60 mt-1">M-Drive OL DM-{ship.overloadDrivePenalty} · Plant OL DM-{ship.overloadPlantPenalty}{ship.pendingThrustBoost ? ` · Pending +${ship.pendingThrustBoost} Thrust` : ''}{ship.pendingPowerBypass ? ' · Pending Power Bypass' : ''}</div>
                          <div className="text-xs text-terminal-primary/60 mt-1">Missiles {ship.missileAmmo} · Sand {ship.sandAmmo}{ship.sandReloadRounds > 0 ? ` (Reload ${ship.sandReloadRounds})` : ''}{ship.jumpCommitted ? ` · Jump ${ship.jumpChargeRounds}` : ''}{(boardingPressure[ship.id] ?? 0) > 0 ? ` · Boarding Pressure ${boardingPressure[ship.id]}` : ''}</div>
                          {sensorLocks[ship.id] && (<div className="text-xs text-blue-300/80 mt-1">Sensor Lock: {initiativeOrder.find((entry) => entry.id === sensorLocks[ship.id])?.name ?? 'Unknown Target'}</div>)}
                          {getSystemFlags(ship).length > 0 && (<div className="text-xs text-amber-300/80 mt-1">{getSystemFlags(ship).join(' · ')}</div>)}
                          {(dogfightAttackModifiers[ship.id] ?? 0) !== 0 && (<div className="text-xs text-fuchsia-300/80 mt-1">Dogfight Attack DM {dogfightAttackModifiers[ship.id] > 0 ? '+' : ''}{dogfightAttackModifiers[ship.id]}</div>)}
                          {dockedWith[ship.id] && (<div className="text-xs text-cyan-300/80 mt-1">Docked with {initiativeOrder.find((entry) => entry.id === dockedWith[ship.id])?.name ?? 'Unknown'}</div>)}
                        </div>
                        {isGM && (<Button onClick={() => deleteShip(ship.id)} variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/20"><Trash2 className="h-4 w-4" /></Button>)}
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-terminal-primary/70 mb-1"><div className="flex items-center gap-1"><Shield className="h-3 w-3" /><span>Hull</span></div><span>{ship.hullCurrent} / {ship.hullMax}</span></div>
                        <div className="w-full bg-terminal-primary/10 rounded-full h-2"><div className={`h-2 rounded-full ${hullPercent > 60 ? 'bg-green-500' : hullPercent > 30 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${hullPercent}%` }} /></div>
                      </div>

                      {activeCriticals.length > 0 && (
                        <div className="text-xs border border-terminal-warning-alt/40 rounded p-2 space-y-1">
                          <div className="font-semibold text-terminal-warning-light">Criticals</div>
                          {activeCriticals.map((crit) => (
                            <div key={crit.loc} className="flex justify-between"><span>{CRITICAL_LOCATION_LABELS[crit.loc]}</span><span>Severity {crit.severity}</span></div>
                          ))}
                        </div>
                      )}

                      {incomingSalvos.length > 0 && (
                        <div className="text-xs border border-red-500/30 rounded p-2 space-y-1">
                          <div className="font-semibold text-red-300">Incoming Missiles</div>
                          {incomingSalvos.map((salvo) => {
                            const attacker = initiativeOrder.find((entry) => entry.id === salvo.attackerId);
                            return (
                              <div key={salvo.id} className="flex justify-between">
                                <span>{attacker?.name ?? 'Unknown'} · {salvo.missilesRemaining} missile(s)</span>
                                <span>{salvo.roundsToImpact === 0 ? 'Impacting now' : `${salvo.roundsToImpact} round(s)`}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {isGM && phase === 'maneuver' && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                          <div className="space-y-1"><span className="text-terminal-primary/70">Intent</span><Select value={ship.maneuverIntent} onValueChange={(value: 'hold' | 'close' | 'open') => updateShip(ship.id, { maneuverIntent: value })}><SelectTrigger className="h-8 bg-black border-terminal-primary/40 text-terminal-primary"><SelectValue /></SelectTrigger><SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary"><SelectItem value="hold">Hold</SelectItem><SelectItem value="close">Close</SelectItem><SelectItem value="open">Open</SelectItem></SelectContent></Select></div>
                          <div className="space-y-1"><span className="text-terminal-primary/70">Move Thrust</span><Input className="h-8 bg-black border-terminal-primary/40 text-terminal-primary" type="number" min="0" value={ship.movementAllocation} onChange={(e) => updateShip(ship.id, { movementAllocation: Math.max(0, parseInt(e.target.value, 10) || 0) })} /></div>
                          <div className="space-y-1"><span className="text-terminal-primary/70">Evasive Thrust</span><Input className="h-8 bg-black border-terminal-primary/40 text-terminal-primary" type="number" min="0" value={ship.evasiveAllocation} onChange={(e) => updateShip(ship.id, { evasiveAllocation: Math.max(0, parseInt(e.target.value, 10) || 0) })} /></div>
                          <div className="space-y-1"><span className="text-terminal-primary/70">Surprise</span><Button variant="outline" size="sm" onClick={() => updateShip(ship.id, { surprised: !ship.surprised })} className={`w-full h-8 ${ship.surprised ? 'border-yellow-500/60 text-yellow-300' : 'border-terminal-primary/40 text-terminal-primary/80'}`}><AlertTriangle className="h-3 w-3 mr-1" />{ship.surprised ? 'Surprised' : 'Ready'}</Button></div>
                        </div>
                      )}

                      {isGM && phase === 'maneuver' && dogfightTargets.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs border border-fuchsia-500/30 rounded p-2">
                          <div className="space-y-1 md:col-span-2"><span className="text-terminal-primary/70">Dogfight Target</span><Select value={dogfightPlan.targetId} onValueChange={(value) => updateDogfightPlan(ship.id, { targetId: value })}><SelectTrigger className="h-8 bg-black border-terminal-primary/40 text-terminal-primary"><SelectValue placeholder="Select target" /></SelectTrigger><SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">{dogfightTargets.map((target) => (<SelectItem key={target.id} value={target.id}>{target.name}</SelectItem>))}</SelectContent></Select></div>
                          <div className="space-y-1 md:col-span-2"><span className="text-terminal-primary/70">Dogfight</span><Button className="w-full h-8 bg-fuchsia-500/20 text-fuchsia-300 hover:bg-fuchsia-500/30" disabled={!dogfightPlan.targetId} onClick={() => resolveDogfight(ship.id)}><Crosshair className="h-3 w-3 mr-1" />Resolve Dogfight</Button></div>
                        </div>
                      )}

                      {isGM && phase === 'attack' && targets.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-xs">
                          <div className="space-y-1"><span className="text-terminal-primary/70">Target</span><Select value={plan.targetId} onValueChange={(value) => updateAttackPlan(ship.id, { targetId: value })}><SelectTrigger className="h-8 bg-black border-terminal-primary/40 text-terminal-primary"><SelectValue placeholder="Target" /></SelectTrigger><SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">{targets.map((target) => (<SelectItem key={target.id} value={target.id}>{target.name}</SelectItem>))}</SelectContent></Select></div>
                          <div className="space-y-1"><span className="text-terminal-primary/70">Weapon</span><Select value={plan.weaponId} onValueChange={(value) => updateAttackPlan(ship.id, { weaponId: value })}><SelectTrigger className="h-8 bg-black border-terminal-primary/40 text-terminal-primary"><SelectValue /></SelectTrigger><SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">{SHIP_WEAPON_PRESETS.map((weapon) => (<SelectItem key={weapon.id} value={weapon.id}>{weapon.name}</SelectItem>))}</SelectContent></Select></div>
                          <div className="space-y-1"><span className="text-terminal-primary/70">Situational DM</span><Input className="h-8 bg-black border-terminal-primary/40 text-terminal-primary" type="number" value={plan.situationalDM} onChange={(e) => updateAttackPlan(ship.id, { situationalDM: parseInt(e.target.value, 10) || 0 })} /></div>
                          <div className="space-y-1"><span className="text-terminal-primary/70">Called Shot</span><Select value={plan.calledShotLocation} onValueChange={(value) => updateAttackPlan(ship.id, { calledShotLocation: value as CriticalLocation | 'none' })}><SelectTrigger className="h-8 bg-black border-terminal-primary/40 text-terminal-primary"><SelectValue placeholder="None" /></SelectTrigger><SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary"><SelectItem value="none">None</SelectItem>{CRITICAL_LOCATIONS.map((loc) => (<SelectItem key={loc} value={loc}>{CRITICAL_LOCATION_LABELS[loc]}</SelectItem>))}</SelectContent></Select></div>
                          <div className="space-y-1 md:col-span-2"><span className="text-terminal-primary/70">Attack</span><Button onClick={() => resolveAttack(ship.id)} className="w-full h-8 bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30" disabled={!plan.targetId}><Target className="h-3 w-3 mr-1" />Resolve Attack</Button></div>
                        </div>
                      )}


                      {isGM && phase === 'actions' && dockingTargets.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-xs border border-cyan-500/30 rounded p-2">
                          <div className="space-y-1 md:col-span-2"><span className="text-terminal-primary/70">Dock/Board Target</span><Select value={dockingPlan.targetId} onValueChange={(value) => updateDockingPlan(ship.id, { targetId: value })}><SelectTrigger className="h-8 bg-black border-terminal-primary/40 text-terminal-primary"><SelectValue placeholder="Adjacent target" /></SelectTrigger><SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">{dockingTargets.map((target) => (<SelectItem key={target.id} value={target.id}>{target.name}</SelectItem>))}</SelectContent></Select></div>
                          <div className="space-y-1"><span className="text-terminal-primary/70">Mode</span><Select value={dockingPlan.mode} onValueChange={(value) => updateDockingPlan(ship.id, { mode: value as 'dock' | 'board' })}><SelectTrigger className="h-8 bg-black border-terminal-primary/40 text-terminal-primary"><SelectValue /></SelectTrigger><SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary"><SelectItem value="dock">Dock</SelectItem><SelectItem value="board">Board</SelectItem></SelectContent></Select></div>
                          <div className="space-y-1 md:col-span-2"><span className="text-terminal-primary/70">Docking Action</span><Button className="w-full h-8 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30" disabled={!dockingPlan.targetId} onClick={() => attemptDockOrBoard(ship.id)}><Users className="h-3 w-3 mr-1" />Resolve {dockingPlan.mode === 'dock' ? 'Docking' : 'Boarding'}</Button></div>
                          <div className="space-y-1"><span className="text-terminal-primary/70">Repel</span><Button className="w-full h-8 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30" disabled={(boardingPressure[ship.id] ?? 0) <= 0} onClick={() => attemptRepelBoarders(ship.id)}><Shield className="h-3 w-3 mr-1" />Repel</Button></div>
                        </div>
                      )}

                      {isGM && phase === 'actions' && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs border border-violet-500/30 rounded p-2">
                          <div className="space-y-1 md:col-span-3"><span className="text-terminal-primary/70">Jump Procedure</span><div className="h-8 border border-violet-500/40 rounded px-2 flex items-center text-violet-200">{ship.jumpCommitted ? `Charging jump drive: ${ship.jumpChargeRounds} round(s)` : 'Not charging'}</div></div>
                          <div className="space-y-1"><span className="text-terminal-primary/70">Action</span><Button className="w-full h-8 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30" disabled={ship.jumpCommitted} onClick={() => attemptJump(ship.id)}><Zap className="h-3 w-3 mr-1" />Init Jump</Button></div>
                        </div>
                      )}

                      {isGM && phase === 'actions' && activeCriticals.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs border border-terminal-primary/25 rounded p-2">
                          <div className="space-y-1 md:col-span-2"><span className="text-terminal-primary/70">Repair Location</span><Select value={repairPlan.location} onValueChange={(value: CriticalLocation) => updateRepairPlan(ship.id, { location: value })}><SelectTrigger className="h-8 bg-black border-terminal-primary/40 text-terminal-primary"><SelectValue placeholder="Select location" /></SelectTrigger><SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">{activeCriticals.map((entry) => (<SelectItem key={entry.loc} value={entry.loc}>{CRITICAL_LOCATION_LABELS[entry.loc]} (S{entry.severity})</SelectItem>))}</SelectContent></Select></div>
                          <div className="space-y-1"><span className="text-terminal-primary/70">Progress</span><div className="h-8 border border-terminal-primary/30 rounded px-2 flex items-center">+{repairPlan.location ? (ship.repairProgress[repairPlan.location] ?? 0) : 0}</div></div>
                          <div className="space-y-1"><span className="text-terminal-primary/70">Action</span><Button className="w-full h-8 bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30" disabled={!repairPlan.location} onClick={() => attemptRepair(ship.id)}><Wrench className="h-3 w-3 mr-1" />Repair</Button></div>
                        </div>
                      )}

                      {isGM && phase === 'actions' && targets.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-xs border border-blue-500/30 rounded p-2">
                          <div className="space-y-1 md:col-span-2"><span className="text-terminal-primary/70">Sensor Lock Target</span><Select value={sensorPlan.lockTargetId} onValueChange={(value) => updateSensorPlan(ship.id, { lockTargetId: value })}><SelectTrigger className="h-8 bg-black border-terminal-primary/40 text-terminal-primary"><SelectValue placeholder="Select target" /></SelectTrigger><SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">{targets.map((target) => (<SelectItem key={target.id} value={target.id}>{target.name}</SelectItem>))}</SelectContent></Select></div>
                          <div className="space-y-1"><span className="text-terminal-primary/70">Lock Action</span><Button className="w-full h-8 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30" disabled={!sensorPlan.lockTargetId} onClick={() => attemptSensorLock(ship.id)}><Target className="h-3 w-3 mr-1" />Lock</Button></div>
                          <div className="space-y-1 md:col-span-2"><span className="text-terminal-primary/70">Break Lock From</span><Select value={sensorPlan.breakLockFromShipId} onValueChange={(value) => updateSensorPlan(ship.id, { breakLockFromShipId: value })}><SelectTrigger className="h-8 bg-black border-terminal-primary/40 text-terminal-primary"><SelectValue placeholder="Select locker" /></SelectTrigger><SelectContent className="bg-black border-terminal-primary/50 text-terminal-primary">{shipsWithLocks.filter((entry) => entry.id !== ship.id).map((entry) => (<SelectItem key={entry.id} value={entry.id}>{entry.name}</SelectItem>))}</SelectContent></Select></div>
                          <div className="space-y-1"><span className="text-terminal-primary/70">EW Action</span><Button className="w-full h-8 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30" disabled={!sensorPlan.breakLockFromShipId} onClick={() => attemptBreakSensorLock(ship.id)}><Zap className="h-3 w-3 mr-1" />Break</Button></div>
                        </div>
                      )}

                      {isGM && phase === 'actions' && incomingSalvos.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs border border-red-500/30 rounded p-2">
                          {incomingSalvos.map((salvo) => (
                            <div key={salvo.id} className="border border-red-500/20 rounded p-2 space-y-1">
                              <div className="text-red-300">Salvo: {salvo.missilesRemaining} missile(s) · {salvo.roundsToImpact === 0 ? 'Impacting now' : `${salvo.roundsToImpact} round(s)`}</div>
                              <div className="grid grid-cols-2 gap-1">
                                <Button className="h-8 bg-red-500/20 text-red-300 hover:bg-red-500/30" onClick={() => attemptPointDefense(ship.id, salvo.id)}><Shield className="h-3 w-3 mr-1" />Point Def</Button>
                                <Button className="h-8 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30" onClick={() => attemptMissileEW(ship.id, salvo.id)}><Zap className="h-3 w-3 mr-1" />EW</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}


                      {isGM && phase === 'actions' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs border border-orange-500/30 rounded p-2">
                          <div className="space-y-1"><span className="text-terminal-primary/70">Engineer</span><Button className="w-full h-8 bg-orange-500/20 text-orange-300 hover:bg-orange-500/30" onClick={() => attemptOverloadDrive(ship.id)}><Zap className="h-3 w-3 mr-1" />Overload Drive</Button></div>
                          <div className="space-y-1"><span className="text-terminal-primary/70">Engineer</span><Button className="w-full h-8 bg-orange-500/20 text-orange-300 hover:bg-orange-500/30" onClick={() => attemptOverloadPlant(ship.id)}><Zap className="h-3 w-3 mr-1" />Overload Plant</Button></div>
                          <div className="space-y-1"><span className="text-terminal-primary/70">Maintenance</span><Button className="w-full h-8 bg-slate-500/20 text-slate-300 hover:bg-slate-500/30" onClick={() => resetOverloadPenalties(ship.id)}><Wrench className="h-3 w-3 mr-1" />Reset Penalties</Button></div>
                        </div>
                      )}

                      {isGM && phase === 'actions' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs border border-emerald-500/30 rounded p-2">
                          <div className="space-y-1"><span className="text-terminal-primary/70">Captain</span><Button className="w-full h-8 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30" onClick={() => attemptImproveInitiative(ship.id)}><Gauge className="h-3 w-3 mr-1" />Improve Initiative</Button></div>
                          <div className="space-y-1"><span className="text-terminal-primary/70">Pilot</span><Button className="w-full h-8 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30" onClick={() => attemptAidGunners(ship.id)}><Crosshair className="h-3 w-3 mr-1" />Aid Gunners</Button></div>
                        </div>
                      )}


                      {!isGM && (<div className="text-xs text-terminal-primary/70 flex items-center gap-2"><Crosshair className="h-3 w-3" />Range {RANGE_BAND_LABELS[ship.rangeBand]} · Armor {ship.armor} · Thrust {ship.thrust}</div>)}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-black border-terminal-primary/30">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-terminal-primary/90 flex items-center gap-2"><ListOrdered className="h-4 w-4" /> Combat Log</CardTitle></CardHeader>
              <CardContent className="space-y-2 max-h-[680px] overflow-auto text-xs">
                {combatLog.filter((entry) => isGM || !entry.gmOnly).map((entry) => (
                  <div key={entry.id} className="border border-terminal-primary/20 rounded p-2"><div className="text-terminal-primary/60 mb-1">R{entry.round} · {COMBAT_PHASE_LABELS[entry.phase]}</div><div className="text-terminal-primary/90">{entry.message}</div></div>
                ))}
                {combatLog.length === 0 && <div className="text-terminal-primary/60">No events yet. Start by adding ships and rolling initiative.</div>}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
