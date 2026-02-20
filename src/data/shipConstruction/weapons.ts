/**
 * Traveller High Guard – Weapons & Screens
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
 * Damage Multiples:
 *   Barbette: 3 | Small Bay: 10 | Medium Bay: 20 | Large Bay: 100 | Spinal: 1,000
 */

import type {
  TurretWeaponDef,
  WeaponMountDef,
  BarbetteWeaponDef,
  BayWeaponDef,
  SpinalWeaponDef,
  PointDefenceWeaponDef,
  ScreenDef,
  MissileDef,
  CanisterDef,
  TorpedoDef,
} from './types';

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
    cost: 0.5,
    traits: [],
    tons: 0,
  },
  {
    id: 'fusion_gun',
    name: 'Fusion Gun',
    tl: 14,
    range: 'Medium',
    power: 12,
    damage: '4D',
    cost: 2,
    traits: ['Radiation'],
    tons: 0,
  },
  {
    id: 'laser_drill',
    name: 'Laser Drill',
    tl: 8,
    range: 'Adjacent',
    power: 4,
    damage: '2D',
    cost: 0.15,
    traits: ['AP 4'],
    tons: 0,
  },
  {
    id: 'missile_rack',
    name: 'Missile Rack',
    tl: 7,
    range: 'Special',
    power: 0,
    damage: '4D',
    cost: 0.75,
    traits: ['Smart'],
    tons: 0,
  },
  {
    id: 'particle_beam',
    name: 'Particle Beam',
    tl: 12,
    range: 'Very Long',
    power: 8,
    damage: '3D',
    cost: 4,
    traits: ['Radiation'],
    tons: 0,
  },
  {
    id: 'plasma_gun',
    name: 'Plasma Gun',
    tl: 11,
    range: 'Medium',
    power: 6,
    damage: '3D',
    cost: 2.5,
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
    cost: 1,
    traits: [],
    tons: 0,
  },
  {
    id: 'railgun',
    name: 'Railgun',
    tl: 10,
    range: 'Short',
    power: 2,
    damage: '2D',
    cost: 1,
    traits: ['AP 4'],
    tons: 0,
  },
  {
    id: 'sandcaster',
    name: 'Sandcaster',
    tl: 9,
    range: 'Special',
    power: 0,
    damage: 'Special',
    cost: 0.25,
    traits: [],
    tons: 0,
  },
  // Legacy entry – kept for backward compatibility with older ship records
  {
    id: 'particle_barbette',
    name: 'Particle Barbette',
    tl: 11,
    range: 'Very Long',
    power: 15,
    damage: '4D',
    cost: 8,
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
    cost: 0.1,
    maxWeapons: 3,
  },
  {
    id: 'single_turret',
    name: 'Single Turret',
    tl: 7,
    power: 1,
    tons: 1,
    cost: 0.2,
    maxWeapons: 1,
  },
  {
    id: 'double_turret',
    name: 'Double Turret',
    tl: 8,
    power: 1,
    tons: 1,
    cost: 0.5,
    maxWeapons: 2,
  },
  {
    id: 'triple_turret',
    name: 'Triple Turret',
    tl: 9,
    power: 1,
    tons: 1,
    cost: 1,
    maxWeapons: 3,
  },
];

/** Pop-up mounting: +1 ton, +MCr1, TL10. Can be applied to any turret or fixed mount. */
export const POP_UP_MOUNTING = { additionalTons: 1, additionalCost: 1, tl: 10 };

// ═══════════════════════════════════════════════════════════════════════
//  BARBETTE WEAPONS  (Damage Multiple ×3, 5 tons each, 1 hardpoint each)
// ═══════════════════════════════════════════════════════════════════════

export const BARBETTE_WEAPONS: BarbetteWeaponDef[] = [
  {
    id: 'beam_laser_barbette',
    name: 'Beam Laser Barbette',
    tl: 10,
    range: 'Medium',
    power: 12,
    damage: '2D',
    cost: 3,
    traits: ['DM+4 to attack'],
    tons: 5,
    damageMultiple: 3,
  },
  {
    id: 'fusion_barbette',
    name: 'Fusion Barbette',
    tl: 12,
    range: 'Medium',
    power: 20,
    damage: '5D',
    cost: 4,
    traits: ['AP 3', 'Radiation'],
    tons: 5,
    damageMultiple: 3,
  },
  {
    id: 'ion_cannon_barbette',
    name: 'Ion Cannon',
    tl: 12,
    range: 'Medium',
    power: 10,
    damage: '2D×10',
    cost: 6,
    traits: ['Ion'],
    tons: 5,
    damageMultiple: 3,
  },
  {
    id: 'missile_barbette',
    name: 'Missile Barbette',
    tl: 7,
    range: 'Special',
    power: 0,
    damage: '4D',
    cost: 4,
    traits: ['Smart'],
    tons: 5,
    damageMultiple: 3,
  },
  {
    id: 'particle_barbette_bay',
    name: 'Particle Barbette',
    tl: 11,
    range: 'Very Long',
    power: 15,
    damage: '4D',
    cost: 8,
    traits: ['Radiation'],
    tons: 5,
    damageMultiple: 3,
  },
  {
    id: 'plasma_barbette',
    name: 'Plasma Barbette',
    tl: 11,
    range: 'Medium',
    power: 12,
    damage: '4D',
    cost: 5,
    traits: ['AP 2'],
    tons: 5,
    damageMultiple: 3,
  },
  {
    id: 'pulse_laser_barbette',
    name: 'Pulse Laser Barbette',
    tl: 9,
    range: 'Long',
    power: 12,
    damage: '3D',
    cost: 6,
    traits: ['DM+2 to attack'],
    tons: 5,
    damageMultiple: 3,
  },
  {
    id: 'railgun_barbette',
    name: 'Railgun Barbette',
    tl: 10,
    range: 'Medium',
    power: 5,
    damage: '3D',
    cost: 2,
    traits: ['AP 5'],
    tons: 5,
    damageMultiple: 3,
  },
  {
    id: 'torpedo_barbette',
    name: 'Torpedo Barbette',
    tl: 7,
    range: 'Special',
    power: 2,
    damage: '6D',
    cost: 3,
    traits: ['Smart'],
    tons: 5,
    damageMultiple: 3,
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  SMALL BAY WEAPONS  (50 tons, 1 hardpoint, 1 crew, Damage Multiple ×10)
// ═══════════════════════════════════════════════════════════════════════

export const SMALL_BAY_WEAPONS: BayWeaponDef[] = [
  {
    id: 'fusion_gun_bay',
    name: 'Fusion Gun Bay',
    tl: 12,
    range: 'Medium',
    power: 50,
    damage: '6D',
    cost: 8,
    traits: ['AP 6', 'Radiation'],
    size: 'small',
    tons: 50,
    hardpoints: 1,
    crew: 1,
    damageMultiple: 10,
  },
  {
    id: 'ion_cannon_bay',
    name: 'Ion Cannon Bay',
    tl: 12,
    range: 'Medium',
    power: 20,
    damage: '6D',
    cost: 15,
    traits: ['Ion'],
    size: 'small',
    tons: 50,
    hardpoints: 1,
    crew: 1,
    damageMultiple: 10,
  },
  {
    id: 'mass_driver_bay',
    name: 'Mass Driver Bay',
    tl: 8,
    range: 'Short',
    power: 15,
    damage: '3D',
    cost: 40,
    traits: ['Orbital Bombardment'],
    size: 'small',
    tons: 50,
    hardpoints: 1,
    crew: 1,
    damageMultiple: 10,
  },
  {
    id: 'meson_gun_bay',
    name: 'Meson Gun Bay',
    tl: 11,
    range: 'Long',
    power: 20,
    damage: '5D',
    cost: 50,
    traits: ['AP ∞', 'Radiation'],
    size: 'small',
    tons: 50,
    hardpoints: 1,
    crew: 1,
    damageMultiple: 10,
  },
  {
    id: 'missile_bay',
    name: 'Missile Bay',
    tl: 7,
    range: 'Special',
    power: 5,
    damage: '4D',
    cost: 12,
    traits: ['Smart'],
    size: 'small',
    tons: 50,
    hardpoints: 1,
    crew: 1,
    damageMultiple: 10,
  },
  {
    id: 'orbital_strike_mass_driver_bay',
    name: 'Orbital Strike Mass Driver Bay',
    tl: 10,
    range: 'Short',
    power: 35,
    damage: '7D',
    cost: 25,
    traits: ['Orbital Strike'],
    size: 'small',
    tons: 50,
    hardpoints: 1,
    crew: 1,
    damageMultiple: 10,
  },
  {
    id: 'orbital_strike_missile_bay',
    name: 'Orbital Strike Missile Bay',
    tl: 10,
    range: 'Medium',
    power: 5,
    damage: '3D',
    cost: 16,
    traits: ['Orbital Strike'],
    size: 'small',
    tons: 50,
    hardpoints: 1,
    crew: 1,
    damageMultiple: 10,
  },
  {
    id: 'particle_beam_bay',
    name: 'Particle Beam Bay',
    tl: 11,
    range: 'Very Long',
    power: 30,
    damage: '6D',
    cost: 20,
    traits: ['Radiation'],
    size: 'small',
    tons: 50,
    hardpoints: 1,
    crew: 1,
    damageMultiple: 10,
  },
  {
    id: 'railgun_bay',
    name: 'Railgun Bay',
    tl: 10,
    range: 'Short',
    power: 10,
    damage: '3D',
    cost: 30,
    traits: ['AP 10'],
    size: 'small',
    tons: 50,
    hardpoints: 1,
    crew: 1,
    damageMultiple: 10,
  },
  {
    id: 'repulsor_bay',
    name: 'Repulsor Bay',
    tl: 15,
    range: 'Short',
    power: 50,
    damage: 'Special',
    cost: 30,
    traits: [],
    size: 'small',
    tons: 50,
    hardpoints: 1,
    crew: 1,
    damageMultiple: 10,
  },
  {
    id: 'torpedo_bay',
    name: 'Torpedo Bay',
    tl: 7,
    range: 'Special',
    power: 2,
    damage: '6D',
    cost: 3,
    traits: ['Smart'],
    size: 'small',
    tons: 50,
    hardpoints: 1,
    crew: 1,
    damageMultiple: 10,
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  MEDIUM BAY WEAPONS  (100 tons, 1 hardpoint, 2 crew, Damage Multiple ×20)
// ═══════════════════════════════════════════════════════════════════════

export const MEDIUM_BAY_WEAPONS: BayWeaponDef[] = [
  {
    id: 'fusion_gun_bay',
    name: 'Fusion Gun Bay',
    tl: 12,
    range: 'Medium',
    power: 80,
    damage: '7D',
    cost: 14,
    traits: ['AP 6', 'Radiation'],
    size: 'medium',
    tons: 100,
    hardpoints: 1,
    crew: 2,
    damageMultiple: 20,
  },
  {
    id: 'ion_cannon_bay',
    name: 'Ion Cannon Bay',
    tl: 12,
    range: 'Medium',
    power: 30,
    damage: '8D',
    cost: 25,
    traits: ['Ion'],
    size: 'medium',
    tons: 100,
    hardpoints: 1,
    crew: 2,
    damageMultiple: 20,
  },
  {
    id: 'mass_driver_bay',
    name: 'Mass Driver Bay',
    tl: 8,
    range: 'Short',
    power: 25,
    damage: '4D',
    cost: 60,
    traits: ['Orbital Bombardment'],
    size: 'medium',
    tons: 100,
    hardpoints: 1,
    crew: 2,
    damageMultiple: 20,
  },
  {
    id: 'meson_gun_bay',
    name: 'Meson Gun Bay',
    tl: 12,
    range: 'Long',
    power: 30,
    damage: '6D',
    cost: 60,
    traits: ['AP ∞', 'Radiation'],
    size: 'medium',
    tons: 100,
    hardpoints: 1,
    crew: 2,
    damageMultiple: 20,
  },
  {
    id: 'missile_bay',
    name: 'Missile Bay',
    tl: 7,
    range: 'Special',
    power: 10,
    damage: '4D',
    cost: 20,
    traits: ['Smart'],
    size: 'medium',
    tons: 100,
    hardpoints: 1,
    crew: 2,
    damageMultiple: 20,
  },
  {
    id: 'orbital_strike_mass_driver_bay',
    name: 'Orbital Strike Mass Driver Bay',
    tl: 10,
    range: 'Short',
    power: 50,
    damage: '10D',
    cost: 35,
    traits: ['Orbital Strike'],
    size: 'medium',
    tons: 100,
    hardpoints: 1,
    crew: 2,
    damageMultiple: 20,
  },
  {
    id: 'orbital_strike_missile_bay',
    name: 'Orbital Strike Missile Bay',
    tl: 10,
    range: 'Medium',
    power: 15,
    damage: '5D',
    cost: 20,
    traits: ['Orbital Strike'],
    size: 'medium',
    tons: 100,
    hardpoints: 1,
    crew: 2,
    damageMultiple: 20,
  },
  {
    id: 'particle_beam_bay',
    name: 'Particle Beam Bay',
    tl: 12,
    range: 'Very Long',
    power: 50,
    damage: '8D',
    cost: 40,
    traits: ['Radiation'],
    size: 'medium',
    tons: 100,
    hardpoints: 1,
    crew: 2,
    damageMultiple: 20,
  },
  {
    id: 'railgun_bay',
    name: 'Railgun Bay',
    tl: 10,
    range: 'Short',
    power: 15,
    damage: '5D',
    cost: 50,
    traits: ['AP 10'],
    size: 'medium',
    tons: 100,
    hardpoints: 1,
    crew: 2,
    damageMultiple: 20,
  },
  {
    id: 'repulsor_bay',
    name: 'Repulsor Bay',
    tl: 14,
    range: 'Short',
    power: 100,
    damage: 'Special',
    cost: 60,
    traits: [],
    size: 'medium',
    tons: 100,
    hardpoints: 1,
    crew: 2,
    damageMultiple: 20,
  },
  {
    id: 'torpedo_bay',
    name: 'Torpedo Bay',
    tl: 7,
    range: 'Special',
    power: 5,
    damage: '6D',
    cost: 6,
    traits: ['Smart'],
    size: 'medium',
    tons: 100,
    hardpoints: 1,
    crew: 2,
    damageMultiple: 20,
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  LARGE BAY WEAPONS  (500 tons, 5 hardpoints, 4 crew, Damage Multiple ×100)
// ═══════════════════════════════════════════════════════════════════════

export const LARGE_BAY_WEAPONS: BayWeaponDef[] = [
  {
    id: 'fusion_gun_bay',
    name: 'Fusion Gun Bay',
    tl: 12,
    range: 'Long',
    power: 100,
    damage: '10D',
    cost: 25,
    traits: ['AP 8', 'Radiation'],
    size: 'large',
    tons: 500,
    hardpoints: 5,
    crew: 4,
    damageMultiple: 100,
  },
  {
    id: 'ion_cannon_bay',
    name: 'Ion Cannon Bay',
    tl: 12,
    range: 'Long',
    power: 40,
    damage: '10D',
    cost: 40,
    traits: ['Ion'],
    size: 'large',
    tons: 500,
    hardpoints: 5,
    crew: 4,
    damageMultiple: 100,
  },
  {
    id: 'mass_driver_bay',
    name: 'Mass Driver Bay',
    tl: 8,
    range: 'Medium',
    power: 35,
    damage: '6D',
    cost: 80,
    traits: ['Orbital Bombardment'],
    size: 'large',
    tons: 500,
    hardpoints: 5,
    crew: 4,
    damageMultiple: 100,
  },
  {
    id: 'meson_gun_bay',
    name: 'Meson Gun Bay',
    tl: 13,
    range: 'Long',
    power: 120,
    damage: '6D',
    cost: 250,
    traits: ['AP ∞', 'Radiation'],
    size: 'large',
    tons: 500,
    hardpoints: 5,
    crew: 4,
    damageMultiple: 100,
  },
  {
    id: 'missile_bay',
    name: 'Missile Bay',
    tl: 7,
    range: 'Special',
    power: 20,
    damage: '4D',
    cost: 25,
    traits: ['Smart'],
    size: 'large',
    tons: 500,
    hardpoints: 5,
    crew: 4,
    damageMultiple: 100,
  },
  {
    id: 'orbital_strike_mass_driver_bay',
    name: 'Orbital Strike Mass Driver Bay',
    tl: 10,
    range: 'Short',
    power: 75,
    damage: '12D',
    cost: 50,
    traits: ['Orbital Strike'],
    size: 'large',
    tons: 500,
    hardpoints: 5,
    crew: 4,
    damageMultiple: 100,
  },
  {
    id: 'orbital_strike_missile_bay',
    name: 'Orbital Strike Missile Bay',
    tl: 10,
    range: 'Medium',
    power: 25,
    damage: '8D',
    cost: 24,
    traits: ['Orbital Strike'],
    size: 'large',
    tons: 500,
    hardpoints: 5,
    crew: 4,
    damageMultiple: 100,
  },
  {
    id: 'particle_beam_bay',
    name: 'Particle Beam Bay',
    tl: 13,
    range: 'Distant',
    power: 80,
    damage: '10D',
    cost: 60,
    traits: ['Radiation'],
    size: 'large',
    tons: 500,
    hardpoints: 5,
    crew: 4,
    damageMultiple: 100,
  },
  {
    id: 'railgun_bay',
    name: 'Railgun Bay',
    tl: 10,
    range: 'Medium',
    power: 25,
    damage: '6D',
    cost: 70,
    traits: ['AP 10'],
    size: 'large',
    tons: 500,
    hardpoints: 5,
    crew: 4,
    damageMultiple: 100,
  },
  {
    id: 'repulsor_bay',
    name: 'Repulsor Bay',
    tl: 13,
    range: 'Short',
    power: 200,
    damage: 'Special',
    cost: 90,
    traits: [],
    size: 'large',
    tons: 500,
    hardpoints: 5,
    crew: 4,
    damageMultiple: 100,
  },
  {
    id: 'torpedo_bay',
    name: 'Torpedo Bay',
    tl: 7,
    range: 'Special',
    power: 10,
    damage: '6D',
    cost: 10,
    traits: ['Smart'],
    size: 'large',
    tons: 500,
    hardpoints: 5,
    crew: 4,
    damageMultiple: 100,
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  SPINAL MOUNT WEAPONS  (Damage Multiple ×1,000)
//  Base stats shown; every additional multiple adds powerPerMultiple,
//  damagePerMultiple and costPerMultiple to totals.
// ═══════════════════════════════════════════════════════════════════════

export const SPINAL_WEAPONS: SpinalWeaponDef[] = [
  {
    id: 'mass_driver_spinal',
    name: 'Spinal Mass Driver',
    tl: 10,
    range: 'Short',
    baseSizeTons: 5000,
    powerPerMultiple: 250,
    damagePerMultiple: '+4D',
    costPerMultiple: 1500,
    maxSizeTons: 100000,
    traits: ['AP 15', 'Orbital Bombardment'],
    damageMultiple: 1000,
  },
  {
    id: 'meson_spinal',
    name: 'Spinal Meson',
    tl: 12,
    range: 'Long',
    baseSizeTons: 7500,
    powerPerMultiple: 1000,
    damagePerMultiple: '+6D',
    costPerMultiple: 2000,
    maxSizeTons: 75000,
    traits: ['AP ∞', 'Radiation'],
    damageMultiple: 1000,
  },
  {
    id: 'particle_spinal',
    name: 'Spinal Particle',
    tl: 11,
    range: 'Very Long',
    baseSizeTons: 3500,
    powerPerMultiple: 1000,
    damagePerMultiple: '+8D',
    costPerMultiple: 1000,
    maxSizeTons: 28000,
    traits: ['Radiation'],
    damageMultiple: 1000,
  },
  {
    id: 'railgun_spinal',
    name: 'Spinal Railgun',
    tl: 10,
    range: 'Medium',
    baseSizeTons: 3500,
    powerPerMultiple: 500,
    damagePerMultiple: '+4D',
    costPerMultiple: 500,
    maxSizeTons: 21000,
    traits: ['AP 20'],
    damageMultiple: 1000,
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  POINT-DEFENCE BATTERIES  (1 hardpoint, 20 tons each)
// ═══════════════════════════════════════════════════════════════════════

export const POINT_DEFENCE_WEAPONS: PointDefenceWeaponDef[] = [
  // Laser batteries
  {
    id: 'pdl_type1',
    name: 'PD Laser Battery Type I',
    tl: 10,
    intercept: '+2D',
    power: 10,
    tons: 20,
    cost: 5,
    pdType: 'laser',
  },
  {
    id: 'pdl_type2',
    name: 'PD Laser Battery Type II',
    tl: 12,
    intercept: '+4D',
    power: 20,
    tons: 20,
    cost: 10,
    pdType: 'laser',
  },
  {
    id: 'pdl_type3',
    name: 'PD Laser Battery Type III',
    tl: 14,
    intercept: '+6D',
    power: 30,
    tons: 20,
    cost: 20,
    pdType: 'laser',
  },
  // Gauss batteries (require ammo: 1 ton/cannister, Cr30000, 12 rounds each)
  {
    id: 'pdg_type1',
    name: 'PD Gauss Battery Type I',
    tl: 10,
    intercept: '+2D',
    power: 5,
    tons: 20,
    cost: 3,
    pdType: 'gauss',
    notes: 'Requires ammo. 12 rounds per cannister (1 ton, Cr30,000). DM-2 vs Thrust 12-14, DM-6 vs Thrust 15+.',
  },
  {
    id: 'pdg_type2',
    name: 'PD Gauss Battery Type II',
    tl: 12,
    intercept: '+4D',
    power: 15,
    tons: 20,
    cost: 6,
    pdType: 'gauss',
    notes: 'Requires ammo. 12 rounds per cannister (1 ton, Cr30,000). DM-2 vs Thrust 12-14, DM-6 vs Thrust 15+.',
  },
  {
    id: 'pdg_type3',
    name: 'PD Gauss Battery Type III',
    tl: 14,
    intercept: '+6D',
    power: 25,
    tons: 20,
    cost: 10,
    pdType: 'gauss',
    notes: 'Requires ammo. 12 rounds per cannister (1 ton, Cr30,000). DM-2 vs Thrust 12-14, DM-6 vs Thrust 15+.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  SCREENS
// ═══════════════════════════════════════════════════════════════════════

export const SCREENS: ScreenDef[] = [
  {
    id: 'meson_screen',
    name: 'Meson Screen',
    tl: 13,
    power: 30,
    tons: 10,
    cost: 20,
    effect: 'Reduces meson weapon damage by 2D×10 and removes Radiation trait on a successful Gunner (screens) check.',
  },
  {
    id: 'nuclear_damper',
    name: 'Nuclear Damper',
    tl: 12,
    power: 20,
    tons: 10,
    cost: 10,
    effect: 'Reduces fusion/nuclear damage by 2D and removes Radiation trait. Against Destructive weapons, every 5 dampers reduce damage by 1DD.',
  },
  {
    id: 'black_globe_generator',
    name: 'Black Globe Generator',
    tl: 15,
    power: 30,
    tons: 50,
    cost: 100,
    effect: 'Absorbs all incoming energy into capacitors. Ship cannot manoeuvre, jump, use weapons or sensors while active. Capacitors (20% of jump drive size in tons, 50 pts/ton) must not overflow.',
    notes: 'Not commercially available. TL15+. Additional capacitors: MCr3/ton.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  MISSILES  (12 missiles = 1 ton)
// ═══════════════════════════════════════════════════════════════════════

export const MISSILES: MissileDef[] = [
  {
    id: 'missile_standard',
    name: 'Standard Missile',
    tl: 7,
    thrust: 10,
    damage: '4D',
    costPer12: 250000,
    traits: ['Smart'],
  },
  {
    id: 'missile_advanced',
    name: 'Advanced Missile',
    tl: 14,
    thrust: 15,
    damage: '5D',
    costPer12: 350000,
    traits: ['Smart'],
  },
  {
    id: 'missile_antimatter',
    name: 'Antimatter Missile',
    tl: 20,
    thrust: 15,
    damage: '2DD',
    costPer12: 1000000,
    traits: ['Radiation', 'Smart'],
  },
  {
    id: 'missile_anti_torpedo',
    name: 'Anti-Torpedo Missile',
    tl: 13,
    thrust: 15,
    damage: '1D',
    costPer12: 350000,
    traits: ['Smart'],
    notes: 'Eliminates 1D+Effect torpedoes from a salvo on hit. Only 1D damage vs conventional targets.',
  },
  {
    id: 'missile_decoy',
    name: 'Decoy Missile',
    tl: 9,
    thrust: 15,
    damage: '2D',
    costPer12: 150000,
    traits: ['Smart'],
    notes: 'All point-defence fire against this missile suffers DM-2.',
  },
  {
    id: 'missile_fragmentation',
    name: 'Fragmentation Missile',
    tl: 8,
    thrust: 15,
    damage: '3D',
    costPer12: 200000,
    traits: ['Smart'],
    notes: 'Attacks primary target and up to 3 others within Adjacent range. One-for-one vs missile salvoes.',
  },
  {
    id: 'missile_ion',
    name: 'Ion Missile',
    tl: 12,
    thrust: 12,
    damage: 'Special',
    costPer12: 750000,
    traits: ['Ion'],
    notes: 'Reduces target Power by 2D×5×Effect. Duration based on Effect.',
  },
  {
    id: 'missile_jumpbreaker',
    name: 'Jumpbreaker Missile',
    tl: 13,
    thrust: 10,
    damage: '—',
    costPer12: 1000000,
    traits: ['Smart'],
    notes: 'Hit ship suffers DM-8 to Jump checks this round and next.',
  },
  {
    id: 'missile_long_range',
    name: 'Long-Range Missile',
    tl: 8,
    thrust: 15,
    damage: '3D',
    costPer12: 500000,
    traits: ['Smart'],
    notes: 'Does not reduce salvo strength every 5 rounds.',
  },
  {
    id: 'missile_multi_warhead',
    name: 'Multi-Warhead Missile',
    tl: 8,
    thrust: 10,
    damage: '3D',
    costPer12: 750000,
    traits: ['Smart'],
    notes: 'Multiply salvo count ×3 before attack roll. DM-2 to all point-defence fire.',
  },
  {
    id: 'missile_nuclear',
    name: 'Nuclear Missile',
    tl: 6,
    thrust: 10,
    damage: '1DD',
    costPer12: 450000,
    traits: ['Radiation', 'Smart'],
    notes: 'Forbidden near inhabited planets.',
  },
  {
    id: 'missile_ortillery',
    name: 'Ortillery Missile',
    tl: 7,
    thrust: 6,
    damage: '1DD',
    costPer12: 300000,
    traits: ['Orbital Strike'],
    notes: 'Designed for planetary bombardment. DM-8 vs manoeuvring ships.',
  },
  {
    id: 'missile_shockwave',
    name: 'Shockwave Missile',
    tl: 7,
    thrust: 10,
    damage: '—',
    costPer12: 200000,
    traits: ['Smart'],
    notes: 'Magnetic-pulse warhead. Hit ship cannot benefit from sand defences this round and next.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  SANDCASTER CANISTERS  (20 canisters = 1 ton)
// ═══════════════════════════════════════════════════════════════════════

export const CANISTERS: CanisterDef[] = [
  {
    id: 'canister_sand',
    name: 'Sand Canister',
    tl: 7,
    costPer20: 25000,
    traits: [],
    notes: 'Standard defensive canister vs laser, energy and particle weapons.',
  },
  {
    id: 'canister_anti_personnel',
    name: 'Anti-Personnel Canister',
    tl: 8,
    costPer20: 40000,
    traits: [],
    notes: 'Launches fragmentation charges. 3D damage (Ground scale) in a cloud around the target.',
  },
  {
    id: 'canister_chaff',
    name: 'Chaff Canister',
    tl: 8,
    costPer20: 30000,
    traits: [],
    notes: 'DM-1 to all Electronics checks and missile attack rolls within the cloud. No protection vs energy weapons.',
  },
  {
    id: 'canister_pebble',
    name: 'Pebble Canister',
    tl: 7,
    costPer20: 25000,
    traits: [],
    notes: 'Offensive round. 1DD damage (Ground scale) vs boarders. No protection vs energy weapons.',
  },
  {
    id: 'canister_sandcutter',
    name: 'Sandcutter Canister',
    tl: 8,
    costPer20: 35000,
    traits: [],
    notes: 'Target within Adjacent/Close range. Successful hit halves enemy sand canister protection that round.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  TORPEDOES  (3 torpedoes = 1 ton)
// ═══════════════════════════════════════════════════════════════════════

export const TORPEDOES: TorpedoDef[] = [
  {
    id: 'torpedo_standard',
    name: 'Standard Torpedo',
    tl: 7,
    thrust: 10,
    damage: '6D',
    costPerTorpedo: 150000,
    traits: ['Smart'],
  },
  {
    id: 'torpedo_advanced',
    name: 'Advanced Torpedo',
    tl: 14,
    thrust: 15,
    damage: '7D',
    costPerTorpedo: 450000,
    traits: ['Smart'],
  },
  {
    id: 'torpedo_antimatter',
    name: 'Antimatter Torpedo',
    tl: 20,
    thrust: 10,
    damage: '3DD',
    costPerTorpedo: 900000,
    traits: ['Smart'],
  },
  {
    id: 'torpedo_antimatter_bomb_pumped',
    name: 'Antimatter Bomb-Pumped Torpedo',
    tl: 21,
    thrust: 10,
    damage: '8D',
    costPerTorpedo: 800000,
    traits: ['AP 10', 'Radiation', 'Smart'],
    notes: 'Stand-off attack. Point defence suffers DM-2. Armour applies.',
  },
  {
    id: 'torpedo_antiradiation',
    name: 'Antiradiation Torpedo',
    tl: 12,
    thrust: 10,
    damage: '6D',
    costPerTorpedo: 300000,
    traits: ['Smart'],
    notes: 'DM+6 vs ships using electronic warfare. Auto-misses if target did no EW.',
  },
  {
    id: 'torpedo_bomb_pumped',
    name: 'Bomb-Pumped Torpedo',
    tl: 9,
    thrust: 10,
    damage: '4D',
    costPerTorpedo: 250000,
    traits: ['Smart'],
    notes: 'Stand-off attack. Point defence suffers DM-2. Laser defences apply.',
  },
  {
    id: 'torpedo_ion',
    name: 'Ion Torpedo',
    tl: 9,
    thrust: 10,
    damage: 'Special',
    costPerTorpedo: 230000,
    traits: ['Smart'],
    notes: 'Reduces target Power by 4D×10×Effect. Duration based on Effect.',
  },
  {
    id: 'torpedo_multi_warhead_antimatter',
    name: 'Multi-Warhead Antimatter Torpedo',
    tl: 21,
    thrust: 10,
    damage: '1DD',
    costPerTorpedo: 2000000,
    traits: ['Radiation', 'Smart'],
    notes: 'Multiply salvo count ×3 before attack roll. DM-2 to all point-defence fire.',
  },
  {
    id: 'torpedo_multi_warhead_standard',
    name: 'Multi-Warhead Standard Torpedo',
    tl: 8,
    thrust: 10,
    damage: '4D',
    costPerTorpedo: 400000,
    traits: ['Smart'],
    notes: 'Multiply salvo count ×3 before attack roll. DM-2 to all point-defence fire.',
  },
  {
    id: 'torpedo_multi_warhead_nuclear',
    name: 'Multi-Warhead Nuclear Torpedo',
    tl: 8,
    thrust: 10,
    damage: '6D',
    costPerTorpedo: 600000,
    traits: ['Radiation', 'Smart'],
    notes: 'Multiply salvo count ×3 before attack roll. DM-2 to all point-defence fire.',
  },
  {
    id: 'torpedo_nuclear',
    name: 'Nuclear Torpedo',
    tl: 7,
    thrust: 10,
    damage: '2DD',
    costPerTorpedo: 225000,
    traits: ['Radiation', 'Smart'],
  },
  {
    id: 'torpedo_ortillery',
    name: 'Ortillery Torpedo',
    tl: 8,
    thrust: 6,
    damage: '3DD',
    costPerTorpedo: 1000000,
    traits: ['Orbital Strike'],
    notes: 'Designed for planetary bombardment. DM-8 vs manoeuvring ships.',
  },
  {
    id: 'torpedo_plasma',
    name: 'Plasma Torpedo',
    tl: 12,
    thrust: 10,
    damage: '1DD',
    costPerTorpedo: 650000,
    traits: ['AP 10', 'Smart'],
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

/** Calculate total tonnage consumed by a turret weapon installation */
export function calculateWeaponInstallationTons(
  mount: WeaponMountDef,
  weaponDefs: TurretWeaponDef[]
): number {
  const mountTons = mount.tons;
  const weaponTons = weaponDefs.reduce((sum, w) => sum + w.tons, 0);
  return mountTons + weaponTons;
}

/** Calculate total cost of a turret weapon installation in MCr */
export function calculateWeaponInstallationCostMCr(
  mount: WeaponMountDef,
  weaponDefs: TurretWeaponDef[]
): number {
  const mountCost = mount.cost;
  const weaponCost = weaponDefs.reduce((sum, w) => sum + w.cost, 0);
  return mountCost + weaponCost;
}

/** Calculate total power required by a turret weapon installation */
export function calculateWeaponInstallationPower(
  mount: WeaponMountDef,
  weaponDefs: TurretWeaponDef[]
): number {
  const mountPower = mount.power;
  const weaponPower = weaponDefs.reduce((sum, w) => sum + w.power, 0);
  return mountPower + weaponPower;
}

/** Calculate tons consumed by a spinal mount at a given multiple */
export function calculateSpinalMountTons(
  weapon: SpinalWeaponDef,
  multiple: number
): number {
  return weapon.baseSizeTons * multiple;
}

/** Calculate cost (MCr) of a spinal mount at a given multiple */
export function calculateSpinalMountCostMCr(
  weapon: SpinalWeaponDef,
  multiple: number
): number {
  return weapon.costPerMultiple * multiple;
}

/** Calculate power draw of a spinal mount at a given multiple */
export function calculateSpinalMountPower(
  weapon: SpinalWeaponDef,
  multiple: number
): number {
  return weapon.powerPerMultiple * multiple;
}

/** Hardpoints used by a spinal mount (tonnage / 100, rounded up) */
export function calculateSpinalMountHardpoints(
  weapon: SpinalWeaponDef,
  multiple: number
): number {
  return Math.ceil(calculateSpinalMountTons(weapon, multiple) / 100);
}
