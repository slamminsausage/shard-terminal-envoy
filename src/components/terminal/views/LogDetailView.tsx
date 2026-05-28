/**
 * LogDetailView Component
 *
 * Displays the detailed content of a selected log entry.
 *
 * Features:
 * - Rich metadata header (title, date, author, location, security, file type)
 * - Decorative gauge sidebar (buffer, signal, decrypt, temp, latency)
 * - Typewriter text display
 * - Live glitch flickering after typing completes
 * - Data stream progress indicator during typing
 * - Audio player (if log has audio)
 * - Back button (shown when typing complete)
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AudioPlayer from '../AudioPlayer';
import VideoPlayer from '../VideoPlayer';
import { useGlitchText } from '@/hooks/useGlitchText';
import { getTerminalBootProfile, getTerminalCategory } from '@/lib/terminalBootProfiles';
import { LogDetailGauges } from '../TerminalGauges';
import { parseLogContent, hasRedactedMarkers } from '@/lib/parseLogContent';

interface LogEntry {
  title: string;
  content?: string;
  audio_file?: string;
  video_file?: string;
  date?: string;
  author?: string;
  location?: string;
  security_level?: string;
  requires_password?: boolean;
  requires_roll?: boolean;
  roll_check?: { difficulty: number; skill: string };
  logs?: any[];
  type?: string;
  action_sequence?: { id: string; category: string; on_complete?: { persist_key?: string; message?: string } };
  signal_interruption?: boolean;
}

interface LogDetailViewProps {
  log: LogEntry;
  displayedText: string;
  typingComplete: boolean;
  onBack: () => void;
  onInitiateSequence?: () => void;
  terminalCode?: string;
  /** Clicking a [[log: title]] link navigates to that log in the current terminal */
  onNavigateLog?: (title: string) => void;
  /** Clicking a [[connect: code]] link connects to another terminal */
  onConnectTerminal?: (code: string) => void;
  /** Whether signal dropout is currently active (typewriter paused mid-read) */
  signalDropout?: boolean;
}

const SECURITY_COLORS: Record<string, string> = {
  unlocked:   '#88ffaa',
  low:        '#3ae2b3',
  medium:     '#00ccff',
  high:       '#ffaa00',
  restricted: '#ff6600',
  critical:   '#ff3344',
};

/** Determine file type label from log properties */
function getFileTypeLabel(log: LogEntry): string {
  if (log.video_file) return 'VIDEO BROADCAST';
  if (log.audio_file || (log.logs && log.logs.length > 0)) return 'AUDIO LOG';
  if (log.requires_password) return 'ENCRYPTED DOCUMENT';
  if (log.content && log.content.length > 2000) return 'EXTENDED LOG';
  return 'STANDARD DOCUMENT';
}

/** Fake file size based on content length */
function fakeFileSize(log: LogEntry): string {
  const len = (log.content?.length || 0) + (log.title?.length || 0);
  const kb = Math.max(1, Math.round(len * 0.42 + 12));
  return kb >= 1000 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

// Cursor character per terminal category
const CATEGORY_CURSORS: Record<string, string> = {
  'corrupted':     '▓',
  'corporate':     '|',
  'high-security': '_',
  'ship-systems':  '▌',
  'criminal':      '▒',
  'maintenance':   '░',
  'default':       '█',
};

export default function LogDetailView({
  log,
  displayedText,
  typingComplete,
  onBack,
  onInitiateSequence,
  terminalCode = '',
  onNavigateLog,
  onConnectTerminal,
  signalDropout = false,
}: LogDetailViewProps) {
  const profile = useMemo(() => getTerminalBootProfile(terminalCode), [terminalCode]);
  const category = useMemo(() => getTerminalCategory(terminalCode), [terminalCode]);
  const { accentColor, dimColor } = profile;
  const secColor = SECURITY_COLORS[log.security_level || ''] || accentColor;

  // Scan-sweep: fires once when log opens, then disappears
  const [showSweep, setShowSweep] = useState(true);
  useEffect(() => {
    setShowSweep(true);
    const t = setTimeout(() => setShowSweep(false), 600);
    return () => clearTimeout(t);
  }, [log.title]);

  const cursorChar = CATEGORY_CURSORS[category] ?? '█';

  // Content with redacted markers or inline links can't be usefully streamed
  // by the char-by-char typewriter — bypass it and render parsed nodes instead.
  const hasRedacted = useMemo(
    () => hasRedactedMarkers(log.content) || /\[\[(log|connect):/i.test(log.content || ''),
    [log.content]
  );

  // Once typing completes, start live glitch flicker on the original content
  const flickeredText = useGlitchText({
    text: log.content || '',
    terminalCode,
    active: typingComplete && !hasRedacted,
  });

  // During typing: show the typewriter output; after typing: show flickered version
  const visibleText = typingComplete ? flickeredText : displayedText;

  // Parsed nodes (used when content contains redacted markers or inline links)
  const parsedNodes = useMemo(
    () =>
      hasRedacted
        ? parseLogContent(log.content || '', {
            accentColor,
            dimColor,
            onNavigateLog,
            onConnectTerminal,
          })
        : null,
    [hasRedacted, log.content, accentColor, dimColor, onNavigateLog, onConnectTerminal]
  );

  // Typing progress (0-100)
  const progress = log.content
    ? Math.min(100, Math.round((displayedText.length / log.content.length) * 100))
    : 100;

  const fileTypeLabel = useMemo(() => getFileTypeLabel(log), [log]);
  const fileSize = useMemo(() => fakeFileSize(log), [log]);

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* ═══ Signal dropout overlay — shown mid-read when typewriter is paused ═══ */}
      {signalDropout && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(1px)',
          }}
        >
          <div
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.7rem',
              letterSpacing: '0.35em',
              color: accentColor,
              textShadow: `0 0 12px ${accentColor}66`,
              animation: 'signal-dropout-blink 0.8s step-end infinite',
              textAlign: 'center',
            }}
          >
            ▌ SIGNAL LOST — RECONNECTING...
          </div>
          <div
            style={{
              marginTop: '0.8rem',
              fontFamily: '"Share Tech Mono", monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.2em',
              color: `${accentColor}55`,
              textAlign: 'center',
            }}
          >
            RELAY PATH INTERRUPTED
          </div>
          <style>{`
            @keyframes signal-dropout-blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.15; }
            }
          `}</style>
        </div>
      )}

      {/* ═══ Scan sweep — one-shot raster line on open ═══ */}
      {showSweep && (
        <div
          className="log-scan-sweep"
          style={{ background: `linear-gradient(180deg, ${accentColor}cc 0%, ${accentColor}44 60%, transparent 100%)` }}
        />
      )}

      {/* ═══ File header panel ═══ */}
      <div
        className="shrink-0 px-4 pt-4 pb-3"
        style={{
          borderBottom: `1px solid ${accentColor}33`,
          boxShadow: secColor !== accentColor ? `0 4px 20px ${secColor}22` : undefined,
        }}
      >
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <h3
            className="text-base font-mono font-bold leading-tight"
            style={{ color: accentColor, textShadow: `0 0 10px ${accentColor}33` }}
          >
            {log.title}
          </h3>
          {log.security_level && (
            <span
              className="font-mono text-xs uppercase tracking-wider px-2 py-0.5 rounded-sm shrink-0"
              style={{
                color: secColor,
                border: `1px solid ${secColor}44`,
                backgroundColor: `${secColor}11`,
                fontSize: '9px',
              }}
            >
              {log.security_level}
            </span>
          )}
        </div>

        {/* Metadata grid */}
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 font-mono" style={{ fontSize: '10px' }}>
          {log.date && (
            <span style={{ color: dimColor }}>
              <span style={{ color: `${dimColor}88` }}>DATE</span>{' '}
              <span style={{ color: accentColor }}>{log.date}</span>
            </span>
          )}
          {log.author && (
            <span style={{ color: dimColor }}>
              <span style={{ color: `${dimColor}88` }}>AUTHOR</span>{' '}
              <span style={{ color: accentColor }}>{log.author}</span>
            </span>
          )}
          {log.location && (
            <span style={{ color: dimColor }}>
              <span style={{ color: `${dimColor}88` }}>LOC</span>{' '}
              <span style={{ color: accentColor }}>{log.location}</span>
            </span>
          )}
          <span style={{ color: dimColor }}>
            <span style={{ color: `${dimColor}88` }}>TYPE</span>{' '}
            <span style={{ color: `${dimColor}cc` }}>{fileTypeLabel}</span>
          </span>
          <span style={{ color: dimColor }}>
            <span style={{ color: `${dimColor}88` }}>SIZE</span>{' '}
            <span style={{ color: `${dimColor}cc` }}>{fileSize}</span>
          </span>
        </div>

        {/* Data stream progress bar (visible during typing, unless redacted) */}
        {!typingComplete && !hasRedacted && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div
                className="flex-1 h-1 rounded-sm overflow-hidden"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <div
                  className="h-full rounded-sm"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: accentColor,
                    boxShadow: `0 0 6px ${accentColor}44`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <span
                className="font-mono tabular-nums shrink-0"
                style={{ fontSize: '8px', color: dimColor }}
              >
                {progress}% DECODED
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Main content area ═══ */}
      <div className="flex-1 overflow-auto flex">
        {/* Log content */}
        <div className="flex-1 p-4">
          <div
            className="whitespace-pre-wrap text-sm font-mono mb-4"
            style={{ color: 'var(--primary)' }}
          >
            {hasRedacted ? (
              <>{parsedNodes}</>
            ) : (
              <>
                {visibleText}
                {!typingComplete && (
                  <span className="animate-pulse" style={{ color: accentColor }}>{cursorChar}</span>
                )}
              </>
            )}
          </div>

          {/* Video player */}
          {log.video_file && (
            <div className="mb-4">
              <VideoPlayer src={log.video_file} label="Holo-Broadcast Playback" accentColor={accentColor} />
            </div>
          )}

          {/* Audio player */}
          {log.audio_file && (
            <div className="mb-4">
              <AudioPlayer src={log.audio_file} label="Audio Log" />
            </div>
          )}

          {/* Action buttons */}
          {typingComplete && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Initiate Sequence button for action sequence logs */}
              {log.type === 'action_sequence' && log.action_sequence && onInitiateSequence && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onInitiateSequence}
                  className="font-mono animate-pulse border-orange-500/60 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300"
                >
                  ▶ INITIATE SEQUENCE
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onBack}>
                ← Back
              </Button>
              <span className="font-mono" style={{ fontSize: '9px', color: `${dimColor}88` }}>
                ESC to return
              </span>
            </div>
          )}
        </div>

        {/* Decorative gauge sidebar (hidden on small screens) */}
        <div
          className="hidden md:flex flex-col shrink-0 w-44 px-3 py-3"
          style={{
            borderLeft: `1px solid ${accentColor}22`,
            backgroundColor: `${accentColor}04`,
          }}
        >
          <div
            className="font-mono uppercase tracking-widest mb-2"
            style={{ fontSize: '8px', color: `${dimColor}88`, fontFamily: 'var(--font-display)' }}
          >
            SYSTEM TELEMETRY
          </div>
          <LogDetailGauges accentColor={accentColor} terminalCode={terminalCode} />
        </div>
      </div>
    </div>
  );
}
