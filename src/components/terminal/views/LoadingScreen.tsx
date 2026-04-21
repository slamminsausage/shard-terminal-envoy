/**
 * LoadingScreen — shown while the terminal tab boots.
 *
 * Styled to match PromptInitScreen so the boot → init transition
 * feels continuous:
 *   - DataStreamBg matrix backdrop in the shared TERMINAL_ACCENT
 *   - Orbitron banner (TRAVELLER TERMINAL / MAINFRAME INTERFACE v5.0)
 *   - Bordered console panel with progress bar + typed boot messages
 *
 * ESC skips.
 */

import React from 'react';
import DataStreamBg from '@/components/effects/DataStreamBg';
import {
  TERMINAL_ACCENT,
  TERMINAL_DIM,
  TERMINAL_DIM_SOFT,
  withAlpha,
} from '@/lib/terminalPalette';

interface LoadingScreenProps {
  initText: string;
  onSkip: () => void;
}

export default function LoadingScreen({ initText, onSkip }: LoadingScreenProps) {
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onSkip]);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center"
      style={{
        backgroundColor: '#000',
        color: TERMINAL_ACCENT,
        fontFamily: '"Share Tech Mono", monospace',
      }}
    >
      {/* Matrix backdrop — same color family as PromptInitScreen */}
      <DataStreamBg accentColor={TERMINAL_ACCENT} opacity={0.14} />

      {/* Scanline overlay */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'repeating-linear-gradient(180deg, rgba(58,226,179,0.04) 0px, rgba(58,226,179,0.04) 1px, transparent 1px, transparent 3px)',
          mixBlendMode: 'overlay',
        }}
      />

      <div
        className="relative z-10 w-full flex flex-col items-center"
        style={{ maxWidth: 820, padding: '2rem 1.75rem' }}
      >
        {/* Banner matches PromptInitScreen */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 700,
              fontSize: '1.75rem',
              letterSpacing: '0.35em',
              color: TERMINAL_ACCENT,
              textShadow: `0 0 18px ${withAlpha(TERMINAL_ACCENT, 0.4)}`,
              lineHeight: 1.4,
            }}
          >
            TRAVELLER TERMINAL
          </div>
          <div
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 500,
              fontSize: '0.82rem',
              letterSpacing: '0.35em',
              color: withAlpha(TERMINAL_ACCENT, 0.8),
              textShadow: `0 0 12px ${withAlpha(TERMINAL_ACCENT, 0.3)}`,
            }}
          >
            MAINFRAME INTERFACE v5.0
          </div>
          <div
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 500,
              fontSize: '0.62rem',
              letterSpacing: '0.35em',
              color: TERMINAL_DIM,
            }}
          >
            SHARD://MAINFRAME/ACCESS
          </div>
        </div>

        {/* Bordered console panel */}
        <div
          className="w-full"
          style={{
            border: `1px solid ${withAlpha(TERMINAL_ACCENT, 0.3)}`,
            background: 'rgba(0,0,0,0.55)',
            boxShadow: `0 0 24px ${withAlpha(TERMINAL_ACCENT, 0.12)}, inset 0 0 32px rgba(0,0,0,0.35)`,
            borderRadius: 4,
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-4 py-2"
            style={{
              borderBottom: `1px solid ${withAlpha(TERMINAL_ACCENT, 0.18)}`,
              background: `linear-gradient(180deg, ${withAlpha(TERMINAL_ACCENT, 0.08)} 0%, transparent 100%)`,
            }}
          >
            <span
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.65rem',
                letterSpacing: '0.3em',
                color: TERMINAL_ACCENT,
              }}
            >
              SYSTEM BOOT
            </span>
            <span
              style={{
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: '0.6rem',
                letterSpacing: '0.2em',
                color: TERMINAL_DIM,
              }}
            >
              PRESS ESC TO SKIP
            </span>
          </div>

          {/* Progress bar */}
          <div
            className="mx-4 mt-3 overflow-hidden"
            style={{
              height: 3,
              background: withAlpha(TERMINAL_ACCENT, 0.1),
              borderRadius: 1,
            }}
          >
            <div
              style={{
                height: '100%',
                width: '40%',
                background: `linear-gradient(90deg, transparent, ${TERMINAL_ACCENT}, transparent)`,
                boxShadow: `0 0 10px ${withAlpha(TERMINAL_ACCENT, 0.6)}`,
                animation: 'loading-bar-glide 2.4s ease-in-out infinite',
              }}
            />
          </div>

          {/* Boot text */}
          <div
            className="px-4 py-4 whitespace-pre-wrap"
            style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '0.8rem',
              lineHeight: 1.7,
              color: TERMINAL_ACCENT,
              textShadow: `0 0 6px ${withAlpha(TERMINAL_ACCENT, 0.35)}`,
              minHeight: '10rem',
            }}
          >
            {initText}
          </div>
        </div>

        <div
          style={{
            marginTop: '0.75rem',
            fontSize: '0.6rem',
            letterSpacing: '0.25em',
            color: TERMINAL_DIM_SOFT,
          }}
        >
          ESTABLISHING SHARD MAINFRAME LINK…
        </div>
      </div>

      <style>{`
        @keyframes loading-bar-glide {
          0%   { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }
      `}</style>
    </div>
  );
}
