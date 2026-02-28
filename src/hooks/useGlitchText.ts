import { useState, useEffect, useRef, useCallback } from 'react';
import { corruptText, getGlitchIntensity } from '@/lib/glitchText';

interface UseGlitchTextOptions {
  /** The original, clean text to periodically corrupt */
  text: string;
  /** Terminal code to derive intensity from */
  terminalCode: string;
  /** Whether to activate the flicker (typically: typingComplete === true) */
  active: boolean;
}

/**
 * Periodically re-corrupts text with random glitch characters.
 * Always corrupts from the original text (no compounding).
 * Returns the original text when inactive.
 */
export function useGlitchText({
  text,
  terminalCode,
  active,
}: UseGlitchTextOptions): string {
  const [displayText, setDisplayText] = useState(text);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearFlicker = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!active || !text) {
      clearFlicker();
      setDisplayText(text);
      return;
    }

    const intensity = getGlitchIntensity(terminalCode);

    if (intensity <= 0) {
      setDisplayText(text);
      return;
    }

    // Show one corruption pass immediately
    setDisplayText(corruptText(text, intensity));

    // Chain timeouts with randomized delay (2-4 seconds)
    const scheduleNext = () => {
      const delay = 2000 + Math.random() * 2000;
      timeoutRef.current = setTimeout(() => {
        setDisplayText(corruptText(text, intensity));
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return clearFlicker;
  }, [active, text, terminalCode, clearFlicker]);

  return displayText;
}
