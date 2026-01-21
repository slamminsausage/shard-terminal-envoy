// ============================================================================
// CAREER: ARMY
// ============================================================================

import type { CareerDefinition, GameEvent } from './types';

// Army Events (2D, results 2-12 map to indices 0-10)
const ARMY_EVENTS: GameEvent[] = [
  // Roll 2 - Disaster
  {
    id: 'army-event-2',
    description: 'Disaster! Roll on the Mishap table but you are not ejected from this career.',
    resolution: {
      type: 'table_redirect',
      table: 'injury',
      displayText: 'Roll on the Injury table to determine the severity of the disaster.',
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
            message: 'Your CO\'s recommendation gives you DM+4 to your next advancement roll.',
          },
        },
      ],
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
      { title: 'General', bonusStat: 'social' },
    ],
  },
  mishapTable: [
    "Severely injured in action (same as result of 2 on Injury table). Alternatively, roll twice on the Injury table and take the lower result.",
    "Your unit is slaughtered in a disastrous battle, for which you blame your commander. Gain them as an Enemy as they have you removed from the service.",
    "Sent to a very unpleasant region to battle against guerrilla fighters and rebels. Discharged due to stress, injury, or government cover-up. Increase Recon or Survival by one level, but also gain the rebels as an Enemy.",
    "Discover your commanding officer is engaged in illegal activity (e.g., weapon smuggling). You can join their ring (gain them as an Ally before being discharged, but keep your Benefit roll from this term) or co-operate with the military police (discharged anyway, but keep your Benefit roll from this term).",
    "Tormented by or quarrel with an officer or fellow soldier. Gain that officer as a Rival as they drive you out of the service.",
    "Injured. Roll on the Injury table.",
  ],
  eventTable: ARMY_EVENTS,
};
