/**
 * LoadingScreen Component
 *
 * Displays the initial loading animation with typing effect.
 * Extracted from TerminalInterface.
 *
 * Features:
 * - Centered typing animation
 * - ESC to skip instruction
 * - Terminal glow effects
 */

import React from 'react';

interface LoadingScreenProps {
 initText: string;
 onSkip: () => void;
}

export default function LoadingScreen({ initText, onSkip }: LoadingScreenProps) {
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onSkip]);

  return (
    <div className="h-full w-full bg-background crt-container flex items-center justify-center px-6">
      <style>
        {`
          @keyframes loading-bar-glide {
            0% { transform: translateX(-40%); }
            50% { transform: translateX(20%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
      <div className="w-full max-w-3xl space-y-6">
        <div className="border border-primary/40 rounded-lg bg-black/70 shadow-[0_0_25px_rgba(0,255,0,0.2)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-mono tracking-[0.3em] text-primary/80">
              TRAVELLER TERMINAL // SYSTEM BOOT
            </div>
            <div className="text-[10px] font-mono text-accent/70">
              PRESS ESC TO SKIP
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-primary/30 bg-black/60 h-3">
            <div
              className="h-full w-1/2"
              style={{
                background: 'linear-gradient(90deg, rgba(0,255,0,0.05) 0%, rgba(0,255,0,0.35) 50%, rgba(0,255,0,0.05) 100%)',
                boxShadow: '0 0 18px rgba(0, 255, 0, 0.35)',
                animation: 'loading-bar-glide 2.4s ease-in-out infinite'
              }}
            />
          </div>

          <div className="mt-5 terminal-text terminal-glow text-primary font-mono text-sm whitespace-pre-wrap leading-6">
            {initText}
          </div>
        </div>
      </div>
    </div>
  );
}
