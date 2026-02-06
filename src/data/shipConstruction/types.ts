/**
 * Traveller Core Rulebook - Spacecraft Construction Types
 *
 * Type definitions for the step-by-step ship construction system.
 * Each interface maps to a construction table or component from the rules.
 */

// ═══════════════════════════════════════════════════════════════════════
//  HULL (Step 1)
// ═══════════════════════════════════════════════════════════════════════

export type HullConfigType = 'standard' | 'streamlined' | 'dispersed';

export interface HullConfiguration {
  id: HullConfigType;
  name: string;
  streamlined: boolean | 'partial';
  /** Multiplier applied to hull points (e.g. 0.9 for dispersed = -10%) */
  hullPointModifier: number;
  /** Multiplier applied to hull cost (e.g. 1.2 for streamlined = +20%) */
  costModifier: number;
  canHaveArmor: boolean;
  /** Streamlined ships get free fuel scoops */
  freeFuelScoops: boolean;
  description: string;
}

export type ArmorMaterialId = 'crystaliron' | 'bonded_superdense';

export interface ArmorMaterial {
  id: ArmorMaterialId;
  name: string;
  tl: number;
  /** Percentage of hull tonnage consumed per point of Protection */
  tonnagePercent: number;
  /** Percentage of hull cost per point of Protection */
  costPercent: number;
  /** Maximum protection is TL of ship or this cap, whichever is less */
  maxProtectionCap: number | null; // null = no cap beyond TL
}

// ═══════════════════════════════════════════════════════════════════════
//  DRIVES (Step 2)
// ═══════════════════════════════════════════════════════════════════════

export interface DriveRatingEntry {
  rating: number;
  /** Percentage of hull consumed by this drive */
  hullPercent: number;
  /** Minimum TL required to install this rating */
  minTL: number;
}

// ═══════════════════════════════════════════════════════════════════════
//  POWER PLANT (Step 3)
// ═══════════════════════════════════════════════════════════════════════

export type PowerPlantTier = 'fusion_tl8' | 'fusion_tl12' | 'fusion_tl15';

export interface PowerPlantType {
  id: PowerPlantTier;
  name: string;
  tl: number;
  /** Power units generated per ton of power plant */
  powerPerTon: number;
  /** Cost in MCr per ton */
  costPerTon: number;
}

// ═══════════════════════════════════════════════════════════════════════
//  BRIDGE (Step 5)
// ═══════════════════════════════════════════════════════════════════════

export interface BridgeSizeEntry {
  /** Minimum hull tonnage (inclusive) */
  minTonnage: number;
  /** Maximum hull tonnage (inclusive) */
  maxTonnage: number;
  /** Tons consumed by the bridge */
  bridgeTons: number;
}

export interface CockpitOption {
  id: 'cockpit' | 'dual_cockpit';
  name: string;
  tons: number;
  cost: number; // Credits
  seats: number;
  lifeSupport: string;
  description: string;
}

// ═══════════════════════════════════════════════════════════════════════
//  COMPUTER (Step 6)
// ═══════════════════════════════════════════════════════════════════════

export interface ComputerModel {
  id: string;
  name: string;
  processing: number;
  tl: number;
  cost: number; // Credits
  description: string;
}

// ═══════════════════════════════════════════════════════════════════════
//  SENSORS (Step 7)
// ═══════════════════════════════════════════════════════════════════════

export interface SensorSuite {
  id: string;
  name: string;
  tl: number;
  /** DM applied to Electronics (comms) and Electronics (sensors) checks */
  dm: number;
  power: number;
  tons: number;
  cost: number; // Credits
  components: string[];
}

// ═══════════════════════════════════════════════════════════════════════
//  WEAPONS (Step 8)
// ═══════════════════════════════════════════════════════════════════════

export type TurretWeaponId =
  | 'beam_laser'
  | 'missile_rack'
  | 'particle_barbette'
  | 'pulse_laser'
  | 'sandcaster';

export interface TurretWeaponDef {
  id: TurretWeaponId;
  name: string;
  tl: number;
  range: string;
  power: number;
  damage: string;
  cost: number; // MCr
  traits: string[];
  /** Tonnage consumed (0 for most, 5 for particle barbette) */
  tons: number;
}

export type MountTypeId = 'fixed_mount' | 'single_turret' | 'double_turret' | 'triple_turret';

export interface WeaponMountDef {
  id: MountTypeId;
  name: string;
  tl: number;
  power: number;
  tons: number;
  cost: number; // MCr
  /** Maximum number of weapons that can be installed */
  maxWeapons: number;
}

// ═══════════════════════════════════════════════════════════════════════
//  EQUIPMENT (Step 9)
// ═══════════════════════════════════════════════════════════════════════

export type EquipmentCategory =
  | 'cargo'
  | 'fuel'
  | 'defense'
  | 'drones'
  | 'science'
  | 'accommodation'
  | 'operations'
  | 'stealth';

export interface SpacecraftEquipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  tl: number;
  description: string;
  /**
   * Tonnage calculation mode:
   * - 'fixed': uses `fixedTons`
   * - 'percent': uses `tonnagePercent` of hull
   * - 'per_unit': `fixedTons` per unit/installation
   * - 'variable': user decides (e.g. fuel processors, labs)
   */
  tonnageMode: 'fixed' | 'percent' | 'per_unit' | 'variable';
  fixedTons?: number;
  tonnagePercent?: number;
  /**
   * Cost calculation mode:
   * - 'fixed': uses `fixedCost` (MCr)
   * - 'per_ton': `costPerTon` MCr per ton consumed
   * - 'per_hull_ton': `costPerHullTon` Credits per ton of hull
   * - 'per_unit': `fixedCost` per unit
   */
  costMode: 'fixed' | 'per_ton' | 'per_hull_ton' | 'per_unit';
  fixedCost?: number; // MCr
  costPerTon?: number; // MCr per ton
  costPerHullTon?: number; // Credits per ton of hull
  power?: number;
  powerPerTon?: number;
  notes?: string;
  /** Minimum number that can be installed (usually 0 or 1) */
  minQuantity?: number;
  /** Maximum as percentage of hull, if applicable */
  maxPercent?: number;
}

// ═══════════════════════════════════════════════════════════════════════
//  STATEROOMS (Step 11)
// ═══════════════════════════════════════════════════════════════════════

export type StateroomTypeId = 'standard' | 'high' | 'luxury';

export interface StateroomDef {
  id: StateroomTypeId;
  name: string;
  tons: number;
  cost: number; // MCr
  description: string;
}

export interface LowBerthDef {
  tonsPerBerth: number;
  costPerBerth: number; // Credits
  /** 1 Power per this many berths */
  berthsPerPower: number;
}

// ═══════════════════════════════════════════════════════════════════════
//  CREW (Step 10)
// ═══════════════════════════════════════════════════════════════════════

export interface CrewPosition {
  id: string;
  name: string;
  skill: string;
  /** Monthly salary in Credits for skill level 1 */
  baseSalary: number;
  commercialRequirement: string;
  militaryRequirement: string;
}

// ═══════════════════════════════════════════════════════════════════════
//  SHIP DESIGN (complete blueprint)
// ═══════════════════════════════════════════════════════════════════════

export interface ShipWeaponInstallation {
  mountType: MountTypeId;
  weapons: TurretWeaponId[];
  /** True if this is a firmpoint (small craft <100 tons) */
  isFirmpoint?: boolean;
}

export interface ShipEquipmentInstallation {
  equipmentId: string;
  /** Tons allocated to this equipment */
  tons: number;
  /** Number of units (for per_unit items like docking spaces) */
  quantity: number;
}

/** The complete ship design — all choices made during construction */
export interface ShipDesign {
  // ── Meta ──
  name: string;
  designation?: string; // e.g. "Type-S", "Type-A"
  techLevel: number;

  // ── Step 1: Hull ──
  tonnage: number;
  hullConfiguration: HullConfigType;
  armorMaterial?: ArmorMaterialId;
  armorProtection: number;

  // ── Step 2: Drives ──
  manoeuvreRating: number;
  jumpRating: number;
  isReactionDrive: boolean;

  // ── Step 3: Power Plant ──
  powerPlantTier: PowerPlantTier;
  powerPlantTons: number;

  // ── Step 4: Fuel ──
  /** Extra weeks of power plant fuel beyond the base 4 weeks (0 = standard) */
  additionalFuelWeeks: number;

  // ── Step 5: Bridge ──
  useCockpit: boolean;
  cockpitType?: 'cockpit' | 'dual_cockpit';
  holographicControls: boolean;

  // ── Step 6: Computer ──
  computerId: string;
  computerBis: boolean;

  // ── Step 7: Sensors ──
  sensorSuiteId: string;
  additionalSensorStations: number;

  // ── Step 8: Weapons ──
  weapons: ShipWeaponInstallation[];

  // ── Step 9: Equipment ──
  equipment: ShipEquipmentInstallation[];

  // ── Step 10: Crew ──
  // (auto-calculated but can override)

  // ── Step 11: Staterooms ──
  standardStaterooms: number;
  doubleOccupancyStaterooms: number;
  highStaterooms: number;
  luxuryStaterooms: number;
  lowBerths: number;
  commonAreaTons: number;

  // ── Step 12: Cargo ──
  cargoTons: number;

  // ── Notes ──
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════════════
//  CALCULATED VALUES
// ═══════════════════════════════════════════════════════════════════════

export interface ShipCalculations {
  // ── Tonnage Breakdown ──
  hullArmorTons: number;
  manoeuvreDriveTons: number;
  jumpDriveTons: number;
  powerPlantTons: number;
  fuelTons: number;
  bridgeTons: number;
  sensorTons: number;
  sensorStationTons: number;
  weaponsTons: number;
  equipmentTons: number;
  stateroomTons: number;
  lowBerthTons: number;
  commonAreaTons: number;
  cargoTons: number;
  totalTonnageUsed: number;
  remainingTonnage: number;

  // ── Cost Breakdown (all in Credits) ──
  hullCost: number;
  armorCost: number;
  manoeuvreDriveCost: number;
  jumpDriveCost: number;
  powerPlantCost: number;
  bridgeCost: number;
  computerCost: number;
  sensorCost: number;
  sensorStationCost: number;
  weaponsCost: number;
  equipmentCost: number;
  stateroomCost: number;
  lowBerthCost: number;
  commonAreaCost: number;
  totalCost: number;

  // ── Hull ──
  hullPoints: number;

  // ── Power Budget ──
  totalPowerGenerated: number;
  powerBasicSystems: number;
  powerManoeuvreDrive: number;
  powerJumpDrive: number;
  powerSensors: number;
  powerWeapons: number;
  powerEquipment: number;
  totalPowerRequired: number;
  powerSurplus: number;

  // ── Fuel Breakdown ──
  jumpFuelTons: number;
  powerPlantFuelTons: number;

  // ── Hardpoints ──
  hardpoints: number;
  firmpoints: number;
  usedHardpoints: number;
  usedFirmpoints: number;

  // ── Crew ──
  crewPositions: Record<string, number>;
  totalCrew: number;
  monthlySalaries: number;

  // ── Operations ──
  maintenanceCostPerYear: number;
  maintenanceCostPerMonth: number;

  // ── Validation ──
  isValid: boolean;
  validationErrors: string[];
  validationWarnings: string[];
}
