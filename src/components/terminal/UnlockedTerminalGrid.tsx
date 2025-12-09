/**
 * UnlockedTerminalGrid Component
 *
 * Displays a grid of unlocked terminals for quick access.
 * Extracted from TerminalInterface to reduce component complexity.
 *
 * Features:
 * - Grid layout of terminal codes
 * - Hover effects with glow
 * - Loading skeleton state
 * - Click to select terminal
 */

import React from 'react';

interface Terminal {
  code: string;
  name: string;
}

interface UnlockedTerminalGridProps {
  terminals: Terminal[];
  loading: boolean;
  onSelect: (code: string) => void;
}

export default function UnlockedTerminalGrid({
  terminals,
  loading,
  onSelect,
}: UnlockedTerminalGridProps) {
  if (loading) {
    return (
      <div style={{ color: 'var(--text-dim)' }} className="font-mono text-xs">
        Loading available terminals...
      </div>
    );
  }

  if (terminals.length === 0) {
    return (
      <div style={{ color: 'var(--text-dim)' }} className="font-mono text-xs">
        No terminals unlocked yet.
      </div>
    );
  }

  return (
    <div className="terminal-grid">
      {terminals.map((terminal) => (
        <div
          key={terminal.code}
          className="terminal-grid-item"
          onClick={() => onSelect(terminal.code)}
          title={terminal.name}
        >
          <div className="font-bold mb-1" style={{ color: 'var(--primary)' }}>
            {terminal.code}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
            {terminal.name}
          </div>
        </div>
      ))}
    </div>
  );
}
