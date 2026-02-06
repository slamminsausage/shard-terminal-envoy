/**
 * Traveller Core Rulebook - Augments Catalog
 *
 * Augments cover cybernetic implants, genetic engineering, and surgical
 * alterations. Each TL/improvement level is a separate entry for clean
 * dropdown selection. All augments require surgery to install (typically
 * 1D weeks, often reduced with Slow Drug).
 *
 * Important rules:
 * - Augmentations can take characteristics above species maximums.
 * - Augments interfere with medical treatment: long-term care / surgery
 *   Medic checks suffer a negative DM equal to the TL difference between
 *   the medical facility and the highest relevant implant.
 * - Skill Augmentation is limited to one per Traveller, and the
 *   Traveller must already have the skill at level 0+.
 */

import { AugmentCatalogItem } from './types';

// ═══════════════════════════════════════════════════════════════════════
//  PHYSICAL AUGMENTATIONS  —  STR, DEX, END
// ═══════════════════════════════════════════════════════════════════════

export const PHYSICAL_AUGMENTS: AugmentCatalogItem[] = [
  // ── Strength ─────────────────────────────────────────────────────
  {
    id: 'str-aug-1',
    name: 'Strength Augmentation +1',
    category: 'augment',
    augmentType: 'physical',
    tl: 11,
    mass_kg: 0,
    cost: 500000,
    improvement: 'STR +1',
    slot: 'musculature',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Reinforced bones, replaced motor neurons with faster synthetic cells, and vat-grown muscle tissue boost raw physical strength. Can take STR above species maximum. Must be purchased separately from DEX/END augmentations.',
  },
  {
    id: 'str-aug-2',
    name: 'Strength Augmentation +2',
    category: 'augment',
    augmentType: 'physical',
    tl: 12,
    mass_kg: 0,
    cost: 1000000,
    improvement: 'STR +2',
    slot: 'musculature',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Extensive replacement of motor neurons and reinforcement of the skeletal and muscular systems. More invasive than the +1 variant but significantly more effective.',
  },
  {
    id: 'str-aug-3',
    name: 'Strength Augmentation +3',
    category: 'augment',
    augmentType: 'physical',
    tl: 15,
    mass_kg: 0,
    cost: 5000000,
    improvement: 'STR +3',
    slot: 'musculature',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Near-total replacement of the musculoskeletal system with advanced synthetic components. The pinnacle of physical enhancement technology.',
  },

  // ── Dexterity ────────────────────────────────────────────────────
  {
    id: 'dex-aug-1',
    name: 'Dexterity Augmentation +1',
    category: 'augment',
    augmentType: 'physical',
    tl: 11,
    mass_kg: 0,
    cost: 500000,
    improvement: 'DEX +1',
    slot: 'nervous system',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Replacement of peripheral nerve fibres with faster synthetic substrates and fine-tuning of motor control centres. Improves reaction time, hand-eye coordination, and fine motor skills.',
  },
  {
    id: 'dex-aug-2',
    name: 'Dexterity Augmentation +2',
    category: 'augment',
    augmentType: 'physical',
    tl: 12,
    mass_kg: 0,
    cost: 1000000,
    improvement: 'DEX +2',
    slot: 'nervous system',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Extensive nervous system reworking with synthetic nerve clusters and enhanced proprioception. Significantly faster reflexes and precision.',
  },
  {
    id: 'dex-aug-3',
    name: 'Dexterity Augmentation +3',
    category: 'augment',
    augmentType: 'physical',
    tl: 15,
    mass_kg: 0,
    cost: 5000000,
    improvement: 'DEX +3',
    slot: 'nervous system',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Near-total replacement of the peripheral nervous system. Reaction times and motor precision far exceed natural human limits.',
  },

  // ── Endurance ────────────────────────────────────────────────────
  {
    id: 'end-aug-1',
    name: 'Endurance Augmentation +1',
    category: 'augment',
    augmentType: 'physical',
    tl: 11,
    mass_kg: 0,
    cost: 500000,
    improvement: 'END +1',
    slot: 'organs',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Replacement of key organs with tougher vat-grown clones and reinforcement of the cardiovascular system. Improved stamina, resilience, and recovery.',
  },
  {
    id: 'end-aug-2',
    name: 'Endurance Augmentation +2',
    category: 'augment',
    augmentType: 'physical',
    tl: 12,
    mass_kg: 0,
    cost: 1000000,
    improvement: 'END +2',
    slot: 'organs',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Extensive organ replacement and cardiovascular enhancement. The body can sustain far greater punishment and recover more quickly.',
  },
  {
    id: 'end-aug-3',
    name: 'Endurance Augmentation +3',
    category: 'augment',
    augmentType: 'physical',
    tl: 15,
    mass_kg: 0,
    cost: 5000000,
    improvement: 'END +3',
    slot: 'organs',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Near-total replacement of vital organs with advanced synthetic equivalents. Superhuman endurance and resilience to injury, toxins, and fatigue.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  COGNITIVE AUGMENTATION  —  INT
// ═══════════════════════════════════════════════════════════════════════

export const COGNITIVE_AUGMENTS: AugmentCatalogItem[] = [
  {
    id: 'int-aug-1',
    name: 'Cognitive Augmentation +1',
    category: 'augment',
    augmentType: 'cognitive',
    tl: 12,
    mass_kg: 0,
    cost: 500000,
    improvement: 'INT +1',
    slot: 'brain',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Replacing slow nerve cells with faster synthetic substrates and implanting optoelectronic boosters increases the speed at which a Traveller thinks, effectively boosting their intelligence.',
  },
  {
    id: 'int-aug-2',
    name: 'Cognitive Augmentation +2',
    category: 'augment',
    augmentType: 'cognitive',
    tl: 14,
    mass_kg: 0,
    cost: 1000000,
    improvement: 'INT +2',
    slot: 'brain',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Extensive neural replacement with synthetic substrates and multiple optoelectronic boosters. Dramatically faster cognitive processing and pattern recognition.',
  },
  {
    id: 'int-aug-3',
    name: 'Cognitive Augmentation +3',
    category: 'augment',
    augmentType: 'cognitive',
    tl: 16,
    mass_kg: 0,
    cost: 5000000,
    improvement: 'INT +3',
    slot: 'brain',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Near-total neural augmentation with advanced synthetic cognitive architecture. Thought processes far exceed baseline human capability.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  NEURAL IMPLANTS  —  Neural Comm, Wafer Jack
// ═══════════════════════════════════════════════════════════════════════

export const NEURAL_AUGMENTS: AugmentCatalogItem[] = [
  {
    id: 'neural-comm-audio',
    name: 'Neural Comm (Audio)',
    category: 'augment',
    augmentType: 'neural',
    tl: 10,
    mass_kg: 0,
    cost: 1000,
    improvement: 'Audio comm (thought-activated)',
    slot: 'neural',
    stackable: false,
    installationTime: '1D weeks',
    description: 'An implanted communications device with identical capacities to a standard comm, but operated by thought alone. Audio-only at this TL. Still requires skill checks for complicated activities.',
  },
  {
    id: 'neural-comm-av',
    name: 'Neural Comm (Audio/Visual)',
    category: 'augment',
    augmentType: 'neural',
    tl: 12,
    mass_kg: 0,
    cost: 5000,
    improvement: 'Audio/Visual comm, Computer/0',
    slot: 'neural',
    stackable: false,
    installationTime: '1D weeks',
    description: 'An advanced neural comm supporting both audio and visual data transmission, with an integrated Computer/0. Operated entirely by thought.',
  },
  {
    id: 'neural-comm-full',
    name: 'Neural Comm (Full Spectrum)',
    category: 'augment',
    augmentType: 'neural',
    tl: 14,
    mass_kg: 0,
    cost: 20000,
    improvement: 'Multiple data forms, Computer/1',
    slot: 'neural',
    stackable: false,
    installationTime: '1D weeks',
    description: 'A top-of-the-line neural comm capable of transmitting and receiving multiple forms of data simultaneously. Includes an integrated Computer/1, all operated by thought alone.',
  },
  {
    id: 'wafer-jack-4',
    name: 'Wafer Jack (Bandwidth/4)',
    category: 'augment',
    augmentType: 'neural',
    tl: 12,
    mass_kg: 0,
    cost: 10000,
    improvement: 'Expert programs (INT/EDU), Bandwidth/4',
    slot: 'skull base',
    stackable: false,
    installationTime: '1D weeks',
    description: 'A computer system implanted into the base of the skull with a physical data socket and processor running an interface program. Allows use of Expert programs for INT or EDU tasks by thought alone. Has Computer/2 for Expert programs only and always runs Intelligence Interface (no Bandwidth cost). Swapping software requires physical media. Bandwidth/4 for Expert software.',
  },
  {
    id: 'wafer-jack-8',
    name: 'Wafer Jack (Bandwidth/8)',
    category: 'augment',
    augmentType: 'neural',
    tl: 13,
    mass_kg: 0,
    cost: 15000,
    improvement: 'Expert programs (INT/EDU), Bandwidth/8',
    slot: 'skull base',
    stackable: false,
    installationTime: '1D weeks',
    description: 'An upgraded wafer jack with double the bandwidth for running Expert programs. Same capabilities as the Bandwidth/4 version but supports more complex or multiple Expert programs simultaneously.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  SENSORY AUGMENTATION
// ═══════════════════════════════════════════════════════════════════════

export const SENSORY_AUGMENTS: AugmentCatalogItem[] = [
  {
    id: 'enhanced-vision',
    name: 'Enhanced Vision',
    category: 'augment',
    augmentType: 'sensory',
    tl: 13,
    mass_kg: 0,
    cost: 25000,
    improvement: 'Binoculars, IR/Light Intensification',
    slot: 'eyes',
    stackable: false,
    installationTime: '1D weeks',
    description: 'Augmented eyes with built-in binocular magnification, infrared vision, and light intensification. Provides the equivalent of electronic binoculars and IR/LI goggles at all times without external equipment.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  SKILL AUGMENTATION
// ═══════════════════════════════════════════════════════════════════════

export const SKILL_AUGMENTS: AugmentCatalogItem[] = [
  {
    id: 'skill-augmentation',
    name: 'Skill Augmentation',
    category: 'augment',
    augmentType: 'skill',
    tl: 12,
    mass_kg: 0,
    cost: 50000,
    improvement: 'Skill DM+1 (one specific skill)',
    slot: 'nervous system',
    stackable: false,
    installationTime: '1D weeks',
    description: 'The Traveller\'s nervous system is rewired to be more suited to a particular task. A pilot might have their reflexes improved; a broker might control pupil responses and smell pheromones. Grants DM+1 when using one specific skill. Limited to ONE skill augmentation per Traveller. Must already possess the skill at level 0 or higher.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  PROTECTIVE AUGMENTATION
// ═══════════════════════════════════════════════════════════════════════

export const PROTECTIVE_AUGMENTS: AugmentCatalogItem[] = [
  {
    id: 'subdermal-armour-1',
    name: 'Subdermal Armour +1',
    category: 'augment',
    augmentType: 'protective',
    tl: 10,
    mass_kg: 0,
    cost: 50000,
    improvement: 'Protection +1',
    slot: 'skeletal/skin',
    stackable: false,
    installationTime: '1D weeks',
    description: 'A mesh of ballistic fibres added to the skin and reinforced bones, giving the Traveller extra armour. Subdermal armour stacks with other worn protection.',
  },
  {
    id: 'subdermal-armour-3',
    name: 'Subdermal Armour +3',
    category: 'augment',
    augmentType: 'protective',
    tl: 11,
    mass_kg: 0,
    cost: 100000,
    improvement: 'Protection +3',
    slot: 'skeletal/skin',
    stackable: false,
    installationTime: '1D weeks',
    description: 'An extensive mesh of advanced ballistic fibres woven under the skin with significant bone reinforcement. Provides substantial armour that stacks with all other worn protection.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  COMBINED CATALOG & UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/** All augments in a single array for searching/filtering */
export const AUGMENT_CATALOG: AugmentCatalogItem[] = [
  ...PHYSICAL_AUGMENTS,
  ...COGNITIVE_AUGMENTS,
  ...NEURAL_AUGMENTS,
  ...SENSORY_AUGMENTS,
  ...SKILL_AUGMENTS,
  ...PROTECTIVE_AUGMENTS,
];

/** Look up an augment by its catalog ID */
export function getAugmentById(id: string): AugmentCatalogItem | undefined {
  return AUGMENT_CATALOG.find(a => a.id === id);
}

/** Get all augments of a specific type (for dropdown grouping) */
export function getAugmentsByType(augmentType: AugmentCatalogItem['augmentType']): AugmentCatalogItem[] {
  return AUGMENT_CATALOG.filter(a => a.augmentType === augmentType);
}

/**
 * Calculate the medical treatment penalty for a character with augments.
 * The DM equals the TL difference between the medical facility and
 * the highest-TL relevant implant.
 */
export function calculateAugmentMedicalPenalty(
  augmentTLs: number[],
  facilityTL: number,
): number {
  if (augmentTLs.length === 0) return 0;
  const highestAugmentTL = Math.max(...augmentTLs);
  const penalty = highestAugmentTL - facilityTL;
  return Math.max(0, penalty); // Only a penalty if augment TL > facility TL
}

/**
 * Check if a character can install a given augment.
 * Rules:
 * - Only one Skill Augmentation allowed per Traveller
 * - Physical augments for the same characteristic replace (not stack)
 * - Neural Comm variants replace each other
 * - Subdermal Armour variants replace each other
 * - Wafer Jack variants replace each other
 */
export function getAugmentConflicts(
  newAugment: AugmentCatalogItem,
  installedAugmentIds: string[],
): string[] {
  const conflicts: string[] = [];
  const installed = installedAugmentIds
    .map(id => getAugmentById(id))
    .filter((a): a is AugmentCatalogItem => a !== undefined);

  for (const existing of installed) {
    // Same augment type + slot = replacement
    if (existing.augmentType === newAugment.augmentType && existing.slot === newAugment.slot) {
      conflicts.push(existing.id);
    }

    // Skill augmentation: only one allowed
    if (newAugment.augmentType === 'skill' && existing.augmentType === 'skill') {
      conflicts.push(existing.id);
    }
  }

  return [...new Set(conflicts)];
}

/**
 * Format augment cost for display. Handles MCr notation.
 */
export function formatAugmentCost(cost: number): string {
  if (cost >= 1000000) {
    const mcr = cost / 1000000;
    return `MCr${mcr}`;
  }
  return `Cr${cost.toLocaleString()}`;
}
