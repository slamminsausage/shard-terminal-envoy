/**
 * Traveller High Guard - Hull Construction Data
 *
 * Step 1 of spacecraft construction: hull creation, configuration,
 * specialised hull types, armour, and hull options.
 *
 * Base hull cost: Cr50,000 per ton (Cr4,000 per ton for planetoids)
 * Hull points: 1 per full 2.5 tons (1 per 2 tons for 25k-99k, 1 per 1.5 tons for 100k+)
 * Self-sealing at TL9+
 */

import type {
  HullConfiguration,
  HullConfigType,
  ArmorMaterial,
  ArmorMaterialId,
  SpecialisedHullDef,
  SpecialisedHullType,
  HullOptionDef,
  HullOptionId,
} from './types';

// ═══════════════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

/** Base cost per ton of hull in Credits */
export const HULL_COST_PER_TON = 50_000;

/** Cost per ton for planetoid hulls */
export const PLANETOID_COST_PER_TON = 4_000;

/** Tons of hull per 1 Hull Point (standard ships) */
export const TONS_PER_HULL_POINT = 2.5;

/** Tons of hull per 1 Hull Point (massive ships 25k-99k) */
export const TONS_PER_HULL_POINT_MASSIVE = 2.0;

/** Tons of hull per 1 Hull Point (super-massive ships 100k+) */
export const TONS_PER_HULL_POINT_SUPER = 1.5;

/** TL at which hulls become self-sealing */
export const SELF_SEALING_TL = 9;

/** Minimum hull tonnage */
export const MIN_HULL_TONNAGE = 5;

/** Minimum tonnage for jump-capable ships */
export const MIN_JUMP_TONNAGE = 100;

// ═══════════════════════════════════════════════════════════════════════
//  HULL CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════

export const HULL_CONFIGURATIONS: HullConfiguration[] = [
  {
    id: 'standard',
    name: 'Standard',
    streamlined: 'partial',
    armourVolumeModifier: 1.0,
    hullPointModifier: 1.0,
    costModifier: 1.0,
    canHaveArmor: true,
    freeFuelScoops: false,
    canUseSpecialisedHulls: true,
    baseArmourProtection: 0,
    examples: 'Yacht, subsidised liner',
    description:
      'Boxy, cylindrical, series of joined boxes, possibly with rounded edges. Partially streamlined for emergency atmospheric entries.',
  },
  {
    id: 'streamlined',
    name: 'Streamlined',
    streamlined: true,
    armourVolumeModifier: 1.2,
    hullPointModifier: 1.0,
    costModifier: 1.2,
    canHaveArmor: true,
    freeFuelScoops: true,
    canUseSpecialisedHulls: true,
    baseArmourProtection: 0,
    examples: 'Pinnace, shuttle, scout/courier, free trader',
    description:
      'Needle, wedge, disc, lifting body or boxy with rounded nose. Designed for atmospheric entry and gas giant fuel scooping. Includes free fuel scoops.',
  },
  {
    id: 'sphere',
    name: 'Sphere',
    streamlined: 'partial',
    armourVolumeModifier: 0.9,
    hullPointModifier: 1.0,
    costModifier: 1.1,
    canHaveArmor: true,
    freeFuelScoops: false,
    canUseSpecialisedHulls: true,
    baseArmourProtection: 0,
    examples: 'Express boat, mercenary cruiser',
    description:
      'Sphere or large spheroid with limited protuberances. Partially streamlined. Armour is 10% cheaper by volume.',
  },
  {
    id: 'close_structure',
    name: 'Close Structure',
    streamlined: 'partial',
    armourVolumeModifier: 1.5,
    hullPointModifier: 1.0,
    costModifier: 0.8,
    canHaveArmor: true,
    freeFuelScoops: false,
    canUseSpecialisedHulls: true,
    baseArmourProtection: 0,
    examples: 'Chrysanthemum-class destroyer escort, Gazelle-class close escort',
    description:
      'Boxes joined by sturdy struts or with multiple projecting elements. Partially streamlined. Cheaper hull but armour costs 50% more volume.',
  },
  {
    id: 'dispersed',
    name: 'Dispersed Structure',
    streamlined: false,
    armourVolumeModifier: 2.0,
    hullPointModifier: 0.9,
    costModifier: 0.5,
    canHaveArmor: false,
    freeFuelScoops: false,
    canUseSpecialisedHulls: true,
    baseArmourProtection: 0,
    examples: 'Donosev-class survey scout, Lab Ship, Arakoine-class strike cruiser',
    description:
      'Irregular joined shapes, open framework, rings. Cannot enter atmosphere. Cannot be armoured. Very cheap but fragile (-10% HP).',
  },
  {
    id: 'planetoid',
    name: 'Planetoid',
    streamlined: false,
    armourVolumeModifier: 1.0,
    hullPointModifier: 1.25,
    costModifier: 0.08, // Cr4,000 per ton = 0.08 of Cr50,000
    canHaveArmor: false,
    freeFuelScoops: false,
    canUseSpecialisedHulls: false,
    baseArmourProtection: 2,
    examples: 'Planetoid Monitor',
    description:
      'An asteroid dragged from orbit and hollowed out. Only 80% of volume is useable. Starts with Protection +2. HP calculated on total volume. Cannot use specialised hull types.',
  },
  {
    id: 'buffered_planetoid',
    name: 'Buffered Planetoid',
    streamlined: false,
    armourVolumeModifier: 1.0,
    hullPointModifier: 1.5,
    costModifier: 0.08,
    canHaveArmor: false,
    freeFuelScoops: false,
    canUseSpecialisedHulls: false,
    baseArmourProtection: 4,
    examples: 'Heavily armoured planetoid installations',
    description:
      'A reinforced planetoid hull. Only 65% of volume is useable. Starts with Protection +4. HP calculated on total volume (+50%). Cannot use specialised hull types.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  SPECIALISED HULL TYPES
// ═══════════════════════════════════════════════════════════════════════

export const SPECIALISED_HULL_TYPES: SpecialisedHullDef[] = [
  {
    id: 'none',
    name: 'Standard Construction',
    costModifier: 1.0,
    hullPointModifier: 1.0,
    minTonnage: 0,
    maxTonnage: Infinity,
    notes: '',
    description: 'No specialised construction. Standard hull materials and techniques.',
  },
  {
    id: 'reinforced',
    name: 'Reinforced Hull',
    costModifier: 1.5,
    hullPointModifier: 1.1,
    minTonnage: 0,
    maxTonnage: Infinity,
    notes: 'Can stack with Military Hull on ships >5,000 tons.',
    description:
      'Increased internal bracing and higher-grade materials make this hull 10% more durable, at 50% additional cost.',
  },
  {
    id: 'light',
    name: 'Light Hull',
    costModifier: 0.75,
    hullPointModifier: 0.9,
    minTonnage: 0,
    maxTonnage: Infinity,
    notes: '',
    description:
      'Lower-grade materials and construction shortcuts reduce cost by 25% but Hull Points are reduced by 10%.',
  },
  {
    id: 'military',
    name: 'Military Hull',
    costModifier: 1.25,
    hullPointModifier: 1.0,
    minTonnage: 5001,
    maxTonnage: Infinity,
    notes: 'Capital ships only (>5,000 tons). Allows double maximum armour rating. Can stack with Reinforced.',
    description:
      'Military-grade construction allows armour up to double the standard rating. Only available for capital ships over 5,000 tons.',
  },
  {
    id: 'non_gravity',
    name: 'Non-Gravity Hull',
    costModifier: 0.5,
    hullPointModifier: 1.0,
    minTonnage: 0,
    maxTonnage: 500_000,
    notes: 'No artificial gravity. Base Power Requirements halved. Max 500,000 tons.',
    description:
      'Built without artificial grav plating. Must use spinning sections or constant thrust for gravity. Halves hull cost and base power requirements.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  HULL OPTIONS
// ═══════════════════════════════════════════════════════════════════════

export const HULL_OPTIONS: HullOptionDef[] = [
  {
    id: 'heat_shielding',
    name: 'Heat Shielding',
    tl: 6,
    costPerHullTon: 100_000, // MCr0.1 per ton
    hullPercent: 0,
    conflictsWith: [],
    description:
      'Protects the ship against re-entry heat or close proximity to a star. Required for non-gravitic atmospheric re-entry.',
  },
  {
    id: 'radiation_shielding',
    name: 'Radiation Shielding',
    tl: 7,
    costPerHullTon: 25_000, // Cr25,000 per ton
    hullPercent: 0,
    conflictsWith: [],
    description:
      'Decreases rads absorbed by all crew by 1,000 (instead of normal 500). Treats the bridge as Hardened.',
  },
  {
    id: 'reflec',
    name: 'Reflec Coating',
    tl: 10,
    costPerHullTon: 100_000, // MCr0.1 per ton
    hullPercent: 0,
    conflictsWith: ['stealth_basic', 'stealth_improved', 'stealth_enhanced', 'stealth_advanced'],
    description:
      'Reflective coating increases Protection against lasers by +3. Cannot be combined with Stealth.',
  },
  {
    id: 'stealth_basic',
    name: 'Stealth (Basic)',
    tl: 8,
    costPerHullTon: 40_000, // MCr0.04 per ton
    hullPercent: 2,
    conflictsWith: ['reflec', 'stealth_improved', 'stealth_enhanced', 'stealth_advanced'],
    description:
      'Emissions absorption grid. DM-2 to Electronics (sensors) checks to detect this ship. Consumes 2% of hull tonnage.',
  },
  {
    id: 'stealth_improved',
    name: 'Stealth (Improved)',
    tl: 10,
    costPerHullTon: 100_000, // MCr0.1 per ton
    hullPercent: 0,
    conflictsWith: ['reflec', 'stealth_basic', 'stealth_enhanced', 'stealth_advanced'],
    description:
      'Advanced coating. DM-2 to Electronics (sensors) checks to detect this ship. No tonnage required.',
  },
  {
    id: 'stealth_enhanced',
    name: 'Stealth (Enhanced)',
    tl: 12,
    costPerHullTon: 500_000, // MCr0.5 per ton
    hullPercent: 0,
    conflictsWith: ['reflec', 'stealth_basic', 'stealth_improved', 'stealth_advanced'],
    description:
      'High-tech stealth coating. DM-4 to Electronics (sensors) checks to detect this ship.',
  },
  {
    id: 'stealth_advanced',
    name: 'Stealth (Advanced)',
    tl: 14,
    costPerHullTon: 1_000_000, // MCr1.0 per ton
    hullPercent: 0,
    conflictsWith: ['reflec', 'stealth_basic', 'stealth_improved', 'stealth_enhanced'],
    description:
      'State-of-the-art stealth system. DM-6 to Electronics (sensors) checks to detect this ship.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  ARMOUR
// ═══════════════════════════════════════════════════════════════════════

export const ARMOR_MATERIALS: ArmorMaterial[] = [
  {
    id: 'titanium_steel',
    name: 'Titanium Steel',
    tl: 7,
    tonnagePercent: 2.5,
    costPerTon: 50_000,
    maxProtectionCap: 9, // TL or 9, whichever is less
  },
  {
    id: 'crystaliron',
    name: 'Crystaliron',
    tl: 10,
    tonnagePercent: 1.25,
    costPerTon: 200_000,
    maxProtectionCap: 13, // TL or 13, whichever is less
  },
  {
    id: 'bonded_superdense',
    name: 'Bonded Superdense',
    tl: 14,
    tonnagePercent: 0.80,
    costPerTon: 500_000,
    maxProtectionCap: null, // Max = TL (no additional cap)
  },
  {
    id: 'molecular_bonded',
    name: 'Molecular Bonded',
    tl: 16,
    tonnagePercent: 0.50,
    costPerTon: 1_500_000,
    maxProtectionCap: null, // Max = TL+4
    traits: 'Tachyon weapons lose AP trait against this armour.',
  },
];

/** Armour tonnage multiplier based on hull size (small ships need proportionally more) */
export const ARMOUR_TONNAGE_MULTIPLIERS: { minTons: number; maxTons: number; multiplier: number }[] = [
  { minTons: 5, maxTons: 15, multiplier: 4 },
  { minTons: 16, maxTons: 25, multiplier: 3 },
  { minTons: 26, maxTons: 99, multiplier: 2 },
  { minTons: 100, maxTons: Infinity, multiplier: 1 },
];

// ═══════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/** Get tons per hull point based on ship size (massive ship rules) */
export function getTonsPerHullPoint(tonnage: number): number {
  if (tonnage >= 100_000) return TONS_PER_HULL_POINT_SUPER;
  if (tonnage >= 25_000) return TONS_PER_HULL_POINT_MASSIVE;
  return TONS_PER_HULL_POINT;
}

/** Calculate hull points for a given tonnage, configuration, and specialised hull */
export function calculateHullPoints(
  tonnage: number,
  config: HullConfiguration,
  specialised?: SpecialisedHullDef
): number {
  const tonsPerPoint = getTonsPerHullPoint(tonnage);
  const basePoints = Math.floor(tonnage / tonsPerPoint);
  let points = Math.floor(basePoints * config.hullPointModifier);
  if (specialised) {
    points = Math.floor(points * specialised.hullPointModifier);
  }
  return points;
}

/** Calculate base hull cost before configuration modifier */
export function calculateBaseHullCost(tonnage: number, config: HullConfiguration): number {
  if (config.id === 'planetoid' || config.id === 'buffered_planetoid') {
    return tonnage * PLANETOID_COST_PER_TON;
  }
  return tonnage * HULL_COST_PER_TON;
}

/** Calculate total hull cost including configuration and specialised hull */
export function calculateHullCost(
  tonnage: number,
  config: HullConfiguration,
  specialised?: SpecialisedHullDef
): number {
  let cost: number;
  if (config.id === 'planetoid' || config.id === 'buffered_planetoid') {
    cost = tonnage * PLANETOID_COST_PER_TON;
  } else {
    cost = tonnage * HULL_COST_PER_TON * config.costModifier;
  }
  if (specialised && specialised.id !== 'none') {
    cost = cost * specialised.costModifier;
  }
  return cost;
}

/** Get the useable tonnage percentage for planetoid hulls */
export function getUseableTonnagePercent(config: HullConfiguration): number {
  if (config.id === 'planetoid') return 0.8;
  if (config.id === 'buffered_planetoid') return 0.65;
  return 1.0;
}

/** Get the armour tonnage multiplier for small hulls */
export function getArmourTonnageMultiplier(hullTonnage: number): number {
  const entry = ARMOUR_TONNAGE_MULTIPLIERS.find(
    (e) => hullTonnage >= e.minTons && hullTonnage <= e.maxTons
  );
  return entry?.multiplier ?? 1;
}

/** Calculate armour tonnage consumed (with hull config volume modifier and small ship multiplier) */
export function calculateArmorTonnage(
  hullTonnage: number,
  config: HullConfiguration,
  material: ArmorMaterial,
  protectionPoints: number
): number {
  const smallShipMultiplier = getArmourTonnageMultiplier(hullTonnage);
  const baseTonnagePercent = material.tonnagePercent * config.armourVolumeModifier * smallShipMultiplier;
  return Math.ceil((hullTonnage * baseTonnagePercent * protectionPoints) / 100);
}

/** Calculate armour cost */
export function calculateArmorCost(
  hullTonnage: number,
  config: HullConfiguration,
  material: ArmorMaterial,
  protectionPoints: number
): number {
  const armorTons = calculateArmorTonnage(hullTonnage, config, material, protectionPoints);
  return armorTons * material.costPerTon;
}

/** Get maximum protection for a given armour material, ship TL, and hull type */
export function getMaxProtection(
  material: ArmorMaterial,
  shipTL: number,
  isMilitaryHull: boolean = false
): number {
  let maxProt: number;
  if (material.id === 'molecular_bonded') {
    maxProt = shipTL + 4;
  } else if (material.maxProtectionCap !== null) {
    maxProt = Math.min(shipTL, material.maxProtectionCap);
  } else {
    maxProt = shipTL;
  }
  if (isMilitaryHull) {
    maxProt = maxProt * 2;
  }
  return maxProt;
}

/** Calculate hull option cost */
export function calculateHullOptionCost(option: HullOptionDef, hullTonnage: number): number {
  return option.costPerHullTon * hullTonnage;
}

/** Calculate hull option tonnage consumed */
export function calculateHullOptionTonnage(option: HullOptionDef, hullTonnage: number): number {
  return Math.ceil((hullTonnage * option.hullPercent) / 100);
}

/** Get a hull configuration by ID */
export function getHullConfig(id: HullConfigType): HullConfiguration | undefined {
  return HULL_CONFIGURATIONS.find((c) => c.id === id);
}

/** Get a specialised hull type by ID */
export function getSpecialisedHull(id: SpecialisedHullType): SpecialisedHullDef | undefined {
  return SPECIALISED_HULL_TYPES.find((s) => s.id === id);
}

/** Get a hull option by ID */
export function getHullOption(id: HullOptionId): HullOptionDef | undefined {
  return HULL_OPTIONS.find((o) => o.id === id);
}

/** Get an armour material by ID */
export function getArmourMaterial(id: ArmorMaterialId): ArmorMaterial | undefined {
  return ARMOR_MATERIALS.find((m) => m.id === id);
}
