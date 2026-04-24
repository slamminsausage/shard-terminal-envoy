/**
 * CorruptedText — renders a string where each character randomly flickers
 * through a glitch-char set. Used for unlocked RedactedBlock content to
 * keep the "this data is compromised" feel.
 */

import { useEffect, useState } from 'react';
import { glitchChar } from '@/lib/textEffects';

interface CorruptedTextProps {
  text: string;
  /** 0 – 1. Probability per frame that any given char glitches. */
  intensity?: number;
  /** Frame interval in ms. Default 80. */
  intervalMs?: number;
  color?: string;
}

export default function CorruptedText({
  text,
  intensity = 0.035,
  intervalMs = 80,
  color,
}: CorruptedTextProps) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    setDisplay(text);
    if (intensity <= 0) return;
    const iv = window.setInterval(() => {
      let next = '';
      for (let i = 0; i < text.length; i++) {
        next += Math.random() < intensity ? glitchChar() : text[i];
      }
      setDisplay(next);
    }, intervalMs);
    return () => window.clearInterval(iv);
  }, [text, intensity, intervalMs]);

  return (
    <span style={color ? { color } : undefined}>{display}</span>
  );
}
