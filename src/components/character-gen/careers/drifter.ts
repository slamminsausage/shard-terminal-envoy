// ============================================================================
// CAREER: DRIFTER
// Wanderers, hitchhikers and travellers, drifters are those who roam the
// stars without obvious purpose or direction.
// ============================================================================

import type { CareerDefinition, GameEvent, BenefitTableRow } from './types';

// Drifter Benefits Table (1D, results 1-7)
const DRIFTER_BENEFITS: BenefitTableRow[] = [
  // Roll 1 - No cash
  { cash: null, benefit: { options: [{ type: 'contact' }] } },
  // Roll 2 - No cash
  { cash: null, benefit: { options: [{ type: 'item', itemType: 'weapon' }] } },
  // Roll 3
  { cash: 1000, benefit: { options: [{ type: 'ally' }] } },
  // Roll 4
  { cash: 2000, benefit: { options: [{ type: 'item', itemType: 'weapon' }] } },
  // Roll 5
  { cash: 3000, benefit: { options: [{ type: 'characteristic', stat: 'education', amount: 1 }] } },
  // Roll 6
  { cash: 4000, benefit: { options: [{ type: 'ship_shares', shares: 1 }] } },
  // Roll 7
  { cash: 8000, benefit: { options: [{ type: 'ship_shares', shares: 2 }] } },
];

// ============================================================================
// DRIFTER MISHAPS (1D6)
// ============================================================================

const DRIFTER_MISHAPS: GameEvent[] = [
  {
    id: 'drifter-mishap-1',
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
    id: 'drifter-mishap-2',
    description: 'Injured. Roll on the Injury table.',
    resolution: {
      type: 'automatic',
      effects: {
        rollOnTable: 'injury',
        message: 'You are injured. Roll on the Injury table.',
      },
    },
  },
  {
    id: 'drifter-mishap-3',
    description: 'You run afoul of a criminal gang, corrupt bureaucrat or other foe. Gain an Enemy.',
    resolution: {
      type: 'automatic',
      effects: {
        enemies: 1,
        message: 'You run afoul of a criminal gang, corrupt bureaucrat or other foe.',
      },
    },
  },
  {
    id: 'drifter-mishap-4',
    description: 'You suffer from a life-threatening illness. Reduce your END by 1.',
    resolution: {
      type: 'automatic',
      effects: {
        characteristics: [{ stat: 'endurance', modifier: -1 }],
        message: 'You suffer from a life-threatening illness.',
      },
    },
  },
  {
    id: 'drifter-mishap-5',
    description: 'Betrayed by a friend. One of your Contacts or Allies betrays you, ending your career. That Contact or Ally becomes a Rival or Enemy. If you have no Contacts or Allies, then you are betrayed by someone you never saw coming and still gain a Rival or Enemy. In addition, roll 2D. If you roll 2, you must take the Prisoner career in your next term.',
    resolution: {
      type: 'sub_roll',
      displayText: 'Roll 2D to see if you must become a Prisoner.',
      subRoll: {
        dice: 2,
        outcomes: [
          {
            min: 2,
            max: 2,
            label: 'Snake Eyes! You must take the Prisoner career next term.',
            effects: {
              enemies: 1,
              forceCareer: 'Prisoner',
              message: 'Betrayed! Your contact/ally becomes an enemy, and you must become a Prisoner next term.',
            },
          },
          {
            min: 3,
            max: 12,
            label: 'You escape imprisonment.',
            effects: {
              enemies: 1,
              message: 'Betrayed! Your contact/ally becomes an enemy.',
            },
          },
        ],
      },
    },
  },
  {
    id: 'drifter-mishap-6',
    description: 'You do not know what happened to you. There is a gap in your memory.',
    resolution: {
      type: 'automatic',
      effects: {
        message: 'There is a gap in your memory. You do not know what happened to you during this time.',
      },
    },
  },
];

// ============================================================================
// DRIFTER EVENTS (2D6)
// ============================================================================

const DRIFTER_EVENTS: GameEvent[] = [
  // Event 2: Disaster
  {
    id: 'drifter-event-2',
    description: 'Disaster! Roll on the Mishap table but you are not ejected from this career.',
    resolution: {
      type: 'sub_roll',
      displayText: 'Roll 1D6 on the Mishap table.',
      subRoll: {
        dice: 1,
        outcomes: [
          { min: 1, max: 1, label: 'Severely injured', effects: { rollOnTable: 'injury', injurySeverity: 'severe' } },
          { min: 2, max: 2, label: 'Injured', effects: { rollOnTable: 'injury' } },
          { min: 3, max: 3, label: 'Gained an enemy', effects: { enemies: 1, message: 'You run afoul of a criminal gang, corrupt bureaucrat or other foe.' } },
          { min: 4, max: 4, label: 'Life-threatening illness', effects: { characteristics: [{ stat: 'endurance', modifier: -1 }], message: 'You suffer from a life-threatening illness.' } },
          { min: 5, max: 5, label: 'Betrayed', effects: { enemies: 1, message: 'Betrayed by a friend. A Contact or Ally becomes an Enemy.' } },
          { min: 6, max: 6, label: 'Memory gap', effects: { message: 'There is a gap in your memory.' } },
        ],
      },
    },
  },
  // Event 3: Patron offers job
  {
    id: 'drifter-event-3',
    description: 'A patron offers you a chance at a job. If you accept, you gain DM+4 to your next qualification roll but you owe that patron a favour.',
    resolution: {
      type: 'choice',
      displayText: 'A patron offers you a chance at a job.',
      options: [
        {
          id: 'accept',
          label: 'Accept the job',
          description: 'Gain DM+4 to next qualification roll, but owe a favour.',
          effects: {
            contacts: 1,
            message: 'You accept the job. Gain DM+4 to your next qualification roll, but you owe the patron a favour.',
          },
        },
        {
          id: 'decline',
          label: 'Decline',
          description: 'Turn down the offer.',
          effects: {
            message: 'You decline the patron\'s offer.',
          },
        },
      ],
    },
  },
  // Event 4: Pick up useful skills
  {
    id: 'drifter-event-4',
    description: 'You pick up a few useful skills here and there. Gain one level of Jack-of-all-Trades, Survival, Streetwise or Melee (any).',
    resolution: {
      type: 'automatic',
      effects: {
        skills: {
          choices: ['Jack-of-all-Trades', 'Survival', 'Streetwise', 'Melee (unarmed)', 'Melee (blade)', 'Melee (bludgeon)'],
          level: 1,
        },
        message: 'You pick up a few useful skills here and there.',
      },
    },
  },
  // Event 5: Scavenge something useful
  {
    id: 'drifter-event-5',
    description: 'You manage to scavenge something of use. Gain DM+1 to any one Benefit roll.',
    resolution: {
      type: 'automatic',
      effects: {
        benefitDM: 1,
        message: 'You manage to scavenge something of use. Gain DM+1 to any one Benefit roll.',
      },
    },
  },
  // Event 6: Unusual Event
  {
    id: 'drifter-event-6',
    description: 'You encounter something unusual. Go to the Life Events table and have an Unusual Event.',
    resolution: {
      type: 'table_redirect',
      table: 'unusual_events',
      displayText: 'You encounter something unusual. Roll on the Unusual Events table.',
    },
  },
  // Event 7: Life Event
  {
    id: 'drifter-event-7',
    description: 'Life Event. Roll on the Life Events table.',
    resolution: {
      type: 'table_redirect',
      table: 'life_events',
      displayText: 'Roll on the Life Events table.',
    },
  },
  // Event 8: Attacked by enemies
  {
    id: 'drifter-event-8',
    description: 'You are attacked by enemies. Gain an Enemy if you do not have one already and roll either Melee 8+, Gun Combat 8+ or Stealth 8+ to avoid a roll on the Injury table.',
    resolution: {
      type: 'skill_roll',
      skillRequirement: {
        minLevel: 0,
        specificSkills: ['Melee', 'Melee (unarmed)', 'Melee (blade)', 'Melee (bludgeon)', 'Gun Combat', 'Gun Combat (slug)', 'Gun Combat (energy)', 'Stealth'],
      },
      target: 8,
      displayText: 'Roll Melee 8+, Gun Combat 8+, or Stealth 8+ to avoid injury.',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            enemies: 1,
            message: 'You fend off the attackers but gain an Enemy.',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            enemies: 1,
            rollOnTable: 'injury',
            message: 'You are overwhelmed. Gain an Enemy and roll on the Injury table.',
          },
        },
      ],
    },
  },
  // Event 9: Risky adventure
  {
    id: 'drifter-event-9',
    description: 'You are offered a chance to take part in a risky but rewarding adventure. If you accept, roll 1D: On 1-2, injured or arrested. On 3-4, survive but gain nothing. On 5-6, succeed and gain DM+4 to one Benefit roll.',
    resolution: {
      type: 'choice',
      displayText: 'You are offered a chance to take part in a risky but rewarding adventure.',
      options: [
        {
          id: 'accept',
          label: 'Accept the risk',
          description: 'Roll 1D to determine the outcome.',
          effects: {},
          subRoll: {
            dice: 1,
            outcomes: [
              {
                min: 1,
                max: 1,
                label: 'Injured!',
                effects: {
                  rollOnTable: 'injury',
                  message: 'The adventure goes badly wrong. You are injured.',
                },
              },
              {
                min: 2,
                max: 2,
                label: 'Arrested!',
                effects: {
                  forceCareer: 'Prisoner',
                  message: 'The adventure goes badly wrong. You are arrested and must take the Prisoner career next term.',
                },
              },
              {
                min: 3,
                max: 4,
                label: 'Nothing gained',
                effects: {
                  message: 'You survive the adventure but gain nothing from it.',
                },
              },
              {
                min: 5,
                max: 6,
                label: 'Success!',
                effects: {
                  benefitDM: 4,
                  message: 'The adventure is a success! Gain DM+4 to one Benefit roll.',
                },
              },
            ],
          },
        },
        {
          id: 'decline',
          label: 'Play it safe',
          description: 'Decline the risky adventure.',
          effects: {
            message: 'You decide not to take the risk.',
          },
        },
      ],
    },
  },
  // Event 10: Life on the edge
  {
    id: 'drifter-event-10',
    description: 'Life on the edge hones your abilities. Increase any skill you already have by one level.',
    resolution: {
      type: 'automatic',
      effects: {
        skills: {
          anySkill: true,
          requireExisting: true,
          level: 1,
        },
        message: 'Life on the edge hones your abilities. Increase any skill you already have by one level.',
      },
    },
  },
  // Event 11: Forcibly drafted
  {
    id: 'drifter-event-11',
    description: 'You are forcibly drafted. Roll for the Draft next term.',
    resolution: {
      type: 'table_redirect',
      table: 'draft',
      displayText: 'You are forcibly drafted! You must roll on the Draft table for your next career.',
    },
  },
  // Event 12: Thrive on adversity
  {
    id: 'drifter-event-12',
    description: 'You thrive on adversity. You are automatically promoted.',
    resolution: {
      type: 'automatic',
      effects: {
        message: 'You thrive on adversity. You are automatically promoted this term.',
      },
    },
  },
];

// ============================================================================
// CAREER DEFINITION
// ============================================================================

export const CAREER_DRIFTER: CareerDefinition = {
  name: 'Drifter',
  description: 'Wanderers, hitchhikers and travellers, drifters are those who roam the stars without obvious purpose or direction.',
  qualification: 'Automatic',
  qualificationTarget: 0,
  qualificationStat: 'endurance', // Not used due to automaticQualification
  automaticQualification: true,
  usesAssignmentSkillsForBasicTraining: true,
  assignments: [
    {
      name: 'Barbarian',
      description: 'You live on a primitive world without the benefits of technology.',
      survivalStat: 'endurance',
      survivalTarget: 7,
      advancementStat: 'strength',
      advancementTarget: 7,
    },
    {
      name: 'Wanderer',
      description: 'You are a space bum, living hand-to-mouth in slums and spaceports across the galaxy.',
      survivalStat: 'endurance',
      survivalTarget: 7,
      advancementStat: 'intellect',
      advancementTarget: 7,
    },
    {
      name: 'Scavenger',
      description: 'You work as a belter (asteroid miner) or on a salvage crew.',
      survivalStat: 'dexterity',
      survivalTarget: 7,
      advancementStat: 'endurance',
      advancementTarget: 7,
    },
  ],
  skillTables: {
    personalDevelopment: ['Strength +1', 'Endurance +1', 'Dexterity +1', 'Language', 'Profession', 'Jack-of-all-Trades'],
    serviceSkills: ['Athletics', 'Melee (unarmed)', 'Recon', 'Streetwise', 'Stealth', 'Survival'],
    // No advanced education for Drifter
    specialist: {
      'Barbarian': ['Animals', 'Carouse', 'Melee (blade)', 'Stealth', 'Seafarer (personal)', 'Survival'],
      'Wanderer': ['Drive', 'Deception', 'Recon', 'Stealth', 'Streetwise', 'Survival'],
      'Scavenger': ['Pilot (small craft)', 'Mechanic', 'Astrogation', 'Vacc Suit', 'Profession', 'Gun Combat'],
    },
  },
  ranks: {
    // Default enlisted ranks (fallback)
    enlisted: [
      { title: '' },
      { title: '', skillBonus: 'Survival' },
      { title: '' },
      { title: '' },
      { title: '' },
      { title: '' },
      { title: '' },
    ],
    // Assignment-specific ranks
    byAssignment: {
      'Barbarian': [
        { title: '' },
        { title: '', skillBonus: 'Survival' },
        { title: 'Warrior', skillBonus: 'Melee (blade)' },
        { title: '' },
        { title: 'Chieftain', skillBonus: 'Leadership' },
        { title: '' },
        { title: 'Warlord' },
      ],
      'Wanderer': [
        { title: '' },
        { title: '', skillBonus: 'Streetwise' },
        { title: '' },
        { title: '', skillBonus: 'Deception' },
        { title: '' },
        { title: '' },
        { title: '' },
      ],
      'Scavenger': [
        { title: '' },
        { title: '', skillBonus: 'Recon' },
        { title: 'Belter', skillBonus: 'Engineer' },
        { title: '' },
        { title: 'Lead Belter', skillBonus: 'Mechanic' },
        { title: '' },
        { title: 'Boss', skillBonus: 'Prospecting' },
      ],
    },
  },
  mishapTable: DRIFTER_MISHAPS,
  eventTable: DRIFTER_EVENTS,
  benefitsTable: DRIFTER_BENEFITS,
};
