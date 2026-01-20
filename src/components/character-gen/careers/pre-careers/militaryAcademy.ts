// ============================================================================
// PRE-CAREER: MILITARY ACADEMY
// ============================================================================

import type { CareerDefinition } from '../types';
import { PRE_CAREER_EVENTS } from './preCareerEvents';

export const CAREER_MILITARY_ACADEMY: CareerDefinition = {
  name: 'Military Academy',
  description: 'Train at a military academy. Must choose Army, Navy, or Marines and gain all their Service Skills at Level 0 immediately.',
  qualification: 'Special', // Army: END 7+, Marines: END 8+, Navy: INT 8+
  qualificationTarget: 7, // Army: END 7+, Marines: END 8+, Navy: INT 8+
  qualificationStat: 'endurance', // Default, varies by service
  isPreCareer: true,
  preCareerType: 'military_academy',
  maxTerms: 3,
  assignments: [
    {
      name: 'Army Cadet',
      description: 'Training for the Army.',
      survivalStat: 'intellect',
      survivalTarget: 7, // Graduation
      advancementStat: 'intellect',
      advancementTarget: 11, // Honours
    },
    {
      name: 'Marine Cadet',
      description: 'Training for the Marines.',
      survivalStat: 'intellect',
      survivalTarget: 7,
      advancementStat: 'intellect',
      advancementTarget: 11,
    },
    {
      name: 'Navy Cadet',
      description: 'Training for the Navy.',
      survivalStat: 'intellect',
      survivalTarget: 7,
      advancementStat: 'intellect',
      advancementTarget: 11,
    },
  ],
  skillTables: {
    personalDevelopment: [],
    serviceSkills: [], // Filled from chosen service
    specialist: {
      'Army Cadet': [],
      'Marine Cadet': [],
      'Navy Cadet': [],
    },
  },
  ranks: {
    enlisted: [
      { title: 'Cadet' },
      { title: 'Graduate' },
      { title: 'Graduate with Honours' },
    ],
  },
  mishapTable: [
    "Failed to graduate but gain automatic entry to your chosen service (if roll was not 2 or less). No commission roll in first term.",
  ],
  eventTable: PRE_CAREER_EVENTS,
};
