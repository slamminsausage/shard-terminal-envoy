// ============================================================================
// TRAVELLER 2E CAREERS DATA
// ============================================================================

export interface CharacteristicValue {
  total: number;
  current: number;
}

export interface Characteristics {
  strength: CharacteristicValue;
  dexterity: CharacteristicValue;
  endurance: CharacteristicValue;
  intellect: CharacteristicValue;
  education: CharacteristicValue;
  social: CharacteristicValue;
  psionics: CharacteristicValue;
}

export interface Assignment {
  name: string;
  description: string;
  survivalStat: keyof Omit<Characteristics, 'psionics'>;
  survivalTarget: number;
  advancementStat: keyof Omit<Characteristics, 'psionics'>;
  advancementTarget: number;
}

export interface Rank {
  title: string;
  skillBonus?: string;
  bonusStat?: keyof Omit<Characteristics, 'psionics'>;
}

export interface EventOutcome {
  skills?: string[]; // Array of skill choices
  skillLevel?: number; // Level to set skills to
  chooseSkillCount?: number; // How many skills to choose from the array
  characteristic?: { stat: keyof Omit<Characteristics, 'psionics'>, modifier: number };
  allies?: number;
  enemies?: number;
  rivals?: number;
  contacts?: number;
  forceCareer?: string; // Force entry to specific career next term
  allowCareer?: string; // Allow entry to specific career
  message?: string; // Additional message to display
}

export interface StructuredEvent {
  description: string;
  requiresRoll?: {
    characteristic: keyof Omit<Characteristics, 'psionics'>;
    target: number;
    displayText: string;
  };
  requiresSkillCheck?: {
    minSkillLevel: number;
    target: number;
    displayText: string;
  };
  requiresChoice?: {
    options: string[];
    displayText: string;
  };
  successOutcome?: EventOutcome;
  failureOutcome?: EventOutcome;
  automaticOutcome?: EventOutcome;
  conditionalAvoidance?: {
    characteristic: keyof Omit<Characteristics, 'psionics'>;
    target: number;
    displayText: string;
  };
}

export interface CareerDefinition {
  name: string;
  description: string;
  qualification: string;
  qualificationTarget: number;
  qualificationStat: keyof Omit<Characteristics, 'psionics'>;
  isPreCareer?: boolean;
  preCareerType?: 'university' | 'military_academy';
  maxTerms?: number; // For pre-careers
  assignments: Assignment[];
  skillTables: {
    personalDevelopment: string[];
    serviceSkills: string[];
    advancedEducation?: string[];
    specialist: { [assignmentName: string]: string[] };
    officer?: string[]; // For military careers
  };
  ranks: {
    enlisted: Rank[];
    officer?: Rank[]; // For military careers
  };
  mishapTable: string[];
  eventTable: string[] | StructuredEvent[];
  commissionTarget?: number; // For military careers
}

// ============================================================================
// PRE-CAREER EVENTS TABLE (2D6)
// ============================================================================

export const PRE_CAREER_EVENTS: StructuredEvent[] = [
  // Result 2
  {
    description: "You are approached by an underground psionic group who sense potential in you. You may test your PSI and attempt to enter the Psion career in any subsequent term, but whether you accept or refuse their approaches, you gain them as an Enemy.",
    automaticOutcome: {
      enemies: 1,
      allowCareer: 'Psion',
      message: 'You may test your PSI and attempt to enter the Psion career in any subsequent term.'
    }
  },

  // Result 3
  {
    description: "A deep tragedy occurs. You fail to graduate and gain no benefits from this Pre-Career. You must leave this term and may not attempt another Pre-Career.",
    requiresChoice: {
      options: ['Gain a Contact', 'No Contact'],
      displayText: 'You may choose to gain a Contact.'
    },
    automaticOutcome: {
      message: 'You fail to graduate and gain no benefits from this Pre-Career. You must leave this term and may not attempt another Pre-Career.'
    }
  },

  // Result 4
  {
    description: "A supposedly harmless prank goes horribly wrong.",
    requiresRoll: {
      characteristic: 'social',
      target: 8,
      displayText: 'Roll SOC 8+ to avoid arrest'
    },
    successOutcome: {
      skills: ['Deception', 'Persuade', 'Contact'],
      chooseSkillCount: 1,
      skillLevel: 1,
      message: 'You talk your way out of trouble.'
    },
    failureOutcome: {
      forceCareer: 'Prisoner',
      message: 'You are arrested and imprisoned. You must enter the Prisoner career in your next term.'
    }
  },

  // Result 5
  {
    description: "Taking advantage of youth, you party as much as you study.",
    automaticOutcome: {
      skills: ['Carouse'],
      skillLevel: 1
    }
  },

  // Result 6
  {
    description: "You join a tightly knit group of fellow students who become lifelong friends.",
    automaticOutcome: {
      allies: 3, // Will need to roll D3 in implementation
      message: 'Gain D3 Allies on graduation.'
    }
  },

  // Result 7
  {
    description: "Life Event. Roll on the Life Events table (see page 50).",
    automaticOutcome: {
      message: 'Roll on the Life Events table.'
    }
  },

  // Result 8
  {
    description: "You become involved in a political movement.",
    requiresRoll: {
      characteristic: 'social',
      target: 8,
      displayText: 'Roll SOC 8+ to become a leader'
    },
    successOutcome: {
      allies: 1,
      skills: ['Admin', 'Advocate', 'Diplomat', 'Persuade'],
      chooseSkillCount: 1,
      skillLevel: 1,
      message: 'You become one of its leaders and gain an Ally within the movement.'
    },
    failureOutcome: {
      rivals: 1,
      skills: ['Admin', 'Advocate', 'Diplomat', 'Persuade'],
      chooseSkillCount: 1,
      skillLevel: 1,
      message: 'You are duped by the movement and gain a Rival instead.'
    }
  },

  // Result 9
  {
    description: "You develop a life-long interest in a hobby or other area of study.",
    automaticOutcome: {
      message: 'Gain any skill of your choice, but not one you already have, at level 0.'
    }
  },

  // Result 10
  {
    description: "Your time in education allows you to make a breakthrough in an established field of knowledge or study.",
    requiresSkillCheck: {
      minSkillLevel: 1,
      target: 9,
      displayText: 'Choose a non-combat skill you have at level 1+ and roll 9+ to increase it'
    },
    successOutcome: {
      message: 'You successfully make a breakthrough! The chosen skill increases by one level.'
    },
    failureOutcome: {
      message: 'Your research does not yield the breakthrough you hoped for.'
    }
  },

  // Result 11
  {
    description: "You are caught up in a widely unpopular and desperate draft to fight in an off-world war.",
    conditionalAvoidance: {
      characteristic: 'social',
      target: 9,
      displayText: 'If your SOC is 9+, you can avoid this entirely'
    },
    requiresChoice: {
      options: ['Flee to Drifter (gain Enemy)', 'Accept Draft (+2 DM, military only)'],
      displayText: 'Choose your response to the draft'
    },
    automaticOutcome: {
      message: 'You may flee to become a Drifter but gain an Enemy, or be drafted with +2 DM (military careers only).'
    }
  },

  // Result 12
  {
    description: "You gain wide recognition for your efforts, promoting your organisation or being particularly helpful within society.",
    automaticOutcome: {
      characteristic: { stat: 'social', modifier: 1 },
      message: 'Gain +1 DM to SOC (to a maximum of 12).'
    }
  },
];

// ============================================================================
// PRE-CAREER: UNIVERSITY
// ============================================================================

export const CAREER_UNIVERSITY: CareerDefinition = {
  name: 'University',
  description: 'Higher education to gain advanced knowledge and skills. Choose one Level 0 and one Level 1 skill from the list when you enter. Increase EDU by +1 immediately.',
  qualification: 'EDU 6+',
  qualificationTarget: 6,
  qualificationStat: 'education',
  isPreCareer: true,
  preCareerType: 'university',
  maxTerms: 3,
  assignments: [
    {
      name: 'Student',
      description: 'You are pursuing higher education.',
      survivalStat: 'intellect',
      survivalTarget: 6, // Graduation roll
      advancementStat: 'intellect',
      advancementTarget: 10, // Honours
    },
  ],
  skillTables: {
    personalDevelopment: [],
    serviceSkills: [], // No service skills - University uses manual selection
    advancedEducation: ['Admin', 'Advocate', 'Animals', 'Art', 'Astrogation', 'Electronics', 'Engineer', 'Language', 'Medic', 'Navigation', 'Profession', 'Science'],
    specialist: {
      'Student': [],
    },
  },
  ranks: {
    enlisted: [
      { title: 'Student' },
      { title: 'Graduate' },
      { title: 'Graduate with Honours' },
    ],
  },
  mishapTable: [
    "Failed to graduate. Gain no benefits from University.",
  ],
  eventTable: PRE_CAREER_EVENTS,
};

// ============================================================================
// PRE-CAREER: MILITARY ACADEMY
// ============================================================================

export const CAREER_MILITARY_ACADEMY: CareerDefinition = {
  name: 'Military Academy',
  description: 'Train at a military academy. Must choose Army, Navy, or Marines and gain all their Service Skills at Level 0 immediately.',
  qualification: 'Special', // Army: END 7+, Marines: END 8+, Navy: INT 8+
  qualificationTarget: 7, // Army: END 7+, Marines: END 8+, Navy: INT 8+
  qualificationStat: 'endurance', // Default, varies by service
  isPreCareer: true,
  preCareerType: 'military_academy',
  maxTerms: 3,
  assignments: [
    {
      name: 'Army Cadet',
      description: 'Training for the Army.',
      survivalStat: 'intellect',
      survivalTarget: 7, // Graduation
      advancementStat: 'intellect',
      advancementTarget: 11, // Honours
    },
    {
      name: 'Marine Cadet',
      description: 'Training for the Marines.',
      survivalStat: 'intellect',
      survivalTarget: 7,
      advancementStat: 'intellect',
      advancementTarget: 11,
    },
    {
      name: 'Navy Cadet',
      description: 'Training for the Navy.',
      survivalStat: 'intellect',
      survivalTarget: 7,
      advancementStat: 'intellect',
      advancementTarget: 11,
    },
  ],
  skillTables: {
    personalDevelopment: [],
    serviceSkills: [], // Filled from chosen service
    specialist: {
      'Army Cadet': [],
      'Marine Cadet': [],
      'Navy Cadet': [],
    },
  },
  ranks: {
    enlisted: [
      { title: 'Cadet' },
      { title: 'Graduate' },
      { title: 'Graduate with Honours' },
    ],
  },
  mishapTable: [
    "Failed to graduate but gain automatic entry to your chosen service (if roll was not 2 or less). No commission roll in first term.",
  ],
  eventTable: PRE_CAREER_EVENTS,
};

// ============================================================================
// CAREER: AGENT
// ============================================================================

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

// ============================================================================
// CAREER: ARMY
// ============================================================================

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

// ============================================================================
// CAREER: MARINES
// ============================================================================

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

// ============================================================================
// CAREER: NAVY
// ============================================================================

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

// ============================================================================
// CAREER: SCOUT
// ============================================================================

export const CAREER_SCOUT: CareerDefinition = {
  name: 'Scout',
  description: 'Explorers and couriers, charting new worlds and delivering vital messages.',
  qualification: 'INT 5+',
  qualificationTarget: 5,
  qualificationStat: 'intellect',
  assignments: [
    {
      name: 'Courier',
      description: 'You deliver mail and data across vast distances.',
      survivalStat: 'endurance',
      survivalTarget: 5,
      advancementStat: 'education',
      advancementTarget: 9,
    },
    {
      name: 'Surveyor',
      description: 'You chart new systems and worlds.',
      survivalStat: 'endurance',
      survivalTarget: 6,
      advancementStat: 'intellect',
      advancementTarget: 8,
    },
    {
      name: 'Explorer',
      description: 'You venture into the unknown.',
      survivalStat: 'endurance',
      survivalTarget: 7,
      advancementStat: 'education',
      advancementTarget: 7,
    },
  ],
  skillTables: {
    personalDevelopment: ['Strength +1', 'Dexterity +1', 'Endurance +1', 'Intellect +1', 'Education +1', 'Jack-of-all-Trades'],
    serviceSkills: ['Pilot', 'Survival', 'Mechanic', 'Astrogation', 'Electronics', 'Gun Combat'],
    advancedEducation: ['Medic', 'Navigation', 'Engineer', 'Electronics', 'Astrogation', 'Science'],
    specialist: {
      'Courier': ['Electronics', 'Flyer', 'Pilot', 'Engineer', 'Astrogation', 'Navigation'],
      'Surveyor': ['Electronics', 'Sensors', 'Persuade', 'Pilot', 'Navigation', 'Science'],
      'Explorer': ['Electronics', 'Pilot', 'Sensors', 'Survival', 'Recon', 'Science'],
    },
  },
  ranks: {
    enlisted: [
      { title: 'Scout' },
      { title: 'Scout' },
      { title: 'Senior Scout', skillBonus: 'Vacc Suit' },
      { title: 'Senior Scout' },
      { title: 'Principal Scout' },
      { title: 'Principal Scout' },
      { title: 'Senior Principal Scout' },
    ],
  },
  mishapTable: [
    "Severely injured in action. Roll twice on the Injury table and take the lower result.",
    "Your ship is damaged and you have to hitch-hike your way back across the stars. Gain one Contact and one level in Streetwise, Persuade, or Deception.",
    "You inadvertently cause a conflict between the Imperium and a Minor Race. Gain a Rival and lose this Benefit roll.",
    "You have a bad reaction to jump space. Leave this career.",
    "Your ship is destroyed through your actions. Gain an Enemy. If you were on a mission of your own, you keep the Benefit roll for this term.",
    "Injured. Roll on the Injury table.",
  ],
  eventTable: [
    "Disaster! Roll on the Mishap table but you are not ejected from this career.",
    "You spend several years on the fringes of known space. Gain one of Survival 1, Navigation 1, Pilot 1, or Sensors 1.",
    "You survey an alien world. Gain one of Recon 1, Science 1, Electronics 1, or Survival 1.",
    "You spend a great deal of time on the edges of civilisation. Gain one Contact in an unusual location.",
    "You serve as a courier. Gain one of Pilot 1, Sensors 1, Electronics 1, or Astrogation 1.",
    "Life Event. Roll on the Life Events table.",
    "You are given advanced training in a specialist field. Roll EDU 8+ to increase any one skill you already have by one level.",
    "Your ship is involved in a first contact with a previously unknown minor race. Gain one of Language 1, Diplomat 1, or Recon 1 and one Contact.",
    "You spend a great deal of time in jump space. Gain one of Astrogation 1, Electronics 1, or Sensors 1.",
    "You discover something of value on a world you survey. Gain DM+2 to any one Benefit roll from this career.",
  ],
};

// ============================================================================
// EXPORTS
// ============================================================================

export const ALL_CAREERS: CareerDefinition[] = [
  CAREER_UNIVERSITY,
  CAREER_MILITARY_ACADEMY,
  CAREER_AGENT,
  CAREER_ARMY,
  CAREER_MARINES,
  CAREER_NAVY,
  CAREER_SCOUT,
];

export const BACKGROUND_SKILLS = [
  'Admin', 'Animals', 'Art', 'Athletics', 'Carouse', 'Drive', 'Electronics',
  'Flyer', 'Language', 'Mechanic', 'Medic', 'Profession', 'Science', 'Seafarer',
  'Streetwise', 'Survival', 'Vacc Suit'
];
