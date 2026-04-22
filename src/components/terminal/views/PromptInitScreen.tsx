/**
 * PromptInitScreen — prototype-faithful command-line init screen.
 *
 * Visual layout (matches screenshot):
 *   ┌─ DataStreamBg matrix backdrop ─────────────────────────┐
 *   │   TRAVELLER TERMINAL                                   │
 *   │   MAINFRAME INTERFACE v5.0                             │
 *   │   SHARD://MAINFRAME/ACCESS                             │
 *   │                                                         │
 *   │   > HELP                                                │
 *   │     available commands…                                 │
 *   │   > _                                                   │  ← active prompt
 *   │                                                         │
 *   │   [ VANAGANDR001 ] [ FUWNET ] [ ES1-GAMMA ] [ BLACKTALON ]
 *   └─────────────────────────────────────────────────────────┘
 *
 * Supported commands (case-insensitive):
 *   HELP                 — show commands
 *   LS / LIST            — list unlocked terminals
 *   CONNECT <code>       — connect to terminal code
 *   CONNECT              — connect using currently-typed code via Enter
 *   CLEAR                — clear history
 *   <code>               — treated as CONNECT <code> for convenience
 *
 * Arrow Up / Down cycle command history. Enter submits.
 */

import React, { useEffect, useRef, useState } from 'react';
import DataStreamBg from '@/components/effects/DataStreamBg';
import { QUICK_CONNECT_CODES } from '@/lib/terminalThemes';
import { TERMINALS } from '@/lib/terminals';
import {
  TERMINAL_ACCENT,
  TERMINAL_ACCENT_BRIGHT,
  TERMINAL_DIM,
  TERMINAL_DIM_SOFT,
  TERMINAL_ERROR,
  TERMINAL_WARN,
  withAlpha,
} from '@/lib/terminalPalette';

interface Terminal {
  code: string;
  name: string;
}

interface HistoryEntry {
  type: 'prompt' | 'output' | 'error' | 'info';
  text: string;
}

interface PromptInitScreenProps {
  unlockedTerminals: Terminal[];
  onConnect: (code: string) => void;
  loading?: boolean;
  errorMessage?: string | null;
  /** When true, unlocks the secret "SUDO CODES" GM reveal command. */
  isGM?: boolean;
}

const BANNER_LINES: Array<{ text: string; size: string; color: string }> = [
  { text: 'TRAVELLER TERMINAL',         size: '2rem',   color: TERMINAL_ACCENT },
  { text: 'MAINFRAME INTERFACE v5.0',   size: '0.9rem', color: withAlpha(TERMINAL_ACCENT, 0.82) },
  { text: 'SHARD://MAINFRAME/ACCESS',   size: '0.7rem', color: TERMINAL_DIM },
];

const INTRO_LINES: HistoryEntry[] = [
  { type: 'info',   text: '>> SECURE SHELL v5.0 — SHARD MAINFRAME' },
  { type: 'info',   text: '>> AUTHENTICATED // SESSION ACTIVE' },
  { type: 'info',   text: '>> Type HELP for command list, or click a quick-connect button below.' },
];

const HELP_TEXT = [
  'AVAILABLE COMMANDS:',
  '  HELP                 Show this message',
  '  LS | LIST            List unlocked terminals',
  '  CONNECT <CODE>       Establish link to a terminal',
  '  CLEAR                Clear prompt history',
  '  <CODE>               Shorthand for CONNECT <CODE>',
  '',
  'Use ↑ / ↓ to recall previous commands.',
].join('\n');

export default function PromptInitScreen({
  unlockedTerminals,
  onConnect,
  loading = false,
  errorMessage,
  isGM = false,
}: PromptInitScreenProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>(INTRO_LINES);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const appendHistory = (entries: HistoryEntry[]) => {
    setHistory((h) => [...h, ...entries]);
  };

  const runCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    setCommandHistory((h) => [...h, trimmed]);
    setHistoryIdx(null);

    appendHistory([{ type: 'prompt', text: `> ${trimmed}` }]);

    const upper = trimmed.toUpperCase();
    const [cmd, ...rest] = upper.split(/\s+/);
    const arg = rest.join(' ');

    if (cmd === 'HELP' || cmd === '?') {
      appendHistory([{ type: 'output', text: HELP_TEXT }]);
      return;
    }

    if (cmd === 'CLEAR' || cmd === 'CLS') {
      setHistory(INTRO_LINES);
      return;
    }

    if (cmd === 'LS' || cmd === 'LIST' || cmd === 'DIR') {
      if (unlockedTerminals.length === 0) {
        appendHistory([
          { type: 'output', text: 'No unlocked terminals yet. Try one of the quick-connect codes below.' },
        ]);
      } else {
        const lines = unlockedTerminals
          .map((t) => `  ${t.code.padEnd(22)}  ${t.name}`)
          .join('\n');
        appendHistory([
          { type: 'output', text: `UNLOCKED TERMINALS (${unlockedTerminals.length}):\n${lines}` },
        ]);
      }
      return;
    }

    if (cmd === 'CONNECT') {
      if (!arg) {
        appendHistory([{ type: 'error', text: 'Usage: CONNECT <CODE>' }]);
        return;
      }
      appendHistory([{ type: 'info', text: `>> Dialing ${arg}…` }]);
      onConnect(arg);
      return;
    }

    // Secret GM reveal — intentionally undocumented. Non-GMs get a
    // bash-style "not found" so the command stays hidden in play.
    if (cmd === 'SUDO') {
      const sub = rest[0];
      if (sub !== 'CODES' && sub !== 'LS' && sub !== 'CAT') {
        appendHistory([
          { type: 'error', text: `sudo: ${(sub || '').toLowerCase() || 'usage'}: command not found` },
        ]);
        return;
      }
      if (!isGM) {
        appendHistory([
          { type: 'error', text: 'sudo: authentication failure · elevated access denied' },
        ]);
        return;
      }
      const lines = TERMINALS.map((t) => {
        const dc = t.requiresRoll ? `  [DC ${t.requiresRoll}]` : '';
        return `  ${t.code.padEnd(22)}  ${t.name}${dc}`;
      }).join('\n');
      appendHistory([
        {
          type: 'output',
          text: `[GM OVERRIDE] ALL TERMINAL CODES (${TERMINALS.length}):\n${lines}`,
        },
      ]);
      return;
    }

    // Bare token → treat as connect shorthand
    appendHistory([{ type: 'info', text: `>> Dialing ${upper}…` }]);
    onConnect(upper);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = input;
      setInput('');
      runCommand(val);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const next = historyIdx === null
        ? commandHistory.length - 1
        : Math.max(0, historyIdx - 1);
      setHistoryIdx(next);
      setInput(commandHistory[next]);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === null) return;
      const next = historyIdx + 1;
      if (next >= commandHistory.length) {
        setHistoryIdx(null);
        setInput('');
      } else {
        setHistoryIdx(next);
        setInput(commandHistory[next]);
      }
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const upper = input.toUpperCase();
      const match = unlockedTerminals.find((t) =>
        t.code.toUpperCase().startsWith(upper)
      );
      if (match) setInput(match.code.toUpperCase());
    }
  };

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      style={{
        backgroundColor: '#000',
        color: TERMINAL_ACCENT,
        fontFamily: '"Share Tech Mono", monospace',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Matrix data-stream backdrop */}
      <DataStreamBg accentColor={TERMINAL_ACCENT} opacity={0.14} />

      {/* Scanline overlay */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `repeating-linear-gradient(180deg, ${withAlpha(TERMINAL_ACCENT, 0.035)} 0px, ${withAlpha(TERMINAL_ACCENT, 0.035)} 1px, transparent 1px, transparent 3px)`,
          mixBlendMode: 'overlay',
        }}
      />

      <div
        className="relative z-10 w-full h-full flex flex-col"
        style={{ maxWidth: 960, padding: '2.5rem 2rem' }}
      >
        {/* Banner */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          {BANNER_LINES.map((line) => (
            <div
              key={line.text}
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: line.size === '2rem' ? 700 : 500,
                fontSize: line.size,
                letterSpacing: '0.35em',
                color: line.color,
                textShadow: `0 0 18px ${withAlpha(line.color, 0.4)}`,
                lineHeight: 1.4,
              }}
            >
              {line.text}
            </div>
          ))}
        </div>

        {/* Horizontal divider */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, ${withAlpha(TERMINAL_ACCENT, 0.33)}, transparent)`,
            margin: '0.5rem 0 1rem',
          }}
        />

        {/* Prompt history */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.5rem 0.25rem',
            fontSize: '0.82rem',
            lineHeight: 1.6,
            minHeight: 0,
          }}
        >
          {history.map((entry, i) => (
            <div
              key={i}
              style={{
                whiteSpace: 'pre-wrap',
                color:
                  entry.type === 'prompt'
                    ? TERMINAL_ACCENT
                    : entry.type === 'error'
                      ? TERMINAL_ERROR
                      : entry.type === 'info'
                        ? withAlpha(TERMINAL_ACCENT, 0.75)
                        : TERMINAL_ACCENT_BRIGHT,
                textShadow:
                  entry.type === 'prompt'
                    ? `0 0 6px ${withAlpha(TERMINAL_ACCENT, 0.35)}`
                    : undefined,
                marginBottom: '0.15rem',
              }}
            >
              {entry.text}
            </div>
          ))}

          {/* Active prompt */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: TERMINAL_ACCENT, marginRight: '0.4rem' }}>
              shard@mainframe:~$
            </span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: TERMINAL_ACCENT,
                fontFamily: 'inherit',
                fontSize: 'inherit',
                flex: 1,
                caretColor: TERMINAL_ACCENT,
                textShadow: `0 0 6px ${withAlpha(TERMINAL_ACCENT, 0.35)}`,
              }}
            />
            <span
              aria-hidden
              style={{
                width: 9,
                height: 16,
                marginLeft: -2,
                background: TERMINAL_ACCENT,
                boxShadow: `0 0 6px ${withAlpha(TERMINAL_ACCENT, 0.66)}`,
                animation: 'promptCursorBlink 1s steps(2) infinite',
              }}
            />
          </div>

          {errorMessage && (
            <div style={{ color: TERMINAL_WARN, marginTop: '0.25rem' }}>
              {errorMessage}
            </div>
          )}
        </div>

        {/* Quick-connect buttons */}
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #3ae2b322',
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {QUICK_CONNECT_CODES.map((qc) => (
            <button
              key={qc.code}
              onClick={() => {
                appendHistory([{ type: 'prompt', text: `> CONNECT ${qc.code}` }]);
                onConnect(qc.code);
              }}
              disabled={loading}
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.72rem',
                letterSpacing: '0.2em',
                color: TERMINAL_ACCENT,
                background: withAlpha(TERMINAL_ACCENT, 0.08),
                border: `1px solid ${withAlpha(TERMINAL_ACCENT, 0.33)}`,
                padding: '0.5rem 1rem',
                cursor: loading ? 'wait' : 'pointer',
                textShadow: `0 0 6px ${withAlpha(TERMINAL_ACCENT, 0.35)}`,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = withAlpha(TERMINAL_ACCENT, 0.2);
                e.currentTarget.style.boxShadow = `0 0 10px ${withAlpha(TERMINAL_ACCENT, 0.35)}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = withAlpha(TERMINAL_ACCENT, 0.08);
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ► {qc.label}
            </button>
          ))}
        </div>

        <div
          style={{
            textAlign: 'center',
            marginTop: '0.75rem',
            fontSize: '0.62rem',
            letterSpacing: '0.2em',
            color: TERMINAL_DIM_SOFT,
          }}
        >
          ↑ / ↓ RECALL COMMAND  ·  TAB AUTOCOMPLETE  ·  ESC BACK
        </div>
      </div>

      <style>{`
        @keyframes promptCursorBlink {
          0%, 50%   { opacity: 1; }
          50.01%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
