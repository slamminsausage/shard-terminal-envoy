/**
 * AudioPlayer Component
 *
 * Reusable audio player with consistent terminal styling.
 * Replaces duplicated audio elements throughout the app.
 *
 * Features:
 * - Preload audio for faster playback
 * - Error handling
 * - Terminal-styled controls
 * - Optional label display
 */

import React from 'react';

interface AudioPlayerProps {
  src: string;
  label?: string;
  className?: string;
}

export default function AudioPlayer({
  src,
  label,
  className = '',
}: AudioPlayerProps) {
  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.warn(`Failed to load audio: ${src}`, e);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="text-sm" style={{ color: 'var(--text-dim)' }}>
          {label}
        </div>
      )}
      <audio
        controls
        preload="auto"
        onError={handleError}
        className="w-full"
        style={{
          backgroundColor: 'var(--bg-dark)',
          borderRadius: '4px',
          outline: 'none',
        }}
      >
        <source src={src} type="audio/mpeg" />
        Your browser does not support audio playback.
      </audio>
    </div>
  );
}
