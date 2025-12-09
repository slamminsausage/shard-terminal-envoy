/**
 * useTypewriter Hook
 *
 * Manages typewriter text animation with optional sound effects.
 * Encapsulates typing logic for reuse across components.
 *
 * Features:
 * - Character-by-character typing
 * - Optional sound effects
 * - Completion callback
 * - Auto-cleanup on unmount
 * - Cancel functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { typeTextWithSound, CancelTyping } from '@/lib/typing';

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  playSound?: boolean;
  onComplete?: () => void;
}

interface UseTypewriterReturn {
  displayedText: string;
  isComplete: boolean;
  cancel: () => void;
  reset: () => void;
}

export function useTypewriter({
  text,
  speed = 30,
  playSound = true,
  onComplete,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [cancelFn, setCancelFn] = useState<CancelTyping | null>(null);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);

    const handleComplete = () => {
      setIsComplete(true);
      onComplete?.();
    };

    const cancel = typeTextWithSound(
      text,
      setDisplayedText,
      handleComplete,
      {
        delay: speed,
        soundEvery: playSound ? 4 : 999999, // High number effectively disables sound
      }
    );

    setCancelFn(() => cancel);

    return () => {
      cancel();
    };
  }, [text, speed, playSound, onComplete]);

  const cancel = useCallback(() => {
    if (cancelFn) {
      cancelFn();
      setIsComplete(true);
    }
  }, [cancelFn]);

  const reset = useCallback(() => {
    setDisplayedText('');
    setIsComplete(false);
  }, []);

  return {
    displayedText,
    isComplete,
    cancel,
    reset,
  };
}
