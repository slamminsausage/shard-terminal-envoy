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

import React, { useRef, useEffect, useState } from 'react';

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Ensure audio src is properly set when component mounts or src changes
  useEffect(() => {
    setError(null);
    setIsLoaded(false);

    if (audioRef.current) {
      // Force reload when src changes
      audioRef.current.load();
    }
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const audio = e.currentTarget;
    const errorCode = audio.error?.code;
    const errorMessage = audio.error?.message || 'Unknown error';
    console.warn(`Failed to load audio: ${src}`, { errorCode, errorMessage, event: e });
    setError(`Failed to load audio: ${errorMessage}`);
  };

  const handleCanPlay = () => {
    setIsLoaded(true);
    setError(null);
  };

  const handleLoadedMetadata = () => {
    // Audio metadata loaded successfully
    setError(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="text-sm" style={{ color: 'var(--text-dim)' }}>
          {label}
        </div>
      )}
      {error && (
        <div className="text-xs text-red-400 mb-1">
          {error}
        </div>
      )}
      <audio
        ref={audioRef}
        controls
        preload="auto"
        onError={handleError}
        onCanPlay={handleCanPlay}
        onLoadedMetadata={handleLoadedMetadata}
        className="w-full"
        style={{
          backgroundColor: 'var(--bg-dark)',
          borderRadius: '4px',
          outline: 'none',
        }}
      >
        <source src={src} type="audio/mpeg" />
        <source src={src} type="audio/mp3" />
        Your browser does not support audio playback.
      </audio>
    </div>
  );
}
