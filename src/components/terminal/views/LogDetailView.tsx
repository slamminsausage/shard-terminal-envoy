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

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import AudioPlayer from '../AudioPlayer';
import { useGlitchText } from '@/hooks/useGlitchText';
import { getTerminalBootProfile } from '@/lib/terminalBootProfiles';
import { LogDetailGauges } from '../TerminalGauges';

interface LogEntry {
  title: string;
  content?: string;
  audio_file?: string;
  date?: string;
  author?: string;
  location?: string;
  security_level?: string;
  requires_password?: boolean;
  requires_roll?: boolean;
  roll_check?: { difficulty: number; skill: string };
  logs?: any[];
}

interface LogDetailViewProps {
  log: LogEntry;
  displayedText: string;
  typingComplete: boolean;
  onBack: () => void;
  terminalCode?: string;
}

const SECURITY_COLORS: Record<string, string> = {
  unlocked:   '#88ffaa',
  low:        '#00ff00',
  medium:     '#00ccff',
  high:       '#ffaa00',
  restricted: '#ff6600',
  critical:   '#ff3344',
};

/** Determine file type label from log properties */
function getFileTypeLabel(log: LogEntry): string {
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

export default function LogDetailView({
  log,
  displayedText,
  typingComplete,
  onBack,
  terminalCode = '',
}: LogDetailViewProps) {
  const profile = useMemo(() => getTerminalBootProfile(terminalCode), [terminalCode]);
  const { accentColor, dimColor } = profile;
  const secColor = SECURITY_COLORS[log.security_level || ''] || accentColor;

  // Once typing completes, start live glitch flicker on the original content
  const flickeredText = useGlitchText({
    text: log.content || '',
    terminalCode,
    active: typingComplete,
  });

  // During typing: show the typewriter output; after typing: show flickered version
  const visibleText = typingComplete ? flickeredText : displayedText;

  // Typing progress (0-100)
  const progress = log.content
    ? Math.min(100, Math.round((displayedText.length / log.content.length) * 100))
    : 100;

  const fileTypeLabel = useMemo(() => getFileTypeLabel(log), [log]);
  const fileSize = useMemo(() => fakeFileSize(log), [log]);

  return (
    <div className="flex flex-col h-full">
      {/* ═══ File header panel ═══ */}
      <div
        className="shrink-0 px-4 pt-4 pb-3"
        style={{ borderBottom: `1px solid ${accentColor}33` }}
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

        {/* Data stream progress bar (visible during typing) */}
        {!typingComplete && (
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
          <div className="whitespace-pre-wrap text-sm font-mono mb-4" style={{ color: 'var(--primary)' }}>
            {visibleText}
            {!typingComplete && (
              <span className="animate-pulse" style={{ color: accentColor }}>█</span>
            )}
          </div>

          {/* Audio player */}
          {log.audio_file && (
            <div className="mb-4">
              <AudioPlayer src={log.audio_file} label="Audio Log" />
            </div>
          )}

          {/* Back button */}
          {typingComplete && (
            <div className="flex items-center gap-3">
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
