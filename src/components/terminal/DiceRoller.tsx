/**
 * DiceRoller — inline 2d6 skill-check roller.
 *
 * Used by RedactedBlock for in-log decryption attempts. Animates two
 * dice briefly before settling on the result, then reports success/fail.
 *
 * Each roller maintains its own exhaustion count so repeated rolls
 * can eventually lock the content out after `maxAttempts`.
 */

import { useState } from 'react';
import { roll2d6, type DiceRoll } from '@/lib/dice';
import audioManager from '@/lib/audioManager';

interface DiceRollerProps {
  difficulty: number;
  skill?: string;
  accentColor?: string;
  dimColor?: string;
  maxAttempts?: number;
  onResult?: (roll: DiceRoll & { attempts: number }) => void;
  onExhausted?: () => void;
}

export default function DiceRoller({
  difficulty,
  skill = 'Electronics (Computers)',
  accentColor = '#00ff88',
  dimColor = '#006633',
  maxAttempts = 3,
  onResult,
  onExhausted,
}: DiceRollerProps) {
  const [rolling, setRolling] = useState(false);
  const [dice, setDice] = useState<[number, number] | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [resolved, setResolved] = useState<'success' | 'fail' | null>(null);

  const rollNow = () => {
    if (rolling || resolved === 'success' || attempts >= maxAttempts) return;
    setRolling(true);
    setResolved(null);

    let tumbles = 0;
    const iv = window.setInterval(() => {
      setDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
      tumbles++;
      if (tumbles > 8) {
        window.clearInterval(iv);
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const total = d1 + d2;
        const success = total >= difficulty;
        const nextAttempts = attempts + 1;
        setDice([d1, d2]);
        setRolling(false);
        setAttempts(nextAttempts);
        setResolved(success ? 'success' : 'fail');

        audioManager.playEffect(success ? 'access_granted' : 'access_denied');

        onResult?.({
          dice: total,
          skillDM: 0,
          charDM: 0,
          total,
          difficulty,
          success,
          attempts: nextAttempts,
        });

        if (!success && nextAttempts >= maxAttempts) {
          onExhausted?.();
        }
      }
    }, 55);
  };

  const locked = resolved === 'fail' && attempts >= maxAttempts;
  const won = resolved === 'success';
  const btnColor = won
    ? '#00ff88'
    : locked
      ? '#ff4444'
      : accentColor;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.15rem 0.5rem',
        border: `1px solid ${btnColor}55`,
        backgroundColor: `${btnColor}11`,
        borderRadius: 3,
        fontFamily: 'Share Tech Mono, monospace',
        fontSize: '0.68rem',
        verticalAlign: 'baseline',
      }}
    >
      <span style={{ color: dimColor }}>
        DEC {difficulty}+
      </span>
      {dice && (
        <span
          style={{
            color: btnColor,
            fontWeight: 'bold',
            minWidth: 32,
            textAlign: 'center',
            textShadow: `0 0 6px ${btnColor}66`,
          }}
        >
          [{dice[0]}·{dice[1]}={dice[0] + dice[1]}]
        </span>
      )}
      {!dice && !rolling && (
        <span style={{ color: `${dimColor}99`, minWidth: 32, textAlign: 'center' }}>
          [·,·]
        </span>
      )}
      {!resolved && (
        <button
          onClick={rollNow}
          disabled={rolling}
          style={{
            fontFamily: 'inherit',
            fontSize: 'inherit',
            color: btnColor,
            background: 'transparent',
            border: `1px solid ${btnColor}55`,
            padding: '0 0.4rem',
            cursor: rolling ? 'wait' : 'pointer',
            opacity: rolling ? 0.6 : 1,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
          title={`Attempt decryption — ${skill}`}
        >
          {rolling ? 'ROLLING…' : 'ROLL'}
        </button>
      )}
      {won && (
        <span style={{ color: '#00ff88', letterSpacing: '0.05em' }}>
          ✓ DECRYPTED
        </span>
      )}
      {locked && (
        <span style={{ color: '#ff4444', letterSpacing: '0.05em' }}>
          ✕ LOCKED
        </span>
      )}
      {resolved === 'fail' && !locked && (
        <button
          onClick={rollNow}
          disabled={rolling}
          style={{
            fontFamily: 'inherit',
            fontSize: 'inherit',
            color: '#ffaa00',
            background: 'transparent',
            border: '1px solid #ffaa0055',
            padding: '0 0.4rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
          title={`Retry (${maxAttempts - attempts} left)`}
        >
          RETRY {maxAttempts - attempts}
        </button>
      )}
    </span>
  );
}
