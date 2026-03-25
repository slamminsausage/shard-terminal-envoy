import React, { useState } from 'react';
import { usePiracy } from '@/contexts/PiracyContext';
import { ImperialPower, StandingEvent } from '@/types/piracy';
import { getStandingEffect, getStandingEffectName } from '@/lib/piracy/tables';
import { rollStandingChange } from '@/lib/piracy/generators';
import { Shield, Swords, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

const STANDING_COLORS: Record<string, string> = {
  ally: 'text-green-400',
  tolerated: 'text-emerald-400',
  ignored: 'text-gray-400',
  irritant: 'text-orange-400',
  infamy: 'text-red-400',
  enemy_of_state: 'text-red-600',
};

const EVENT_TYPES: { value: StandingEvent['event_type']; label: string; defaultDice: number; description: string }[] = [
  { value: 'cargo_theft', label: 'Cargo Theft (>Cr100k)', defaultDice: 0, description: '-1 per incident' },
  { value: 'infamous_incident', label: 'Infamous Incident', defaultDice: -1, description: '-1D' },
  { value: 'atrocity', label: 'Atrocity', defaultDice: -1, description: '-1D' },
  { value: 'interference', label: 'Interference', defaultDice: -1, description: '-1D' },
  { value: 'heroic_deed', label: 'Heroic Deed', defaultDice: 1, description: '+1D' },
  { value: 'monthly_drift', label: 'Monthly Drift', defaultDice: 0, description: 'Drift toward starting value' },
  { value: 'manual_adjust', label: 'Manual Adjustment', defaultDice: 0, description: 'Custom change' },
];

export const StandingPanel: React.FC = () => {
  const { standing, standingEvents, adjustStanding } = usePiracy();
  const [showEventLog, setShowEventLog] = useState(false);
  const [selectedPower, setSelectedPower] = useState<ImperialPower>('imperium');
  const [selectedEvent, setSelectedEvent] = useState<StandingEvent['event_type']>('cargo_theft');
  const [customAmount, setCustomAmount] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  const imperiumEffect = getStandingEffect(standing.imperium_standing);
  const aslanEffect = getStandingEffect(standing.aslan_standing);
  const imperiumEffectName = getStandingEffectName(standing.imperium_standing);
  const aslanEffectName = getStandingEffectName(standing.aslan_standing);

  const handleApplyEvent = () => {
    const eventConfig = EVENT_TYPES.find(e => e.value === selectedEvent);
    if (!eventConfig) return;

    let change = 0;
    let description = '';

    if (selectedEvent === 'manual_adjust') {
      change = parseInt(customAmount, 10) || 0;
      description = customDesc || 'Manual adjustment';
    } else if (selectedEvent === 'cargo_theft') {
      change = -1;
      description = 'Cargo theft incident (>Cr100,000 stolen)';
    } else if (selectedEvent === 'monthly_drift') {
      const currentVal = selectedPower === 'imperium' ? standing.imperium_standing : standing.aslan_standing;
      const startVal = selectedPower === 'imperium' ? 0 : -5;
      if (currentVal < startVal) change = 1;
      else if (currentVal > startVal) change = -1;
      else change = 0;
      description = `Monthly drift toward ${startVal}`;
    } else {
      const diceCount = eventConfig.defaultDice;
      change = rollStandingChange(diceCount);
      description = `${eventConfig.label}: ${change >= 0 ? '+' : ''}${change} (${Math.abs(diceCount)}D)`;
    }

    if (change === 0 && selectedEvent !== 'manual_adjust') {
      return; // No change to apply
    }

    adjustStanding(selectedPower, change, selectedEvent, description);
    setCustomAmount('');
    setCustomDesc('');
  };

  const handleCounterEffect = () => {
    // When something hurts one power, it pleases the other
    const otherPower: ImperialPower = selectedPower === 'imperium' ? 'aslan' : 'imperium';
    const change = rollStandingChange(1);
    adjustStanding(otherPower, change, 'heroic_deed', `Opposing power pleased by setback to the ${selectedPower === 'imperium' ? 'Imperium' : 'Hierate'}: +${change}`);
  };

  const renderStandingGauge = (label: string, value: number, startVal: number, effectName: string, effectConfig: { label: string; description: string }) => {
    const clampedVal = Math.max(-50, Math.min(30, value));
    const position = ((clampedVal + 50) / 80) * 100;

    return (
      <div className="terminal-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-terminal-primary">{label}</span>
          <span className={`text-sm font-bold ${STANDING_COLORS[effectName]}`}>{effectConfig.label}</span>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className={`text-3xl font-bold font-mono ${value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {value >= 0 ? '+' : ''}{value}
          </div>
          <div className="text-xs text-terminal-text-dimmer">(starts at {startVal >= 0 ? '+' : ''}{startVal})</div>
        </div>

        {/* Standing bar */}
        <div className="w-full h-2 bg-terminal-bg-dark border border-terminal-border rounded-sm overflow-hidden relative mb-2">
          <div className="absolute inset-0 flex">
            <div className="bg-red-900/30 flex-1" />
            <div className="bg-red-800/30 flex-1" />
            <div className="bg-orange-900/30 flex-1" />
            <div className="bg-gray-800/30 flex-1" />
            <div className="bg-emerald-900/30 flex-1" />
            <div className="bg-green-900/30 flex-1" />
          </div>
          <div
            className="absolute top-0 bottom-0 w-1 bg-terminal-primary rounded"
            style={{ left: `${position}%` }}
          />
        </div>

        <div className="text-xs text-terminal-text-dimmer">{effectConfig.description}</div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-terminal-primary flex items-center gap-2">
        <Shield className="h-5 w-5" />
        POLITICAL STANDING
      </h3>

      {renderStandingGauge('Third Imperium', standing.imperium_standing, 0, imperiumEffectName, imperiumEffect)}
      {renderStandingGauge('Aslan Hierate', standing.aslan_standing, -5, aslanEffectName, aslanEffect)}

      {/* Event Application */}
      <div className="terminal-card p-3 space-y-2">
        <div className="text-sm font-bold text-terminal-primary mb-2">RECORD INCIDENT</div>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={selectedPower}
            onChange={e => setSelectedPower(e.target.value as ImperialPower)}
            className="terminal-input text-sm"
          >
            <option value="imperium">Third Imperium</option>
            <option value="aslan">Aslan Hierate</option>
          </select>
          <select
            value={selectedEvent}
            onChange={e => setSelectedEvent(e.target.value as StandingEvent['event_type'])}
            className="terminal-input text-sm"
          >
            {EVENT_TYPES.map(et => (
              <option key={et.value} value={et.value}>{et.label} ({et.description})</option>
            ))}
          </select>
        </div>

        {selectedEvent === 'manual_adjust' && (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Change (+/-)"
              value={customAmount}
              onChange={e => setCustomAmount(e.target.value)}
              className="terminal-input text-sm"
            />
            <input
              type="text"
              placeholder="Description"
              value={customDesc}
              onChange={e => setCustomDesc(e.target.value)}
              className="terminal-input text-sm"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={handleApplyEvent} className="terminal-btn primary text-xs">
            Apply to {selectedPower === 'imperium' ? 'Imperium' : 'Hierate'}
          </button>
          {selectedEvent !== 'monthly_drift' && selectedEvent !== 'manual_adjust' && (
            <button onClick={handleCounterEffect} className="terminal-btn text-xs text-cyan-400 border-cyan-400">
              Counter-effect on {selectedPower === 'imperium' ? 'Hierate' : 'Imperium'} (+1D)
            </button>
          )}
        </div>
      </div>

      {/* Event Log */}
      <div>
        <button
          onClick={() => setShowEventLog(!showEventLog)}
          className="flex items-center gap-2 text-sm text-terminal-text-dimmer hover:text-terminal-primary transition-colors"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${showEventLog ? 'rotate-180' : ''}`} />
          Standing Events ({standingEvents.length})
        </button>

        {showEventLog && (
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {standingEvents.slice(0, 20).map(event => (
              <div key={event.id} className="text-xs p-2 border border-terminal-border rounded bg-terminal-bg-dark">
                <div className="flex items-center justify-between">
                  <span className="text-terminal-text-dimmer">
                    {event.power === 'imperium' ? 'Imperium' : 'Hierate'}
                  </span>
                  <span className={event.standing_change >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {event.standing_change >= 0 ? '+' : ''}{event.standing_change}
                  </span>
                </div>
                <div className="text-terminal-text-dimmer mt-1">{event.description}</div>
              </div>
            ))}
            {standingEvents.length === 0 && (
              <div className="text-xs text-terminal-text-dimmer text-center py-2">No events recorded.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
