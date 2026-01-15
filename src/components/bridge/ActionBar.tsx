interface ActionBarProps {
  alertLevel: "normal" | "elevated" | "combat" | "emergency";
  onAlertChange: (level: "normal" | "elevated" | "combat" | "emergency") => void;
  onScanClick: () => void;
  onHailClick: () => void;
  onDamageCalcClick?: () => void;
  onShipCombatClick?: () => void;
}

export function ActionBar({ alertLevel, onAlertChange, onScanClick, onHailClick, onDamageCalcClick, onShipCombatClick }: ActionBarProps) {
  const cycleAlert = () => {
    const levels: Array<"normal" | "elevated" | "combat" | "emergency"> = ["normal", "elevated", "combat", "emergency"];
    const currentIndex = levels.indexOf(alertLevel);
    const nextIndex = (currentIndex + 1) % levels.length;
    onAlertChange(levels[nextIndex]);
  };

  return (
    <div className="action-bar flex gap-2 p-3 bg-terminal-bg-panel-alt border-t border-terminal-bg-border">
      <button
        onClick={cycleAlert}
        className={`flex-1 py-2.5 px-4 rounded text-xs font-mono transition-all border bg-terminal-primary-light/5 hover:bg-terminal-primary-light/10 ${
          alertLevel === "emergency"
            ? "border-terminal-danger-alt text-terminal-danger-alt"
            : alertLevel === "combat"
              ? "border-terminal-warning-alt text-terminal-warning-alt"
              : alertLevel === "elevated"
                ? "border-terminal-warning-alt text-terminal-warning-alt"
                : "border-terminal-bg-border text-terminal-text-dimmer hover:text-terminal-primary-light hover:border-terminal-primary-mid"
        }`}
      >
        ALERT: {alertLevel.toUpperCase()}
      </button>

      <button
        onClick={onScanClick}
        className="flex-1 py-2.5 px-4 rounded text-xs font-mono transition-all border border-terminal-bg-border text-terminal-text-dimmer bg-terminal-primary-light/5 hover:bg-terminal-primary-light/10 hover:text-terminal-primary-light hover:border-terminal-primary-mid"
      >
        SCAN
      </button>

      <button
        onClick={onHailClick}
        className="flex-1 py-2.5 px-4 rounded text-xs font-mono transition-all border border-terminal-bg-border text-terminal-text-dimmer bg-terminal-primary-light/5 hover:bg-terminal-primary-light/10 hover:text-terminal-primary-light hover:border-terminal-primary-mid"
      >
        HAIL
      </button>

      {onDamageCalcClick && (
        <button
          onClick={onDamageCalcClick}
          className="flex-1 py-2.5 px-4 rounded text-xs font-mono transition-all border border-terminal-bg-border text-terminal-text-dimmer bg-terminal-primary-light/5 hover:bg-terminal-primary-light/10 hover:text-terminal-primary-light hover:border-terminal-primary-mid"
        >
          DMG CALC
        </button>
      )}

      {onShipCombatClick && (
        <button
          onClick={onShipCombatClick}
          className="flex-1 py-2.5 px-4 rounded text-xs font-mono transition-all border border-terminal-warning-alt text-terminal-warning-alt bg-terminal-warning-alt/5 hover:bg-terminal-warning-alt/10 hover:text-terminal-warning-light hover:border-terminal-warning-light"
        >
          COMBAT
        </button>
      )}
    </div>
  );
}
