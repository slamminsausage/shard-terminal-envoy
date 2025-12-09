/**
 * LogListItem Component
 *
 * Individual log entry item in the terminal log list.
 * Extracted from TerminalInterface.
 *
 * Features:
 * - Hover effects
 * - Click to select
 * - Terminal-styled border and background
 */

import React from 'react';

interface LogEntry {
  title: string;
  date?: string;
  author?: string;
  security_level?: string;
}

interface LogListItemProps {
  log: LogEntry;
  onClick: () => void;
}

export default function LogListItem({ log, onClick }: LogListItemProps) {
  return (
    <div
      onClick={onClick}
      className="border border-primary/50 bg-primary/10 p-3 cursor-pointer hover:bg-primary/20 hover:border-accent transition-colors font-mono text-sm"
      style={{ color: 'var(--primary)' }}
    >
      <div className="font-bold">{log.title}</div>
      {log.date && (
        <div className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
          {log.date}
        </div>
      )}
      {log.security_level && (
        <div className="text-xs mt-1" style={{ color: 'var(--warning)' }}>
          Security: {log.security_level}
        </div>
      )}
    </div>
  );
}
