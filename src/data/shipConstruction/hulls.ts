/**
 * Traveller Core Rulebook - Hull Construction Data
 *
 * Step 1 of spacecraft construction: hull creation, configuration and armour.
 *
 * Base hull cost: Cr50,000 per ton
 * Hull points: 1 per full 2.5 tons
 * Self-sealing at TL9+
 */

import type { HullConfiguration, ArmorMaterial } from './types';

// ═══════════════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

/** Base cost per ton of hull in Credits */
export const HULL_COST_PER_TON = 50_000;

/** Tons of hull per 1 Hull Point */
export const TONS_PER_HULL_POINT = 2.5;

/** TL at which hulls become self-sealing */
export const SELF_SEALING_TL = 9;

// ═══════════════════════════════════════════════════════════════════════
//  HULL CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════

export const HULL_CONFIGURATIONS: HullConfiguration[] = [
  {
    id: 'standard',
    name: 'Standard',
    streamlined: 'partial',
    hullPointModifier: 1.0,
    costModifier: 1.0,
    canHaveArmor: true,
    freeFuelScoops: false,
    description:
      'A conventional hull shape. Partially streamlined — can perform emergency atmospheric entries but not designed for sustained atmospheric flight.',
  },
  {
    id: 'streamlined',
    name: 'Streamlined',
    streamlined: true,
    hullPointModifier: 1.0,
    costModifier: 1.2,
    canHaveArmor: true,
    freeFuelScoops: true,
    description:
      'Needle, wedge, cone or cylinder shapes designed for atmospheric entry and gas giant fuel scooping. Includes built-in fuel scoops at no extra cost.',
  },
  {
    id: 'dispersed',
    name: 'Dispersed Structure',
    streamlined: false,
    hullPointModifier: 0.9,
    costModifier: 0.5,
    canHaveArmor: false,
    freeFuelScoops: false,
    description:
      'An open-frame or spread-out structure not designed for atmospheric entry. Cannot be armoured. Cheap but fragile.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  ARMOUR
// ═══════════════════════════════════════════════════════════════════════

export const ARMOR_MATERIALS: ArmorMaterial[] = [
  {
    id: 'crystaliron',
    name: 'Crystaliron',
    tl: 10,
    tonnagePercent: 1.25,
    costPercent: 5,
    maxProtectionCap: 13, // TL or 13, whichever is less
  },
  {
    id: 'bonded_superdense',
    name: 'Bonded Superdense',
    tl: 14,
    tonnagePercent: 0.8,
    costPercent: 8,
    maxProtectionCap: null, // Max = TL (no additional cap)
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/** Calculate hull points for a given tonnage and configuration */
export function calculateHullPoints(
  tonnage: number,
  config: HullConfiguration
): number {
  const basePoints = Math.floor(tonnage / TONS_PER_HULL_POINT);
  return Math.floor(basePoints * config.hullPointModifier);
}

/** Calculate base hull cost before configuration modifier */
export function calculateBaseHullCost(tonnage: number): number {
  return tonnage * HULL_COST_PER_TON;
}

/** Calculate total hull cost including configuration */
export function calculateHullCost(
  tonnage: number,
  config: HullConfiguration
): number {
  return calculateBaseHullCost(tonnage) * config.costModifier;
}

/** Calculate armour tonnage consumed */
export function calculateArmorTonnage(
  hullTonnage: number,
  material: ArmorMaterial,
  protectionPoints: number
): number {
  return Math.ceil((hullTonnage * material.tonnagePercent * protectionPoints) / 100);
}

/** Calculate armour cost */
export function calculateArmorCost(
  hullTonnage: number,
  hullConfig: HullConfiguration,
  material: ArmorMaterial,
  protectionPoints: number
): number {
  const baseHullCost = calculateHullCost(hullTonnage, hullConfig);
  return Math.ceil((baseHullCost * material.costPercent * protectionPoints) / 100);
}

/** Get maximum protection for a given armour material and ship TL */
export function getMaxProtection(
  material: ArmorMaterial,
  shipTL: number
): number {
  if (material.maxProtectionCap !== null) {
    return Math.min(shipTL, material.maxProtectionCap);
  }
  return shipTL;
}
