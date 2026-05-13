/**
 * AirlockPanel — pressure gauge and seal status for airlock sequences.
 *
 * Animates pressure drop from 100% → 0% as steps complete. Inner/outer
 * seal indicators reflect sequence state.
 */

import React, { useEffect, useState } from 'react';

type PanelState = 'sealed' | 'equalizing' | 'open' | 'failed';

interface AirlockPanelProps {
  state: PanelState;
  accentColor: string;
  stepCount: number;
  completedStepCount: number;
}

export default function AirlockPanel({ state, accentColor, stepCount, completedStepCount }: AirlockPanelProps) {
  const progress = stepCount > 0 ? completedStepCount / stepCount : 0;

  const targetPressure =
    state === 'open'   ? 0 :
    state === 'failed' ? 100 :
    state === 'equalizing' ? Math.round((1 - progress) * 100) : 100;

  const [displayPressure, setDisplayPressure] = useState(100);

  useEffect(() => {
    const diff = targetPressure - displayPressure;
    if (Math.abs(diff) < 1) return;
    const step = diff > 0 ? 2 : -2;
    const id = setInterval(() => {
      setDisplayPressure(prev => {
        const next = prev + step;
        if ((step < 0 && next <= targetPressure) || (step > 0 && next >= targetPressure)) {
          clearInterval(id);
          return targetPressure;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(id);
  }, [targetPressure]);

  const pressureColor =
    displayPressure > 70 ? '#88ffaa' :
    displayPressure > 30 ? '#ffaa00' :
    '#ff3344';

  const sealColor = (sealed: boolean) =>
    state === 'failed' ? '#ff334466' :
    sealed ? '#ff666688' : '#88ffaa';

  const innerSealOpen = state === 'open' || (state === 'equalizing' && progress > 0.5);
  const outerSealOpen = state === 'open';

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
        {/* Pressure gauge */}
        <div className="shrink-0 text-center" style={{ width: 64 }}>
          <div
            className="text-xs uppercase tracking-widest mb-1"
            style={{ color: `${accentColor}66`, fontSize: '7px' }}
          >
            PRESSURE
          </div>

          {/* Circular gauge (CSS) */}
          <div
            className="relative mx-auto flex items-center justify-center rounded-full"
            style={{
              width: 52,
              height: 52,
              border: `3px solid ${pressureColor}44`,
              background: `conic-gradient(${pressureColor}88 ${displayPressure * 3.6}deg, #00000033 0deg)`,
              boxShadow: `0 0 12px ${pressureColor}33`,
              transition: 'background 0.3s',
            }}
          >
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: 36, height: 36,
                background: '#000000cc',
                fontSize: '11px',
                fontWeight: 'bold',
                color: pressureColor,
                textShadow: `0 0 6px ${pressureColor}88`,
              }}
            >
              {displayPressure}
            </div>
          </div>
          <div style={{ color: pressureColor, fontSize: '8px', marginTop: 2 }}>kPa%</div>
        </div>

        {/* Seal status */}
        <div className="flex-1 space-y-1.5">
          <div
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: `${accentColor}66`, fontSize: '8px' }}
          >
            SEAL STATUS
          </div>

          {[
            { name: 'INNER SEAL', open: innerSealOpen },
            { name: 'EQUALIZATION', open: state !== 'sealed' && state !== 'failed' },
            { name: 'OUTER SEAL', open: outerSealOpen },
          ].map(({ name, open }) => (
            <div key={name} className="flex items-center gap-2 text-xs">
              <span style={{ fontSize: '8px', color: sealColor(!open), transition: 'color 0.5s' }}>
                {open ? '●' : '○'}
              </span>
              <span style={{ color: '#ffffff44', flex: 1 }}>{name}</span>
              <span
                style={{
                  color: sealColor(!open),
                  fontSize: '8px',
                  transition: 'color 0.5s',
                }}
              >
                {state === 'failed' ? 'FAULT' : open ? 'OPEN' : 'SEALED'}
              </span>
            </div>
          ))}
        </div>

        {/* State badge */}
        <div className="shrink-0 text-right">
          <div
            className="text-xs uppercase tracking-widest font-bold"
            style={{
              color: state === 'open' ? '#88ffaa' : state === 'failed' ? '#ff3344' : pressureColor,
              fontSize: '9px',
            }}
          >
            {state === 'sealed'     ? 'SEALED' :
             state === 'equalizing' ? 'EQUALIZING' :
             state === 'open'       ? 'OPEN' :
             'FAULT'}
          </div>
        </div>
      </div>
    </div>
  );
}
