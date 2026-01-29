// ============================================================================
// CAREER: NOBLE
// Individuals of the upper class who perform little consistent function but
// often have large amounts of ready money.
// ============================================================================

import type { CareerDefinition, GameEvent, BenefitTableRow } from './types';

// Noble Benefits Table (1D, results 1-7)
const NOBLE_BENEFITS: BenefitTableRow[] = [
  // Roll 1
  { cash: 10000, benefit: { options: [{ type: 'ship_shares', shares: 1 }] } },
  // Roll 2
  { cash: 10000, benefit: { options: [{ type: 'ship_shares', shares: 2 }] } },
  // Roll 3
  { cash: 50000, benefit: { options: [{ type: 'item', itemType: 'blade' }] } },
  // Roll 4
  { cash: 50000, benefit: { options: [{ type: 'characteristic', stat: 'social', amount: 1 }] } },
  // Roll 5
  { cash: 100000, benefit: { options: [{ type: 'tas_membership' }] } },
  // Roll 6 - Yacht
  { cash: 100000, benefit: { options: [{ type: 'ship', shipType: 'Yacht' }] } },
  // Roll 7 - SOC +1 and Yacht (gain both)
  { cash: 200000, benefit: { options: [{ type: 'characteristic', stat: 'social', amount: 1 }, { type: 'ship', shipType: 'Yacht' }], isChoice: false } },
];

// ============================================================================
// NOBLE MISHAPS (1D6)
// ============================================================================

const NOBLE_MISHAPS: GameEvent[] = [
  {
    id: 'noble-mishap-1',
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
    id: 'noble-mishap-2',
    description: 'A family scandal forces you out of your position. Lose one SOC.',
    resolution: {
      type: 'automatic',
      effects: {
        characteristics: [{ stat: 'social', modifier: -1 }],
        message: 'A family scandal forces you out. Your social standing decreases.',
      },
    },
  },
  {
    id: 'noble-mishap-3',
    description: 'A disaster or war strikes. Roll Stealth 8+ or Deception 8+ to escape unhurt. If you fail, roll on the Injury table.',
    resolution: {
      type: 'skill_roll',
      skillRequirement: {
        minLevel: 0,
        specificSkills: ['Stealth', 'Deception'],
      },
      target: 8,
      displayText: 'Roll Stealth 8+ or Deception 8+ to escape the disaster unhurt.',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            message: 'You escape the disaster unharmed.',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            rollOnTable: 'injury',
            message: 'You are caught in the disaster. Roll on the Injury table.',
          },
        },
      ],
    },
  },
  {
    id: 'noble-mishap-4',
    description: 'Political manoeuvrings usurp your position. Increase Diplomat or Advocate by one level and gain a Rival.',
    resolution: {
      type: 'choice',
      displayText: 'Political manoeuvrings force you out. What did you learn?',
      options: [
        {
          id: 'diplomat',
          label: 'Diplomat 1',
          effects: {
            skills: { choices: ['Diplomat'], level: 1 },
            rivals: 1,
            message: 'You learn diplomatic skills from the experience and gain a Rival.',
          },
        },
        {
          id: 'advocate',
          label: 'Advocate 1',
          effects: {
            skills: { choices: ['Advocate'], level: 1 },
            rivals: 1,
            message: 'You learn legal skills from the experience and gain a Rival.',
          },
        },
      ],
    },
  },
  {
    id: 'noble-mishap-5',
    description: 'An assassin attempts to end your life. Roll END 8+. If you fail, roll on the Injury table.',
    resolution: {
      type: 'characteristic_roll',
      stat: 'endurance',
      target: 8,
      displayText: 'Roll END 8+ to survive the assassination attempt.',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            message: 'You survive the assassination attempt unharmed.',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            rollOnTable: 'injury',
            message: 'The assassin wounds you. Roll on the Injury table.',
          },
        },
      ],
    },
  },
  {
    id: 'noble-mishap-6',
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
// NOBLE EVENTS (2D6)
// ============================================================================

const NOBLE_EVENTS: GameEvent[] = [
  // Event 2: Disaster
  {
    id: 'noble-event-2',
    description: 'Disaster! Roll on the Mishap table, but you are not ejected from this career.',
    resolution: {
      type: 'table_redirect',
      table: 'injury',
      displayText: 'Roll on the Mishap table (not ejected from career).',
    },
  },

  // Event 3: Duel challenge
  {
    id: 'noble-event-3',
    description: 'You are challenged to a duel for your honour and standing. If you refuse, reduce your SOC by 1. If you accept, roll Melee (blade) 8+. If you succeed, gain one SOC. If you fail, roll on the Injury table and reduce your SOC by one. Either way, gain one level in Melee (blade), Leadership, Tactics (any) or Deception.',
    resolution: {
      type: 'choice',
      displayText: 'You are challenged to a duel. What do you do?',
      options: [
        {
          id: 'refuse',
          label: 'Refuse the duel',
          description: 'Lose 1 SOC for dishonour',
          effects: {
            characteristics: [{ stat: 'social', modifier: -1 }],
            message: 'You refuse the duel. Your honour suffers. SOC -1.',
          },
        },
        {
          id: 'accept-melee',
          label: 'Accept and gain Melee (blade)',
          description: 'Fight the duel. Roll 2D for Melee 8+.',
          effects: {
            skills: { choices: ['Melee (blade)'], level: 1 },
          },
          subRoll: {
            dice: 2,
            outcomes: [
              { min: 2, max: 7, label: 'Defeat! SOC -1 and Injured', effects: { characteristics: [{ stat: 'social', modifier: -1 }], rollOnTable: 'injury', message: 'You lose the duel. Gain Melee (blade), but lose SOC and roll on the Injury table.' } },
              { min: 8, max: 12, label: 'Victory! SOC +1', effects: { characteristics: [{ stat: 'social', modifier: 1 }], message: 'You win the duel! Gain Melee (blade) and SOC +1.' } },
            ],
          },
        },
        {
          id: 'accept-leadership',
          label: 'Accept and gain Leadership',
          description: 'Fight the duel. Roll 2D for Melee 8+.',
          effects: {
            skills: { choices: ['Leadership'], level: 1 },
          },
          subRoll: {
            dice: 2,
            outcomes: [
              { min: 2, max: 7, label: 'Defeat! SOC -1 and Injured', effects: { characteristics: [{ stat: 'social', modifier: -1 }], rollOnTable: 'injury', message: 'You lose the duel. Gain Leadership, but lose SOC and roll on the Injury table.' } },
              { min: 8, max: 12, label: 'Victory! SOC +1', effects: { characteristics: [{ stat: 'social', modifier: 1 }], message: 'You win the duel! Gain Leadership and SOC +1.' } },
            ],
          },
        },
        {
          id: 'accept-tactics',
          label: 'Accept and gain Tactics',
          description: 'Fight the duel. Roll 2D for Melee 8+.',
          effects: {
            skills: { choices: ['Tactics'], level: 1 },
          },
          subRoll: {
            dice: 2,
            outcomes: [
              { min: 2, max: 7, label: 'Defeat! SOC -1 and Injured', effects: { characteristics: [{ stat: 'social', modifier: -1 }], rollOnTable: 'injury', message: 'You lose the duel. Gain Tactics, but lose SOC and roll on the Injury table.' } },
              { min: 8, max: 12, label: 'Victory! SOC +1', effects: { characteristics: [{ stat: 'social', modifier: 1 }], message: 'You win the duel! Gain Tactics and SOC +1.' } },
            ],
          },
        },
        {
          id: 'accept-deception',
          label: 'Accept and gain Deception',
          description: 'Fight the duel. Roll 2D for Melee 8+.',
          effects: {
            skills: { choices: ['Deception'], level: 1 },
          },
          subRoll: {
            dice: 2,
            outcomes: [
              { min: 2, max: 7, label: 'Defeat! SOC -1 and Injured', effects: { characteristics: [{ stat: 'social', modifier: -1 }], rollOnTable: 'injury', message: 'You lose the duel. Gain Deception, but lose SOC and roll on the Injury table.' } },
              { min: 8, max: 12, label: 'Victory! SOC +1', effects: { characteristics: [{ stat: 'social', modifier: 1 }], message: 'You win the duel! Gain Deception and SOC +1.' } },
            ],
          },
        },
      ],
    },
  },

  // Event 4: Wide range of experiences
  {
    id: 'noble-event-4',
    description: 'Your time as a ruler or playboy gives you a wide range of experiences. Gain one of Animals (riding) 1, Art 1, Carouse 1 or Streetwise 1.',
    resolution: {
      type: 'choice',
      displayText: 'Your privileged life gives you varied experiences:',
      options: [
        {
          id: 'animals',
          label: 'Animals (riding) 1',
          effects: { skills: { choices: ['Animals (riding)'], level: 1 }, message: 'You learn to ride with the nobility.' },
        },
        {
          id: 'art',
          label: 'Art 1',
          effects: { skills: { choices: ['Art'], level: 1 }, message: 'You develop artistic appreciation.' },
        },
        {
          id: 'carouse',
          label: 'Carouse 1',
          effects: { skills: { choices: ['Carouse'], level: 1 }, message: 'You learn to party with the best.' },
        },
        {
          id: 'streetwise',
          label: 'Streetwise 1',
          effects: { skills: { choices: ['Streetwise'], level: 1 }, message: 'You learn the ways of the common folk.' },
        },
      ],
    },
  },

  // Event 5: Inherit gift
  {
    id: 'noble-event-5',
    description: 'You inherit a gift from a rich relative. Gain DM+1 to any one Benefit roll.',
    resolution: {
      type: 'automatic',
      effects: {
        benefitDM: 1,
        message: 'You inherit a valuable gift. Gain DM+1 to any one Benefit roll.',
      },
    },
  },

  // Event 6: Politics
  {
    id: 'noble-event-6',
    description: 'You become deeply involved in politics on your world of residence, becoming a player in the political intrigues of government. Gain one level in Advocate, Admin, Diplomacy or Persuade but also gain a Rival.',
    resolution: {
      type: 'choice',
      displayText: 'Political intrigue teaches you much, but makes enemies:',
      options: [
        {
          id: 'advocate',
          label: 'Advocate',
          effects: { skills: { choices: ['Advocate'], level: 1 }, rivals: 1, message: 'You learn legal manouvering and gain a political Rival.' },
        },
        {
          id: 'admin',
          label: 'Admin',
          effects: { skills: { choices: ['Admin'], level: 1 }, rivals: 1, message: 'You learn administration and gain a political Rival.' },
        },
        {
          id: 'diplomat',
          label: 'Diplomat',
          effects: { skills: { choices: ['Diplomat'], level: 1 }, rivals: 1, message: 'You learn diplomacy and gain a political Rival.' },
        },
        {
          id: 'persuade',
          label: 'Persuade',
          effects: { skills: { choices: ['Persuade'], level: 1 }, rivals: 1, message: 'You learn persuasion and gain a political Rival.' },
        },
      ],
    },
  },

  // Event 7: Life Event
  {
    id: 'noble-event-7',
    description: 'Life Event. Roll on the Life Events table.',
    resolution: {
      type: 'table_redirect',
      table: 'life_events',
      displayText: 'Roll on the Life Events table.',
    },
  },

  // Event 8: Conspiracy
  {
    id: 'noble-event-8',
    description: 'A conspiracy of nobles attempts to recruit you. If you refuse, gain the conspiracy as an Enemy. If you accept, roll Deception 8+ or Persuade 8+. If you fail, roll on the Mishap table as the conspiracy collapses. If you succeed, Gain one level of Deception, Persuade, Tactics or Carouse.',
    resolution: {
      type: 'choice',
      displayText: 'A conspiracy of nobles tries to recruit you:',
      options: [
        {
          id: 'refuse',
          label: 'Refuse to join',
          description: 'The conspiracy becomes your Enemy',
          effects: {
            enemies: 1,
            message: 'You refuse to join. The conspiracy becomes your Enemy.',
          },
        },
        {
          id: 'accept-deception',
          label: 'Join (gain Deception)',
          description: 'Roll 2D for 8+. Success: skill only. Failure: skill + Mishap.',
          effects: {
            skills: { choices: ['Deception'], level: 1 },
          },
          subRoll: {
            dice: 2,
            outcomes: [
              { min: 2, max: 7, label: 'Conspiracy collapses!', effects: { rollOnTable: 'injury', message: 'The conspiracy collapses! Gain Deception, but roll on the Mishap table.' } },
              { min: 8, max: 12, label: 'Conspiracy succeeds!', effects: { message: 'The conspiracy succeeds! Gain Deception.' } },
            ],
          },
        },
        {
          id: 'accept-persuade',
          label: 'Join (gain Persuade)',
          description: 'Roll 2D for 8+. Success: skill only. Failure: skill + Mishap.',
          effects: {
            skills: { choices: ['Persuade'], level: 1 },
          },
          subRoll: {
            dice: 2,
            outcomes: [
              { min: 2, max: 7, label: 'Conspiracy collapses!', effects: { rollOnTable: 'injury', message: 'The conspiracy collapses! Gain Persuade, but roll on the Mishap table.' } },
              { min: 8, max: 12, label: 'Conspiracy succeeds!', effects: { message: 'The conspiracy succeeds! Gain Persuade.' } },
            ],
          },
        },
        {
          id: 'accept-tactics',
          label: 'Join (gain Tactics)',
          description: 'Roll 2D for 8+. Success: skill only. Failure: skill + Mishap.',
          effects: {
            skills: { choices: ['Tactics'], level: 1 },
          },
          subRoll: {
            dice: 2,
            outcomes: [
              { min: 2, max: 7, label: 'Conspiracy collapses!', effects: { rollOnTable: 'injury', message: 'The conspiracy collapses! Gain Tactics, but roll on the Mishap table.' } },
              { min: 8, max: 12, label: 'Conspiracy succeeds!', effects: { message: 'The conspiracy succeeds! Gain Tactics.' } },
            ],
          },
        },
        {
          id: 'accept-carouse',
          label: 'Join (gain Carouse)',
          description: 'Roll 2D for 8+. Success: skill only. Failure: skill + Mishap.',
          effects: {
            skills: { choices: ['Carouse'], level: 1 },
          },
          subRoll: {
            dice: 2,
            outcomes: [
              { min: 2, max: 7, label: 'Conspiracy collapses!', effects: { rollOnTable: 'injury', message: 'The conspiracy collapses! Gain Carouse, but roll on the Mishap table.' } },
              { min: 8, max: 12, label: 'Conspiracy succeeds!', effects: { message: 'The conspiracy succeeds! Gain Carouse.' } },
            ],
          },
        },
      ],
    },
  },

  // Event 9: Acclaimed reign
  {
    id: 'noble-event-9',
    description: 'Your reign is acclaimed by all as being fair and wise – or in the case of a dilettante, you sponge off your family\'s wealth a while longer. Gain either a jealous relative or an unhappy subject as an Enemy. Gain DM+2 to your next advancement roll.',
    resolution: {
      type: 'automatic',
      effects: {
        enemies: 1,
        advancementDM: 2,
        message: 'Your success earns you acclaim but also jealousy. Gain an Enemy and DM+2 to advancement.',
      },
    },
  },

  // Event 10: Manipulate through society
  {
    id: 'noble-event-10',
    description: 'You manipulate and charm your way through high society. Gain one level of Carouse, Diplomat, Persuade or Steward, as well as a Rival and an Ally.',
    resolution: {
      type: 'choice',
      displayText: 'Your social manipulations gain you skills, friends, and enemies:',
      options: [
        {
          id: 'carouse',
          label: 'Carouse',
          effects: { skills: { choices: ['Carouse'], level: 1 }, rivals: 1, allies: 1, message: 'You learn Carouse, gain an Ally and a Rival.' },
        },
        {
          id: 'diplomat',
          label: 'Diplomat',
          effects: { skills: { choices: ['Diplomat'], level: 1 }, rivals: 1, allies: 1, message: 'You learn Diplomat, gain an Ally and a Rival.' },
        },
        {
          id: 'persuade',
          label: 'Persuade',
          effects: { skills: { choices: ['Persuade'], level: 1 }, rivals: 1, allies: 1, message: 'You learn Persuade, gain an Ally and a Rival.' },
        },
        {
          id: 'steward',
          label: 'Steward',
          effects: { skills: { choices: ['Steward'], level: 1 }, rivals: 1, allies: 1, message: 'You learn Steward, gain an Ally and a Rival.' },
        },
      ],
    },
  },

  // Event 11: Powerful ally
  {
    id: 'noble-event-11',
    description: 'You make an alliance with a powerful and charismatic noble, who becomes an Ally. Either gain one level of Leadership or DM+4 to your next advancement roll thanks to their aid.',
    resolution: {
      type: 'choice',
      displayText: 'A powerful noble becomes your ally:',
      options: [
        {
          id: 'leadership',
          label: 'Gain Leadership',
          description: 'Learn from your powerful ally',
          effects: {
            allies: 1,
            skills: { choices: ['Leadership'], level: 1 },
            message: 'You gain a powerful Ally and learn Leadership.',
          },
        },
        {
          id: 'advancement',
          label: 'DM+4 to advancement',
          description: 'Your ally helps your career',
          effects: {
            allies: 1,
            advancementDM: 4,
            message: 'You gain a powerful Ally and DM+4 to your next advancement roll.',
          },
        },
      ],
    },
  },

  // Event 12: Imperial recognition
  {
    id: 'noble-event-12',
    description: 'Your efforts do not go unnoticed by the Imperium. You are automatically promoted.',
    resolution: {
      type: 'automatic',
      effects: {
        autoPromotion: true,
        message: 'The Imperium notices your efforts. You are automatically promoted.',
      },
    },
  },
];

// ============================================================================
// CAREER DEFINITION
// ============================================================================

export const CAREER_NOBLE: CareerDefinition = {
  name: 'Noble',
  description: 'Individuals of the upper class who perform little consistent function but often have large amounts of ready money.',
  qualification: 'SOC 10+',
  qualificationTarget: 10,
  qualificationStat: 'social',
  automaticQualification: false, // SOC 10+ is automatic
  usesAssignmentSkillsForBasicTraining: false,
  assignments: [
    {
      name: 'Administrator',
      description: 'You manage estates or governmental functions.',
      survivalStat: 'intellect',
      survivalTarget: 4,
      advancementStat: 'education',
      advancementTarget: 6,
    },
    {
      name: 'Diplomat',
      description: 'You represent your world or family in diplomatic functions.',
      survivalStat: 'intellect',
      survivalTarget: 5,
      advancementStat: 'social',
      advancementTarget: 7,
    },
    {
      name: 'Dilettante',
      description: 'You live off family wealth and pursue your own interests.',
      survivalStat: 'social',
      survivalTarget: 5,
      advancementStat: 'intellect',
      advancementTarget: 7,
    },
  ],
  skillTables: {
    personalDevelopment: ['Strength +1', 'Dexterity +1', 'Endurance +1', 'Gambler', 'Gun Combat', 'Melee'],
    serviceSkills: ['Admin', 'Advocate', 'Electronics', 'Diplomat', 'Investigate', 'Persuade'],
    advancedEducation: ['Science', 'Advocate', 'Language', 'Leadership', 'Diplomat', 'Art'],
    advancedEducationMin: 8,
    specialist: {
      'Administrator': ['Admin', 'Advocate', 'Broker', 'Diplomat', 'Leadership', 'Persuade'],
      'Diplomat': ['Advocate', 'Carouse', 'Electronics', 'Steward', 'Diplomat', 'Deception'],
      'Dilettante': ['Carouse', 'Deception', 'Flyer', 'Streetwise', 'Gambler', 'Jack-of-all-Trades'],
    },
  },
  ranks: {
    enlisted: [
      { title: 'Assistant' },
      { title: 'Clerk', skillBonus: 'Admin' },
      { title: 'Supervisor' },
      { title: 'Manager', skillBonus: 'Advocate' },
      { title: 'Chief' },
      { title: 'Director', skillBonus: 'Leadership' },
      { title: 'Minister' },
    ],
    byAssignment: {
      'Administrator': [
        { title: 'Assistant' },
        { title: 'Clerk', skillBonus: 'Admin' },
        { title: 'Supervisor' },
        { title: 'Manager', skillBonus: 'Advocate' },
        { title: 'Chief' },
        { title: 'Director', skillBonus: 'Leadership' },
        { title: 'Minister' },
      ],
      'Diplomat': [
        { title: 'Intern' },
        { title: '3rd Secretary', skillBonus: 'Admin' },
        { title: '2nd Secretary' },
        { title: '1st Secretary', skillBonus: 'Advocate' },
        { title: 'Counsellor' },
        { title: 'Minister', skillBonus: 'Diplomat' },
        { title: 'Ambassador' },
      ],
      'Dilettante': [
        { title: 'Wastrel' },
        { title: '' },
        { title: 'Ingrate', skillBonus: 'Carouse' },
        { title: '' },
        { title: 'Black Sheep', skillBonus: 'Persuade' },
        { title: '' },
        { title: 'Scoundrel', skillBonus: 'Jack-of-all-Trades' },
      ],
    },
  },
  mishapTable: NOBLE_MISHAPS,
  eventTable: NOBLE_EVENTS,
  benefitsTable: NOBLE_BENEFITS,
};
