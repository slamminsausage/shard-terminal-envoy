import { useState, useEffect, useRef } from 'react';

interface AnimatedDiceValueProps {
  value: number;
  isRolling: boolean;
  className?: string;
}

/**
 * Displays a number that rapidly cycles through random values while `isRolling`
 * is true, then snaps to the real `value` when rolling stops.
 */
export function AnimatedDiceValue({ value, isRolling, className = '' }: AnimatedDiceValueProps) {
  const [display, setDisplay] = useState(value);
  const rafRef = useRef<number | null>(null);
  const lastFlipRef = useRef(0);

  useEffect(() => {
    if (!isRolling) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setDisplay(value);
      return;
    }

    const tick = (now: number) => {
      if (now - lastFlipRef.current > 60) {
        setDisplay(Math.floor(Math.random() * 12) + 2); // 2–13 range (2d6 feel)
        lastFlipRef.current = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isRolling, value]);

  return <span className={className}>{display}</span>;
}
