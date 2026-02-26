/**
 * SiteBootScreen
 *
 * Full-screen boot sequence shown on initial site load, before the auth check.
 * Plays once per browser session (sessionStorage flag prevents replay on refresh).
 * ESC or clicking anywhere skips immediately.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';

const SESSION_KEY = 'ste_site_booted';

// Total time the boot screen is shown (ms)
const BOOT_DURATION_MS = 5200;

const BOOT_LINES = [
  { text: '>> SHARD TERMINAL ENVOY v3.1.7 // ECLIPSE SHARD SAGA', dim: false },
  { text: '>> INITIALIZING CORE SUBSYSTEMS...', dim: false },
  { text: '>> CAMPAIGN DATABASE.............................. [LOADED]', dim: true },
  { text: '>> CREW MANIFEST & CHARACTER RECORDS.............. [LOADED]', dim: true },
  { text: '>> VEHICLE & SHIP REGISTRY........................ [LOADED]', dim: true },
  { text: '>> FINANCIAL MANAGEMENT SYSTEM.................... [ONLINE]', dim: true },
  { text: '>> QUEST & SESSION TRACKER........................ [ONLINE]', dim: true },
  { text: '>> JUMP NAVIGATION & STAR CHARTS.................. [ONLINE]', dim: true },
  { text: '>> BRIDGE TACTICAL CONSOLE........................ [ONLINE]', dim: true },
  { text: '>> SIGNAL ENCRYPTION.............................. [ACTIVE]', dim: true },
  { text: '>> ALL SYSTEMS NOMINAL.', dim: false },
  { text: '>> WELCOME, COMMANDER.', dim: false },
];

// Reveal all lines during the first 72% of the boot duration
const LINE_INTERVAL_MS = (BOOT_DURATION_MS * 0.72) / BOOT_LINES.length;

interface SiteBootScreenProps {
  onComplete: () => void;
}

export default function SiteBootScreen({ onComplete }: SiteBootScreenProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    sessionStorage.setItem(SESSION_KEY, '1');
    setFadeOut(true);
    setTimeout(onComplete, 350);
  }, [onComplete]);

  // Reveal lines staggered
  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      setVisibleLines(count);
      if (count >= BOOT_LINES.length) clearInterval(interval);
    }, LINE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // Progress bar fills over the full boot duration
  useEffect(() => {
    const startTime = Date.now();
    let rafId: number;
    const frame = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / BOOT_DURATION_MS) * 100);
      setProgress(pct);
      if (pct < 100) rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);
    // Cancel the latest scheduled frame on unmount (covers skip/fast-exit)
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Auto-complete after boot duration
  useEffect(() => {
    const t = setTimeout(finish, BOOT_DURATION_MS);
    return () => clearTimeout(t);
  }, [finish]);

  // ESC or click to skip
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') finish(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finish]);

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);

  return (
    <div
      className="h-screen w-full bg-black crt-container flex items-center justify-center px-4 sm:px-6 cursor-pointer select-none"
      onClick={finish}
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.35s ease',
      }}
    >
      <style>{`
        @keyframes site-boot-scanline {
          0%   { background-position: 0 0; }
          100% { background-position: 0 100vh; }
        }
        @keyframes site-boot-cursor {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes site-boot-fadein {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes site-boot-title-glow {
          0%, 100% { text-shadow: 0 0 8px #00ff0066, 0 0 24px #00ff0033; }
          50%       { text-shadow: 0 0 16px #00ff0099, 0 0 40px #00ff0055; }
        }
      `}</style>

      <div className="w-full max-w-3xl">
        {/* ── Outer panel ── */}
        <div
          style={{
            border: '1px solid #00ff0033',
            borderRadius: 6,
            background: 'rgba(0,0,0,0.88)',
            boxShadow: '0 0 40px rgba(0,255,0,0.08), inset 0 0 60px rgba(0,255,0,0.03)',
            padding: '2rem',
          }}
        >
          {/* ── Title block ── */}
          <div className="mb-6 text-center">
            <div
              className="font-mono text-2xl sm:text-3xl tracking-[0.15em] mb-1"
              style={{
                color: '#00ff00',
                fontFamily: 'Orbitron, monospace',
                animation: 'site-boot-title-glow 3s ease-in-out infinite',
              }}
            >
              ECLIPSE SHARD SAGA
            </div>
            <div
              className="font-mono text-xs tracking-[0.4em]"
              style={{ color: '#00aa00' }}
            >
              SHARD TERMINAL ENVOY // MAINFRAME SYSTEM
            </div>
          </div>

          {/* ── Divider ── */}
          <div
            className="mb-5"
            style={{
              height: 1,
              background: 'linear-gradient(90deg, transparent, #00ff0044, #00ff0088, #00ff0044, transparent)',
            }}
          />

          {/* ── Header row ── */}
          <div className="flex items-center justify-between mb-3">
            <div
              className="text-xs font-mono tracking-widest"
              style={{ color: '#00aa00' }}
            >
              SYSTEM BOOT SEQUENCE
            </div>
            <div
              className="text-xs font-mono"
              style={{ color: '#006600' }}
            >
              {dateStr} · PRESS ESC TO SKIP
            </div>
          </div>

          {/* ── Progress bar ── */}
          <div
            className="mb-6 overflow-hidden rounded-sm"
            style={{
              height: 5,
              background: '#00ff0011',
              border: '1px solid #00ff0022',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #00aa0099, #00ff00)',
                boxShadow: '0 0 12px #00ff0055',
                transition: 'width 0.08s linear',
              }}
            />
          </div>

          {/* ── Boot messages ── */}
          <div
            className="font-mono text-sm leading-7 space-y-0.5"
            style={{ minHeight: '14rem' }}
          >
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => {
              const isLast = i === visibleLines - 1;
              const isStatus = line.text.includes('[LOADED]') || line.text.includes('[ONLINE]') || line.text.includes('[ACTIVE]');
              const isWelcome = line.text.startsWith('>> WELCOME') || line.text.startsWith('>> ALL SYSTEMS');

              let color = '#00ff00';
              if (line.dim && !isWelcome) color = '#00aa00';
              if (isWelcome) color = '#00ff88';

              // Highlight the status tags in cyan
              const rendered = isStatus ? (
                <span>
                  <span style={{ color }}>
                    {line.text.replace(/\[.*\]$/, '')}
                  </span>
                  <span style={{ color: '#00ccff', textShadow: '0 0 8px #00ccff66' }}>
                    {line.text.match(/\[.*\]$/)?.[0]}
                  </span>
                </span>
              ) : (
                <span style={{ color, textShadow: isWelcome ? '0 0 10px #00ff8866' : undefined }}>
                  {line.text}
                </span>
              );

              return (
                <div
                  key={i}
                  style={{
                    opacity: isLast ? 1 : 0.8,
                    animation: isLast ? 'site-boot-fadein 0.15s ease-out' : undefined,
                  }}
                >
                  {rendered}
                  {isLast && visibleLines < BOOT_LINES.length && (
                    <span
                      style={{
                        color: '#00ff00',
                        marginLeft: 2,
                        animation: 'site-boot-cursor 0.8s step-end infinite',
                      }}
                    >
                      █
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Footer ── */}
          <div
            className="mt-5 flex items-center justify-between"
            style={{
              borderTop: '1px solid #00ff0015',
              paddingTop: '0.75rem',
            }}
          >
            <div className="text-xs font-mono" style={{ color: '#006600' }}>
              TRAVELLER RPG CAMPAIGN MANAGER
            </div>
            <div
              className="text-xs font-mono"
              style={{ color: '#004400' }}
            >
              CLICK ANYWHERE TO SKIP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to check if boot has already played this session
export const hasSiteBooted = () =>
  sessionStorage.getItem(SESSION_KEY) === '1';
