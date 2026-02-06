import React, { useState, useMemo } from 'react';
import { usePiracy } from '@/contexts/PiracyContext';
import { CrewRetentionResult } from '@/types/piracy';
import { PORT_ATTITUDE_CONFIG } from '@/lib/piracy/tables';
import { rollCrewRetention } from '@/lib/piracy/generators';
import { Coins, Calculator, ChevronDown } from 'lucide-react';

export const SpoilsCalculator: React.FC = () => {
  const { ports, crew, morale, spoilsDivisions, addSpoilsDivision, adjustMorale } = usePiracy();
  const [cargoValue, setCargoValue] = useState('');
  const [selectedPortId, setSelectedPortId] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [lastRetentionResults, setLastRetentionResults] = useState<CrewRetentionResult[] | null>(null);

  const activeCrew = crew.filter(c => c.is_active);

  const selectedPort = ports.find(p => p.id === selectedPortId);
  const fencePercent = selectedPort ? PORT_ATTITUDE_CONFIG[selectedPort.attitude].fencePercent : 0;

  const calculation = useMemo(() => {
    const totalValue = parseFloat(cargoValue) || 0;
    const fencedValue = Math.floor(totalValue * (fencePercent / 100));
    const olebTithe = Math.floor(fencedValue * 0.10);
    const distributable = fencedValue - olebTithe;
    const totalShares = activeCrew.reduce((sum, c) => sum + c.shares, 0);
    const valuePerShare = totalShares > 0 ? Math.floor(distributable / totalShares) : 0;

    return {
      totalValue,
      fencePercent,
      fencedValue,
      olebTithe,
      distributable,
      totalShares,
      valuePerShare,
      crewBreakdown: activeCrew.map(c => ({
        id: c.id,
        name: c.name,
        shares: c.shares,
        payout: valuePerShare * c.shares,
        is_pc: c.is_pc,
      })),
    };
  }, [cargoValue, fencePercent, activeCrew]);

  const getMoraleDM = (mor: number) => {
    if (mor <= 2) return -2;
    if (mor <= 5) return -1;
    if (mor <= 8) return 0;
    if (mor <= 11) return 1;
    return 2;
  };

  const handleDivideSpoils = () => {
    if (calculation.totalValue <= 0 || !selectedPort) return;

    // Roll crew retention
    const morDM = getMoraleDM(morale.current_mor);
    const retentionResults: CrewRetentionResult[] = activeCrew
      .filter(c => !c.is_pc)
      .map(c => {
        const result = rollCrewRetention(morDM);
        return {
          crew_id: c.id,
          crew_name: c.name,
          roll: result.roll,
          mor_dm: morDM,
          total: result.total,
          target: 6,
          stays: result.stays,
        };
      });

    addSpoilsDivision({
      total_cargo_value: calculation.totalValue,
      fence_percent: calculation.fencePercent,
      fenced_value: calculation.fencedValue,
      oleb_tithe: calculation.olebTithe,
      distributable: calculation.distributable,
      total_shares: calculation.totalShares,
      value_per_share: calculation.valuePerShare,
      crew_retention_results: retentionResults,
    });

    // Boost morale from spoils division
    adjustMorale(1, 'spoils_division', `Division of spoils at ${selectedPort.name}. Cr${calculation.valuePerShare.toLocaleString()} per share.`);

    setLastRetentionResults(retentionResults);
    setCargoValue('');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-terminal-primary flex items-center gap-2">
        <Coins className="h-5 w-5" />
        DIVISION OF THE SPOILS
      </h3>

      {/* Calculator */}
      <div className="terminal-card p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-terminal-text-dimmer block mb-1">Total Cargo Value (Cr)</label>
            <input
              type="number"
              placeholder="e.g. 500000"
              value={cargoValue}
              onChange={e => setCargoValue(e.target.value)}
              className="terminal-input text-sm w-full"
              min={0}
            />
          </div>
          <div>
            <label className="text-xs text-terminal-text-dimmer block mb-1">Fence Location</label>
            <select
              value={selectedPortId}
              onChange={e => setSelectedPortId(e.target.value)}
              className="terminal-input text-sm w-full"
            >
              <option value="">Select port...</option>
              {ports.filter(p => PORT_ATTITUDE_CONFIG[p.attitude].fencePercent > 0).map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({PORT_ATTITUDE_CONFIG[p.attitude].label} - {PORT_ATTITUDE_CONFIG[p.attitude].fencePercent}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Breakdown */}
        {calculation.totalValue > 0 && selectedPort && (
          <div className="space-y-2 pt-2 border-t border-terminal-border">
            <div className="flex justify-between text-sm">
              <span className="text-terminal-text-dimmer">Total Cargo Value</span>
              <span className="text-terminal-primary">Cr{calculation.totalValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-terminal-text-dimmer">Fenced at {calculation.fencePercent}%</span>
              <span className="text-yellow-400">Cr{calculation.fencedValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-terminal-text-dimmer">King Oleb's Tithe (10%)</span>
              <span className="text-red-400">-Cr{calculation.olebTithe.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-terminal-border pt-1">
              <span className="text-terminal-primary">Distributable</span>
              <span className="text-green-400">Cr{calculation.distributable.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-terminal-text-dimmer">Total Shares</span>
              <span className="text-terminal-primary">{calculation.totalShares}</span>
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span className="text-terminal-primary">Value per Share</span>
              <span className="text-green-400">Cr{calculation.valuePerShare.toLocaleString()}</span>
            </div>

            {/* Crew payout breakdown */}
            <div className="mt-2 pt-2 border-t border-terminal-border">
              <div className="text-xs font-bold text-terminal-text-dimmer mb-1">CREW PAYOUTS</div>
              {calculation.crewBreakdown.map(c => (
                <div key={c.id} className="flex justify-between text-xs py-1">
                  <span className="text-terminal-primary">
                    {c.name} {c.is_pc && <span className="text-cyan-400">[PC]</span>}
                    <span className="text-terminal-text-dimmer"> x{c.shares}</span>
                  </span>
                  <span className="text-green-400">Cr{c.payout.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleDivideSpoils}
              className="terminal-btn primary w-full text-sm py-2 mt-2"
            >
              <Calculator className="h-4 w-4 inline mr-1" />
              Divide the Spoils
            </button>
          </div>
        )}
      </div>

      {/* Retention Results */}
      {lastRetentionResults && lastRetentionResults.length > 0 && (
        <div className="terminal-card p-3">
          <div className="text-sm font-bold text-terminal-primary mb-2">CREW RETENTION ROLLS</div>
          <div className="text-xs text-terminal-text-dimmer mb-2">
            Target: 6+ | MOR DM: {getMoraleDM(morale.current_mor) >= 0 ? '+' : ''}{getMoraleDM(morale.current_mor)}
          </div>
          {lastRetentionResults.map(r => (
            <div key={r.crew_id} className="flex justify-between text-xs py-1">
              <span className="text-terminal-primary">{r.crew_name}</span>
              <span>
                Rolled {r.roll} + {r.mor_dm >= 0 ? '+' : ''}{r.mor_dm} = {r.total}
                {r.stays
                  ? <span className="text-green-400 ml-2">STAYS</span>
                  : <span className="text-red-400 ml-2">LEAVES</span>
                }
              </span>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      <div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-sm text-terminal-text-dimmer hover:text-terminal-primary transition-colors"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
          Division History ({spoilsDivisions.length})
        </button>

        {showHistory && (
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {spoilsDivisions.slice(0, 10).map(div => (
              <div key={div.id} className="text-xs p-2 border border-terminal-border rounded bg-terminal-bg-dark">
                <div className="flex items-center justify-between">
                  <span className="text-terminal-primary">
                    Cr{div.total_cargo_value.toLocaleString()} cargo @ {div.fence_percent}%
                  </span>
                  <span className="text-green-400">
                    Cr{div.value_per_share.toLocaleString()}/share
                  </span>
                </div>
                <div className="text-terminal-text-dimmer mt-1">
                  {new Date(div.division_date).toLocaleDateString()} | {div.total_shares} shares | Tithe: Cr{div.oleb_tithe.toLocaleString()}
                </div>
              </div>
            ))}
            {spoilsDivisions.length === 0 && (
              <div className="text-xs text-terminal-text-dimmer text-center py-2">No divisions recorded yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
