/**
 * LogListItem Component
 *
 * Individual log entry item in the terminal log list.
 * Extracted from TerminalInterface.
 *
 * Features:
 * - Hover effects with terminal accent color
 * - Click to select
 * - Terminal-styled border and background
 * - Title flicker for corrupted terminals
 */

import React, { useState, useMemo } from 'react';
import { useGlitchText } from '@/hooks/useGlitchText';
import { getGlitchIntensity } from '@/lib/glitchText';

interface LogEntry {
  title: string;
  date?: string;
  author?: string;
  security_level?: string;
}

interface LogListItemProps {
  log: LogEntry;
  onClick: () => void;
  accentColor?: string;
  terminalCode?: string;
}

export default function LogListItem({ log, onClick, accentColor, terminalCode }: LogListItemProps) {
  const [hovered, setHovered] = useState(false);

  const shouldFlicker = useMemo(
    () => terminalCode ? getGlitchIntensity(terminalCode) >= 0.01 : false,
    [terminalCode]
  );

  const flickeredTitle = useGlitchText({
    text: log.title,
    terminalCode: terminalCode || '',
    active: shouldFlicker,
  });

  const hoverStyle = hovered && accentColor
    ? {
        borderColor: accentColor,
        backgroundColor: `${accentColor}18`,
        boxShadow: `0 0 12px ${accentColor}22`,
        color: accentColor,
      }
    : { color: 'var(--primary)' };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="border border-primary/50 bg-primary/10 p-3 cursor-pointer transition-colors font-mono text-sm"
      style={hoverStyle}
    >
      <div className="font-bold">{shouldFlicker ? flickeredTitle : log.title}</div>
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
