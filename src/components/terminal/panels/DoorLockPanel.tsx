/**
 * DoorLockPanel — visual door status display for door_unlock action sequences.
 *
 * Shows a stylized door with lock indicators. Status transitions from locked →
 * unlocked as sequence steps complete. Mounts alongside ActionSequencePlayer.
 */

import React from 'react';

type PanelState = 'locked' | 'unlocking' | 'open' | 'failed';

interface DoorLockPanelProps {
  state: PanelState;
  accentColor: string;
  stepCount: number;
  completedStepCount: number;
}

const LOCK_INDICATORS = ['DEADBOLT', 'MAGNETIC SEAL', 'ACCESS CONTROL'];

export default function DoorLockPanel({ state, accentColor, stepCount, completedStepCount }: DoorLockPanelProps) {
  const progress = stepCount > 0 ? completedStepCount / stepCount : 0;

  // How many indicators are unlocked based on progress
  const unlockedCount =
    state === 'open' ? 3 :
    state === 'failed' ? 0 :
    state === 'unlocking' ? Math.floor(progress * 3) : 0;

  const doorColor =
    state === 'open'   ? '#88ffaa' :
    state === 'failed' ? '#ff3344' :
    state === 'unlocking' ? accentColor :
    '#ff666688';

  const doorOpen = state === 'open';

  return (
    <div
      className="shrink-0 border-b font-mono"
      style={{
        borderColor: `${accentColor}22`,
        backgroundColor: `${accentColor}04`,
        padding: '12px 16px',
      }}
    >
      <div className="flex items-center gap-6">
        {/* Door SVG */}
        <div className="relative shrink-0" style={{ width: 48, height: 64 }}>
          {/* Frame */}
          <div
            style={{
              position: 'absolute', inset: 0,
              border: `2px solid ${doorColor}66`,
              borderRadius: 3,
            }}
          />
          {/* Door panel */}
          <div
            style={{
              position: 'absolute',
              top: 2, bottom: 2,
              left: doorOpen ? '60%' : 2,
              right: doorOpen ? 2 : 2,
              background: doorOpen ? 'transparent' : `${doorColor}18`,
              border: `1px solid ${doorColor}44`,
              borderRadius: 2,
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
          {/* Lock icon */}
          {!doorOpen && (
            <div
              style={{
                position: 'absolute', top: '38%', left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 16,
                color: doorColor,
                textShadow: state === 'locked' ? `0 0 8px ${doorColor}` : 'none',
                transition: 'all 0.4s',
              }}
            >
              {state === 'failed' ? '✕' : '⊡'}
            </div>
          )}
          {doorOpen && (
            <div
              style={{
                position: 'absolute', top: '38%', left: '35%',
                transform: 'translate(-50%, -50%)',
                fontSize: 16,
                color: '#88ffaa',
                textShadow: '0 0 10px #88ffaa88',
              }}
            >
              ○
            </div>
          )}
        </div>

        {/* Lock indicators */}
        <div className="flex-1 space-y-1.5">
          <div
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: `${accentColor}66`, fontSize: '8px' }}
          >
            LOCK STATUS
          </div>
          {LOCK_INDICATORS.map((name, i) => {
            const isUnlocked = i < unlockedCount;
            const isFailed = state === 'failed';
            const color = isFailed ? '#ff334466' : isUnlocked ? '#88ffaa' : '#ff666688';
            const label = isFailed ? 'FAULT' : isUnlocked ? 'RELEASED' : 'LOCKED';
            return (
              <div key={name} className="flex items-center gap-2 text-xs">
                <span
                  style={{
                    fontSize: '8px',
                    color,
                    textShadow: isUnlocked ? `0 0 6px #88ffaa66` : 'none',
                    transition: 'all 0.4s',
                  }}
                >
                  {isUnlocked ? '●' : '○'}
                </span>
                <span style={{ color: '#ffffff44', flex: 1 }}>{name}</span>
                <span
                  className="transition-all duration-400"
                  style={{ color, fontSize: '8px' }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* State badge */}
        <div className="shrink-0 text-right">
          <div
            className="text-xs uppercase tracking-widest font-bold"
            style={{
              color: doorColor,
              textShadow: state !== 'locked' ? `0 0 8px ${doorColor}66` : 'none',
              fontSize: '9px',
            }}
          >
            {state === 'locked'    ? 'SECURED' :
             state === 'unlocking' ? 'BYPASSING' :
             state === 'open'      ? 'OPEN' :
             'FAULT'}
          </div>
        </div>
      </div>
    </div>
  );
}
