/**
 * BuilderScreensaver — idle screensaver overlay.
 *
 * Shows a full-screen matrix-rain backdrop in the terminal's blue
 * accent, with a centered TRAVELLER / TERMINAL v5.0 label. Dismissed
 * by any key, mousedown or touch.
 *
 * Mounted globally from CRTOverlay.
 */

import { useEffect } from 'react';
import MatrixRain from './MatrixRain';

interface BuilderScreensaverProps {
  onDismiss?: () => void;
}

export default function BuilderScreensaver({ onDismiss }: BuilderScreensaverProps) {
  const color = '#00ccff';

  useEffect(() => {
    const handler = () => onDismiss?.();
    window.addEventListener('keydown', handler);
    window.addEventListener('mousedown', handler);
    window.addEventListener('touchstart', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('mousedown', handler);
      window.removeEventListener('touchstart', handler);
    };
  }, [onDismiss]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9800,
        background: '#000',
        cursor: 'none',
      }}
    >
      <MatrixRain accentColor={color} opacity={0.9} speed={1.4} fontSize={14} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          gap: '1.2rem',
        }}
      >
        <div
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '2rem',
            fontWeight: 900,
            color,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            textShadow: `0 0 30px ${color}, 0 0 60px ${color}44`,
            animation: 'builderSsGlow 2.5s ease-in-out infinite',
          }}
        >
          TRAVELLER
        </div>
        <div
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '0.9rem',
            color: `${color}99`,
            letterSpacing: '0.6em',
            textShadow: `0 0 10px ${color}55`,
          }}
        >
          TERMINAL v5.0
        </div>
        <div
          style={{
            marginTop: '1.5rem',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '0.75rem',
            color: `${color}77`,
            letterSpacing: '0.2em',
            animation: 'builderSsBlink 1.4s step-end infinite',
          }}
        >
          — PRESS ANY KEY TO RESUME —
        </div>
      </div>

      <style>{`
        @keyframes builderSsGlow {
          0%,100% { opacity:0.8; text-shadow: 0 0 20px ${color}, 0 0 40px ${color}44; }
          50%      { opacity:1;   text-shadow: 0 0 40px ${color}, 0 0 80px ${color}66; }
        }
        @keyframes builderSsBlink { 0%,49%{ opacity:1; } 50%,100%{ opacity:0; } }
      `}</style>
    </div>
  );
}
