/**
 * PasswordPrompt — password challenge gate for a terminal or log.
 *
 * Styled to match RollCheckPrompt / DiceRoller / LoadingScreen:
 * bordered accent panel, Orbitron caps for labels, Share Tech Mono
 * for the password field, accent glow, scanline overlay.
 */

import React, { useState } from 'react';
import {
  TERMINAL_ACCENT,
  TERMINAL_DIM,
  TERMINAL_ERROR,
  TERMINAL_WARN,
  withAlpha,
} from '@/lib/terminalPalette';

interface PasswordPromptProps {
  label: string;
  maxAttempts: number;
  currentAttempts: number;
  onSubmit: (password: string) => void;
  onBack: () => void;
  errorMessage?: string;
}

const labelFont = { fontFamily: 'Orbitron, sans-serif' } as const;
const monoFont = { fontFamily: '"Share Tech Mono", monospace' } as const;

export default function PasswordPrompt({
  label,
  maxAttempts,
  currentAttempts,
  onSubmit,
  onBack,
  errorMessage,
}: PasswordPromptProps) {
  const [password, setPassword] = useState('');
  const attemptsRemaining = maxAttempts - currentAttempts;
  const finalAttempt = attemptsRemaining <= 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password.toUpperCase());
      setPassword('');
    }
  };

  const headerColor = errorMessage ? TERMINAL_ERROR : TERMINAL_ACCENT;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(2px)',
        zIndex: 60,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'repeating-linear-gradient(180deg, rgba(58,226,179,0.04) 0px, rgba(58,226,179,0.04) 1px, transparent 1px, transparent 3px)',
          mixBlendMode: 'overlay',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 520,
          margin: '0 1rem',
          border: `1px solid ${withAlpha(headerColor, 0.35)}`,
          background: 'rgba(0,0,0,0.78)',
          boxShadow: `0 0 24px ${withAlpha(headerColor, 0.18)}, inset 0 0 32px rgba(0,0,0,0.45)`,
          borderRadius: 4,
          color: TERMINAL_ACCENT,
        }}
      >
        {/* Panel header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.6rem 1rem',
            borderBottom: `1px solid ${withAlpha(headerColor, 0.22)}`,
            background: `linear-gradient(180deg, ${withAlpha(headerColor, 0.1)} 0%, transparent 100%)`,
          }}
        >
          <span
            style={{
              ...labelFont,
              fontSize: '0.7rem',
              letterSpacing: '0.3em',
              color: headerColor,
              textShadow: `0 0 8px ${withAlpha(headerColor, 0.45)}`,
            }}
          >
            ▌ SECURITY AUTHENTICATION
          </span>
          <span
            style={{
              ...labelFont,
              fontSize: '0.6rem',
              letterSpacing: '0.22em',
              color: finalAttempt ? TERMINAL_WARN : TERMINAL_DIM,
              textShadow: finalAttempt
                ? `0 0 6px ${withAlpha(TERMINAL_WARN, 0.45)}`
                : 'none',
            }}
          >
            {finalAttempt
              ? `⚠ FINAL · ${attemptsRemaining}`
              : `ATTEMPTS · ${attemptsRemaining}`}
          </span>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.1rem 1.1rem 1rem' }}>
          <div style={{ marginBottom: '0.9rem' }}>
            <div
              style={{
                ...labelFont,
                fontSize: '0.58rem',
                letterSpacing: '0.28em',
                color: TERMINAL_DIM,
                marginBottom: '0.35rem',
              }}
            >
              CHALLENGE
            </div>
            <div
              style={{
                ...monoFont,
                fontSize: '0.9rem',
                color: TERMINAL_ACCENT,
                textShadow: `0 0 6px ${withAlpha(TERMINAL_ACCENT, 0.35)}`,
                padding: '0.45rem 0.6rem',
                border: `1px solid ${withAlpha(TERMINAL_ACCENT, 0.2)}`,
                background: withAlpha(TERMINAL_ACCENT, 0.04),
                borderRadius: 2,
              }}
            >
              {label}
            </div>
          </div>

          <div style={{ marginBottom: '0.9rem' }}>
            <div
              style={{
                ...labelFont,
                fontSize: '0.58rem',
                letterSpacing: '0.28em',
                color: TERMINAL_DIM,
                marginBottom: '0.3rem',
              }}
            >
              PASSWORD
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              autoFocus
              maxLength={50}
              style={{
                ...monoFont,
                width: '100%',
                background: 'rgba(0,0,0,0.55)',
                border: `1px solid ${withAlpha(TERMINAL_ACCENT, 0.35)}`,
                color: TERMINAL_ACCENT,
                fontSize: '0.95rem',
                letterSpacing: '0.15em',
                padding: '0.5rem 0.7rem',
                borderRadius: 2,
                outline: 'none',
                textShadow: `0 0 6px ${withAlpha(TERMINAL_ACCENT, 0.3)}`,
              }}
            />
          </div>

          {errorMessage && (
            <div
              style={{
                ...monoFont,
                padding: '0.55rem 0.7rem',
                border: `1px solid ${withAlpha(TERMINAL_ERROR, 0.45)}`,
                background: withAlpha(TERMINAL_ERROR, 0.08),
                color: TERMINAL_ERROR,
                fontSize: '0.78rem',
                borderRadius: 2,
                marginBottom: '0.9rem',
                textShadow: `0 0 6px ${withAlpha(TERMINAL_ERROR, 0.35)}`,
              }}
            >
              ✕ {errorMessage}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <PanelButton variant="ghost" onClick={onBack} type="button">
              ← CANCEL
            </PanelButton>
            <PanelButton variant="primary" type="submit" disabled={!password.trim()}>
              ▶ SUBMIT
            </PanelButton>
          </div>
        </form>
      </div>
    </div>
  );
}

interface PanelButtonProps {
  variant: 'primary' | 'ghost';
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

function PanelButton({
  variant,
  type = 'button',
  onClick,
  disabled,
  children,
}: PanelButtonProps) {
  const isPrimary = variant === 'primary';
  const color = isPrimary ? TERMINAL_ACCENT : TERMINAL_DIM;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...labelFont,
        fontSize: '0.62rem',
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        padding: '0.45rem 0.85rem',
        background: isPrimary ? withAlpha(TERMINAL_ACCENT, 0.1) : 'transparent',
        border: `1px solid ${withAlpha(color, isPrimary ? 0.5 : 0.3)}`,
        color,
        textShadow: isPrimary ? `0 0 6px ${withAlpha(TERMINAL_ACCENT, 0.4)}` : 'none',
        borderRadius: 2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}
