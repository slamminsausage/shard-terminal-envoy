// ============================================================================
// TRAVELLER 2E CAREERS - MAIN EXPORT FILE
// ============================================================================

// Export types
export * from './types';

// Export constants
export * from './constants';

// Import all careers
import { CAREER_UNIVERSITY } from './pre-careers/university';
import { CAREER_MILITARY_ACADEMY } from './pre-careers/militaryAcademy';
import { CAREER_AGENT } from './agent';
import { CAREER_ARMY } from './army';
import { CAREER_MARINES } from './marines';
import { CAREER_NAVY } from './navy';
import { CAREER_SCOUT } from './scout';

// Export individual careers
export { CAREER_UNIVERSITY } from './pre-careers/university';
export { CAREER_MILITARY_ACADEMY } from './pre-careers/militaryAcademy';
export { CAREER_AGENT } from './agent';
export { CAREER_ARMY } from './army';
export { CAREER_MARINES } from './marines';
export { CAREER_NAVY } from './navy';
export { CAREER_SCOUT } from './scout';

// Export all careers array
export const ALL_CAREERS = [
  CAREER_UNIVERSITY,
  CAREER_MILITARY_ACADEMY,
  CAREER_AGENT,
  CAREER_ARMY,
  CAREER_MARINES,
  CAREER_NAVY,
  CAREER_SCOUT,
];
