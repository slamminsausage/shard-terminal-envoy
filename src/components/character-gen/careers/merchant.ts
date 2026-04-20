// ============================================================================
// CAREER: MERCHANT
// Individuals who work for independent free traders carrying cargoes and
// passengers between worlds, or brokers who negotiate deals.
// ============================================================================

import type { CareerDefinition, GameEvent, BenefitTableRow } from './types';

// Merchant Benefits Table (1D, results 1-7)
const MERCHANT_BENEFITS: BenefitTableRow[] = [
  // Roll 1
  { cash: 1000, benefit: { options: [{ type: 'item', itemType: 'blade' }] } },
  // Roll 2
  { cash: 5000, benefit: { options: [{ type: 'characteristic', stat: 'intellect', amount: 1 }] } },
  // Roll 3
  { cash: 10000, benefit: { options: [{ type: 'characteristic', stat: 'education', amount: 1 }] } },
  // Roll 4
  { cash: 20000, benefit: { options: [{ type: 'item', itemType: 'gun' }] } },
  // Roll 5
  { cash: 20000, benefit: { options: [{ type: 'ship_shares', shares: 1 }] } },
  // Roll 6 - Free Trader ship
  { cash: 40000, benefit: { options: [{ type: 'ship', shipType: 'Free Trader' }] } },
  // Roll 7 - Free Trader ship
  { cash: 40000, benefit: { options: [{ type: 'ship', shipType: 'Free Trader' }] } },
];

// ============================================================================
// MERCHANT MISHAPS (1D6)
// ============================================================================

const MERCHANT_MISHAPS: GameEvent[] = [
  {
    id: 'merchant-mishap-1',
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
    id: 'merchant-mishap-2',
    description: 'You are bankrupted by a rival. You lose all Benefits from this career and gain the other trader as a Rival.',
    resolution: {
      type: 'automatic',
      effects: {
        rivals: 1,
        loseBenefits: true,
        message: 'A rival bankrupts you. You lose all Benefits from this career and gain them as a Rival.',
      },
    },
  },
  {
    id: 'merchant-mishap-3',
    description: 'A sudden war destroys your trade routes and contacts, forcing you to flee that region of space. Gain Gun Combat 1 or Pilot 1.',
    resolution: {
      type: 'choice',
      displayText: 'War forces you to flee. What skills did you pick up?',
      options: [
        {
          id: 'gun-combat',
          label: 'Gun Combat 1',
          effects: { skills: { choices: ['Gun Combat'], level: 1 }, message: 'You learn to defend yourself in the chaos of war.' },
        },
        {
          id: 'pilot',
          label: 'Pilot 1',
          effects: { skills: { choices: ['Pilot'], level: 1 }, message: 'You learn to pilot your way to safety.' },
        },
      ],
    },
  },
  {
    id: 'merchant-mishap-4',
    description: 'Your ship or starport is destroyed by criminals. Gain them as an Enemy.',
    resolution: {
      type: 'automatic',
      effects: {
        enemies: 1,
        message: 'Criminals destroy your ship or starport. You gain them as an Enemy.',
      },
    },
  },
  {
    id: 'merchant-mishap-5',
    description: 'Imperial trade restrictions force you out of business. You may take the Rogue career for your next term without needing to roll for qualification.',
    resolution: {
      type: 'automatic',
      effects: {
        forceCareer: 'Rogue',
        message: 'Trade restrictions end your legitimate career. You may enter the Rogue career without qualification.',
      },
    },
  },
  {
    id: 'merchant-mishap-6',
    description: 'A series of bad deals and decisions force you into bankruptcy. You salvage what you can. You may take a Benefit roll for this term as well as any others you are entitled to.',
    resolution: {
      type: 'automatic',
      effects: {
        extraBenefit: true,
        message: 'Bankruptcy, but you salvage what you can. Take an extra Benefit roll for this term.',
      },
    },
  },
];

// ============================================================================
// MERCHANT EVENTS (2D6)
// ============================================================================

const MERCHANT_EVENTS: GameEvent[] = [
  // Event 2: Disaster
  {
    id: 'merchant-event-2',
    description: 'Disaster! Roll on the Mishap table but you are not ejected from this career.',
    resolution: {
      type: 'table_redirect',
      table: 'mishap',
      displayText: 'Roll on the Mishap table (not ejected from career).',
    },
  },

  // Event 3: Smuggling opportunity
  {
    id: 'merchant-event-3',
    description: 'You are offered the opportunity to smuggle illegal items onto a planet. If you accept, roll Deception 8+ or Persuade 8+ to gain Streetwise 1 and an extra Benefit roll. If you refuse, you gain an Enemy in the criminal sphere.',
    resolution: {
      type: 'choice',
      displayText: 'You are offered a smuggling job. What do you do?',
      options: [
        {
          id: 'accept',
          label: 'Accept the job',
          description: 'Roll Deception/Persuade 8+ for Streetwise 1 and extra Benefit',
          effects: {
            skills: { choices: ['Streetwise'], level: 1 },
            extraBenefit: true,
            message: 'You take the smuggling job. Gain Streetwise 1 and an extra Benefit roll.',
          },
        },
        {
          id: 'refuse',
          label: 'Refuse',
          description: 'Gain an Enemy in the criminal sphere',
          effects: {
            enemies: 1,
            message: 'You refuse the smuggling job. The criminals don\'t take kindly to refusals.',
          },
        },
      ],
    },
  },

  // Event 4: Dealing with suppliers
  {
    id: 'merchant-event-4',
    description: 'Gain any one of these skills, reflecting your time spent dealing with suppliers and spacers: Profession 1, Electronics 1, Engineer 1, Animals 1 or Science 1.',
    resolution: {
      type: 'choice',
      displayText: 'Choose a skill from dealing with suppliers and spacers:',
      options: [
        {
          id: 'profession',
          label: 'Profession 1',
          effects: { skills: { choices: ['Profession'], level: 1 }, message: 'You learn practical trade skills.' },
        },
        {
          id: 'electronics',
          label: 'Electronics 1',
          effects: { skills: { choices: ['Electronics'], level: 1 }, message: 'You learn electronics maintenance.' },
        },
        {
          id: 'engineer',
          label: 'Engineer 1',
          effects: { skills: { choices: ['Engineer'], level: 1 }, message: 'You learn engineering from spacers.' },
        },
        {
          id: 'animals',
          label: 'Animals 1',
          effects: { skills: { choices: ['Animals'], level: 1 }, message: 'You learn to handle livestock cargo.' },
        },
      ],
    },
  },

  // Event 5: Risky deal
  {
    id: 'merchant-event-5',
    description: 'You have a chance to risk your fortune on a possibly lucrative deal. You may gamble a number of Benefit rolls and roll Gambler 8+ or Broker 8+. If you succeed, you gain half as many Benefit rolls as you risked, rounding up. If you fail, you lose all the rolls risked. Either way, gain one level in whichever skill you used.',
    resolution: {
      type: 'choice',
      displayText: 'Will you risk your fortune on a lucrative deal?',
      options: [
        {
          id: 'gamble',
          label: 'Take the risk (Gambler)',
          description: 'Risk Benefits for potential gain using Gambler',
          effects: {
            skills: { choices: ['Gambler'], level: 1 },
            message: 'You take the risk using Gambler. Gain Gambler 1.',
          },
        },
        {
          id: 'broker',
          label: 'Take the risk (Broker)',
          description: 'Risk Benefits for potential gain using Broker',
          effects: {
            skills: { choices: ['Broker'], level: 1 },
            message: 'You take the risk using Broker. Gain Broker 1.',
          },
        },
        {
          id: 'safe',
          label: 'Play it safe',
          description: 'Don\'t risk your benefits',
          effects: {
            message: 'You decide not to risk your fortune.',
          },
        },
      ],
    },
  },

  // Event 6: Unexpected connection
  {
    id: 'merchant-event-6',
    description: 'You make an unexpected connection outside your normal circles. Gain a Contact.',
    resolution: {
      type: 'automatic',
      effects: {
        contacts: 1,
        message: 'You make a useful connection. Gain a Contact.',
      },
    },
  },

  // Event 7: Life Event
  {
    id: 'merchant-event-7',
    description: 'Life Event. Roll on the Life Events table.',
    resolution: {
      type: 'table_redirect',
      table: 'life_events',
      displayText: 'Roll on the Life Events table.',
    },
  },

  // Event 8: Legal trouble
  {
    id: 'merchant-event-8',
    description: 'You are embroiled in legal trouble. Gain one of Advocate 1, Admin 1, Diplomat 1 or Investigate 1, then roll 2D. If you roll 2, you must take the Prisoner career in your next term.',
    resolution: {
      type: 'choice',
      displayText: 'Legal trouble! Choose a skill, then roll 2D to see if you end up in prison:',
      options: [
        {
          id: 'advocate',
          label: 'Advocate 1',
          effects: { skills: { choices: ['Advocate'], level: 1 }, message: 'You learn legal skills dealing with the trouble.' },
          subRoll: {
            dice: 2,
            outcomes: [
              { min: 2, max: 2, label: 'Snake Eyes! Prison awaits.', effects: { forceCareer: 'Prisoner', message: 'Your legal troubles land you in prison. You must take the Prisoner career next term.' } },
              { min: 3, max: 12, label: 'You avoid prison.', effects: { message: 'You manage to stay out of prison.' } },
            ],
          },
        },
        {
          id: 'admin',
          label: 'Admin 1',
          effects: { skills: { choices: ['Admin'], level: 1 }, message: 'You learn administrative skills dealing with the trouble.' },
          subRoll: {
            dice: 2,
            outcomes: [
              { min: 2, max: 2, label: 'Snake Eyes! Prison awaits.', effects: { forceCareer: 'Prisoner', message: 'Your legal troubles land you in prison. You must take the Prisoner career next term.' } },
              { min: 3, max: 12, label: 'You avoid prison.', effects: { message: 'You manage to stay out of prison.' } },
            ],
          },
        },
        {
          id: 'diplomat',
          label: 'Diplomat 1',
          effects: { skills: { choices: ['Diplomat'], level: 1 }, message: 'You learn diplomatic skills dealing with the trouble.' },
          subRoll: {
            dice: 2,
            outcomes: [
              { min: 2, max: 2, label: 'Snake Eyes! Prison awaits.', effects: { forceCareer: 'Prisoner', message: 'Your legal troubles land you in prison. You must take the Prisoner career next term.' } },
              { min: 3, max: 12, label: 'You avoid prison.', effects: { message: 'You manage to stay out of prison.' } },
            ],
          },
        },
        {
          id: 'investigate',
          label: 'Investigate 1',
          effects: { skills: { choices: ['Investigate'], level: 1 }, message: 'You learn investigative skills dealing with the trouble.' },
          subRoll: {
            dice: 2,
            outcomes: [
              { min: 2, max: 2, label: 'Snake Eyes! Prison awaits.', effects: { forceCareer: 'Prisoner', message: 'Your legal troubles land you in prison. You must take the Prisoner career next term.' } },
              { min: 3, max: 12, label: 'You avoid prison.', effects: { message: 'You manage to stay out of prison.' } },
            ],
          },
        },
      ],
    },
  },

  // Event 9: Advanced training
  {
    id: 'merchant-event-9',
    description: 'You are given advanced training in a specialist field. Roll EDU 8+ to increase any one skill you already have by one level.',
    resolution: {
      type: 'characteristic_roll',
      stat: 'education',
      target: 8,
      displayText: 'Roll EDU 8+ for advanced training.',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            skills: { anySkill: true, requireExisting: true, level: 1 },
            message: 'Your advanced training succeeds. Increase any existing skill by 1.',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            message: 'The training proves too difficult.',
          },
        },
      ],
    },
  },

  // Event 10: High life
  {
    id: 'merchant-event-10',
    description: 'A good deal ensures you are living the high life for a few years. Gain DM+1 to any one Benefit roll.',
    resolution: {
      type: 'automatic',
      effects: {
        benefitDM: 1,
        message: 'A lucrative deal pays off! Gain DM+1 to any one Benefit roll.',
      },
    },
  },

  // Event 11: Befriend ally
  {
    id: 'merchant-event-11',
    description: 'You befriend a useful ally in one sphere. Gain an Ally and either gain a level in Carouse or DM+4 to your next advancement roll thanks to their aid.',
    resolution: {
      type: 'choice',
      displayText: 'You befriend a useful ally. Gain an Ally and choose your benefit:',
      options: [
        {
          id: 'carouse',
          label: 'Gain Carouse 1',
          description: 'Learn social skills from your new ally',
          effects: {
            allies: 1,
            skills: { choices: ['Carouse'], level: 1 },
            message: 'You gain an Ally and learn Carouse 1.',
          },
        },
        {
          id: 'advancement',
          label: 'DM+4 to advancement',
          description: 'Your ally helps your career',
          effects: {
            allies: 1,
            advancementDM: 4,
            message: 'You gain an Ally and DM+4 to your next advancement roll.',
          },
        },
      ],
    },
  },

  // Event 12: Business thrives
  {
    id: 'merchant-event-12',
    description: 'Your business or ship thrives. You are automatically promoted.',
    resolution: {
      type: 'automatic',
      effects: {
        autoPromotion: true,
        message: 'Your business thrives! You are automatically promoted.',
      },
    },
  },
];

// ============================================================================
// CAREER DEFINITION
// ============================================================================

export const CAREER_MERCHANT: CareerDefinition = {
  name: 'Merchant',
  description: 'Individuals who work for independent free traders carrying cargoes and passengers between worlds.',
  qualification: 'INT 4+',
  qualificationTarget: 4,
  qualificationStat: 'intellect',
  usesAssignmentSkillsForBasicTraining: false,
  assignments: [
    {
      name: 'Merchant Marine',
      description: 'You work on a corporate merchant vessel.',
      survivalStat: 'education',
      survivalTarget: 5,
      advancementStat: 'intellect',
      advancementTarget: 7,
    },
    {
      name: 'Free Trader',
      description: 'You work on an independent trading vessel.',
      survivalStat: 'dexterity',
      survivalTarget: 6,
      advancementStat: 'intellect',
      advancementTarget: 6,
    },
    {
      name: 'Broker',
      description: 'You negotiate deals and arrange trades.',
      survivalStat: 'education',
      survivalTarget: 5,
      advancementStat: 'intellect',
      advancementTarget: 7,
    },
  ],
  skillTables: {
    personalDevelopment: ['Strength +1', 'Dexterity +1', 'Endurance +1', 'Intellect +1', 'Language', 'Streetwise'],
    serviceSkills: ['Drive', 'Vacc Suit', 'Broker', 'Steward', 'Electronics', 'Persuade'],
    advancedEducation: ['Engineer', 'Astrogation', 'Electronics', 'Pilot', 'Admin', 'Advocate'],
    advancedEducationMin: 8,
    specialist: {
      'Merchant Marine': ['Pilot', 'Vacc Suit', 'Athletics', 'Mechanic', 'Engineer', 'Electronics'],
      'Free Trader': ['Pilot (spacecraft)', 'Vacc Suit', 'Deception', 'Mechanic', 'Streetwise', 'Gunner'],
      'Broker': ['Admin', 'Advocate', 'Broker', 'Streetwise', 'Deception', 'Persuade'],
    },
  },
  ranks: {
    enlisted: [
      { title: 'Crewman' },
      { title: 'Senior Crewman', skillBonus: 'Mechanic' },
      { title: '4th Officer' },
      { title: '3rd Officer' },
      { title: '2nd Officer', skillBonus: 'Pilot' },
      { title: '1st Officer', skillBonus: 'Social +1' },
      { title: 'Captain' },
    ],
    byAssignment: {
      'Merchant Marine': [
        { title: 'Crewman' },
        { title: 'Senior Crewman', skillBonus: 'Mechanic' },
        { title: '4th Officer' },
        { title: '3rd Officer' },
        { title: '2nd Officer', skillBonus: 'Pilot' },
        { title: '1st Officer', skillBonus: 'Social +1' },
        { title: 'Captain' },
      ],
      'Free Trader': [
        { title: '' },
        { title: '', skillBonus: 'Persuade' },
        { title: '' },
        { title: 'Experienced Trader', skillBonus: 'Jack-of-all-Trades' },
        { title: '' },
        { title: '' },
        { title: '' },
      ],
      'Broker': [
        { title: '' },
        { title: '', skillBonus: 'Broker' },
        { title: '' },
        { title: 'Experienced Broker', skillBonus: 'Streetwise' },
        { title: '' },
        { title: '' },
        { title: '' },
      ],
    },
  },
  mishapTable: MERCHANT_MISHAPS,
  eventTable: MERCHANT_EVENTS,
  benefitsTable: MERCHANT_BENEFITS,
};
