// ============================================================================
// CAREER: NAVY
// ============================================================================

import type { CareerDefinition, GameEvent, BenefitTableRow } from './types';

// Navy Benefits Table (1D, results 1-7)
const NAVY_BENEFITS: BenefitTableRow[] = [
  // Roll 1 - Personal Vehicle or Ship Share
  { cash: 1000, benefit: { options: [{ type: 'vehicle', vehicleType: 'Personal Vehicle' }, { type: 'ship_shares', shares: 1 }], isChoice: true } },
  // Roll 2
  { cash: 5000, benefit: { options: [{ type: 'characteristic', stat: 'intellect', amount: 1 }] } },
  // Roll 3 - EDU +1 or Two Ship Shares
  { cash: 5000, benefit: { options: [{ type: 'characteristic', stat: 'education', amount: 1 }, { type: 'ship_shares', shares: 2 }], isChoice: true } },
  // Roll 4
  { cash: 10000, benefit: { options: [{ type: 'item', itemType: 'weapon' }] } },
  // Roll 5
  { cash: 20000, benefit: { options: [{ type: 'tas_membership' }] } },
  // Roll 6 - Ship's Boat or Two Ship Shares
  { cash: 50000, benefit: { options: [{ type: 'ship', shipType: "Ship's Boat" }, { type: 'ship_shares', shares: 2 }], isChoice: true } },
  // Roll 7
  { cash: 50000, benefit: { options: [{ type: 'characteristic', stat: 'social', amount: 2 }] } },
];

// Navy Events (2D, results 2-12 map to indices 0-10)
const NAVY_EVENTS: GameEvent[] = [
  // Roll 2 - Disaster
  {
    id: 'navy-event-2',
    description: 'Disaster! Roll on the Mishap table but you are not ejected from this career.',
    resolution: {
      type: 'table_redirect',
      table: 'mishap',
      displayText: 'Roll on the Mishap table to determine what happens.',
    },
  },

  // Roll 3 - Gambling circle
  {
    id: 'navy-event-3',
    description: 'You join a gambling circle on board.',
    resolution: {
      type: 'choice',
      displayText: 'Gain Gambler 1 or Deception 1. If you wish, you may also throw Gambler 8+ — if you succeed, gain an extra Benefit roll; if you fail, you lose one Benefit roll.',
      options: [
        {
          id: 'gambler',
          label: 'Gain Gambler 1',
          description: 'Learn the art of gambling',
          effects: {
            skills: { choices: ['Gambler'], level: 1 },
            message: 'You join the gambling circle and gain Gambler 1.',
          },
        },
        {
          id: 'deception',
          label: 'Gain Deception 1',
          description: 'Learn to bluff and deceive',
          effects: {
            skills: { choices: ['Deception'], level: 1 },
            message: 'You learn to bluff your way through the gambling circle. Gain Deception 1.',
          },
        },
      ],
    },
  },

  // Roll 4 - Special assignment or duty on board ship
  {
    id: 'navy-event-4',
    description: 'You are given a special assignment or duty on board ship.',
    resolution: {
      type: 'automatic',
      effects: {
        benefitDM: 1,
        message: 'Your special assignment is rewarded. Gain DM+1 to any one Benefit roll.',
      },
    },
  },

  // Roll 5 - Advanced training
  {
    id: 'navy-event-5',
    description: 'You are given advanced training in a specialist field.',
    resolution: {
      type: 'characteristic_roll',
      stat: 'education',
      target: 8,
      displayText: 'Roll EDU 8+ to gain one level in any skill you already have.',
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

  // Roll 6 - Notable military engagement
  {
    id: 'navy-event-6',
    description: 'Your vessel participates in a notable military engagement.',
    resolution: {
      type: 'choice',
      displayText: 'Gain one of the following skills at level 1:',
      options: [
        {
          id: 'electronics',
          label: 'Electronics 1',
          description: 'Electronic systems operation',
          effects: {
            skills: { choices: ['Electronics'], level: 1 },
            message: 'The engagement improved your electronics skills.',
          },
        },
        {
          id: 'engineer',
          label: 'Engineer 1',
          description: 'Engineering systems',
          effects: {
            skills: { choices: ['Engineer'], level: 1 },
            message: 'The engagement taught you engineering under pressure.',
          },
        },
        {
          id: 'gunner',
          label: 'Gunner 1',
          description: 'Ship weapons systems',
          effects: {
            skills: { choices: ['Gunner'], level: 1 },
            message: 'You gained experience with ship weapons in combat.',
          },
        },
        {
          id: 'pilot',
          label: 'Pilot 1',
          description: 'Piloting spacecraft',
          effects: {
            skills: { choices: ['Pilot'], level: 1 },
            message: 'Combat piloting improved your skills.',
          },
        },
      ],
    },
  },

  // Roll 7 - Life Event
  {
    id: 'navy-event-7',
    description: 'Life Event. Roll on the Life Events table.',
    resolution: {
      type: 'table_redirect',
      table: 'life_events',
      displayText: 'Something significant happens in your personal life.',
    },
  },

  // Roll 8 - Diplomatic mission
  {
    id: 'navy-event-8',
    description: 'Your vessel participates in a diplomatic mission.',
    resolution: {
      type: 'choice',
      displayText: 'Gain one of the following:',
      options: [
        {
          id: 'recon',
          label: 'Recon 1',
          description: 'Reconnaissance',
          effects: {
            skills: { choices: ['Recon'], level: 1 },
            message: 'The diplomatic mission taught you reconnaissance skills.',
          },
        },
        {
          id: 'diplomat',
          label: 'Diplomat 1',
          description: 'Diplomatic skills',
          effects: {
            skills: { choices: ['Diplomat'], level: 1 },
            message: 'You gained diplomatic experience.',
          },
        },
        {
          id: 'steward',
          label: 'Steward 1',
          description: 'Hospitality and service',
          effects: {
            skills: { choices: ['Steward'], level: 1 },
            message: 'You learned steward skills during the diplomatic mission.',
          },
        },
        {
          id: 'contact',
          label: 'Gain a Contact',
          description: 'Make a useful connection',
          effects: {
            contacts: 1,
            message: 'You make a useful Contact during the diplomatic mission.',
          },
        },
      ],
    },
  },

  // Roll 9 - Foil attempted crime
  {
    id: 'navy-event-9',
    description: 'You foil an attempted crime on board, such as mutiny, sabotage, smuggling or conspiracy.',
    resolution: {
      type: 'automatic',
      effects: {
        enemies: 1,
        advancementDM: 2,
        message: 'You foil a crime on board. Gain an Enemy but also gain DM+2 to your next advancement roll in the Navy.',
      },
    },
  },

  // Roll 10 - Opportunity to abuse position
  {
    id: 'navy-event-10',
    description: 'You have the opportunity to abuse your position for profit.',
    resolution: {
      type: 'choice',
      displayText: 'Do you abuse your position or refuse?',
      options: [
        {
          id: 'abuse',
          label: 'Abuse Position for Profit',
          description: 'Gain an extra Benefit roll from this term',
          effects: {
            extraBenefit: true,
            message: 'You abuse your position for profit. Gain an extra Benefit roll from this term.',
          },
        },
        {
          id: 'refuse',
          label: 'Refuse',
          description: 'Gain DM+2 to your next advancement roll',
          effects: {
            advancementDM: 2,
            message: 'You refuse to abuse your position. Your integrity is rewarded with DM+2 to your next advancement roll.',
          },
        },
      ],
    },
  },

  // Roll 11 - Commanding officer takes interest
  {
    id: 'navy-event-11',
    description: 'Your commanding officer takes an interest in your career.',
    resolution: {
      type: 'choice',
      displayText: 'Choose your benefit:',
      options: [
        {
          id: 'tactics',
          label: 'Gain Tactics (naval) 1',
          description: 'Learn naval tactics from your CO',
          effects: {
            skills: { choices: ['Tactics (naval)'], level: 1 },
            message: 'Your CO mentors you in naval tactics.',
          },
        },
        {
          id: 'advancement',
          label: 'DM+4 to Advancement',
          description: 'Your CO puts in a good word for you',
          effects: {
            advancementDM: 4,
            message: 'Your CO\'s aid gives you DM+4 to your next advancement roll.',
          },
        },
      ],
    },
  },

  // Roll 12 - Heroism in battle
  {
    id: 'navy-event-12',
    description: 'You display heroism in battle, saving the whole ship. You automatically pass your next promotion or commission roll.',
    resolution: {
      type: 'automatic',
      effects: {
        autoPromotion: true,
        message: 'Your heroism in battle saves the whole ship! You automatically pass your next promotion or commission roll.',
      },
    },
  },
];

export const CAREER_NAVY: CareerDefinition = {
  name: 'Navy',
  description: 'Members of the interstellar navy that patrols space between the stars. The navy has the responsibility for the protection of society from foreign powers and lawless elements in the interstellar trade channels.',
  qualification: 'INT 6+',
  qualificationTarget: 6,
  qualificationStat: 'intellect',
  commissionTarget: 8, // SOC 8+
  assignments: [
    {
      name: 'Line/Crew',
      description: 'You serve as a general crewman or officer on a ship of the line.',
      survivalStat: 'intellect',
      survivalTarget: 5,
      advancementStat: 'education',
      advancementTarget: 7,
    },
    {
      name: 'Engineer/Gunner',
      description: 'You serve as a specialist technician on a starship.',
      survivalStat: 'intellect',
      survivalTarget: 6,
      advancementStat: 'education',
      advancementTarget: 6,
    },
    {
      name: 'Flight',
      description: 'You are a pilot of a shuttle, fighter or other light craft.',
      survivalStat: 'dexterity',
      survivalTarget: 7,
      advancementStat: 'education',
      advancementTarget: 5,
    },
  ],
  skillTables: {
    personalDevelopment: ['Strength +1', 'Dexterity +1', 'Endurance +1', 'Intellect +1', 'Education +1', 'Social +1'],
    serviceSkills: ['Pilot', 'Vacc Suit', 'Athletics', 'Gunner', 'Mechanic', 'Gun Combat'],
    advancedEducation: ['Electronics', 'Astrogation', 'Engineer', 'Flyer', 'Medic', 'Admin'],
    officer: ['Leadership', 'Electronics', 'Pilot', 'Melee (blade)', 'Admin', 'Tactics (naval)'],
    specialist: {
      'Line/Crew': ['Electronics', 'Mechanic', 'Gun Combat', 'Flyer', 'Melee', 'Vacc Suit'],
      'Engineer/Gunner': ['Engineer', 'Mechanic', 'Electronics', 'Engineer', 'Gunner', 'Flyer'],
      'Flight': ['Pilot', 'Flyer', 'Gunner', 'Pilot (small craft)', 'Astrogation', 'Electronics'],
    },
  },
  ranks: {
    enlisted: [
      { title: 'Crewman', skillBonus: 'Mechanic' },
      { title: 'Able Spacehand' },
      { title: 'Petty Officer 3rd Class', skillBonus: 'Vacc Suit' },
      { title: 'Petty Officer 2nd Class' },
      { title: 'Petty Officer 1st Class' },
      { title: 'Chief Petty Officer' },
      { title: 'Master Chief' },
    ],
    officer: [
      { title: 'Ensign', skillBonus: 'Melee (blade)' },
      { title: 'Sublieutenant', skillBonus: 'Leadership' },
      { title: 'Lieutenant' },
      { title: 'Commander', skillBonus: 'Tactics' },
      { title: 'Captain', bonusStat: 'social' },
      { title: 'Commodore', bonusStat: 'social' },
      { title: 'Admiral', bonusStat: 'social' },
    ],
  },
  mishapTable: [
    // Mishap 1: Severely injured
    {
      id: 'navy-mishap-1',
      description: 'Severely injured in action (this is the same as a result of 2 on the Injury table). Alternatively, roll twice on the Injury table and take the lower result.',
      resolution: {
        type: 'automatic' as const,
        effects: {
          rollOnTable: 'injury' as const,
          message: 'You are severely injured in action.',
        },
      },
    },
    // Mishap 2: Frozen watch - NOT ejected from career
    {
      id: 'navy-mishap-2',
      description: 'Placed in the frozen watch (cryogenically stored on board ship) and revived improperly. Reduce STR, DEX or END by 1 due to muscle wastage. You are not ejected from this career.',
      resolution: {
        type: 'choice' as const,
        choices: [
          {
            id: 'str',
            label: 'Reduce STR',
            description: 'Reduce Strength by 1.',
            effects: {
              characteristics: [{ stat: 'strength' as const, modifier: -1 }],
              continueInCareer: true,
              message: 'Improper revival from frozen watch reduces your Strength by 1. You are not ejected from this career.',
            },
          },
          {
            id: 'dex',
            label: 'Reduce DEX',
            description: 'Reduce Dexterity by 1.',
            effects: {
              characteristics: [{ stat: 'dexterity' as const, modifier: -1 }],
              continueInCareer: true,
              message: 'Improper revival from frozen watch reduces your Dexterity by 1. You are not ejected from this career.',
            },
          },
          {
            id: 'end',
            label: 'Reduce END',
            description: 'Reduce Endurance by 1.',
            effects: {
              characteristics: [{ stat: 'endurance' as const, modifier: -1 }],
              continueInCareer: true,
              message: 'Improper revival from frozen watch reduces your Endurance by 1. You are not ejected from this career.',
            },
          },
        ],
      },
    },
    // Mishap 3: Battle depends on your actions
    {
      id: 'navy-mishap-3',
      description: 'During a battle, defeat or victory depends on your actions. You must make an 8+ roll using a skill that depends on your branch. If you fail, you are court-martialled and discharged. If you succeed, you are honourably discharged and may keep your Benefit roll from this term.',
      resolution: {
        type: 'choice' as const,
        choices: [
          {
            id: 'electronics',
            label: 'Roll Electronics (sensors) 8+',
            description: 'For Line/Crew assignment',
            effects: {
              extraBenefit: true,
              message: 'You succeed! You are honourably discharged and keep your Benefit roll from this term.',
            },
          },
          {
            id: 'gunner',
            label: 'Roll Gunner 8+',
            description: 'For Line/Crew assignment',
            effects: {
              extraBenefit: true,
              message: 'You succeed! You are honourably discharged and keep your Benefit roll from this term.',
            },
          },
          {
            id: 'mechanic',
            label: 'Roll Mechanic 8+',
            description: 'For Engineer/Gunner assignment',
            effects: {
              extraBenefit: true,
              message: 'You succeed! You are honourably discharged and keep your Benefit roll from this term.',
            },
          },
          {
            id: 'vacc-suit',
            label: 'Roll Vacc Suit 8+',
            description: 'For Engineer/Gunner assignment',
            effects: {
              extraBenefit: true,
              message: 'You succeed! You are honourably discharged and keep your Benefit roll from this term.',
            },
          },
        ],
      },
    },
    // Mishap 4: Blamed for accident
    {
      id: 'navy-mishap-4',
      description: 'You are blamed for an accident that causes the death of several crew members. Were you responsible?',
      resolution: {
        type: 'choice' as const,
        choices: [
          {
            id: 'responsible',
            label: 'You Were Responsible',
            description: 'Gain one free skill roll before being ejected.',
            effects: {
              skills: { anySkill: true, level: 1 },
              message: 'Your guilt drives you to excel. Gain one free skill roll before you are ejected from the career.',
            },
          },
          {
            id: 'not-responsible',
            label: 'You Were Not Responsible',
            description: 'Gain an Enemy but keep your Benefit roll.',
            effects: {
              enemies: 1,
              extraBenefit: true,
              message: 'The officer who blamed you becomes your Enemy, but you keep your Benefit roll from this term.',
            },
          },
        ],
      },
    },
    // Mishap 5: Quarrel with officer
    {
      id: 'navy-mishap-5',
      description: 'You are tormented by or quarrel with an officer or fellow crewman. Gain that character as a Rival, as they force you out of the Navy.',
      resolution: {
        type: 'automatic' as const,
        effects: {
          rivals: 1,
          message: 'You quarrel with an officer or crewman. You gain them as a Rival as they force you out of the Navy.',
        },
      },
    },
    // Mishap 6: Injured
    {
      id: 'navy-mishap-6',
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
  eventTable: NAVY_EVENTS,
  benefitsTable: NAVY_BENEFITS,
};
