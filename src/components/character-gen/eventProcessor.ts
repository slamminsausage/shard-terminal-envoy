// ============================================================================
// EVENT PROCESSOR - Generic handler for all GameEvent types
// ============================================================================

import type {
  GameEvent,
  EventEffects,
  RollOutcome,
  SubRoll,
  EventChoice,
  CharacteristicName,
  Characteristics,
} from './careers/types';
import { normalizeSkillName, parseSkillString } from './careers/skills';

// ============================================================================
// DICE UTILITIES
// ============================================================================

export function rollDice(count: number, sides: number = 6): number {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}

export function rollDiceExpression(expr: number | 'D3' | 'D6'): number {
  if (typeof expr === 'number') return expr;
  if (expr === 'D3') return rollDice(1, 3);
  if (expr === 'D6') return rollDice(1, 6);
  return 0;
}

export function getDM(value: number): number {
  if (value <= 0) return -3;
  if (value <= 2) return -2;
  if (value <= 5) return -1;
  if (value <= 8) return 0;
  if (value <= 11) return 1;
  if (value <= 14) return 2;
  return 3;
}

// ============================================================================
// EVENT STATE TYPES
// ============================================================================

export interface EventState {
  event: GameEvent;
  phase: EventPhase;

  // Avoidance
  canAvoid: boolean;
  avoided: boolean;

  // Roll state
  rollResult?: {
    naturalRoll: number;
    dm: number;
    total: number;
    target: number;
    success: boolean;
  };

  // Skill roll state (for skill_roll type)
  selectedSkill?: string;

  // Choice state
  selectedChoice?: EventChoice;

  // Sub-roll state
  subRollResult?: {
    roll: number;
    outcome: { min: number; max: number; label: string; effects: EventEffects };
  };

  // Final outcome
  appliedEffects?: EventEffects;
  completed: boolean;
}

export type EventPhase =
  | 'check_avoidance'    // Check if player can avoid
  | 'show_avoidance'     // Show avoidance UI
  | 'awaiting_roll'      // Waiting for player to roll
  | 'select_skill'       // Waiting for skill selection (skill_roll)
  | 'show_roll_result'   // Showing roll result
  | 'awaiting_choice'    // Waiting for player choice
  | 'awaiting_sub_roll'  // Waiting for sub-roll
  | 'show_sub_roll'      // Showing sub-roll result
  | 'select_skill_gain'  // Player selecting skill from choices
  | 'select_any_skill'   // Player selecting any skill
  | 'apply_effects'      // Ready to apply effects
  | 'completed';         // Event fully resolved

// ============================================================================
// EVENT PROCESSOR CLASS
// ============================================================================

export class EventProcessor {
  private characteristics: Characteristics;
  private skills: Record<string, { proficient: boolean; value: string }>;

  constructor(
    characteristics: Characteristics,
    skills: Record<string, { proficient: boolean; value: string }>
  ) {
    this.characteristics = characteristics;
    this.skills = skills;
  }

  /**
   * Initialize event state for a new event
   */
  initializeEvent(event: GameEvent): EventState {
    // Check if avoidance is possible
    const canAvoid = event.avoidance
      ? this.characteristics[event.avoidance.stat].total >= event.avoidance.target
      : false;

    let initialPhase = this.determineInitialPhase(event, canAvoid);

    // For automatic events, set the appliedEffects from the resolution
    let appliedEffects: EventEffects | undefined;
    if (event.resolution.type === 'automatic') {
      appliedEffects = event.resolution.effects;

      // If the automatic event requires skill selection, route to appropriate phase
      if (appliedEffects?.skills?.anySkill && initialPhase === 'apply_effects') {
        initialPhase = 'select_any_skill';
      } else if (appliedEffects?.skills?.choices && appliedEffects.skills.choices.length > 1 && initialPhase === 'apply_effects') {
        initialPhase = 'select_skill_gain';
      }
    }

    return {
      event,
      phase: initialPhase,
      canAvoid,
      avoided: false,
      completed: false,
      appliedEffects,
    };
  }

  /**
   * Determine the initial phase based on event type
   */
  private determineInitialPhase(event: GameEvent, canAvoid: boolean): EventPhase {
    // If can avoid and avoidance skips event, show avoidance option
    if (canAvoid && event.avoidance) {
      return 'show_avoidance';
    }

    // Otherwise, go to resolution phase
    return this.getResolutionPhase(event);
  }

  /**
   * Get the phase for the event's resolution type
   */
  private getResolutionPhase(event: GameEvent): EventPhase {
    switch (event.resolution.type) {
      case 'automatic':
        return 'apply_effects';
      case 'characteristic_roll':
        return 'awaiting_roll';
      case 'skill_roll':
        return 'select_skill';
      case 'choice':
        return 'awaiting_choice';
      case 'table_redirect':
        return 'apply_effects'; // Will trigger table redirect
      case 'sub_roll':
        return 'awaiting_sub_roll';
      default:
        return 'apply_effects';
    }
  }

  /**
   * Handle player choosing to use avoidance
   */
  useAvoidance(state: EventState): EventState {
    if (!state.canAvoid || !state.event.avoidance) {
      return state;
    }

    if (state.event.avoidance.skipsEvent) {
      // Event is completely avoided
      return {
        ...state,
        avoided: true,
        appliedEffects: state.event.avoidance.avoidEffects,
        phase: 'completed',
        completed: true,
      };
    }

    // Avoidance gives different effects but event continues
    return {
      ...state,
      avoided: true,
      appliedEffects: state.event.avoidance.avoidEffects,
      phase: this.getResolutionPhase(state.event),
    };
  }

  /**
   * Handle player declining avoidance
   */
  declineAvoidance(state: EventState): EventState {
    return {
      ...state,
      phase: this.getResolutionPhase(state.event),
    };
  }

  /**
   * Select a skill for skill_roll resolution
   */
  selectSkillForRoll(state: EventState, skillName: string): EventState {
    if (state.event.resolution.type !== 'skill_roll') {
      return state;
    }

    return {
      ...state,
      selectedSkill: skillName,
      phase: 'awaiting_roll',
    };
  }

  /**
   * Perform a characteristic roll
   */
  performCharacteristicRoll(state: EventState): EventState {
    if (state.event.resolution.type !== 'characteristic_roll') {
      return state;
    }

    const { stat, target, outcomes } = state.event.resolution;
    const charValue = this.characteristics[stat].total;
    const dm = getDM(charValue);
    const naturalRoll = rollDice(2, 6);
    const total = naturalRoll + dm;
    const success = total >= target;

    // Find the matching outcome
    const outcome = this.findMatchingOutcome(outcomes, naturalRoll, total, target);

    return {
      ...state,
      rollResult: { naturalRoll, dm, total, target, success },
      appliedEffects: outcome?.effects,
      phase: 'show_roll_result',
    };
  }

  /**
   * Perform a skill roll
   */
  performSkillRoll(state: EventState): EventState {
    if (state.event.resolution.type !== 'skill_roll' || !state.selectedSkill) {
      return state;
    }

    const { target, outcomes } = state.event.resolution;

    // Get skill level as DM (returns -3 for untrained skills)
    const skillLevel = this.getSkillLevel(state.selectedSkill);
    const isUntrained = skillLevel === -3;

    const naturalRoll = rollDice(2, 6);
    const total = naturalRoll + skillLevel;
    const success = total >= target;

    const outcome = this.findMatchingOutcome(outcomes, naturalRoll, total, target);

    // For skill rolls, success might increase the skill used
    // But don't auto-increase untrained skills
    let effects = outcome?.effects;
    if (success && effects && !isUntrained) {
      // Add skill increase to effects (only for trained skills)
      effects = {
        ...effects,
        skills: {
          choices: [state.selectedSkill],
          level: skillLevel + 1,
        },
      };
    }

    return {
      ...state,
      rollResult: { naturalRoll, dm: skillLevel, total, target, success },
      appliedEffects: effects,
      phase: 'show_roll_result',
    };
  }

  /**
   * Find the matching outcome based on roll results
   */
  private findMatchingOutcome(
    outcomes: RollOutcome[],
    naturalRoll: number,
    total: number,
    target: number
  ): RollOutcome | undefined {
    // Check natural roll outcomes first (highest priority)
    for (const outcome of outcomes) {
      if (outcome.condition.type === 'natural' && outcome.condition.value === naturalRoll) {
        return outcome;
      }
    }

    // Check range outcomes
    for (const outcome of outcomes) {
      if (outcome.condition.type === 'range') {
        if (total >= outcome.condition.min && total <= outcome.condition.max) {
          return outcome;
        }
      }
    }

    // Check success/failure
    const success = total >= target;
    for (const outcome of outcomes) {
      if (outcome.condition.type === 'success' && success) {
        return outcome;
      }
      if (outcome.condition.type === 'failure' && !success) {
        return outcome;
      }
    }

    return undefined;
  }

  /**
   * Handle player making a choice
   */
  makeChoice(state: EventState, choiceId: string): EventState {
    if (state.event.resolution.type !== 'choice') {
      return state;
    }

    const choice = state.event.resolution.options.find(o => o.id === choiceId);
    if (!choice) {
      return state;
    }

    // If choice has a sub-roll, go to that phase
    if (choice.subRoll) {
      return {
        ...state,
        selectedChoice: choice,
        appliedEffects: choice.effects,
        phase: 'awaiting_sub_roll',
      };
    }

    return {
      ...state,
      selectedChoice: choice,
      appliedEffects: choice.effects,
      phase: 'apply_effects',
    };
  }

  /**
   * Perform a sub-roll
   */
  performSubRoll(state: EventState): EventState {
    const subRoll = state.selectedChoice?.subRoll ||
      (state.event.resolution.type === 'sub_roll' ? state.event.resolution.subRoll : undefined);

    if (!subRoll) {
      return state;
    }

    const roll = rollDice(subRoll.dice, subRoll.sides || 6);
    const outcome = subRoll.outcomes.find(o => roll >= o.min && roll <= o.max);

    if (!outcome) {
      return state;
    }

    // Merge sub-roll effects with any existing effects
    const mergedEffects = this.mergeEffects(state.appliedEffects, outcome.effects);

    return {
      ...state,
      subRollResult: { roll, outcome },
      appliedEffects: mergedEffects,
      phase: 'show_sub_roll',
    };
  }

  /**
   * Merge two EventEffects objects
   */
  private mergeEffects(base?: EventEffects, additional?: EventEffects): EventEffects {
    if (!base) return additional || {};
    if (!additional) return base;

    return {
      ...base,
      ...additional,
      // Merge arrays/numbers carefully
      characteristics: [
        ...(base.characteristics || []),
        ...(additional.characteristics || []),
      ],
      allies: this.mergeConnectionValue(base.allies, additional.allies),
      enemies: this.mergeConnectionValue(base.enemies, additional.enemies),
      rivals: this.mergeConnectionValue(base.rivals, additional.rivals),
      contacts: this.mergeConnectionValue(base.contacts, additional.contacts),
      // Concatenate messages
      message: [base.message, additional.message].filter(Boolean).join(' '),
    };
  }

  private mergeConnectionValue(
    a?: number | 'D3' | 'D6',
    b?: number | 'D3' | 'D6'
  ): number | 'D3' | 'D6' | undefined {
    if (a === undefined) return b;
    if (b === undefined) return a;
    // If both are numbers, add them
    if (typeof a === 'number' && typeof b === 'number') return a + b;
    // Otherwise, just return the second one (could be smarter but edge case)
    return b;
  }

  /**
   * Acknowledge roll result and move to next phase
   */
  acknowledgeRollResult(state: EventState): EventState {
    // Check if we need skill/any skill selection
    if (state.appliedEffects?.skills) {
      if (state.appliedEffects.skills.anySkill) {
        return { ...state, phase: 'select_any_skill' };
      }
      if (state.appliedEffects.skills.choices && state.appliedEffects.skills.choices.length > 1) {
        return { ...state, phase: 'select_skill_gain' };
      }
    }

    return { ...state, phase: 'apply_effects' };
  }

  /**
   * Acknowledge sub-roll result
   */
  acknowledgeSubRollResult(state: EventState): EventState {
    return { ...state, phase: 'apply_effects' };
  }

  /**
   * Select a skill from choices
   */
  selectSkillGain(state: EventState, skillName: string): EventState {
    if (!state.appliedEffects?.skills) {
      return state;
    }

    // Update effects to only include the selected skill
    return {
      ...state,
      appliedEffects: {
        ...state.appliedEffects,
        skills: {
          ...state.appliedEffects.skills,
          choices: [skillName],
        },
      },
      phase: 'apply_effects',
    };
  }

  /**
   * Complete the event
   */
  completeEvent(state: EventState): EventState {
    return {
      ...state,
      phase: 'completed',
      completed: true,
    };
  }

  /**
   * Get available skills for skill roll
   * Returns all skills from specificSkills, including those the character doesn't have (for untrained attempts at -3)
   */
  getAvailableSkillsForRoll(state: EventState): string[] {
    if (state.event.resolution.type !== 'skill_roll') {
      return [];
    }

    const req = state.event.resolution.skillRequirement;
    const availableSkills: string[] = [];

    // If there are specific skills required, include all of them (even untrained)
    if (req?.specificSkills) {
      for (const skillName of req.specificSkills) {
        // Use getSkillLevel which handles specialty lookups correctly
        const level = this.getSkillLevel(skillName);

        // Skip if there's a minimum level requirement that untrained can't meet
        // (usually minLevel is for trained skills only, untrained can still attempt at -3)
        if (req?.minLevel && req.minLevel > 0 && level < req.minLevel) {
          continue;
        }

        // Add the skill name as-is from the requirement (for display)
        if (!availableSkills.includes(skillName)) {
          availableSkills.push(skillName);
        }
      }
    } else {
      // No specific skills required - use character's existing skills
      for (const [skillKey, skillData] of Object.entries(this.skills)) {
        const level = parseInt(skillData.value) || 0;

        if (req?.minLevel && level < req.minLevel) {
          continue;
        }

        availableSkills.push(skillKey);
      }
    }

    return availableSkills;
  }

  /**
   * Check if character has a skill (for determining untrained penalty).
   * Handles specialty skills - e.g. if character has "gun-combat-energy",
   * hasSkill("Gun Combat") returns true.
   */
  hasSkill(skillName: string): boolean {
    return this.getSkillLevel(skillName) > -3;
  }

  /**
   * Get skill level (returns -3 for untrained skills).
   * For base skills like "Gun Combat", also checks for any specialty
   * (e.g. "gun-combat-energy") and returns the best level found.
   * For specialty skills like "Gun Combat (Energy)", uses normalizeSkillName
   * to produce the correct storage key.
   */
  getSkillLevel(skillName: string): number {
    const normalizedKey = normalizeSkillName(skillName);
    const directMatch = this.skills[normalizedKey];
    if (directMatch) {
      return parseInt(directMatch.value) || 0;
    }

    // If this is a base skill name (no specialty), check for any specialty matches
    const { specialty } = parseSkillString(skillName);
    if (!specialty) {
      const baseKey = normalizedKey;
      let bestLevel = -3;
      for (const [key, data] of Object.entries(this.skills)) {
        if (key.startsWith(baseKey + '-') || key === baseKey) {
          const level = parseInt(data.value) || 0;
          if (level > bestLevel) {
            bestLevel = level;
          }
        }
      }
      if (bestLevel > -3) return bestLevel;
    }

    return -3; // Untrained penalty
  }

  /**
   * Check if a choice is available based on requirements
   */
  isChoiceAvailable(choice: EventChoice): boolean {
    if (!choice.requiresStat) {
      return true;
    }

    const { stat, min } = choice.requiresStat;
    return this.characteristics[stat].total >= min;
  }
}

// ============================================================================
// EFFECT APPLICATION UTILITIES
// ============================================================================

export interface EffectApplicationResult {
  skillsGained: string[];
  characteristicChanges: { stat: string; oldValue: number; newValue: number }[];
  socialChanges: {
    allies: number;
    enemies: number;
    rivals: number;
    contacts: number;
  };
  careerEffects: {
    forceCareer?: string;
    allowCareer?: string;
    failGraduation: boolean;
    mustLeaveCareer: boolean;
  };
  specialFlags: {
    canTestPsi: boolean;
    rollOnTable?: 'life_events' | 'injury' | 'aging';
  };
  messages: string[];
}

export function calculateEffectResults(effects: EventEffects): EffectApplicationResult {
  const result: EffectApplicationResult = {
    skillsGained: [],
    characteristicChanges: [],
    socialChanges: { allies: 0, enemies: 0, rivals: 0, contacts: 0 },
    careerEffects: { failGraduation: false, mustLeaveCareer: false },
    specialFlags: { canTestPsi: false },
    messages: [],
  };

  if (!effects) return result;

  // Skills
  if (effects.skills?.choices) {
    result.skillsGained = effects.skills.choices.map(
      s => `${s} ${effects.skills?.level ?? 1}`
    );
  }

  // Characteristics - just record what will change
  if (effects.characteristics) {
    for (const change of effects.characteristics) {
      result.characteristicChanges.push({
        stat: change.stat,
        oldValue: 0, // Will be filled in by caller
        newValue: change.modifier, // Relative change
      });
    }
  }

  // Social connections
  result.socialChanges.allies = rollDiceExpression(effects.allies || 0);
  result.socialChanges.enemies = rollDiceExpression(effects.enemies || 0);
  result.socialChanges.rivals = rollDiceExpression(effects.rivals || 0);
  result.socialChanges.contacts = rollDiceExpression(effects.contacts || 0);

  // Career effects
  result.careerEffects.forceCareer = effects.forceCareer;
  result.careerEffects.allowCareer = effects.allowCareer;
  result.careerEffects.failGraduation = effects.failGraduation || false;
  result.careerEffects.mustLeaveCareer = effects.mustLeaveCareer || false;

  // Special flags
  result.specialFlags.canTestPsi = effects.canTestPsi || false;
  result.specialFlags.rollOnTable = effects.rollOnTable;

  // Message
  if (effects.message) {
    result.messages.push(effects.message);
  }

  return result;
}
