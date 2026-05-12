/**
 * TerminalLink — inline clickable reference rendered inside log content.
 *
 * Two variants:
 *   [[log: Title of Log]]          → navigates to that log in the current terminal
 *   [[connect: terminal_code]]     → connects to another terminal
 *
 * Rendered as a styled terminal-accent anchor that fits inline with
 * the typewriter / parsed text flow.
 */

import React from 'react';

interface TerminalLinkProps {
  variant: 'log' | 'connect';
  target: string;
  onNavigateLog?: (title: string) => void;
  onConnectTerminal?: (code: string) => void;
  accentColor?: string;
}

export default function TerminalLink({
  variant,
  target,
  onNavigateLog,
  onConnectTerminal,
  accentColor = '#3ae2b3',
}: TerminalLinkProps) {
  const label = variant === 'log'
    ? `→ ${target}`
    : `⟶ CONNECT: ${target}`;

  const handleClick = () => {
    if (variant === 'log') onNavigateLog?.(target);
    else onConnectTerminal?.(target);
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 font-mono text-[0.85em] rounded px-1.5 py-0.5 transition-all cursor-pointer"
      style={{
        color: accentColor,
        border: `1px solid ${accentColor}55`,
        backgroundColor: `${accentColor}10`,
        textShadow: `0 0 6px ${accentColor}44`,
        verticalAlign: 'baseline',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${accentColor}22`;
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 8px ${accentColor}33`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${accentColor}10`;
        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
      }}
    >
      {label}
    </button>
  );
}
