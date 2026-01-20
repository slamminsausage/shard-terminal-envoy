// ============================================================================
// CAREER: MARINES
// ============================================================================

import type { CareerDefinition } from './types';

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
      { title: 'Colonel' },
      { title: 'Brigadier', bonusStat: 'social' },
    ],
  },
  mishapTable: [
    "Severely injured in action. Roll twice on the Injury table and take the lower result.",
    "A mission goes disastrously wrong due to your commander's error or incompetence, but you survive. Gain them as an Enemy and leave the service.",
    "You are taken prisoner during an operation. Gain Survival 1 or Deception 1, but also gain your captors as an Enemy.",
    "You are assigned to a black ops mission that goes against your conscience. Either carry it out (keep the Benefit roll from this term but gain an Enemy) or refuse and be ejected from the service.",
    "You are blamed for an accident that kills several comrades. Gain them as Enemy and leave the service.",
    "Injured. Roll on the Injury table.",
  ],
  eventTable: [
    "Disaster! Roll on the Mishap table but you are not ejected from this career.",
    "You are assigned to the security staff of a space station. Increase Vacc Suit or Athletics.",
    "You take part in a notable assault landing. Gain one of Tactics 1, Recon 1, Vacc Suit 1, or Heavy Weapons 1.",
    "You are assigned to a peacekeeping role. Gain one of Admin 1, Investigate 1, Deception 1, or Recon 1.",
    "You are thrown into a dangerous situation and lead your fellow Marines to safety. Gain DM+2 to your next advancement roll.",
    "Life Event. Roll on the Life Events table.",
    "You are given advanced training in a specialist field. Roll EDU 8+ to increase any one skill you already have by one level.",
    "You receive cross-training in another area. Gain one level in any skill on a Service Skill table for another assignment of the Marine career.",
    "You are assigned to a starship for an extended mission. Gain one of Pilot 1, Gunner 1, Sensors 1, or Mechanic 1.",
    "You show leadership and courage in combat. Automatically promoted or gain DM+4 to your next advancement roll.",
  ],
};
