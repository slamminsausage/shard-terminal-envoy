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

export type CharacteristicName = keyof Omit<Characteristics, 'psionics'>;

export interface Assignment {
  name: string;
  description: string;
  survivalStat: CharacteristicName;
  survivalTarget: number;
  advancementStat: CharacteristicName;
  advancementTarget: number;
}

export interface Rank {
  title: string;
  skillBonus?: string;
  bonusStat?: CharacteristicName;
}

// ============================================================================
// ENHANCED EVENT SYSTEM - Declarative Data Structure
// ============================================================================

/**
 * Effects that can be applied from any event outcome
 */
export interface EventEffects {
  // Skill effects
  skills?: {
    // Specific skills to choose from
    choices?: string[];
    // How many to pick (default 1)
    chooseCount?: number;
    // Level to grant (default 1)
    level?: number;
    // Allow any skill selection
    anySkill?: boolean;
    // Skills that cannot be chosen
    exclude?: string[];
    // For skill improvement: must already have at this level
    requireExisting?: boolean;
  };

  // Characteristic modifications
  characteristics?: {
    stat: CharacteristicName;
    modifier: number;
    max?: number; // Cap value (e.g., SOC max 12)
  }[];

  // Social connections (number or dice expression)
  allies?: number | 'D3' | 'D6';
  enemies?: number | 'D3' | 'D6';
  rivals?: number | 'D3' | 'D6';
  contacts?: number | 'D3' | 'D6';

  // Career effects
  forceCareer?: string;        // Must take this career next term
  allowCareer?: string;        // Unlocks this career option
  mustLeaveCareer?: boolean;   // Must leave current career
  failGraduation?: boolean;    // Fail to graduate (pre-careers)
  canTestPsi?: boolean;        // Can test PSI score
  draftModifier?: number;      // DM to draft rolls

  // Injury/medical
  rollOnInjuryTable?: boolean;
  injurySeverity?: 'light' | 'standard' | 'severe';

  // Benefit modifications
  benefitDM?: number;          // DM to benefit rolls

  // Redirect to another table
  rollOnTable?: 'life_events' | 'injury' | 'aging' | 'unusual_events';

  // Display message
  message?: string;
}

/**
 * A single outcome branch based on roll results
 */
export interface RollOutcome {
  // Condition for this outcome
  condition:
    | { type: 'success' }                    // Met or exceeded target
    | { type: 'failure' }                    // Below target
    | { type: 'natural'; value: number }     // Specific natural roll (2 or 12)
    | { type: 'range'; min: number; max: number }; // Roll within range

  effects: EventEffects;
}

/**
 * Sub-roll for determining variable outcomes (e.g., 1D: 1-3 Army, 4-5 Marine, 6 Navy)
 */
export interface SubRoll {
  dice: number;  // Number of dice (1 for 1D6, 2 for 2D6)
  sides?: number; // Sides per die (default 6)
  outcomes: {
    min: number;
    max: number;
    effects: EventEffects;
    label: string; // Display text for this outcome
  }[];
}

/**
 * Choice option for player decisions
 */
export interface EventChoice {
  id: string;
  label: string;
  description?: string;
  effects: EventEffects;
  // Some choices require a sub-roll
  subRoll?: SubRoll;
  // Some choices have conditional availability
  requiresStat?: { stat: CharacteristicName; min: number };
}

/**
 * The main event structure - fully declarative
 */
export interface GameEvent {
  id: string;
  description: string;

  // STEP 1: Conditional avoidance (checked first)
  // If player meets condition, they can skip or have different outcome
  avoidance?: {
    stat: CharacteristicName;
    target: number;
    displayText: string;
    // What happens if they CAN avoid
    avoidEffects?: EventEffects;
    // If true, meeting condition means event doesn't happen at all
    skipsEvent?: boolean;
  };

  // STEP 2: The main event resolution (one of these)
  resolution:
    | {
        type: 'automatic';
        effects: EventEffects;
      }
    | {
        type: 'choice';
        displayText: string;
        options: EventChoice[];
      }
    | {
        type: 'characteristic_roll';
        stat: CharacteristicName;
        target: number;
        displayText: string;
        // Multiple possible outcomes based on roll
        outcomes: RollOutcome[];
      }
    | {
        type: 'skill_roll';
        // Player must choose which skill to roll
        skillRequirement?: {
          minLevel: number;
          category?: 'combat' | 'non-combat' | 'any';
          specificSkills?: string[];
        };
        target: number;
        displayText: string;
        outcomes: RollOutcome[];
      }
    | {
        type: 'table_redirect';
        table: 'life_events' | 'injury' | 'aging' | 'draft' | 'unusual_events';
        displayText: string;
      }
    | {
        type: 'sub_roll';
        displayText: string;
        subRoll: SubRoll;
      };
}

// ============================================================================
// LEGACY SUPPORT - Keep old types for gradual migration
// ============================================================================

/** @deprecated Use GameEvent instead */
export interface EventOutcome {
  skills?: string[];
  skillLevel?: number;
  chooseSkillCount?: number;
  characteristic?: { stat: CharacteristicName; modifier: number };
  allies?: number;
  enemies?: number;
  rivals?: number;
  contacts?: number;
  forceCareer?: string;
  allowCareer?: string;
  message?: string;
}

/** @deprecated Use GameEvent instead */
export interface StructuredEvent {
  description: string;
  requiresRoll?: {
    characteristic: CharacteristicName;
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
    characteristic: CharacteristicName;
    target: number;
    displayText: string;
  };
}

// ============================================================================
// CAREER DEFINITION
// ============================================================================

export interface CareerDefinition {
  name: string;
  description: string;
  qualification: string;
  qualificationTarget: number;
  qualificationStat: CharacteristicName;
  isPreCareer?: boolean;
  preCareerType?: 'university' | 'military_academy';
  maxTerms?: number;
  assignments: Assignment[];
  skillTables: {
    personalDevelopment: string[];
    serviceSkills: string[];
    advancedEducation?: string[];
    specialist: { [assignmentName: string]: string[] };
    officer?: string[];
  };
  ranks: {
    enlisted: Rank[];
    officer?: Rank[];
  };
  // Mishap table - can be strings or full GameEvents
  mishapTable: (string | GameEvent)[];
  // Event table - can be strings, legacy StructuredEvent, or new GameEvent
  eventTable: (string | StructuredEvent | GameEvent)[];
  commissionTarget?: number;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isGameEvent(event: string | StructuredEvent | GameEvent): event is GameEvent {
  return typeof event === 'object' && 'resolution' in event;
}

export function isStructuredEvent(event: string | StructuredEvent | GameEvent): event is StructuredEvent {
  return typeof event === 'object' && !('resolution' in event) && 'description' in event;
}

export function isStringEvent(event: string | StructuredEvent | GameEvent): event is string {
  return typeof event === 'string';
}
