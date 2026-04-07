// ============================================================================
// CAREER: ROGUE
// Criminal elements familiar with the rougher or more illegal methods of
// attaining goals.
// ============================================================================

import type { CareerDefinition, GameEvent, BenefitTableRow } from './types';

// Rogue Benefits Table (1D, results 1-7)
const ROGUE_BENEFITS: BenefitTableRow[] = [
  // Roll 1 - No cash
  { cash: null, benefit: { options: [{ type: 'ship_shares', shares: 1 }] } },
  // Roll 2 - No cash
  { cash: null, benefit: { options: [{ type: 'item', itemType: 'weapon' }] } },
  // Roll 3
  { cash: 10000, benefit: { options: [{ type: 'characteristic', stat: 'intellect', amount: 1 }] } },
  // Roll 4 - 1D Ship Shares
  { cash: 10000, benefit: { options: [{ type: 'ship_shares', shares: '1D' }] } },
  // Roll 5
  { cash: 50000, benefit: { options: [{ type: 'item', itemType: 'armour' }] } },
  // Roll 6
  { cash: 100000, benefit: { options: [{ type: 'characteristic', stat: 'dexterity', amount: 1 }] } },
  // Roll 7 - 2D Ship Shares
  { cash: 100000, benefit: { options: [{ type: 'ship_shares', shares: '2D' }] } },
];

// ============================================================================
// ROGUE MISHAPS (1D6)
// ============================================================================

const ROGUE_MISHAPS: GameEvent[] = [
  {
    id: 'rogue-mishap-1',
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
    id: 'rogue-mishap-2',
    description: 'Arrested. You must take the Prisoner career in your next term.',
    resolution: {
      type: 'automatic',
      effects: {
        forceCareer: 'Prisoner',
        message: 'You are arrested! You must take the Prisoner career next term.',
      },
    },
  },
  {
    id: 'rogue-mishap-3',
    description: 'Betrayed by a friend. One of your Contacts or Allies betrays you, ending your career. That Contact or Ally becomes a Rival or Enemy. If you have no Contacts or Allies, then you are betrayed by someone you never saw coming and still gain a Rival or Enemy. In addition, roll 2D. If you roll 2, you must take the Prisoner career in your next term.',
    resolution: {
      type: 'sub_roll',
      displayText: 'Betrayed by a friend! Roll 2D to see if you end up in prison.',
      subRoll: {
        dice: 2,
        outcomes: [
          {
            min: 2,
            max: 2,
            label: 'Snake Eyes! You must become a Prisoner.',
            effects: {
              enemies: 1,
              forceCareer: 'Prisoner',
              message: 'Betrayed! Your friend becomes an Enemy and your crimes are exposed. You must take the Prisoner career next term.',
            },
          },
          {
            min: 3,
            max: 12,
            label: 'You avoid prison.',
            effects: {
              enemies: 1,
              message: 'Betrayed! Your friend becomes an Enemy, but you avoid prison.',
            },
          },
        ],
      },
    },
  },
  {
    id: 'rogue-mishap-4',
    description: 'A job goes wrong, forcing you to flee off-planet. Gain one of Deception 1, Pilot (small craft or spacecraft) 1, Athletics (dexterity) 1 or Gunner 1.',
    resolution: {
      type: 'choice',
      displayText: 'A job goes wrong. What skills did you pick up fleeing?',
      options: [
        {
          id: 'deception',
          label: 'Deception 1',
          effects: { skills: { choices: ['Deception'], level: 1 }, message: 'You learn to deceive your way out of trouble.' },
        },
        {
          id: 'pilot',
          label: 'Pilot 1',
          effects: { skills: { choices: ['Pilot (small craft)'], level: 1 }, message: 'You learn to pilot your escape.' },
        },
        {
          id: 'athletics',
          label: 'Athletics 1',
          effects: { skills: { choices: ['Athletics (dexterity)'], level: 1 }, message: 'You learn to run and dodge.' },
        },
        {
          id: 'gunner',
          label: 'Gunner 1',
          effects: { skills: { choices: ['Gunner'], level: 1 }, message: 'You learn to operate ship weapons.' },
        },
      ],
    },
  },
  {
    id: 'rogue-mishap-5',
    description: 'A police detective or rival criminal forces you to flee and vows to hunt you down. Gain an Enemy.',
    resolution: {
      type: 'automatic',
      effects: {
        enemies: 1,
        message: 'A detective or rival criminal vows to hunt you down. Gain an Enemy.',
      },
    },
  },
  {
    id: 'rogue-mishap-6',
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
// ROGUE EVENTS (2D6)
// ============================================================================

const ROGUE_EVENTS: GameEvent[] = [
  // Event 2: Disaster
  {
    id: 'rogue-event-2',
    description: 'Disaster! Roll on the Mishap table but you are not ejected from this career.',
    resolution: {
      type: 'table_redirect',
      table: 'mishap',
      displayText: 'Roll on the Mishap table (not ejected from career).',
    },
  },

  // Event 3: Arrested and charged
  {
    id: 'rogue-event-3',
    description: 'You are arrested and charged. You can choose to defend yourself or hire a lawyer. If you defend yourself, roll Advocate 8+. If you succeed, the charges are dropped. If you fail, gain an Enemy and take the Prisoner career in your next term. If you hired a lawyer, gain the lawyer as a Contact and lose a Benefit roll.',
    resolution: {
      type: 'choice',
      displayText: 'You are arrested and charged. How do you handle it?',
      options: [
        {
          id: 'defend',
          label: 'Defend yourself',
          description: 'Roll Advocate 8+. Success: charges dropped. Failure: Prison + Enemy.',
          effects: {
            message: 'You attempt to defend yourself in court. (Roll Advocate 8+ - failure means Prison and Enemy)',
          },
        },
        {
          id: 'lawyer',
          label: 'Hire a lawyer',
          description: 'Lose a Benefit roll but gain lawyer as Contact',
          effects: {
            contacts: 1,
            loseBenefits: true,
            message: 'You hire a lawyer. Lose a Benefit roll but gain the lawyer as a Contact.',
          },
        },
      ],
    },
  },

  // Event 4: Impressive heist
  {
    id: 'rogue-event-4',
    description: 'You are involved in the planning of an impressive heist. Gain Electronics 1 or Mechanic 1.',
    resolution: {
      type: 'choice',
      displayText: 'Planning a heist teaches you technical skills:',
      options: [
        {
          id: 'electronics',
          label: 'Electronics 1',
          effects: { skills: { choices: ['Electronics'], level: 1 }, message: 'You learn to bypass electronic security.' },
        },
        {
          id: 'mechanic',
          label: 'Mechanic 1',
          effects: { skills: { choices: ['Mechanic'], level: 1 }, message: 'You learn to crack mechanical locks and safes.' },
        },
      ],
    },
  },

  // Event 5: Crime pays off
  {
    id: 'rogue-event-5',
    description: 'One of your crimes pays off. Gain DM+2 to any one Benefit roll and gain your victim as an Enemy.',
    resolution: {
      type: 'automatic',
      effects: {
        benefitDM: 2,
        enemies: 1,
        message: 'Your crime pays off! Gain DM+2 to a Benefit roll but your victim becomes an Enemy.',
      },
    },
  },

  // Event 6: Backstab opportunity
  {
    id: 'rogue-event-6',
    description: 'You have the opportunity to backstab a fellow rogue for personal gain. If you do so, gain DM+4 to your next advancement roll. If you refuse, gain them as an Ally.',
    resolution: {
      type: 'choice',
      displayText: 'You can backstab a fellow rogue for personal gain:',
      options: [
        {
          id: 'backstab',
          label: 'Backstab them',
          description: 'DM+4 to next advancement roll',
          effects: {
            advancementDM: 4,
            message: 'You backstab your fellow rogue. DM+4 to your next advancement roll.',
          },
        },
        {
          id: 'refuse',
          label: 'Refuse to betray them',
          description: 'Gain them as an Ally',
          effects: {
            allies: 1,
            message: 'You remain loyal and gain them as an Ally.',
          },
        },
      ],
    },
  },

  // Event 7: Life Event
  {
    id: 'rogue-event-7',
    description: 'Life Event. Roll on the Life Events table.',
    resolution: {
      type: 'table_redirect',
      table: 'life_events',
      displayText: 'Roll on the Life Events table.',
    },
  },

  // Event 8: Criminal underworld
  {
    id: 'rogue-event-8',
    description: 'You spend months in the dangerous criminal underworld. Gain one of Streetwise 1, Stealth 1, Melee 1 or Gun Combat 1.',
    resolution: {
      type: 'choice',
      displayText: 'Time in the criminal underworld teaches you:',
      options: [
        {
          id: 'streetwise',
          label: 'Streetwise 1',
          effects: { skills: { choices: ['Streetwise'], level: 1 }, message: 'You learn the ways of the streets.' },
        },
        {
          id: 'stealth',
          label: 'Stealth 1',
          effects: { skills: { choices: ['Stealth'], level: 1 }, message: 'You learn to move unseen.' },
        },
        {
          id: 'melee',
          label: 'Melee 1',
          effects: { skills: { choices: ['Melee'], level: 1 }, message: 'You learn to fight up close.' },
        },
        {
          id: 'gun-combat',
          label: 'Gun Combat 1',
          effects: { skills: { choices: ['Gun Combat'], level: 1 }, message: 'You learn to use firearms.' },
        },
      ],
    },
  },

  // Event 9: Feud with rival organization
  {
    id: 'rogue-event-9',
    description: 'You become involved in a feud with a rival criminal organisation. Roll Stealth or Gun Combat 8+. If you fail, roll on the Injury Table. If you succeed, gain an extra Benefit roll.',
    resolution: {
      type: 'skill_roll',
      skillRequirement: {
        minLevel: 0,
        specificSkills: ['Stealth', 'Gun Combat', 'Gun Combat (slug)', 'Gun Combat (energy)'],
      },
      target: 8,
      displayText: 'Roll Stealth or Gun Combat 8+ to come out on top in the feud.',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            extraBenefit: true,
            message: 'You come out on top in the feud. Gain an extra Benefit roll.',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            rollOnTable: 'injury',
            message: 'The feud goes badly. Roll on the Injury table.',
          },
        },
      ],
    },
  },

  // Event 10: Gambling ring
  {
    id: 'rogue-event-10',
    description: 'You are involved in a gambling ring. Gain Gambler 1. You may wager any number of Benefit rolls. Roll Gambler 8+; if you fail, lose all the wagered Benefit rolls. If you succeed, gain half as many Benefit rolls as you wagered (round up).',
    resolution: {
      type: 'automatic',
      effects: {
        skills: { choices: ['Gambler'], level: 1 },
        message: 'You get involved in a gambling ring. Gain Gambler 1. (You may optionally wager Benefits)',
      },
    },
  },

  // Event 11: Crime lord protégé
  {
    id: 'rogue-event-11',
    description: 'A crime lord considers you his protégé. Either gain Tactics (military) 1 or DM+4 to your next advancement roll thanks to their aid.',
    resolution: {
      type: 'choice',
      displayText: 'A crime lord takes you under their wing:',
      options: [
        {
          id: 'tactics',
          label: 'Gain Tactics 1',
          description: 'Learn from the crime lord',
          effects: {
            skills: { choices: ['Tactics (military)'], level: 1 },
            message: 'You learn Tactics from the crime lord.',
          },
        },
        {
          id: 'advancement',
          label: 'DM+4 to advancement',
          description: 'The crime lord helps your career',
          effects: {
            advancementDM: 4,
            message: 'The crime lord helps you advance. DM+4 to your next advancement roll.',
          },
        },
      ],
    },
  },

  // Event 12: Legendary crime
  {
    id: 'rogue-event-12',
    description: 'You commit a legendary crime. You are automatically promoted.',
    resolution: {
      type: 'automatic',
      effects: {
        autoPromotion: true,
        message: 'You commit a legendary crime! You are automatically promoted.',
      },
    },
  },
];

// ============================================================================
// CAREER DEFINITION
// ============================================================================

export const CAREER_ROGUE: CareerDefinition = {
  name: 'Rogue',
  description: 'Criminal elements familiar with the rougher or more illegal methods of attaining goals.',
  qualification: 'DEX 6+',
  qualificationTarget: 6,
  qualificationStat: 'dexterity',
  usesAssignmentSkillsForBasicTraining: false,
  assignments: [
    {
      name: 'Thief',
      description: 'You steal for a living, using stealth and skill.',
      survivalStat: 'intellect',
      survivalTarget: 6,
      advancementStat: 'dexterity',
      advancementTarget: 6,
    },
    {
      name: 'Enforcer',
      description: 'You use force and intimidation on behalf of criminal organizations.',
      survivalStat: 'endurance',
      survivalTarget: 6,
      advancementStat: 'strength',
      advancementTarget: 6,
    },
    {
      name: 'Pirate',
      description: 'You prey on merchant shipping in the void of space.',
      survivalStat: 'dexterity',
      survivalTarget: 6,
      advancementStat: 'intellect',
      advancementTarget: 6,
    },
  ],
  skillTables: {
    personalDevelopment: ['Carouse', 'Dexterity +1', 'Endurance +1', 'Gambler', 'Melee', 'Gun Combat'],
    serviceSkills: ['Deception', 'Recon', 'Athletics', 'Gun Combat', 'Stealth', 'Streetwise'],
    advancedEducation: ['Electronics', 'Navigation', 'Medic', 'Investigate', 'Broker', 'Advocate'],
    advancedEducationMin: 10,
    specialist: {
      'Thief': ['Stealth', 'Electronics', 'Recon', 'Streetwise', 'Deception', 'Athletics'],
      'Enforcer': ['Gun Combat', 'Melee', 'Streetwise', 'Persuade', 'Athletics', 'Drive'],
      'Pirate': ['Pilot', 'Astrogation', 'Gunner', 'Engineer', 'Vacc Suit', 'Melee'],
    },
  },
  ranks: {
    enlisted: [
      { title: '' },
      { title: '', skillBonus: 'Stealth' },
      { title: '' },
      { title: '', skillBonus: 'Streetwise' },
      { title: '' },
      { title: '', skillBonus: 'Recon' },
      { title: '' },
    ],
    byAssignment: {
      'Thief': [
        { title: '' },
        { title: '', skillBonus: 'Stealth' },
        { title: '' },
        { title: '', skillBonus: 'Streetwise' },
        { title: '' },
        { title: '', skillBonus: 'Recon' },
        { title: '' },
      ],
      'Enforcer': [
        { title: '' },
        { title: '', skillBonus: 'Persuade' },
        { title: '' },
        { title: '', skillBonus: 'Gun Combat' },
        { title: '' },
        { title: '', skillBonus: 'Streetwise' },
        { title: '' },
      ],
      'Pirate': [
        { title: 'Lackey' },
        { title: 'Henchman', skillBonus: 'Pilot' },
        { title: 'Corporal' },
        { title: 'Sergeant', skillBonus: 'Gun Combat' },
        { title: 'Lieutenant' },
        { title: 'Leader', skillBonus: 'Leadership' },
        { title: 'Captain' },
      ],
    },
  },
  mishapTable: ROGUE_MISHAPS,
  eventTable: ROGUE_EVENTS,
  benefitsTable: ROGUE_BENEFITS,
};
