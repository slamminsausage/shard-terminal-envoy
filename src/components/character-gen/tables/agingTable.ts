// ============================================================================
// AGING TABLE (Traveller 2E)
// ============================================================================
// Characters begin aging at the end of their 4th term (age 34).
// Roll 2D6 at end of each term starting from term 5.
// Effect = roll + DM - threshold. Negative effects cause stat reductions.
// Players CHOOSE which characteristics are reduced (interactive).

import type { CharacteristicName } from '../careers/types';

// Physical characteristics that can be affected by aging
export const AGING_CHARACTERISTICS: CharacteristicName[] = ['strength', 'dexterity', 'endurance'];

// Mental characteristics that can be affected by extreme old age
export const MENTAL_CHARACTERISTICS: CharacteristicName[] = ['intellect', 'education'];

// ============================================================================
// AGING THRESHOLDS BY TERM
// ============================================================================

export interface AgingThreshold {
  termNumber: number;
  ageRange: string;
  threshold: number;
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

export function getAgingThreshold(termNumber: number): AgingThreshold | null {
  if (termNumber < 5) return null;

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
// INTERACTIVE AGING EFFECTS TABLE
// ============================================================================
// Based on Effect value (roll + DM - threshold).
// Players choose which characteristics are reduced.

export interface AgingChoice {
  label: string;
  effects: { stat: CharacteristicName; modifier: number }[];
}

export interface AgingEffectLevel {
  effectValue: number;
  isMinimum?: boolean;      // True for -6 (covers -6 and below)
  description: string;
  physicalChoices: AgingChoice[];   // Player picks one. Length 1 = automatic.
  mentalChoices?: AgingChoice[];    // Player picks one (only for extreme aging).
}

export const AGING_EFFECTS_TABLE: AgingEffectLevel[] = [
  // Effect 0: Reduce one physical characteristic by 1
  {
    effectValue: 0,
    description: 'Minor aging. Reduce one physical characteristic by 1.',
    physicalChoices: [
      { label: 'STR -1', effects: [{ stat: 'strength', modifier: -1 }] },
      { label: 'DEX -1', effects: [{ stat: 'dexterity', modifier: -1 }] },
      { label: 'END -1', effects: [{ stat: 'endurance', modifier: -1 }] },
    ],
  },
  // Effect -1: Reduce two physical characteristics by 1 each
  {
    effectValue: -1,
    description: 'Aging effects. Reduce two physical characteristics by 1 each.',
    physicalChoices: [
      {
        label: 'STR -1, DEX -1',
        effects: [{ stat: 'strength', modifier: -1 }, { stat: 'dexterity', modifier: -1 }],
      },
      {
        label: 'STR -1, END -1',
        effects: [{ stat: 'strength', modifier: -1 }, { stat: 'endurance', modifier: -1 }],
      },
      {
        label: 'DEX -1, END -1',
        effects: [{ stat: 'dexterity', modifier: -1 }, { stat: 'endurance', modifier: -1 }],
      },
    ],
  },
  // Effect -2: Reduce all three physical characteristics by 1
  {
    effectValue: -2,
    description: 'Significant aging. All physical characteristics reduced by 1.',
    physicalChoices: [
      {
        label: 'STR -1, DEX -1, END -1',
        effects: [
          { stat: 'strength', modifier: -1 },
          { stat: 'dexterity', modifier: -1 },
          { stat: 'endurance', modifier: -1 },
        ],
      },
    ],
  },
  // Effect -3: Reduce one physical by 2, two by 1
  {
    effectValue: -3,
    description: 'Serious aging. Reduce one physical characteristic by 2, and two others by 1.',
    physicalChoices: [
      {
        label: 'STR -2, DEX -1, END -1',
        effects: [
          { stat: 'strength', modifier: -2 },
          { stat: 'dexterity', modifier: -1 },
          { stat: 'endurance', modifier: -1 },
        ],
      },
      {
        label: 'DEX -2, STR -1, END -1',
        effects: [
          { stat: 'dexterity', modifier: -2 },
          { stat: 'strength', modifier: -1 },
          { stat: 'endurance', modifier: -1 },
        ],
      },
      {
        label: 'END -2, STR -1, DEX -1',
        effects: [
          { stat: 'endurance', modifier: -2 },
          { stat: 'strength', modifier: -1 },
          { stat: 'dexterity', modifier: -1 },
        ],
      },
    ],
  },
  // Effect -4: Reduce two physical by 2, one by 1
  {
    effectValue: -4,
    description: 'Severe aging. Reduce two physical characteristics by 2, and one by 1.',
    physicalChoices: [
      {
        label: 'STR -1 (DEX -2, END -2)',
        effects: [
          { stat: 'strength', modifier: -1 },
          { stat: 'dexterity', modifier: -2 },
          { stat: 'endurance', modifier: -2 },
        ],
      },
      {
        label: 'DEX -1 (STR -2, END -2)',
        effects: [
          { stat: 'dexterity', modifier: -1 },
          { stat: 'strength', modifier: -2 },
          { stat: 'endurance', modifier: -2 },
        ],
      },
      {
        label: 'END -1 (STR -2, DEX -2)',
        effects: [
          { stat: 'endurance', modifier: -1 },
          { stat: 'strength', modifier: -2 },
          { stat: 'dexterity', modifier: -2 },
        ],
      },
    ],
  },
  // Effect -5: Reduce all three physical by 2
  {
    effectValue: -5,
    description: 'Very severe aging. All physical characteristics reduced by 2.',
    physicalChoices: [
      {
        label: 'STR -2, DEX -2, END -2',
        effects: [
          { stat: 'strength', modifier: -2 },
          { stat: 'dexterity', modifier: -2 },
          { stat: 'endurance', modifier: -2 },
        ],
      },
    ],
  },
  // Effect -6 or less: All three physical by 2, plus one mental by 1
  {
    effectValue: -6,
    isMinimum: true,
    description: 'Catastrophic aging. All physical characteristics reduced by 2. One mental characteristic reduced by 1.',
    physicalChoices: [
      {
        label: 'STR -2, DEX -2, END -2',
        effects: [
          { stat: 'strength', modifier: -2 },
          { stat: 'dexterity', modifier: -2 },
          { stat: 'endurance', modifier: -2 },
        ],
      },
    ],
    mentalChoices: [
      { label: 'INT -1', effects: [{ stat: 'intellect', modifier: -1 }] },
      { label: 'EDU -1', effects: [{ stat: 'education', modifier: -1 }] },
    ],
  },
];

// Get the aging effect level for a given effect value
export function getAgingEffectLevel(effectValue: number): AgingEffectLevel | null {
  // Effect 1+: no aging effects
  if (effectValue >= 1) return null;

  // Find exact match
  const exact = AGING_EFFECTS_TABLE.find(e => e.effectValue === effectValue && !e.isMinimum);
  if (exact) return exact;

  // For values -6 or below, use the minimum entry
  if (effectValue <= -6) {
    return AGING_EFFECTS_TABLE.find(e => e.isMinimum) || null;
  }

  return null;
}

// ============================================================================
// AGING CRISIS
// ============================================================================
// If any characteristic is reduced to 0 by aging, the character enters aging crisis.
// The characteristic is set to 1 instead of 0 but requires medical treatment.
// Cost: 1D × Cr10,000 per characteristic in crisis.

export interface AgingCrisisResult {
  isCrisis: boolean;
  characteristics: CharacteristicName[];
  medicalCost: number;        // Total medical cost for crisis treatment
  message: string;
}

export function checkAgingCrisis(
  characteristics: Record<CharacteristicName, { total: number; current: number }>,
  effects: { stat: CharacteristicName; modifier: number }[]
): AgingCrisisResult {
  const affectedStats: CharacteristicName[] = [];

  // Check which stats would be reduced to 0 or below
  const tempStats = { ...characteristics };
  for (const effect of effects) {
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
      medicalCost: 0,
      message: 'Aging effects applied.',
    };
  }

  // Crisis cost: 1D × Cr10,000 per affected characteristic
  const costRoll = Math.floor(Math.random() * 6) + 1;
  const medicalCost = costRoll * 10000 * affectedStats.length;

  return {
    isCrisis: true,
    characteristics: affectedStats,
    medicalCost,
    message: `AGING CRISIS: ${affectedStats.map(s => s.toUpperCase()).join(', ')} reduced to 0! Requires medical treatment costing Cr${medicalCost.toLocaleString()} (${costRoll} × Cr10,000 × ${affectedStats.length} stat${affectedStats.length > 1 ? 's' : ''}). Characteristic${affectedStats.length > 1 ? 's' : ''} set to 1. You automatically fail your next qualification roll.`,
  };
}

// ============================================================================
// AGING ROLL
// ============================================================================

export interface AgingRollResult {
  termNumber: number;
  threshold: number;
  roll: number;           // Natural 2D6 roll
  dm: number;             // Total DM (including anagathics)
  total: number;          // roll + dm
  effectValue: number;    // total - threshold
  passed: boolean;        // effectValue >= 1 (no aging)
  effectLevel: AgingEffectLevel | null;  // The aging effects to apply (null if passed)
  message: string;
}

export function rollAging(
  termNumber: number,
  dm: number = 0
): AgingRollResult | null {
  const threshold = getAgingThreshold(termNumber);

  if (!threshold || threshold.threshold < 0) {
    return null;
  }

  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  const roll = die1 + die2;
  const total = roll + dm;
  const effectValue = total - threshold.threshold;
  const passed = effectValue >= 1;

  const effectLevel = passed ? null : getAgingEffectLevel(effectValue);

  return {
    termNumber,
    threshold: threshold.threshold,
    roll,
    dm,
    total,
    effectValue,
    passed,
    effectLevel,
    message: passed
      ? `Aging roll: ${roll}${dm !== 0 ? ` + ${dm} DM` : ''} = ${total} vs ${threshold.threshold}+ (Effect +${effectValue}). No aging effects.`
      : `Aging roll: ${roll}${dm !== 0 ? ` + ${dm} DM` : ''} = ${total} vs ${threshold.threshold}+ (Effect ${effectValue}). ${effectLevel?.description || 'Aging effects apply.'}`,
  };
}

// Apply aging effects to characteristics (used after player makes choices)
export function applyAgingEffects(
  characteristics: Record<CharacteristicName, { total: number; current: number }>,
  effects: { stat: CharacteristicName; modifier: number }[],
  crisisStats?: CharacteristicName[]
): Record<CharacteristicName, { total: number; current: number }> {
  const result = { ...characteristics };

  for (const effect of effects) {
    const current = result[effect.stat];
    const newTotal = current.total + effect.modifier;
    const newCurrent = current.current + effect.modifier;

    // If in crisis (would go to 0 or below), set to 1 instead
    if (newTotal <= 0 && crisisStats?.includes(effect.stat)) {
      result[effect.stat] = { total: 1, current: Math.max(1, newCurrent) };
    } else {
      result[effect.stat] = {
        total: Math.max(0, newTotal),
        current: Math.max(0, newCurrent),
      };
    }
  }

  return result;
}

// ============================================================================
// ANAGATHICS
// ============================================================================
// Anagathic drugs slow aging but are expensive and risky.
// - Requirement: SOC 10+ to attempt obtaining
// - Roll 2D6 + SOC DM: 8+ to obtain
// - Natural 2 on the roll: arrested, must take Prisoner career
// - DM to aging rolls: +1 per term using anagathics
// - Cost: 1D × Cr25,000 per term (from cash benefits)
// - Must make TWO survival checks per term while using
// - Stopping: immediate aging roll with no anagathics DM
// - Cannot use in Prisoner career (noAnagathics flag)

export interface AnagathicsObtainResult {
  roll: number;           // Natural 2D6 roll
  dm: number;             // SOC DM
  total: number;
  success: boolean;       // 8+ = obtained
  arrested: boolean;      // Natural 2 = arrested
  message: string;
}

export function rollAnagathicsObtain(socDM: number): AnagathicsObtainResult {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  const roll = die1 + die2;
  const total = roll + socDM;
  const arrested = roll === 2;  // Natural 2 before DM
  const success = !arrested && total >= 8;

  let message: string;
  if (arrested) {
    message = `Anagathics roll: natural 2! You were caught attempting to obtain illegal drugs. You must take the Prisoner career next term.`;
  } else if (success) {
    message = `Anagathics roll: ${roll} + ${socDM} DM = ${total} vs 8+. Success! You have obtained anagathics.`;
  } else {
    message = `Anagathics roll: ${roll} + ${socDM} DM = ${total} vs 8+. Failed. Unable to obtain anagathics this term.`;
  }

  return { roll, dm: socDM, total, success, arrested, message };
}

export function rollAnagathicsCost(): { roll: number; cost: number } {
  const roll = Math.floor(Math.random() * 6) + 1;
  const cost = roll * 25000;
  return { roll, cost };
}

// ============================================================================
// MEDICAL BILLS - Career Coverage
// ============================================================================
// When injured, the organization you work for may cover medical costs.
// Coverage depends on career type and a 2D+rank roll.
//
// Tier 1 (Military): Army, Navy, Marines
//   4+: 75%, 8+: 100%, 12+: 100%
// Tier 2 (Professional): Agent, Noble, Scholar, Entertainer, Merchant, Citizen
//   4+: 50%, 8+: 75%, 12+: 100%
// Tier 3 (Independent): Scout, Rogue, Drifter, Prisoner, Psion
//   4+: 0%, 8+: 50%, 12+: 75%
//
// Characteristic restoration: Cr5,000 per point lost
// Aging crisis: 1D × Cr10,000 per stat in crisis

export type CoverageTier = 'military' | 'professional' | 'independent';

const CAREER_TIERS: Record<string, CoverageTier> = {
  'Army': 'military',
  'Navy': 'military',
  'Marines': 'military',
  'Agent': 'professional',
  'Noble': 'professional',
  'Scholar': 'professional',
  'Entertainer': 'professional',
  'Merchant': 'professional',
  'Citizen': 'professional',
  'Scout': 'independent',
  'Rogue': 'independent',
  'Drifter': 'independent',
  'Prisoner': 'independent',
  'Psion': 'independent',
};

const COVERAGE_TABLE: Record<CoverageTier, { threshold4: number; threshold8: number; threshold12: number }> = {
  military:      { threshold4: 75, threshold8: 100, threshold12: 100 },
  professional:  { threshold4: 50, threshold8: 75,  threshold12: 100 },
  independent:   { threshold4: 0,  threshold8: 50,  threshold12: 75 },
};

export function getCareerTier(careerName: string): CoverageTier {
  return CAREER_TIERS[careerName] || 'independent';
}

export interface MedicalCoverageResult {
  careerName: string;
  tier: CoverageTier;
  rank: number;
  roll: number;           // Natural 2D6
  total: number;          // roll + rank
  coveragePercent: number;
  totalCost: number;
  coveredAmount: number;
  outOfPocket: number;
  message: string;
}

export function calculateMedicalCoverage(
  careerName: string,
  rank: number,
  totalCost: number
): MedicalCoverageResult {
  const tier = getCareerTier(careerName);
  const coverage = COVERAGE_TABLE[tier];

  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  const roll = die1 + die2;
  const total = roll + rank;

  let coveragePercent = 0;
  if (total >= 12) {
    coveragePercent = coverage.threshold12;
  } else if (total >= 8) {
    coveragePercent = coverage.threshold8;
  } else if (total >= 4) {
    coveragePercent = coverage.threshold4;
  }

  const coveredAmount = Math.floor(totalCost * coveragePercent / 100);
  const outOfPocket = totalCost - coveredAmount;

  return {
    careerName,
    tier,
    rank,
    roll,
    total,
    coveragePercent,
    totalCost,
    coveredAmount,
    outOfPocket,
    message: `Medical coverage (${careerName}, ${tier}): 2D+Rank = ${roll}+${rank} = ${total}. Coverage: ${coveragePercent}%. Total: Cr${totalCost.toLocaleString()}, Covered: Cr${coveredAmount.toLocaleString()}, Out of pocket: Cr${outOfPocket.toLocaleString()}.`,
  };
}

// Calculate medical cost for characteristic damage
export function calculateInjuryCost(
  pointsLost: number,
  costPerPoint: number = 5000
): number {
  return pointsLost * costPerPoint;
}
