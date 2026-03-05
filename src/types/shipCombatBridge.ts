import type { CombatPhase, ShipRangeBand, CriticalLocation } from '@/lib/bridge/shipCombatRules';

export interface CombatLogEntry {
  id: string;
  round: number;
  phase: CombatPhase;
  message: string;
  gmOnly?: boolean;
}

export interface AttackState {
  targetId: string;
  weaponId: string;
  situationalDM: number;
  calledShotLocation: CriticalLocation | 'none';
}

export interface RepairState {
  location: CriticalLocation | '';
}

export interface SensorActionState {
  lockTargetId: string;
  breakLockFromShipId: string;
}

export interface DogfightState {
  targetId: string;
}

export interface DockingState {
  targetId: string;
  mode: 'dock' | 'board';
}

export interface MissileSalvo {
  id: string;
  attackerId: string;
  targetId: string;
  missilesRemaining: number;
  roundsToImpact: number;
  launchedRangeBand: ShipRangeBand;
  launchedRound: number;
}

export interface ShipCombatEngineState {
  isActive: boolean;
  currentRound: number;
  phase: CombatPhase;
  combatLog: CombatLogEntry[];
  attackPlans: Record<string, AttackState>;
  repairPlans: Record<string, RepairState>;
  sensorPlans: Record<string, SensorActionState>;
  dogfightPlans: Record<string, DogfightState>;
  dockingPlans: Record<string, DockingState>;
  boardingPressure: Record<string, number>;
  dockedWith: Record<string, string>;
  sensorLocks: Record<string, string>;
  initiativeModifiers: Record<string, number>;
  dogfightAttackModifiers: Record<string, number>;
  dogfightMomentum: Record<string, number>;
  gunnerAssist: Record<string, number>;
  missileSalvos: MissileSalvo[];
}

export type ReadoutCategory =
  | 'attack_hit'
  | 'attack_miss'
  | 'damage'
  | 'critical'
  | 'repair'
  | 'sensor'
  | 'dogfight'
  | 'initiative'
  | 'maneuver'
  | 'missile'
  | 'missile_launch'
  | 'jump'
  | 'destroyed'
  | 'boarding'
  | 'general';

export interface CombatReadoutEvent {
  id: string;
  category: ReadoutCategory;
  title: string;
  details: string[];
  /** Color accent for the readout border/glow: 'green' | 'red' | 'cyan' | 'orange' | 'yellow' */
  accent: 'green' | 'red' | 'cyan' | 'orange' | 'yellow';
  timestamp: number;
}

export const getDefaultAttackState = (): AttackState => ({
  targetId: '',
  weaponId: 'pulse_laser',
  situationalDM: 0,
  calledShotLocation: 'none',
});

export const getDefaultRepairState = (): RepairState => ({
  location: '',
});
