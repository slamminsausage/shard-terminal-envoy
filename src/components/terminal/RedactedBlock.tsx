/**
 * RedactedBlock — inline ████████ block hiding secret content.
 *
 * Starts locked. Displays a DiceRoller; on success the redacted text
 * swaps to CorruptedText revealing the hidden content. On max-attempt
 * failure the block permanently locks as "PERMANENTLY LOCKED".
 *
 * Authored inline in log content via the markup:
 *   [[redacted diff=10 skill="Electronics (Computers)" attempts=3]]
 *   the hidden content
 *   [[/redacted]]
 */

import { useState } from 'react';
import DiceRoller from './DiceRoller';
import CorruptedText from './CorruptedText';
import {
  TERMINAL_ACCENT,
  TERMINAL_DIM,
  TERMINAL_SUCCESS,
  TERMINAL_ERROR,
  withAlpha,
} from '@/lib/terminalPalette';

export interface RedactedBlockProps {
  content: string;
  difficulty?: number;
  skill?: string;
  maxAttempts?: number;
  accentColor?: string;
  dimColor?: string;
}

function fillBlocks(content: string): string {
  return content
    .split('\n')
    .map((line) => {
      const words = line.split(/(\s+)/);
      return words
        .map((part) => (/\s+/.test(part) ? part : '█'.repeat(part.length || 1)))
        .join('');
    })
    .join('\n');
}

export default function RedactedBlock({
  content,
  difficulty = 10,
  skill = 'Electronics (Computers)',
  maxAttempts = 3,
  accentColor = TERMINAL_ACCENT,
  dimColor = TERMINAL_DIM,
}: RedactedBlockProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [locked, setLocked] = useState(false);

  const stateColor = unlocked
    ? TERMINAL_SUCCESS
    : locked
      ? TERMINAL_ERROR
      : accentColor;

  return (
    <span
      style={{
        display: 'inline-block',
        verticalAlign: 'baseline',
        padding: '0.15rem 0.3rem',
        borderRadius: 3,
        border: `1px dashed ${withAlpha(stateColor, 0.35)}`,
        backgroundColor: withAlpha(stateColor, unlocked ? 0.04 : locked ? 0.08 : 0.03),
        transition: 'all 0.3s',
        whiteSpace: 'pre-wrap',
      }}
    >
      {unlocked ? (
        <CorruptedText
          text={content}
          intensity={0.03}
          color={withAlpha(TERMINAL_SUCCESS, 0.85)}
        />
      ) : locked ? (
        <span style={{ color: TERMINAL_ERROR, letterSpacing: '0.05em' }}>
          {fillBlocks(content)}
          {'  '}
          <span
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.6rem',
              letterSpacing: '0.22em',
              color: TERMINAL_ERROR,
            }}
          >
            ✕ PERMANENTLY LOCKED
          </span>
        </span>
      ) : (
        <>
          <span
            style={{
              color: TERMINAL_ERROR,
              letterSpacing: '0.05em',
              textShadow: `0 0 4px ${withAlpha(TERMINAL_ERROR, 0.35)}`,
              userSelect: 'none',
            }}
          >
            {fillBlocks(content)}
          </span>
          <span style={{ marginLeft: '0.5rem' }}>
            <DiceRoller
              difficulty={difficulty}
              skill={skill}
              maxAttempts={maxAttempts}
              accentColor={accentColor}
              dimColor={dimColor}
              onResult={(r) => {
                if (r.success) setUnlocked(true);
              }}
              onExhausted={() => setLocked(true)}
            />
          </span>
        </>
      )}
    </span>
  );
}
