/**
 * LogDetailView Component
 *
 * Displays the detailed content of a selected log entry.
 * Extracted from TerminalInterface.
 *
 * Features:
 * - Typewriter text display
 * - Live glitch flickering after typing completes (intensity varies by terminal)
 * - Audio player (if log has audio)
 * - Back button (shown when typing complete)
 * - Whitespace-preserved formatting
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import AudioPlayer from '../AudioPlayer';
import { useGlitchText } from '@/hooks/useGlitchText';

interface LogEntry {
  title: string;
  content?: string;
  audio_file?: string;
  date?: string;
  author?: string;
}

interface LogDetailViewProps {
  log: LogEntry;
  displayedText: string;
  typingComplete: boolean;
  onBack: () => void;
  terminalCode?: string;
}

export default function LogDetailView({
  log,
  displayedText,
  typingComplete,
  onBack,
  terminalCode = '',
}: LogDetailViewProps) {
  // Once typing completes, start live glitch flicker on the original content
  const flickeredText = useGlitchText({
    text: log.content || '',
    terminalCode,
    active: typingComplete,
  });

  // During typing: show the typewriter output; after typing: show flickered version
  const visibleText = typingComplete ? flickeredText : displayedText;

  return (
    <div className="p-4">
      {/* Log header */}
      <div className="mb-4 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-base font-mono font-bold" style={{ color: 'var(--primary)' }}>
          {log.title}
        </h3>
        {log.date && (
          <div className="text-xs font-mono mt-1" style={{ color: 'var(--text-dim)' }}>
            Date: {log.date}
          </div>
        )}
        {log.author && (
          <div className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
            Author: {log.author}
          </div>
        )}
      </div>

      {/* Log content */}
      <div className="whitespace-pre-wrap text-sm font-mono mb-4" style={{ color: 'var(--primary)' }}>
        {visibleText}
      </div>

      {/* Audio player */}
      {log.audio_file && (
        <div className="mb-4">
          <AudioPlayer src={log.audio_file} label="Audio Log" />
        </div>
      )}

      {/* Back button */}
      {typingComplete && (
        <Button variant="outline" size="sm" onClick={onBack}>
          Back
        </Button>
      )}
    </div>
  );
}
