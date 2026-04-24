import React from 'react';

export default function TerminalLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <div className="w-full max-w-md text-center">
        <div className="terminal-skeleton-pulse mb-4">
          <div
            className="h-2 rounded mx-auto mb-3"
            style={{
              width: '60%',
              background: 'rgba(58, 226, 179, 0.15)',
              boxShadow: '0 0 8px rgba(58, 226, 179, 0.1)',
            }}
          />
          <div
            className="h-2 rounded mx-auto mb-3"
            style={{
              width: '80%',
              background: 'rgba(58, 226, 179, 0.1)',
              boxShadow: '0 0 6px rgba(58, 226, 179, 0.08)',
              animationDelay: '0.15s',
            }}
          />
          <div
            className="h-2 rounded mx-auto"
            style={{
              width: '40%',
              background: 'rgba(58, 226, 179, 0.08)',
              boxShadow: '0 0 4px rgba(58, 226, 179, 0.06)',
              animationDelay: '0.3s',
            }}
          />
        </div>
        <p
          className="text-xs tracking-widest uppercase blink"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-dim)',
          }}
        >
          Loading Module...
        </p>
      </div>
    </div>
  );
}
