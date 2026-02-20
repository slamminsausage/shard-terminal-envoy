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
//  ADVANCED SHIP COMPUTER SOFTWARE  (High Guard, p.73–75)
//  Capital-ship-grade packages. Bandwidth values map to `processing`.
// ═══════════════════════════════════════════════════════════════════════

export const ADVANCED_SOFTWARE: SoftwarePackage[] = [
  // ── Advanced Fire Control (does not stack with Fire Control) ──────
  {
    id: 'advanced_fire_control_1',
    name: 'Advanced Fire Control/1',
    rating: 1,
    tl: 10,
    processing: 15,
    costMCr: 12,
    isStandard: false,
    description:
      'DM+1 to all weapon attack rolls. Increases gunnery crew efficiency across the ship. Does not stack with Fire Control.',
  },
  {
    id: 'advanced_fire_control_2',
    name: 'Advanced Fire Control/2',
    rating: 2,
    tl: 12,
    processing: 25,
    costMCr: 15,
    isStandard: false,
    description:
      'DM+2 to all weapon attack rolls. Does not stack with Fire Control.',
  },
  {
    id: 'advanced_fire_control_3',
    name: 'Advanced Fire Control/3',
    rating: 3,
    tl: 14,
    processing: 30,
    costMCr: 18,
    isStandard: false,
    description:
      'DM+3 to all weapon attack rolls. Does not stack with Fire Control.',
  },
  // ── Anti-Hijack ──────────────────────────────────────────────────
  {
    id: 'anti_hijack_1',
    name: 'Anti-Hijack/1',
    rating: 1,
    tl: 11,
    processing: 2,
    costMCr: 6,
    isStandard: false,
    description:
      'Monitors airlocks and critical systems. DM-2 to all unauthorised computer intrusion and restricted area entry checks.',
  },
  {
    id: 'anti_hijack_2',
    name: 'Anti-Hijack/2',
    rating: 2,
    tl: 12,
    processing: 10,
    costMCr: 8,
    isStandard: false,
    description:
      'DM-4 to all unauthorised intrusion and restricted area entry checks.',
  },
  {
    id: 'anti_hijack_3',
    name: 'Anti-Hijack/3',
    rating: 3,
    tl: 13,
    processing: 15,
    costMCr: 10,
    isStandard: false,
    description:
      'DM-6 to all unauthorised intrusion and restricted area entry checks.',
  },
  // ── Battle Network ───────────────────────────────────────────────
  {
    id: 'battle_network_1',
    name: 'Battle Network/1',
    rating: 1,
    tl: 12,
    processing: 5,
    costMCr: 5,
    isStandard: false,
    description:
      'Enables sensor data hand-off to all desired allied ships within Medium range. Requires 1 Bandwidth from both host and recipient.',
  },
  {
    id: 'battle_network_2',
    name: 'Battle Network/2',
    rating: 2,
    tl: 14,
    processing: 10,
    costMCr: 10,
    isStandard: false,
    description:
      'Enables sensor data hand-off to all desired allied ships within Long range.',
  },
  // ── Battle System ─────────────────────────────────────────────────
  {
    id: 'battle_system_1',
    name: 'Battle System/1',
    rating: 1,
    tl: 9,
    processing: 5,
    costMCr: 18,
    isStandard: false,
    description:
      'Tactical fleet-action suite with simulation and prediction. DM+1 to Tactics (naval) checks.',
  },
  {
    id: 'battle_system_2',
    name: 'Battle System/2',
    rating: 2,
    tl: 12,
    processing: 10,
    costMCr: 24,
    isStandard: false,
    description:
      'Advanced tactical fleet-action suite. DM+2 to Tactics (naval) checks.',
  },
  {
    id: 'battle_system_3',
    name: 'Battle System/3',
    rating: 3,
    tl: 15,
    processing: 15,
    costMCr: 36,
    isStandard: false,
    description:
      'Superior tactical fleet-action suite. DM+3 to Tactics (naval) checks.',
  },
  // ── Broad Spectrum EW ────────────────────────────────────────────
  {
    id: 'broad_spectrum_ew',
    name: 'Broad Spectrum EW',
    rating: 0,
    tl: 13,
    processing: 12,
    costMCr: 14,
    isStandard: false,
    description:
      'Automatically performs one electronic warfare action (no crew skill DM) against every enemy salvo launched within Long range. Manual EW should be performed first — each salvo can receive only one EW action.',
  },
  // ── Conscious Intelligence ───────────────────────────────────────
  {
    id: 'conscious_intelligence_1',
    name: 'Conscious Intelligence/1',
    rating: 1,
    tl: 16,
    processing: 40,
    costMCr: 25,
    isStandard: false,
    description:
      'Fully sentient digital being with INT 15 and EDU 15. Skills uploadable at levels 3–5. Has a name, recognisable personality, and is considered alive by all non-biological measures.',
  },
  {
    id: 'conscious_intelligence_2',
    name: 'Conscious Intelligence/2',
    rating: 2,
    tl: 17,
    processing: 25,
    costMCr: 20,
    isStandard: false,
    description:
      'Higher-TL Conscious Intelligence requiring less Bandwidth. INT 15, EDU 15, skills 3–5.',
  },
  {
    id: 'conscious_intelligence_3',
    name: 'Conscious Intelligence/3',
    rating: 3,
    tl: 18,
    processing: 10,
    costMCr: 15,
    isStandard: false,
    description:
      'Most advanced Conscious Intelligence, minimum Bandwidth required. INT 15, EDU 15, skills 3–5.',
  },
  // ── Electronic Warfare ───────────────────────────────────────────
  {
    id: 'electronic_warfare_1',
    name: 'Electronic Warfare/1',
    rating: 1,
    tl: 10,
    processing: 10,
    costMCr: 15,
    isStandard: false,
    description:
      'DM+1 to all Electronics (sensors) checks for electronic warfare actions.',
  },
  {
    id: 'electronic_warfare_2',
    name: 'Electronic Warfare/2',
    rating: 2,
    tl: 13,
    processing: 15,
    costMCr: 18,
    isStandard: false,
    description:
      'DM+2 to all Electronics (sensors) checks for electronic warfare actions.',
  },
  {
    id: 'electronic_warfare_3',
    name: 'Electronic Warfare/3',
    rating: 3,
    tl: 15,
    processing: 20,
    costMCr: 24,
    isStandard: false,
    description:
      'DM+3 to all Electronics (sensors) checks for electronic warfare actions.',
  },
  // ── Launch Solution ──────────────────────────────────────────────
  {
    id: 'launch_solution_1',
    name: 'Launch Solution/1',
    rating: 1,
    tl: 8,
    processing: 5,
    costMCr: 10,
    isStandard: false,
    description:
      'DM+1 to all missile and torpedo salvo attack rolls.',
  },
  {
    id: 'launch_solution_2',
    name: 'Launch Solution/2',
    rating: 2,
    tl: 10,
    processing: 10,
    costMCr: 12,
    isStandard: false,
    description:
      'DM+2 to all missile and torpedo salvo attack rolls.',
  },
  {
    id: 'launch_solution_3',
    name: 'Launch Solution/3',
    rating: 3,
    tl: 12,
    processing: 15,
    costMCr: 16,
    isStandard: false,
    description:
      'DM+3 to all missile and torpedo salvo attack rolls.',
  },
  // ── Point Defence (software) ─────────────────────────────────────
  {
    id: 'point_defence_sw_1',
    name: 'Point Defence/1',
    rating: 1,
    tl: 9,
    processing: 12,
    costMCr: 8,
    isStandard: false,
    description:
      'Enables the ship to use its point defence batteries and Point Defence (gunner) reaction to defend any allied ship within Close range.',
  },
  {
    id: 'point_defence_sw_2',
    name: 'Point Defence/2',
    rating: 2,
    tl: 12,
    processing: 15,
    costMCr: 12,
    isStandard: false,
    description:
      'As Point Defence/1 but range extended to Short.',
  },
  // ── Screen Optimiser ─────────────────────────────────────────────
  {
    id: 'screen_optimiser',
    name: 'Screen Optimiser',
    rating: 0,
    tl: 10,
    processing: 10,
    costMCr: 5,
    isStandard: false,
    description:
      'Automatically performs the Angle Screens (gunner) action at DM+0 against any attack, and can operate any number of screens simultaneously.',
  },
  // ── Virtual Crew ─────────────────────────────────────────────────
  {
    id: 'virtual_crew_0',
    name: 'Virtual Crew/0',
    rating: 0,
    tl: 10,
    processing: 5,
    costMCr: 1,
    isStandard: false,
    description:
      'Replaces up to 5 pilots, gunners or sensor operators at skill 0. +1 Bandwidth per additional 5 crew. Allows drone operation via Electronics (remote ops): DM-2 at Long range, DM-4 at Very Long, uncontrolled at Distant.',
  },
  {
    id: 'virtual_crew_1',
    name: 'Virtual Crew/1',
    rating: 1,
    tl: 13,
    processing: 10,
    costMCr: 5,
    isStandard: false,
    description:
      'Replaces up to 5 crew at skill 1. +1 Bandwidth per additional 5 crew.',
  },
  {
    id: 'virtual_crew_2',
    name: 'Virtual Crew/2',
    rating: 2,
    tl: 15,
    processing: 15,
    costMCr: 10,
    isStandard: false,
    description:
      'Replaces up to 5 crew at skill 2. +1 Bandwidth per additional 5 crew.',
  },
  // ── Virtual Gunner ───────────────────────────────────────────────
  {
    id: 'virtual_gunner_0',
    name: 'Virtual Gunner/0',
    rating: 0,
    tl: 9,
    processing: 5,
    costMCr: 1,
    isStandard: false,
    description:
      'Replaces any number of gunners at skill 0. +1 Bandwidth per additional 10 gunners beyond the first 10. Compatible with Advanced Fire Control and other modifiers.',
  },
  {
    id: 'virtual_gunner_1',
    name: 'Virtual Gunner/1',
    rating: 1,
    tl: 12,
    processing: 10,
    costMCr: 5,
    isStandard: false,
    description:
      'Replaces any number of gunners at skill 1. +1 Bandwidth per additional 10 gunners.',
  },
  {
    id: 'virtual_gunner_2',
    name: 'Virtual Gunner/2',
    rating: 2,
    tl: 15,
    processing: 15,
    costMCr: 10,
    isStandard: false,
    description:
      'Replaces any number of gunners at skill 2. +1 Bandwidth per additional 10 gunners.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  EXOTIC DRIVE CONTROL SOFTWARE  (High Guard, Exotic Technology)
//  Required to operate Hop Drives and Skip Drives.
// ═══════════════════════════════════════════════════════════════════════

export const EXOTIC_DRIVE_SOFTWARE: SoftwarePackage[] = [
  // ── Hop Control (TL17+) ──────────────────────────────────────────
  { id: 'hop_control_1', name: 'Hop Control/1', rating: 1, tl: 17, processing: 40, costMCr: 1, isStandard: false, description: 'Required for Hop Drive/1. Enables hops of 1–10 parsecs (approx. 1 week travel time).' },
  { id: 'hop_control_2', name: 'Hop Control/2', rating: 2, tl: 18, processing: 50, costMCr: 2, isStandard: false, description: 'Required for Hop Drive/2. Enables hops of 1–20 parsecs.' },
  { id: 'hop_control_3', name: 'Hop Control/3', rating: 3, tl: 19, processing: 60, costMCr: 3, isStandard: false, description: 'Required for Hop Drive/3. Enables hops of 1–30 parsecs.' },
  { id: 'hop_control_4', name: 'Hop Control/4', rating: 4, tl: 20, processing: 70, costMCr: 4, isStandard: false, description: 'Required for Hop Drive/4. Enables hops of 1–40 parsecs.' },
  { id: 'hop_control_5', name: 'Hop Control/5', rating: 5, tl: 21, processing: 80, costMCr: 5, isStandard: false, description: 'Required for Hop Drive/5. Enables hops of 1–50 parsecs.' },
  { id: 'hop_control_6', name: 'Hop Control/6', rating: 6, tl: 22, processing: 90, costMCr: 6, isStandard: false, description: 'Required for Hop Drive/6. Enables hops of 1–60 parsecs.' },
  { id: 'hop_control_7', name: 'Hop Control/7', rating: 7, tl: 23, processing: 100, costMCr: 7, isStandard: false, description: 'Required for Hop Drive/7. Enables hops of 1–70 parsecs.' },
  { id: 'hop_control_8', name: 'Hop Control/8', rating: 8, tl: 24, processing: 110, costMCr: 8, isStandard: false, description: 'Required for Hop Drive/8. Enables hops of 1–80 parsecs.' },
  { id: 'hop_control_9', name: 'Hop Control/9', rating: 9, tl: 25, processing: 120, costMCr: 9, isStandard: false, description: 'Required for Hop Drive/9. Enables hops of 1–90 parsecs.' },
  // ── Skip Control (TL20+) ─────────────────────────────────────────
  { id: 'skip_control_1', name: 'Skip Control/1', rating: 1, tl: 20, processing: 40, costMCr: 1, isStandard: false, description: 'Required for Skip Drive/1. Enables skips of 1–100 parsecs. Reduces astrogation distance by 100 parsecs (min 1) for DM calculation. Cost waived if ship has a Core computer.' },
  { id: 'skip_control_2', name: 'Skip Control/2', rating: 2, tl: 21, processing: 50, costMCr: 2, isStandard: false, description: 'Required for Skip Drive/2. Enables skips of 1–200 parsecs.' },
  { id: 'skip_control_3', name: 'Skip Control/3', rating: 3, tl: 22, processing: 60, costMCr: 3, isStandard: false, description: 'Required for Skip Drive/3. Enables skips of 1–300 parsecs.' },
  { id: 'skip_control_4', name: 'Skip Control/4', rating: 4, tl: 23, processing: 70, costMCr: 4, isStandard: false, description: 'Required for Skip Drive/4. Enables skips of 1–400 parsecs.' },
  { id: 'skip_control_5', name: 'Skip Control/5', rating: 5, tl: 24, processing: 80, costMCr: 5, isStandard: false, description: 'Required for Skip Drive/5. Enables skips of 1–500 parsecs.' },
  { id: 'skip_control_6', name: 'Skip Control/6', rating: 6, tl: 25, processing: 90, costMCr: 6, isStandard: false, description: 'Required for Skip Drive/6. Enables skips of 1–600 parsecs.' },
  { id: 'skip_control_7', name: 'Skip Control/7', rating: 7, tl: 26, processing: 100, costMCr: 7, isStandard: false, description: 'Required for Skip Drive/7. Enables skips of 1–700 parsecs.' },
  { id: 'skip_control_8', name: 'Skip Control/8', rating: 8, tl: 27, processing: 110, costMCr: 8, isStandard: false, description: 'Required for Skip Drive/8. Enables skips of 1–800 parsecs.' },
  { id: 'skip_control_9', name: 'Skip Control/9', rating: 9, tl: 28, processing: 120, costMCr: 9, isStandard: false, description: 'Required for Skip Drive/9. Enables skips of 1–900 parsecs.' },
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
  ...ADVANCED_SOFTWARE,
  ...EXOTIC_DRIVE_SOFTWARE,
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
