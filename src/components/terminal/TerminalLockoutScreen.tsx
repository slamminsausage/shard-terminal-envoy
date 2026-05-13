/**
 * TerminalLockoutScreen — shown instead of the file grid when a terminal
 * has exceeded its security failure threshold and entered lockout.
 *
 * Cleared only by GM via SUDO UNLOCK from the init prompt.
 */

import React, { useEffect, useState } from 'react';
import audioManager from '@/lib/audioManager';
import { getFailureCount } from '@/lib/terminalSecurity';

interface TerminalLockoutScreenProps {
  terminalCode: string;
  terminalName: string;
  accentColor: string;
}

export default function TerminalLockoutScreen({
  terminalCode,
  terminalName,
  accentColor,
}: TerminalLockoutScreenProps) {
  const [flash, setFlash] = useState(true);
  const failureCount = getFailureCount(terminalCode);

  useEffect(() => {
    audioManager.playEffect('warning', 0.5);
    const t1 = setTimeout(() => audioManager.playEffect('warning', 0.4), 800);
    const t2 = setTimeout(() => audioManager.playEffect('warning', 0.3), 1600);

    const flashId = setInterval(() => setFlash(f => !f), 600);

    return () => {
      clearInterval(flashId);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div
      className="flex flex-col h-full items-center justify-center font-mono select-none"
      style={{
        background: flash
          ? 'radial-gradient(ellipse at center, rgba(255,51,68,0.12) 0%, rgba(0,0,0,0.95) 70%)'
          : 'radial-gradient(ellipse at center, rgba(255,51,68,0.06) 0%, rgba(0,0,0,0.95) 70%)',
        transition: 'background 0.4s',
      }}
    >
      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,51,68,0.025) 2px, rgba(255,51,68,0.025) 4px)',
          zIndex: 1,
        }}
      />

      <div className="relative z-10 text-center px-8 max-w-sm space-y-6">
        {/* Icon */}
        <div
          className="text-5xl transition-all duration-300"
          style={{
            color: flash ? '#ff3344' : '#ff334466',
            textShadow: flash ? '0 0 20px #ff334488' : 'none',
          }}
        >
          ⊠
        </div>

        {/* Header */}
        <div className="space-y-1">
          <div
            className="text-xs uppercase tracking-[0.4em] font-bold transition-all duration-300"
            style={{
              color: flash ? '#ff3344' : '#ff334466',
              textShadow: flash ? '0 0 10px #ff334466' : 'none',
            }}
          >
            SECURITY LOCKOUT
          </div>
          <div
            className="text-xs uppercase tracking-widest"
            style={{ color: '#ffffff33' }}
          >
            TERMINAL SUSPENDED
          </div>
        </div>

        {/* Separator */}
        <div
          className="h-px w-full transition-all duration-300"
          style={{ background: flash ? '#ff334444' : '#ff334422' }}
        />

        {/* Terminal info */}
        <div className="space-y-2 text-left">
          <div className="flex justify-between text-xs" style={{ color: '#ffffff44' }}>
            <span>TERMINAL</span>
            <span style={{ color: '#ffffff88' }}>{terminalCode.toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-xs" style={{ color: '#ffffff44' }}>
            <span>NODE</span>
            <span style={{ color: '#ffffff88' }} className="truncate ml-4 text-right">{terminalName}</span>
          </div>
          <div className="flex justify-between text-xs" style={{ color: '#ffffff44' }}>
            <span>FAILED ATTEMPTS</span>
            <span style={{ color: '#ff3344' }}>{failureCount}</span>
          </div>
          <div className="flex justify-between text-xs" style={{ color: '#ffffff44' }}>
            <span>STATUS</span>
            <span style={{ color: '#ff3344' }}>ACCESS SUSPENDED</span>
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: '#ff334422' }} />

        {/* Admin message */}
        <div className="space-y-2">
          <div
            className="text-xs uppercase tracking-widest"
            style={{ color: '#ff334466' }}
          >
            CONTACT SYSTEM ADMINISTRATOR
          </div>
          <div
            className="text-xs leading-relaxed"
            style={{ color: '#ffffff33' }}
          >
            This terminal has been suspended following repeated security violations.
            All access attempts have been logged.
          </div>
          <div
            className="text-xs mt-3 px-3 py-2 rounded"
            style={{
              border: '1px solid #ff334422',
              background: '#ff334408',
              color: '#ff334466',
              letterSpacing: '0.05em',
            }}
          >
            ADMIN: SUDO UNLOCK {terminalCode.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
