import { useEffect, useRef } from 'react';

interface AccessDeniedFlashProps {
  onDone: () => void;
}

/**
 * Full-screen red flash shown when a roll-check or skill gate fails.
 * Mounts, holds for ~1.4s, then calls onDone and unmounts.
 */
export default function AccessDeniedFlash({ onDone }: AccessDeniedFlashProps) {
  const doneRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone();
      }
    }, 1400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'access-denied-flash 1.4s ease-out forwards',
        pointerEvents: 'none',
      }}
    >
      {/* Scanline overlay */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(180deg, rgba(255,40,60,0.06) 0px, rgba(255,40,60,0.06) 1px, transparent 1px, transparent 3px)',
          mixBlendMode: 'overlay',
        }}
      />

      <div
        style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: 'clamp(1.4rem, 5vw, 3rem)',
          fontWeight: 900,
          letterSpacing: '0.35em',
          color: '#ff3344',
          textShadow: '0 0 30px #ff334488, 0 0 60px #ff334444',
          animation: 'access-denied-text 1.4s ease-out forwards',
          textAlign: 'center',
          padding: '0 1rem',
          position: 'relative',
        }}
      >
        ✕ ACCESS DENIED
      </div>

      <div
        style={{
          fontFamily: '"Share Tech Mono", monospace',
          fontSize: 'clamp(0.6rem, 1.5vw, 0.85rem)',
          letterSpacing: '0.25em',
          color: '#ff334488',
          marginTop: '1.2rem',
          animation: 'access-denied-text 1.4s ease-out forwards',
          position: 'relative',
        }}
      >
        SECURITY VIOLATION LOGGED — RETURNING TO SYSTEM
      </div>

      <style>{`
        @keyframes access-denied-flash {
          0%   { background: rgba(255, 30, 50, 0.55); }
          15%  { background: rgba(255, 30, 50, 0.7); }
          40%  { background: rgba(255, 30, 50, 0.45); }
          70%  { background: rgba(255, 30, 50, 0.25); }
          100% { background: rgba(255, 30, 50, 0); }
        }
        @keyframes access-denied-text {
          0%   { opacity: 0; transform: scale(0.92); }
          12%  { opacity: 1; transform: scale(1.02); }
          35%  { opacity: 1; transform: scale(1); }
          75%  { opacity: 0.7; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
