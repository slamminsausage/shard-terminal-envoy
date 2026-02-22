/**
 * Traveller Core Rulebook - Spacecraft Construction System
 *
 * Complete 13-step ship construction system with data tables,
 * calculation engine, pre-made ships, and type definitions.
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
 *
 *   // Or load a pre-made ship:
 *   import { PRE_MADE_SHIPS, getPreMadeShip } from '@/data/shipConstruction';
 *   const scout = getPreMadeShip('scout_courier');
 */

// ── Types ────────────────────────────────────────────────────────────
export type {
  HullConfigType,
  HullConfiguration,
  SpecialisedHullType,
  SpecialisedHullDef,
  HullOptionId,
  HullOptionDef,
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
  BarbetteWeaponId,
  BarbetteWeaponDef,
  BaySize,
  BayWeaponId,
  BayWeaponDef,
  SpinalWeaponId,
  SpinalWeaponDef,
  PointDefenceWeaponId,
  PointDefenceType,
  PointDefenceWeaponDef,
  ScreenId,
  ScreenDef,
  MissileId,
  MissileDef,
  CanisterId,
  CanisterDef,
  TorpedoId,
  TorpedoDef,
  BarbetteInstallation,
  BayWeaponInstallation,
  SpinalWeaponInstallation,
  ScreenInstallation,
  PointDefenceInstallation,
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
  ShipCategory,
  ShipComponentLine,
  PowerRequirementLine,
  PreMadeShip,
} from './types';

// ── Hull Data (Step 1) ──────────────────────────────────────────────
export {
  HULL_COST_PER_TON,
  PLANETOID_COST_PER_TON,
  TONS_PER_HULL_POINT,
  SELF_SEALING_TL,
  MIN_HULL_TONNAGE,
  MIN_JUMP_TONNAGE,
  HULL_CONFIGURATIONS,
  SPECIALISED_HULL_TYPES,
  HULL_OPTIONS,
  ARMOR_MATERIALS,
  ARMOUR_TONNAGE_MULTIPLIERS,
  getTonsPerHullPoint,
  calculateHullPoints,
  calculateBaseHullCost,
  calculateHullCost,
  getUseableTonnagePercent,
  getArmourTonnageMultiplier,
  calculateArmorTonnage,
  calculateArmorCost,
  getMaxProtection,
  calculateHullOptionCost,
  calculateHullOptionTonnage,
  getHullConfig,
  getSpecialisedHull,
  getHullOption,
  getArmourMaterial,
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
  POP_UP_MOUNTING,
  BARBETTE_WEAPONS,
  SMALL_BAY_WEAPONS,
  MEDIUM_BAY_WEAPONS,
  LARGE_BAY_WEAPONS,
  SPINAL_WEAPONS,
  POINT_DEFENCE_WEAPONS,
  SCREENS,
  MISSILES,
  CANISTERS,
  TORPEDOES,
  calculateHardpoints,
  calculateFirmpoints,
  calculateWeaponInstallationTons,
  calculateWeaponInstallationCostMCr,
  calculateWeaponInstallationPower,
  calculateSpinalMountTons,
  calculateSpinalMountCostMCr,
  calculateSpinalMountPower,
  calculateSpinalMountHardpoints,
} from './weapons';

// ── Equipment (Step 9) ──────────────────────────────────────────────
export {
  SPACECRAFT_EQUIPMENT,
  getEquipment,
  calculateEquipmentTons,
  calculateEquipmentCost,
  calculateEquipmentPower,
} from './equipment';

// ── Software ────────────────────────────────────────────────────────
export type { SoftwarePackage } from './software';
export {
  STANDARD_SOFTWARE,
  JUMP_CONTROL_SOFTWARE,
  COMBAT_SOFTWARE,
  ADVANCED_SOFTWARE,
  EXOTIC_DRIVE_SOFTWARE,
  UTILITY_SOFTWARE,
  ALL_SOFTWARE,
  getSoftware,
  getRequiredJumpControl,
  calculateSoftwareCostMCr,
  calculateProcessingRequired,
} from './software';

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

// ── Pre-Made Ships ──────────────────────────────────────────────────
export {
  // Starships
  SCOUT_COURIER,
  SEEKER_MINING_SHIP,
  FREE_TRADER,
  FAR_TRADER,
  SAFARI_SHIP,
  SYSTEM_DEFENCE_BOAT,
  YACHT,
  CLOSE_ESCORT_GAZELLE,
  LABORATORY_SHIP,
  PATROL_CORVETTE,
  SUBSIDISED_MERCHANT,
  SURVEY_SCOUT_DONOSEV,
  SUBSIDISED_LINER,
  MERCENARY_CRUISER,
  // Small Craft
  LIGHT_FIGHTER,
  GIG,
  LAUNCH,
  SHIPS_BOAT,
  SLOW_BOAT,
  PINNACE,
  SLOW_PINNACE,
  MODULAR_CUTTER,
  SHUTTLE,
  PASSENGER_SHUTTLE,
  // Collection & Helpers
  PRE_MADE_SHIPS,
  getPreMadeShip,
  getShipsByCategory,
  SHIP_SOURCE_LABELS,
  getShipSource,
  getFullCostMCr,
} from './preMadeShips';
