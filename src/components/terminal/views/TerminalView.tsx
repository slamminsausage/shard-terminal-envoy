/**
 * TerminalView Component
 *
 * Displays the list of logs for a connected terminal.
 * Extracted from TerminalInterface.
 *
 * Features:
 * - Scrollable log list
 * - Log selection
 * - Back button to return to init screen
 * - Terminal name header
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import LogListItem from './LogListItem';

interface LogEntry {
  title: string;
  date?: string;
  author?: string;
  security_level?: string;
}

interface Terminal {
  name: string;
  code: string;
  logPath: string;
}

interface TerminalViewProps {
  terminal: Terminal;
  logs: LogEntry[];
  onLogSelect: (log: LogEntry) => void;
  onBack: () => void;
}

export default function TerminalView({
  terminal,
  logs,
  onLogSelect,
  onBack,
}: TerminalViewProps) {
  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-lg font-mono font-bold" style={{ color: 'var(--primary)' }}>
          {terminal.name}
        </h2>
        <div className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
          {terminal.code}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <LogListItem
              key={index}
              log={log}
              onClick={() => onLogSelect(log)}
            />
          ))
        ) : (
          <div style={{ color: 'var(--text-dim)' }} className="font-mono text-sm p-4 text-center">
            No logs available
          </div>
        )}
      </div>

      <Button variant="outline" size="sm" onClick={onBack}>
        Back
      </Button>
    </div>
  );
}
