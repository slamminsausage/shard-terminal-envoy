/**
 * TerminalFileIcon Component
 *
 * Renders a log entry as a desktop-style file icon tile.
 * Icon shape, color, and effects vary by security level.
 * Shows date, location, fake file size, and file type indicators.
 * Used in the Terminal OS Desktop grid layout.
 */

import React, { useState, useMemo } from 'react';
import { useGlitchText } from '@/hooks/useGlitchText';
import { getGlitchIntensity } from '@/lib/glitchText';
import { FileIconGauge } from '../TerminalGauges';

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

interface TerminalFileIconProps {
  log: LogEntry;
  accentColor: string;
  dimColor: string;
  terminalCode: string;
  onClick: () => void;
}

const SECURITY_CONFIG: Record<string, { color: string; icon: string; glow?: boolean; pulse?: boolean }> = {
  unlocked:   { color: '#88ffaa', icon: '○' },
  low:        { color: '#00ff00', icon: '□' },
  medium:     { color: '#00ccff', icon: '◇' },
  high:       { color: '#ffaa00', icon: '◆', glow: true },
  restricted: { color: '#ff6600', icon: '◆', glow: true },
  critical:   { color: '#ff3344', icon: '⬡', pulse: true },
};

const DEFAULT_SECURITY = { color: '#00ff00', icon: '□' };

/** Determine file type from log content */
function getFileType(log: LogEntry): { label: string; icon: string } {
  if (log.audio_file || (log.logs && log.logs.length > 0)) {
    return { label: 'AUD', icon: '♫' };
  }
  if (log.requires_password) {
    return { label: 'ENC', icon: '⊞' };
  }
  if (log.requires_roll && log.roll_check && log.roll_check.difficulty >= 10) {
    return { label: 'SEC', icon: '⊡' };
  }
  if (log.content && log.content.length > 2000) {
    return { label: 'LOG', icon: '≡' };
  }
  return { label: 'DOC', icon: '▤' };
}

export default function TerminalFileIcon({
  log,
  accentColor,
  dimColor,
  terminalCode,
  onClick,
}: TerminalFileIconProps) {
  const [hovered, setHovered] = useState(false);

  const sec = SECURITY_CONFIG[log.security_level || ''] || DEFAULT_SECURITY;

  const shouldFlicker = useMemo(
    () => terminalCode ? getGlitchIntensity(terminalCode) >= 0.01 : false,
    [terminalCode]
  );

  const flickeredTitle = useGlitchText({
    text: log.title,
    terminalCode: terminalCode,
    active: shouldFlicker,
  });

  const displayTitle = shouldFlicker ? flickeredTitle : log.title;

  // Truncate title for display under icon
  const truncatedTitle = displayTitle.length > 42
    ? displayTitle.slice(0, 39) + '...'
    : displayTitle;

  const iconClasses = [
    sec.pulse ? 'file-icon-critical-pulse' : '',
    sec.glow ? 'file-icon-glow' : '',
  ].filter(Boolean).join(' ');

  const fileType = useMemo(() => getFileType(log), [log]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col items-center text-center cursor-pointer transition-all duration-150 p-3 rounded-sm group"
      style={{
        width: '130px',
        minHeight: '140px',
        border: `1px solid ${hovered ? accentColor : 'transparent'}`,
        backgroundColor: hovered ? `${accentColor}12` : 'transparent',
        boxShadow: hovered ? `0 0 16px ${accentColor}25, inset 0 0 12px ${accentColor}08` : 'none',
        transform: hovered ? 'scale(1.04)' : 'scale(1)',
      }}
    >
      {/* File icon shape */}
      <div
        className={`text-3xl font-mono leading-none mb-1 select-none ${iconClasses}`}
        style={{
          color: sec.color,
          textShadow: sec.glow || hovered
            ? `0 0 8px ${sec.color}88, 0 0 16px ${sec.color}44`
            : 'none',
          filter: hovered ? 'brightness(1.3)' : 'none',
        }}
      >
        {/* File folder shape using box drawing */}
        <div className="relative" style={{ width: '56px', height: '44px' }}>
          {/* Tab */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '22px',
              height: '10px',
              borderTop: `2px solid ${sec.color}`,
              borderLeft: `2px solid ${sec.color}`,
              borderRight: `2px solid ${sec.color}`,
              borderTopLeftRadius: '2px',
              borderTopRightRadius: '2px',
            }}
          />
          {/* Body */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: 0,
              width: '56px',
              height: '34px',
              border: `2px solid ${sec.color}`,
              borderRadius: '0 2px 2px 2px',
              backgroundColor: `${sec.color}10`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '18px', lineHeight: 1 }}>{sec.icon}</span>
          </div>
          {/* File type badge (top-right corner) */}
          <div
            style={{
              position: 'absolute',
              top: '6px',
              right: '-2px',
              fontSize: '10px',
              lineHeight: 1,
              color: dimColor,
              opacity: hovered ? 1 : 0.6,
              transition: 'opacity 0.15s ease',
            }}
          >
            {fileType.icon}
          </div>
        </div>
      </div>

      {/* File title */}
      <div
        className="font-mono text-xs leading-tight mt-1 max-w-full"
        style={{
          color: hovered ? accentColor : 'var(--primary)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          wordBreak: 'break-word',
        }}
      >
        {truncatedTitle}
      </div>

      {/* Author */}
      {log.author && (
        <div
          className="font-mono mt-0.5"
          style={{ color: dimColor, fontSize: '9px', lineHeight: '1.2' }}
        >
          {log.author.length > 20 ? log.author.slice(0, 18) + '..' : log.author}
        </div>
      )}

      {/* Date */}
      {log.date && (
        <div
          className="font-mono"
          style={{ color: `${dimColor}bb`, fontSize: '8px', lineHeight: '1.2' }}
        >
          {log.date}
        </div>
      )}

      {/* Security badge + roll indicator + file type tag */}
      <div className="flex items-center gap-1 mt-1 flex-wrap justify-center">
        <span
          className="font-mono uppercase tracking-wider"
          style={{
            color: sec.color,
            fontSize: '8px',
            letterSpacing: '0.08em',
          }}
        >
          {log.security_level || 'unknown'}
        </span>
        {log.requires_roll && log.roll_check && (
          <span
            className="font-mono"
            style={{ color: '#ffaa00', fontSize: '8px' }}
          >
            ⚡{log.roll_check.difficulty}+
          </span>
        )}
        <span
          className="font-mono uppercase"
          style={{ color: `${dimColor}88`, fontSize: '7px' }}
        >
          .{fileType.label}
        </span>
      </div>

      {/* Fake file size */}
      <div className="mt-0.5">
        <FileIconGauge color={dimColor} seed={terminalCode + log.title} />
      </div>

      {/* Location (on hover only) */}
      {log.location && hovered && (
        <div
          className="font-mono mt-0.5 transition-opacity duration-150"
          style={{ color: `${accentColor}88`, fontSize: '7px' }}
        >
          📍 {log.location.length > 18 ? log.location.slice(0, 16) + '..' : log.location}
        </div>
      )}
    </div>
  );
}
