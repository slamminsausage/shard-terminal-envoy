/**
 * LogDetailView Component
 *
 * Displays the detailed content of a selected log entry.
 * Extracted from TerminalInterface.
 *
 * Features:
 * - Typewriter text display
 * - Audio player (if log has audio)
 * - Back button (shown when typing complete)
 * - Whitespace-preserved formatting
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import AudioPlayer from '../AudioPlayer';

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
}

export default function LogDetailView({
  log,
  displayedText,
  typingComplete,
  onBack,
}: LogDetailViewProps) {
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
        {displayedText}
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
