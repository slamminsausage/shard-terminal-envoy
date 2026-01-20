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
