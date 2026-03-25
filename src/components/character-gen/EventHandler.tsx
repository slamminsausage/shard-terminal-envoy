// ============================================================================
// EVENT HANDLER COMPONENT - UI for processing GameEvents
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dices, Check, X, ChevronRight, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';
import type { GameEvent, EventEffects, Characteristics, EventChoice } from './careers/types';
import {
  EventProcessor,
  EventState,
  rollDiceExpression,
  getDM,
} from './eventProcessor';
import { ALL_SKILLS, SKILLS_WITH_SPECIALTIES, SKILLS_WITHOUT_SPECIALTIES, normalizeSkillName, parseSkillString } from './careers/skills';

// ============================================================================
// PROPS
// ============================================================================

interface EventHandlerProps {
  event: GameEvent;
  characteristics: Characteristics;
  skills: Record<string, { proficient: boolean; value: string }>;
  onComplete: (effects: EventEffects | undefined, messages: string[]) => void;
  onTableRedirect?: (table: 'life_events' | 'injury' | 'aging' | 'draft' | 'unusual_events') => void;
  useManualDice?: boolean; // When true, show manual dice entry instead of auto-roll buttons
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EventHandler({
  event,
  characteristics,
  skills,
  onComplete,
  onTableRedirect,
  useManualDice = false,
}: EventHandlerProps) {
  const [processor] = useState(() => new EventProcessor(characteristics, skills));
  const [state, setState] = useState<EventState>(() => processor.initializeEvent(event));
  const [messages, setMessages] = useState<string[]>([]);

  // State for any-skill selection flow
  const [anySkillPendingSpecialty, setAnySkillPendingSpecialty] = useState<string | null>(null);
  const [expandedSkillCategory, setExpandedSkillCategory] = useState<string | null>(null);

  // State for manual dice entry
  const [manualDiceValue, setManualDiceValue] = useState<string>('');

  // Reset when event changes
  useEffect(() => {
    setState(processor.initializeEvent(event));
    setMessages([]);
    setAnySkillPendingSpecialty(null);
    setExpandedSkillCategory(null);
    setManualDiceValue('');
  }, [event, processor]);

  // Add message helper
  const addMessage = useCallback((msg: string) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  /**
   * Look up a skill level properly, handling specialty skills.
   * For a base skill like "Gun Combat", checks for exact match first,
   * then looks for any specialty (e.g. "gun-combat-energy") and returns the best level.
   * For a specialty like "Gun Combat (Energy)", uses normalizeSkillName for proper key format.
   */
  const getSkillLevel = (skillName: string): number => {
    const normalizedKey = normalizeSkillName(skillName);
    const directMatch = skills[normalizedKey];
    if (directMatch) {
      return parseInt(directMatch.value, 10) || 0;
    }

    // If this is a base skill name (no specialty), check for any specialty matches
    const { specialty } = parseSkillString(skillName);
    if (!specialty) {
      const baseKey = normalizedKey; // e.g. "gun-combat"
      let bestLevel = -3;
      for (const [key, data] of Object.entries(skills)) {
        if (key.startsWith(baseKey + '-') || key === baseKey) {
          const level = parseInt(data.value, 10) || 0;
          if (level > bestLevel) {
            bestLevel = level;
          }
        }
      }
      if (bestLevel > -3) return bestLevel;
    }

    return -3; // Untrained
  };

  // Handle avoidance choice
  const handleUseAvoidance = () => {
    const newState = processor.useAvoidance(state);
    setState(newState);
    if (event.avoidance?.avoidEffects?.message) {
      addMessage(event.avoidance.avoidEffects.message);
    }
  };

  const handleDeclineAvoidance = () => {
    setState(processor.declineAvoidance(state));
  };

  // Handle skill selection for skill roll
  const handleSelectSkillForRoll = (skillName: string) => {
    setState(processor.selectSkillForRoll(state, skillName));
  };

  // Handle characteristic roll
  const handleCharacteristicRoll = (manualRoll?: number) => {
    const newState = processor.performCharacteristicRoll(state, manualRoll);
    setState(newState);
    setManualDiceValue('');
    if (newState.appliedEffects?.message) {
      addMessage(newState.appliedEffects.message);
    }
  };

  // Handle skill roll
  const handleSkillRoll = (manualRoll?: number) => {
    const newState = processor.performSkillRoll(state, manualRoll);
    setState(newState);
    setManualDiceValue('');
    if (newState.appliedEffects?.message) {
      addMessage(newState.appliedEffects.message);
    }
  };

  // Handle choice selection
  const handleChoice = (choiceId: string) => {
    const newState = processor.makeChoice(state, choiceId);
    setState(newState);
    if (newState.appliedEffects?.message) {
      addMessage(newState.appliedEffects.message);
    }
  };

  // Handle sub-roll
  const handleSubRoll = (manualRoll?: number) => {
    const newState = processor.performSubRoll(state, manualRoll);
    setState(newState);
    setManualDiceValue('');
    if (newState.subRollResult?.outcome.effects.message) {
      addMessage(newState.subRollResult.outcome.effects.message);
    }
  };

  // Handle acknowledging roll result
  const handleAcknowledgeRoll = () => {
    setState(processor.acknowledgeRollResult(state));
  };

  // Handle acknowledging sub-roll result
  const handleAcknowledgeSubRoll = () => {
    setState(processor.acknowledgeSubRollResult(state));
  };

  // Handle skill gain selection
  const handleSelectSkillGain = (skillName: string) => {
    setState(processor.selectSkillGain(state, skillName));
  };

  // Handle completion
  const handleComplete = () => {
    // Check for table redirect
    if (event.resolution.type === 'table_redirect' && onTableRedirect) {
      onTableRedirect(event.resolution.table);
      return;
    }

    setState(processor.completeEvent(state));
    onComplete(state.appliedEffects, messages);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderAvoidance = () => {
    if (!event.avoidance || !state.canAvoid || state.phase !== 'show_avoidance') {
      return null;
    }

    return (
      <Alert className="bg-green-500/10 border-green-500/50">
        <Check className="h-4 w-4 text-green-400" />
        <AlertDescription className="text-green-400">
          <p className="font-bold">{event.avoidance.displayText}</p>
          <p className="text-sm mt-1">Your {event.avoidance.stat.toUpperCase()} is {characteristics[event.avoidance.stat].total}, which meets the requirement.</p>
          <div className="flex gap-2 mt-3">
            <Button
              onClick={handleUseAvoidance}
              className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50"
              size="sm"
            >
              <Check className="h-4 w-4 mr-2" />
              Use Avoidance
            </Button>
            <Button
              onClick={handleDeclineAvoidance}
              variant="outline"
              className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
              size="sm"
            >
              Proceed Anyway
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  // Show message when avoidance exists but character doesn't meet the requirement
  const renderAvoidanceUnavailable = () => {
    // Only show if event has avoidance, character can't avoid, and we're past the avoidance check
    if (!event.avoidance || state.canAvoid || state.phase === 'show_avoidance' || state.phase === 'completed') {
      return null;
    }

    const charValue = characteristics[event.avoidance.stat].total;
    const statName = event.avoidance.stat.toUpperCase();

    return (
      <Alert className="bg-yellow-500/10 border-yellow-500/50">
        <X className="h-4 w-4 text-yellow-400" />
        <AlertDescription className="text-yellow-400">
          <p className="text-sm">
            <strong>Avoidance not available:</strong> {event.avoidance.displayText}
          </p>
          <p className="text-xs mt-1 text-yellow-400/80">
            Your {statName} is {charValue}, but you need {statName} {event.avoidance.target}+ to avoid this event.
          </p>
        </AlertDescription>
      </Alert>
    );
  };

  const renderSkillSelection = () => {
    if (state.phase !== 'select_skill') return null;

    const availableSkills = processor.getAvailableSkillsForRoll(state);

    if (availableSkills.length === 0) {
      return (
        <Alert className="bg-yellow-500/10 border-yellow-500/50">
          <AlertDescription className="text-yellow-400">
            You don't have any skills at the required level to make this roll.
            <Button
              onClick={handleComplete}
              className="mt-2 w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
              size="sm"
            >
              Continue
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-2">
        <p className="text-sm text-terminal-primary/80">
          {event.resolution.type === 'skill_roll' && event.resolution.displayText}
        </p>
        <p className="text-xs text-terminal-primary/60">Select a skill to roll (untrained skills roll at -3):</p>
        <div className="grid grid-cols-2 gap-2">
          {availableSkills.map(skill => {
            // Use proper skill lookup that handles specialties
            const level = getSkillLevel(skill);
            const isUntrained = level === -3;
            return (
              <Button
                key={skill}
                onClick={() => handleSelectSkillForRoll(skill)}
                variant="outline"
                className={`border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20 justify-between ${isUntrained ? 'border-yellow-500/50' : ''}`}
                size="sm"
              >
                <span className="capitalize">{skill.replace(/-/g, ' ')}</span>
                <span className={isUntrained ? 'text-yellow-400' : 'text-terminal-primary/60'}>
                  {isUntrained ? '-3 (untrained)' : level}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderRollButton = () => {
    if (state.phase !== 'awaiting_roll') return null;

    const isCharRoll = event.resolution.type === 'characteristic_roll';
    const isSkillRoll = event.resolution.type === 'skill_roll';

    // Helper to render the manual dice input
    const renderManualInput = (diceCount: number, diceSides: number, onSubmit: (value: number) => void) => (
      <div className="flex gap-2">
        <Input
          type="number"
          min={diceCount}
          max={diceCount * diceSides}
          value={manualDiceValue}
          onChange={(e) => setManualDiceValue(e.target.value)}
          placeholder={`Enter ${diceCount}D${diceSides} result (${diceCount}-${diceCount * diceSides})`}
          className="bg-black border-terminal-primary/50 text-terminal-primary placeholder:text-terminal-primary/40"
        />
        <Button
          onClick={() => {
            const val = parseInt(manualDiceValue, 10);
            if (!isNaN(val) && val >= diceCount && val <= diceCount * diceSides) {
              onSubmit(val);
            }
          }}
          disabled={!manualDiceValue || isNaN(parseInt(manualDiceValue, 10)) || parseInt(manualDiceValue, 10) < diceCount || parseInt(manualDiceValue, 10) > diceCount * diceSides}
          className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Submit
        </Button>
      </div>
    );

    if (isCharRoll) {
      const { stat, target, displayText } = event.resolution;
      const charValue = characteristics[stat].total;
      const dm = getDM(charValue);

      return (
        <div className="space-y-2">
          <p className="text-sm text-terminal-primary/80">{displayText}</p>
          <div className="text-xs text-terminal-primary/60">
            {stat.toUpperCase()} {charValue} (DM {dm >= 0 ? '+' : ''}{dm}) vs Target {target}+
          </div>
          {useManualDice ? (
            <>
              <p className="text-xs text-blue-400">Enter your 2D6 roll result (DM will be applied automatically):</p>
              {renderManualInput(2, 6, (val) => handleCharacteristicRoll(val))}
            </>
          ) : (
            <Button
              onClick={() => handleCharacteristicRoll()}
              className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
            >
              <Dices className="h-4 w-4 mr-2" />
              Roll 2D6 + {stat.toUpperCase()}
            </Button>
          )}
        </div>
      );
    }

    if (isSkillRoll && state.selectedSkill) {
      const { target, displayText } = event.resolution;
      // Use proper skill lookup that handles specialties
      const level = getSkillLevel(state.selectedSkill);
      const isUntrained = level === -3;

      return (
        <div className="space-y-2">
          <p className="text-sm text-terminal-primary/80">{displayText}</p>
          <div className={`text-xs ${isUntrained ? 'text-yellow-400' : 'text-terminal-primary/60'}`}>
            <span className="capitalize">{state.selectedSkill.replace(/-/g, ' ')}</span> {level}{isUntrained ? ' (untrained)' : ''} vs Target {target}+
          </div>
          {useManualDice ? (
            <>
              <p className="text-xs text-blue-400">Enter your 2D6 roll result (skill modifier will be applied automatically):</p>
              {renderManualInput(2, 6, (val) => handleSkillRoll(val))}
            </>
          ) : (
            <Button
              onClick={() => handleSkillRoll()}
              className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
            >
              <Dices className="h-4 w-4 mr-2" />
              Roll 2D6 {level >= 0 ? `+ ${level}` : `${level}`}
            </Button>
          )}
        </div>
      );
    }

    return null;
  };

  const renderRollResult = () => {
    if (state.phase !== 'show_roll_result' || !state.rollResult) return null;

    const { naturalRoll, dm, total, target, success } = state.rollResult;

    return (
      <div className="space-y-2">
        <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3">
          <p className="text-xs text-terminal-primary/80 font-mono">
            Roll: {naturalRoll} + {dm} = {total} (need {target}+)
          </p>
          <p className={`text-sm font-bold mt-1 ${success ? 'text-green-400' : 'text-red-400'}`}>
            {success ? '✓ SUCCESS' : '✗ FAILED'}
            {naturalRoll === 2 && ' (Natural 2!)'}
            {naturalRoll === 12 && ' (Natural 12!)'}
          </p>
        </div>

        {state.appliedEffects?.message && (
          <Alert className={success ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}>
            <AlertDescription className={success ? 'text-green-400' : 'text-red-400'}>
              {state.appliedEffects.message}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleAcknowledgeRoll}
          className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
        >
          <ChevronRight className="h-4 w-4 mr-2" />
          Continue
        </Button>
      </div>
    );
  };

  // Helper to render compact effects for choice previews
  const renderCompactEffects = (effects: EventEffects | undefined) => {
    if (!effects) return null;
    const items: string[] = [];

    if (effects.skills?.choices) {
      items.push(`${effects.skills.choices.join('/')} ${effects.skills.level ?? 1}`);
    }
    if (effects.skills?.anySkill) {
      items.push(`Any skill ${effects.skills.level ?? 0}`);
    }
    if (effects.characteristics) {
      effects.characteristics.forEach(c => {
        items.push(`${c.stat.toUpperCase().slice(0, 3)} ${c.modifier >= 0 ? '+' : ''}${c.modifier}`);
      });
    }
    if (effects.allies) items.push(`+${effects.allies} Ally`);
    if (effects.enemies) items.push(`+${effects.enemies} Enemy`);
    if (effects.rivals) items.push(`+${effects.rivals} Rival`);
    if (effects.contacts) items.push(`+${effects.contacts} Contact`);
    if (effects.benefitDM) items.push(`Benefit DM+${effects.benefitDM}`);
    if (effects.advancementDM) items.push(`Adv DM+${effects.advancementDM}`);
    if (effects.autoPromotion) items.push('Auto Promotion');
    if (effects.rollOnTable) items.push(`Roll ${effects.rollOnTable}`);

    if (items.length === 0) return null;
    return (
      <div className="text-xs text-cyan-400/80 mt-1 flex flex-wrap gap-1">
        {items.map((item, i) => (
          <span key={i} className="bg-cyan-500/10 px-1.5 py-0.5 rounded">{item}</span>
        ))}
      </div>
    );
  };

  const renderChoices = () => {
    if (state.phase !== 'awaiting_choice' || event.resolution.type !== 'choice') return null;

    return (
      <div className="space-y-2">
        <p className="text-sm text-terminal-primary/80">{event.resolution.displayText}</p>
        <div className="space-y-2">
          {event.resolution.options.map((choice: EventChoice) => {
            const available = processor.isChoiceAvailable(choice);
            return (
              <Card
                key={choice.id}
                className={`cursor-pointer transition-colors ${
                  available
                    ? 'bg-black border-terminal-primary/30 hover:border-terminal-primary/50'
                    : 'bg-black/50 border-terminal-primary/20 opacity-50 cursor-not-allowed'
                }`}
                onClick={() => available && handleChoice(choice.id)}
              >
                <CardContent className="p-3">
                  <h4 className="font-bold text-terminal-primary text-sm">{choice.label}</h4>
                  {choice.description && (
                    <p className="text-xs text-terminal-primary/70 mt-1">{choice.description}</p>
                  )}
                  {renderCompactEffects(choice.effects)}
                  {choice.subRoll && (
                    <p className="text-xs text-yellow-400/80 mt-1">
                      → Roll {choice.subRoll.dice}D{choice.subRoll.sides || 6} to determine outcome
                    </p>
                  )}
                  {choice.requiresStat && !available && (
                    <p className="text-xs text-red-400 mt-1">
                      Requires {choice.requiresStat.stat.toUpperCase()} {choice.requiresStat.min}+
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSubRoll = () => {
    if (state.phase !== 'awaiting_sub_roll') return null;

    const subRoll = state.selectedChoice?.subRoll ||
      (event.resolution.type === 'sub_roll' ? event.resolution.subRoll : undefined);

    if (!subRoll) return null;

    const diceCount = subRoll.dice;
    const diceSides = subRoll.sides || 6;

    return (
      <div className="space-y-2">
        <p className="text-sm text-terminal-primary/80">
          {event.resolution.type === 'sub_roll' && event.resolution.displayText}
          {state.selectedChoice && `Rolling to determine outcome...`}
        </p>
        <div className="text-xs text-terminal-primary/60 space-y-1">
          {subRoll.outcomes.map((outcome, idx) => (
            <div key={idx}>
              {outcome.min === outcome.max ? outcome.min : `${outcome.min}-${outcome.max}`}: {outcome.label}
            </div>
          ))}
        </div>
        {useManualDice ? (
          <>
            <p className="text-xs text-blue-400">Enter your {diceCount}D{diceSides} roll result:</p>
            <div className="flex gap-2">
              <Input
                type="number"
                min={diceCount}
                max={diceCount * diceSides}
                value={manualDiceValue}
                onChange={(e) => setManualDiceValue(e.target.value)}
                placeholder={`Enter ${diceCount}D${diceSides} result (${diceCount}-${diceCount * diceSides})`}
                className="bg-black border-terminal-primary/50 text-terminal-primary placeholder:text-terminal-primary/40"
              />
              <Button
                onClick={() => {
                  const val = parseInt(manualDiceValue, 10);
                  if (!isNaN(val) && val >= diceCount && val <= diceCount * diceSides) {
                    handleSubRoll(val);
                  }
                }}
                disabled={!manualDiceValue || isNaN(parseInt(manualDiceValue, 10)) || parseInt(manualDiceValue, 10) < diceCount || parseInt(manualDiceValue, 10) > diceCount * diceSides}
                className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
          </>
        ) : (
          <Button
            onClick={() => handleSubRoll()}
            className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
          >
            <Dices className="h-4 w-4 mr-2" />
            Roll {diceCount}D{diceSides}
          </Button>
        )}
      </div>
    );
  };

  const renderSubRollResult = () => {
    if (state.phase !== 'show_sub_roll' || !state.subRollResult) return null;

    const { roll, dm, total, outcome } = state.subRollResult;
    const hasDM = dm !== undefined && dm !== 0;

    return (
      <div className="space-y-2">
        <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3">
          <p className="text-xs text-terminal-primary/80 font-mono">
            {hasDM ? (
              <>Roll: {roll} {dm >= 0 ? '+' : ''}{dm} = {total}</>
            ) : (
              <>Roll: {roll}</>
            )}
          </p>
          <p className="text-sm font-bold mt-1 text-terminal-primary">
            Result: {outcome.label}
          </p>
        </div>

        <Button
          onClick={handleAcknowledgeSubRoll}
          className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
        >
          <ChevronRight className="h-4 w-4 mr-2" />
          Continue
        </Button>
      </div>
    );
  };

  // Handle selecting a skill that needs specialty
  const handleAnySkillWithSpecialty = (skillName: string) => {
    setAnySkillPendingSpecialty(skillName);
  };

  // Handle selecting a specialty for the pending skill
  const handleAnySkillSpecialtySelected = (specialty: string) => {
    if (!anySkillPendingSpecialty) return;
    const fullSkillName = `${anySkillPendingSpecialty} (${specialty})`;
    handleSelectSkillGain(fullSkillName);
    setAnySkillPendingSpecialty(null);
    setExpandedSkillCategory(null);
  };

  // Handle selecting a skill without specialty
  const handleAnySkillSelected = (skillName: string) => {
    handleSelectSkillGain(skillName);
    setExpandedSkillCategory(null);
  };

  // Cancel specialty selection
  const cancelAnySkillSpecialtySelection = () => {
    setAnySkillPendingSpecialty(null);
  };

  const renderSkillGainSelection = () => {
    if (state.phase !== 'select_skill_gain' && state.phase !== 'select_any_skill') return null;
    if (!state.appliedEffects?.skills) return null;

    const { anySkill, choices, exclude, level } = state.appliedEffects.skills;

    if (anySkill) {
      const excludeNormalized = (exclude || []).map(s => s.toLowerCase());

      // If pending specialty selection, show specialty options
      if (anySkillPendingSpecialty) {
        const specialties = SKILLS_WITH_SPECIALTIES[anySkillPendingSpecialty] || [];
        return (
          <div className="space-y-2">
            <p className="text-sm text-terminal-primary/80">
              Select a specialty for {anySkillPendingSpecialty}:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {specialties.map(specialty => (
                <Button
                  key={specialty}
                  onClick={() => handleAnySkillSpecialtySelected(specialty)}
                  variant="outline"
                  className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                  size="sm"
                >
                  {specialty}
                </Button>
              ))}
            </div>
            <Button
              onClick={cancelAnySkillSpecialtySelection}
              variant="outline"
              className="w-full mt-2 border-terminal-primary/30 text-terminal-primary/60 hover:bg-terminal-primary/10"
              size="sm"
            >
              ← Back to skill list
            </Button>
          </div>
        );
      }

      // Show skill categories
      const skillsWithSpecialties = Object.keys(SKILLS_WITH_SPECIALTIES)
        .filter(s => !excludeNormalized.includes(s.toLowerCase()))
        .sort();
      const skillsWithoutSpecialties = SKILLS_WITHOUT_SPECIALTIES
        .filter(s => !excludeNormalized.includes(s.toLowerCase()))
        .sort();

      return (
        <div className="space-y-3">
          <Alert className="bg-blue-500/10 border-blue-500/50">
            <AlertDescription className="text-blue-400">
              Choose any skill{exclude?.length ? ` (except ${exclude.join(', ')})` : ''} at level {level ?? 0}.
            </AlertDescription>
          </Alert>

          {/* Skills without specialties */}
          <div className="space-y-1">
            <Button
              onClick={() => setExpandedSkillCategory(expandedSkillCategory === 'basic' ? null : 'basic')}
              variant="outline"
              className="w-full justify-between border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
              size="sm"
            >
              <span>Basic Skills ({skillsWithoutSpecialties.length})</span>
              {expandedSkillCategory === 'basic' ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            {expandedSkillCategory === 'basic' && (
              <div className="grid grid-cols-2 gap-1 mt-2 max-h-48 overflow-y-auto p-1">
                {skillsWithoutSpecialties.map(skill => (
                  <Button
                    key={skill}
                    onClick={() => handleAnySkillSelected(skill)}
                    variant="outline"
                    className="border-terminal-primary/30 text-terminal-primary hover:bg-terminal-primary/20 text-xs py-1"
                    size="sm"
                  >
                    {skill}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Skills with specialties */}
          <div className="space-y-1">
            <Button
              onClick={() => setExpandedSkillCategory(expandedSkillCategory === 'specialty' ? null : 'specialty')}
              variant="outline"
              className="w-full justify-between border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
              size="sm"
            >
              <span>Skills with Specialties ({skillsWithSpecialties.length})</span>
              {expandedSkillCategory === 'specialty' ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            {expandedSkillCategory === 'specialty' && (
              <div className="grid grid-cols-2 gap-1 mt-2 max-h-48 overflow-y-auto p-1">
                {skillsWithSpecialties.map(skill => (
                  <Button
                    key={skill}
                    onClick={() => {
                      // Level 0 skills don't require specialty selection
                      // Only level 1+ skills need to choose a specialty
                      if ((level ?? 0) >= 1) {
                        handleAnySkillWithSpecialty(skill);
                      } else {
                        handleAnySkillSelected(skill);
                      }
                    }}
                    variant="outline"
                    className="border-terminal-primary/30 text-terminal-primary hover:bg-terminal-primary/20 text-xs py-1"
                    size="sm"
                  >
                    {skill}{(level ?? 0) >= 1 ? ' *' : ''}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (choices && choices.length > 1) {
      return (
        <div className="space-y-2">
          <p className="text-sm text-terminal-primary/80">Choose a skill to gain at level {level ?? 1}:</p>
          <div className="grid grid-cols-2 gap-2">
            {choices.map(skill => (
              <Button
                key={skill}
                onClick={() => handleSelectSkillGain(skill)}
                variant="outline"
                className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                size="sm"
              >
                {skill}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  // Helper to render effects summary box
  const renderEffectsSummary = (effects: EventEffects | undefined, showHeader: boolean = true) => {
    if (!effects) return null;

    // Check if there are any effects to display
    const hasEffects = effects.skills || effects.characteristics ||
      effects.allies || effects.enemies || effects.rivals || effects.contacts ||
      effects.forceCareer || effects.failGraduation || effects.benefitDM ||
      effects.advancementDM || effects.autoPromotion || effects.rollOnTable ||
      effects.extraBenefit || effects.qualificationDM;

    if (!hasEffects) return null;

    return (
      <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3 space-y-1">
        {showHeader && <h4 className="text-xs font-bold text-terminal-primary uppercase mb-2">Effects:</h4>}

        {/* Skills */}
        {effects.skills?.choices && (
          <div className="text-xs text-cyan-400">
            ⚔ Skill: {effects.skills.choices.join(', ')} at level {effects.skills.level ?? 1}
          </div>
        )}
        {effects.skills?.anySkill && (
          <div className="text-xs text-cyan-400">
            ⚔ Choose any skill at level {effects.skills.level ?? 0}
            {effects.skills.requireExisting && ' (must already have)'}
          </div>
        )}

        {/* Characteristics */}
        {effects.characteristics?.map((c, i) => (
          <div key={i} className="text-xs text-purple-400">
            📊 {c.stat.toUpperCase()} {c.modifier >= 0 ? '+' : ''}{c.modifier}
          </div>
        ))}

        {/* Social connections */}
        {effects.allies && (
          <div className="text-xs text-green-400">
            👤 +{typeof effects.allies === 'number' ? effects.allies : effects.allies} Allies
          </div>
        )}
        {effects.enemies && (
          <div className="text-xs text-red-400">
            ⚠ +{typeof effects.enemies === 'number' ? effects.enemies : effects.enemies} Enemies
          </div>
        )}
        {effects.rivals && (
          <div className="text-xs text-yellow-400">
            ⚡ +{typeof effects.rivals === 'number' ? effects.rivals : effects.rivals} Rivals
          </div>
        )}
        {effects.contacts && (
          <div className="text-xs text-blue-400">
            📞 +{typeof effects.contacts === 'number' ? effects.contacts : effects.contacts} Contacts
          </div>
        )}

        {/* Benefits and advancement */}
        {effects.benefitDM && (
          <div className="text-xs text-green-400">
            💰 DM+{effects.benefitDM} to a Benefit roll
          </div>
        )}
        {effects.advancementDM && (
          <div className="text-xs text-blue-400">
            📈 DM+{effects.advancementDM} to next advancement roll
          </div>
        )}
        {effects.qualificationDM && (
          <div className="text-xs text-blue-400">
            🎯 DM+{effects.qualificationDM} to next qualification roll
          </div>
        )}
        {effects.autoPromotion && (
          <div className="text-xs text-green-400">
            ⬆ Automatic promotion this term
          </div>
        )}
        {effects.extraBenefit && (
          <div className="text-xs text-green-400">
            🎁 Extra Benefit roll
          </div>
        )}

        {/* Table rolls */}
        {effects.rollOnTable && (
          <div className="text-xs text-orange-400">
            🎲 Roll on {effects.rollOnTable === 'injury' ? 'Injury' : effects.rollOnTable} table
          </div>
        )}

        {/* Career effects */}
        {effects.forceCareer && (
          <div className="text-xs text-orange-400">
            ⚠ Must enter: {effects.forceCareer} next term
          </div>
        )}
        {effects.failGraduation && (
          <div className="text-xs text-red-400">
            ✗ Failed to graduate
          </div>
        )}
      </div>
    );
  };

  const renderApplyEffects = () => {
    if (state.phase !== 'apply_effects') return null;

    return (
      <div className="space-y-2">
        {renderEffectsSummary(state.appliedEffects)}

        {event.resolution.type === 'table_redirect' && (
          <Alert className="bg-blue-500/10 border-blue-500/50">
            <AlertDescription className="text-blue-400">
              {event.resolution.displayText}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleComplete}
          className="w-full bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50"
        >
          <Check className="h-4 w-4 mr-2" />
          Apply & Continue
        </Button>
      </div>
    );
  };

  const renderAutomatic = () => {
    if (event.resolution.type !== 'automatic' || state.phase !== 'apply_effects') {
      return null;
    }

    // Automatic events go straight to apply effects
    return renderApplyEffects();
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="space-y-3">
      {/* Event Description */}
      <Alert className="bg-terminal-primary/5 border-terminal-primary/30">
        <AlertDescription className="text-terminal-primary/80">
          {event.description}
        </AlertDescription>
      </Alert>

      {/* Messages */}
      {messages.map((msg, idx) => (
        <Alert key={idx} className="bg-terminal-primary/5 border-terminal-primary/30">
          <AlertDescription className="text-terminal-primary/70 text-sm">
            {msg}
          </AlertDescription>
        </Alert>
      ))}

      {/* Phase-specific UI */}
      {renderAvoidance()}
      {renderAvoidanceUnavailable()}
      {renderSkillSelection()}
      {renderRollButton()}
      {renderRollResult()}
      {renderChoices()}
      {renderSubRoll()}
      {renderSubRollResult()}
      {renderSkillGainSelection()}
      {renderApplyEffects()}
      {renderAutomatic()}
    </div>
  );
}

export default EventHandler;
