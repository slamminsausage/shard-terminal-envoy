import React, { useState } from 'react';
import { usePiracy } from '@/contexts/PiracyContext';
import { MoraleEvent } from '@/types/piracy';
import { rollMoraleDamage } from '@/lib/piracy/generators';
import { roll2d6 } from '@/lib/dice';
import { Heart, AlertTriangle, TrendingDown, TrendingUp, ChevronDown } from 'lucide-react';

const getMoraleColor = (mor: number, max: number) => {
  const ratio = mor / max;
  if (mor === 0) return 'text-red-600';
  if (ratio <= 0.25) return 'text-red-400';
  if (ratio <= 0.5) return 'text-orange-400';
  if (ratio <= 0.75) return 'text-yellow-400';
  return 'text-green-400';
};

const getMoraleDM = (mor: number) => {
  if (mor <= 2) return -2;
  if (mor <= 5) return -1;
  if (mor <= 8) return 0;
  if (mor <= 11) return 1;
  return 2;
};

export const MoraleTracker: React.FC = () => {
  const { morale, moraleEvents, adjustMorale, setMorale } = usePiracy();
  const [showEventLog, setShowEventLog] = useState(false);
  const [customDesc, setCustomDesc] = useState('');
  const [customAmount, setCustomAmount] = useState('');

  const morDM = getMoraleDM(morale.current_mor);

  const handleMoraleCheck = () => {
    const roll = roll2d6();
    const total = roll + morDM;
    const success = total >= 8;

    if (success) {
      adjustMorale(0, 'check_passed', `MOR check passed (rolled ${roll} + DM${morDM >= 0 ? '+' : ''}${morDM} = ${total} vs 8+)`, roll, 8);
    } else {
      const damage = rollMoraleDamage();
      adjustMorale(-damage, 'check_failed', `MOR check failed (rolled ${roll} + DM${morDM >= 0 ? '+' : ''}${morDM} = ${total} vs 8+). Morale damaged by ${damage}.`, roll, 8);
    }
  };

  const handleMonthlyDrain = () => {
    adjustMorale(-1, 'monthly_drain', 'Monthly drain: no division of spoils this month.');
  };

  const handleFailedCapture = () => {
    adjustMorale(-1, 'failed_capture', 'Morale drops after failed capture attempt.');
  };

  const handleCaptureSuccess = () => {
    adjustMorale(1, 'capture_success', 'Morale boosted by successful capture!');
  };

  const handleShoreLeave = () => {
    adjustMorale(1, 'shore_leave', 'Crew granted shore leave and intoxicants.');
  };

  const handleCustomAdjust = () => {
    const amount = parseInt(customAmount, 10);
    if (isNaN(amount) || !customDesc.trim()) return;
    adjustMorale(amount, 'manual_adjust', customDesc.trim());
    setCustomDesc('');
    setCustomAmount('');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-terminal-primary flex items-center gap-2">
        <Heart className="h-5 w-5" />
        CREW MORALE
      </h3>

      {/* Main Morale Display */}
      <div className="terminal-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-center">
            <div className={`text-4xl font-bold font-mono ${getMoraleColor(morale.current_mor, morale.max_mor)}`}>
              {morale.current_mor}
            </div>
            <div className="text-xs text-terminal-text-dimmer">Current MOR</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold font-mono text-terminal-text-dimmer">
              / {morale.max_mor}
            </div>
            <div className="text-xs text-terminal-text-dimmer">Maximum</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold font-mono ${morDM >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {morDM >= 0 ? '+' : ''}{morDM}
            </div>
            <div className="text-xs text-terminal-text-dimmer">MOR DM</div>
          </div>
        </div>

        {/* Morale Bar */}
        <div className="w-full h-3 bg-terminal-bg-dark border border-terminal-border rounded-sm overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              morale.current_mor === 0 ? 'bg-red-600' :
              morale.current_mor <= morale.max_mor * 0.25 ? 'bg-red-500' :
              morale.current_mor <= morale.max_mor * 0.5 ? 'bg-orange-500' :
              morale.current_mor <= morale.max_mor * 0.75 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${(morale.current_mor / morale.max_mor) * 100}%` }}
          />
        </div>

        {morale.current_mor === 0 && (
          <div className="mt-2 p-2 bg-red-900/30 border border-red-600 rounded text-red-400 text-sm text-center font-bold animate-pulse">
            <AlertTriangle className="h-4 w-4 inline mr-1" />
            MUTINY! The crew is attempting to overthrow leadership!
          </div>
        )}

        {morale.months_without_spoils > 0 && (
          <div className="mt-2 text-xs text-orange-400">
            <AlertTriangle className="h-3 w-3 inline mr-1" />
            {morale.months_without_spoils} month{morale.months_without_spoils > 1 ? 's' : ''} without division of spoils
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleMoraleCheck} className="terminal-btn primary text-xs py-2">
          MOR Check (8+)
        </button>
        <button onClick={handleMonthlyDrain} className="terminal-btn text-xs py-2 text-orange-400 border-orange-400">
          <TrendingDown className="h-3 w-3 inline mr-1" /> Monthly Drain (-1)
        </button>
        <button onClick={handleFailedCapture} className="terminal-btn text-xs py-2 text-red-400 border-red-400">
          Failed Capture (-1)
        </button>
        <button onClick={handleCaptureSuccess} className="terminal-btn text-xs py-2 text-green-400 border-green-400">
          <TrendingUp className="h-3 w-3 inline mr-1" /> Capture! (+1)
        </button>
        <button onClick={handleShoreLeave} className="terminal-btn text-xs py-2 text-cyan-400 border-cyan-400">
          Shore Leave (+1)
        </button>
        <div className="flex gap-1">
          <input
            type="number"
            value={customAmount}
            onChange={e => setCustomAmount(e.target.value)}
            placeholder="+/-"
            className="terminal-input text-xs w-14"
          />
          <input
            type="text"
            value={customDesc}
            onChange={e => setCustomDesc(e.target.value)}
            placeholder="Reason..."
            className="terminal-input text-xs flex-1"
          />
          <button onClick={handleCustomAdjust} className="terminal-btn text-xs">Go</button>
        </div>
      </div>

      {/* Manual Set */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-terminal-text-dimmer">Set MOR:</span>
        <input
          type="range"
          min={0}
          max={morale.max_mor}
          value={morale.current_mor}
          onChange={e => setMorale(parseInt(e.target.value, 10))}
          className="flex-1 accent-green-500"
        />
        <span className="text-xs text-terminal-primary font-mono w-6 text-right">{morale.current_mor}</span>
      </div>

      {/* Event Log */}
      <div>
        <button
          onClick={() => setShowEventLog(!showEventLog)}
          className="flex items-center gap-2 text-sm text-terminal-text-dimmer hover:text-terminal-primary transition-colors"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${showEventLog ? 'rotate-180' : ''}`} />
          Event Log ({moraleEvents.length})
        </button>

        {showEventLog && (
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {moraleEvents.slice(0, 20).map(event => (
              <div key={event.id} className="text-xs p-2 border border-terminal-border rounded bg-terminal-bg-dark">
                <div className="flex items-center justify-between">
                  <span className={event.mor_change >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {event.mor_change >= 0 ? '+' : ''}{event.mor_change} MOR
                  </span>
                  <span className="text-terminal-text-dimmer">
                    {new Date(event.event_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-terminal-text-dimmer mt-1">{event.description}</div>
              </div>
            ))}
            {moraleEvents.length === 0 && (
              <div className="text-xs text-terminal-text-dimmer text-center py-2">No events recorded.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
