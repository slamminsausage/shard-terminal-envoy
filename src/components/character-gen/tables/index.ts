// ============================================================================
// TRAVELLER 2E TABLES - MAIN EXPORT FILE
// ============================================================================

// Draft table
export { DRAFT_TABLE, rollDraft, type DraftResult } from './draft';

// Life Events table (2D6)
export { LIFE_EVENTS, getLifeEvent } from './lifeEvents';

// Unusual Events table (1D6) - sub-table of Life Events 12
export { UNUSUAL_EVENTS, getUnusualEvent } from './unusualEvents';

// Injury table (1D6)
export { INJURY_TABLE, getInjury, PHYSICAL_CHARACTERISTICS } from './injuryTable';

// Aging table (2D6) - used at end of 4th+ terms
export {
  AGING_THRESHOLDS,
  AGING_CHARACTERISTICS,
  MENTAL_CHARACTERISTICS,
  AGING_EFFECTS_TABLE,
  getAgingThreshold,
  getAgingEffectLevel,
  checkAgingCrisis,
  rollAging,
  applyAgingEffects,
  // Anagathics
  rollAnagathicsObtain,
  rollAnagathicsCost,
  // Medical bills
  getCareerTier,
  calculateMedicalCoverage,
  calculateInjuryCost,
  // Types
  type AgingThreshold,
  type AgingChoice,
  type AgingEffectLevel,
  type AgingCrisisResult,
  type AgingRollResult,
  type AnagathicsObtainResult,
  type CoverageTier,
  type MedicalCoverageResult,
} from './agingTable';
