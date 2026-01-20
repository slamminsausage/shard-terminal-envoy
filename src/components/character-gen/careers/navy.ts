// ============================================================================
// CAREER: NAVY
// ============================================================================

import type { CareerDefinition } from './types';

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
  eventTable: [
    "Disaster! Roll on the Mishap table but you are not ejected from this career.",
    "You are assigned to a patrol far from the naval bases. Increase any one of these skills by one level: Sensors, Survival, Recon, or Pilot.",
    "You are assigned to an important duty station. Gain DM+1 to advancement rolls this term.",
    "You receive specialist training. Gain one level in any skill you already have.",
    "You save a comrade in battle. Gain an Ally and DM+2 to your next advancement roll.",
    "Life Event. Roll on the Life Events table.",
    "You are given advanced training in a specialist field. Roll EDU 8+ to increase any one skill you already have by one level.",
    "You are given a special assignment. Gain DM+1 to any one Benefit roll.",
    "You are assigned to a ship with an experienced, renowned commander. Gain one of Leadership 1, Tactics 1, Pilot 1, or Gunner 1.",
    "You show exceptional bravery during combat. Automatically promoted or gain DM+4 to your next advancement roll.",
  ],
};
