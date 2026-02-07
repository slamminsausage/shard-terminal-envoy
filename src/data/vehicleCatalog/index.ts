/**
 * Vehicle Catalog – Pre-made ground/grav vehicles from the
 * Traveller Core Rulebook.
 *
 * Usage:
 *   import { PRE_MADE_VEHICLES, getPreMadeVehicle } from '@/data/vehicleCatalog';
 *   const atv = getPreMadeVehicle('atv');
 */

// ── Types ────────────────────────────────────────────────────────────
export type {
  VehicleLocomotion,
  VehicleSkill,
  VehicleCategory,
  DirectionalArmour,
  VehicleEquipmentLine,
  VehicleWeaponLine,
  SpeedBands,
  PreMadeVehicle,
} from "./types";

// ── Data & Helpers ───────────────────────────────────────────────────
export {
  AIR_RAFT,
  ATV,
  BRUTUS_HEAVY_CARGO_TRUCK,
  CARGO_LIFTER,
  G_BIKE,
  G_RACER,
  GECKO_ASSAULT_VEHICLE,
  GUNSKIFF,
  G_CARRIER,
  PERSONAL_LAND_YACHT,
  PRE_MADE_VEHICLES,
  getPreMadeVehicle,
  getVehiclesByCategory,
} from "./preMadeVehicles";

// ── Speed-band labels (for display) ─────────────────────────────────
export const SPEED_BAND_LABELS: Record<number, string> = {
  0: "Stopped",
  1: "Idle",
  2: "Very Slow",
  3: "Slow",
  4: "Medium",
  5: "High",
  6: "Fast",
  7: "Very Fast",
  8: "Subsonic",
  9: "Supersonic",
  10: "Hypersonic",
};

export const VEHICLE_CATEGORY_LABELS: Record<string, string> = {
  civilian: "Civilian",
  military: "Military",
  utility: "Utility",
  exploration: "Exploration",
};
