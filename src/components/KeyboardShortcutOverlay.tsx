import React from 'react';

interface KeyboardShortcutOverlayProps {
  onClose: () => void;
}

export function KeyboardShortcutOverlay({ onClose }: KeyboardShortcutOverlayProps) {
  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal"
        style={{ maxWidth: '480px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-title">Keyboard Shortcuts</span>
          <button
            onClick={onClose}
            className="text-sm opacity-60 hover:opacity-100 transition-opacity"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}
          >
            ESC
          </button>
        </div>
        <div className="modal-body" style={{ padding: '16px 20px' }}>
          {/* General shortcuts */}
          <div className="mb-4">
            <h3
              className="text-xs font-bold tracking-wider mb-3 uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)', letterSpacing: '0.15em' }}
            >
              General
            </h3>
            <div className="space-y-1.5">
              {[
                { label: 'Show / hide shortcuts', key: '?' },
                { label: 'Go back / close', key: 'ESC' },
                { label: 'Recall previous code', key: '↑' },
                { label: 'Recall next code', key: '↓' },
              ].map(({ label, key }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-1.5 px-2 rounded"
                  style={{ background: 'rgba(0, 255, 0, 0.03)' }}
                >
                  <span
                    className="text-sm"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
                  >
                    {label}
                  </span>
                  <kbd
                    className="inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-bold"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--primary)',
                      background: 'rgba(0, 255, 0, 0.1)',
                      border: '1px solid rgba(0, 255, 0, 0.3)',
                      minWidth: '24px',
                    }}
                  >
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          <p
            className="text-center text-xs mt-4"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dimmer)' }}
          >
            Press <strong style={{ color: 'var(--primary)' }}>?</strong> or <strong style={{ color: 'var(--primary)' }}>ESC</strong> to close
          </p>
        </div>
      </div>
    </div>
  );
}
