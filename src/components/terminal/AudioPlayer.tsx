/**
 * AudioPlayer — terminal-styled player with animated waveform visualizer.
 *
 * Shows 20 bars that animate while playing, freeze while paused.
 * Falls back to a minimal error state if the file can't load.
 */

import React, { useRef, useState, useEffect } from 'react';

interface AudioPlayerProps {
  src: string;
  label?: string;
  className?: string;
}

const BAR_COUNT = 20;

// Pre-computed per-bar animation params so they're stable across renders
const BAR_PARAMS = Array.from({ length: BAR_COUNT }, (_, i) => ({
  duration: 0.5 + (i % 7) * 0.11 + (i % 3) * 0.09,
  delay:    (i % 5) * 0.07 + (i % 4) * 0.05,
  minH:     15 + (i % 4) * 5,
  maxH:     55 + (i % 6) * 8,
}));

export default function AudioPlayer({ src, label, className = '' }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    setPlaying(false);
    setProgress(0);
    setDuration(0);
    audioRef.current?.load();
  }, [src]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().catch(() => setError(true)); setPlaying(true); }
  };

  const formatTime = (s: number) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    a.currentTime = ratio * duration;
    setProgress(ratio * duration);
  };

  const accentColor = 'var(--primary)';
  const dimColor = 'var(--primary-dim)';

  if (error) {
    return (
      <div className={`font-mono text-xs px-3 py-2 rounded ${className}`}
        style={{ border: '1px solid #ff444433', color: '#ff6655', background: '#ff444408' }}>
        ⚠ AUDIO FILE UNAVAILABLE — {src.split('/').pop()}
      </div>
    );
  }

  return (
    <div
      className={`rounded font-mono ${className}`}
      style={{
        border: `1px solid ${accentColor}33`,
        background: `${accentColor}06`,
        padding: '10px 12px',
      }}
    >
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={() => setProgress(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setPlaying(false)}
        onError={() => setError(true)}
      />

      {/* Label */}
      {label && (
        <div className="text-xs mb-2 uppercase tracking-widest" style={{ color: `${accentColor}88`, fontSize: '9px' }}>
          {label}
        </div>
      )}

      {/* Waveform bars */}
      <div
        className="flex items-end justify-center gap-px mb-2"
        style={{ height: '48px' }}
        aria-hidden
      >
        {BAR_PARAMS.map((p, i) => (
          <div
            key={i}
            className="waveform-bar"
            style={{
              height: playing ? `${p.maxH}%` : `${p.minH}%`,
              background: accentColor,
              opacity: playing ? 0.85 : 0.25,
              transition: playing ? 'none' : 'height 0.3s ease, opacity 0.3s ease',
              '--bar-duration': `${p.duration}s`,
              '--bar-delay':    `${p.delay}s`,
              animationPlayState: playing ? 'running' : 'paused',
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Progress bar — clickable */}
      <div
        className="w-full h-1 rounded-full mb-2 cursor-pointer"
        style={{ background: `${accentColor}20` }}
        onClick={handleSeek}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: duration ? `${(progress / duration) * 100}%` : '0%',
            background: accentColor,
            boxShadow: `0 0 6px ${accentColor}66`,
            transition: 'width 0.25s linear',
          }}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="flex items-center justify-center rounded transition-all"
          style={{
            width: '28px',
            height: '28px',
            border: `1px solid ${accentColor}55`,
            background: `${accentColor}18`,
            color: accentColor,
            fontSize: '14px',
            flexShrink: 0,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${accentColor}33`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${accentColor}18`; }}
        >
          {playing ? '⏸' : '▶'}
        </button>

        <div className="flex-1 text-xs tabular-nums" style={{ color: dimColor, fontSize: '9px' }}>
          {formatTime(progress)} / {formatTime(duration)}
        </div>

        <div
          className="text-xs uppercase tracking-widest"
          style={{
            color: playing ? accentColor : `${dimColor}88`,
            fontSize: '8px',
            textShadow: playing ? `0 0 6px ${accentColor}66` : 'none',
            transition: 'all 0.3s',
          }}
        >
          {playing ? '● REC' : '○ PAUSED'}
        </div>
      </div>
    </div>
  );
}
