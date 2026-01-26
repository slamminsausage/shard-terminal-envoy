// ============================================================================
// AGING TABLE (2D6)
// ============================================================================
// Characters begin aging at the end of their 4th term (age 34).
// The aging check becomes progressively harder as the character ages.

import type { CharacteristicName } from '../careers/types';

// Physical characteristics that can be affected by aging
export const AGING_CHARACTERISTICS: CharacteristicName[] = ['strength', 'dexterity', 'endurance'];

// Mental characteristics that can be affected by advanced age
export const MENTAL_CHARACTERISTICS: CharacteristicName[] = ['intellect'];

// ============================================================================
// AGING THRESHOLDS BY AGE
// ============================================================================
// Roll 2D6 at the end of each term starting from term 4
// Must roll >= threshold to avoid aging effects

export interface AgingThreshold {
  termNumber: number;
  ageRange: string;
  threshold: number;  // Roll this or higher to avoid effects
  description: string;
}

export const AGING_THRESHOLDS: AgingThreshold[] = [
  { termNumber: 4, ageRange: '34-37', threshold: -1, description: 'No aging roll required' },
  { termNumber: 5, ageRange: '38-41', threshold: 8, description: 'Roll 8+ to avoid aging' },
  { termNumber: 6, ageRange: '42-45', threshold: 8, description: 'Roll 8+ to avoid aging' },
  { termNumber: 7, ageRange: '46-49', threshold: 9, description: 'Roll 9+ to avoid aging' },
  { termNumber: 8, ageRange: '50-53', threshold: 9, description: 'Roll 9+ to avoid aging' },
  { termNumber: 9, ageRange: '54-57', threshold: 10, description: 'Roll 10+ to avoid aging' },
  { termNumber: 10, ageRange: '58-61', threshold: 10, description: 'Roll 10+ to avoid aging' },
  { termNumber: 11, ageRange: '62-65', threshold: 11, description: 'Roll 11+ to avoid aging' },
  { termNumber: 12, ageRange: '66-69', threshold: 11, description: 'Roll 11+ to avoid aging' },
  { termNumber: 13, ageRange: '70+', threshold: 12, description: 'Roll 12 to avoid aging' },
];

// Get the aging threshold for a given term number
export function getAgingThreshold(termNumber: number): AgingThreshold | null {
  // No aging before term 5 (age 38)
  if (termNumber < 5) return null;

  // Find the appropriate threshold
  const threshold = AGING_THRESHOLDS.find(t => t.termNumber === termNumber);
  if (threshold) return threshold;

  // For terms beyond 13, use the maximum difficulty
  if (termNumber >= 13) {
    return {
      termNumber,
      ageRange: `${18 + termNumber * 4}-${21 + termNumber * 4}`,
      threshold: 12,
      description: 'Roll 12 to avoid aging',
    };
  }

  return null;
}

// ============================================================================
// AGING EFFECTS TABLE (amount below threshold)
// ============================================================================
// The amount you fail the aging roll by determines the severity of effects

export interface AgingEffect {
  failedBy: number;      // Amount the roll failed by (1, 2, 3+, etc.)
  effects: {
    stat: CharacteristicName;
    modifier: -1;
  }[];
  description: string;
}

// Standard aging effects based on how badly the roll was failed
export const AGING_EFFECTS: AgingEffect[] = [
  {
    failedBy: 1,
    effects: [{ stat: 'endurance', modifier: -1 }],
    description: 'Minor aging effects. Reduce END by 1.',
  },
  {
    failedBy: 2,
    effects: [
      { stat: 'endurance', modifier: -1 },
      { stat: 'dexterity', modifier: -1 },
    ],
    description: 'Moderate aging effects. Reduce END and DEX by 1 each.',
  },
  {
    failedBy: 3,
    effects: [
      { stat: 'endurance', modifier: -1 },
      { stat: 'dexterity', modifier: -1 },
      { stat: 'strength', modifier: -1 },
    ],
    description: 'Significant aging effects. Reduce END, DEX, and STR by 1 each.',
  },
  {
    failedBy: 4,
    effects: [
      { stat: 'endurance', modifier: -1 },
      { stat: 'endurance', modifier: -1 },
      { stat: 'dexterity', modifier: -1 },
      { stat: 'strength', modifier: -1 },
    ],
    description: 'Severe aging effects. Reduce END by 2, DEX and STR by 1 each.',
  },
  {
    failedBy: 5,
    effects: [
      { stat: 'endurance', modifier: -1 },
      { stat: 'endurance', modifier: -1 },
      { stat: 'dexterity', modifier: -1 },
      { stat: 'dexterity', modifier: -1 },
      { stat: 'strength', modifier: -1 },
    ],
    description: 'Very severe aging effects. Reduce END and DEX by 2 each, STR by 1.',
  },
];

// Get aging effects based on how much the roll was failed by
export function getAgingEffects(failedBy: number): AgingEffect {
  if (failedBy <= 0) {
    return {
      failedBy: 0,
      effects: [],
      description: 'No aging effects.',
    };
  }

  // Cap at maximum defined effects
  const effectIndex = Math.min(failedBy - 1, AGING_EFFECTS.length - 1);
  return AGING_EFFECTS[effectIndex];
}

// ============================================================================
// AGING CRISIS
// ============================================================================
// If any characteristic is reduced to 0 by aging, the character enters aging crisis

export interface AgingCrisisResult {
  isCrisis: boolean;
  characteristics: CharacteristicName[];
  canSurvive: boolean;  // Can be saved by medical intervention
  message: string;
}

export function checkAgingCrisis(
  characteristics: Record<CharacteristicName, { total: number; current: number }>,
  agingEffects: { stat: CharacteristicName; modifier: number }[]
): AgingCrisisResult {
  const affectedStats: CharacteristicName[] = [];

  // Apply effects temporarily to check for crisis
  const tempStats = { ...characteristics };

  for (const effect of agingEffects) {
    tempStats[effect.stat] = {
      ...tempStats[effect.stat],
      total: tempStats[effect.stat].total + effect.modifier,
    };

    if (tempStats[effect.stat].total <= 0) {
      affectedStats.push(effect.stat);
    }
  }

  if (affectedStats.length === 0) {
    return {
      isCrisis: false,
      characteristics: [],
      canSurvive: true,
      message: 'Aging effects applied normally.',
    };
  }

  // Check if all physical characteristics would be reduced to 0 (death)
  const allPhysicalZero = AGING_CHARACTERISTICS.every(
    stat => tempStats[stat].total <= 0
  );

  if (allPhysicalZero) {
    return {
      isCrisis: true,
      characteristics: affectedStats,
      canSurvive: false,
      message: 'FATAL: All physical characteristics reduced to 0. The character has died of old age unless they have access to advanced medical technology.',
    };
  }

  return {
    isCrisis: true,
    characteristics: affectedStats,
    canSurvive: true,
    message: `AGING CRISIS: ${affectedStats.join(', ').toUpperCase()} reduced to 0! Character requires immediate medical attention or must pay Cr10,000 × (affected characteristics) for treatment, or the characteristic remains at 1 permanently.`,
  };
}

// ============================================================================
// ANAGATHICS
// ============================================================================
// Anagathic drugs can delay or reduce aging effects
// These are expensive and rare drugs that slow the aging process

export interface AnagathicsResult {
  isAvailable: boolean;
  costPerTerm: number;     // Cr per term
  agingDMBonus: number;    // Bonus to aging roll
  sideEffectRisk: boolean; // Risk of side effects
  message: string;
}

// Standard anagathics
export const ANAGATHICS: AnagathicsResult = {
  isAvailable: true,
  costPerTerm: 1000000,  // Cr1,000,000 per term
  agingDMBonus: 2,       // DM+2 to aging rolls
  sideEffectRisk: true,  // Must roll for side effects when stopping
  message: 'Anagathics grant DM+2 to aging rolls but cost Cr1,000,000 per term. Stopping use may cause side effects.',
};

// Check if character can afford anagathics
export function canAffordAnagathics(credits: number, termCost: number = ANAGATHICS.costPerTerm): boolean {
  return credits >= termCost;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Roll for aging at end of term
export interface AgingRollResult {
  termNumber: number;
  threshold: number;
  roll: number;
  dm: number;
  total: number;
  passed: boolean;
  failedBy: number;
  effects: AgingEffect;
  crisisCheck: AgingCrisisResult | null;
  message: string;
}

export function rollAging(
  termNumber: number,
  characteristics: Record<CharacteristicName, { total: number; current: number }>,
  dm: number = 0  // Can include anagathics bonus
): AgingRollResult | null {
  const threshold = getAgingThreshold(termNumber);

  // No aging roll needed
  if (!threshold || threshold.threshold < 0) {
    return null;
  }

  // Roll 2D6
  const roll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
  const total = roll + dm;
  const passed = total >= threshold.threshold;
  const failedBy = passed ? 0 : threshold.threshold - total;

  const effects = getAgingEffects(failedBy);

  // Check for aging crisis if failed
  const crisisCheck = !passed
    ? checkAgingCrisis(characteristics, effects.effects)
    : null;

  return {
    termNumber,
    threshold: threshold.threshold,
    roll,
    dm,
    total,
    passed,
    failedBy,
    effects,
    crisisCheck,
    message: passed
      ? `Aging roll: ${roll}${dm !== 0 ? ` + ${dm} DM` : ''} = ${total} vs ${threshold.threshold}. Passed! No aging effects.`
      : `Aging roll: ${roll}${dm !== 0 ? ` + ${dm} DM` : ''} = ${total} vs ${threshold.threshold}. Failed by ${failedBy}. ${effects.description}`,
  };
}

// Apply aging effects to characteristics
export function applyAgingEffects(
  characteristics: Record<CharacteristicName, { total: number; current: number }>,
  effects: { stat: CharacteristicName; modifier: number }[]
): Record<CharacteristicName, { total: number; current: number }> {
  const result = { ...characteristics };

  for (const effect of effects) {
    const current = result[effect.stat];
    result[effect.stat] = {
      total: Math.max(0, current.total + effect.modifier),
      current: Math.max(0, current.current + effect.modifier),
    };
  }

  return result;
}
