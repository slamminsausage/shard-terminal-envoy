/**
 * VideoPlayer Component
 *
 * Reusable video player with terminal styling.
 * Mirrors the AudioPlayer pattern for consistency.
 *
 * Features:
 * - Preload video for faster playback
 * - Error handling
 * - Terminal-styled container with scanline overlay
 * - Optional label display
 */

import React, { useRef, useEffect, useState } from 'react';

interface VideoPlayerProps {
  src: string;
  label?: string;
  className?: string;
  accentColor?: string;
}

export default function VideoPlayer({
  src,
  label,
  className = '',
  accentColor = '#3ae2b3',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [src]);

  const handleError = () => {
    const video = videoRef.current;
    const errorMessage = video?.error?.message || 'Unknown error';
    console.warn(`Failed to load video: ${src}`, { errorMessage });
    setError(`Failed to load video: ${errorMessage}`);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="text-sm font-mono" style={{ color: 'var(--text-dim)' }}>
          {label}
        </div>
      )}
      {error && (
        <div className="text-xs text-red-400 mb-1 font-mono">
          {error}
        </div>
      )}
      <div
        className="relative rounded-sm overflow-hidden"
        style={{
          border: `1px solid ${accentColor}33`,
          boxShadow: `0 0 12px ${accentColor}15, inset 0 0 20px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Scanline overlay on video */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `linear-gradient(transparent 50%, ${accentColor}08 50%)`,
            backgroundSize: '100% 4px',
          }}
        />
        <video
          ref={videoRef}
          controls
          preload="auto"
          onError={handleError}
          className="w-full block"
          style={{
            backgroundColor: '#000',
            maxHeight: '400px',
          }}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support video playback.
        </video>
      </div>
    </div>
  );
}
