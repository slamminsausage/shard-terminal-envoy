// ============================================================================
// CAREER: CITIZEN
// This career is for individuals serving in a corporation, bureaucracy or
// industry, or those who are making a new life on an untamed planet.
// ============================================================================

import type { CareerDefinition, GameEvent, BenefitTableRow } from './types';

// Citizen Benefits Table (1D, results 1-7)
const CITIZEN_BENEFITS: BenefitTableRow[] = [
  // Roll 1
  { cash: 2000, benefit: { options: [{ type: 'ship_shares', shares: 1 }] } },
  // Roll 2
  { cash: 5000, benefit: { options: [{ type: 'ally' }] } },
  // Roll 3
  { cash: 10000, benefit: { options: [{ type: 'characteristic', stat: 'intellect', amount: 1 }] } },
  // Roll 4
  { cash: 10000, benefit: { options: [{ type: 'item', itemType: 'gun' }] } },
  // Roll 5
  { cash: 10000, benefit: { options: [{ type: 'characteristic', stat: 'education', amount: 1 }] } },
  // Roll 6
  { cash: 50000, benefit: { options: [{ type: 'ship_shares', shares: 2 }] } },
  // Roll 7
  { cash: 100000, benefit: { options: [{ type: 'tas_membership' }] } },
];

// ============================================================================
// CITIZEN MISHAPS (1D6)
// ============================================================================

const CITIZEN_MISHAPS: GameEvent[] = [
  {
    id: 'citizen-mishap-1',
    description: 'Severely injured (same as result of 2 on the Injury table). Alternatively, roll twice on the Injury table and take the lower result.',
    resolution: {
      type: 'automatic',
      effects: {
        rollOnTable: 'injury',
        injurySeverity: 'severe',
        message: 'You are severely injured. Roll on the Injury table with severe penalties.',
      },
    },
  },
  {
    id: 'citizen-mishap-2',
    description: 'You are harassed and your life ruined by a criminal gang. Gain the gang as an Enemy.',
    resolution: {
      type: 'automatic',
      effects: {
        enemies: 1,
        message: 'A criminal gang harasses you and ruins your life. You gain them as an Enemy.',
      },
    },
  },
  {
    id: 'citizen-mishap-3',
    description: 'Hard times caused by a lack of interstellar trade costs you your job. Lose one SOC.',
    resolution: {
      type: 'automatic',
      effects: {
        characteristics: [{ stat: 'social', modifier: -1 }],
        message: 'Hard economic times cost you your job and social standing.',
      },
    },
  },
  {
    id: 'citizen-mishap-4',
    description: 'Your business is investigated by the planetary authorities (or your colony suffers interference from interests offworld). Co-operate and the business or colony is shut down but you gain DM+2 to the qualification roll for your next career as a reward for your aid. Refuse and gain an Ally.',
    resolution: {
      type: 'choice',
      displayText: 'Planetary authorities are investigating your business. What do you do?',
      options: [
        {
          id: 'cooperate',
          label: 'Cooperate with authorities',
          description: 'Business is shut down but you gain DM+2 to next qualification',
          effects: {
            qualificationDM: 2,
            message: 'You cooperate with the investigation. Your business is shut down but your aid is rewarded.',
          },
        },
        {
          id: 'refuse',
          label: 'Refuse to cooperate',
          description: 'Gain an Ally who helps you resist',
          effects: {
            allies: 1,
            message: 'You refuse to cooperate and gain an Ally who helped you resist the investigation.',
          },
        },
      ],
    },
  },
  {
    id: 'citizen-mishap-5',
    description: 'A revolution, attack or other unusual event throws your life into chaos, forcing you to leave the planet. Roll Streetwise 8+. If you succeed, increase any skill you have by one level.',
    resolution: {
      type: 'skill_roll',
      skillRequirement: {
        minLevel: 0,
        specificSkills: ['Streetwise'],
      },
      target: 8,
      displayText: 'Roll Streetwise 8+ to navigate the chaos successfully.',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            skills: { anySkill: true, requireExisting: true, level: 1 },
            message: 'You successfully navigate the chaos and learn from the experience.',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            message: 'The chaos forces you to flee the planet with nothing.',
          },
        },
      ],
    },
  },
  {
    id: 'citizen-mishap-6',
    description: 'Injured. Roll on the Injury table.',
    resolution: {
      type: 'automatic',
      effects: {
        rollOnTable: 'injury',
        message: 'You are injured. Roll on the Injury table.',
      },
    },
  },
];

// ============================================================================
// CITIZEN EVENTS (2D6)
// ============================================================================

const CITIZEN_EVENTS: GameEvent[] = [
  // Event 2: Disaster
  {
    id: 'citizen-event-2',
    description: 'Disaster! Roll on the Mishap table but you are not ejected from this career.',
    resolution: {
      type: 'table_redirect',
      table: 'mishap',
      displayText: 'Roll on the Mishap table (not ejected from career).',
    },
  },

  // Event 3: Political upheaval
  {
    id: 'citizen-event-3',
    description: 'Political upheaval strikes your homeworld and you are caught up in the revolution. Gain either Advocate 1, Persuade 1, Explosives 1 or Streetwise 1. Roll whichever skill you chose 8+. If you succeed you come out on the winning side and gain DM+2 to your next advancement roll. Fail and you suffer DM-2 to your next Survival roll.',
    resolution: {
      type: 'choice',
      displayText: 'Political upheaval! Choose a skill to gain, then roll 2D for 8+ to see which side wins.',
      options: [
        {
          id: 'advocate',
          label: 'Advocate 1',
          description: 'Legal and bureaucratic skills. Roll 2D for 8+.',
          effects: {
            skills: { choices: ['Advocate'], level: 1 },
          },
          subRoll: {
            dice: 2,
            outcomes: [
              { min: 2, max: 7, label: 'Losing side!', effects: { survivalDM: -2, message: 'You gain Advocate 1, but you\'re on the losing side. DM-2 to your next Survival roll.' } },
              { min: 8, max: 12, label: 'Winning side!', effects: { advancementDM: 2, message: 'You gain Advocate 1 and you\'re on the winning side! DM+2 to your next advancement roll.' } },
            ],
          },
        },
        {
          id: 'persuade',
          label: 'Persuade 1',
          description: 'Convincing and negotiation. Roll 2D for 8+.',
          effects: {
            skills: { choices: ['Persuade'], level: 1 },
          },
          subRoll: {
            dice: 2,
            outcomes: [
              { min: 2, max: 7, label: 'Losing side!', effects: { survivalDM: -2, message: 'You gain Persuade 1, but you\'re on the losing side. DM-2 to your next Survival roll.' } },
              { min: 8, max: 12, label: 'Winning side!', effects: { advancementDM: 2, message: 'You gain Persuade 1 and you\'re on the winning side! DM+2 to your next advancement roll.' } },
            ],
          },
        },
        {
          id: 'explosives',
          label: 'Explosives 1',
          description: 'Demolitions expertise. Roll 2D for 8+.',
          effects: {
            skills: { choices: ['Explosives'], level: 1 },
          },
          subRoll: {
            dice: 2,
            outcomes: [
              { min: 2, max: 7, label: 'Losing side!', effects: { survivalDM: -2, message: 'You gain Explosives 1, but you\'re on the losing side. DM-2 to your next Survival roll.' } },
              { min: 8, max: 12, label: 'Winning side!', effects: { advancementDM: 2, message: 'You gain Explosives 1 and you\'re on the winning side! DM+2 to your next advancement roll.' } },
            ],
          },
        },
        {
          id: 'streetwise',
          label: 'Streetwise 1',
          description: 'Urban survival. Roll 2D for 8+.',
          effects: {
            skills: { choices: ['Streetwise'], level: 1 },
          },
          subRoll: {
            dice: 2,
            outcomes: [
              { min: 2, max: 7, label: 'Losing side!', effects: { survivalDM: -2, message: 'You gain Streetwise 1, but you\'re on the losing side. DM-2 to your next Survival roll.' } },
              { min: 8, max: 12, label: 'Winning side!', effects: { advancementDM: 2, message: 'You gain Streetwise 1 and you\'re on the winning side! DM+2 to your next advancement roll.' } },
            ],
          },
        },
      ],
    },
  },

  // Event 4: Heavy vehicles
  {
    id: 'citizen-event-4',
    description: 'You spend time maintaining and using heavy vehicles, either as part of your job or as a hobby. Increase Mechanic, Drive, Electronics, Flyer or Engineer by one level.',
    resolution: {
      type: 'choice',
      displayText: 'Choose a skill to increase by one level:',
      options: [
        {
          id: 'mechanic',
          label: 'Mechanic',
          effects: { skills: { choices: ['Mechanic'], level: 1 }, message: 'You gain expertise in vehicle mechanics.' },
        },
        {
          id: 'drive',
          label: 'Drive',
          effects: { skills: { choices: ['Drive'], level: 1 }, message: 'You become a skilled vehicle driver.' },
        },
        {
          id: 'electronics',
          label: 'Electronics',
          effects: { skills: { choices: ['Electronics'], level: 1 }, message: 'You learn vehicle electronics systems.' },
        },
        {
          id: 'flyer',
          label: 'Flyer',
          effects: { skills: { choices: ['Flyer'], level: 1 }, message: 'You learn to pilot flying vehicles.' },
        },
      ],
    },
  },

  // Event 5: Business expands
  {
    id: 'citizen-event-5',
    description: 'Your business expands, your corporation grows or the colony thrives. Gain DM+1 to any one Benefit roll.',
    resolution: {
      type: 'automatic',
      effects: {
        benefitDM: 1,
        message: 'Your business expands significantly. Gain DM+1 to any one Benefit roll.',
      },
    },
  },

  // Event 6: Advanced training
  {
    id: 'citizen-event-6',
    description: 'You are given advanced training in a specialist field. Roll EDU 10+ to gain any one skill of your choice at level 1.',
    resolution: {
      type: 'characteristic_roll',
      stat: 'education',
      target: 10,
      displayText: 'Roll EDU 10+ to gain advanced training.',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            skills: { anySkill: true, level: 1 },
            message: 'Your advanced training is successful. Choose any skill at level 1.',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            message: 'The advanced training proves too difficult.',
          },
        },
      ],
    },
  },

  // Event 7: Life Event
  {
    id: 'citizen-event-7',
    description: 'Life Event. Roll on the Life Events table.',
    resolution: {
      type: 'table_redirect',
      table: 'life_events',
      displayText: 'Roll on the Life Events table.',
    },
  },

  // Event 8: Learn a secret
  {
    id: 'citizen-event-8',
    description: 'You learn something you should not have – a corporate secret, a political scandal – which you can profit from illegally. If you choose to do so, then you gain DM+1 to a Benefit roll from this career and gain Streetwise 1, Deception 1 or a criminal Contact. If you refuse, you gain nothing.',
    resolution: {
      type: 'choice',
      displayText: 'You learn a dangerous secret. Do you exploit it?',
      options: [
        {
          id: 'exploit-streetwise',
          label: 'Exploit (gain Streetwise 1)',
          description: 'Use the secret for profit',
          effects: {
            benefitDM: 1,
            skills: { choices: ['Streetwise'], level: 1 },
            message: 'You exploit the secret. Gain DM+1 to a Benefit roll and Streetwise 1.',
          },
        },
        {
          id: 'exploit-deception',
          label: 'Exploit (gain Deception 1)',
          description: 'Use the secret for profit',
          effects: {
            benefitDM: 1,
            skills: { choices: ['Deception'], level: 1 },
            message: 'You exploit the secret. Gain DM+1 to a Benefit roll and Deception 1.',
          },
        },
        {
          id: 'exploit-contact',
          label: 'Exploit (gain criminal Contact)',
          description: 'Use the secret for profit',
          effects: {
            benefitDM: 1,
            contacts: 1,
            message: 'You exploit the secret. Gain DM+1 to a Benefit roll and a criminal Contact.',
          },
        },
        {
          id: 'refuse',
          label: 'Keep quiet',
          description: 'Refuse to use the information',
          effects: {
            message: 'You keep the secret to yourself and gain nothing.',
          },
        },
      ],
    },
  },

  // Event 9: Rewarded
  {
    id: 'citizen-event-9',
    description: 'You are rewarded for your diligence or cunning. Gain DM+2 to your next advancement roll.',
    resolution: {
      type: 'automatic',
      effects: {
        advancementDM: 2,
        message: 'Your diligence is rewarded. Gain DM+2 to your next advancement roll.',
      },
    },
  },

  // Event 10: Technical experience
  {
    id: 'citizen-event-10',
    description: 'You gain experience in a technical field as a computer operator or surveyor. Increase Electronics or Engineer by one level.',
    resolution: {
      type: 'choice',
      displayText: 'Choose a technical skill to increase:',
      options: [
        {
          id: 'electronics',
          label: 'Electronics',
          effects: { skills: { choices: ['Electronics'], level: 1 }, message: 'You gain Electronics expertise.' },
        },
        {
          id: 'engineer',
          label: 'Engineer',
          effects: { skills: { choices: ['Engineer'], level: 1 }, message: 'You gain Engineering expertise.' },
        },
      ],
    },
  },

  // Event 11: Befriend superior
  {
    id: 'citizen-event-11',
    description: 'You befriend a superior in the corporation or the colony. Gain an Ally. Either gain Diplomat 1 or DM+4 to your next advancement roll thanks to their aid.',
    resolution: {
      type: 'choice',
      displayText: 'You befriend a superior. Gain an Ally and choose your benefit:',
      options: [
        {
          id: 'diplomat',
          label: 'Gain Diplomat 1',
          description: 'Learn diplomatic skills from your mentor',
          effects: {
            allies: 1,
            skills: { choices: ['Diplomat'], level: 1 },
            message: 'You gain an Ally and learn Diplomat 1 from your mentor.',
          },
        },
        {
          id: 'advancement',
          label: 'DM+4 to advancement',
          description: 'Your mentor helps your career',
          effects: {
            allies: 1,
            advancementDM: 4,
            message: 'You gain an Ally and DM+4 to your next advancement roll.',
          },
        },
      ],
    },
  },

  // Event 12: Rise to power
  {
    id: 'citizen-event-12',
    description: 'You rise to a position of power in your colony or corporation. You are automatically promoted.',
    resolution: {
      type: 'automatic',
      effects: {
        autoPromotion: true,
        message: 'You rise to a position of power. You are automatically promoted this term.',
      },
    },
  },
];

// ============================================================================
// CAREER DEFINITION
// ============================================================================

export const CAREER_CITIZEN: CareerDefinition = {
  name: 'Citizen',
  description: 'Individuals serving in a corporation, bureaucracy or industry, or those who are making a new life on an untamed planet.',
  qualification: 'EDU 5+',
  qualificationTarget: 5,
  qualificationStat: 'education',
  usesAssignmentSkillsForBasicTraining: false,
  assignments: [
    {
      name: 'Corporate',
      description: 'You work in a corporation, handling business matters.',
      survivalStat: 'social',
      survivalTarget: 6,
      advancementStat: 'intellect',
      advancementTarget: 6,
    },
    {
      name: 'Worker',
      description: 'You are a blue-collar worker in industry or manufacturing.',
      survivalStat: 'endurance',
      survivalTarget: 4,
      advancementStat: 'education',
      advancementTarget: 8,
    },
    {
      name: 'Colonist',
      description: 'You are making a new life on an untamed planet.',
      survivalStat: 'intellect',
      survivalTarget: 7,
      advancementStat: 'endurance',
      advancementTarget: 5,
    },
  ],
  skillTables: {
    personalDevelopment: ['Education +1', 'Intellect +1', 'Carouse', 'Gambler', 'Drive', 'Jack-of-all-Trades'],
    serviceSkills: ['Drive', 'Flyer', 'Streetwise', 'Melee', 'Steward', 'Profession'],
    advancedEducation: ['Art', 'Advocate', 'Diplomat', 'Language', 'Electronics (computers)', 'Medic'],
    advancedEducationMin: 10,
    specialist: {
      'Corporate': ['Advocate', 'Admin', 'Broker', 'Electronics (computers)', 'Diplomat', 'Leadership'],
      'Worker': ['Drive', 'Mechanic', 'Electronics', 'Engineer', 'Profession', 'Science'],
      'Colonist': ['Animals', 'Athletics', 'Jack-of-all-Trades', 'Drive', 'Survival', 'Recon'],
    },
  },
  ranks: {
    enlisted: [
      { title: '' },
      { title: '' },
      { title: 'Manager', skillBonus: 'Admin' },
      { title: '' },
      { title: 'Senior Manager', skillBonus: 'Advocate' },
      { title: '' },
      { title: 'Director', skillBonus: 'Social +1' },
    ],
    byAssignment: {
      'Corporate': [
        { title: '' },
        { title: '' },
        { title: 'Manager', skillBonus: 'Admin' },
        { title: '' },
        { title: 'Senior Manager', skillBonus: 'Advocate' },
        { title: '' },
        { title: 'Director', skillBonus: 'Social +1' },
      ],
      'Worker': [
        { title: '' },
        { title: '' },
        { title: 'Technician', skillBonus: 'Profession' },
        { title: '' },
        { title: 'Craftsman', skillBonus: 'Mechanic' },
        { title: '' },
        { title: 'Master Technician', skillBonus: 'Engineer' },
      ],
      'Colonist': [
        { title: '' },
        { title: '' },
        { title: 'Settler', skillBonus: 'Survival' },
        { title: '' },
        { title: 'Explorer', skillBonus: 'Navigation' },
        { title: '' },
        { title: '', skillBonus: 'Gun Combat' },
      ],
    },
  },
  mishapTable: CITIZEN_MISHAPS,
  eventTable: CITIZEN_EVENTS,
  benefitsTable: CITIZEN_BENEFITS,
};
