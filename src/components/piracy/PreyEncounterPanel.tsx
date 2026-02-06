import React, { useState } from 'react';
import { usePiracy } from '@/contexts/PiracyContext';
import { SystemClassification, SystemSecurity, PreyType } from '@/types/piracy';
import { rollPreyEncounter } from '@/lib/piracy/generators';
import { PREY_TYPE_LABELS } from '@/lib/piracy/tables';
import { Crosshair, Dice1, ChevronDown, AlertTriangle, Ship } from 'lucide-react';

const PREY_COLORS: Record<PreyType, string> = {
  no_encounter: 'text-gray-500',
  traveller: 'text-terminal-primary',
  small_freighter: 'text-green-400',
  medium_freighter: 'text-emerald-400',
  heavy_freighter: 'text-cyan-400',
  rich_freighter: 'text-yellow-400',
  convoy: 'text-orange-400',
  liner: 'text-purple-400',
  unusual_vessel: 'text-pink-400',
  system_defence_boat: 'text-red-400',
  naval_patrol: 'text-red-600',
};

const PREY_THREAT: Record<PreyType, 'safe' | 'caution' | 'danger'> = {
  no_encounter: 'safe',
  traveller: 'safe',
  small_freighter: 'safe',
  medium_freighter: 'safe',
  heavy_freighter: 'caution',
  rich_freighter: 'caution',
  convoy: 'caution',
  liner: 'caution',
  unusual_vessel: 'caution',
  system_defence_boat: 'danger',
  naval_patrol: 'danger',
};

const CLASSIFICATION_LABELS: Record<SystemClassification, string> = {
  backwater: 'Backwater (DM-1 traffic)',
  standard: 'Standard (no DM)',
  high_traffic: 'High Traffic (DM+1)',
  capital: 'Capital/Key (DM+2)',
};

const SECURITY_LABELS: Record<SystemSecurity, string> = {
  dangerous: 'Dangerous (DM-1 security)',
  standard: 'Standard (no DM)',
  secure: 'Secure (DM+1)',
  naval_base: 'Naval Base (DM+2)',
};

export const PreyEncounterPanel: React.FC = () => {
  const { preyEncounters, addPreyEncounter } = usePiracy();
  const [classification, setClassification] = useState<SystemClassification>('standard');
  const [security, setSecurity] = useState<SystemSecurity>('standard');
  const [systemName, setSystemName] = useState('');
  const [lastResult, setLastResult] = useState<{ rawDice: [number, number]; modifiedDice: [number, number]; result: PreyType } | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleRoll = () => {
    const encounter = rollPreyEncounter(classification, security);

    addPreyEncounter({
      system_name: systemName || undefined,
      system_classification: classification,
      system_security: security,
      raw_roll: encounter.rawDice,
      modified_roll: encounter.modifiedDice,
      result: encounter.result,
    });

    setLastResult({
      rawDice: encounter.rawDice,
      modifiedDice: encounter.modifiedDice,
      result: encounter.result,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-terminal-primary flex items-center gap-2">
        <Crosshair className="h-5 w-5" />
        PREY ENCOUNTER SCANNER
      </h3>

      {/* System Configuration */}
      <div className="terminal-card p-4 space-y-3">
        <input
          type="text"
          placeholder="System name (optional)"
          value={systemName}
          onChange={e => setSystemName(e.target.value)}
          className="terminal-input text-sm w-full"
        />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-terminal-text-dimmer block mb-1">System Traffic</label>
            <select
              value={classification}
              onChange={e => setClassification(e.target.value as SystemClassification)}
              className="terminal-input text-sm w-full"
            >
              {(Object.keys(CLASSIFICATION_LABELS) as SystemClassification[]).map(c => (
                <option key={c} value={c}>{CLASSIFICATION_LABELS[c]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-terminal-text-dimmer block mb-1">System Security</label>
            <select
              value={security}
              onChange={e => setSecurity(e.target.value as SystemSecurity)}
              className="terminal-input text-sm w-full"
            >
              {(Object.keys(SECURITY_LABELS) as SystemSecurity[]).map(s => (
                <option key={s} value={s}>{SECURITY_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleRoll}
          className="terminal-btn primary w-full text-sm py-3 flex items-center justify-center gap-2"
        >
          <Dice1 className="h-4 w-4" />
          SCAN FOR PREY (D66)
        </button>
      </div>

      {/* Result Display */}
      {lastResult && (
        <div className={`terminal-card p-4 border-2 ${
          PREY_THREAT[lastResult.result] === 'danger' ? 'border-red-500' :
          PREY_THREAT[lastResult.result] === 'caution' ? 'border-orange-500' :
          lastResult.result === 'no_encounter' ? 'border-gray-600' :
          'border-green-500'
        }`}>
          <div className="text-center">
            <div className="text-xs text-terminal-text-dimmer mb-1">
              D66: [{lastResult.rawDice[0]}, {lastResult.rawDice[1]}] → Modified: [{lastResult.modifiedDice[0]}, {lastResult.modifiedDice[1]}]
            </div>
            <div className={`text-2xl font-bold font-mono ${PREY_COLORS[lastResult.result]}`}>
              {PREY_TYPE_LABELS[lastResult.result]}
            </div>

            {PREY_THREAT[lastResult.result] === 'danger' && (
              <div className="mt-2 text-red-400 text-sm flex items-center justify-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                HOSTILE CONTACT - THREAT DETECTED
              </div>
            )}

            {lastResult.result === 'no_encounter' && (
              <div className="mt-2 text-gray-500 text-sm">
                Sensors clear. No viable targets detected.
              </div>
            )}

            {lastResult.result !== 'no_encounter' && PREY_THREAT[lastResult.result] !== 'danger' && (
              <div className="mt-2 text-green-400 text-sm flex items-center justify-center gap-1">
                <Ship className="h-4 w-4" />
                Contact detected on long-range sensors.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Reference */}
      <div className="terminal-card p-3">
        <div className="text-xs font-bold text-terminal-text-dimmer mb-2">SYSTEM CLASSIFICATION REFERENCE</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="text-terminal-text-dimmer">Backwater: Class X/E, off trade route</div>
          <div className="text-terminal-text-dimmer">Dangerous: Amber/Red zone, Law 3-</div>
          <div className="text-terminal-text-dimmer">High Traffic: Class A/B + trade codes</div>
          <div className="text-terminal-text-dimmer">Secure: Law 7+, tech to patrol</div>
          <div className="text-terminal-text-dimmer">Capital: Subsector capital</div>
          <div className="text-terminal-text-dimmer">Naval Base: Navy present in 6 parsecs</div>
        </div>
      </div>

      {/* Encounter History */}
      <div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-sm text-terminal-text-dimmer hover:text-terminal-primary transition-colors"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
          Encounter History ({preyEncounters.length})
        </button>

        {showHistory && (
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {preyEncounters.slice(0, 20).map(enc => (
              <div key={enc.id} className="text-xs p-2 border border-terminal-border rounded bg-terminal-bg-dark">
                <div className="flex items-center justify-between">
                  <span className={PREY_COLORS[enc.result]}>
                    {PREY_TYPE_LABELS[enc.result]}
                  </span>
                  <span className="text-terminal-text-dimmer">
                    {enc.system_name || 'Unknown System'}
                  </span>
                </div>
                <div className="text-terminal-text-dimmer mt-1">
                  D66: [{enc.raw_roll[0]}, {enc.raw_roll[1]}] → [{enc.modified_roll[0]}, {enc.modified_roll[1]}] | {new Date(enc.encounter_date).toLocaleDateString()}
                </div>
              </div>
            ))}
            {preyEncounters.length === 0 && (
              <div className="text-xs text-terminal-text-dimmer text-center py-2">No encounters recorded.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
