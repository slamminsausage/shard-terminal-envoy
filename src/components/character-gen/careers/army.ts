// ============================================================================
// CAREER: ARMY
// ============================================================================

import type { CareerDefinition } from './types';

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
  eventTable: [
    "Disaster! Roll on the Mishap table but you are not ejected from this career.",
    "Assigned to a planet with a hostile or wild environment. Gain one of Vacc Suit 1, Engineer 1, Animals (riding or training) 1, or Recon 1.",
    "Assigned to an urbanised planet torn by war. Gain one of Stealth 1, Streetwise 1, Persuade 1, or Recon 1.",
    "Given a special assignment or duty in your unit. Gain DM+1 to any one Benefit roll.",
    "Thrown into a brutal ground war. Roll EDU 8+ to avoid injury; if successful, you gain one level in Gun Combat or Leadership.",
    "Life Event. Roll on the Life Events table.",
    "Given advanced training in a specialist field. Roll EDU 8+ to increase any one skill you already have by one level.",
    "Surrounded and outnumbered by the enemy, you hold out until relief arrives. Gain DM+2 to your next advancement roll.",
    "Assigned to a peacekeeping role. Gain one of Admin 1, Investigate 1, Deception 1, or Recon 1.",
    "Your commanding officer takes an interest in your career. Either gain Tactics (military) 1 or DM+4 to your next advancement roll thanks to their aid.",
  ],
};
