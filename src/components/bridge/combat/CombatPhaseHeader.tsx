import { COMBAT_PHASE_LABELS, type CombatPhase, COMBAT_PHASES } from '@/lib/bridge/shipCombatRules';

interface CombatPhaseHeaderProps {
  currentRound: number;
  phase: CombatPhase;
}

export function CombatPhaseHeader({ currentRound, phase }: CombatPhaseHeaderProps) {
  const currentIdx = COMBAT_PHASES.indexOf(phase);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-['Orbitron'] text-xs tracking-[2px] text-terminal-warning-alt">
          ROUND {currentRound}
        </span>
        <span className="font-['Orbitron'] text-xs tracking-[1px] text-terminal-primary">
          {COMBAT_PHASE_LABELS[phase]}
        </span>
      </div>
      <div className="flex gap-1">
        {COMBAT_PHASES.map((p, i) => (
          <div
            key={p}
            className={`flex-1 h-1.5 rounded-full transition-all ${
              i < currentIdx
                ? 'bg-terminal-primary/60'
                : i === currentIdx
                  ? 'bg-terminal-warning-alt shadow-[0_0_4px_var(--warning-alt)]'
                  : 'bg-terminal-bg-border'
            }`}
            title={COMBAT_PHASE_LABELS[p]}
          />
        ))}
      </div>
    </div>
  );
}
