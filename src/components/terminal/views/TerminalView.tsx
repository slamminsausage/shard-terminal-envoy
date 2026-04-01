/**
 * TerminalView Component — Terminal OS Desktop
 *
 * Displays terminal logs as a fake retro terminal operating system window.
 * Features:
 * - Title bar with colored dots, header label, disconnect button
 * - Menu bar with decorative gauges (FREQ, ADDR, oscilloscope)
 * - Responsive file icon grid (TerminalFileIcon per log)
 * - Enhanced taskbar with live meters (MEM, CPU, TX/RX indicators)
 * - Full accent-color theming from boot profiles
 */

import React, { useState, useEffect } from 'react';
import { AnimatedList } from '@/components/ui/AnimatedList';
import { getTerminalBootProfile, getTerminalCategory } from '@/lib/terminalBootProfiles';
import TerminalFileIcon from './TerminalFileIcon';
import { TaskbarGauges, MenuBarGauges } from '../TerminalGauges';

interface LogEntry {
  title: string;
  date?: string;
  author?: string;
  location?: string;
  security_level?: string;
  requires_roll?: boolean;
  requires_password?: boolean;
  roll_check?: { difficulty: number; skill: string };
  audio_file?: string;
  logs?: any[];
  content?: string;
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
  completedActions?: string[];
}

/** Generate a pseudo-random uptime string from terminal code */
function fakeUptime(code: string): string {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) | 0;
  const days = Math.abs(h) % 365;
  const hours = Math.abs(h >> 4) % 24;
  return `${days}d ${hours}h`;
}

export default function TerminalView({
  terminal,
  logs,
  onLogSelect,
  onBack,
  completedActions = [],
}: TerminalViewProps) {
  const profile = getTerminalBootProfile(terminal.code);
  const category = getTerminalCategory(terminal.code);
  const { accentColor, dimColor, headerLabel } = profile;

  // Live clock for the taskbar
  const [clock, setClock] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setClock(d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Count security levels for the status line
  const securedCount = logs.filter(
    (l) => l.requires_roll || l.requires_password || l.security_level === 'high' || l.security_level === 'restricted' || l.security_level === 'critical'
  ).length;

  return (
    <div
      className="terminal-os-window flex flex-col h-full"
      style={{
        border: `1px solid ${accentColor}55`,
        boxShadow: `0 0 24px ${accentColor}18, inset 0 0 40px rgba(0,0,0,0.4)`,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      }}
    >
      {/* ═══ Title Bar ═══ */}
      <div
        className="terminal-os-titlebar flex items-center px-3 py-2 shrink-0"
        style={{
          borderBottom: `1px solid ${accentColor}33`,
          background: `linear-gradient(180deg, ${accentColor}14 0%, rgba(0,0,0,0.6) 100%)`,
        }}
      >
        {/* Window dots */}
        <div className="flex items-center gap-1.5 mr-4">
          <span className="terminal-os-dot" style={{ backgroundColor: accentColor, opacity: 0.9 }} />
          <span className="terminal-os-dot" style={{ backgroundColor: accentColor, opacity: 0.5 }} />
          <span className="terminal-os-dot" style={{ backgroundColor: accentColor, opacity: 0.3 }} />
        </div>

        {/* Header label */}
        <div
          className="flex-1 text-center font-mono text-xs tracking-[0.2em] uppercase truncate"
          style={{
            color: accentColor,
            fontFamily: 'var(--font-display)',
            textShadow: `0 0 10px ${accentColor}44`,
          }}
        >
          {headerLabel}
        </div>

        {/* Disconnect button */}
        <button
          onClick={onBack}
          className="font-mono text-xs tracking-wider uppercase px-3 py-1 transition-all duration-150 hover:brightness-150 cursor-pointer shrink-0"
          style={{
            color: dimColor,
            border: `1px solid ${dimColor}44`,
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = accentColor;
            e.currentTarget.style.borderColor = `${accentColor}88`;
            e.currentTarget.style.boxShadow = `0 0 8px ${accentColor}33`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = dimColor;
            e.currentTarget.style.borderColor = `${dimColor}44`;
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          ✕ Disconnect
        </button>
      </div>

      {/* ═══ Menu Bar ═══ */}
      <div
        className="terminal-os-menubar flex items-center justify-between px-3 py-1.5 shrink-0"
        style={{
          borderBottom: `1px solid ${accentColor}22`,
          backgroundColor: `${accentColor}06`,
        }}
      >
        <div className="flex items-center gap-4 font-mono text-xs">
          {['FILE', 'VIEW', 'SECURITY', 'HELP'].map((label) => (
            <span
              key={label}
              className="tracking-wider cursor-default select-none"
              style={{ color: dimColor }}
            >
              {label}
            </span>
          ))}
        </div>
        {/* Decorative gauges in menu bar */}
        <div className="flex items-center gap-3">
          <MenuBarGauges accentColor={accentColor} terminalCode={terminal.code} />
          <div className="flex items-center gap-2 font-mono text-xs">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: '#00ff00', boxShadow: '0 0 4px #00ff0066' }}
            />
            <span style={{ color: dimColor, letterSpacing: '0.05em' }}>ACTIVE</span>
          </div>
        </div>
      </div>

      {/* ═══ File Grid Content ═══ */}
      <div className="flex-1 overflow-auto p-4">
        {logs.length > 0 ? (
          <AnimatedList
            className="flex flex-wrap gap-2 justify-start"
            staggerDelay={0.06}
          >
            {logs.map((log, index) => (
              <TerminalFileIcon
                key={index}
                log={log}
                accentColor={accentColor}
                dimColor={dimColor}
                terminalCode={terminal.code}
                completedActions={completedActions}
                onClick={() => onLogSelect(log)}
              />
            ))}
          </AnimatedList>
        ) : (
          <div
            className="flex items-center justify-center h-full font-mono text-sm"
            style={{ color: dimColor }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2" style={{ color: `${accentColor}44` }}>□</div>
              <div>NO FILES FOUND</div>
              <div className="text-xs mt-1" style={{ color: `${dimColor}88` }}>
                This directory is empty
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Taskbar / Footer ═══ */}
      <div
        className="terminal-os-taskbar flex items-center justify-between px-3 py-1.5 shrink-0 font-mono text-xs"
        style={{
          borderTop: `1px solid ${accentColor}33`,
          backgroundColor: `${accentColor}08`,
          color: dimColor,
        }}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: accentColor }}>{terminal.code}</span>
          <span style={{ color: `${dimColor}88` }}>│</span>
          <span>{logs.length} {logs.length === 1 ? 'FILE' : 'FILES'}</span>
          {securedCount > 0 && (
            <>
              <span style={{ color: `${dimColor}88` }}>│</span>
              <span style={{ color: '#ffaa00' }}>🔒 {securedCount}</span>
            </>
          )}
          <span style={{ color: `${dimColor}88` }}>│</span>
          <span className="uppercase">{category.replace('-', ' ')}</span>
        </div>

        {/* Center: live gauges */}
        <div className="hidden sm:flex">
          <TaskbarGauges accentColor={accentColor} terminalCode={terminal.code} />
        </div>

        <div className="flex items-center gap-3">
          <span style={{ color: `${dimColor}66`, fontSize: '8px' }}>
            UPTIME {fakeUptime(terminal.code)}
          </span>
          <span
            className="tabular-nums"
            style={{ color: accentColor, fontSize: '9px', textShadow: `0 0 6px ${accentColor}33` }}
          >
            {clock}
          </span>
        </div>
      </div>
    </div>
  );
}
