// ============================================================================
// CAREER: AGENT
// ============================================================================

import type { CareerDefinition } from './types';

export const CAREER_AGENT: CareerDefinition = {
  name: 'Agent',
  description: 'Law enforcement agencies, corporate operatives, spies and others who work in the shadows.',
  qualification: 'INT 6+',
  qualificationTarget: 6,
  qualificationStat: 'intellect',
  assignments: [
    {
      name: 'Law Enforcement',
      description: 'You are a police officer or detective.',
      survivalStat: 'endurance',
      survivalTarget: 6,
      advancementStat: 'intellect',
      advancementTarget: 6,
    },
    {
      name: 'Intelligence',
      description: 'You work as a spy or saboteur.',
      survivalStat: 'intellect',
      survivalTarget: 7,
      advancementStat: 'intellect',
      advancementTarget: 5,
    },
    {
      name: 'Corporate',
      description: 'You work for a corporation, spying on rival organisations.',
      survivalStat: 'intellect',
      survivalTarget: 5,
      advancementStat: 'intellect',
      advancementTarget: 7,
    },
  ],
  skillTables: {
    personalDevelopment: ['Gun Combat', 'Dexterity +1', 'Endurance +1', 'Melee', 'Intellect +1', 'Athletics'],
    serviceSkills: ['Streetwise', 'Drive', 'Investigate', 'Flyer', 'Recon', 'Gun Combat'],
    advancedEducation: ['Advocate', 'Language', 'Explosives', 'Medic', 'Vacc Suit', 'Electronics'],
    specialist: {
      'Law Enforcement': ['Investigate', 'Recon', 'Streetwise', 'Stealth', 'Melee', 'Advocate'],
      'Intelligence': ['Investigate', 'Recon', 'Deception', 'Stealth', 'Persuade', 'Carouse'],
      'Corporate': ['Investigate', 'Electronics', 'Stealth', 'Carouse', 'Deception', 'Streetwise'],
    },
  },
  ranks: {
    enlisted: [
      { title: 'Rookie' },
      { title: 'Corporal', skillBonus: 'Streetwise' },
      { title: 'Sergeant' },
      { title: 'Detective' },
      { title: 'Lieutenant', skillBonus: 'Investigate' },
      { title: 'Chief', skillBonus: 'Admin' },
      { title: 'Commissioner', bonusStat: 'social' },
    ],
  },
  mishapTable: [
    "Severely injured. Roll twice on the Injury table and take the lower result.",
    "A criminal or other figure under investigation offers you a deal. Accept and you leave this career with a +4 DM to your next Qualification roll but gain a Rival. Refuse and you must roll twice on the Injury table and take the lower result.",
    "An investigation goes critically wrong or leads to the bottom of a conspiracy. Roll Advocate 8+. If you succeed, you may continue in this career. If you fail, you must leave this career.",
    "You learn something you should not know. Gain an Enemy and then roll twice on the Injury table (take both results).",
    "Your work ends up coming home with you and someone gets hurt. Gain an Enemy.",
    "Injured. Roll on the Injury table.",
  ],
  eventTable: [
    "Disaster! Roll on the Mishap table but you are not ejected from this career.",
    "An investigation takes on a dangerous turn. Roll Investigate 8+ or Streetwise 8+. If you fail, roll on the Mishap table. If you succeed, increase one of these skills by one level: Deception, Jack-of-all-Trades, Persuade or Tactics.",
    "You complete a mission for your superiors and are suitably rewarded. Gain DM+1 to any one Benefit roll from this career.",
    "You establish a network of contacts. Gain D3 Contacts.",
    "You are given advanced training in a specialist field. Roll EDU 8+ to increase any one skill you already have by one level.",
    "Life Event. Roll on the Life Events table.",
    "You go undercover to investigate an enemy. Roll Deception 8+. If you succeed, roll immediately on the Rogue or Citizen Events table and make one roll on any Specialist skill table for that career. If you fail, roll immediately on the Rogue or Citizen Mishap table.",
    "You go above and beyond the call of duty. Gain DM+2 to your next advancement roll.",
    "You are given specialist training in vehicles. Gain one of Drive 1, Flyer 1, Pilot 1 or Gunner 1.",
    "You are befriended by a senior agent. Either increase Investigate by one level or DM+4 to an advancement roll thanks to their aid.",
  ],
};
