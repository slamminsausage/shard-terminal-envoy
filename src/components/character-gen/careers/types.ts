// ============================================================================
// TRAVELLER 2E TYPE DEFINITIONS
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
