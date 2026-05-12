import React, { useState, useEffect, useRef } from 'react';
import type { StatusPanelStep as StatusPanelStepType, StatusIndicator } from '@/types/terminalAction';

interface StatusPanelStepProps {
  step: StatusPanelStepType;
  onComplete: () => void;
}

const STATUS_CONFIG: Record<StatusIndicator['status'], { color: string; dot: string; label: string }> = {
  ok:      { color: '#88ffaa', dot: '●', label: 'OK' },
  warning: { color: '#ffaa00', dot: '◆', label: 'WARN' },
  error:   { color: '#ff3344', dot: '■', label: 'ERROR' },
  neutral: { color: '#ffffff44', dot: '○', label: '—' },
};

export default function StatusPanelStep({ step, onComplete }: StatusPanelStepProps) {
  const staggerDelay = step.stagger_delay ?? 200;
  const transitionDelay = step.transition_delay ?? 1200;
  const [visibleCount, setVisibleCount] = useState(0);
  const [indicators, setIndicators] = useState<StatusIndicator[]>(step.indicators);
  const [transitioning, setTransitioning] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setVisibleCount(0);
    setIndicators(step.indicators);
    setTransitioning(false);

    // Stagger in each indicator
    const timers: ReturnType<typeof setTimeout>[] = [];
    step.indicators.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleCount(i + 1), i * staggerDelay));
    });

    // After all are visible, optionally transition them
    const afterAll = step.indicators.length * staggerDelay + 300;

    if (step.transition_to && step.transition_to.length > 0) {
      timers.push(setTimeout(() => {
        setTransitioning(true);
        const transitionTimers: ReturnType<typeof setTimeout>[] = [];
        step.transition_to!.forEach((ind, i) => {
          transitionTimers.push(
            setTimeout(() => {
              setIndicators(prev => {
                const next = [...prev];
                const idx = next.findIndex(n => n.name === ind.name);
                if (idx >= 0) next[idx] = ind;
                return next;
              });
            }, i * (staggerDelay * 0.7))
          );
        });
        timers.push(...transitionTimers);

        // Advance after transitions complete
        const finalDelay = step.transition_to!.length * staggerDelay * 0.7 + (step.pause_after ?? 800);
        timers.push(setTimeout(() => onCompleteRef.current(), finalDelay));
      }, afterAll + transitionDelay));
    } else {
      // No transition — just advance after all are visible
      timers.push(setTimeout(() => onCompleteRef.current(), afterAll + (step.pause_after ?? 600)));
    }

    return () => timers.forEach(clearTimeout);
  }, [step]);

  return (
    <div className="font-mono text-sm space-y-2">
      {step.label && (
        <div className="text-xs uppercase tracking-widest text-terminal-primary/60 mb-3 pb-1 border-b border-terminal-primary/10">
          {step.label}
        </div>
      )}

      <div className="space-y-1.5">
        {indicators.map((ind, i) => {
          const cfg = STATUS_CONFIG[ind.status];
          const isVisible = i < visibleCount;
          return (
            <div
              key={ind.name}
              className="flex items-center gap-3 transition-all duration-300"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0)' : 'translateX(-8px)',
              }}
            >
              {/* Name */}
              <span
                className="flex-1 text-xs tracking-wider uppercase truncate"
                style={{ color: '#ffffff66' }}
              >
                {ind.name}
              </span>

              {/* Separator dots */}
              <span className="text-xs" style={{ color: '#ffffff18', letterSpacing: '0.1em' }}>
                {'·'.repeat(8)}
              </span>

              {/* Status badge */}
              <span
                className="flex items-center gap-1.5 text-xs tracking-wider uppercase transition-all duration-400"
                style={{
                  color: cfg.color,
                  textShadow: `0 0 6px ${cfg.color}66`,
                  minWidth: '6rem',
                  justifyContent: 'flex-end',
                }}
              >
                <span style={{ fontSize: '10px' }}>{cfg.dot}</span>
                {ind.value}
              </span>
            </div>
          );
        })}
      </div>

      {transitioning && step.transition_to && (
        <div
          className="text-xs tracking-widest uppercase mt-2 animate-pulse"
          style={{ color: '#88ffaa44' }}
        >
          UPDATING...
        </div>
      )}
    </div>
  );
}
