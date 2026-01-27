// ============================================================================
// CAREER: SCOUT
// ============================================================================

import type { CareerDefinition, GameEvent, BenefitTableRow } from './types';

// Scout Benefits Table (1D, results 1-7)
const SCOUT_BENEFITS: BenefitTableRow[] = [
  // Roll 1
  { cash: 20000, benefit: { options: [{ type: 'ship_shares', shares: 1 }] } },
  // Roll 2
  { cash: 20000, benefit: { options: [{ type: 'characteristic', stat: 'intellect', amount: 1 }] } },
  // Roll 3
  { cash: 30000, benefit: { options: [{ type: 'characteristic', stat: 'education', amount: 1 }] } },
  // Roll 4
  { cash: 30000, benefit: { options: [{ type: 'item', itemType: 'weapon' }] } },
  // Roll 5
  { cash: 50000, benefit: { options: [{ type: 'item', itemType: 'weapon' }] } },
  // Roll 6 - Scout Ship
  { cash: 50000, benefit: { options: [{ type: 'ship', shipType: 'Scout Ship' }] } },
  // Roll 7 - Scout Ship
  { cash: 50000, benefit: { options: [{ type: 'ship', shipType: 'Scout Ship' }] } },
];

// Scout Events (2D, results 2-12 map to indices 0-10)
const SCOUT_EVENTS: GameEvent[] = [
  // Roll 2 - Disaster
  {
    id: 'scout-event-2',
    description: 'Disaster! Roll on the Mishap table but you are not ejected from this career.',
    resolution: {
      type: 'table_redirect',
      table: 'injury',
      displayText: 'Roll on the Injury table to determine the severity of the disaster.',
    },
  },

  // Roll 3 - Fringes of known space
  {
    id: 'scout-event-3',
    description: 'You spend several years on the fringes of known space.',
    resolution: {
      type: 'choice',
      displayText: 'Choose a skill to gain at level 1:',
      options: [
        {
          id: 'survival',
          label: 'Survival 1',
          description: 'Wilderness survival',
          effects: {
            skills: { choices: ['Survival'], level: 1 },
            message: 'Life on the frontier taught you vital survival skills.',
          },
        },
        {
          id: 'navigation',
          label: 'Navigation 1',
          description: 'Charting routes',
          effects: {
            skills: { choices: ['Navigation'], level: 1 },
            message: 'Exploring the unknown improved your navigation abilities.',
          },
        },
        {
          id: 'pilot',
          label: 'Pilot 1',
          description: 'Spacecraft piloting',
          effects: {
            skills: { choices: ['Pilot'], level: 1 },
            message: 'Long solo flights refined your piloting skills.',
          },
        },
        {
          id: 'sensors',
          label: 'Electronics (Sensors) 1',
          description: 'Sensor operations',
          effects: {
            skills: { choices: ['Electronics (Sensors)'], level: 1 },
            message: 'Scanning unknown systems improved your sensor expertise.',
          },
        },
      ],
    },
  },

  // Roll 4 - Survey alien world
  {
    id: 'scout-event-4',
    description: 'You survey an alien world.',
    resolution: {
      type: 'choice',
      displayText: 'Choose a skill to gain at level 1:',
      options: [
        {
          id: 'recon',
          label: 'Recon 1',
          description: 'Reconnaissance',
          effects: {
            skills: { choices: ['Recon'], level: 1 },
            message: 'Surveying alien terrain sharpened your reconnaissance skills.',
          },
        },
        {
          id: 'science',
          label: 'Science 1',
          description: 'Scientific analysis',
          effects: {
            skills: { choices: ['Science'], level: 1 },
            message: 'Cataloguing alien ecosystems developed your scientific knowledge.',
          },
        },
        {
          id: 'electronics',
          label: 'Electronics 1',
          description: 'Electronic systems',
          effects: {
            skills: { choices: ['Electronics'], level: 1 },
            message: 'Operating survey equipment improved your electronics skills.',
          },
        },
        {
          id: 'survival',
          label: 'Survival 1',
          description: 'Wilderness survival',
          effects: {
            skills: { choices: ['Survival'], level: 1 },
            message: 'Surviving on an alien world tested and improved your survival abilities.',
          },
        },
      ],
    },
  },

  // Roll 5 - Edges of civilisation
  {
    id: 'scout-event-5',
    description: 'You spend a great deal of time on the edges of civilisation.',
    resolution: {
      type: 'automatic',
      effects: {
        contacts: 1,
        message: 'Your time on the frontier brings you into contact with unusual people. Gain one Contact in an unusual location.',
      },
    },
  },

  // Roll 6 - Courier duty
  {
    id: 'scout-event-6',
    description: 'You serve as a courier.',
    resolution: {
      type: 'choice',
      displayText: 'Choose a skill to gain at level 1:',
      options: [
        {
          id: 'pilot',
          label: 'Pilot 1',
          description: 'Spacecraft piloting',
          effects: {
            skills: { choices: ['Pilot'], level: 1 },
            message: 'Courier runs improved your piloting skills.',
          },
        },
        {
          id: 'sensors',
          label: 'Electronics (Sensors) 1',
          description: 'Sensor operations',
          effects: {
            skills: { choices: ['Electronics (Sensors)'], level: 1 },
            message: 'Navigating dangerous space sharpened your sensor abilities.',
          },
        },
        {
          id: 'electronics',
          label: 'Electronics 1',
          description: 'Electronic systems',
          effects: {
            skills: { choices: ['Electronics'], level: 1 },
            message: 'Maintaining ship systems on long runs improved your electronics skills.',
          },
        },
        {
          id: 'astrogation',
          label: 'Astrogation 1',
          description: 'Jump calculations',
          effects: {
            skills: { choices: ['Astrogation'], level: 1 },
            message: 'Plotting jump routes developed your astrogation expertise.',
          },
        },
      ],
    },
  },

  // Roll 7 - Life Event
  {
    id: 'scout-event-7',
    description: 'Life Event. Roll on the Life Events table.',
    resolution: {
      type: 'table_redirect',
      table: 'life_events',
      displayText: 'Something significant happens in your personal life.',
    },
  },

  // Roll 8 - Advanced training
  {
    id: 'scout-event-8',
    description: 'You are given advanced training in a specialist field.',
    resolution: {
      type: 'characteristic_roll',
      stat: 'education',
      target: 8,
      displayText: 'Roll EDU 8+ to successfully complete the training.',
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

  // Roll 9 - First contact
  {
    id: 'scout-event-9',
    description: 'Your ship is involved in a first contact with a previously unknown minor race.',
    resolution: {
      type: 'choice',
      displayText: 'Choose a skill to gain at level 1 (you also gain a Contact among the new species):',
      options: [
        {
          id: 'language',
          label: 'Language 1',
          description: 'Learning their tongue',
          effects: {
            skills: { choices: ['Language'], level: 1 },
            contacts: 1,
            message: 'You learned the basics of an alien language and made a friend among them.',
          },
        },
        {
          id: 'diplomat',
          label: 'Diplomat 1',
          description: 'Diplomatic relations',
          effects: {
            skills: { choices: ['Diplomat'], level: 1 },
            contacts: 1,
            message: 'First contact taught you diplomatic skills and earned you an alien friend.',
          },
        },
        {
          id: 'recon',
          label: 'Recon 1',
          description: 'Careful observation',
          effects: {
            skills: { choices: ['Recon'], level: 1 },
            contacts: 1,
            message: 'Studying the new species improved your observation skills. You made a friend among them.',
          },
        },
      ],
    },
  },

  // Roll 10 - Time in jump space
  {
    id: 'scout-event-10',
    description: 'You spend a great deal of time in jump space.',
    resolution: {
      type: 'choice',
      displayText: 'Choose a skill to gain at level 1:',
      options: [
        {
          id: 'astrogation',
          label: 'Astrogation 1',
          description: 'Jump calculations',
          effects: {
            skills: { choices: ['Astrogation'], level: 1 },
            message: 'Extended time in jump space refined your astrogation skills.',
          },
        },
        {
          id: 'electronics',
          label: 'Electronics 1',
          description: 'Electronic systems',
          effects: {
            skills: { choices: ['Electronics'], level: 1 },
            message: 'Maintaining systems during long jumps improved your electronics expertise.',
          },
        },
        {
          id: 'sensors',
          label: 'Electronics (Sensors) 1',
          description: 'Sensor operations',
          effects: {
            skills: { choices: ['Electronics (Sensors)'], level: 1 },
            message: 'Monitoring jump space phenomena developed your sensor abilities.',
          },
        },
      ],
    },
  },

  // Roll 11 - Valuable discovery
  {
    id: 'scout-event-11',
    description: 'You discover something of value on a world you survey.',
    resolution: {
      type: 'automatic',
      effects: {
        benefitDM: 2,
        message: 'Your discovery is noted and rewarded. Gain DM+2 to any one Benefit roll from this career.',
      },
    },
  },
];

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
    // Mishap 1: Severely injured
    {
      id: 'scout-mishap-1',
      description: 'Severely injured in action. Roll on the Injury table.',
      resolution: {
        type: 'automatic' as const,
        effects: {
          rollOnTable: 'injury' as const,
          message: 'You are severely injured in action.',
        },
      },
    },
    // Mishap 2: Ship damaged, hitch-hike back
    {
      id: 'scout-mishap-2',
      description: 'Your ship is damaged and you have to hitch-hike your way back across the stars. Gain one Contact and one level in Streetwise, Persuade, or Deception.',
      resolution: {
        type: 'choice' as const,
        choices: [
          {
            id: 'streetwise',
            label: 'Gain Streetwise',
            description: 'Increase Streetwise by one level.',
            effects: {
              skills: { choices: ['Streetwise'], level: 1 },
              contacts: 1,
              message: 'You hitch-hike back across the stars and gain Streetwise and a Contact.',
            },
          },
          {
            id: 'persuade',
            label: 'Gain Persuade',
            description: 'Increase Persuade by one level.',
            effects: {
              skills: { choices: ['Persuade'], level: 1 },
              contacts: 1,
              message: 'You hitch-hike back across the stars and gain Persuade and a Contact.',
            },
          },
          {
            id: 'deception',
            label: 'Gain Deception',
            description: 'Increase Deception by one level.',
            effects: {
              skills: { choices: ['Deception'], level: 1 },
              contacts: 1,
              message: 'You hitch-hike back across the stars and gain Deception and a Contact.',
            },
          },
        ],
      },
    },
    // Mishap 3: Conflict with Minor Race
    {
      id: 'scout-mishap-3',
      description: 'You inadvertently cause a conflict between the Imperium and a Minor Race. Gain a Rival and lose this Benefit roll.',
      resolution: {
        type: 'automatic' as const,
        effects: {
          rivals: 1,
          message: 'You inadvertently cause a conflict between the Imperium and a Minor Race. Gain a Rival.',
        },
      },
    },
    // Mishap 4: Bad reaction to jump space
    {
      id: 'scout-mishap-4',
      description: 'You have a bad reaction to jump space. Leave this career.',
      resolution: {
        type: 'automatic' as const,
        effects: {
          message: 'You have a bad reaction to jump space and must leave this career.',
        },
      },
    },
    // Mishap 5: Ship destroyed
    {
      id: 'scout-mishap-5',
      description: 'Your ship is destroyed through your actions. Gain an Enemy.',
      resolution: {
        type: 'automatic' as const,
        effects: {
          enemies: 1,
          message: 'Your ship is destroyed through your actions. You gain an Enemy.',
        },
      },
    },
    // Mishap 6: Injured
    {
      id: 'scout-mishap-6',
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
  eventTable: SCOUT_EVENTS,
  benefitsTable: SCOUT_BENEFITS,
};
