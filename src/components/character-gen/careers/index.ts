// ============================================================================
// TRAVELLER 2E CAREERS - MAIN EXPORT FILE
// ============================================================================

// Export types
export * from './types';

// Export constants
export * from './constants';

// Export skills reference
export * from './skills';

// Export pre-career events (new GameEvent format)
export { PRE_CAREER_EVENTS, getPreCareerEvent } from './pre-careers/preCareerEvents';

// Import all careers
import { CAREER_UNIVERSITY } from './pre-careers/university';
import { CAREER_MILITARY_ACADEMY } from './pre-careers/militaryAcademy';
import { CAREER_AGENT } from './agent';
import { CAREER_ARMY } from './army';
import { CAREER_CITIZEN } from './citizen';
import { CAREER_DRIFTER } from './drifter';
import { CAREER_ENTERTAINER } from './entertainer';
import { CAREER_MARINES } from './marines';
import { CAREER_MERCHANT } from './merchant';
import { CAREER_NAVY } from './navy';
import { CAREER_NOBLE } from './noble';
import { CAREER_ROGUE } from './rogue';
import { CAREER_SCHOLAR } from './scholar';
import { CAREER_SCOUT } from './scout';
import { CAREER_PRISONER, PRISON_EVENTS_SUBTABLE, getPrisonSubEvent, rollInitialParoleThreshold } from './prisoner';

// Export individual careers
export { CAREER_UNIVERSITY } from './pre-careers/university';
export { CAREER_MILITARY_ACADEMY } from './pre-careers/militaryAcademy';
export { CAREER_AGENT } from './agent';
export { CAREER_ARMY } from './army';
export { CAREER_CITIZEN } from './citizen';
export { CAREER_DRIFTER } from './drifter';
export { CAREER_ENTERTAINER } from './entertainer';
export { CAREER_MARINES } from './marines';
export { CAREER_MERCHANT } from './merchant';
export { CAREER_NAVY } from './navy';
export { CAREER_NOBLE } from './noble';
export { CAREER_ROGUE } from './rogue';
export { CAREER_SCHOLAR } from './scholar';
export { CAREER_SCOUT } from './scout';
// Prisoner is a special career - cannot be selected voluntarily
export { CAREER_PRISONER, PRISON_EVENTS_SUBTABLE, getPrisonSubEvent, rollInitialParoleThreshold } from './prisoner';

// Export all careers array (does NOT include Prisoner - it can only be entered via force)
export const ALL_CAREERS = [
  CAREER_UNIVERSITY,
  CAREER_MILITARY_ACADEMY,
  CAREER_AGENT,
  CAREER_ARMY,
  CAREER_CITIZEN,
  CAREER_DRIFTER,
  CAREER_ENTERTAINER,
  CAREER_MARINES,
  CAREER_MERCHANT,
  CAREER_NAVY,
  CAREER_NOBLE,
  CAREER_ROGUE,
  CAREER_SCHOLAR,
  CAREER_SCOUT,
];
