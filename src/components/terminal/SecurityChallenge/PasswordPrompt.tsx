/**
 * PasswordPrompt Component
 *
 * Reusable password authentication challenge for terminal logs.
 * Replaces duplicated password logic from TerminalInterface.
 *
 * Features:
 * - Attempt counter with max attempts
 * - Error messaging
 * - Terminal-styled UI with glow effects
 * - Back button for cancellation
 */

import React, { useState } from 'react';

interface PasswordPromptProps {
  label: string;
  maxAttempts: number;
  currentAttempts: number;
  onSubmit: (password: string) => void;
  onBack: () => void;
  errorMessage?: string;
}

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password.toUpperCase());
      setPassword('');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">SECURITY AUTHENTICATION</span>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--primary)' }}>
                {label}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="terminal-input"
                placeholder="Enter password..."
                autoFocus
                maxLength={50}
              />
            </div>

            {errorMessage && (
              <div
                className="p-3 border rounded"
                style={{
                  borderColor: 'var(--danger)',
                  backgroundColor: 'rgba(255, 51, 68, 0.1)',
                  color: 'var(--danger)',
                }}
              >
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--text-dim)' }}>
                Attempts remaining: {attemptsRemaining}
              </span>
              {attemptsRemaining <= 1 && (
                <span style={{ color: 'var(--warning)' }}>
                  WARNING: FINAL ATTEMPT
                </span>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onBack}
                className="terminal-btn secondary"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="terminal-btn primary"
                disabled={!password.trim()}
              >
                SUBMIT
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
