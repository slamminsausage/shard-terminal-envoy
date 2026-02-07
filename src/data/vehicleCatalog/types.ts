/**
 * Type definitions for pre-made ground/grav vehicles from the
 * Traveller Core Rulebook.
 */

/** Locomotion type for the vehicle */
export type VehicleLocomotion =
  | "grav"
  | "wheel"
  | "track"
  | "walker"
  | "hovercraft"
  | "rotor"
  | "unpowered";

/** Skill required to operate the vehicle */
export type VehicleSkill =
  | "Flyer (Grav)"
  | "Flyer (Rotor)"
  | "Flyer (Wing)"
  | "Drive (Wheel)"
  | "Drive (Track)"
  | "Drive (Walker)"
  | "Drive (Hovercraft)"
  | "Seafarer (Personal)"
  | "Seafarer (Sail)"
  | "Seafarer (Submarine)";

/** Vehicle category for UI filtering */
export type VehicleCategory =
  | "civilian"
  | "military"
  | "utility"
  | "exploration";

/** Directional armour values */
export interface DirectionalArmour {
  front: number;
  rear: number;
  sides: number;
}

/** A piece of equipment installed on a vehicle */
export interface VehicleEquipmentLine {
  name: string;
  description?: string;
}

/** A weapon mounted on a vehicle */
export interface VehicleWeaponLine {
  weapon: string;
  mount: string;
  damage?: string;
  range?: string;
  magazine?: string;
  traits?: string;
}

/** Speed band info (Traveller Core Rulebook p.148) */
export interface SpeedBands {
  max: number;       // Speed band number (0–10)
  maxLabel: string;  // e.g. "Medium"
  cruise: number;    // Speed band number (0–10)
  cruiseLabel: string; // e.g. "Slow"
}

/**
 * A fully-specified pre-made vehicle from the Traveller Core Rulebook.
 */
export interface PreMadeVehicle {
  id: string;
  name: string;
  category: VehicleCategory;
  locomotion: VehicleLocomotion;
  skill: VehicleSkill;
  tl: number;
  description: string;

  /** Agility modifier (DM applied to vehicle skill checks) */
  agility: number;

  speed: SpeedBands;

  /** Operational range in km */
  rangeKm: number;

  /** Number of crew positions */
  crew: number;

  /** Number of passenger seats */
  passengers: number;

  /** Cargo space in tons (may be fractional) */
  cargoTons: number;

  /** Hull points */
  hull: number;

  /** Shipping size in displacement tons */
  shippingTons: number;

  /** Cost in credits */
  costCr: number;

  /** Directional armour values */
  armour: DirectionalArmour;

  /** Weapons installed */
  weapons: VehicleWeaponLine[];

  /** Equipment fitted */
  equipment: VehicleEquipmentLine[];
}
