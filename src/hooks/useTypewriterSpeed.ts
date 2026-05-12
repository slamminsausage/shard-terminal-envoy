import { useState, useCallback } from 'react';

export type TypewriterSpeedLevel = 'slow' | 'normal' | 'fast' | 'instant';

const STORAGE_KEY = 'terminal_typewriter_speed';

const DELAYS: Record<TypewriterSpeedLevel, number> = {
  slow:    40,
  normal:  20,
  fast:     6,
  instant:  0,
};

function readStoredSpeed(): TypewriterSpeedLevel {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'slow' || stored === 'normal' || stored === 'fast' || stored === 'instant') {
      return stored;
    }
  } catch { /* localStorage unavailable */ }
  return 'normal';
}

export function useTypewriterSpeed() {
  const [speed, setSpeedState] = useState<TypewriterSpeedLevel>(readStoredSpeed);

  const setSpeed = useCallback((level: TypewriterSpeedLevel) => {
    setSpeedState(level);
    try { localStorage.setItem(STORAGE_KEY, level); } catch { /* ignore */ }
  }, []);

  return {
    speed,
    delay: DELAYS[speed],
    setSpeed,
  };
}
