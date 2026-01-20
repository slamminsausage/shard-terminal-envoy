// ============================================================================
// EVENT HANDLER COMPONENT - UI for processing GameEvents
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Dices, Check, X, ChevronRight } from 'lucide-react';
import type { GameEvent, EventEffects, Characteristics, EventChoice } from './careers/types';
import {
  EventProcessor,
  EventState,
  rollDiceExpression,
  getDM,
} from './eventProcessor';

// ============================================================================
// PROPS
// ============================================================================

interface EventHandlerProps {
  event: GameEvent;
  characteristics: Characteristics;
  skills: Record<string, { proficient: boolean; value: string }>;
  onComplete: (effects: EventEffects | undefined, messages: string[]) => void;
  onTableRedirect?: (table: 'life_events' | 'injury' | 'aging' | 'draft') => void;
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
}: EventHandlerProps) {
  const [processor] = useState(() => new EventProcessor(characteristics, skills));
  const [state, setState] = useState<EventState>(() => processor.initializeEvent(event));
  const [messages, setMessages] = useState<string[]>([]);

  // Reset when event changes
  useEffect(() => {
    setState(processor.initializeEvent(event));
    setMessages([]);
  }, [event, processor]);

  // Add message helper
  const addMessage = useCallback((msg: string) => {
    setMessages(prev => [...prev, msg]);
  }, []);

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
  const handleCharacteristicRoll = () => {
    const newState = processor.performCharacteristicRoll(state);
    setState(newState);
    if (newState.appliedEffects?.message) {
      addMessage(newState.appliedEffects.message);
    }
  };

  // Handle skill roll
  const handleSkillRoll = () => {
    const newState = processor.performSkillRoll(state);
    setState(newState);
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
  const handleSubRoll = () => {
    const newState = processor.performSubRoll(state);
    setState(newState);
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
        <p className="text-xs text-terminal-primary/60">Select a skill to roll:</p>
        <div className="grid grid-cols-2 gap-2">
          {availableSkills.map(skill => {
            const skillData = skills[skill];
            const level = skillData ? parseInt(skillData.value) || 0 : 0;
            return (
              <Button
                key={skill}
                onClick={() => handleSelectSkillForRoll(skill)}
                variant="outline"
                className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20 justify-between"
                size="sm"
              >
                <span className="capitalize">{skill.replace(/-/g, ' ')}</span>
                <span className="text-terminal-primary/60">{level}</span>
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
          <Button
            onClick={handleCharacteristicRoll}
            className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
          >
            <Dices className="h-4 w-4 mr-2" />
            Roll 2D6 + {stat.toUpperCase()}
          </Button>
        </div>
      );
    }

    if (isSkillRoll && state.selectedSkill) {
      const { target, displayText } = event.resolution;
      const skillData = skills[state.selectedSkill];
      const level = skillData ? parseInt(skillData.value) || 0 : 0;

      return (
        <div className="space-y-2">
          <p className="text-sm text-terminal-primary/80">{displayText}</p>
          <div className="text-xs text-terminal-primary/60">
            <span className="capitalize">{state.selectedSkill.replace(/-/g, ' ')}</span> {level} vs Target {target}+
          </div>
          <Button
            onClick={handleSkillRoll}
            className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
          >
            <Dices className="h-4 w-4 mr-2" />
            Roll 2D6 + Skill
          </Button>
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
        <Button
          onClick={handleSubRoll}
          className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
        >
          <Dices className="h-4 w-4 mr-2" />
          Roll {subRoll.dice}D{subRoll.sides || 6}
        </Button>
      </div>
    );
  };

  const renderSubRollResult = () => {
    if (state.phase !== 'show_sub_roll' || !state.subRollResult) return null;

    return (
      <div className="space-y-2">
        <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3">
          <p className="text-xs text-terminal-primary/80 font-mono">
            Roll: {state.subRollResult.roll}
          </p>
          <p className="text-sm font-bold mt-1 text-terminal-primary">
            Result: {state.subRollResult.outcome.label}
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

  const renderSkillGainSelection = () => {
    if (state.phase !== 'select_skill_gain' && state.phase !== 'select_any_skill') return null;
    if (!state.appliedEffects?.skills) return null;

    const { anySkill, choices, exclude, level } = state.appliedEffects.skills;

    if (anySkill) {
      // TODO: Render full skill list for selection
      // For now, show a message
      return (
        <div className="space-y-2">
          <Alert className="bg-blue-500/10 border-blue-500/50">
            <AlertDescription className="text-blue-400">
              Choose any skill{exclude?.length ? ` (except ${exclude.join(', ')})` : ''} at level {level ?? 1}.
              <p className="text-xs mt-1">(Full skill selector coming soon - for now, this will be noted in your log)</p>
            </AlertDescription>
          </Alert>
          <Button
            onClick={handleComplete}
            className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
          >
            Continue
          </Button>
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

  const renderApplyEffects = () => {
    if (state.phase !== 'apply_effects') return null;

    // Show summary of effects to be applied
    const effects = state.appliedEffects;

    return (
      <div className="space-y-2">
        {effects && (
          <div className="bg-terminal-primary/5 border border-terminal-primary/30 rounded p-3 space-y-1">
            <h4 className="text-xs font-bold text-terminal-primary uppercase mb-2">Effects:</h4>

            {effects.skills?.choices && (
              <div className="text-xs text-terminal-primary/80">
                Skill: {effects.skills.choices.join(', ')} {effects.skills.level ?? 1}
              </div>
            )}

            {effects.characteristics?.map((c, i) => (
              <div key={i} className="text-xs text-terminal-primary/80">
                {c.stat.toUpperCase()} {c.modifier >= 0 ? '+' : ''}{c.modifier}
              </div>
            ))}

            {effects.allies && (
              <div className="text-xs text-green-400">
                +{typeof effects.allies === 'number' ? effects.allies : effects.allies} Allies
              </div>
            )}
            {effects.enemies && (
              <div className="text-xs text-red-400">
                +{typeof effects.enemies === 'number' ? effects.enemies : effects.enemies} Enemies
              </div>
            )}
            {effects.rivals && (
              <div className="text-xs text-yellow-400">
                +{typeof effects.rivals === 'number' ? effects.rivals : effects.rivals} Rivals
              </div>
            )}
            {effects.contacts && (
              <div className="text-xs text-blue-400">
                +{typeof effects.contacts === 'number' ? effects.contacts : effects.contacts} Contacts
              </div>
            )}

            {effects.forceCareer && (
              <div className="text-xs text-orange-400">
                Must enter: {effects.forceCareer}
              </div>
            )}
            {effects.failGraduation && (
              <div className="text-xs text-red-400">
                Failed to graduate
              </div>
            )}
          </div>
        )}

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
