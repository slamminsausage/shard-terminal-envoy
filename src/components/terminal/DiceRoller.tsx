/**
 * DiceRoller — inline 2d6 skill-check roller.
 *
 * Styled to match the LogDetailView panel aesthetic:
 *   [DECRYPT · DC 10]  d1 d2 = TOTAL   [ ROLL ] [ ✎ ]
 *
 * Supports two input modes:
 *   - Auto roll: tumbling animation resolves to a random 2d6 total.
 *   - Manual entry: a small number field (2–12) for table-play rolls;
 *     toggle with the ✎ button.
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

const labelFont = { fontFamily: 'Orbitron, sans-serif' } as const;
const monoFont = { fontFamily: 'Share Tech Mono, monospace' } as const;

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

  const [manualMode, setManualMode] = useState(false);
  const [manualValue, setManualValue] = useState('');
  const [manualError, setManualError] = useState(false);

  const finalize = (total: number, d1?: number, d2?: number) => {
    const success = total >= difficulty;
    const nextAttempts = attempts + 1;
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

    if (d1 !== undefined && d2 !== undefined) {
      setDice([d1, d2]);
    } else {
      setDice(null);
    }
  };

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
        finalize(d1 + d2, d1, d2);
      }
    }, 55);
  };

  const submitManual = () => {
    if (rolling || resolved === 'success' || attempts >= maxAttempts) return;
    const total = parseInt(manualValue, 10);
    if (isNaN(total) || total < 2 || total > 12) {
      setManualError(true);
      return;
    }
    setManualError(false);
    setResolved(null);
    finalize(total);
    setManualValue('');
    setManualMode(false);
  };

  const locked = resolved === 'fail' && attempts >= maxAttempts;
  const won = resolved === 'success';
  const stateColor = won
    ? TERMINAL_SUCCESS
    : locked
      ? TERMINAL_ERROR
      : manualError
        ? TERMINAL_WARN
        : accentColor;

  const totalShown = dice
    ? dice[0] + dice[1]
    : resolved !== null && !dice
      ? null
      : null;

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

      {/* Dice readout / manual input */}
      <span
        style={{
          ...monoFont,
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.2rem 0.55rem',
          minWidth: 82,
          justifyContent: 'center',
          color: dice || totalShown !== null ? stateColor : withAlpha(dimColor, 0.9),
          textShadow: dice ? `0 0 6px ${withAlpha(stateColor, 0.45)}` : 'none',
          letterSpacing: '0.05em',
          borderRight: `1px solid ${withAlpha(stateColor, 0.15)}`,
        }}
      >
        {manualMode && !resolved ? (
          <input
            type="number"
            min={2}
            max={12}
            value={manualValue}
            onChange={(e) => {
              setManualValue(e.target.value);
              if (manualError) setManualError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitManual();
              if (e.key === 'Escape') {
                setManualMode(false);
                setManualError(false);
                setManualValue('');
              }
            }}
            placeholder="2–12"
            autoFocus
            style={{
              ...monoFont,
              width: 58,
              background: 'rgba(0,0,0,0.5)',
              border: `1px solid ${withAlpha(stateColor, 0.45)}`,
              color: stateColor,
              fontSize: '0.72rem',
              padding: '0.1rem 0.3rem',
              textAlign: 'center',
              borderRadius: 2,
              outline: 'none',
            }}
          />
        ) : dice ? (
          <>
            {dice[0]}
            <span style={{ opacity: 0.5, margin: '0 0.25rem' }}>·</span>
            {dice[1]}
            <span style={{ opacity: 0.5, margin: '0 0.3rem' }}>=</span>
            <strong style={{ fontWeight: 700 }}>{dice[0] + dice[1]}</strong>
          </>
        ) : totalShown !== null ? (
          <>
            <span style={{ opacity: 0.55, fontSize: '0.6rem', marginRight: '0.3rem' }}>
              MANUAL
            </span>
            <strong style={{ fontWeight: 700 }}>{totalShown}</strong>
          </>
        ) : (
          <span style={{ letterSpacing: '0.25em' }}>— · —</span>
        )}
      </span>

      {/* Primary action */}
      {!resolved && (
        manualMode ? (
          <button
            type="button"
            onClick={submitManual}
            disabled={rolling}
            style={actionButtonStyle(stateColor, false)}
            title="Submit manual 2d6 total"
          >
            ↵ SUBMIT
          </button>
        ) : (
          <button
            type="button"
            onClick={rollNow}
            disabled={rolling}
            style={actionButtonStyle(stateColor, rolling)}
            title={`Attempt decryption — ${skill}`}
          >
            {rolling ? '· ROLLING ·' : '▶ ROLL'}
          </button>
        )
      )}

      {/* Manual-entry toggle */}
      {!resolved && !rolling && (
        <button
          type="button"
          onClick={() => {
            setManualMode((v) => !v);
            setManualError(false);
            setManualValue('');
          }}
          style={{
            ...labelFont,
            fontSize: '0.65rem',
            letterSpacing: '0.18em',
            padding: '0 0.6rem',
            background: manualMode ? withAlpha(stateColor, 0.18) : 'transparent',
            border: 'none',
            borderLeft: `1px solid ${withAlpha(stateColor, 0.25)}`,
            color: manualMode ? stateColor : withAlpha(stateColor, 0.75),
            cursor: 'pointer',
            textShadow: manualMode ? `0 0 6px ${withAlpha(stateColor, 0.4)}` : 'none',
          }}
          title={manualMode ? 'Cancel manual entry' : 'Enter a table-rolled 2d6 total'}
        >
          {manualMode ? '✕' : '✎'}
        </button>
      )}

      {won && (
        <span style={statusBadgeStyle(TERMINAL_SUCCESS)}>✓ DECRYPTED</span>
      )}

      {locked && (
        <span style={statusBadgeStyle(TERMINAL_ERROR)}>✕ LOCKED</span>
      )}

      {resolved === 'fail' && !locked && (
        <button
          type="button"
          onClick={() => {
            setResolved(null);
            setDice(null);
            setManualError(false);
          }}
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

function actionButtonStyle(color: string, rolling: boolean): React.CSSProperties {
  return {
    ...labelFont,
    fontSize: '0.6rem',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    padding: '0 0.85rem',
    background: 'transparent',
    border: 'none',
    cursor: rolling ? 'wait' : 'pointer',
    color,
    textShadow: `0 0 6px ${withAlpha(color, 0.45)}`,
    opacity: rolling ? 0.6 : 1,
  };
}

function statusBadgeStyle(color: string): React.CSSProperties {
  return {
    ...labelFont,
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0 0.85rem',
    fontSize: '0.6rem',
    letterSpacing: '0.22em',
    color,
    textShadow: `0 0 8px ${withAlpha(color, 0.5)}`,
  };
}
