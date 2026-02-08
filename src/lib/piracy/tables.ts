import {
  PortAttitude,
  PortAttitudeConfig,
  CrewPosition,
  CrewSkillLevel,
  CrewSkillLevelConfig,
  StandingEffect,
  StandingEffectConfig,
  PreyType,
} from '@/types/piracy';

// === Port Attitude Configurations ===

export const PORT_ATTITUDE_CONFIG: Record<PortAttitude, PortAttitudeConfig> = {
  haven: {
    label: 'Haven',
    fencePercent: 30,
    recruitmentTarget: 3,
    arrestRiskTarget: null,
    spyRiskTarget: 12,
    protectionTarget: 3,
  },
  friendly: {
    label: 'Friendly',
    fencePercent: 25,
    recruitmentTarget: 5,
    arrestRiskTarget: null,
    spyRiskTarget: 12,
    protectionTarget: 7,
  },
  tolerant: {
    label: 'Tolerant',
    fencePercent: 20,
    recruitmentTarget: 7,
    arrestRiskTarget: 12,
    spyRiskTarget: 10,
    protectionTarget: 11,
  },
  neutral: {
    label: 'Neutral',
    fencePercent: 10,
    recruitmentTarget: 9,
    arrestRiskTarget: 12,
    spyRiskTarget: 10,
    protectionTarget: null,
  },
  suspicious: {
    label: 'Suspicious',
    fencePercent: 10,
    recruitmentTarget: 11,
    arrestRiskTarget: 10,
    spyRiskTarget: 8,
    protectionTarget: null,
  },
  unfriendly: {
    label: 'Unfriendly',
    fencePercent: 0,
    recruitmentTarget: 12,
    arrestRiskTarget: 10,
    spyRiskTarget: 8,
    protectionTarget: null,
  },
  hostile: {
    label: 'Hostile',
    fencePercent: 0,
    recruitmentTarget: null,
    arrestRiskTarget: 2,
    spyRiskTarget: 2,
    protectionTarget: null,
  },
};

export const PORT_ATTITUDE_ORDER: PortAttitude[] = [
  'haven', 'friendly', 'tolerant', 'neutral', 'suspicious', 'unfriendly', 'hostile'
];

// Determine default attitude from law level
export function getDefaultAttitudeFromLawLevel(lawLevel: number): PortAttitude {
  if (lawLevel <= 2) return 'tolerant';
  if (lawLevel <= 5) return 'neutral';
  if (lawLevel <= 9) return 'suspicious';
  if (lawLevel <= 11) return 'unfriendly';
  return 'hostile';
}

// === Crew Position Configs ===

export const CREW_POSITION_CONFIG: Record<CrewPosition, { label: string; baseSalary: number; keySkills: string }> = {
  pilot: { label: 'Pilot', baseSalary: 6000, keySkills: 'Pilot, Electronics, Tactics (naval)' },
  navigator: { label: 'Navigator', baseSalary: 5000, keySkills: 'Astrogation, Electronics' },
  engineer: { label: 'Engineer', baseSalary: 4000, keySkills: 'Engineer, Mechanic' },
  medic: { label: 'Medic', baseSalary: 4000, keySkills: 'Medic, Zero-G, Life Science, Steward' },
  gunner: { label: 'Gunner', baseSalary: 2000, keySkills: 'Gunner, Mechanic, Electronics' },
  marine: { label: 'Marine', baseSalary: 2000, keySkills: 'Athletics, Gun Combat, Melee, Vacc Suit, Zero-G' },
};

export const CREW_SKILL_LEVEL_CONFIG: Record<CrewSkillLevel, CrewSkillLevelConfig> = {
  green: { label: 'Green', keySkillDM: 0, otherSkillDM: -2, extraShares: 0 },
  average: { label: 'Average', keySkillDM: 1, otherSkillDM: 0, extraShares: 0 },
  good: { label: 'Good', keySkillDM: 2, otherSkillDM: 1, extraShares: 1 },
  excellent: { label: 'Excellent', keySkillDM: 3, otherSkillDM: 2, extraShares: 2 },
  legendary: { label: 'Legendary', keySkillDM: 4, otherSkillDM: 2, extraShares: 3 },
};

// === Crewman Name Table (D66) ===

export const CREWMAN_NAMES: string[] = [
  'Black Jack', 'Cyrex', 'Adro Venniser', 'Penitent Grim', 'Jim Cheese', 'Sutton Vries',
  'Nosetter Hali', 'William Magnus', 'Abra Harper', 'Scarr', 'Ben Parr', 'Kolx Hawk',
  'Master Dank', 'Golim Gryer', 'Edd Law', 'Kagni Vasiir', 'Silent Unter', 'Wulf Bloodaxe',
  'Tom Vargrface', 'Scarlet Sal', 'Pete the Stench', 'Shayra Ventassen', 'Drax the Knifer', 'Little Cleo',
  'Streph Falter', 'Clonehand Brimmer', 'Opal Twice-Vacced', 'Catkiller Targ', 'Fat Florian', 'Cerdic',
  'Old Jaek', 'Laerte', 'Ramsay Grog', 'Sperric', 'Belit the Reaver', 'Ed Tech',
];

// === Crewman Quirks Table (D66) ===

export const CREWMAN_QUIRKS: string[] = [
  'Cybernetic leg', 'Alcoholic', 'Hungry for revenge', 'Always carries a knife',
  'Multicoloured hair or beard', 'Once shot a man in District 268, just to watch him die',
  'Believes he has psionic powers', 'Wants to be in charge', 'Cybernetic hand', 'Paranoid',
  'Collects alien curios', 'Always hungry',
  'Demands his own cabin', 'Ran away to space at a young age', 'Former barbarian',
  'Has a genetically engineered parrot', 'Dying of an exotic disease', 'Covered in prison tattoos',
  'Bloodthirsty', 'Gets space-sick', 'Always nervous',
  'Tells lengthy stories about the good old days', 'Horribly scarred', 'Eyepatch',
  'Sings spacer shanties', 'Has a grudge against a PC', 'Former farmer',
  'Smells really bad', 'Girl in every port', 'Alleged cannibal',
  'Murderous rogue', 'Ex-Imperial navy', 'Network of contacts',
  'Ambitious', 'Coward', 'Bad temper',
];

// === Standing Effect Thresholds ===

export const STANDING_EFFECTS: StandingEffectConfig[] = [
  { label: 'Ally', description: 'All ports belonging to this power become Friendly. SOC+2 in their territory.', minStanding: 20, maxStanding: Infinity },
  { label: 'Tolerated', description: 'All ports belonging to this power become Tolerant.', minStanding: 6, maxStanding: 19 },
  { label: 'Ignored', description: 'No effect on port attitudes.', minStanding: -5, maxStanding: 5 },
  { label: 'Irritant', description: 'Bounty placed on pirate\'s head (Cr1000 x 1D x |Standing|).', minStanding: -20, maxStanding: -6 },
  { label: 'Infamy', description: 'Patrol dispatched to hunt down the pirate menace.', minStanding: -40, maxStanding: -21 },
  { label: 'Enemy of the State', description: 'Hounded by assassins and naval ships. Non-friendly port attitudes drop one level.', minStanding: -Infinity, maxStanding: -41 },
];

export function getStandingEffect(standing: number): StandingEffectConfig {
  for (const effect of STANDING_EFFECTS) {
    if (standing >= effect.minStanding && standing <= effect.maxStanding) {
      return effect;
    }
  }
  return STANDING_EFFECTS[2]; // Ignored as default
}

export function getStandingEffectName(standing: number): StandingEffect {
  if (standing >= 20) return 'ally';
  if (standing >= 6) return 'tolerated';
  if (standing >= -5) return 'ignored';
  if (standing >= -20) return 'irritant';
  if (standing >= -40) return 'infamy';
  return 'enemy_of_state';
}

// === Prey Encounter Table (D66) ===
// Key format: "d1d2" where d1 = first die (0-7), d2 = second die (0-8)
// The table uses modified D66: each die is 1d6 with modifiers applied

export const PREY_ENCOUNTER_TABLE: Record<string, PreyType> = {
  '00': 'traveller', '01': 'traveller', '02': 'no_encounter', '03': 'no_encounter',
  '04': 'small_freighter', '05': 'no_encounter', '06': 'no_encounter', '07': 'no_encounter',
  '08': 'naval_patrol',
  '10': 'traveller', '11': 'no_encounter', '12': 'no_encounter', '13': 'no_encounter',
  '14': 'small_freighter', '15': 'no_encounter', '16': 'no_encounter', '17': 'medium_freighter',
  '18': 'naval_patrol',
  '20': 'traveller', '21': 'no_encounter', '22': 'no_encounter', '23': 'small_freighter',
  '24': 'medium_freighter', '25': 'no_encounter', '26': 'unusual_vessel', '27': 'system_defence_boat',
  '28': 'naval_patrol',
  '30': 'traveller', '31': 'small_freighter', '32': 'convoy', '33': 'unusual_vessel',
  '34': 'medium_freighter', '35': 'no_encounter', '36': 'no_encounter', '37': 'rich_freighter',
  '38': 'naval_patrol',
  '40': 'small_freighter', '41': 'traveller', '42': 'convoy', '43': 'heavy_freighter',
  '44': 'no_encounter', '45': 'no_encounter', '46': 'liner', '47': 'system_defence_boat',
  '48': 'naval_patrol',
  '50': 'traveller', '51': 'convoy', '52': 'small_freighter', '53': 'medium_freighter',
  '54': 'no_encounter', '55': 'heavy_freighter', '56': 'liner', '57': 'system_defence_boat',
  '58': 'naval_patrol',
  '60': 'traveller', '61': 'convoy', '62': 'small_freighter', '63': 'medium_freighter',
  '64': 'liner', '65': 'convoy', '66': 'rich_freighter', '67': 'system_defence_boat',
  '68': 'naval_patrol',
  '70': 'traveller', '71': 'small_freighter', '72': 'medium_freighter', '73': 'convoy',
  '74': 'unusual_vessel', '75': 'liner', '76': 'rich_freighter', '77': 'system_defence_boat',
  '78': 'naval_patrol',
};

export const PREY_TYPE_LABELS: Record<PreyType, string> = {
  'no_encounter': 'No Encounter',
  'traveller': 'Traveller',
  'small_freighter': 'Small Freighter',
  'medium_freighter': 'Medium Freighter',
  'heavy_freighter': 'Heavy Freighter',
  'rich_freighter': 'Rich Freighter',
  'convoy': 'Convoy',
  'liner': 'Liner',
  'unusual_vessel': 'Unusual Vessel',
  'system_defence_boat': 'System Defence Boat',
  'naval_patrol': 'Naval Patrol',
};

// === Prize Ship Hull Types ===

import {
  PrizeShipCondition,
  PrizeShipStatus,
} from '@/types/piracy';

export interface HullTypeTemplate {
  label: string;
  tonnage: number;
  typicalTL: number;
  baseValue: number; // MCr, for sale estimate
  minCrew: number;
  cargoCapacity: number;
  armed: boolean;
}

export const HULL_TYPE_TEMPLATES: Record<string, HullTypeTemplate> = {
  'free_trader': { label: 'Free Trader (Type A)', tonnage: 200, typicalTL: 11, baseValue: 37, minCrew: 4, cargoCapacity: 82, armed: false },
  'far_trader': { label: 'Far Trader (Type A2)', tonnage: 200, typicalTL: 12, baseValue: 52, minCrew: 5, cargoCapacity: 61, armed: false },
  'subsidised_merchant': { label: 'Subsidised Merchant (Type R)', tonnage: 400, typicalTL: 12, baseValue: 101, minCrew: 7, cargoCapacity: 200, armed: false },
  'subsidised_liner': { label: 'Subsidised Liner (Type M)', tonnage: 600, typicalTL: 12, baseValue: 152, minCrew: 9, cargoCapacity: 100, armed: false },
  'safari_ship': { label: 'Safari Ship', tonnage: 200, typicalTL: 12, baseValue: 51, minCrew: 4, cargoCapacity: 6, armed: false },
  'yacht': { label: 'Yacht', tonnage: 200, typicalTL: 13, baseValue: 51, minCrew: 3, cargoCapacity: 10, armed: false },
  'scout_courier': { label: 'Scout/Courier (Type S)', tonnage: 100, typicalTL: 11, baseValue: 29, minCrew: 1, cargoCapacity: 3, armed: true },
  'patrol_corvette': { label: 'Patrol Corvette (Type T)', tonnage: 400, typicalTL: 13, baseValue: 195, minCrew: 10, cargoCapacity: 12, armed: true },
  'corsair': { label: 'Corsair (Type P)', tonnage: 400, typicalTL: 12, baseValue: 149, minCrew: 8, cargoCapacity: 50, armed: true },
  'seeker': { label: 'Seeker Mining Ship', tonnage: 200, typicalTL: 11, baseValue: 32, minCrew: 2, cargoCapacity: 30, armed: false },
  'laboratory_ship': { label: 'Laboratory Ship', tonnage: 400, typicalTL: 13, baseValue: 130, minCrew: 5, cargoCapacity: 10, armed: false },
  'other': { label: 'Other / Unknown', tonnage: 200, typicalTL: 10, baseValue: 30, minCrew: 3, cargoCapacity: 50, armed: false },
};

export const PRIZE_CONDITION_CONFIG: Record<PrizeShipCondition, { label: string; valueMultiplier: number; repairWeeksPerPercent: number; color: string }> = {
  pristine: { label: 'Pristine', valueMultiplier: 0.80, repairWeeksPerPercent: 0, color: 'text-green-400' },
  good: { label: 'Good', valueMultiplier: 0.60, repairWeeksPerPercent: 0.5, color: 'text-cyan-400' },
  damaged: { label: 'Damaged', valueMultiplier: 0.40, repairWeeksPerPercent: 1, color: 'text-yellow-400' },
  heavily_damaged: { label: 'Heavily Damaged', valueMultiplier: 0.20, repairWeeksPerPercent: 2, color: 'text-orange-400' },
  hulk: { label: 'Hulk', valueMultiplier: 0.05, repairWeeksPerPercent: 4, color: 'text-red-400' },
};

export const PRIZE_STATUS_CONFIG: Record<PrizeShipStatus, { label: string; color: string }> = {
  captured: { label: 'Captured', color: 'text-yellow-400' },
  kept: { label: 'In Fleet', color: 'text-cyan-400' },
  sold: { label: 'Sold', color: 'text-green-400' },
  scrapped: { label: 'Scrapped', color: 'text-orange-400' },
  gifted: { label: 'Gifted', color: 'text-purple-400' },
};
