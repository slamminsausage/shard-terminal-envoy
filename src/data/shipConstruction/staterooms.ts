/**
 * Traveller Core Rulebook - Staterooms & Crew
 *
 * Steps 10-11 of spacecraft construction.
 *
 * Staterooms: 4 tons / MCr0.5 each (standard)
 * Double occupancy: no extra cost, 2 people per stateroom
 * Low berths: 0.5 tons / Cr50,000 each, 1 Power per 10 berths
 * Common areas: MCr0.1 per ton (recommended: 25% of stateroom tonnage)
 * Crew salaries increase +50% per skill level above 1
 */

import type { StateroomDef, LowBerthDef, CrewPosition } from './types';

// ═══════════════════════════════════════════════════════════════════════
//  STATEROOMS
// ═══════════════════════════════════════════════════════════════════════

export const STATEROOM_TYPES: StateroomDef[] = [
  {
    id: 'standard',
    name: 'Standard Stateroom',
    tons: 4,
    cost: 0.5, // MCr
    description:
      'Living and sleeping facilities including bed, fresher and basic kitchen. Can be double-occupied with bunks.',
  },
  {
    id: 'high',
    name: 'High Stateroom',
    tons: 6,
    cost: 0.8, // MCr
    description:
      'Finer materials and more space. Grants DM+1 when seeking high passengers. Not required but preferred.',
  },
  {
    id: 'luxury',
    name: 'Luxury Stateroom',
    tons: 10,
    cost: 1.5, // MCr
    description:
      'State of the art accommodation. Grants DM+2 when seeking high passengers. Found on private yachts and the finest liners.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  LOW BERTHS
// ═══════════════════════════════════════════════════════════════════════

export const LOW_BERTH: LowBerthDef = {
  tonsPerBerth: 0.5,
  costPerBerth: 50_000,
  berthsPerPower: 10,
};

// ═══════════════════════════════════════════════════════════════════════
//  COMMON AREAS
// ═══════════════════════════════════════════════════════════════════════

/** Cost per ton of common area in MCr */
export const COMMON_AREA_COST_PER_TON_MCR = 0.1;

/** Recommended common area is 25% of total stateroom tonnage */
export const RECOMMENDED_COMMON_AREA_PERCENT = 25;

// ═══════════════════════════════════════════════════════════════════════
//  CREW POSITIONS
// ═══════════════════════════════════════════════════════════════════════

export const CREW_POSITIONS: CrewPosition[] = [
  {
    id: 'pilot',
    name: 'Pilot',
    skill: 'Pilot',
    baseSalary: 6_000,
    commercialRequirement: '1',
    militaryRequirement: '3',
  },
  {
    id: 'astrogator',
    name: 'Astrogator',
    skill: 'Astrogation',
    baseSalary: 5_000,
    commercialRequirement: '1 if jump drive installed',
    militaryRequirement: '1 if jump drive installed',
  },
  {
    id: 'engineer',
    name: 'Engineer',
    skill: 'Engineer',
    baseSalary: 4_000,
    commercialRequirement: '1 per 35 tons of drives and power plant',
    militaryRequirement: '1 per 35 tons of drives and power plant',
  },
  {
    id: 'medic',
    name: 'Medic',
    skill: 'Medic',
    baseSalary: 4_000,
    commercialRequirement: '1 per 120 crew and passengers',
    militaryRequirement: '1 per 120 crew',
  },
  {
    id: 'gunner',
    name: 'Gunner',
    skill: 'Gunner',
    baseSalary: 2_000,
    commercialRequirement: '1 per turret',
    militaryRequirement: '2 per turret',
  },
  {
    id: 'steward',
    name: 'Steward',
    skill: 'Steward',
    baseSalary: 2_000,
    commercialRequirement: '1 per 10 High or 100 Middle passengers',
    militaryRequirement: '1 per 10 High or 100 Middle passengers',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/** Calculate total stateroom tonnage */
export function calculateStateroomTons(
  standard: number,
  high: number,
  luxury: number
): number {
  const stdDef = STATEROOM_TYPES.find((s) => s.id === 'standard')!;
  const highDef = STATEROOM_TYPES.find((s) => s.id === 'high')!;
  const luxDef = STATEROOM_TYPES.find((s) => s.id === 'luxury')!;
  return standard * stdDef.tons + high * highDef.tons + luxury * luxDef.tons;
}

/** Calculate total stateroom cost in Credits */
export function calculateStateroomCost(
  standard: number,
  high: number,
  luxury: number
): number {
  const stdDef = STATEROOM_TYPES.find((s) => s.id === 'standard')!;
  const highDef = STATEROOM_TYPES.find((s) => s.id === 'high')!;
  const luxDef = STATEROOM_TYPES.find((s) => s.id === 'luxury')!;
  return (
    (standard * stdDef.cost + high * highDef.cost + luxury * luxDef.cost) *
    1_000_000
  );
}

/** Calculate low berth tonnage */
export function calculateLowBerthTons(count: number): number {
  return count * LOW_BERTH.tonsPerBerth;
}

/** Calculate low berth cost in Credits */
export function calculateLowBerthCost(count: number): number {
  return count * LOW_BERTH.costPerBerth;
}

/** Calculate low berth power requirement */
export function calculateLowBerthPower(count: number): number {
  if (count <= 0) return 0;
  return Math.ceil(count / LOW_BERTH.berthsPerPower);
}

/** Calculate common area cost in Credits */
export function calculateCommonAreaCost(tons: number): number {
  return tons * COMMON_AREA_COST_PER_TON_MCR * 1_000_000;
}

/**
 * Calculate minimum crew requirements (commercial vessel).
 * Returns a record of position ID → count needed.
 */
export function calculateCrewRequirements(
  hasJumpDrive: boolean,
  drivesAndPPTons: number,
  turretCount: number,
  totalCrewAndPassengers: number,
  highPassengers: number,
  middlePassengers: number
): Record<string, number> {
  const crew: Record<string, number> = {};

  // Pilot: always 1 for commercial
  crew.pilot = 1;

  // Astrogator: 1 if jump drive installed
  crew.astrogator = hasJumpDrive ? 1 : 0;

  // Engineer: 1 per 35 tons of drives + power plant
  crew.engineer = drivesAndPPTons > 0 ? Math.max(1, Math.ceil(drivesAndPPTons / 35)) : 0;

  // Gunner: 1 per turret (commercial)
  crew.gunner = turretCount;

  // Medic: 1 per 120 crew and passengers
  crew.medic = totalCrewAndPassengers > 0
    ? Math.max(0, Math.ceil(totalCrewAndPassengers / 120))
    : 0;

  // Steward: 1 per 10 high passengers + 1 per 100 middle passengers
  crew.steward =
    Math.ceil(highPassengers / 10) + Math.ceil(middlePassengers / 100);

  return crew;
}

/** Calculate total monthly salary for all crew */
export function calculateMonthlySalaries(
  crewCounts: Record<string, number>
): number {
  return CREW_POSITIONS.reduce((total, pos) => {
    const count = crewCounts[pos.id] ?? 0;
    return total + count * pos.baseSalary;
  }, 0);
}
