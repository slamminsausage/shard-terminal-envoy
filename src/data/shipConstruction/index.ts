/**
 * Traveller Core Rulebook - Spacecraft Construction System
 *
 * Complete 13-step ship construction system with data tables,
 * calculation engine, and type definitions.
 *
 * Usage:
 *   import { createEmptyShipDesign, calculateShipDesign } from '@/data/shipConstruction';
 *
 *   const design = createEmptyShipDesign();
 *   design.tonnage = 200;
 *   design.jumpRating = 1;
 *   // ... configure design ...
 *   const calc = calculateShipDesign(design);
 *   console.log(calc.totalCost, calc.isValid, calc.validationErrors);
 */

// ── Types ────────────────────────────────────────────────────────────
export type {
  HullConfigType,
  HullConfiguration,
  ArmorMaterialId,
  ArmorMaterial,
  DriveRatingEntry,
  PowerPlantTier,
  PowerPlantType,
  BridgeSizeEntry,
  CockpitOption,
  ComputerModel,
  SensorSuite,
  TurretWeaponId,
  TurretWeaponDef,
  MountTypeId,
  WeaponMountDef,
  EquipmentCategory,
  SpacecraftEquipment,
  StateroomTypeId,
  StateroomDef,
  LowBerthDef,
  CrewPosition,
  ShipWeaponInstallation,
  ShipEquipmentInstallation,
  ShipDesign,
  ShipCalculations,
} from './types';

// ── Hull Data (Step 1) ──────────────────────────────────────────────
export {
  HULL_COST_PER_TON,
  TONS_PER_HULL_POINT,
  SELF_SEALING_TL,
  HULL_CONFIGURATIONS,
  ARMOR_MATERIALS,
  calculateHullPoints,
  calculateBaseHullCost,
  calculateHullCost,
  calculateArmorTonnage,
  calculateArmorCost,
  getMaxProtection,
} from './hulls';

// ── Drives Data (Step 2) ────────────────────────────────────────────
export {
  MANOEUVRE_DRIVE_COST_PER_TON_MCR,
  REACTION_DRIVE_COST_PER_TON_MCR,
  JUMP_DRIVE_COST_PER_TON_MCR,
  JUMP_DRIVE_BASE_TONS,
  JUMP_DRIVE_MIN_TONS,
  MANOEUVRE_DRIVE_TABLE,
  JUMP_DRIVE_TABLE,
  calculateManoeuvreDriveTons,
  calculateManoeuvreDriveCost,
  calculateJumpDriveTons,
  calculateJumpDriveCost,
  getManoeuvreMinTL,
  getJumpMinTL,
} from './drives';

// ── Power Plants Data (Steps 3-4) ──────────────────────────────────
export {
  POWER_PLANT_TYPES,
  powerForBasicSystems,
  powerForManoeuvreDrive,
  powerForJumpDrive,
  calculatePowerGenerated,
  calculatePowerPlantCost,
  minimumPowerPlantTons,
  jumpFuelTons,
  powerPlantFuelTons,
  totalFuelTons,
} from './powerPlants';

// ── Bridge, Computers, Sensors (Steps 5-7) ──────────────────────────
export {
  BRIDGE_SIZE_TABLE,
  BRIDGE_COST_PER_100_TONS_MCR,
  HOLOGRAPHIC_CONTROLS_COST_MULTIPLIER,
  COCKPIT_OPTIONS,
  BIS_COST_MULTIPLIER,
  BIS_PROCESSING_BONUS,
  COMPUTER_MODELS,
  SENSOR_STATION_COST,
  SENSOR_STATION_TONS,
  SENSOR_SUITES,
  getBridgeTons,
  calculateBridgeCost,
  calculateComputerCost,
  getEffectiveProcessing,
} from './bridges';

// ── Weapons (Step 8) ────────────────────────────────────────────────
export {
  TURRET_WEAPONS,
  WEAPON_MOUNTS,
  calculateHardpoints,
  calculateFirmpoints,
  calculateWeaponInstallationTons,
  calculateWeaponInstallationCostMCr,
  calculateWeaponInstallationPower,
} from './weapons';

// ── Equipment (Step 9) ──────────────────────────────────────────────
export {
  SPACECRAFT_EQUIPMENT,
  getEquipment,
  calculateEquipmentTons,
  calculateEquipmentCost,
  calculateEquipmentPower,
} from './equipment';

// ── Staterooms & Crew (Steps 10-11) ────────────────────────────────
export {
  STATEROOM_TYPES,
  LOW_BERTH,
  COMMON_AREA_COST_PER_TON_MCR,
  RECOMMENDED_COMMON_AREA_PERCENT,
  CREW_POSITIONS,
  calculateStateroomTons,
  calculateStateroomCost,
  calculateLowBerthTons,
  calculateLowBerthCost,
  calculateLowBerthPower,
  calculateCommonAreaCost,
  calculateCrewRequirements,
  calculateMonthlySalaries,
} from './staterooms';

// ── Ship Builder Engine (Step 13) ───────────────────────────────────
export {
  calculateShipDesign,
  createEmptyShipDesign,
  formatCredits,
  formatTons,
  constructionTimeDays,
} from './shipBuilder';
