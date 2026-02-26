/**
 * TerminalBootScreen
 *
 * Per-terminal themed boot sequence shown while logs are loading.
 * Profile (colors, messages, progress style) is derived from the
 * terminal's category via getTerminalBootProfile().
 *
 * Also handles the ghost-terminal easter egg: a ~2% chance that a
 * cryptic "recovered transmission" flickers on screen for 2.5 seconds
 * before the normal boot sequence begins.
 */

import React, { useEffect, useState, useRef } from 'react';
import { TerminalDefinition } from '@/lib/terminals';
import {
  getTerminalBootProfile,
  GHOST_PROBABILITY,
  GHOST_MESSAGES,
  ProgressStyle,
} from '@/lib/terminalBootProfiles';

interface TerminalBootScreenProps {
  terminal: TerminalDefinition;
}

// ── Ghost phase ────────────────────────────────────────────────────────────────

const GHOST_DISPLAY_MS = 2600;

function GhostOverlay({ message, onDone }: { message: string; onDone: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 400); // fade-out buffer
    }, GHOST_DISPLAY_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="h-full w-full flex items-center justify-center"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
        background: 'black',
      }}
    >
      <div
        className="max-w-xl w-full p-6 font-mono text-sm leading-7 whitespace-pre-wrap"
        style={{
          color: '#ff3333',
          border: '1px solid #ff333344',
          borderRadius: 4,
          boxShadow: '0 0 30px rgba(255,50,50,0.15)',
          animation: 'ghost-flicker 0.2s ease-in-out infinite alternate',
        }}
      >
        <style>{`
          @keyframes ghost-flicker {
            0%   { opacity: 0.85; }
            100% { opacity: 1; }
          }
        `}</style>
        <div
          className="text-xs mb-4 tracking-widest"
          style={{ color: '#ff555566', fontFamily: 'Orbitron, sans-serif' }}
        >
          !! ANOMALOUS DATA DETECTED — PURGING...
        </div>
        {message}
      </div>
    </div>
  );
}

// ── Progress bar variants ──────────────────────────────────────────────────────

function ProgressBar({
  style,
  accentColor,
}: {
  style: ProgressStyle;
  accentColor: string;
}) {
  const hex = accentColor;
  const glow = `0 0 14px ${hex}55`;

  if (style === 'pulse') {
    return (
      <div className="flex items-center gap-2 mt-1">
        <style>{`
          @keyframes pulse-dot {
            0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
            40%            { opacity: 1;   transform: scale(1.1); }
          }
        `}</style>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: hex,
              boxShadow: glow,
              animation: `pulse-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    );
  }

  const animationName =
    style === 'fast'  ? 'boot-fast'  :
    style === 'stall' ? 'boot-stall' :
                        'boot-glide';

  return (
    <div
      className="overflow-hidden rounded-sm mt-1"
      style={{
        height: 6,
        background: `${hex}18`,
        border: `1px solid ${hex}33`,
      }}
    >
      <style>{`
        @keyframes boot-glide {
          0%   { transform: translateX(-60%); opacity: 0.6; }
          50%  { transform: translateX(30%);  opacity: 1;   }
          100% { transform: translateX(110%); opacity: 0.6; }
        }
        @keyframes boot-fast {
          0%   { width: 0%;   opacity: 1; }
          85%  { width: 100%; opacity: 1; }
          100% { width: 100%; opacity: 0.7; }
        }
        @keyframes boot-stall {
          0%   { width: 0%;   opacity: 1;   }
          35%  { width: 52%;  opacity: 1;   }
          45%  { width: 48%;  opacity: 0.4; }
          50%  { width: 52%;  opacity: 1;   }
          55%  { width: 50%;  opacity: 0.3; }
          60%  { width: 53%;  opacity: 1;   }
          90%  { width: 100%; opacity: 1;   }
          100% { width: 100%; opacity: 0.8; }
        }
      `}</style>

      {style === 'glide' ? (
        <div
          style={{
            height: '100%',
            width: '45%',
            background: `linear-gradient(90deg, transparent, ${hex}88, ${hex}, ${hex}88, transparent)`,
            boxShadow: glow,
            animation: 'boot-glide 2.2s ease-in-out infinite',
          }}
        />
      ) : (
        <div
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${hex}99, ${hex})`,
            boxShadow: glow,
            animation: `${animationName} 3s ease-out forwards`,
          }}
        />
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function TerminalBootScreen({ terminal }: TerminalBootScreenProps) {
  const profile = getTerminalBootProfile(terminal.code);
  const [phase, setPhase] = useState<'ghost' | 'boot'>('boot');
  const [visibleLines, setVisibleLines] = useState(0);
  const ghostRolledRef = useRef(false);

  // Decide ghost phase on first mount only
  useEffect(() => {
    if (ghostRolledRef.current) return;
    ghostRolledRef.current = true;

    if (Math.random() < GHOST_PROBABILITY) {
      setPhase('ghost');
    }
  }, []);

  // Reveal boot messages line-by-line
  useEffect(() => {
    if (phase !== 'boot') return;

    setVisibleLines(0);
    const count = profile.bootMessages.length;
    // Spread reveals across 80% of minDisplayMs so last line appears before transition
    const interval = (profile.minDisplayMs * 0.8) / count;

    const timer = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= count) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [phase, profile]);

  const { accentColor, dimColor } = profile;

  const lineColor = (msg: string) => {
    if (msg.includes('[ERROR]'))   return '#ff4444';
    if (msg.includes('[WARNING]')) return '#ff8800';
    if (msg.includes('[CAUTION]')) return '#ffaa00';
    if (msg.includes('[SCAN]'))    return accentColor;
    return accentColor;
  };

  // Ghost phase rendering
  if (phase === 'ghost') {
    const msg = GHOST_MESSAGES[Math.floor(Math.random() * GHOST_MESSAGES.length)];
    return (
      <div className="h-full w-full bg-background crt-container flex items-center justify-center px-6">
        <GhostOverlay message={msg} onDone={() => setPhase('boot')} />
      </div>
    );
  }

  // Normal boot phase
  return (
    <div className="h-full w-full bg-background crt-container flex items-center justify-center px-6">
      <div className="w-full max-w-3xl space-y-6">
        <div
          className="rounded-lg p-6"
          style={{
            border: `1px solid ${accentColor}44`,
            background: 'rgba(0,0,0,0.75)',
            boxShadow: `0 0 28px ${accentColor}22`,
          }}
        >
          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <div
              className="text-xs font-mono tracking-widest"
              style={{ color: accentColor, fontFamily: 'Orbitron, sans-serif' }}
            >
              {profile.headerLabel}
            </div>
            <div
              className="text-xs font-mono"
              style={{ color: dimColor }}
            >
              {terminal.code.toUpperCase()}
            </div>
          </div>

          {/* Progress bar */}
          <ProgressBar style={profile.progressStyle} accentColor={accentColor} />

          {/* Boot messages */}
          <div className="mt-6 font-mono text-sm leading-7 space-y-0.5 min-h-[200px]">
            {profile.bootMessages.slice(0, visibleLines).map((msg, i) => (
              <div
                key={i}
                className="whitespace-pre-wrap"
                style={{
                  color: lineColor(msg),
                  opacity: i === visibleLines - 1 ? 1 : 0.75,
                  animation: i === visibleLines - 1 ? 'fadeInLine 0.15s ease-out' : undefined,
                }}
              >
                {msg}
              </div>
            ))}
            {/* Blinking cursor on last line */}
            {visibleLines > 0 && visibleLines < profile.bootMessages.length && (
              <span
                style={{ color: accentColor }}
                className="animate-pulse"
              >
                █
              </span>
            )}
          </div>

          {/* Footer hint */}
          <div
            className="mt-5 text-right text-xs font-mono"
            style={{ color: dimColor }}
          >
            PRESS ESC TO SKIP
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInLine {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
      `}</style>
    </div>
  );
}
