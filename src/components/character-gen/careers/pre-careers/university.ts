// ============================================================================
// PRE-CAREER: UNIVERSITY
// ============================================================================

import type { CareerDefinition } from '../types';
import { PRE_CAREER_EVENTS } from './preCareerEvents';

export const CAREER_UNIVERSITY: CareerDefinition = {
  name: 'University',
  description: 'Higher education to gain advanced knowledge and skills. Choose one Level 0 and one Level 1 skill from the list when you enter. Increase EDU by +1 immediately.',
  qualification: 'EDU 6+',
  qualificationTarget: 6,
  qualificationStat: 'education',
  isPreCareer: true,
  preCareerType: 'university',
  maxTerms: 3,
  assignments: [
    {
      name: 'Student',
      description: 'You are pursuing higher education.',
      survivalStat: 'intellect',
      survivalTarget: 6, // Graduation roll
      advancementStat: 'intellect',
      advancementTarget: 10, // Honours
    },
  ],
  skillTables: {
    personalDevelopment: [],
    serviceSkills: [], // No service skills - University uses manual selection
    advancedEducation: ['Admin', 'Advocate', 'Animals', 'Art', 'Astrogation', 'Electronics', 'Engineer', 'Language', 'Medic', 'Navigation', 'Profession', 'Science'],
    specialist: {
      'Student': [],
    },
  },
  ranks: {
    enlisted: [
      { title: 'Student' },
      { title: 'Graduate' },
      { title: 'Graduate with Honours' },
    ],
  },
  mishapTable: [
    "Failed to graduate. Gain no benefits from University.",
  ],
  eventTable: PRE_CAREER_EVENTS,
};
