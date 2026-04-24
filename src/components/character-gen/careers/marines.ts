// ============================================================================
// CAREER: MARINES
// ============================================================================

import type { CareerDefinition, GameEvent, BenefitTableRow } from './types';

// Marine Benefits Table (1D, results 1-7)
const MARINES_BENEFITS: BenefitTableRow[] = [
  // Roll 1
  { cash: 2000, benefit: { options: [{ type: 'item', itemType: 'armour' }] } },
  // Roll 2
  { cash: 5000, benefit: { options: [{ type: 'characteristic', stat: 'intellect', amount: 1 }] } },
  // Roll 3
  { cash: 5000, benefit: { options: [{ type: 'characteristic', stat: 'education', amount: 1 }] } },
  // Roll 4
  { cash: 10000, benefit: { options: [{ type: 'item', itemType: 'weapon' }] } },
  // Roll 5
  { cash: 20000, benefit: { options: [{ type: 'tas_membership' }] } },
  // Roll 6 - Armour or END +1
  { cash: 30000, benefit: { options: [{ type: 'item', itemType: 'armour' }, { type: 'characteristic', stat: 'endurance', amount: 1 }], isChoice: true } },
  // Roll 7
  { cash: 40000, benefit: { options: [{ type: 'characteristic', stat: 'social', amount: 2 }] } },
];

// Marines Events (2D, results 2-12 map to indices 0-10)
const MARINES_EVENTS: GameEvent[] = [
  // Roll 2 - Disaster
  {
    id: 'marines-event-2',
    description: 'Disaster! Roll on the Mishap table but you are not ejected from this career.',
    resolution: {
      type: 'table_redirect',
      table: 'mishap',
      displayText: 'Roll on the Mishap table to determine what happens.',
    },
  },

  // Roll 3 - Trapped behind enemy lines
  {
    id: 'marines-event-3',
    description: 'Trapped behind enemy lines, you have to survive on your own.',
    resolution: {
      type: 'choice',
      displayText: 'Gain one of the following skills at level 1:',
      options: [
        {
          id: 'survival',
          label: 'Survival 1',
          description: 'Wilderness survival techniques',
          effects: {
            skills: { choices: ['Survival'], level: 1 },
            message: 'Surviving behind enemy lines taught you wilderness survival.',
          },
        },
        {
          id: 'stealth',
          label: 'Stealth 1',
          description: 'Moving unseen',
          effects: {
            skills: { choices: ['Stealth'], level: 1 },
            message: 'You learned to move undetected behind enemy lines.',
          },
        },
        {
          id: 'deception',
          label: 'Deception 1',
          description: 'Deception and misdirection',
          effects: {
            skills: { choices: ['Deception'], level: 1 },
            message: 'You learned to deceive the enemy to survive.',
          },
        },
        {
          id: 'streetwise',
          label: 'Streetwise 1',
          description: 'Urban survival and contacts',
          effects: {
            skills: { choices: ['Streetwise'], level: 1 },
            message: 'You learned streetwise skills to survive behind enemy lines.',
          },
        },
      ],
    },
  },

  // Roll 4 - Security staff of a space station
  {
    id: 'marines-event-4',
    description: 'You are assigned to the security staff of a space station.',
    resolution: {
      type: 'choice',
      displayText: 'Increase one of these skills by one level:',
      options: [
        {
          id: 'vacc-suit',
          label: 'Vacc Suit',
          description: 'Environmental suit operations',
          effects: {
            skills: { choices: ['Vacc Suit'], level: 1 },
            message: 'Station duty improved your vacuum suit skills.',
          },
        },
        {
          id: 'athletics',
          label: 'Athletics (dexterity)',
          description: 'Physical fitness',
          effects: {
            skills: { choices: ['Athletics (dexterity)'], level: 1 },
            message: 'Security patrols kept you in peak physical condition.',
          },
        },
      ],
    },
  },

  // Roll 5 - Advanced training
  {
    id: 'marines-event-5',
    description: 'You are given advanced training in a specialist field.',
    resolution: {
      type: 'characteristic_roll',
      stat: 'education',
      target: 8,
      displayText: 'Roll EDU 8+ to gain any one skill of your choice at level 1.',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            skills: { anySkill: true, level: 1 },
            message: 'Training complete! Gain any one skill of your choice at level 1.',
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

  // Roll 6 - Assault on an enemy fortress
  {
    id: 'marines-event-6',
    description: 'You are assigned to an assault on an enemy fortress.',
    resolution: {
      type: 'choice',
      displayText: 'Choose a combat skill to roll 8+ with:',
      options: [
        {
          id: 'melee-roll',
          label: 'Roll Melee 8+',
          description: 'Use your melee combat skills',
          effects: {
            skills: { choices: ['Tactics (military)', 'Leadership'], level: 1 },
            message: 'You succeed in the assault! Gain Tactics (military) or Leadership.',
          },
          subRoll: {
            dice: 2,
            outcomes: [
              { min: 8, max: 12, label: 'Success!', effects: { skills: { choices: ['Tactics (military)', 'Leadership'], level: 1 }, message: 'The assault succeeds! Choose Tactics (military) or Leadership.' } },
              { min: 2, max: 7, label: 'Failure - Injured', effects: { characteristics: [{ stat: 'endurance', modifier: -1 }], message: 'The assault fails. You are injured and lose 1 point from a physical characteristic.' } },
            ],
          },
        },
        {
          id: 'gun-combat-roll',
          label: 'Roll Gun Combat 8+',
          description: 'Use your ranged combat skills',
          effects: {
            skills: { choices: ['Tactics (military)', 'Leadership'], level: 1 },
            message: 'You succeed in the assault! Gain Tactics (military) or Leadership.',
          },
          subRoll: {
            dice: 2,
            outcomes: [
              { min: 8, max: 12, label: 'Success!', effects: { skills: { choices: ['Tactics (military)', 'Leadership'], level: 1 }, message: 'The assault succeeds! Choose Tactics (military) or Leadership.' } },
              { min: 2, max: 7, label: 'Failure - Injured', effects: { characteristics: [{ stat: 'endurance', modifier: -1 }], message: 'The assault fails. You are injured and lose 1 point from a physical characteristic.' } },
            ],
          },
        },
      ],
    },
  },

  // Roll 7 - Life Event
  {
    id: 'marines-event-7',
    description: 'Life Event. Roll on the Life Events table.',
    resolution: {
      type: 'table_redirect',
      table: 'life_events',
      displayText: 'Something significant happens in your personal life.',
    },
  },

  // Roll 8 - Front lines of a planetary assault
  {
    id: 'marines-event-8',
    description: 'You are on the front lines of a planetary assault and occupation.',
    resolution: {
      type: 'choice',
      displayText: 'Gain one of the following skills at level 1:',
      options: [
        {
          id: 'recon',
          label: 'Recon 1',
          description: 'Reconnaissance',
          effects: {
            skills: { choices: ['Recon'], level: 1 },
            message: 'Front-line experience honed your reconnaissance skills.',
          },
        },
        {
          id: 'gun-combat',
          label: 'Gun Combat 1',
          description: 'Ranged combat',
          effects: {
            skills: { choices: ['Gun Combat'], level: 1 },
            message: 'Intense combat improved your gun combat skills.',
          },
        },
        {
          id: 'leadership',
          label: 'Leadership 1',
          description: 'Command and leadership',
          effects: {
            skills: { choices: ['Leadership'], level: 1 },
            message: 'Leading troops in battle taught you leadership.',
          },
        },
        {
          id: 'electronics-comms',
          label: 'Electronics (comms) 1',
          description: 'Communications systems',
          effects: {
            skills: { choices: ['Electronics (comms)'], level: 1 },
            message: 'You gained experience with battlefield communications.',
          },
        },
      ],
    },
  },

  // Roll 9 - Mission goes wrong due to commander's error
  {
    id: 'marines-event-9',
    description: 'A mission goes disastrously wrong due to your commander\'s error or incompetence but you survive.',
    resolution: {
      type: 'choice',
      displayText: 'If you report your commanding officer for their failure then you gain DM+2 to your next advancement roll and gain the officer as an Enemy. If you say nothing and protect them, gain them as an Ally.',
      options: [
        {
          id: 'report',
          label: 'Report the Commander',
          description: 'Gain DM+2 to next advancement roll but gain an Enemy',
          effects: {
            advancementDM: 2,
            enemies: 1,
            message: 'You report your commander. Gain DM+2 to next advancement roll and gain the officer as an Enemy.',
          },
        },
        {
          id: 'protect',
          label: 'Protect the Commander',
          description: 'Gain the commander as an Ally',
          effects: {
            allies: 1,
            message: 'You protect your commander and gain them as an Ally.',
          },
        },
      ],
    },
  },

  // Roll 10 - Black ops mission
  {
    id: 'marines-event-10',
    description: 'You are assigned to a black ops mission.',
    resolution: {
      type: 'automatic',
      effects: {
        advancementDM: 2,
        message: 'Your black ops mission is a success. Gain DM+2 to your next advancement roll.',
      },
    },
  },

  // Roll 11 - Commanding officer takes interest
  {
    id: 'marines-event-11',
    description: 'Your commanding officer takes an interest in your career.',
    resolution: {
      type: 'choice',
      displayText: 'Choose your benefit:',
      options: [
        {
          id: 'tactics',
          label: 'Gain Tactics 1',
          description: 'Learn military tactics from your CO',
          effects: {
            skills: { choices: ['Tactics'], level: 1 },
            message: 'Your CO mentors you in military tactics.',
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
    id: 'marines-event-12',
    description: 'You display heroism in battle. You may gain a promotion or a commission automatically.',
    resolution: {
      type: 'automatic',
      effects: {
        autoPromotion: true,
        message: 'Your heroism in battle earns you an automatic promotion or commission!',
      },
    },
  },
];

export const CAREER_MARINES: CareerDefinition = {
  name: 'Marines',
  description: 'Members of the armed fighting forces carried aboard starships, marines deal with piracy and boarding actions in space, defend the starports and bases belonging to the navy and supplement ground forces such as the army.',
  qualification: 'END 6+',
  qualificationTarget: 6,
  qualificationStat: 'endurance',
  commissionTarget: 8, // SOC 8+
  assignments: [
    {
      name: 'Support',
      description: 'You are a quartermaster, engineer or battlefield medic in the marines.',
      survivalStat: 'endurance',
      survivalTarget: 5,
      advancementStat: 'education',
      advancementTarget: 7,
    },
    {
      name: 'Star Marine',
      description: 'You are trained to fight boarding actions and capture enemy vessels.',
      survivalStat: 'endurance',
      survivalTarget: 6,
      advancementStat: 'education',
      advancementTarget: 6,
    },
    {
      name: 'Ground Assault',
      description: 'You are kicked out of a spacecraft in high orbit and told to \'capture that planet\'.',
      survivalStat: 'endurance',
      survivalTarget: 7,
      advancementStat: 'education',
      advancementTarget: 5,
    },
  ],
  skillTables: {
    personalDevelopment: ['Strength +1', 'Dexterity +1', 'Endurance +1', 'Gambler', 'Melee (unarmed)', 'Melee (blade)'],
    serviceSkills: ['Athletics', 'Vacc Suit', 'Tactics', 'Heavy Weapons', 'Gun Combat', 'Stealth'],
    advancedEducation: ['Medic', 'Survival', 'Explosives', 'Engineer', 'Pilot', 'Navigation'],
    officer: ['Electronics', 'Tactics', 'Admin', 'Advocate', 'Diplomat', 'Leadership'],
    specialist: {
      'Support': ['Electronics', 'Mechanic', 'Drive or Flyer', 'Medic', 'Heavy Weapons', 'Gun Combat'],
      'Star Marine': ['Vacc Suit', 'Athletics', 'Gunner', 'Melee (blade)', 'Electronics', 'Gun Combat'],
      'Ground Assault': ['Vacc Suit', 'Heavy Weapons', 'Recon', 'Melee (blade)', 'Tactics (military)', 'Gun Combat'],
    },
  },
  ranks: {
    enlisted: [
      { title: 'Marine', skillBonus: 'Gun Combat' },
      { title: 'Lance Corporal', skillBonus: 'Melee' },
      { title: 'Corporal' },
      { title: 'Lance Sergeant', skillBonus: 'Leadership' },
      { title: 'Sergeant' },
      { title: 'Gunnery Sergeant', bonusStat: 'endurance' },
      { title: 'Sergeant Major' },
    ],
    officer: [
      { title: 'Lieutenant', skillBonus: 'Leadership' },
      { title: 'Captain' },
      { title: 'Force Commander', skillBonus: 'Tactics' },
      { title: 'Lieutenant Colonel' },
      { title: 'Colonel', bonusStat: 'social' },
      { title: 'Brigadier', bonusStat: 'social' },
    ],
  },
  mishapTable: [
    // Mishap 1: Severely injured
    {
      id: 'marines-mishap-1',
      description: 'Severely injured in action (this is the same as a result of 2 on the Injury table). Alternatively, roll twice on the Injury table and take the lower result.',
      resolution: {
        type: 'automatic' as const,
        effects: {
          rollOnTable: 'injury' as const,
          message: 'You are severely injured in action.',
        },
      },
    },
    // Mishap 2: Captured and mistreated
    {
      id: 'marines-mishap-2',
      description: 'A mission goes wrong; you and several others are captured and mistreated by the enemy. Due to your injuries, you are discharged early. Gain your jailer as an Enemy and reduce your STR and DEX by one because of your injuries.',
      resolution: {
        type: 'automatic' as const,
        effects: {
          enemies: 1,
          characteristics: [
            { stat: 'strength' as const, modifier: -1 },
            { stat: 'dexterity' as const, modifier: -1 },
          ],
          message: 'You are captured and mistreated. Gain your jailer as an Enemy. Your STR and DEX are each reduced by 1.',
        },
      },
    },
    // Mishap 3: Stranded behind enemy lines
    {
      id: 'marines-mishap-3',
      description: 'A mission goes wrong and you are stranded behind enemy lines. Increase Stealth or Survival by one level but, due to the mission\'s failure, you are ejected from the service.',
      resolution: {
        type: 'choice' as const,
        choices: [
          {
            id: 'stealth',
            label: 'Gain Stealth',
            description: 'Increase Stealth by one level.',
            effects: {
              skills: { choices: ['Stealth'], level: 1 },
              message: 'You gain Stealth from surviving behind enemy lines, but are ejected from the service.',
            },
          },
          {
            id: 'survival',
            label: 'Gain Survival',
            description: 'Increase Survival by one level.',
            effects: {
              skills: { choices: ['Survival'], level: 1 },
              message: 'You gain Survival from surviving behind enemy lines, but are ejected from the service.',
            },
          },
        ],
      },
    },
    // Mishap 4: Black ops mission against conscience
    {
      id: 'marines-mishap-4',
      description: 'You are ordered to take part in a black ops mission that goes against your conscience. If you refuse you are ejected from the service. If you accept you may stay with the marines but gain the lone survivor as an Enemy.',
      resolution: {
        type: 'choice' as const,
        choices: [
          {
            id: 'accept',
            label: 'Accept the Mission',
            description: 'Stay in the marines but gain an Enemy.',
            effects: {
              enemies: 1,
              continueInCareer: true,
              message: 'You carry out the black ops mission. You may stay with the marines but gain the lone survivor as an Enemy.',
            },
          },
          {
            id: 'refuse',
            label: 'Refuse the Mission',
            description: 'Ejected from the service.',
            effects: {
              message: 'You refuse the mission and are ejected from the service.',
            },
          },
        ],
      },
    },
    // Mishap 5: Tormented by or quarrel with officer
    {
      id: 'marines-mishap-5',
      description: 'You are tormented by or quarrel with an officer or fellow marine. Gain that character as a Rival as they drive you out of the service.',
      resolution: {
        type: 'automatic' as const,
        effects: {
          rivals: 1,
          message: 'You quarrel with an officer or fellow marine. You gain them as a Rival as they drive you out of the service.',
        },
      },
    },
    // Mishap 6: Injured
    {
      id: 'marines-mishap-6',
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
  eventTable: MARINES_EVENTS,
  benefitsTable: MARINES_BENEFITS,
};
