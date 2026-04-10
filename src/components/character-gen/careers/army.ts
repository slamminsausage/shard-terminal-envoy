// ============================================================================
// CAREER: ARMY
// ============================================================================

import type { CareerDefinition, GameEvent, BenefitTableRow } from './types';

// Army Benefits Table (1D, results 1-7)
const ARMY_BENEFITS: BenefitTableRow[] = [
  // Roll 1
  { cash: 2000, benefit: { options: [{ type: 'item', itemType: 'cybernetic_implant' }] } },
  // Roll 2
  { cash: 5000, benefit: { options: [{ type: 'characteristic', stat: 'intellect', amount: 1 }] } },
  // Roll 3
  { cash: 10000, benefit: { options: [{ type: 'characteristic', stat: 'education', amount: 1 }] } },
  // Roll 4
  { cash: 10000, benefit: { options: [{ type: 'item', itemType: 'weapon' }] } },
  // Roll 5
  { cash: 10000, benefit: { options: [{ type: 'item', itemType: 'armour' }] } },
  // Roll 6 - END +1 or Cybernetic Implant
  { cash: 20000, benefit: { options: [{ type: 'characteristic', stat: 'endurance', amount: 1 }, { type: 'item', itemType: 'cybernetic_implant' }], isChoice: true } },
  // Roll 7
  { cash: 30000, benefit: { options: [{ type: 'characteristic', stat: 'social', amount: 1 }] } },
];

// Army Events (2D, results 2-12 map to indices 0-10)
const ARMY_EVENTS: GameEvent[] = [
  // Roll 2 - Disaster
  {
    id: 'army-event-2',
    description: 'Disaster! Roll on the Mishap table but you are not ejected from this career.',
    resolution: {
      type: 'table_redirect',
      table: 'mishap',
      displayText: 'Roll on the Mishap table to determine what happens.',
    },
  },

  // Roll 3 - Hostile environment assignment
  {
    id: 'army-event-3',
    description: 'You are assigned to a planet with a hostile or wild environment.',
    resolution: {
      type: 'choice',
      displayText: 'Choose a skill to gain at level 1:',
      options: [
        {
          id: 'vacc-suit',
          label: 'Vacc Suit 1',
          description: 'Environmental suit operations',
          effects: {
            skills: { choices: ['Vacc Suit'], level: 1 },
            message: 'You learned to operate in harsh vacuum environments.',
          },
        },
        {
          id: 'engineer',
          label: 'Engineer 1',
          description: 'Technical engineering skills',
          effects: {
            skills: { choices: ['Engineer'], level: 1 },
            message: 'You gained engineering expertise from maintaining equipment in harsh conditions.',
          },
        },
        {
          id: 'animals-riding',
          label: 'Animals (Riding) 1',
          description: 'Handling and riding animals',
          effects: {
            skills: { choices: ['Animals (Riding)'], level: 1 },
            message: 'You learned to ride and handle animals in the wild environment.',
          },
        },
        {
          id: 'recon',
          label: 'Recon 1',
          description: 'Reconnaissance and scouting',
          effects: {
            skills: { choices: ['Recon'], level: 1 },
            message: 'The hostile environment honed your reconnaissance skills.',
          },
        },
      ],
    },
  },

  // Roll 4 - Urban warfare
  {
    id: 'army-event-4',
    description: 'You are assigned to an urbanised planet torn by war.',
    resolution: {
      type: 'choice',
      displayText: 'Choose a skill to gain at level 1:',
      options: [
        {
          id: 'stealth',
          label: 'Stealth 1',
          description: 'Moving unseen in urban environments',
          effects: {
            skills: { choices: ['Stealth'], level: 1 },
            message: 'You learned to move through war-torn cities undetected.',
          },
        },
        {
          id: 'streetwise',
          label: 'Streetwise 1',
          description: 'Urban survival and contacts',
          effects: {
            skills: { choices: ['Streetwise'], level: 1 },
            message: 'You learned how to navigate the underworld of urban warfare.',
          },
        },
        {
          id: 'persuade',
          label: 'Persuade 1',
          description: 'Convincing others',
          effects: {
            skills: { choices: ['Persuade'], level: 1 },
            message: 'You learned to persuade civilians and negotiate in tense situations.',
          },
        },
        {
          id: 'recon',
          label: 'Recon 1',
          description: 'Urban reconnaissance',
          effects: {
            skills: { choices: ['Recon'], level: 1 },
            message: 'You honed your reconnaissance skills in urban combat zones.',
          },
        },
      ],
    },
  },

  // Roll 5 - Special assignment
  {
    id: 'army-event-5',
    description: 'You are given a special assignment or duty in your unit.',
    resolution: {
      type: 'automatic',
      effects: {
        benefitDM: 1,
        message: 'Your special assignment earns you recognition. Gain DM+1 to any one Benefit roll.',
      },
    },
  },

  // Roll 6 - Brutal ground war
  {
    id: 'army-event-6',
    description: 'You are thrown into a brutal ground war.',
    resolution: {
      type: 'characteristic_roll',
      stat: 'education',
      target: 8,
      displayText: 'Roll EDU 8+ to avoid injury. If successful, gain Gun Combat or Leadership.',
      outcomes: [
        {
          condition: { type: 'success' },
          effects: {
            skills: { choices: ['Gun Combat', 'Leadership'], level: 1 },
            message: 'You survive the brutal war and gain combat experience.',
          },
        },
        {
          condition: { type: 'failure' },
          effects: {
            rollOnTable: 'injury',
            message: 'The brutal combat takes its toll. Roll on the Injury table.',
          },
        },
      ],
    },
  },

  // Roll 7 - Life Event
  {
    id: 'army-event-7',
    description: 'Life Event. Roll on the Life Events table.',
    resolution: {
      type: 'table_redirect',
      table: 'life_events',
      displayText: 'Something significant happens in your personal life.',
    },
  },

  // Roll 8 - Advanced training
  {
    id: 'army-event-8',
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

  // Roll 9 - Hold the line
  {
    id: 'army-event-9',
    description: 'Surrounded and outnumbered by the enemy, you hold out until relief arrives.',
    resolution: {
      type: 'automatic',
      effects: {
        advancementDM: 2,
        message: 'Your heroic stand earns you recognition. Gain DM+2 to your next advancement roll.',
      },
    },
  },

  // Roll 10 - Peacekeeping
  {
    id: 'army-event-10',
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
            message: 'You gained administrative experience managing peacekeeping operations.',
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

  // Roll 11 - Commanding officer's interest
  {
    id: 'army-event-11',
    description: 'Your commanding officer takes an interest in your career.',
    resolution: {
      type: 'choice',
      displayText: 'Choose your benefit:',
      options: [
        {
          id: 'tactics',
          label: 'Gain Tactics (Military) 1',
          description: 'Learn military tactics from your CO',
          effects: {
            skills: { choices: ['Tactics'], level: 1 },
            message: 'Your CO mentors you in military tactics.',
          },
        },
        {
          id: 'advancement',
          label: 'Gain DM+4 to advancement',
          description: 'Your CO puts in a good word for you',
          effects: {
            advancementDM: 4,
            message: 'Your CO\'s recommendation gives you DM+4 to your next advancement roll.',
          },
        },
      ],
    },
  },

  // Roll 12 - Heroism in battle
  {
    id: 'army-event-12',
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

export const CAREER_ARMY: CareerDefinition = {
  name: 'Army',
  description: 'Planetary armed fighting forces. Soldiers deal with planetary surface actions, battles, and campaigns.',
  qualification: 'END 5+',
  qualificationTarget: 5,
  qualificationStat: 'endurance',
  commissionTarget: 8, // SOC 8+
  assignments: [
    {
      name: 'Support',
      description: 'You are an engineer, cook, or in some other role behind the front lines.',
      survivalStat: 'endurance',
      survivalTarget: 5,
      advancementStat: 'education',
      advancementTarget: 7,
    },
    {
      name: 'Infantry',
      description: 'You are one of the Poor Bloody Infantry on the ground.',
      survivalStat: 'strength',
      survivalTarget: 6,
      advancementStat: 'education',
      advancementTarget: 6,
    },
    {
      name: 'Cavalry',
      description: 'You are one of the crew of a gunship or tank.',
      survivalStat: 'dexterity',
      survivalTarget: 7,
      advancementStat: 'intellect',
      advancementTarget: 5,
    },
  ],
  skillTables: {
    personalDevelopment: ['Strength +1', 'Dexterity +1', 'Endurance +1', 'Gambler', 'Medic', 'Melee'],
    serviceSkills: ['Drive', 'Athletics', 'Gun Combat', 'Recon', 'Melee', 'Heavy Weapons'],
    advancedEducation: ['Tactics', 'Electronics', 'Navigation', 'Explosives', 'Engineer', 'Survival'],
    officer: ['Tactics', 'Leadership', 'Advocate', 'Diplomat', 'Electronics', 'Admin'],
    specialist: {
      'Support': ['Mechanic', 'Drive', 'Profession', 'Explosives', 'Electronics', 'Medic'],
      'Infantry': ['Gun Combat', 'Melee', 'Heavy Weapons', 'Stealth', 'Athletics', 'Recon'],
      'Cavalry': ['Mechanic', 'Drive', 'Flyer', 'Recon', 'Heavy Weapons', 'Electronics'],
    },
  },
  ranks: {
    enlisted: [
      { title: 'Private', skillBonus: 'Gun Combat' },
      { title: 'Lance Corporal', skillBonus: 'Recon' },
      { title: 'Corporal' },
      { title: 'Lance Sergeant', skillBonus: 'Leadership' },
      { title: 'Sergeant' },
      { title: 'Gunnery Sergeant' },
      { title: 'Sergeant Major' },
    ],
    officer: [
      { title: 'Lieutenant', skillBonus: 'Leadership' },
      { title: 'Captain' },
      { title: 'Major', skillBonus: 'Tactics' },
      { title: 'Lieutenant Colonel' },
      { title: 'Colonel' },
      { title: 'General', bonusStat: 'social', bonusStatFloor: 10 },
    ],
  },
  mishapTable: [
    // Mishap 1: Severely injured
    {
      id: 'army-mishap-1',
      description: 'Severely injured in action. Roll on the Injury table.',
      resolution: {
        type: 'automatic' as const,
        effects: {
          rollOnTable: 'injury' as const,
          message: 'You are severely injured in action.',
        },
      },
    },
    // Mishap 2: Unit slaughtered
    {
      id: 'army-mishap-2',
      description: 'Your unit is slaughtered in a disastrous battle, for which you blame your commander. Gain them as an Enemy as they have you removed from the service.',
      resolution: {
        type: 'automatic' as const,
        effects: {
          enemies: 1,
          message: 'Your unit is slaughtered in a disastrous battle. You blame your commander and gain them as an Enemy.',
        },
      },
    },
    // Mishap 3: Guerrilla fighters
    {
      id: 'army-mishap-3',
      description: 'Sent to a very unpleasant region to battle against guerrilla fighters and rebels. Discharged due to stress, injury, or government cover-up. Gain a level in Recon or Survival but also gain the rebels as an Enemy.',
      resolution: {
        type: 'choice' as const,
        choices: [
          {
            id: 'recon',
            label: 'Gain Recon',
            description: 'Increase Recon by one level.',
            effects: {
              skills: { choices: ['Recon'], level: 1 },
              enemies: 1,
              message: 'You gain Recon from your experience fighting guerrillas, but gain the rebels as an Enemy.',
            },
          },
          {
            id: 'survival',
            label: 'Gain Survival',
            description: 'Increase Survival by one level.',
            effects: {
              skills: { choices: ['Survival'], level: 1 },
              enemies: 1,
              message: 'You gain Survival from your experience fighting guerrillas, but gain the rebels as an Enemy.',
            },
          },
        ],
      },
    },
    // Mishap 4: CO illegal activity
    {
      id: 'army-mishap-4',
      description: 'Discover your commanding officer is engaged in illegal activity. You can join their ring or co-operate with the military police.',
      resolution: {
        type: 'choice' as const,
        choices: [
          {
            id: 'join',
            label: 'Join the Ring',
            description: 'Gain your CO as an Ally. Keep your Benefit roll from this term.',
            effects: {
              allies: 1,
              extraBenefit: true,
              message: 'You join the ring and gain your CO as an Ally. You keep your Benefit roll from this term.',
            },
          },
          {
            id: 'report',
            label: 'Co-operate with Military Police',
            description: 'Discharged. Keep your Benefit roll from this term.',
            effects: {
              extraBenefit: true,
              message: 'You co-operate with the military police. You are discharged but keep your Benefit roll from this term.',
            },
          },
        ],
      },
    },
    // Mishap 5: Quarrel with officer
    {
      id: 'army-mishap-5',
      description: 'Tormented by or quarrel with an officer or fellow soldier. Gain that officer as a Rival as they drive you out of the service.',
      resolution: {
        type: 'automatic' as const,
        effects: {
          rivals: 1,
          message: 'You quarrel with an officer or fellow soldier. You gain them as a Rival as they drive you out of the service.',
        },
      },
    },
    // Mishap 6: Injured
    {
      id: 'army-mishap-6',
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
  eventTable: ARMY_EVENTS,
  benefitsTable: ARMY_BENEFITS,
};
