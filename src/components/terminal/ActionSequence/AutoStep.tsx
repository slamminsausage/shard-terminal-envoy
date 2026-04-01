import React, { useEffect, useState, useRef } from 'react';
import { typeTextWithSound } from '@/lib/typing';
import audioManager from '@/lib/audioManager';
import type { AutoStep as AutoStepType } from '@/types/terminalAction';

interface AutoStepProps {
  step: AutoStepType;
  onComplete: () => void;
}

export default function AutoStep({ step, onComplete }: AutoStepProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [currentTyping, setCurrentTyping] = useState('');
  const cancelRef = useRef<(() => void) | null>(null);
  const lineIndexRef = useRef(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    completedRef.current = false;
    lineIndexRef.current = 0;
    setVisibleLines([]);
    setCurrentTyping('');

    const typeNextLine = () => {
      if (completedRef.current) return;

      const idx = lineIndexRef.current;
      if (idx >= step.lines.length) {
        const pauseMs = step.pause_after ?? 500;
        setTimeout(() => {
          if (!completedRef.current) {
            completedRef.current = true;
            onCompleteRef.current();
          }
        }, pauseMs);
        return;
      }

      // Play sound at specific line
      if (step.sound_at_line === idx && step.sound) {
        audioManager.playEffect(step.sound);
      }

      setCurrentTyping('');
      const cancel = typeTextWithSound(
        step.lines[idx],
        setCurrentTyping,
        () => {
          // Move typed line to visible lines
          setVisibleLines(prev => [...prev, step.lines[idx]]);
          setCurrentTyping('');
          lineIndexRef.current = idx + 1;
          // Small pause between lines
          setTimeout(typeNextLine, 200);
        },
        { delay: step.delay ?? 30 }
      );

      cancelRef.current = cancel;
    };

    typeNextLine();

    return () => {
      completedRef.current = true;
      cancelRef.current?.();
    };
  }, [step]);

  return (
    <div className="font-mono text-sm leading-7 space-y-0.5">
      {visibleLines.map((line, i) => (
        <div key={i} className="text-terminal-primary/80 whitespace-pre-wrap">{line}</div>
      ))}
      {currentTyping && (
        <div className="text-terminal-primary whitespace-pre-wrap">
          {currentTyping}
          <span className="animate-pulse">_</span>
        </div>
      )}
    </div>
  );
}
