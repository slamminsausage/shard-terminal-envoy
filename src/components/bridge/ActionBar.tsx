interface ActionBarProps {
  alertLevel: "normal" | "elevated" | "combat" | "emergency";
  onAlertChange: (level: "normal" | "elevated" | "combat" | "emergency") => void;
  onScanClick: () => void;
  onHailClick: () => void;
  onDamageCalcClick?: () => void;
}

export function ActionBar({ alertLevel, onAlertChange, onScanClick, onHailClick, onDamageCalcClick }: ActionBarProps) {
  const cycleAlert = () => {
    const levels: Array<"normal" | "elevated" | "combat" | "emergency"> = ["normal", "elevated", "combat", "emergency"];
    const currentIndex = levels.indexOf(alertLevel);
    const nextIndex = (currentIndex + 1) % levels.length;
    onAlertChange(levels[nextIndex]);
  };

  return (
    <div className="action-bar flex gap-2 p-3 bg-[#0d1210] border-t border-[#1a2420]">
      <button
        onClick={cycleAlert}
        className={`flex-1 py-2.5 px-4 rounded text-xs font-mono transition-all border bg-[#00ff8808] hover:bg-[#00ff8815] ${
          alertLevel === "emergency"
            ? "border-[#ff4455] text-[#ff4455]"
            : alertLevel === "combat"
              ? "border-[#ffaa00] text-[#ffaa00]"
              : alertLevel === "elevated"
                ? "border-[#ffaa00] text-[#ffaa00]"
                : "border-[#1a2420] text-[#446655] hover:text-[#00ff88] hover:border-[#00aa55]"
        }`}
      >
        ALERT: {alertLevel.toUpperCase()}
      </button>

      <button
        onClick={onScanClick}
        className="flex-1 py-2.5 px-4 rounded text-xs font-mono transition-all border border-[#1a2420] text-[#446655] bg-[#00ff8808] hover:bg-[#00ff8815] hover:text-[#00ff88] hover:border-[#00aa55]"
      >
        SCAN
      </button>

      <button
        onClick={onHailClick}
        className="flex-1 py-2.5 px-4 rounded text-xs font-mono transition-all border border-[#1a2420] text-[#446655] bg-[#00ff8808] hover:bg-[#00ff8815] hover:text-[#00ff88] hover:border-[#00aa55]"
      >
        HAIL
      </button>

      {onDamageCalcClick && (
        <button
          onClick={onDamageCalcClick}
          className="flex-1 py-2.5 px-4 rounded text-xs font-mono transition-all border border-[#1a2420] text-[#446655] bg-[#00ff8808] hover:bg-[#00ff8815] hover:text-[#00ff88] hover:border-[#00aa55]"
        >
          DMG CALC
        </button>
      )}
    </div>
  );
}
