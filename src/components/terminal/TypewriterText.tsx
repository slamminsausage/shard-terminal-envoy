/**
 * TypewriterText Component
 *
 * Encapsulates typing animation logic with optional sound effects.
 * Uses the typeTextWithSound utility from lib/typing.ts.
 *
 * Features:
 * - Character-by-character typing animation
 * - Optional keyboard sound effects
 * - Customizable speed
 * - Completion callback
 * - Auto-cleanup on unmount
 */

import React, { useState, useEffect } from 'react';
import { typeTextWithSound, CancelTyping } from '@/lib/typing';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  playSound?: boolean;
  onComplete?: () => void;
  className?: string;
}

export default function TypewriterText({
  text,
  speed = 30,
  playSound = true,
  onComplete,
  className = '',
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let cancel: CancelTyping | undefined;

    if (playSound) {
      cancel = typeTextWithSound(
        text,
        setDisplayedText,
        onComplete,
        { delay: speed }
      );
    } else {
      // For non-sound version, we can still use the same utility
      // by setting soundEvery to a very high number
      cancel = typeTextWithSound(
        text,
        setDisplayedText,
        onComplete,
        { delay: speed, soundEvery: 999999 }
      );
    }

    return () => {
      if (cancel) {
        cancel();
      }
    };
  }, [text, speed, playSound, onComplete]);

  return (
    <div className={className} style={{ color: 'var(--primary)' }}>
      {displayedText}
    </div>
  );
}
