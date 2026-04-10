import React, { useEffect, useState, useRef } from 'react';
import audioManager from '@/lib/audioManager';
import type { ProgressStep as ProgressStepType } from '@/types/terminalAction';

interface ProgressStepProps {
  step: ProgressStepType;
  onComplete: () => void;
}

export default function ProgressStep({ step, onComplete }: ProgressStepProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const segments = step.segments ?? 20;
  const duration = step.duration ?? 3000;

  useEffect(() => {
    const seg = step.segments ?? 20;
    const dur = step.duration ?? 3000;
    setProgress(0);
    setDone(false);

    const tickMs = dur / seg;
    let current = 0;

    intervalRef.current = setInterval(() => {
      current += 1;
      setProgress(current);

      if (current >= seg) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDone(true);

        if (step.sound_on_complete) {
          audioManager.playEffect(step.sound_on_complete);
        }

        setTimeout(() => onCompleteRef.current(), 600);
      }
    }, tickMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [step]);

  const filled = Math.min(progress, segments);
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(segments - filled);
  const pct = Math.round((filled / segments) * 100);

  return (
    <div className="font-mono text-sm space-y-2">
      <div className="text-terminal-primary">{step.label}</div>
      <div className="flex items-center gap-3">
        <span className="text-terminal-primary/60">[</span>
        <span
          className="tracking-tight"
          style={{
            color: done ? '#88ffaa' : undefined,
          }}
        >
          <span className="text-terminal-primary">{bar.slice(0, filled)}</span>
          <span className="text-terminal-primary/20">{bar.slice(filled)}</span>
        </span>
        <span className="text-terminal-primary/60">]</span>
        <span className="text-terminal-primary/80 text-xs w-10 text-right">{pct}%</span>
      </div>
      {done && step.complete_message && (
        <div className="text-green-400 font-bold animate-pulse">
          {'>> '}{step.complete_message}
        </div>
      )}
    </div>
  );
}
