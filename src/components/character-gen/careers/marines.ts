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
      table: 'injury',
      displayText: 'Roll on the Injury table to determine the severity of the disaster.',
    },
  },

  // Roll 3 - Space station security
  {
    id: 'marines-event-3',
    description: 'You are assigned to the security staff of a space station.',
    resolution: {
      type: 'choice',
      displayText: 'Increase one of these skills:',
      options: [
        {
          id: 'vacc-suit',
          label: 'Vacc Suit 1',
          description: 'Environmental suit operations',
          effects: {
            skills: { choices: ['Vacc Suit'], level: 1 },
            message: 'Station duty improved your vacuum suit skills.',
          },
        },
        {
          id: 'athletics',
          label: 'Athletics 1',
          description: 'Physical fitness',
          effects: {
            skills: { choices: ['Athletics'], level: 1 },
            message: 'Security patrols kept you in peak physical condition.',
          },
        },
      ],
    },
  },

  // Roll 4 - Assault landing
  {
    id: 'marines-event-4',
    description: 'You take part in a notable assault landing.',
    resolution: {
      type: 'choice',
      displayText: 'Choose a skill to gain at level 1:',
      options: [
        {
          id: 'tactics',
          label: 'Tactics 1',
          description: 'Combat tactics',
          effects: {
            skills: { choices: ['Tactics'], level: 1 },
            message: 'The assault landing taught you valuable tactical lessons.',
          },
        },
        {
          id: 'recon',
          label: 'Recon 1',
          description: 'Reconnaissance',
          effects: {
            skills: { choices: ['Recon'], level: 1 },
            message: 'You learned to scout landing zones effectively.',
          },
        },
        {
          id: 'vacc-suit',
          label: 'Vacc Suit 1',
          description: 'Environmental suit operations',
          effects: {
            skills: { choices: ['Vacc Suit'], level: 1 },
            message: 'The orbital drop improved your vacuum suit skills.',
          },
        },
        {
          id: 'heavy-weapons',
          label: 'Heavy Weapons 1',
          description: 'Heavy weapons operation',
          effects: {
            skills: { choices: ['Heavy Weapons'], level: 1 },
            message: 'You gained experience with assault weaponry.',
          },
        },
      ],
    },
  },

  // Roll 5 - Peacekeeping
  {
    id: 'marines-event-5',
    description: 'You are assigned to a peacekeeping role.',
    resolution: {
      type: 'choice',
      displayText: 'Choose a skill to gain at level 1:',
      options: [
        {
          id: 'admin',
          label: 'Admin 1',
          description: 'Administrative duties',
          effects: {
            skills: { choices: ['Admin'], level: 1 },
            message: 'Peacekeeping operations taught you administrative skills.',
          },
        },
        {
          id: 'investigate',
          label: 'Investigate 1',
          description: 'Investigation skills',
          effects: {
            skills: { choices: ['Investigate'], level: 1 },
            message: 'You learned investigation techniques during peacekeeping.',
          },
        },
        {
          id: 'deception',
          label: 'Deception 1',
          description: 'Deception and misdirection',
          effects: {
            skills: { choices: ['Deception'], level: 1 },
            message: 'Peacekeeping taught you the value of careful deception.',
          },
        },
        {
          id: 'recon',
          label: 'Recon 1',
          description: 'Reconnaissance',
          effects: {
            skills: { choices: ['Recon'], level: 1 },
            message: 'Patrol duties honed your reconnaissance abilities.',
          },
        },
      ],
    },
  },

  // Roll 6 - Lead to safety
  {
    id: 'marines-event-6',
    description: 'You are thrown into a dangerous situation and lead your fellow Marines to safety.',
    resolution: {
      type: 'automatic',
      effects: {
        message: 'Your leadership in crisis earns you recognition. Gain DM+2 to your next advancement roll.',
      },
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

  // Roll 8 - Advanced training
  {
    id: 'marines-event-8',
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

  // Roll 9 - Cross-training
  {
    id: 'marines-event-9',
    description: 'You receive cross-training in another area.',
    resolution: {
      type: 'choice',
      displayText: 'Gain one level in a skill from another Marine assignment:',
      options: [
        {
          id: 'mechanic',
          label: 'Mechanic 1',
          description: 'Equipment maintenance (Support)',
          effects: {
            skills: { choices: ['Mechanic'], level: 1 },
            message: 'Cross-training in support taught you equipment maintenance.',
          },
        },
        {
          id: 'vacc-suit',
          label: 'Vacc Suit 1',
          description: 'Zero-G operations (Star Marine)',
          effects: {
            skills: { choices: ['Vacc Suit'], level: 1 },
            message: 'Cross-training with Star Marines improved your vacuum suit skills.',
          },
        },
        {
          id: 'heavy-weapons',
          label: 'Heavy Weapons 1',
          description: 'Heavy weapons (Ground Assault)',
          effects: {
            skills: { choices: ['Heavy Weapons'], level: 1 },
            message: 'Cross-training with Ground Assault taught you heavy weapons.',
          },
        },
        {
          id: 'medic',
          label: 'Medic 1',
          description: 'Field medicine (Support)',
          effects: {
            skills: { choices: ['Medic'], level: 1 },
            message: 'Cross-training taught you field medicine.',
          },
        },
      ],
    },
  },

  // Roll 10 - Starship assignment
  {
    id: 'marines-event-10',
    description: 'You are assigned to a starship for an extended mission.',
    resolution: {
      type: 'choice',
      displayText: 'Choose a skill to gain at level 1:',
      options: [
        {
          id: 'pilot',
          label: 'Pilot 1',
          description: 'Piloting skills',
          effects: {
            skills: { choices: ['Pilot'], level: 1 },
            message: 'Shipboard duty taught you piloting basics.',
          },
        },
        {
          id: 'gunner',
          label: 'Gunner 1',
          description: 'Ship weapons',
          effects: {
            skills: { choices: ['Gunner'], level: 1 },
            message: 'You gained experience with ship weapons systems.',
          },
        },
        {
          id: 'sensors',
          label: 'Electronics (Sensors) 1',
          description: 'Sensor operations',
          effects: {
            skills: { choices: ['Electronics (Sensors)'], level: 1 },
            message: 'You learned to operate ship sensor systems.',
          },
        },
        {
          id: 'mechanic',
          label: 'Mechanic 1',
          description: 'Ship maintenance',
          effects: {
            skills: { choices: ['Mechanic'], level: 1 },
            message: 'Shipboard duty taught you maintenance skills.',
          },
        },
      ],
    },
  },

  // Roll 11 - Leadership in combat
  {
    id: 'marines-event-11',
    description: 'You show leadership and courage in combat.',
    resolution: {
      type: 'choice',
      displayText: 'Your courage is recognized:',
      options: [
        {
          id: 'promotion',
          label: 'Automatic Promotion',
          description: 'You are automatically promoted',
          effects: {
            message: 'Your leadership earns you an automatic promotion!',
          },
        },
        {
          id: 'advancement',
          label: 'DM+4 to Advancement',
          description: 'Gain a significant advantage on advancement',
          effects: {
            message: 'Your courage is noted in your service record. Gain DM+4 to your next advancement roll.',
          },
        },
      ],
    },
  },
];

export const CAREER_MARINES: CareerDefinition = {
  name: 'Marines',
  description: 'Elite forces trained for boarding actions, ship security, and planetary assault.',
  qualification: 'END 6+',
  qualificationTarget: 6,
  qualificationStat: 'endurance',
  commissionTarget: 8, // SOC 8+
  assignments: [
    {
      name: 'Support',
      description: 'You are a quartermaster, engineer, or battlefield medic.',
      survivalStat: 'endurance',
      survivalTarget: 5,
      advancementStat: 'education',
      advancementTarget: 7,
    },
    {
      name: 'Star Marine',
      description: 'You are trained for ship boarding and zero-G combat.',
      survivalStat: 'endurance',
      survivalTarget: 6,
      advancementStat: 'education',
      advancementTarget: 6,
    },
    {
      name: 'Ground Assault',
      description: 'You are part of the planetary assault forces.',
      survivalStat: 'endurance',
      survivalTarget: 7,
      advancementStat: 'education',
      advancementTarget: 5,
    },
  ],
  skillTables: {
    personalDevelopment: ['Strength +1', 'Dexterity +1', 'Endurance +1', 'Gambler', 'Melee', 'Blade Combat'],
    serviceSkills: ['Athletics', 'Vacc Suit', 'Tactics', 'Heavy Weapons', 'Gun Combat', 'Stealth'],
    advancedEducation: ['Medic', 'Survival', 'Explosives', 'Engineer', 'Pilot', 'Navigation'],
    officer: ['Tactics', 'Leadership', 'Advocate', 'Vacc Suit', 'Electronics', 'Admin'],
    specialist: {
      'Support': ['Mechanic', 'Drive', 'Profession', 'Explosives', 'Medic', 'Electronics'],
      'Star Marine': ['Vacc Suit', 'Athletics', 'Gunner', 'Melee', 'Gun Combat', 'Electronics'],
      'Ground Assault': ['Vacc Suit', 'Heavy Weapons', 'Recon', 'Melee', 'Tactics', 'Gun Combat'],
    },
  },
  ranks: {
    enlisted: [
      { title: 'Marine', skillBonus: 'Gun Combat' },
      { title: 'Lance Corporal', skillBonus: 'Blade Combat' },
      { title: 'Corporal' },
      { title: 'Lance Sergeant', skillBonus: 'Leadership' },
      { title: 'Sergeant' },
      { title: 'Gunnery Sergeant', skillBonus: 'Tactics' },
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
      description: 'Severely injured in action. Roll on the Injury table.',
      resolution: {
        type: 'automatic' as const,
        effects: {
          rollOnTable: 'injury' as const,
          message: 'You are severely injured in action.',
        },
      },
    },
    // Mishap 2: Commander's error
    {
      id: 'marines-mishap-2',
      description: 'A mission goes disastrously wrong due to your commander\'s error or incompetence, but you survive. Gain them as an Enemy and leave the service.',
      resolution: {
        type: 'automatic' as const,
        effects: {
          enemies: 1,
          message: 'A mission goes disastrously wrong due to your commander\'s error. You gain them as an Enemy.',
        },
      },
    },
    // Mishap 3: Taken prisoner
    {
      id: 'marines-mishap-3',
      description: 'You are taken prisoner during an operation. Gain Survival 1 or Deception 1, but also gain your captors as an Enemy.',
      resolution: {
        type: 'choice' as const,
        choices: [
          {
            id: 'survival',
            label: 'Gain Survival',
            description: 'Increase Survival by one level.',
            effects: {
              skills: { choices: ['Survival'], level: 1 },
              enemies: 1,
              message: 'You survive captivity and gain Survival, but gain your captors as an Enemy.',
            },
          },
          {
            id: 'deception',
            label: 'Gain Deception',
            description: 'Increase Deception by one level.',
            effects: {
              skills: { choices: ['Deception'], level: 1 },
              enemies: 1,
              message: 'You escape captivity through guile and gain Deception, but gain your captors as an Enemy.',
            },
          },
        ],
      },
    },
    // Mishap 4: Black ops mission
    {
      id: 'marines-mishap-4',
      description: 'You are assigned to a black ops mission that goes against your conscience. Either carry it out or refuse.',
      resolution: {
        type: 'choice' as const,
        choices: [
          {
            id: 'carry_out',
            label: 'Carry It Out',
            description: 'Keep the Benefit roll from this term but gain an Enemy.',
            effects: {
              enemies: 1,
              extraBenefit: true,
              message: 'You carry out the mission. You keep your Benefit roll but gain an Enemy.',
            },
          },
          {
            id: 'refuse',
            label: 'Refuse',
            description: 'Ejected from the service.',
            effects: {
              message: 'You refuse the mission and are ejected from the service.',
            },
          },
        ],
      },
    },
    // Mishap 5: Blamed for accident
    {
      id: 'marines-mishap-5',
      description: 'You are blamed for an accident that kills several comrades. Gain an Enemy and leave the service.',
      resolution: {
        type: 'automatic' as const,
        effects: {
          enemies: 1,
          message: 'You are blamed for an accident that kills several comrades. You gain an Enemy.',
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
