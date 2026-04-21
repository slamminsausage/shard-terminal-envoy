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
  accentColor = '#00ff88',
  dimColor = '#006633',
}: RedactedBlockProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [locked, setLocked] = useState(false);

  return (
    <span
      style={{
        display: 'inline-block',
        verticalAlign: 'baseline',
        padding: '0.15rem 0.3rem',
        borderRadius: 3,
        border: `1px dashed ${unlocked ? '#00ff8844' : locked ? '#ff444466' : `${accentColor}44`}`,
        backgroundColor: unlocked ? '#00ff8808' : locked ? '#ff444411' : 'rgba(0,0,0,0.35)',
        transition: 'all 0.3s',
        whiteSpace: 'pre-wrap',
      }}
    >
      {unlocked ? (
        <CorruptedText text={content} intensity={0.03} color="#aaffcc" />
      ) : locked ? (
        <span style={{ color: '#ff6666', letterSpacing: '0.05em' }}>
          {fillBlocks(content)}
          {'  '}
          <span style={{ fontSize: '0.65rem', color: '#ff4444' }}>
            ✕ PERMANENTLY LOCKED
          </span>
        </span>
      ) : (
        <>
          <span
            style={{
              color: '#ff4444',
              letterSpacing: '0.05em',
              textShadow: '0 0 4px #ff444455',
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
