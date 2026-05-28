/**
 * Traveller Core Rulebook - Spacecraft Construction Types
 *
 * Type definitions for the step-by-step ship construction system.
 * Each interface maps to a construction table or component from the rules.
 */

// ═══════════════════════════════════════════════════════════════════════
//  HULL (Step 1)
// ═══════════════════════════════════════════════════════════════════════

export type HullConfigType =
  | 'standard'
  | 'streamlined'
  | 'sphere'
  | 'close_structure'
  | 'dispersed'
  | 'planetoid'
  | 'buffered_planetoid';

export interface HullConfiguration {
  id: HullConfigType;
  name: string;
  streamlined: boolean | 'partial';
  /** Modifier applied to armour volume (e.g. 1.2 for streamlined = +20%) */
  armourVolumeModifier: number;
  /** Multiplier applied to hull points (e.g. 0.9 for dispersed = -10%) */
  hullPointModifier: number;
  /** Multiplier applied to hull cost (e.g. 1.2 for streamlined = +20%) */
  costModifier: number;
  canHaveArmor: boolean;
  /** Streamlined ships get free fuel scoops */
  freeFuelScoops: boolean;
  /** Whether this config can use specialised hull types */
  canUseSpecialisedHulls: boolean;
  /** Base armour protection from hull (planetoid/buffered) */
  baseArmourProtection: number;
  /** Examples from rulebook */
  examples: string;
  description: string;
}

/** Specialised hull type modifiers */
export type SpecialisedHullType = 'none' | 'reinforced' | 'light' | 'military' | 'non_gravity';

export interface SpecialisedHullDef {
  id: SpecialisedHullType;
  name: string;
  /** Multiplier applied to hull cost after configuration (e.g. 1.5 for reinforced = +50%) */
  costModifier: number;
  /** Multiplier applied to hull points (e.g. 1.1 for reinforced = +10%) */
  hullPointModifier: number;
  /** Minimum hull tonnage required (0 = no minimum) */
  minTonnage: number;
  /** Maximum hull tonnage (Infinity = no limit) */
  maxTonnage: number;
  /** Special notes about this hull type */
  notes: string;
  description: string;
}

/** Hull options that can be installed */
export type HullOptionId =
  | 'heat_shielding'
  | 'radiation_shielding'
  | 'reflec'
  | 'stealth_basic'
  | 'stealth_improved'
  | 'stealth_enhanced'
  | 'stealth_advanced';

export interface HullOptionDef {
  id: HullOptionId;
  name: string;
  tl: number;
  /** Cost per ton of hull in Credits */
  costPerHullTon: number;
  /** Percentage of hull consumed (0 for most) */
  hullPercent: number;
  /** Conflicts with these other options */
  conflictsWith: HullOptionId[];
  description: string;
}

export type ArmorMaterialId = 'titanium_steel' | 'crystaliron' | 'bonded_superdense' | 'molecular_bonded';

export interface ArmorMaterial {
  id: ArmorMaterialId;
  name: string;
  tl: number;
  /** Percentage of hull tonnage consumed per point of Protection */
  tonnagePercent: number;
  /** Cost per ton of armour in Credits */
  costPerTon: number;
  /** Maximum protection is TL of ship or this cap, whichever is less */
  maxProtectionCap: number | null; // null = no cap beyond TL
  /** Special traits */
  traits?: string;
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
  | 'fusion_gun'
  | 'laser_drill'
  | 'missile_rack'
  | 'particle_beam'
  | 'plasma_gun'
  | 'pulse_laser'
  | 'railgun'
  | 'sandcaster'
  | 'particle_barbette' // legacy – kept for backward compat
  | 'plasma_pulse_cannon_turret'; // High Guard exotic

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

export type MountTypeId = 'fixed_mount' | 'single_turret' | 'double_turret' | 'triple_turret' | 'quad_turret';

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

// ── Barbettes ────────────────────────────────────────────────────────

export type BarbetteWeaponId =
  | 'beam_laser_barbette'
  | 'fusion_barbette'
  | 'ion_cannon_barbette'
  | 'missile_barbette'
  | 'particle_barbette_bay'
  | 'plasma_barbette'
  | 'pulse_laser_barbette'
  | 'railgun_barbette'
  | 'torpedo_barbette'
  | 'plasma_pulse_barbette'     // High Guard exotic
  | 'tachyon_cannon_barbette';  // High Guard exotic

export interface BarbetteWeaponDef {
  id: BarbetteWeaponId;
  name: string;
  tl: number;
  range: string;
  power: number;
  damage: string;
  cost: number; // MCr
  traits: string[];
  tons: number; // typically 5
  /** Damage multiple applied after armour reduction – always 3 for barbettes */
  damageMultiple: 3;
}

// ── Bay Weapons ──────────────────────────────────────────────────────

export type BaySize = 'small' | 'medium' | 'large';

export type BayWeaponId =
  | 'fusion_gun_bay'
  | 'ion_cannon_bay'
  | 'mass_driver_bay'
  | 'meson_gun_bay'
  | 'missile_bay'
  | 'orbital_strike_mass_driver_bay'
  | 'orbital_strike_missile_bay'
  | 'particle_beam_bay'
  | 'railgun_bay'
  | 'repulsor_bay'
  | 'torpedo_bay'
  | 'neutron_laser_bay'   // High Guard exotic
  | 'plasma_pulse_bay'    // High Guard exotic
  | 'tachyon_cannon_bay'; // High Guard exotic

export interface BayWeaponDef {
  id: BayWeaponId;
  name: string;
  tl: number;
  range: string;
  /** Power draw for this bay at this size */
  power: number;
  damage: string;
  cost: number; // MCr
  traits: string[];
  size: BaySize;
  /** Tonnage consumed by the bay */
  tons: number;
  /** Hardpoints used (1 for small/medium, 5 for large) */
  hardpoints: number;
  /** Minimum crew positions required */
  crew: number;
  /** Damage multiple after armour (10/20/100) */
  damageMultiple: number;
}

// ── Spinal Mount Weapons ─────────────────────────────────────────────

export type SpinalWeaponId =
  | 'mass_driver_spinal'
  | 'meson_spinal'
  | 'particle_spinal'
  | 'railgun_spinal'
  | 'antimatter_spinal'       // High Guard exotic
  | 'neutron_laser_spinal'    // High Guard exotic
  | 'super_laser_spinal'      // High Guard exotic
  | 'tachyon_cannon_spinal';  // High Guard exotic

export interface SpinalWeaponDef {
  id: SpinalWeaponId;
  name: string;
  tl: number;
  range: string;
  /** Base tonnage (minimum size at lowest TL available) */
  baseSizeTons: number;
  /** Additional power consumed per multiple of base size */
  powerPerMultiple: number;
  /** Additional damage dice gained per multiple (e.g. '+4D') */
  damagePerMultiple: string;
  /** Additional cost in MCr per multiple of base size */
  costPerMultiple: number; // MCr
  /** Maximum total tonnage this weapon can reach */
  maxSizeTons: number;
  traits: string[];
  /** Damage multiple – always 1,000 for spinal mounts */
  damageMultiple: 1000;
}

// ── Point-Defence Weapons ────────────────────────────────────────────

export type PointDefenceWeaponId =
  | 'pdl_type1'
  | 'pdl_type2'
  | 'pdl_type3'
  | 'pdg_type1'
  | 'pdg_type2'
  | 'pdg_type3';

export type PointDefenceType = 'laser' | 'gauss';

export interface PointDefenceWeaponDef {
  id: PointDefenceWeaponId;
  name: string;
  tl: number;
  /** Dice rolled for interception, e.g. '+2D' */
  intercept: string;
  power: number;
  tons: number;
  cost: number; // MCr
  pdType: PointDefenceType;
  notes?: string;
}

// ── Screens ──────────────────────────────────────────────────────────

export type ScreenId =
  | 'meson_screen'
  | 'nuclear_damper'
  | 'black_globe_generator'
  | 'deflector_screens'        // High Guard exotic
  | 'energy_shields'           // High Guard exotic
  | 'improved_energy_shields'  // High Guard exotic
  | 'advanced_energy_shields'  // High Guard exotic
  | 'white_globe_generator';   // High Guard exotic

export interface ScreenDef {
  id: ScreenId;
  name: string;
  tl: number;
  power: number;
  tons: number;
  cost: number; // MCr
  effect: string;
  notes?: string;
}

// ── Missiles ─────────────────────────────────────────────────────────

export type MissileId =
  | 'missile_advanced'
  | 'missile_antimatter'
  | 'missile_anti_torpedo'
  | 'missile_decoy'
  | 'missile_fragmentation'
  | 'missile_ion'
  | 'missile_jumpbreaker'
  | 'missile_long_range'
  | 'missile_multi_warhead'
  | 'missile_nuclear'
  | 'missile_ortillery'
  | 'missile_shockwave'
  | 'missile_standard';

export interface MissileDef {
  id: MissileId;
  name: string;
  tl: number;
  thrust: number;
  damage: string;
  /** Cost for 12 missiles in Credits */
  costPer12: number;
  traits: string[];
  notes?: string;
}

// ── Sandcaster Canisters ─────────────────────────────────────────────

export type CanisterId =
  | 'canister_anti_personnel'
  | 'canister_chaff'
  | 'canister_pebble'
  | 'canister_sand'
  | 'canister_sandcutter';

export interface CanisterDef {
  id: CanisterId;
  name: string;
  tl: number;
  /** Cost for 20 canisters in Credits */
  costPer20: number;
  traits: string[];
  notes?: string;
}

// ── Torpedoes ────────────────────────────────────────────────────────

export type TorpedoId =
  | 'torpedo_advanced'
  | 'torpedo_antimatter'
  | 'torpedo_antimatter_bomb_pumped'
  | 'torpedo_antiradiation'
  | 'torpedo_bomb_pumped'
  | 'torpedo_ion'
  | 'torpedo_multi_warhead_antimatter'
  | 'torpedo_multi_warhead_standard'
  | 'torpedo_multi_warhead_nuclear'
  | 'torpedo_nuclear'
  | 'torpedo_ortillery'
  | 'torpedo_plasma'
  | 'torpedo_standard';

export interface TorpedoDef {
  id: TorpedoId;
  name: string;
  tl: number;
  thrust: number;
  damage: string;
  /** Cost per torpedo in Credits */
  costPerTorpedo: number;
  traits: string[];
  notes?: string;
}

// ── Installation types for ShipDesign ───────────────────────────────

export interface BarbetteInstallation {
  weaponId: BarbetteWeaponId;
  quantity: number;
}

export interface BayWeaponInstallation {
  weaponId: BayWeaponId;
  size: BaySize;
  quantity: number;
}

export interface SpinalWeaponInstallation {
  weaponId: SpinalWeaponId;
  /** How many multiples of base size (min 1) */
  multiple: number;
}

export interface ScreenInstallation {
  screenId: ScreenId;
  quantity: number;
}

export interface PointDefenceInstallation {
  weaponId: PointDefenceWeaponId;
  quantity: number;
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
  | 'stealth'
  | 'exotic'   // High Guard exotic technology
  | 'psionic'; // High Guard psionic technology

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
  specialisedHull?: SpecialisedHullType;
  hullOptions?: HullOptionId[];
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

  // ── Step 8: Weapons & Screens ──
  weapons: ShipWeaponInstallation[];
  barbettes?: BarbetteInstallation[];
  bays?: BayWeaponInstallation[];
  spinalMount?: SpinalWeaponInstallation;
  pointDefence?: PointDefenceInstallation[];
  screens?: ScreenInstallation[];

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
//  PRE-MADE SHIPS
// ═══════════════════════════════════════════════════════════════════════

export type ShipCategory =
  | 'scout'
  | 'trader'
  | 'military'
  | 'passenger'
  | 'exploration'
  | 'mining'
  | 'small_craft';

/** A single line item from a published ship stat block */
export interface ShipComponentLine {
  /** Display category (e.g. "Hull", "M-Drive", "Systems", "Weapons") */
  category: string;
  /** Component name as published */
  name: string;
  /** Tons consumed (null = none, e.g. computer, software) */
  tons: number | null;
  /** Cost in MCr (null = included/free) */
  costMCr: number | null;
}

/** Published power requirement entry */
export interface PowerRequirementLine {
  system: string;
  power: number;
}

/** A complete pre-made ship from the rulebook */
export interface PreMadeShip {
  id: string;
  source?: 'core' | 'ships_of_the_reach' | 'aslan' | 'campaign';
  name: string;
  designation?: string; // e.g. "Type S", "Type A", "Type K"
  category: ShipCategory;
  tl: number;
  tonnage: number;
  description: string;

  // ── Published Totals ──
  hullPoints: number;
  /** Purchase cost after standard 10% discount */
  purchaseCostMCr: number;
  maintenanceCostCrPerMonth: number;

  // ── Published Crew ──
  crew: string[];

  // ── Published Power Requirements ──
  powerRequirements: PowerRequirementLine[];

  // ── Component Breakdown (as published in rulebook) ──
  components: ShipComponentLine[];

  // ── Software Installed ──
  softwareIds: string[];

  // ── The ShipDesign for the calculator ──
  design: ShipDesign;
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
