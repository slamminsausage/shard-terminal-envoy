// ============================================================================
// CAREER: AGENT
// ============================================================================

import type { CareerDefinition, GameEvent, BenefitTableRow } from './types';

// Agent Benefits Table (1D, results 1-7)
const AGENT_BENEFITS: BenefitTableRow[] = [
  // Roll 1
  { cash: 1000, benefit: { options: [{ type: 'item', itemType: 'scientific_equipment' }] } },
  // Roll 2
  { cash: 2000, benefit: { options: [{ type: 'characteristic', stat: 'intellect', amount: 1 }] } },
  // Roll 3
  { cash: 5000, benefit: { options: [{ type: 'ship_shares', shares: 1 }] } },
  // Roll 4
  { cash: 7500, benefit: { options: [{ type: 'item', itemType: 'weapon' }] } },
  // Roll 5
  { cash: 10000, benefit: { options: [{ type: 'item', itemType: 'cybernetic_implant' }] } },
  // Roll 6 - SOC +1 or Cybernetic Implant
  { cash: 25000, benefit: { options: [{ type: 'characteristic', stat: 'social', amount: 1 }, { type: 'item', itemType: 'cybernetic_implant' }], isChoice: true } },
  // Roll 7
  { cash: 50000, benefit: { options: [{ type: 'tas_membership' }] } },
];

// Agent Events (2D, results 2-12 map to indices 0-10)
const AGENT_EVENTS: GameEvent[] = [
  // Roll 2 - Disaster
  {
    id: 'agent-event-2',
    description: 'Disaster! Roll on the Mishap table but you are not ejected from this career.',
    resolution: {
      type: 'table_redirect',
      table: 'mishap',
      displayText: 'Roll on the Mishap table but you are not ejected from this career.',
    },
  },

  // Roll 3 - Dangerous investigation
  {
    id: 'agent-event-3',
    description: 'An investigation takes on a dangerous turn.',
    resolution: {
      type: 'skill_roll',
      skillRequirement: {
        minLevel: 0,
        specificSkills: ['investigate', 'streetwise'],
      },
      target: 8,
      displayText: 'Roll Investigate 8+ or Streetwise 8+. Success grants a skill; failure means rolling on the Mishap table.',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            skills: { choices: ['Deception', 'Jack-of-all-Trades', 'Persuade', 'Tactics'], level: 1 },
            message: 'You navigate the dangerous investigation successfully.',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            rollOnTable: 'injury',
            message: 'The investigation goes badly wrong. Roll on the Injury table.',
          },
        },
      ],
    },
  },

  // Roll 4 - Mission complete
  {
    id: 'agent-event-4',
    description: 'You complete a mission for your superiors and are suitably rewarded.',
    resolution: {
      type: 'automatic',
      effects: {
        benefitDM: 1,
        message: 'Your successful mission is rewarded. Gain DM+1 to any one Benefit roll from this career.',
      },
    },
  },

  // Roll 5 - Network of contacts
  {
    id: 'agent-event-5',
    description: 'You establish a network of contacts.',
    resolution: {
      type: 'automatic',
      effects: {
        contacts: 'D3',
        message: 'Your work helps you build a network of useful contacts.',
      },
    },
  },

  // Roll 6 - Advanced training
  {
    id: 'agent-event-6',
    description: 'You are given advanced training in a specialist field.',
    resolution: {
      type: 'characteristic_roll',
      stat: 'education',
      target: 8,
      displayText: 'Roll EDU 8+ to increase any skill you already have by one level.',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            skills: { anySkill: true, level: 1, requireExisting: true },
            message: 'Training complete! Increase any skill you already have by one level.',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            message: 'The training proves too difficult for you to master.',
          },
        },
      ],
    },
  },

  // Roll 7 - Life Event
  {
    id: 'agent-event-7',
    description: 'Life Event. Roll on the Life Events table.',
    resolution: {
      type: 'table_redirect',
      table: 'life_events',
      displayText: 'Something significant happens in your personal life.',
    },
  },

  // Roll 8 - Undercover operation
  {
    id: 'agent-event-8',
    description: 'You go undercover to investigate an enemy.',
    resolution: {
      type: 'characteristic_roll',
      stat: 'intellect',
      target: 8,
      displayText: 'Roll Deception 8+ (using INT as modifier). Success means you infiltrate successfully; failure is dangerous.',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            skills: { choices: ['Streetwise', 'Deception', 'Carouse', 'Gambler'], level: 1 },
            message: 'Your undercover work is successful! You learn the ways of the criminal underworld.',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            rollOnTable: 'injury',
            message: 'Your cover is blown! Roll on the Injury table.',
          },
        },
      ],
    },
  },

  // Roll 9 - Above and beyond
  {
    id: 'agent-event-9',
    description: 'You go above and beyond the call of duty.',
    resolution: {
      type: 'automatic',
      effects: {
        advancementDM: 2,
        message: 'Your dedication is noticed. Gain DM+2 to your next advancement roll.',
      },
    },
  },

  // Roll 10 - Vehicle training
  {
    id: 'agent-event-10',
    description: 'You are given specialist training in vehicles.',
    resolution: {
      type: 'choice',
      displayText: 'Choose a vehicle skill to gain at level 1:',
      options: [
        {
          id: 'drive',
          label: 'Drive 1',
          description: 'Ground vehicles',
          effects: {
            skills: { choices: ['Drive'], level: 1 },
            message: 'You are trained in advanced ground vehicle operation.',
          },
        },
        {
          id: 'flyer',
          label: 'Flyer 1',
          description: 'Atmospheric craft',
          effects: {
            skills: { choices: ['Flyer'], level: 1 },
            message: 'You learn to pilot atmospheric craft.',
          },
        },
        {
          id: 'pilot',
          label: 'Pilot 1',
          description: 'Spacecraft',
          effects: {
            skills: { choices: ['Pilot'], level: 1 },
            message: 'You are trained in spacecraft piloting.',
          },
        },
        {
          id: 'gunner',
          label: 'Gunner 1',
          description: 'Vehicle weapons',
          effects: {
            skills: { choices: ['Gunner'], level: 1 },
            message: 'You learn to operate vehicle weapon systems.',
          },
        },
      ],
    },
  },

  // Roll 11 - Senior agent mentor
  {
    id: 'agent-event-11',
    description: 'You are befriended by a senior agent.',
    resolution: {
      type: 'choice',
      displayText: 'Choose your benefit from this mentorship:',
      options: [
        {
          id: 'investigate',
          label: 'Increase Investigate',
          description: 'Learn advanced investigation techniques',
          effects: {
            skills: { choices: ['Investigate'], level: 1 },
            message: 'Your mentor teaches you advanced investigation techniques.',
          },
        },
        {
          id: 'advancement',
          label: 'DM+4 to Advancement',
          description: 'Your mentor puts in a good word',
          effects: {
            advancementDM: 4,
            message: 'Your mentor\'s recommendation gives you DM+4 to an advancement roll.',
          },
        },
      ],
    },
  },

  // Roll 12 - Major conspiracy
  {
    id: 'agent-event-12',
    description: 'Your efforts uncover a major conspiracy against your employers.',
    resolution: {
      type: 'automatic',
      effects: {
        autoPromotion: true,
        message: 'You uncover a major conspiracy against your employers. You are automatically promoted.',
      },
    },
  },
];

export const CAREER_AGENT: CareerDefinition = {
  name: 'Agent',
  description: 'Law enforcement agencies, corporate operatives, spies and others who work in the shadows.',
  qualification: 'INT 6+',
  qualificationTarget: 6,
  qualificationStat: 'intellect',
  assignments: [
    {
      name: 'Law Enforcement',
      description: 'You are a police officer or detective.',
      survivalStat: 'endurance',
      survivalTarget: 6,
      advancementStat: 'intellect',
      advancementTarget: 6,
    },
    {
      name: 'Intelligence',
      description: 'You work as a spy or saboteur.',
      survivalStat: 'intellect',
      survivalTarget: 7,
      advancementStat: 'intellect',
      advancementTarget: 5,
    },
    {
      name: 'Corporate',
      description: 'You work for a corporation, spying on rival organisations.',
      survivalStat: 'intellect',
      survivalTarget: 5,
      advancementStat: 'intellect',
      advancementTarget: 7,
    },
  ],
  skillTables: {
    personalDevelopment: ['Gun Combat', 'Dexterity +1', 'Endurance +1', 'Melee', 'Intellect +1', 'Athletics'],
    serviceSkills: ['Streetwise', 'Drive', 'Investigate', 'Flyer', 'Recon', 'Gun Combat'],
    advancedEducation: ['Advocate', 'Language', 'Explosives', 'Medic', 'Vacc Suit', 'Electronics'],
    specialist: {
      'Law Enforcement': ['Investigate', 'Recon', 'Streetwise', 'Stealth', 'Melee', 'Advocate'],
      'Intelligence': ['Investigate', 'Recon', 'Deception', 'Stealth', 'Persuade', 'Carouse'],
      'Corporate': ['Investigate', 'Electronics', 'Stealth', 'Carouse', 'Deception', 'Streetwise'],
    },
  },
  ranks: {
    enlisted: [
      { title: 'Rookie' },
      { title: 'Corporal', skillBonus: 'Streetwise' },
      { title: 'Sergeant' },
      { title: 'Detective' },
      { title: 'Lieutenant', skillBonus: 'Investigate' },
      { title: 'Chief', skillBonus: 'Admin' },
      { title: 'Commissioner', bonusStat: 'social' },
    ],
  },
  mishapTable: [
    // Mishap 1: Severely injured
    {
      id: 'agent-mishap-1',
      description: 'Severely injured. Roll on the Injury table.',
      resolution: {
        type: 'automatic' as const,
        effects: {
          rollOnTable: 'injury' as const,
          message: 'You are severely injured in the line of duty.',
        },
      },
    },
    // Mishap 2: Deal from criminal
    {
      id: 'agent-mishap-2',
      description: 'A criminal or other figure under investigation offers you a deal. Accept and you leave this career with a +4 DM to your next Qualification roll but gain a Rival. Refuse and you must roll on the Injury table.',
      resolution: {
        type: 'choice' as const,
        choices: [
          {
            id: 'accept',
            label: 'Accept the Deal',
            description: 'Leave career with DM+4 to next Qualification roll, but gain a Rival.',
            effects: {
              rivals: 1,
              qualificationDM: 4,
              message: 'You accept the deal. DM+4 to your next Qualification roll, but you gain a Rival.',
            },
          },
          {
            id: 'refuse',
            label: 'Refuse the Deal',
            description: 'Roll on the Injury table.',
            effects: {
              rollOnTable: 'injury' as const,
              message: 'You refuse the deal and suffer the consequences.',
            },
          },
        ],
      },
    },
    // Mishap 3: Investigation gone wrong - Roll Advocate 8+
    {
      id: 'agent-mishap-3',
      description: 'An investigation goes critically wrong or leads to the bottom of a conspiracy. Roll Advocate 8+. If you succeed, you may continue in this career. If you fail, you must leave this career.',
      resolution: {
        type: 'skill_roll' as const,
        skillRequirement: {
          minLevel: 0,
          specificSkills: ['Advocate'],
        },
        target: 8,
        displayText: 'Roll Advocate 8+ to navigate the conspiracy.',
        outcomes: [
          {
            condition: { type: 'success' as const },
            effects: {
              continueInCareer: true,
              message: 'You successfully navigate the conspiracy and may continue in this career.',
            },
          },
          {
            condition: { type: 'failure' as const },
            effects: {
              message: 'The investigation falls apart. You must leave this career.',
            },
          },
        ],
      },
    },
    // Mishap 4: Learned something dangerous
    {
      id: 'agent-mishap-4',
      description: 'You learn something you should not know. Gain an Enemy and roll on the Injury table.',
      resolution: {
        type: 'automatic' as const,
        effects: {
          enemies: 1,
          rollOnTable: 'injury' as const,
          message: 'You learn something you should not know. You gain an Enemy.',
        },
      },
    },
    // Mishap 5: Work comes home
    {
      id: 'agent-mishap-5',
      description: 'Your work ends up coming home with you and someone gets hurt. Gain an Enemy.',
      resolution: {
        type: 'automatic' as const,
        effects: {
          enemies: 1,
          message: 'Your work ends up coming home with you and someone gets hurt. You gain an Enemy.',
        },
      },
    },
    // Mishap 6: Injured
    {
      id: 'agent-mishap-6',
      description: 'Injured. Roll on the Injury table.',
      resolution: {
        type: 'automatic' as const,
        effects: {
          rollOnTable: 'injury' as const,
          message: 'You are injured. Roll on the Injury table.',
        },
      },
    },
  ],
  eventTable: AGENT_EVENTS,
  benefitsTable: AGENT_BENEFITS,
};
