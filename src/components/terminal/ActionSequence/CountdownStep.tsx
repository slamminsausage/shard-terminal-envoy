import React, { useState, useEffect, useRef } from 'react';
import audioManager from '@/lib/audioManager';
import type { CountdownStep as CountdownStepType } from '@/types/terminalAction';

interface CountdownStepProps {
  step: CountdownStepType;
  onComplete: () => void;
}

export default function CountdownStep({ step, onComplete }: CountdownStepProps) {
  const [remaining, setRemaining] = useState(step.seconds);
  const [done, setDone] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const warningAt = step.warning_at ?? 5;

  useEffect(() => {
    setRemaining(step.seconds);
    setDone(false);

    const id = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 1;
        if (step.tick_sound) audioManager.playEffect('keypress', 0.15);
        if (next <= 0) {
          clearInterval(id);
          setDone(true);
          const delay = step.pause_after ?? 600;
          setTimeout(() => onCompleteRef.current(), delay);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [step]);

  const isWarning = remaining <= warningAt && !done;
  const color = done ? '#88ffaa' : isWarning ? '#ff3344' : '#ffaa00';

  // Format mm:ss
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const display = step.seconds >= 60 ? `${mm}:${ss}` : `${remaining}`;

  return (
    <div className="font-mono text-sm space-y-3">
      {step.label && (
        <div className="text-terminal-primary/80 tracking-wider text-xs uppercase">{step.label}</div>
      )}

      {/* Big countdown display */}
      <div className="flex items-center justify-center py-4">
        <span
          className="font-bold tabular-nums"
          style={{
            fontSize: '3.5rem',
            lineHeight: 1,
            color,
            textShadow: `0 0 20px ${color}66`,
            fontFamily: 'var(--font-display, monospace)',
            animation: isWarning && !done ? 'countdown-pulse 0.5s ease-in-out infinite' : 'none',
          }}
        >
          {done ? '00' : display}
        </span>
      </div>

      {/* Segmented bar */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: step.seconds }, (_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-sm transition-all duration-300"
            style={{
              background: i < remaining ? color : `${color}22`,
              boxShadow: i < remaining ? `0 0 4px ${color}66` : 'none',
            }}
          />
        )).reverse()}
      </div>

      {done && step.complete_message && (
        <div className="text-green-400 font-bold tracking-wider animate-pulse">
          {'>> '}{step.complete_message}
        </div>
      )}

      {isWarning && !done && (
        <div
          className="text-xs tracking-widest uppercase animate-pulse"
          style={{ color: '#ff3344' }}
        >
          ⚠ WARNING — TIME CRITICAL
        </div>
      )}
    </div>
  );
}
