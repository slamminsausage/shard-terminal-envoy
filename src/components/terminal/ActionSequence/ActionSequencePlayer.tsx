import React, { useState, useRef, useEffect, useCallback } from 'react';
import audioManager from '@/lib/audioManager';
import type { ActionSequence, SequenceStep } from '@/types/terminalAction';
import AutoStep from './AutoStep';
import PromptStep from './PromptStep';
import ProgressStep from './ProgressStep';
import ChoiceStep from './ChoiceStep';

interface ActionSequencePlayerProps {
  sequence: ActionSequence;
  preambleText?: string;
  onComplete: () => void;
  onFail: () => void;
  onBack: () => void;
  onBackToTerminal: () => void;
}

type SequenceStatus = 'running' | 'completed' | 'failed';

const CATEGORY_LABELS: Record<string, string> = {
  door_unlock: 'DOOR UNLOCK SEQUENCE',
  system_override: 'SYSTEM OVERRIDE',
  data_extraction: 'DATA EXTRACTION',
};

const CATEGORY_COLORS: Record<string, string> = {
  door_unlock: '#ff8800',
  system_override: '#ff3344',
  data_extraction: '#00ccff',
};

export default function ActionSequencePlayer({
  sequence,
  preambleText,
  onComplete,
  onFail,
  onBack,
  onBackToTerminal,
}: ActionSequencePlayerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [status, setStatus] = useState<SequenceStatus>('running');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalSteps = sequence.steps.length;
  const currentStep: SequenceStep | null =
    status === 'running' && currentStepIndex < totalSteps
      ? sequence.steps[currentStepIndex]
      : null;

  const accentColor = CATEGORY_COLORS[sequence.category] || '#88ffaa';

  // Auto-scroll to bottom when step changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentStepIndex, status]);

  const advanceStep = useCallback(() => {
    setCompletedSteps(prev => [...prev, currentStepIndex]);
    const nextIndex = currentStepIndex + 1;

    if (nextIndex >= totalSteps) {
      setStatus('completed');
      if (sequence.on_complete.sound) {
        audioManager.playEffect(sequence.on_complete.sound);
      }
      // Persist the completion but stay on this screen
      onComplete();
    } else {
      setCurrentStepIndex(nextIndex);
    }
  }, [currentStepIndex, totalSteps, sequence, onComplete]);

  const handleFail = useCallback(() => {
    setStatus('failed');
    if (sequence.on_failure?.sound) {
      audioManager.playEffect(sequence.on_failure.sound);
    }
  }, [sequence]);

  const renderStep = (step: SequenceStep) => {
    switch (step.type) {
      case 'auto':
        return <AutoStep step={step} onComplete={advanceStep} />;
      case 'prompt':
        return <PromptStep step={step} onComplete={advanceStep} onFail={handleFail} />;
      case 'progress':
        return <ProgressStep step={step} onComplete={advanceStep} />;
      case 'choice':
        return <ChoiceStep step={step} onComplete={advanceStep} onFail={handleFail} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          borderColor: `${accentColor}44`,
          background: `${accentColor}08`,
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-mono tracking-widest font-bold"
            style={{ color: accentColor }}
          >
            {CATEGORY_LABELS[sequence.category] || 'ACTION SEQUENCE'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Step progress */}
          <div className="flex items-center gap-1.5">
            {sequence.steps.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: completedSteps.includes(i)
                    ? accentColor
                    : i === currentStepIndex && status === 'running'
                    ? `${accentColor}88`
                    : `${accentColor}22`,
                  boxShadow: i === currentStepIndex && status === 'running'
                    ? `0 0 6px ${accentColor}66`
                    : 'none',
                }}
              />
            ))}
          </div>
          <span
            className="text-xs font-mono"
            style={{ color: `${accentColor}88` }}
          >
            STEP {Math.min(currentStepIndex + 1, totalSteps)}/{totalSteps}
          </span>
        </div>
      </div>

      {/* Sequence content area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {/* Preamble text from log content */}
        {preambleText && (
          <div className="font-mono text-sm text-terminal-primary/50 whitespace-pre-wrap pb-2 mb-2 border-b border-terminal-primary/10">
            {preambleText}
          </div>
        )}

        {/* Completed steps shown as faded output */}
        {completedSteps.map((stepIdx) => {
          const completedStep = sequence.steps[stepIdx];
          if (completedStep.type === 'auto') {
            return (
              <div key={stepIdx} className="font-mono text-sm leading-7 space-y-0.5 opacity-50">
                {completedStep.lines.map((line, i) => (
                  <div key={i} className="text-terminal-primary/60 whitespace-pre-wrap">{line}</div>
                ))}
              </div>
            );
          }
          if (completedStep.type === 'prompt') {
            return (
              <div key={stepIdx} className="font-mono text-sm opacity-50">
                <div className="text-terminal-primary/60">{completedStep.prompt_text}</div>
                <div className="text-green-400/60">{'>> INPUT ACCEPTED'}</div>
              </div>
            );
          }
          if (completedStep.type === 'progress') {
            return (
              <div key={stepIdx} className="font-mono text-sm opacity-50">
                <div className="text-terminal-primary/60">{completedStep.label}</div>
                {completedStep.complete_message && (
                  <div className="text-green-400/60">{'>> '}{completedStep.complete_message}</div>
                )}
              </div>
            );
          }
          if (completedStep.type === 'choice') {
            return (
              <div key={stepIdx} className="font-mono text-sm opacity-50">
                <div className="text-terminal-primary/60">{completedStep.prompt_text}</div>
                <div className="text-green-400/60">{'>> SELECTION CONFIRMED'}</div>
              </div>
            );
          }
          return null;
        })}

        {/* Active step */}
        {currentStep && status === 'running' && (
          <div key={`step-${currentStepIndex}`}>
            {renderStep(currentStep)}
          </div>
        )}

        {/* Completion message */}
        {status === 'completed' && (
          <div
            className="font-mono text-sm p-4 rounded border mt-4"
            style={{
              borderColor: `${accentColor}66`,
              background: `${accentColor}11`,
              boxShadow: `0 0 20px ${accentColor}22`,
            }}
          >
            <div className="text-green-400 font-bold mb-2">{'>> SEQUENCE COMPLETE'}</div>
            <div style={{ color: accentColor }}>{sequence.on_complete.message}</div>
            <button
              onClick={onBackToTerminal}
              className="mt-4 px-4 py-2 font-mono text-xs tracking-wider border rounded transition-colors"
              style={{
                borderColor: `${accentColor}44`,
                color: accentColor,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${accentColor}18`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              ← BACK TO TERMINAL
            </button>
          </div>
        )}

        {/* Failure message */}
        {status === 'failed' && (
          <div
            className="font-mono text-sm p-4 rounded border border-red-500/40 mt-4"
            style={{
              background: 'rgba(255, 0, 0, 0.08)',
              boxShadow: '0 0 20px rgba(255, 0, 0, 0.15)',
            }}
          >
            <div className="text-red-400 font-bold mb-2">{'>> SEQUENCE FAILED'}</div>
            <div className="text-red-300">
              {sequence.on_failure?.message || 'SECURITY LOCKOUT ENGAGED.'}
            </div>
            <button
              onClick={onBackToTerminal}
              className="mt-4 px-4 py-2 font-mono text-xs tracking-wider border border-red-500/40 text-red-400 rounded transition-colors hover:bg-red-500/10"
            >
              ← BACK TO TERMINAL
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-2 border-t"
        style={{ borderColor: `${accentColor}22` }}
      >
        {status === 'running' ? (
          <button
            onClick={onBack}
            className="text-xs font-mono text-terminal-primary/40 hover:text-terminal-primary/80 transition-colors"
          >
            [ESC] ABORT
          </button>
        ) : (
          <div />
        )}
        <div
          className="text-xs font-mono"
          style={{ color: `${accentColor}44` }}
        >
          {sequence.id.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
