// TypeScript types for Ship Combat features

export interface ShipCombatState {
  id: string;
  encounter_id: string;

  ship_id: string; // combatant id
  vehicle_id?: string;

  // Position
  position_x: number;
  position_y: number;

  // Combat stats
  range_band: RangeBand;
  facing: number; // 0-359 degrees

  // Crew stations
  pilot_character_id?: string;
  gunner_character_ids?: string[];
  engineer_character_id?: string;
  sensors_character_id?: string;

  // Ship conditions
  hull_current: number;
  hull_max: number;
  power_available: number;
  power_total: number;

  // Critical hits
  critical_hits: CriticalHit[];

  // Actions this turn
  has_moved: boolean;
  weapons_fired: number;

  created_at: string;
  updated_at: string;
}

export interface ShipCombatAction {
  id: string;
  encounter_id: string;

  round_number: number;
  character_id?: string;
  ship_id?: string;

  action_type: 'pilot' | 'shoot' | 'engineering' | 'sensors' | 'damage_control';
  description: string;

  roll_result?: number;
  effect?: number;

  damage_dealt?: number;

  timestamp: string;
}

export interface CriticalHit {
  id: string;
  location: string;
  effect: string;
  severity: 'minor' | 'major' | 'catastrophic';
}

export type RangeBand =
  | 'adjacent'
  | 'close'
  | 'short'
  | 'medium'
  | 'long'
  | 'distant'
  | 'very_distant';

export type ShipAction =
  | 'pilot'
  | 'shoot'
  | 'engineering'
  | 'sensors'
  | 'damage_control';

export interface WeaponRangeModifiers {
  [weaponType: string]: {
    [key in RangeBand]: number;
  };
}

export interface CrewStation {
  station: 'pilot' | 'gunner' | 'engineer' | 'sensors';
  character_id?: string;
  character_name?: string;
  available_actions: string[];
}
