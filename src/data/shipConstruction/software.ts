/**
 * Traveller Core Rulebook - Ship Software Packages
 *
 * Software runs on the ship's computer and does not consume tonnage.
 * Jump Control software is required for jump drives.
 * Standard software (Manoeuvre, Library, Intellect) comes with any ship.
 */

// ═══════════════════════════════════════════════════════════════════════
//  SOFTWARE PACKAGE TYPE
// ═══════════════════════════════════════════════════════════════════════

export interface SoftwarePackage {
  id: string;
  name: string;
  /** Rating/level of the software (0 for standard packages) */
  rating: number;
  tl: number;
  /** Processing bandwidth required on ship's computer */
  processing: number;
  /** Cost in MCr (0 for standard packages) */
  costMCr: number;
  /** True if this comes standard with any ship (no extra cost) */
  isStandard: boolean;
  description: string;
}

// ═══════════════════════════════════════════════════════════════════════
//  STANDARD SOFTWARE (included with every ship)
// ═══════════════════════════════════════════════════════════════════════

export const STANDARD_SOFTWARE: SoftwarePackage[] = [
  {
    id: 'manoeuvre_0',
    name: 'Manoeuvre/0',
    rating: 0,
    tl: 8,
    processing: 0,
    costMCr: 0,
    isStandard: true,
    description: 'Basic manoeuvre program allowing the ship to use its manoeuvre drive.',
  },
  {
    id: 'library',
    name: 'Library',
    rating: 0,
    tl: 8,
    processing: 0,
    costMCr: 0,
    isStandard: true,
    description:
      'Standard reference library software providing access to a wide range of general information.',
  },
  {
    id: 'intellect_0',
    name: 'Intellect/0',
    rating: 0,
    tl: 8,
    processing: 0,
    costMCr: 0,
    isStandard: true,
    description:
      'Basic ship AI that can handle routine operations and simple verbal commands.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  JUMP CONTROL SOFTWARE (required for jump drives)
// ═══════════════════════════════════════════════════════════════════════

export const JUMP_CONTROL_SOFTWARE: SoftwarePackage[] = [
  {
    id: 'jump_control_1',
    name: 'Jump Control/1',
    rating: 1,
    tl: 9,
    processing: 5,
    costMCr: 0.1,
    isStandard: false,
    description: 'Required for Jump-1. Requires Processing 5.',
  },
  {
    id: 'jump_control_2',
    name: 'Jump Control/2',
    rating: 2,
    tl: 11,
    processing: 10,
    costMCr: 0.2,
    isStandard: false,
    description: 'Required for Jump-2. Requires Processing 10.',
  },
  {
    id: 'jump_control_3',
    name: 'Jump Control/3',
    rating: 3,
    tl: 12,
    processing: 15,
    costMCr: 0.3,
    isStandard: false,
    description: 'Required for Jump-3. Requires Processing 15.',
  },
  {
    id: 'jump_control_4',
    name: 'Jump Control/4',
    rating: 4,
    tl: 13,
    processing: 20,
    costMCr: 0.4,
    isStandard: false,
    description: 'Required for Jump-4. Requires Processing 20.',
  },
  {
    id: 'jump_control_5',
    name: 'Jump Control/5',
    rating: 5,
    tl: 14,
    processing: 25,
    costMCr: 0.5,
    isStandard: false,
    description: 'Required for Jump-5. Requires Processing 25.',
  },
  {
    id: 'jump_control_6',
    name: 'Jump Control/6',
    rating: 6,
    tl: 15,
    processing: 30,
    costMCr: 0.6,
    isStandard: false,
    description: 'Required for Jump-6. Requires Processing 30.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  COMBAT SOFTWARE
// ═══════════════════════════════════════════════════════════════════════

export const COMBAT_SOFTWARE: SoftwarePackage[] = [
  {
    id: 'fire_control_1',
    name: 'Fire Control/1',
    rating: 1,
    tl: 9,
    processing: 5,
    costMCr: 2,
    isStandard: false,
    description: 'DM+1 to Gunner checks. Requires Processing 5.',
  },
  {
    id: 'fire_control_2',
    name: 'Fire Control/2',
    rating: 2,
    tl: 10,
    processing: 10,
    costMCr: 4,
    isStandard: false,
    description: 'DM+2 to Gunner checks. Requires Processing 10.',
  },
  {
    id: 'fire_control_3',
    name: 'Fire Control/3',
    rating: 3,
    tl: 11,
    processing: 15,
    costMCr: 6,
    isStandard: false,
    description: 'DM+3 to Gunner checks. Requires Processing 15.',
  },
  {
    id: 'fire_control_4',
    name: 'Fire Control/4',
    rating: 4,
    tl: 12,
    processing: 20,
    costMCr: 8,
    isStandard: false,
    description: 'DM+4 to Gunner checks. Requires Processing 20.',
  },
  {
    id: 'evade_1',
    name: 'Evade/1',
    rating: 1,
    tl: 9,
    processing: 10,
    costMCr: 1,
    isStandard: false,
    description: 'DM-1 to incoming attacks. Requires Processing 10.',
  },
  {
    id: 'evade_2',
    name: 'Evade/2',
    rating: 2,
    tl: 11,
    processing: 15,
    costMCr: 2,
    isStandard: false,
    description: 'DM-2 to incoming attacks. Requires Processing 15.',
  },
  {
    id: 'evade_3',
    name: 'Evade/3',
    rating: 3,
    tl: 13,
    processing: 25,
    costMCr: 3,
    isStandard: false,
    description: 'DM-3 to incoming attacks. Requires Processing 25.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  UTILITY SOFTWARE
// ═══════════════════════════════════════════════════════════════════════

export const UTILITY_SOFTWARE: SoftwarePackage[] = [
  {
    id: 'auto_repair_1',
    name: 'Auto-Repair/1',
    rating: 1,
    tl: 11,
    processing: 10,
    costMCr: 5,
    isStandard: false,
    description:
      'Allows the ship to attempt automated repairs. Uses repair drones if available.',
  },
  {
    id: 'auto_repair_2',
    name: 'Auto-Repair/2',
    rating: 2,
    tl: 13,
    processing: 15,
    costMCr: 10,
    isStandard: false,
    description: 'Advanced automated repair system.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  ALL SOFTWARE (combined)
// ═══════════════════════════════════════════════════════════════════════

export const ALL_SOFTWARE: SoftwarePackage[] = [
  ...STANDARD_SOFTWARE,
  ...JUMP_CONTROL_SOFTWARE,
  ...COMBAT_SOFTWARE,
  ...UTILITY_SOFTWARE,
];

// ═══════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/** Get software package by ID */
export function getSoftware(id: string): SoftwarePackage | undefined {
  return ALL_SOFTWARE.find((s) => s.id === id);
}

/** Get the required Jump Control software for a given jump rating */
export function getRequiredJumpControl(
  jumpRating: number
): SoftwarePackage | undefined {
  if (jumpRating <= 0) return undefined;
  return JUMP_CONTROL_SOFTWARE.find((s) => s.rating === jumpRating);
}

/** Calculate total software cost in MCr */
export function calculateSoftwareCostMCr(softwareIds: string[]): number {
  return softwareIds.reduce((total, id) => {
    const sw = getSoftware(id);
    return total + (sw?.costMCr ?? 0);
  }, 0);
}

/** Calculate total processing required */
export function calculateProcessingRequired(softwareIds: string[]): number {
  return softwareIds.reduce((total, id) => {
    const sw = getSoftware(id);
    return total + (sw?.processing ?? 0);
  }, 0);
}
