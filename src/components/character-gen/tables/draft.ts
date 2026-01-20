// ============================================================================
// DRAFT TABLE (1D6)
// ============================================================================
// A Traveller may only enter the draft once in their lifetime (unless otherwise stated).

export interface DraftResult {
  careerName: string;
  assignmentName: string | null; // null means "any assignment"
}

export const DRAFT_TABLE: DraftResult[] = [
  { careerName: 'Navy', assignmentName: null }, // 1 - Any assignment
  { careerName: 'Army', assignmentName: null }, // 2 - Any assignment
  { careerName: 'Marines', assignmentName: null }, // 3 - Any assignment
  { careerName: 'Merchant', assignmentName: 'Merchant Marine' }, // 4 - Specific assignment
  { careerName: 'Scout', assignmentName: null }, // 5 - Any assignment
  { careerName: 'Agent', assignmentName: 'Law Enforcement' }, // 6 - Specific assignment
];

/**
 * Roll on the draft table
 * @returns Draft result with career name and assignment (if specific)
 */
export function rollDraft(): DraftResult {
  const roll = Math.floor(Math.random() * 6) + 1; // 1-6
  return DRAFT_TABLE[roll - 1];
}
