// TypeScript types for Pirates of Drinax module

// === Port Reputation System ===

export type PortAttitude = 'haven' | 'friendly' | 'tolerant' | 'neutral' | 'suspicious' | 'unfriendly' | 'hostile';

export interface PortAttitudeConfig {
  label: string;
  fencePercent: number;
  recruitmentTarget: number | null;  // null = impossible
  arrestRiskTarget: number | null;   // null = no risk
  spyRiskTarget: number | null;      // null = no risk
  protectionTarget: number | null;   // null = no protection
}

export interface PiratePort {
  id: string;
  player_id: string;
  name: string;
  world_uwp?: string;
  subsector?: string;
  law_level?: number;
  starport_class?: string;  // A-E, X
  attitude: PortAttitude;
  notes?: string;
  last_visited?: string;  // imperial date
  created_at: string;
  updated_at: string;
}

// === Crew Management ===

export type CrewPosition = 'pilot' | 'navigator' | 'engineer' | 'medic' | 'gunner' | 'marine';
export type CrewSkillLevel = 'green' | 'average' | 'good' | 'excellent' | 'legendary';

export interface CrewSkillLevelConfig {
  label: string;
  keySkillDM: number;
  otherSkillDM: number;
  extraShares: number;
}

export interface PirateCrew {
  id: string;
  player_id: string;
  name: string;
  position: CrewPosition;
  skill_level: CrewSkillLevel;
  base_salary: number;
  shares: number;  // default 1, PCs get 2, captain gets 5
  quirk?: string;
  is_pc: boolean;  // player character - won't mutiny/leave
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// === Morale System ===

export interface MoraleState {
  id: string;
  player_id: string;
  current_mor: number;
  max_mor: number;
  last_spoils_date?: string;  // imperial date
  months_without_spoils: number;
  notes?: string;
  updated_at: string;
}

export interface MoraleEvent {
  id: string;
  player_id: string;
  event_date: string;
  imperial_date?: string;
  event_type: 'check_passed' | 'check_failed' | 'monthly_drain' | 'failed_capture' | 'capture_success' | 'shore_leave' | 'spoils_division' | 'manual_adjust';
  description: string;
  mor_change: number;
  roll_result?: number;  // dice roll if applicable
  roll_target?: number;  // target number if applicable
  created_at: string;
}

// === Standing System ===

export type ImperialPower = 'imperium' | 'aslan';

export interface StandingState {
  id: string;
  player_id: string;
  imperium_standing: number;  // starts at 0
  aslan_standing: number;     // starts at -5
  updated_at: string;
}

export interface StandingEvent {
  id: string;
  player_id: string;
  event_date: string;
  imperial_date?: string;
  power: ImperialPower;
  event_type: 'cargo_theft' | 'infamous_incident' | 'atrocity' | 'interference' | 'heroic_deed' | 'monthly_drift' | 'manual_adjust';
  description: string;
  standing_change: number;
  roll_result?: number;
  created_at: string;
}

export type StandingEffect = 'ally' | 'tolerated' | 'ignored' | 'irritant' | 'infamy' | 'enemy_of_state';

export interface StandingEffectConfig {
  label: string;
  description: string;
  minStanding: number;
  maxStanding: number;
}

// === Division of Spoils ===

export interface SpoilsDivision {
  id: string;
  player_id: string;
  division_date: string;
  imperial_date?: string;
  total_cargo_value: number;
  fence_percent: number;
  fenced_value: number;
  oleb_tithe: number;  // 10% of fenced value
  distributable: number;
  total_shares: number;
  value_per_share: number;
  crew_retention_results?: CrewRetentionResult[];
  notes?: string;
  created_at: string;
}

export interface CrewRetentionResult {
  crew_id: string;
  crew_name: string;
  roll: number;
  mor_dm: number;
  total: number;
  target: number;
  stays: boolean;
}

// === Prey Encounter System ===

export type SystemClassification = 'backwater' | 'standard' | 'high_traffic' | 'capital';
export type SystemSecurity = 'dangerous' | 'standard' | 'secure' | 'naval_base';

export type PreyType =
  | 'no_encounter'
  | 'traveller'
  | 'small_freighter'
  | 'medium_freighter'
  | 'heavy_freighter'
  | 'rich_freighter'
  | 'convoy'
  | 'liner'
  | 'unusual_vessel'
  | 'system_defence_boat'
  | 'naval_patrol';

export interface PreyEncounterResult {
  id: string;
  player_id: string;
  encounter_date: string;
  imperial_date?: string;
  system_name?: string;
  system_classification: SystemClassification;
  system_security: SystemSecurity;
  raw_roll: [number, number];  // d66 dice
  modified_roll: [number, number];
  result: PreyType;
  notes?: string;
  created_at: string;
}

// === Prize Ship & Salvage System ===

export type PrizeShipStatus = 'captured' | 'kept' | 'sold' | 'scrapped' | 'gifted';
export type PrizeShipCondition = 'pristine' | 'good' | 'damaged' | 'heavily_damaged' | 'hulk';

export interface PrizeShipWeapon {
  name: string;
  mount: string;
  damage?: string;
  condition: 'operational' | 'damaged' | 'destroyed';
}

export interface PrizeCrew {
  crew_id: string;
  crew_name: string;
  assigned_date: string;
}

export interface PrizeShip {
  id: string;
  player_id: string;

  // Ship identification
  name: string;
  hull_type: string;
  tonnage: number;
  tech_level: number;

  // Capture details
  capture_date: string;
  capture_imperial_date?: string;
  capture_location?: string;
  prey_encounter_id?: string;

  // Ship condition
  condition: PrizeShipCondition;
  hull_damage_percent: number;
  drives_operational: boolean;
  weapons: PrizeShipWeapon[];

  // Cargo at time of capture
  cargo_tons: number;
  cargo_manifest?: string;
  cargo_estimated_value: number;

  // Prize disposition
  status: PrizeShipStatus;

  // For 'kept' ships
  assigned_prize_crew: PrizeCrew[];
  renamed_to?: string;

  // For 'sold' ships
  sale_value?: number;
  sale_port?: string;
  sale_date?: string;

  // For 'scrapped' ships
  scrap_value?: number;
  scrap_date?: string;

  // For 'gifted' ships
  gifted_to_port?: string;
  gifted_date?: string;
  reputation_gained?: number;

  // Repair tracking
  repair_cost_estimate?: number;
  repair_weeks_estimate?: number;
  repairs_completed?: boolean;

  notes?: string;
  created_at: string;
  updated_at: string;
}

// === Overall Piracy State (stored in localStorage) ===

export interface PiracyState {
  ports: PiratePort[];
  crew: PirateCrew[];
  morale: MoraleState;
  standing: StandingState;
  moraleEvents: MoraleEvent[];
  standingEvents: StandingEvent[];
  spoilsDivisions: SpoilsDivision[];
  preyEncounters: PreyEncounterResult[];
  prizeShips: PrizeShip[];
}
