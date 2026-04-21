/**
 * DiceRoller — inline 2d6 skill-check roller.
 *
 * Styled to match the LogDetailView panel aesthetic:
 *   [DECRYPT · DC 10]  d1 d2 = TOTAL   [ ROLL ]
 *
 * Orbitron caps for labels, Share Tech Mono for dice, bordered mini-panel
 * with accent background. Used by RedactedBlock for in-log decryption
 * attempts.
 *
 * Each roller owns its own exhaustion count so repeated rolls can
 * eventually lock the content out after `maxAttempts`.
 */

import { useState } from 'react';
import type { DiceRoll } from '@/lib/dice';
import audioManager from '@/lib/audioManager';
import {
  TERMINAL_ACCENT,
  TERMINAL_DIM,
  TERMINAL_SUCCESS,
  TERMINAL_ERROR,
  TERMINAL_WARN,
  withAlpha,
} from '@/lib/terminalPalette';

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
  accentColor = TERMINAL_ACCENT,
  dimColor = TERMINAL_DIM,
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
  const stateColor = won
    ? TERMINAL_SUCCESS
    : locked
      ? TERMINAL_ERROR
      : accentColor;

  const labelFont = { fontFamily: 'Orbitron, sans-serif' } as const;
  const monoFont = { fontFamily: 'Share Tech Mono, monospace' } as const;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'stretch',
        verticalAlign: 'baseline',
        border: `1px solid ${withAlpha(stateColor, 0.4)}`,
        background: withAlpha(stateColor, 0.06),
        borderRadius: 2,
        overflow: 'hidden',
        fontSize: '0.7rem',
        lineHeight: 1.4,
      }}
    >
      {/* Label strip */}
      <span
        style={{
          ...labelFont,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.2rem 0.55rem',
          background: withAlpha(stateColor, 0.12),
          borderRight: `1px solid ${withAlpha(stateColor, 0.25)}`,
          fontSize: '0.6rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: stateColor,
          textShadow: `0 0 6px ${withAlpha(stateColor, 0.4)}`,
        }}
      >
        <span>DECRYPT</span>
        <span style={{ color: withAlpha(stateColor, 0.55) }}>·</span>
        <span style={{ color: withAlpha(stateColor, 0.85) }}>DC {difficulty}</span>
      </span>

      {/* Dice readout */}
      <span
        style={{
          ...monoFont,
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.2rem 0.6rem',
          minWidth: 74,
          justifyContent: 'center',
          color: dice ? stateColor : withAlpha(dimColor, 0.9),
          textShadow: dice ? `0 0 6px ${withAlpha(stateColor, 0.45)}` : 'none',
          letterSpacing: '0.05em',
          borderRight: `1px solid ${withAlpha(stateColor, 0.15)}`,
        }}
      >
        {dice ? (
          <>
            {dice[0]}<span style={{ opacity: 0.5, margin: '0 0.25rem' }}>·</span>{dice[1]}
            <span style={{ opacity: 0.5, margin: '0 0.3rem' }}>=</span>
            <strong style={{ fontWeight: 700 }}>{dice[0] + dice[1]}</strong>
          </>
        ) : (
          <span style={{ letterSpacing: '0.25em' }}>— · —</span>
        )}
      </span>

      {/* Action / status */}
      {!resolved && (
        <button
          type="button"
          onClick={rollNow}
          disabled={rolling}
          style={{
            ...labelFont,
            fontSize: '0.6rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            padding: '0 0.85rem',
            background: 'transparent',
            border: 'none',
            cursor: rolling ? 'wait' : 'pointer',
            color: stateColor,
            textShadow: `0 0 6px ${withAlpha(stateColor, 0.45)}`,
            opacity: rolling ? 0.6 : 1,
          }}
          title={`Attempt decryption — ${skill}`}
        >
          {rolling ? '· ROLLING ·' : '▶ ROLL'}
        </button>
      )}

      {won && (
        <span
          style={{
            ...labelFont,
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0 0.85rem',
            fontSize: '0.6rem',
            letterSpacing: '0.22em',
            color: TERMINAL_SUCCESS,
            textShadow: `0 0 8px ${withAlpha(TERMINAL_SUCCESS, 0.5)}`,
          }}
        >
          ✓ DECRYPTED
        </span>
      )}

      {locked && (
        <span
          style={{
            ...labelFont,
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0 0.85rem',
            fontSize: '0.6rem',
            letterSpacing: '0.22em',
            color: TERMINAL_ERROR,
            textShadow: `0 0 8px ${withAlpha(TERMINAL_ERROR, 0.5)}`,
          }}
        >
          ✕ LOCKED
        </span>
      )}

      {resolved === 'fail' && !locked && (
        <button
          type="button"
          onClick={rollNow}
          disabled={rolling}
          style={{
            ...labelFont,
            fontSize: '0.6rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            padding: '0 0.85rem',
            background: 'transparent',
            border: 'none',
            borderLeft: `1px solid ${withAlpha(TERMINAL_WARN, 0.3)}`,
            cursor: 'pointer',
            color: TERMINAL_WARN,
            textShadow: `0 0 6px ${withAlpha(TERMINAL_WARN, 0.45)}`,
          }}
          title={`Retry (${maxAttempts - attempts} attempts left)`}
        >
          ↻ RETRY · {maxAttempts - attempts}
        </button>
      )}
    </span>
  );
}
