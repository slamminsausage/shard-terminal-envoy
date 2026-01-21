// ============================================================================
// CAREER: NAVY
// ============================================================================

import type { CareerDefinition, GameEvent } from './types';

// Navy Events (2D, results 2-12 map to indices 0-10)
const NAVY_EVENTS: GameEvent[] = [
  // Roll 2 - Disaster
  {
    id: 'navy-event-2',
    description: 'Disaster! Roll on the Mishap table but you are not ejected from this career.',
    resolution: {
      type: 'table_redirect',
      table: 'injury',
      displayText: 'Roll on the Injury table to determine the severity of the disaster.',
    },
  },

  // Roll 3 - Far patrol
  {
    id: 'navy-event-3',
    description: 'You are assigned to a patrol far from the naval bases.',
    resolution: {
      type: 'choice',
      displayText: 'Increase one of these skills by one level:',
      options: [
        {
          id: 'sensors',
          label: 'Sensors 1',
          description: 'Electronic sensor operations',
          effects: {
            skills: { choices: ['Electronics (Sensors)'], level: 1 },
            message: 'Long-range patrol sharpened your sensor skills.',
          },
        },
        {
          id: 'survival',
          label: 'Survival 1',
          description: 'Survival techniques',
          effects: {
            skills: { choices: ['Survival'], level: 1 },
            message: 'Extended patrols taught you to make do with limited resources.',
          },
        },
        {
          id: 'recon',
          label: 'Recon 1',
          description: 'Reconnaissance',
          effects: {
            skills: { choices: ['Recon'], level: 1 },
            message: 'Patrol duty improved your reconnaissance abilities.',
          },
        },
        {
          id: 'pilot',
          label: 'Pilot 1',
          description: 'Piloting spacecraft',
          effects: {
            skills: { choices: ['Pilot'], level: 1 },
            message: 'Extended space operations refined your piloting skills.',
          },
        },
      ],
    },
  },

  // Roll 4 - Important duty station
  {
    id: 'navy-event-4',
    description: 'You are assigned to an important duty station.',
    resolution: {
      type: 'automatic',
      effects: {
        message: 'Your important posting earns you recognition. Gain DM+1 to advancement rolls this term.',
      },
    },
  },

  // Roll 5 - Specialist training
  {
    id: 'navy-event-5',
    description: 'You receive specialist training.',
    resolution: {
      type: 'automatic',
      effects: {
        skills: { anySkill: true, level: 1, requireExisting: true },
        message: 'Your specialist training pays off. Gain one level in any skill you already have.',
      },
    },
  },

  // Roll 6 - Save a comrade
  {
    id: 'navy-event-6',
    description: 'You save a comrade in battle.',
    resolution: {
      type: 'automatic',
      effects: {
        allies: 1,
        message: 'Your bravery earns you a loyal friend. Gain an Ally and DM+2 to your next advancement roll.',
      },
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

  // Roll 8 - Advanced training
  {
    id: 'navy-event-8',
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

  // Roll 9 - Special assignment
  {
    id: 'navy-event-9',
    description: 'You are given a special assignment.',
    resolution: {
      type: 'automatic',
      effects: {
        benefitDM: 1,
        message: 'Your special assignment is rewarded. Gain DM+1 to any one Benefit roll.',
      },
    },
  },

  // Roll 10 - Renowned commander
  {
    id: 'navy-event-10',
    description: 'You are assigned to a ship with an experienced, renowned commander.',
    resolution: {
      type: 'choice',
      displayText: 'Learn from the commander. Choose a skill to gain at level 1:',
      options: [
        {
          id: 'leadership',
          label: 'Leadership 1',
          description: 'Command and leadership',
          effects: {
            skills: { choices: ['Leadership'], level: 1 },
            message: 'You learn valuable leadership lessons from the renowned commander.',
          },
        },
        {
          id: 'tactics',
          label: 'Tactics 1',
          description: 'Naval tactics',
          effects: {
            skills: { choices: ['Tactics'], level: 1 },
            message: 'The commander\'s tactical expertise rubs off on you.',
          },
        },
        {
          id: 'pilot',
          label: 'Pilot 1',
          description: 'Piloting skills',
          effects: {
            skills: { choices: ['Pilot'], level: 1 },
            message: 'You pick up advanced piloting techniques.',
          },
        },
        {
          id: 'gunner',
          label: 'Gunner 1',
          description: 'Weapons systems',
          effects: {
            skills: { choices: ['Gunner'], level: 1 },
            message: 'You gain experience with ship weapons systems.',
          },
        },
      ],
    },
  },

  // Roll 11 - Exceptional bravery
  {
    id: 'navy-event-11',
    description: 'You show exceptional bravery during combat.',
    resolution: {
      type: 'choice',
      displayText: 'Your bravery is recognized:',
      options: [
        {
          id: 'promotion',
          label: 'Automatic Promotion',
          description: 'You are automatically promoted',
          effects: {
            message: 'Your exceptional bravery earns you an automatic promotion!',
          },
        },
        {
          id: 'advancement',
          label: 'DM+4 to Advancement',
          description: 'Gain a significant advantage on advancement',
          effects: {
            message: 'Your bravery is noted in your service record. Gain DM+4 to your next advancement roll.',
          },
        },
      ],
    },
  },
];

export const CAREER_NAVY: CareerDefinition = {
  name: 'Navy',
  description: 'The interstellar navy, serving aboard mighty warships patrolling the space lanes.',
  qualification: 'INT 6+',
  qualificationTarget: 6,
  qualificationStat: 'intellect',
  commissionTarget: 8, // SOC 8+
  assignments: [
    {
      name: 'Line/Crew',
      description: 'You are a general crew member or line officer.',
      survivalStat: 'intellect',
      survivalTarget: 5,
      advancementStat: 'education',
      advancementTarget: 7,
    },
    {
      name: 'Engineer/Gunner',
      description: 'You serve in Engineering or as a weapons specialist.',
      survivalStat: 'intellect',
      survivalTarget: 6,
      advancementStat: 'education',
      advancementTarget: 6,
    },
    {
      name: 'Flight',
      description: 'You are a pilot or navigator.',
      survivalStat: 'dexterity',
      survivalTarget: 7,
      advancementStat: 'education',
      advancementTarget: 5,
    },
  ],
  skillTables: {
    personalDevelopment: ['Strength +1', 'Dexterity +1', 'Endurance +1', 'Intellect +1', 'Education +1', 'Social +1'],
    serviceSkills: ['Pilot', 'Vacc Suit', 'Athletics', 'Gunner', 'Mechanic', 'Gun Combat'],
    advancedEducation: ['Electronics', 'Astrogation', 'Engineer', 'Drive', 'Navigation', 'Admin'],
    officer: ['Leadership', 'Electronics', 'Pilot', 'Melee', 'Tactics', 'Admin'],
    specialist: {
      'Line/Crew': ['Electronics', 'Mechanic', 'Gun Combat', 'Melee', 'Vacc Suit', 'Discipline'],
      'Engineer/Gunner': ['Engineer', 'Mechanic', 'Electronics', 'Engineer', 'Gunner', 'Flyer'],
      'Flight': ['Pilot', 'Flyer', 'Gunner', 'Pilot', 'Astrogation', 'Electronics'],
    },
  },
  ranks: {
    enlisted: [
      { title: 'Crewman', skillBonus: 'Mechanic' },
      { title: 'Able Spacehand' },
      { title: 'Petty Officer', skillBonus: 'Vacc Suit' },
      { title: 'Chief Petty Officer' },
      { title: 'Master Chief' },
      { title: 'Warrant Officer' },
      { title: 'Command Warrant Officer' },
    ],
    officer: [
      { title: 'Ensign', skillBonus: 'Melee' },
      { title: 'Sublieutenant', skillBonus: 'Leadership' },
      { title: 'Lieutenant' },
      { title: 'Commander', skillBonus: 'Tactics' },
      { title: 'Captain' },
      { title: 'Commodore', bonusStat: 'social' },
      { title: 'Admiral', bonusStat: 'social' },
    ],
  },
  mishapTable: [
    "Severely injured in action. Roll twice on the Injury table and take the lower result.",
    "You are placed in the frozen watch (cryogenically stored on board ship) and revived improperly. Reduce STR, DEX, or END by 1.",
    "During a battle, defeat or victory depends on your actions. You failed. Gain an Enemy and leave the service.",
    "You are court martialed for an offence. You may keep the Benefit roll from this term but leave the service. If the court martial was unjust, gain an Enemy. Otherwise, the decision was fair.",
    "You are tormented by or quarrel with an officer. Gain that officer as a Rival as they force you out.",
    "Injured. Roll on the Injury table.",
  ],
  eventTable: NAVY_EVENTS,
};
