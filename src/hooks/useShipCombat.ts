import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { Contact, CriticalLocationKey } from '@/lib/bridge/bridgeTypes';
import type {
  CombatLogEntry,
  AttackState,
  RepairState,
  SensorActionState,
  DogfightState,
  DockingState,
  MissileSalvo,
  ShipCombatEngineState,
  CombatReadoutEvent,
  ReadoutCategory,
} from '@/types/shipCombatBridge';
import { getDefaultAttackState, getDefaultRepairState } from '@/types/shipCombatBridge';
import { roll2d6, roll1d6, rollDamageExpression } from '@/lib/dice';
import {
  COMBAT_PHASES,
  COMBAT_PHASE_LABELS,
  CRITICAL_LOCATIONS,
  CRITICAL_LOCATION_LABELS,
  RANGE_BAND_LABELS,
  RANGE_BAND_RULES,
  RANGE_ATTACK_MODIFIERS,
  SHIP_WEAPON_PRESETS,
  getRangeBandShift,
  isWeaponInRange,
  type CombatPhase,
  type CriticalLocation,
  type ShipRangeBand,
} from '@/lib/bridge/shipCombatRules';
import { hexDistance, hexDistanceToRangeBand } from '@/lib/bridge/hexCombatUtils';

// ── Helper functions (extracted from ShipCombatTracker) ──

function pickRandomCriticalLocation(): CriticalLocation {
  const roll = roll2d6();
  return CRITICAL_LOCATIONS[roll - 2];
}

function getCriticalSeverity(contact: Contact, location: CriticalLocation): number {
  return contact.criticals?.[location as CriticalLocationKey] ?? 0;
}

function getEffectiveArmor(contact: Contact): number {
  return Math.max(0, (contact.armor ?? 0) - getCriticalSeverity(contact, 'armor'));
}

function getEffectiveThrust(contact: Contact): number {
  const mDriveSeverity = getCriticalSeverity(contact, 'm_drive');
  const baseThrust = (contact.thrust ?? 0) + (contact.activeThrustBoost ?? 0);
  const powerPenalty = contact.activePowerBypass ? 0 : getPowerPlantThrustPenalty(contact);
  if (mDriveSeverity >= 5) return 0;
  if (powerPenalty >= 99) return 0;
  const mDrivePenalty = mDriveSeverity >= 2 ? 1 : 0;
  return Math.max(0, baseThrust - mDrivePenalty - powerPenalty);
}

function getPilotCriticalPenalty(contact: Contact): number {
  return getCriticalSeverity(contact, 'm_drive') >= 1 ? -1 : 0;
}

function getGunnerCriticalPenalty(contact: Contact): number {
  return getCriticalSeverity(contact, 'weapon') >= 1 ? -1 : 0;
}

function getSensorCriticalPenalty(contact: Contact): number {
  return getCriticalSeverity(contact, 'sensors') >= 1 ? -2 : 0;
}

function getBridgeCriticalPenalty(contact: Contact): number {
  return getCriticalSeverity(contact, 'bridge') >= 1 ? -1 : 0;
}

function getCrewCriticalPenalty(contact: Contact): number {
  return getCriticalSeverity(contact, 'crew') >= 3 ? -1 : 0;
}

function getPowerPlantThrustPenalty(contact: Contact): number {
  const severity = getCriticalSeverity(contact, 'power_plant');
  if (severity >= 4) return 99;
  if (severity >= 3) return 1;
  return 0;
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

export function getSystemFlags(contact: Contact): string[] {
  const flags: string[] = [];
  if (getCriticalSeverity(contact, 'power_plant') >= 4) flags.push('Power 0%');
  if (getCriticalSeverity(contact, 'm_drive') >= 5) flags.push('Thrust 0');
  if (getCriticalSeverity(contact, 'sensors') >= 4) flags.push('Sensors severely degraded');
  if (getCriticalSeverity(contact, 'weapon') >= 2) flags.push('Weapons disabled risk');
  return flags;
}

export { getEffectiveThrust, getCriticalSeverity };

/**
 * Compute the range band between two contacts on the hex grid.
 */
function getContactRangeBand(a: Contact, b: Contact): ShipRangeBand {
  return hexDistanceToRangeBand(hexDistance(a.hexQ, a.hexR, b.hexQ, b.hexR));
}

// ── The Hook ──

interface UseShipCombatParams {
  contacts: Contact[];
  updateContactFields: (id: string, fields: Partial<Contact>) => Promise<void>;
  moveShip: (id: string, q: number, r: number) => Promise<void>;
}

export function useShipCombat({ contacts, updateContactFields, moveShip }: UseShipCombatParams) {
  const [isActive, setIsActive] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [phase, setPhase] = useState<CombatPhase>('setup');
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

  // Combatants are contacts marked as in combat
  const combatants = useMemo(
    () => contacts.filter(c => c.isInCombat),
    [contacts]
  );

  const initiativeOrder = useMemo(
    () => [...combatants].sort((a, b) => (b.initiative ?? -999) - (a.initiative ?? -999)),
    [combatants]
  );

  const logRef = useRef(combatLog);
  useEffect(() => { logRef.current = combatLog; }, [combatLog]);

  const roundRef = useRef(currentRound);
  useEffect(() => { roundRef.current = currentRound; }, [currentRound]);

  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const addLog = useCallback((message: string, gmOnly = false) => {
    setCombatLog(prev => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        round: roundRef.current,
        phase: phaseRef.current,
        message,
        gmOnly,
      },
      ...prev,
    ]);
  }, []);

  // ── Combat Readout Queue (for overlay HUD events) ──

  const [readoutQueue, setReadoutQueue] = useState<CombatReadoutEvent[]>([]);

  const pushReadout = useCallback((
    category: ReadoutCategory,
    title: string,
    details: string[],
    accent: CombatReadoutEvent['accent'] = 'green',
  ) => {
    const event: CombatReadoutEvent = {
      id: `readout-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      category,
      title,
      details,
      accent,
      timestamp: Date.now(),
    };
    setReadoutQueue(prev => [event, ...prev]);
  }, []);

  const dismissReadout = useCallback((id: string) => {
    setReadoutQueue(prev => prev.filter(r => r.id !== id));
  }, []);

  // ── Combat lifecycle ──

  const startCombat = useCallback(() => {
    setIsActive(true);
    setCurrentRound(1);
    setPhase('setup');
    setCombatLog([]);
    setAttackPlans({});
    setRepairPlans({});
    setSensorPlans({});
    setDogfightPlans({});
    setDockingPlans({});
    setBoardingPressure({});
    setDockedWith({});
    setSensorLocks({});
    setInitiativeModifiers({});
    setDogfightAttackModifiers({});
    setDogfightMomentum({});
    setGunnerAssist({});
    setMissileSalvos([]);
    addLog('Ship combat initiated.');
  }, [addLog]);

  const endCombat = useCallback(async () => {
    // Clear combat fields from all combatants
    for (const c of combatants) {
      await updateContactFields(c.id, {
        isInCombat: false,
        initiative: undefined,
        initiativeDetail: undefined,
        movementAllocation: undefined,
        evasiveAllocation: undefined,
        maneuverIntent: undefined,
        surprised: undefined,
        criticals: undefined,
        sustainedDamageCounter: undefined,
        repairProgress: undefined,
        pendingThrustBoost: undefined,
        activeThrustBoost: undefined,
        pendingPowerBypass: undefined,
        activePowerBypass: undefined,
        overloadDrivePenalty: undefined,
        overloadPlantPenalty: undefined,
        sandReloadRounds: undefined,
        sandScreen: undefined,
        jumpChargeRounds: undefined,
        jumpCommitted: undefined,
      });
      // Mark destroyed ships as derelict
      if ((c.hullCurrent ?? 0) <= 0) {
        await updateContactFields(c.id, { status: 'derelict' });
      }
    }
    setIsActive(false);
    addLog('Combat ended.');
  }, [combatants, updateContactFields, addLog]);

  // ── Mark contact as combatant ──

  const addToCombat = useCallback(async (contactId: string) => {
    await updateContactFields(contactId, {
      isInCombat: true,
      movementAllocation: 0,
      evasiveAllocation: 0,
      maneuverIntent: 'hold',
      surprised: false,
      criticals: {},
      sustainedDamageCounter: 0,
      repairProgress: {},
      pendingThrustBoost: 0,
      activeThrustBoost: 0,
      pendingPowerBypass: false,
      activePowerBypass: false,
      overloadDrivePenalty: 0,
      overloadPlantPenalty: 0,
      sandReloadRounds: 0,
      sandScreen: 0,
      jumpChargeRounds: 0,
      jumpCommitted: false,
    });
    setAttackPlans(prev => ({ ...prev, [contactId]: getDefaultAttackState() }));
    setRepairPlans(prev => ({ ...prev, [contactId]: getDefaultRepairState() }));
    setSensorPlans(prev => ({ ...prev, [contactId]: { lockTargetId: '', breakLockFromShipId: '' } }));
    setDogfightPlans(prev => ({ ...prev, [contactId]: { targetId: '' } }));
    setDockingPlans(prev => ({ ...prev, [contactId]: { targetId: '', mode: 'dock' } }));
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      addLog(`Added ${contact.name} to combat.`, true);
    }
  }, [contacts, updateContactFields, addLog]);

  const removeFromCombat = useCallback(async (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    await updateContactFields(contactId, { isInCombat: false });
    // Cleanup plans
    setAttackPlans(prev => { const n = { ...prev }; delete n[contactId]; return n; });
    setRepairPlans(prev => { const n = { ...prev }; delete n[contactId]; return n; });
    setSensorPlans(prev => { const n = { ...prev }; delete n[contactId]; return n; });
    setDogfightPlans(prev => { const n = { ...prev }; delete n[contactId]; return n; });
    setDockingPlans(prev => { const n = { ...prev }; delete n[contactId]; return n; });
    setSensorLocks(prev => Object.fromEntries(Object.entries(prev).filter(([k, v]) => k !== contactId && v !== contactId)));
    setBoardingPressure(prev => { const n = { ...prev }; delete n[contactId]; return n; });
    setDockedWith(prev => {
      const n = { ...prev };
      const partner = n[contactId];
      delete n[contactId];
      if (partner) delete n[partner];
      return n;
    });
    setInitiativeModifiers(prev => { const n = { ...prev }; delete n[contactId]; return n; });
    setGunnerAssist(prev => { const n = { ...prev }; delete n[contactId]; return n; });
    setDogfightAttackModifiers(prev => { const n = { ...prev }; delete n[contactId]; return n; });
    setDogfightMomentum(prev => { const n = { ...prev }; delete n[contactId]; return n; });
    setMissileSalvos(prev => prev.filter(s => s.attackerId !== contactId && s.targetId !== contactId));
    if (contact) addLog(`Removed ${contact.name} from combat.`, true);
  }, [contacts, updateContactFields, addLog]);

  // ── Damage application ──

  const applyDamageToShip = useCallback((contactId: string, rawDamage: number, source: string, criticalEffect?: number, forcedCriticalLocation?: CriticalLocation) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    let hullCurrent = contact.hullCurrent ?? 0;
    const damageTaken = Math.min(hullCurrent, rawDamage);
    hullCurrent = Math.max(0, hullCurrent - rawDamage);
    const threshold = Math.max(1, Math.floor((contact.hullMax ?? 1) * 0.1));
    let sustained = (contact.sustainedDamageCounter ?? 0) + damageTaken;
    let criticals = { ...(contact.criticals ?? {}) };

    const applyCrit = (location: CriticalLocation, incomingSeverity: number, reason: string) => {
      const currentSeverity = criticals[location as CriticalLocationKey] ?? 0;
      const nextSeverity = Math.min(6, Math.max(incomingSeverity, currentSeverity + 1));
      criticals = { ...criticals, [location]: nextSeverity };
      addLog(`${contact.name} takes critical hit at ${CRITICAL_LOCATION_LABELS[location]} (severity ${nextSeverity})${reason ? `: ${reason}` : ''}.`, true);
      pushReadout('critical', 'CRITICAL HIT', [
        `${contact.name}: ${CRITICAL_LOCATION_LABELS[location].toUpperCase()}`,
        `Severity: ${nextSeverity}/6${reason ? ` — ${reason}` : ''}`,
      ], 'red');
      if (location === 'hull') {
        const hullSplash = rollDamageExpression(`${nextSeverity}d6`).total;
        hullCurrent = Math.max(0, hullCurrent - hullSplash);
        addLog(`${contact.name} suffers additional hull critical damage ${hullSplash}.`, true);
      }
    };

    while (sustained >= threshold) {
      sustained -= threshold;
      applyCrit(pickRandomCriticalLocation(), 1, 'threshold damage');
    }

    if (criticalEffect && criticalEffect >= 6 && damageTaken > 0) {
      const loc = forcedCriticalLocation ?? pickRandomCriticalLocation();
      const severity = Math.min(6, criticalEffect - 5);
      applyCrit(loc, severity, forcedCriticalLocation ? 'called shot' : 'high-effect attack');
    }

    updateContactFields(contactId, {
      hullCurrent,
      sustainedDamageCounter: sustained,
      criticals,
      status: hullCurrent <= 0 ? 'derelict' : contact.status,
    });
    // Clear sensor locks involving destroyed ships
    if (hullCurrent <= 0) {
      setSensorLocks(prev => Object.fromEntries(Object.entries(prev).filter(([k, v]) => k !== contactId && v !== contactId)));
    }
    addLog(`${source} deals ${rawDamage} damage.`);
  }, [contacts, updateContactFields, addLog, pushReadout]);

  // ── Initiative ──

  const rollInitiative = useCallback(async (manualRolls?: Record<string, number>) => {
    for (const ship of combatants) {
      const dice = manualRolls?.[ship.id] ?? roll2d6();
      const commandMod = initiativeModifiers[ship.id] ?? 0;
      const pilotScore = (ship.pilotSkill ?? 0) + getPilotCriticalPenalty(ship) + getCrewCriticalPenalty(ship) - Math.min(3, boardingPressure[ship.id] ?? 0);
      const thrustScore = getEffectiveThrust(ship);
      const bridgePenalty = getBridgeCriticalPenalty(ship);
      const total = dice + pilotScore + thrustScore + (ship.tacticsEffect ?? 0) + commandMod + bridgePenalty;
      const rollLabel = manualRolls?.[ship.id] != null ? `${dice}(manual)` : String(dice);
      await updateContactFields(ship.id, {
        initiative: total,
        initiativeDetail: `${rollLabel} + Pilot ${pilotScore} + Thrust ${thrustScore} + Tactics ${ship.tacticsEffect ?? 0}${commandMod ? ` + Command ${commandMod}` : ''}${bridgePenalty ? ` ${bridgePenalty}` : ''}`,
      });
    }
    addLog('Initiative rolled for all ships.');
    const sorted = [...combatants].sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0));
    pushReadout('initiative', 'INITIATIVE ORDER', sorted.map((s, i) => `${i + 1}. ${s.name}: ${s.initiative ?? '?'}`), 'cyan');
    setInitiativeModifiers({});
    setPhase('maneuver');
  }, [combatants, initiativeModifiers, boardingPressure, updateContactFields, addLog, pushReadout]);

  // ── Maneuver ──

  const updateShipManeuver = useCallback(async (contactId: string, fields: {
    movementAllocation?: number;
    evasiveAllocation?: number;
    maneuverIntent?: 'hold' | 'close' | 'open';
    thrust?: number;
  }) => {
    await updateContactFields(contactId, fields);
  }, [updateContactFields]);

  const applyManeuverStep = useCallback(async () => {
    const playerShip = combatants.find(c => c.isPlayerShip);

    for (const ship of combatants) {
      const effectiveThrust = getEffectiveThrust(ship);
      const movAlloc = ship.movementAllocation ?? 0;
      const evaAlloc = ship.evasiveAllocation ?? 0;
      const totalAllocated = movAlloc + evaAlloc;

      if (totalAllocated > effectiveThrust) {
        addLog(`${ship.name} over-allocated thrust (${totalAllocated}/${effectiveThrust}). Allocation reset.`, true);
        await updateContactFields(ship.id, { movementAllocation: 0, evasiveAllocation: 0, maneuverIntent: 'hold' });
        continue;
      }

      // Log evasive posture
      if (evaAlloc > 0) {
        const pilotSkill = ship.pilotSkill ?? 0;
        const effectiveEvasive = Math.min(evaAlloc, pilotSkill);
        addLog(`${ship.name} takes evasive action (${evaAlloc} thrust): -${effectiveEvasive} to incoming attacks this round.`);
      }

      // Compute current range to player ship and apply movement
      if (playerShip && ship.id !== playerShip.id && ship.maneuverIntent && ship.maneuverIntent !== 'hold') {
        const currentRange = getContactRangeBand(ship, playerShip);
        const required = RANGE_BAND_RULES.find(b => b.key === currentRange)?.thrustRequired ?? 1;
        if (movAlloc >= required) {
          const nextRange = getRangeBandShift(currentRange, ship.maneuverIntent);
          if (nextRange !== currentRange) {
            addLog(`${ship.name} maneuvers to ${RANGE_BAND_LABELS[nextRange]} range (used ${movAlloc} thrust, needed ${required}).`);
          } else {
            addLog(`${ship.name} holds position at ${RANGE_BAND_LABELS[currentRange]} (already at range limit).`);
          }
        } else {
          addLog(`${ship.name} lacks thrust to change range (has ${movAlloc}, needs ${required} for ${RANGE_BAND_LABELS[currentRange]}).`);
        }
      } else if (movAlloc > 0) {
        addLog(`${ship.name} uses ${movAlloc} thrust for positional movement.`);
      }
    }
    addLog('--- Maneuver phase complete. Entering attack phase. ---');
    setPhase('attack');
  }, [combatants, updateContactFields, addLog]);

  // ── Attack resolution ──

  const resolveAttack = useCallback((attackerId: string, manualHitRoll?: number, manualDamageRoll?: number) => {
    const attacker = contacts.find(c => c.id === attackerId);
    const plan = attackPlans[attackerId] ?? getDefaultAttackState();
    const weapon = SHIP_WEAPON_PRESETS.find(w => w.id === plan.weaponId);
    const targetId = weapon?.id === 'sandcaster' ? (plan.targetId || attackerId) : plan.targetId;
    const target = contacts.find(c => c.id === targetId);
    if (!attacker || !target || !weapon) return;

    if (attacker.surprised && currentRound === 1) {
      addLog(`${attacker.name} is surprised and cannot attack this round.`, true);
      return;
    }

    // Compute range band from hex positions
    const rangeBand = getContactRangeBand(attacker, target);

    if (!isWeaponInRange(weapon.maxRange, rangeBand)) {
      addLog(`${attacker.name} cannot fire ${weapon.name}: ${target.name} is out of range (${RANGE_BAND_LABELS[rangeBand]}).`);
      return;
    }

    const canCallShot = rangeBand === 'adjacent' || rangeBand === 'close' || rangeBand === 'short';
    if (plan.calledShotLocation !== 'none' && (weapon.id === 'missile_rack' || !canCallShot)) {
      addLog(`${attacker.name} cannot use called shot here (requires non-missile at Short range or closer).`, true);
    }

    const dice = manualHitRoll ?? roll2d6();
    const rangeMod = RANGE_ATTACK_MODIFIERS[rangeBand];
    const sizeMod = Math.min(6, Math.floor((target.tonnage ?? 100) / 1000));
    const targetPilotSkill = Math.max(0, (target.pilotSkill ?? 0) + getPilotCriticalPenalty(target) + getCrewCriticalPenalty(target));
    const evasivePenalty = Math.min(target.evasiveAllocation ?? 0, targetPilotSkill);
    const assistBonus = gunnerAssist[attacker.id] ?? 0;
    const attackerGunnerSkill = (attacker.gunnerSkill ?? 0) + getGunnerCriticalPenalty(attacker) + getBridgeCriticalPenalty(attacker) + getCrewCriticalPenalty(attacker);
    const calledShotEligible = plan.calledShotLocation !== 'none' && weapon.id !== 'missile_rack' && canCallShot;
    const calledShotPenalty = calledShotEligible ? -2 : 0;
    const dogfightMod = dogfightAttackModifiers[attacker.id] ?? 0;
    const isLaserWeapon = weapon.id === 'pulse_laser' || weapon.id === 'beam_laser';
    const sandPenalty = isLaserWeapon ? Math.max(0, target.sandScreen ?? 0) : 0;
    const total = dice + attackerGunnerSkill + assistBonus + rangeMod + weapon.attackModifier + sizeMod + plan.situationalDM + calledShotPenalty + dogfightMod - evasivePenalty - sandPenalty;
    const lockBonus = sensorLocks[attacker.id] === target.id ? 2 : 0;
    const grandTotal = total + lockBonus;
    const effect = grandTotal - 8;
    const rollLabel = manualHitRoll != null ? `${dice}(manual)` : String(dice);

    if (grandTotal < 8) {
      addLog(`${attacker.name} misses ${target.name} with ${weapon.name} (2d6: ${rollLabel}, total: ${grandTotal}${sandPenalty ? ` incl. sand -${sandPenalty}` : ''}).`);
      pushReadout('attack_miss', `${weapon.name.toUpperCase()} — MISS`, [
        `${attacker.name} → ${target.name}`,
        `Roll: ${rollLabel} | Total: ${grandTotal} | Needed: 8+`,
        `Range: ${RANGE_BAND_LABELS[rangeBand]}${evasivePenalty ? ` | Evasion: -${evasivePenalty}` : ''}`,
      ], 'orange');
      return;
    }

    // Sandcaster
    if (weapon.id === 'sandcaster') {
      if ((attacker.sandAmmo ?? 0) <= 0) {
        addLog(`${attacker.name} cannot fire sandcaster: no sand canisters remaining.`, true);
        return;
      }
      if ((attacker.sandReloadRounds ?? 0) > 0) {
        addLog(`${attacker.name} sandcaster is reloading (${attacker.sandReloadRounds} round(s) remaining).`, true);
        return;
      }
      const sandValue = roll1d6() + Math.max(0, effect);
      updateContactFields(attacker.id, {
        sandAmmo: Math.max(0, (attacker.sandAmmo ?? 0) - 1),
        sandReloadRounds: 1,
        sandScreen: sandValue,
      });
      addLog(`${attacker.name} deploys sand screen (DM-${sandValue} against laser attacks this round).`, true);
      pushReadout('general', 'SAND SCREEN DEPLOYED', [
        `${attacker.name} deploys countermeasures`,
        `Laser attack DM: -${sandValue} this round`,
      ], 'cyan');
      return;
    }

    // Missiles
    if (weapon.id === 'missile_rack') {
      if ((attacker.missileAmmo ?? 0) <= 0) {
        addLog(`${attacker.name} cannot fire missiles: magazine empty.`, true);
        return;
      }
      const desiredMissiles = Math.min(6, 1 + Math.max(0, effect));
      const missiles = Math.min(desiredMissiles, attacker.missileAmmo ?? 0);
      updateContactFields(attacker.id, { missileAmmo: Math.max(0, (attacker.missileAmmo ?? 0) - missiles) });
      const roundsToImpact = getMissileFlightRounds(rangeBand);
      setMissileSalvos(prev => [{
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        attackerId: attacker.id,
        targetId: target.id,
        missilesRemaining: missiles,
        roundsToImpact,
        launchedRangeBand: rangeBand,
        launchedRound: currentRound,
      }, ...prev]);
      addLog(`${attacker.name} launches missile salvo (${missiles}) at ${target.name}; impact ${roundsToImpact === 0 ? 'immediate' : `in ${roundsToImpact} round(s)`}.`, true);
      pushReadout('missile_launch', 'MISSILES AWAY', [
        `${attacker.name} → ${target.name}`,
        `Salvo: ${missiles} missile${missiles > 1 ? 's' : ''}`,
        `Impact: ${roundsToImpact === 0 ? 'IMMEDIATE' : `${roundsToImpact} round${roundsToImpact > 1 ? 's' : ''}`}`,
      ], 'orange');
      return;
    }

    // Direct fire
    const baseDamage = manualDamageRoll ?? rollDamageExpression(weapon.damage).total;
    const modifiedDamage = baseDamage + Math.max(0, effect);
    const effectiveTargetArmor = getEffectiveArmor(target);
    const finalDamage = Math.max(0, modifiedDamage - effectiveTargetArmor);
    const dmgLabel = manualDamageRoll != null ? `${baseDamage}(manual)` : String(baseDamage);

    applyDamageToShip(
      target.id,
      finalDamage,
      `${attacker.name} hits ${target.name} with ${weapon.name} (2d6: ${rollLabel}, total: ${grandTotal}${lockBonus ? ` lock+${lockBonus}` : ''}${assistBonus ? ` aid+${assistBonus}` : ''}${dogfightMod ? ` dogfight${dogfightMod >= 0 ? '+' : ''}${dogfightMod}` : ''}${sandPenalty ? ` sand-${sandPenalty}` : ''}${calledShotEligible ? ' called-shot' : ''}, effect ${effect}, dmg ${dmgLabel}+${Math.max(0,effect)}, armor ${effectiveTargetArmor})`,
      effect,
      calledShotEligible ? (plan.calledShotLocation as CriticalLocation) : undefined,
    );

    const hullAfter = Math.max(0, (target.hullCurrent ?? 0) - finalDamage);
    const hullPct = target.hullMax ? Math.round((hullAfter / target.hullMax) * 100) : 0;
    pushReadout(
      finalDamage > 0 ? 'attack_hit' : 'attack_miss',
      `${weapon.name.toUpperCase()} — ${finalDamage > 0 ? 'HIT' : 'ABSORBED'}`,
      [
        `${attacker.name} → ${target.name}`,
        `Roll: ${rollLabel} | Total: ${grandTotal} | Effect: ${effect >= 0 ? '+' : ''}${effect}`,
        `Damage: ${finalDamage}${effectiveTargetArmor ? ` (${modifiedDamage} − ${effectiveTargetArmor} armor)` : ''}`,
        `Hull: ${hullAfter}/${target.hullMax ?? '?'} (${hullPct}%)`,
      ],
      finalDamage > 0 ? (hullAfter <= 0 ? 'red' : 'yellow') : 'green',
    );
  }, [contacts, attackPlans, currentRound, gunnerAssist, dogfightAttackModifiers, sensorLocks, updateContactFields, addLog, applyDamageToShip, pushReadout]);

  // ── Dogfight ──

  const resolveDogfight = useCallback((shipId: string, manualShipRoll?: number, manualTargetRoll?: number) => {
    const ship = contacts.find(c => c.id === shipId);
    const targetId = dogfightPlans[shipId]?.targetId;
    const target = contacts.find(c => c.id === targetId);
    if (!ship || !target) return;

    const rangeBand = getContactRangeBand(ship, target);
    if (!['adjacent', 'close'].includes(rangeBand)) {
      addLog(`${ship.name} cannot dogfight ${target.name} outside Close/Adjacent range.`, true);
      return;
    }

    const shipRoll = manualShipRoll ?? roll2d6();
    const targetRoll = manualTargetRoll ?? roll2d6();
    const shipScore = shipRoll + (ship.pilotSkill ?? 0) + getPilotCriticalPenalty(ship) + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship) + getDogfightSizePenalty(ship.tonnage ?? 100) + Math.min(getEffectiveThrust(ship), ship.movementAllocation ?? 0) + (dogfightMomentum[ship.id] ?? 0);
    const targetScore = targetRoll + (target.pilotSkill ?? 0) + getPilotCriticalPenalty(target) + getBridgeCriticalPenalty(target) + getCrewCriticalPenalty(target) + getDogfightSizePenalty(target.tonnage ?? 100) + Math.min(getEffectiveThrust(target), target.movementAllocation ?? 0) + (dogfightMomentum[target.id] ?? 0);

    if (shipScore === targetScore) {
      setDogfightAttackModifiers(prev => ({ ...prev, [ship.id]: 0, [target.id]: 0 }));
      addLog(`Dogfight between ${ship.name} and ${target.name} is a draw (${shipScore} vs ${targetScore}).`, true);
      pushReadout('dogfight', 'DOGFIGHT — DRAW', [
        `${ship.name} vs ${target.name}`,
        `Score: ${shipScore} vs ${targetScore}`,
        'No advantage gained',
      ], 'orange');
      return;
    }

    const winner = shipScore > targetScore ? ship : target;
    const loser = winner.id === ship.id ? target : ship;
    const diff = Math.abs(shipScore - targetScore);
    setDogfightAttackModifiers(prev => ({ ...prev, [winner.id]: 2, [loser.id]: -2 }));
    setDogfightMomentum(prev => ({ ...prev, [winner.id]: diff, [loser.id]: 0 }));
    addLog(`${winner.name} wins dogfight against ${loser.name} (${shipScore} vs ${targetScore}); +2/-2 attack DM this round.`, true);
    pushReadout('dogfight', `DOGFIGHT — ${winner.name.toUpperCase()} WINS`, [
      `${ship.name} vs ${target.name}`,
      `Score: ${shipScore} vs ${targetScore}`,
      `${winner.name}: +2 attack DM | ${loser.name}: -2 attack DM`,
    ], winner.isPlayerShip ? 'green' : 'red');
  }, [contacts, dogfightPlans, dogfightMomentum, addLog, pushReadout]);

  // ── Docking / Boarding ──

  const attemptDockOrBoard = useCallback((shipId: string, manualActorRoll?: number, manualBoardingRoll?: number) => {
    const ship = contacts.find(c => c.id === shipId);
    const plan = dockingPlans[shipId];
    if (!ship || !plan?.targetId) return;
    const target = contacts.find(c => c.id === plan.targetId);
    if (!target) return;

    const rangeBand = getContactRangeBand(ship, target);
    if (rangeBand !== 'adjacent') {
      addLog(`${ship.name} can only ${plan.mode} at Adjacent range.`, true);
      return;
    }

    const actorDice = manualActorRoll ?? roll2d6();
    const actor = actorDice + (ship.pilotSkill ?? 0) + getPilotCriticalPenalty(ship) + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship) + Math.min(getEffectiveThrust(ship), ship.movementAllocation ?? 0) - Math.min(3, boardingPressure[ship.id] ?? 0) - 2;
    const defender = roll2d6() + (target.pilotSkill ?? 0) + getPilotCriticalPenalty(target) + getBridgeCriticalPenalty(target) + getCrewCriticalPenalty(target) + Math.min(getEffectiveThrust(target), target.movementAllocation ?? 0) - Math.min(3, boardingPressure[target.id] ?? 0);

    if (actor <= defender) {
      addLog(`${ship.name} fails to ${plan.mode} with ${target.name} (${actor} vs ${defender}).`, true);
      pushReadout('boarding', `${plan.mode.toUpperCase()} — FAILED`, [
        `${ship.name} → ${target.name}`,
        `Score: ${actor} vs ${defender}`,
      ], 'orange');
      return;
    }

    setDockedWith(prev => ({ ...prev, [ship.id]: target.id, [target.id]: ship.id }));
    if (plan.mode === 'dock') {
      addLog(`${ship.name} docks with ${target.name} (${actor} vs ${defender}).`, true);
      pushReadout('boarding', 'DOCKING — SUCCESS', [
        `${ship.name} ↔ ${target.name}`,
        `Score: ${actor} vs ${defender}`,
      ], 'cyan');
      return;
    }

    const boardingDice = manualBoardingRoll ?? roll2d6();
    const boardingRoll = boardingDice + (ship.engineerSkill ?? 0) + (ship.captainSkill ?? 0) + getCrewCriticalPenalty(ship);
    const defenseRoll = roll2d6() + (target.engineerSkill ?? 0) + (target.captainSkill ?? 0) + getCrewCriticalPenalty(target);
    if (boardingRoll > defenseRoll) {
      const pressureGain = Math.max(1, Math.min(3, boardingRoll - defenseRoll));
      setBoardingPressure(prev => ({ ...prev, [target.id]: Math.min(6, (prev[target.id] ?? 0) + pressureGain) }));
      addLog(`${ship.name} boards ${target.name}; boarding pressure +${pressureGain} (${boardingRoll} vs ${defenseRoll}).`, true);
      pushReadout('boarding', 'BOARDING — SUCCESS', [
        `${ship.name} → ${target.name}`,
        `Score: ${boardingRoll} vs ${defenseRoll} | Pressure: +${pressureGain}`,
      ], 'red');
      return;
    }
    addLog(`${ship.name} fails boarding action on ${target.name} (${boardingRoll} vs ${defenseRoll}).`, true);
    pushReadout('boarding', 'BOARDING — REPELLED', [
      `${ship.name} → ${target.name}`,
      `Score: ${boardingRoll} vs ${defenseRoll}`,
    ], 'orange');
  }, [contacts, dockingPlans, boardingPressure, addLog, pushReadout]);

  const attemptRepelBoarders = useCallback((shipId: string, manualRoll?: number) => {
    const ship = contacts.find(c => c.id === shipId);
    if (!ship) return;
    const pressure = boardingPressure[shipId] ?? 0;
    if (pressure <= 0) {
      addLog(`${ship.name} has no active boarding pressure to repel.`, true);
      return;
    }
    const total = (manualRoll ?? roll2d6()) + (ship.engineerSkill ?? 0) + (ship.captainSkill ?? 0) + getCrewCriticalPenalty(ship);
    const relief = total >= 8 ? Math.max(1, total - 8) : 0;
    if (relief <= 0) {
      addLog(`${ship.name} fails to repel boarders (roll ${total}).`, true);
      pushReadout('boarding', 'REPEL BOARDERS — FAILED', [
        `${ship.name}: Defense action`,
        `Roll: ${total} vs 8+`,
      ], 'orange');
      return;
    }
    setBoardingPressure(prev => ({ ...prev, [shipId]: Math.max(0, (prev[shipId] ?? 0) - relief) }));
    addLog(`${ship.name} repels boarders; boarding pressure -${relief} (roll ${total}).`, true);
    pushReadout('boarding', 'REPEL BOARDERS — SUCCESS', [
      `${ship.name}: Defense action`,
      `Roll: ${total} vs 8+ | Pressure: -${relief}`,
    ], 'green');
  }, [contacts, boardingPressure, addLog, pushReadout]);

  // ── Jump ──

  const attemptJump = useCallback((shipId: string, manualRoll?: number) => {
    const ship = contacts.find(c => c.id === shipId);
    if (!ship) return;
    if (ship.jumpCommitted) {
      addLog(`${ship.name} is already charging jump drive (${ship.jumpChargeRounds} rounds remaining).`, true);
      return;
    }
    if ((boardingPressure[shipId] ?? 0) > 0) {
      addLog(`${ship.name} cannot jump while under boarding action (pressure: ${boardingPressure[shipId]}).`, true);
      return;
    }
    const jumpDriveSeverity = getCriticalSeverity(ship, 'jump_drive');
    if (jumpDriveSeverity >= 4) {
      addLog(`${ship.name} cannot jump: jump drive critically offline.`, true);
      return;
    }
    const total = (manualRoll ?? roll2d6()) + (ship.engineerSkill ?? 0) + (ship.sensorSkill ?? 0) + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship) - jumpDriveSeverity;
    if (total < 10) {
      addLog(`${ship.name} fails to initialize jump sequence (roll ${total}).`, true);
      pushReadout('jump', 'JUMP DRIVE — FAILED', [
        `${ship.name}: initialization failed`,
        `Roll: ${total} vs 10+`,
      ], 'orange');
      return;
    }
    const charge = jumpDriveSeverity >= 2 ? 3 : 2;
    updateContactFields(shipId, { jumpCommitted: true, jumpChargeRounds: charge });
    addLog(`${ship.name} initiates jump; transition in ${charge} rounds.`, true);
    pushReadout('jump', 'JUMP DRIVE — CHARGING', [
      `${ship.name}: sequence initiated`,
      `Transition in ${charge} rounds`,
    ], 'cyan');
  }, [contacts, boardingPressure, updateContactFields, addLog, pushReadout]);

  // ── Sensor actions ──

  const attemptSensorLock = useCallback((shipId: string, manualRoll?: number) => {
    const ship = contacts.find(c => c.id === shipId);
    const plan = sensorPlans[shipId];
    if (!ship || !plan?.lockTargetId) return;
    const target = contacts.find(c => c.id === plan.lockTargetId);
    if (!target) return;
    const rollLabel = manualRoll !== undefined ? `${manualRoll}(manual)` : undefined;
    const total = (manualRoll ?? roll2d6()) + (ship.sensorSkill ?? 0) + getSensorCriticalPenalty(ship) + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship);
    if (total >= 8) {
      setSensorLocks(prev => ({ ...prev, [shipId]: target.id }));
      addLog(`${ship.name} establishes sensor lock on ${target.name} (2d6: ${rollLabel ?? total - (ship.sensorSkill ?? 0)}, total ${total}).`, true);
      pushReadout('sensor', 'SENSOR LOCK — ACQUIRED', [
        `${ship.name} → ${target.name}`,
        `Roll: ${total} vs 8+ | +2 attack DM`,
      ], 'cyan');
      return;
    }
    addLog(`${ship.name} fails to lock ${target.name} (2d6: ${rollLabel ?? total - (ship.sensorSkill ?? 0)}, total ${total}).`, true);
    pushReadout('sensor', 'SENSOR LOCK — FAILED', [
      `${ship.name} → ${target.name}`,
      `Roll: ${total} vs 8+`,
    ], 'orange');
  }, [contacts, sensorPlans, addLog, pushReadout]);

  const attemptBreakSensorLock = useCallback((shipId: string, manualOwnRoll?: number, manualEnemyRoll?: number) => {
    const ship = contacts.find(c => c.id === shipId);
    const plan = sensorPlans[shipId];
    if (!ship || !plan?.breakLockFromShipId) return;
    const locker = contacts.find(c => c.id === plan.breakLockFromShipId);
    if (!locker) return;
    const lockedTarget = sensorLocks[locker.id];
    if (!lockedTarget) {
      addLog(`${ship.name} cannot break lock: ${locker.name} has no active lock.`, true);
      return;
    }
    const ownRoll = (manualOwnRoll ?? roll2d6()) + (ship.sensorSkill ?? 0) + getSensorCriticalPenalty(ship) + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship);
    const enemyRoll = (manualEnemyRoll ?? roll2d6()) + (locker.sensorSkill ?? 0) + getSensorCriticalPenalty(locker) + getBridgeCriticalPenalty(locker) + getCrewCriticalPenalty(locker);
    if (ownRoll > enemyRoll) {
      setSensorLocks(prev => { const n = { ...prev }; delete n[locker.id]; return n; });
      const targetShip = contacts.find(c => c.id === lockedTarget);
      addLog(`${ship.name} breaks ${locker.name}'s lock${targetShip ? ` on ${targetShip.name}` : ''} (${ownRoll} vs ${enemyRoll}).`, true);
      pushReadout('sensor', 'SENSOR LOCK — BROKEN', [
        `${ship.name} disrupts ${locker.name}'s lock`,
        `Score: ${ownRoll} vs ${enemyRoll}`,
      ], 'cyan');
      return;
    }
    addLog(`${ship.name} fails to break ${locker.name}'s lock (${ownRoll} vs ${enemyRoll}).`, true);
    pushReadout('sensor', 'BREAK LOCK — FAILED', [
      `${ship.name} vs ${locker.name}`,
      `Score: ${ownRoll} vs ${enemyRoll}`,
    ], 'orange');
  }, [contacts, sensorPlans, sensorLocks, addLog, pushReadout]);

  // ── Captain / Pilot actions ──

  const attemptImproveInitiative = useCallback((shipId: string, manualRoll?: number) => {
    const ship = contacts.find(c => c.id === shipId);
    if (!ship) return;
    const total = (manualRoll ?? roll2d6()) + (ship.captainSkill ?? 0) + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship);
    const effect = total - 8;
    setInitiativeModifiers(prev => ({ ...prev, [shipId]: effect }));
    addLog(`${ship.name} command check sets next-round initiative modifier to ${effect >= 0 ? '+' : ''}${effect} (roll ${total}).`, true);
    pushReadout('initiative', `COMMAND — ${effect >= 0 ? 'SUCCESS' : 'POOR RESULT'}`, [
      `${ship.name}: Captain orders`,
      `Roll: ${total} vs 8+ | Initiative DM: ${effect >= 0 ? '+' : ''}${effect} next round`,
    ], effect >= 0 ? 'cyan' : 'orange');
  }, [contacts, addLog, pushReadout]);

  const attemptAidGunners = useCallback((shipId: string, manualRoll?: number) => {
    const ship = contacts.find(c => c.id === shipId);
    if (!ship) return;
    const total = (manualRoll ?? roll2d6()) + (ship.pilotSkill ?? 0) + getPilotCriticalPenalty(ship) + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship);
    if (total < 8) {
      setGunnerAssist(prev => ({ ...prev, [shipId]: 0 }));
      addLog(`${ship.name} fails to aid gunners (roll ${total}).`, true);
      pushReadout('general', 'AID GUNNERS — FAILED', [
        `${ship.name}: Pilot assist`,
        `Roll: ${total} vs 8+`,
      ], 'orange');
      return;
    }
    const effect = total - 8;
    setGunnerAssist(prev => ({ ...prev, [shipId]: effect }));
    addLog(`${ship.name} aids gunners with DM+${effect} this round (roll ${total}).`, true);
    pushReadout('general', 'AID GUNNERS — SUCCESS', [
      `${ship.name}: Pilot assist`,
      `Roll: ${total} vs 8+ | Gunner DM: +${effect} this round`,
    ], 'green');
  }, [contacts, addLog, pushReadout]);

  // ── Overload actions ──

  const attemptOverloadDrive = useCallback((shipId: string, manualRoll?: number) => {
    const ship = contacts.find(c => c.id === shipId);
    if (!ship) return;
    const total = (manualRoll ?? roll2d6()) + (ship.engineerSkill ?? 0) - (ship.overloadDrivePenalty ?? 0) + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship);
    const effect = total - 10;
    updateContactFields(shipId, { overloadDrivePenalty: (ship.overloadDrivePenalty ?? 0) + 2 });
    if (total >= 10) {
      updateContactFields(shipId, { pendingThrustBoost: Math.max(ship.pendingThrustBoost ?? 0, 1) });
      addLog(`${ship.name} overloads M-drive successfully (roll ${total}); +1 Thrust next round.`, true);
      pushReadout('general', 'M-DRIVE OVERLOAD — SUCCESS', [
        `${ship.name}: Engineer action`,
        `Roll: ${total} vs 10+ | +1 Thrust next round`,
      ], 'green');
      return;
    }
    if (effect <= -6) {
      const currentSev = getCriticalSeverity(ship, 'm_drive');
      updateContactFields(shipId, { criticals: { ...(ship.criticals ?? {}), m_drive: Math.min(6, currentSev + 1) } });
      addLog(`${ship.name} M-drive critical from overload failure.`, true);
      pushReadout('critical', 'M-DRIVE OVERLOAD — CRITICAL', [
        `${ship.name}: Catastrophic overload failure!`,
        `Roll: ${total} vs 10+ | M-Drive critical hit`,
      ], 'red');
    } else {
      addLog(`${ship.name} fails to overload M-drive (roll ${total}).`, true);
      pushReadout('general', 'M-DRIVE OVERLOAD — FAILED', [
        `${ship.name}: Engineer action`,
        `Roll: ${total} vs 10+`,
      ], 'orange');
    }
  }, [contacts, updateContactFields, addLog, pushReadout]);

  const attemptOverloadPlant = useCallback((shipId: string, manualRoll?: number) => {
    const ship = contacts.find(c => c.id === shipId);
    if (!ship) return;
    const total = (manualRoll ?? roll2d6()) + (ship.engineerSkill ?? 0) - (ship.overloadPlantPenalty ?? 0) + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship);
    const effect = total - 10;
    updateContactFields(shipId, { overloadPlantPenalty: (ship.overloadPlantPenalty ?? 0) + 2 });
    if (total >= 10) {
      updateContactFields(shipId, { pendingPowerBypass: true });
      addLog(`${ship.name} overloads power plant (roll ${total}); power penalties bypassed next round.`, true);
      pushReadout('general', 'POWER PLANT OVERLOAD — SUCCESS', [
        `${ship.name}: Engineer action`,
        `Roll: ${total} vs 10+ | Power penalties bypassed next round`,
      ], 'green');
      return;
    }
    if (effect <= -6) {
      const currentSev = getCriticalSeverity(ship, 'power_plant');
      updateContactFields(shipId, { criticals: { ...(ship.criticals ?? {}), power_plant: Math.min(6, currentSev + 1) } });
      addLog(`${ship.name} power plant critical from overload failure.`, true);
      pushReadout('critical', 'POWER PLANT OVERLOAD — CRITICAL', [
        `${ship.name}: Catastrophic overload failure!`,
        `Roll: ${total} vs 10+ | Power Plant critical hit`,
      ], 'red');
    } else {
      addLog(`${ship.name} fails to overload power plant (roll ${total}).`, true);
      pushReadout('general', 'POWER PLANT OVERLOAD — FAILED', [
        `${ship.name}: Engineer action`,
        `Roll: ${total} vs 10+`,
      ], 'orange');
    }
  }, [contacts, updateContactFields, addLog, pushReadout]);

  const resetOverloadPenalties = useCallback((shipId: string) => {
    const ship = contacts.find(c => c.id === shipId);
    if (!ship) return;
    updateContactFields(shipId, { overloadDrivePenalty: 0, overloadPlantPenalty: 0 });
    addLog(`${ship.name} stabilizes drives and clears overload penalties.`, true);
  }, [contacts, updateContactFields, addLog]);

  // ── Repair ──

  const attemptRepair = useCallback((shipId: string, manualRoll?: number) => {
    const ship = contacts.find(c => c.id === shipId);
    const plan = repairPlans[shipId] ?? getDefaultRepairState();
    if (!ship || !plan.location) return;
    const location = plan.location as CriticalLocation;
    const severity = getCriticalSeverity(ship, location);
    if (severity <= 0) return;
    const progress = ship.repairProgress?.[location as CriticalLocationKey] ?? 0;
    const dice = manualRoll ?? roll2d6();
    const total = dice + (ship.engineerSkill ?? 0) + progress - severity;
    if (total >= 8) {
      const nextSeverity = Math.max(0, severity - 1);
      const nextCriticals = { ...(ship.criticals ?? {}) };
      if (nextSeverity <= 0) {
        delete nextCriticals[location as CriticalLocationKey];
      } else {
        nextCriticals[location as CriticalLocationKey] = nextSeverity;
      }
      updateContactFields(shipId, {
        criticals: nextCriticals,
        repairProgress: { ...(ship.repairProgress ?? {}), [location]: 0 },
      });
      addLog(`${ship.name} repair success on ${CRITICAL_LOCATION_LABELS[location]} (roll ${total}).`, true);
      pushReadout('repair', 'REPAIR — SUCCESS', [
        `${ship.name}: ${CRITICAL_LOCATION_LABELS[location]}`,
        `Roll: ${total} vs 8+ | Severity: ${severity} → ${nextSeverity}`,
      ], 'green');
      return;
    }
    updateContactFields(shipId, {
      repairProgress: { ...(ship.repairProgress ?? {}), [location]: Math.min(6, progress + 1) },
    });
    addLog(`${ship.name} repair failed on ${CRITICAL_LOCATION_LABELS[location]} (roll ${total}).`, true);
    pushReadout('repair', 'REPAIR — FAILED', [
      `${ship.name}: ${CRITICAL_LOCATION_LABELS[location]}`,
      `Roll: ${total} vs 8+ | Progress: ${Math.min(6, progress + 1)}/6`,
    ], 'orange');
  }, [contacts, repairPlans, updateContactFields, addLog, pushReadout]);

  // ── Point Defence & Missile EW ──

  const attemptPointDefense = useCallback((shipId: string, salvoId: string, manualRoll?: number) => {
    const ship = contacts.find(c => c.id === shipId);
    if (!ship) return;
    const salvo = missileSalvos.find(s => s.id === salvoId && s.targetId === shipId);
    if (!salvo) return;
    const total = (manualRoll ?? roll2d6()) + (ship.gunnerSkill ?? 0) + getGunnerCriticalPenalty(ship) + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship);
    if (total < 8) {
      addLog(`${ship.name} point defence fails against incoming missiles (roll ${total}).`, true);
      pushReadout('missile', 'POINT DEFENCE — FAILED', [
        `${ship.name}: Defensive fire`,
        `Roll: ${total} vs 8+`,
      ], 'orange');
      return;
    }
    const removed = Math.max(1, total - 8);
    setMissileSalvos(prev => prev
      .map(s => s.id === salvoId ? { ...s, missilesRemaining: Math.max(0, s.missilesRemaining - removed) } : s)
      .filter(s => s.missilesRemaining > 0));
    addLog(`${ship.name} point defence removes ${removed} missile(s) from incoming salvo (roll ${total}).`, true);
    pushReadout('missile', 'POINT DEFENCE — INTERCEPTED', [
      `${ship.name} intercepts ${removed} missile${removed > 1 ? 's' : ''}`,
      `Roll: ${total} vs 8+`,
    ], 'green');
  }, [contacts, missileSalvos, addLog, pushReadout]);

  const attemptMissileEW = useCallback((shipId: string, salvoId: string, manualRoll?: number) => {
    const ship = contacts.find(c => c.id === shipId);
    if (!ship) return;
    const salvo = missileSalvos.find(s => s.id === salvoId && s.targetId === shipId);
    if (!salvo) return;
    const total = (manualRoll ?? roll2d6()) + (ship.sensorSkill ?? 0) + getSensorCriticalPenalty(ship) + getBridgeCriticalPenalty(ship) + getCrewCriticalPenalty(ship);
    if (total < 10) {
      addLog(`${ship.name} EW fails to disrupt incoming missiles (roll ${total}).`, true);
      pushReadout('sensor', 'MISSILE EW — FAILED', [
        `${ship.name}: EW countermeasures`,
        `Roll: ${total} vs 10+`,
      ], 'orange');
      return;
    }
    const removed = Math.max(1, total - 10);
    setMissileSalvos(prev => prev
      .map(s => s.id === salvoId ? { ...s, missilesRemaining: Math.max(0, s.missilesRemaining - removed) } : s)
      .filter(s => s.missilesRemaining > 0));
    addLog(`${ship.name} EW strips ${removed} missile(s) from incoming salvo (roll ${total}).`, true);
    pushReadout('sensor', 'MISSILE EW — SUCCESS', [
      `${ship.name} jams ${removed} missile${removed > 1 ? 's' : ''}`,
      `Roll: ${total} vs 10+`,
    ], 'cyan');
  }, [contacts, missileSalvos, addLog, pushReadout]);

  // ── Phase advancement ──

  const resolveMissileImpacts = useCallback((salvos: MissileSalvo[]) => {
    salvos.forEach(salvo => {
      const attacker = contacts.find(c => c.id === salvo.attackerId);
      const target = contacts.find(c => c.id === salvo.targetId);
      if (!attacker || !target || salvo.missilesRemaining <= 0) return;
      const dice = roll2d6();
      const evasivePenalty = Math.min(target.evasiveAllocation ?? 0, Math.max(0, (target.pilotSkill ?? 0) + getPilotCriticalPenalty(target)));
      const distantPenalty = salvo.launchedRangeBand === 'distant' ? -2 : 0;
      const total = dice + salvo.missilesRemaining + distantPenalty - evasivePenalty;
      const effect = total - 8;
      if (total < 8) {
        addLog(`${attacker.name}'s missile salvo misses ${target.name} (${total}).`, true);
        pushReadout('missile', 'MISSILE IMPACT — MISS', [
          `${attacker.name} → ${target.name}`,
          `Roll: ${total} vs 8+ | ${salvo.missilesRemaining} missile${salvo.missilesRemaining > 1 ? 's' : ''}`,
        ], 'orange');
        return;
      }
      const baseDamage = rollDamageExpression('4d6').total;
      const multiplier = Math.max(1, Math.min(Math.max(0, effect), salvo.missilesRemaining));
      const effectiveArmor = getEffectiveArmor(target);
      const finalDamage = Math.max(0, baseDamage * multiplier - effectiveArmor);
      applyDamageToShip(target.id, finalDamage, `${attacker.name}'s missiles hit ${target.name} (roll ${total}, x${multiplier}, armor ${effectiveArmor})`, effect);
      pushReadout('missile', 'MISSILE IMPACT — HIT', [
        `${attacker.name} → ${target.name}`,
        `Roll: ${total} | x${multiplier} multiplier`,
        `Damage: ${finalDamage}${effectiveArmor ? ` (${baseDamage * multiplier} − ${effectiveArmor} armor)` : ''}`,
      ], 'red');
    });
  }, [contacts, addLog, applyDamageToShip, pushReadout]);

  const advancePhase = useCallback(async () => {
    const currentIdx = COMBAT_PHASES.indexOf(phase);
    const nextIdx = currentIdx + 1;

    if (nextIdx >= COMBAT_PHASES.length) {
      // End of round
      const updatedSalvos = missileSalvos
        .map(s => ({ ...s, roundsToImpact: Math.max(0, s.roundsToImpact - 1) }))
        .filter(s => s.roundsToImpact <= 9 && combatants.some(c => c.id === s.attackerId) && combatants.some(c => c.id === s.targetId));
      const impacting = updatedSalvos.filter(s => s.roundsToImpact === 0);
      const pending = updatedSalvos.filter(s => s.roundsToImpact > 0);
      if (impacting.length > 0) {
        resolveMissileImpacts(impacting);
      }
      setMissileSalvos(pending);
      setCurrentRound(prev => prev + 1);
      setPhase('maneuver');

      // Round-end updates for all combatants
      for (const ship of combatants) {
        await updateContactFields(ship.id, {
          movementAllocation: 0,
          evasiveAllocation: 0,
          maneuverIntent: 'hold',
          activeThrustBoost: ship.pendingThrustBoost ?? 0,
          pendingThrustBoost: 0,
          activePowerBypass: ship.pendingPowerBypass ?? false,
          pendingPowerBypass: false,
          sandReloadRounds: Math.max(0, (ship.sandReloadRounds ?? 0) - 1),
          sandScreen: 0,
          jumpChargeRounds: ship.jumpCommitted ? Math.max(0, (ship.jumpChargeRounds ?? 0) - 1) : 0,
        });
      }

      // Handle jumping ships
      const jumpingShips = combatants.filter(s => s.jumpCommitted && (s.jumpChargeRounds ?? 0) <= 1);
      for (const ship of jumpingShips) {
        addLog(`${ship.name} transitions to jump space and exits combat.`, true);
        await removeFromCombat(ship.id);
      }

      setSensorLocks(prev => Object.fromEntries(
        Object.entries(prev).filter(([locker, target]) =>
          combatants.some(c => c.id === locker) && combatants.some(c => c.id === target)
        )
      ));
      setGunnerAssist({});
      setDogfightAttackModifiers({});
      setDogfightMomentum({});
      addLog('New round started.');
      return;
    }

    setPhase(COMBAT_PHASES[nextIdx]);
  }, [phase, missileSalvos, combatants, updateContactFields, addLog, resolveMissileImpacts, removeFromCombat]);

  // ── Plan updaters ──

  const updateAttackPlan = useCallback((shipId: string, updates: Partial<AttackState>) => {
    setAttackPlans(prev => ({ ...prev, [shipId]: { ...(prev[shipId] ?? getDefaultAttackState()), ...updates } }));
  }, []);

  const updateRepairPlan = useCallback((shipId: string, updates: Partial<RepairState>) => {
    setRepairPlans(prev => ({ ...prev, [shipId]: { ...(prev[shipId] ?? getDefaultRepairState()), ...updates } }));
  }, []);

  const updateSensorPlan = useCallback((shipId: string, updates: Partial<SensorActionState>) => {
    setSensorPlans(prev => ({
      ...prev,
      [shipId]: { lockTargetId: '', breakLockFromShipId: '', ...(prev[shipId] ?? {}), ...updates },
    }));
  }, []);

  const updateDogfightPlan = useCallback((shipId: string, updates: Partial<DogfightState>) => {
    setDogfightPlans(prev => ({ ...prev, [shipId]: { targetId: '', ...(prev[shipId] ?? {}), ...updates } }));
  }, []);

  const updateDockingPlan = useCallback((shipId: string, updates: Partial<DockingState>) => {
    setDockingPlans(prev => ({ ...prev, [shipId]: { targetId: '', mode: 'dock', ...(prev[shipId] ?? {}), ...updates } }));
  }, []);

  return {
    // State
    isActive,
    currentRound,
    phase,
    combatLog,
    combatants,
    initiativeOrder,
    attackPlans,
    repairPlans,
    sensorPlans,
    dogfightPlans,
    dockingPlans,
    boardingPressure,
    dockedWith,
    sensorLocks,
    missileSalvos,
    gunnerAssist,
    dogfightAttackModifiers,

    // Lifecycle
    startCombat,
    endCombat,
    addToCombat,
    removeFromCombat,

    // Phase actions
    rollInitiative,
    updateShipManeuver,
    applyManeuverStep,
    advancePhase,

    // Combat actions
    resolveAttack,
    resolveDogfight,
    attemptDockOrBoard,
    attemptRepelBoarders,
    attemptJump,
    attemptSensorLock,
    attemptBreakSensorLock,
    attemptImproveInitiative,
    attemptAidGunners,
    attemptOverloadDrive,
    attemptOverloadPlant,
    resetOverloadPenalties,
    attemptRepair,
    attemptPointDefense,
    attemptMissileEW,
    applyDamageToShip,

    // Plan updaters
    updateAttackPlan,
    updateRepairPlan,
    updateSensorPlan,
    updateDogfightPlan,
    updateDockingPlan,

    // Utility
    addLog,
    getContactRangeBand,

    // Readout overlay queue
    readoutQueue,
    dismissReadout,
    pushReadout,
  };
}
