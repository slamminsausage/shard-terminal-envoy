import React, { useState, useEffect } from 'react';
import audioManager from '@/lib/audioManager';
import type { KeypadStep as KeypadStepType } from '@/types/terminalAction';

interface KeypadStepProps {
  step: KeypadStepType;
  onComplete: () => void;
  onFail: () => void;
}

const KEYS = ['1','2','3','4','5','6','7','8','9','*','0','#'];

export default function KeypadStep({ step, onComplete, onFail }: KeypadStepProps) {
  const [input, setInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [flashState, setFlashState] = useState<'idle' | 'accept' | 'reject'>('idle');
  const [accepted, setAccepted] = useState(false);
  const [locked, setLocked] = useState(false);
  const maxAttempts = step.max_attempts ?? 3;

  // Auto-submit when code_length reached
  useEffect(() => {
    if (step.code_length && input.length === step.code_length) {
      handleSubmit(input);
    }
  }, [input]);

  const handleSubmit = (code: string) => {
    if (accepted || locked || !code) return;
    const isAccepted = step.accept.some(a => a === code);

    if (isAccepted) {
      setFlashState('accept');
      setAccepted(true);
      audioManager.playEffect(step.sound_on_accept ?? 'access_granted');
      setTimeout(onComplete, 700);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setFlashState('reject');
      audioManager.playEffect(step.sound_on_reject ?? 'access_denied');
      setTimeout(() => {
        setFlashState('idle');
        setInput('');
        if (newAttempts >= maxAttempts) {
          setLocked(true);
          setTimeout(onFail, 800);
        }
      }, 600);
    }
  };

  const pressKey = (k: string) => {
    if (accepted || locked || flashState === 'reject') return;
    if (k === '*') { setInput(''); return; }
    if (k === '#') { handleSubmit(input); return; }
    if (step.code_length && input.length >= step.code_length) return;
    audioManager.playEffect('keypress');
    setInput(prev => prev + k);
  };

  const displayStr = step.mask
    ? '●'.repeat(input.length)
    : input || (locked ? '— LOCKED —' : '—');

  const borderColor =
    flashState === 'accept' ? '#88ffaa' :
    flashState === 'reject' ? '#ff3344' :
    locked               ? '#ff3344' :
    '#00ccff44';

  const displayColor =
    flashState === 'accept' ? '#88ffaa' :
    flashState === 'reject' ? '#ff3344' :
    locked               ? '#ff3344' :
    '#00ccff';

  return (
    <div className="font-mono text-sm space-y-3 select-none">
      {step.label && (
        <div className="text-terminal-primary/80 tracking-wider text-xs uppercase">{step.label}</div>
      )}

      {/* Code display */}
      <div
        className="flex items-center justify-center rounded px-4 py-3 transition-all duration-200"
        style={{
          border: `1px solid ${borderColor}`,
          background: `${displayColor}08`,
          boxShadow: flashState !== 'idle' ? `0 0 18px ${displayColor}44` : 'none',
        }}
      >
        <span
          className="text-2xl tracking-[0.4em] font-bold"
          style={{
            color: displayColor,
            textShadow: `0 0 8px ${displayColor}88`,
            minWidth: '8ch',
            textAlign: 'center',
          }}
        >
          {displayStr}
        </span>
      </div>

      {/* Keypad grid */}
      <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
        {KEYS.map((k) => (
          <button
            key={k}
            onClick={() => pressKey(k)}
            disabled={accepted || locked || flashState === 'reject'}
            className="flex items-center justify-center rounded font-mono font-bold text-lg
                       transition-all duration-100 active:scale-95"
            style={{
              height: '44px',
              border: '1px solid #00ccff33',
              background: '#00ccff08',
              color: accepted ? '#88ffaa' : locked ? '#ff334488' : '#00ccff',
              cursor: accepted || locked ? 'default' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!accepted && !locked) {
                (e.currentTarget as HTMLElement).style.background = '#00ccff18';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 8px #00ccff33';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#00ccff08';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            {k === '*' ? '⌫' : k === '#' ? '↵' : k}
          </button>
        ))}
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: '#00ccff44' }}>
          {locked ? '✕ LOCKED' : accepted ? '✓ ACCEPTED' : `ATTEMPTS: ${attempts}/${maxAttempts}`}
        </span>
        {!step.code_length && !accepted && !locked && (
          <button
            onClick={() => handleSubmit(input)}
            className="px-3 py-1 rounded text-xs font-mono tracking-wider transition-colors"
            style={{ border: '1px solid #00ccff44', color: '#00ccff', background: 'transparent' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#00ccff18'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            ENTER ↵
          </button>
        )}
      </div>

      {/* Reject message */}
      {flashState === 'reject' && (
        <div className="text-red-400 text-xs animate-pulse tracking-wider">
          {step.reject_message ?? 'ACCESS DENIED — CODE INVALID'}
        </div>
      )}
    </div>
  );
}
