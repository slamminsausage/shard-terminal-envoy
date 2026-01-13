/**
 * InitScreen Component
 *
 * Displays the access code entry screen with available terminals.
 * Extracted from TerminalInterface.
 *
 * Features:
 * - Access code input with enter key support
 * - CONNECT button
 * - Grid of unlocked terminals for quick access
 * - ESC navigation hint
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import UnlockedTerminalGrid from '../UnlockedTerminalGrid';
import { RecentTerminals } from '../RecentTerminals';

interface Terminal {
  code: string;
  name: string;
}

interface InitScreenProps {
  inputCode: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  unlockedTerminals: Terminal[];
  loading: boolean;
  onTerminalSelect: (code: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  statusMessage?: string;
  errorMessage?: string | null;
}

export default function InitScreen({
  inputCode,
  onCodeChange,
  onSubmit,
  unlockedTerminals,
  loading,
  onTerminalSelect,
  onKeyDown,
  statusMessage,
  errorMessage,
}: InitScreenProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onKeyDown) {
      onKeyDown(e as React.KeyboardEvent<HTMLInputElement>);
    }
    if (e.defaultPrevented) return;
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(0, 255, 0, 0.05) 0%, rgba(0, 0, 0, 1) 70%)'
      }}
    >
      <div className="w-full max-w-2xl">
        {/* Main access panel */}
        <div className="panel mb-8">
          <div className="panel-header">
            <span className="panel-title">TERMINAL ACCESS</span>
            <span className="panel-status">
              {unlockedTerminals.length > 0
                ? `${unlockedTerminals.length} AVAILABLE`
                : 'AWAITING INPUT'}
            </span>
          </div>
          <div className="panel-content">
            {/* Access code input */}
            <div className="mb-6">
              <label
                className="block text-xs font-bold tracking-wider mb-3"
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  color: 'var(--primary)',
                  textTransform: 'uppercase'
                }}
              >
                Enter Access Code:
              </label>
              <input
                type="text"
                value={inputCode}
                onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                className="terminal-input"
                placeholder="_ _ _ _ _ _ _ _"
                autoFocus
                style={{
                  fontSize: '1.2rem',
                  letterSpacing: '0.5rem',
                  textAlign: 'center',
                  padding: '16px',
                  fontWeight: 'bold'
                }}
              />
              <div className="mt-3 space-y-1" aria-live="polite">
                {statusMessage && (
                  <p
                    className="text-xs font-mono"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    {statusMessage}
                  </p>
                )}
                {errorMessage && (
                  <p
                    className="text-xs font-mono"
                    style={{ color: 'var(--warning)' }}
                  >
                    {errorMessage}
                  </p>
                )}
              </div>
            </div>

            {/* Connect button */}
            <button
              onClick={onSubmit}
              className="terminal-btn primary w-full"
              disabled={!inputCode.trim()}
            >
              CONNECT
            </button>
          </div>
        </div>

        {/* Recent Terminals */}
        <div className="mb-8">
          <RecentTerminals
            onTerminalSelect={onTerminalSelect}
          />
        </div>

        {/* Unlocked terminals grid */}
        {unlockedTerminals.length > 0 && (
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">AVAILABLE TERMINALS</span>
              <span className="panel-status">QUICK ACCESS</span>
            </div>
            <div className="panel-content">
              <UnlockedTerminalGrid
                terminals={unlockedTerminals}
                loading={loading}
                onSelect={onTerminalSelect}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
