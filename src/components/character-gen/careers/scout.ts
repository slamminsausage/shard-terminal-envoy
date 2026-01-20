// ============================================================================
// CAREER: SCOUT
// ============================================================================

import type { CareerDefinition } from './types';

export const CAREER_SCOUT: CareerDefinition = {
  name: 'Scout',
  description: 'Explorers and couriers, charting new worlds and delivering vital messages.',
  qualification: 'INT 5+',
  qualificationTarget: 5,
  qualificationStat: 'intellect',
  assignments: [
    {
      name: 'Courier',
      description: 'You deliver mail and data across vast distances.',
      survivalStat: 'endurance',
      survivalTarget: 5,
      advancementStat: 'education',
      advancementTarget: 9,
    },
    {
      name: 'Surveyor',
      description: 'You chart new systems and worlds.',
      survivalStat: 'endurance',
      survivalTarget: 6,
      advancementStat: 'intellect',
      advancementTarget: 8,
    },
    {
      name: 'Explorer',
      description: 'You venture into the unknown.',
      survivalStat: 'endurance',
      survivalTarget: 7,
      advancementStat: 'education',
      advancementTarget: 7,
    },
  ],
  skillTables: {
    personalDevelopment: ['Strength +1', 'Dexterity +1', 'Endurance +1', 'Intellect +1', 'Education +1', 'Jack-of-all-Trades'],
    serviceSkills: ['Pilot', 'Survival', 'Mechanic', 'Astrogation', 'Electronics', 'Gun Combat'],
    advancedEducation: ['Medic', 'Navigation', 'Engineer', 'Electronics', 'Astrogation', 'Science'],
    specialist: {
      'Courier': ['Electronics', 'Flyer', 'Pilot', 'Engineer', 'Astrogation', 'Navigation'],
      'Surveyor': ['Electronics', 'Sensors', 'Persuade', 'Pilot', 'Navigation', 'Science'],
      'Explorer': ['Electronics', 'Pilot', 'Sensors', 'Survival', 'Recon', 'Science'],
    },
  },
  ranks: {
    enlisted: [
      { title: 'Scout' },
      { title: 'Scout' },
      { title: 'Senior Scout', skillBonus: 'Vacc Suit' },
      { title: 'Senior Scout' },
      { title: 'Principal Scout' },
      { title: 'Principal Scout' },
      { title: 'Senior Principal Scout' },
    ],
  },
  mishapTable: [
    "Severely injured in action. Roll twice on the Injury table and take the lower result.",
    "Your ship is damaged and you have to hitch-hike your way back across the stars. Gain one Contact and one level in Streetwise, Persuade, or Deception.",
    "You inadvertently cause a conflict between the Imperium and a Minor Race. Gain a Rival and lose this Benefit roll.",
    "You have a bad reaction to jump space. Leave this career.",
    "Your ship is destroyed through your actions. Gain an Enemy. If you were on a mission of your own, you keep the Benefit roll for this term.",
    "Injured. Roll on the Injury table.",
  ],
  eventTable: [
    "Disaster! Roll on the Mishap table but you are not ejected from this career.",
    "You spend several years on the fringes of known space. Gain one of Survival 1, Navigation 1, Pilot 1, or Sensors 1.",
    "You survey an alien world. Gain one of Recon 1, Science 1, Electronics 1, or Survival 1.",
    "You spend a great deal of time on the edges of civilisation. Gain one Contact in an unusual location.",
    "You serve as a courier. Gain one of Pilot 1, Sensors 1, Electronics 1, or Astrogation 1.",
    "Life Event. Roll on the Life Events table.",
    "You are given advanced training in a specialist field. Roll EDU 8+ to increase any one skill you already have by one level.",
    "Your ship is involved in a first contact with a previously unknown minor race. Gain one of Language 1, Diplomat 1, or Recon 1 and one Contact.",
    "You spend a great deal of time in jump space. Gain one of Astrogation 1, Electronics 1, or Sensors 1.",
    "You discover something of value on a world you survey. Gain DM+2 to any one Benefit roll from this career.",
  ],
};
