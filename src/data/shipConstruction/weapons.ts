/**
 * Traveller Core Rulebook - Weapons & Screens
 *
 * Step 8 of spacecraft construction.
 *
 * Hardpoints: 1 per full 100 tons of hull
 * Firmpoints (small craft <100 tons):
 *   <35t = 1, 35-70t = 2, 71-99t = 3
 * Firmpoint restrictions:
 *   - Medium range or less → Adjacent
 *   - Greater range → Close
 *   - Cannot exceed Close range by any means
 *   - Only single weapon (no double/triple mount upgrade for weapons)
 *
 * Particle barbette consumes 5 tons within the ship.
 */

import type { TurretWeaponDef, WeaponMountDef } from './types';

// ═══════════════════════════════════════════════════════════════════════
//  TURRET WEAPONS
// ═══════════════════════════════════════════════════════════════════════

export const TURRET_WEAPONS: TurretWeaponDef[] = [
  {
    id: 'beam_laser',
    name: 'Beam Laser',
    tl: 10,
    range: 'Medium',
    power: 4,
    damage: '1D',
    cost: 0.5, // MCr
    traits: [],
    tons: 0,
  },
  {
    id: 'pulse_laser',
    name: 'Pulse Laser',
    tl: 9,
    range: 'Long',
    power: 4,
    damage: '2D',
    cost: 1, // MCr
    traits: [],
    tons: 0,
  },
  {
    id: 'missile_rack',
    name: 'Missile Rack',
    tl: 7,
    range: 'Special',
    power: 0,
    damage: '4D',
    cost: 0.75, // MCr
    traits: ['Smart'],
    tons: 0,
  },
  {
    id: 'sandcaster',
    name: 'Sandcaster',
    tl: 9,
    range: 'Special',
    power: 0,
    damage: 'Special',
    cost: 0.25, // MCr
    traits: [],
    tons: 0,
  },
  {
    id: 'particle_barbette',
    name: 'Particle Barbette',
    tl: 11,
    range: 'Very Long',
    power: 15,
    damage: '4D',
    cost: 8, // MCr
    traits: ['Radiation'],
    tons: 5,
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  WEAPON MOUNTS
// ═══════════════════════════════════════════════════════════════════════

export const WEAPON_MOUNTS: WeaponMountDef[] = [
  {
    id: 'fixed_mount',
    name: 'Fixed Mount',
    tl: 7,
    power: 0,
    tons: 0,
    cost: 0.1, // MCr
    maxWeapons: 3,
  },
  {
    id: 'single_turret',
    name: 'Single Turret',
    tl: 7,
    power: 1,
    tons: 1,
    cost: 0.2, // MCr
    maxWeapons: 1,
  },
  {
    id: 'double_turret',
    name: 'Double Turret',
    tl: 8,
    power: 1,
    tons: 1,
    cost: 0.5, // MCr
    maxWeapons: 2,
  },
  {
    id: 'triple_turret',
    name: 'Triple Turret',
    tl: 9,
    power: 1,
    tons: 1,
    cost: 1, // MCr
    maxWeapons: 3,
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/** Calculate number of hardpoints for a hull */
export function calculateHardpoints(hullTonnage: number): number {
  if (hullTonnage < 100) return 0;
  return Math.floor(hullTonnage / 100);
}

/** Calculate number of firmpoints for small craft (<100 tons) */
export function calculateFirmpoints(hullTonnage: number): number {
  if (hullTonnage >= 100) return 0;
  if (hullTonnage < 35) return 1;
  if (hullTonnage <= 70) return 2;
  return 3; // 71-99 tons
}

/** Calculate total tonnage consumed by a weapon installation */
export function calculateWeaponInstallationTons(
  mount: WeaponMountDef,
  weaponDefs: TurretWeaponDef[]
): number {
  const mountTons = mount.tons;
  const weaponTons = weaponDefs.reduce((sum, w) => sum + w.tons, 0);
  return mountTons + weaponTons;
}

/** Calculate total cost of a weapon installation in MCr */
export function calculateWeaponInstallationCostMCr(
  mount: WeaponMountDef,
  weaponDefs: TurretWeaponDef[]
): number {
  const mountCost = mount.cost;
  const weaponCost = weaponDefs.reduce((sum, w) => sum + w.cost, 0);
  return mountCost + weaponCost;
}

/** Calculate total power required by a weapon installation */
export function calculateWeaponInstallationPower(
  mount: WeaponMountDef,
  weaponDefs: TurretWeaponDef[]
): number {
  const mountPower = mount.power;
  const weaponPower = weaponDefs.reduce((sum, w) => sum + w.power, 0);
  return mountPower + weaponPower;
}
