import React, { useEffect, useRef, useState } from 'react';
import audioManager from '@/lib/audioManager';
import type { AlarmStep as AlarmStepType } from '@/types/terminalAction';

interface AlarmStepProps {
  step: AlarmStepType;
  onComplete: () => void;
}

export default function AlarmStep({ step, onComplete }: AlarmStepProps) {
  const duration = step.duration ?? 2000;
  const [flash, setFlash] = useState(true);
  const [lineIndex, setLineIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    audioManager.playEffect(step.sound ?? 'warning', 0.6);

    // Flash pulse
    const flashId = setInterval(() => setFlash(f => !f), 200);

    // Scroll through lines
    if (step.lines && step.lines.length > 0) {
      const lineInterval = duration / (step.lines.length + 1);
      const lineId = setInterval(() => {
        setLineIndex(prev => prev + 1);
      }, lineInterval);
      setTimeout(() => clearInterval(lineId), duration);
    }

    // Advance after duration
    const advanceId = setTimeout(() => {
      clearInterval(flashId);
      const pause = step.pause_after ?? 400;
      setTimeout(() => onCompleteRef.current(), pause);
    }, duration);

    return () => {
      clearInterval(flashId);
      clearTimeout(advanceId);
    };
  }, [step, duration]);

  const visibleLines = step.lines ? step.lines.slice(0, lineIndex) : [];

  return (
    <div
      className="rounded p-4 space-y-3 transition-all duration-100"
      style={{
        border: `1px solid ${flash ? '#ff334488' : '#ff334433'}`,
        background: flash ? 'rgba(255, 51, 68, 0.12)' : 'rgba(255, 51, 68, 0.06)',
        boxShadow: flash ? '0 0 30px rgba(255,51,68,0.35), inset 0 0 20px rgba(255,51,68,0.1)' : 'none',
      }}
    >
      {/* Header */}
      {step.message && (
        <div
          className="font-mono font-bold text-center tracking-[0.25em] uppercase"
          style={{
            fontSize: '1rem',
            color: flash ? '#ff3344' : '#ff334488',
            textShadow: flash ? '0 0 14px #ff334488' : 'none',
            fontFamily: 'var(--font-display, monospace)',
          }}
        >
          ⚠ {step.message} ⚠
        </div>
      )}

      {/* Scrolling lines */}
      {visibleLines.length > 0 && (
        <div className="space-y-0.5">
          {visibleLines.map((line, i) => (
            <div
              key={i}
              className="font-mono text-xs"
              style={{ color: '#ff334499', letterSpacing: '0.05em' }}
            >
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Flicker bar */}
      <div
        className="w-full h-0.5 rounded-full transition-all duration-100"
        style={{ background: flash ? '#ff334466' : '#ff334422' }}
      />
    </div>
  );
}
