import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HullPointsModalProps {
  shipName: string;
  hullCurrent: number;
  hullMax: number;
  onClose: () => void;
  onSave: (newHull: number) => Promise<void>;
}

export function HullPointsModal({ shipName, hullCurrent: initialHull, hullMax, onClose, onSave }: HullPointsModalProps) {
  const [currentHull, setCurrentHull] = useState(Math.max(0, Math.min(hullMax, initialHull)));
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDestroy, setConfirmDestroy] = useState(false);

  const maxHull = hullMax;
  const hullPercent = maxHull > 0 ? Math.round((currentHull / maxHull) * 100) : 100;

  const statusColor = () => {
    if (hullPercent >= 75) return "text-terminal-primary-light";
    if (hullPercent >= 50) return "text-terminal-warning-alt";
    return "text-terminal-danger-alt";
  };

  const handleAdjust = (amount: number) => {
    setCurrentHull(prev => Math.max(0, Math.min(maxHull, prev + amount)));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(currentHull);
      onClose();
    } catch (error) {
      console.error("Failed to save hull points:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-terminal-bg-panel-alt border border-terminal-bg-border rounded-lg shadow-[0_0_32px_rgba(58,226,179,0.2)] w-full max-w-sm mx-4">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-terminal-bg-border bg-terminal-primary-light/5">
          <span className="font-['Orbitron'] text-sm tracking-[2px] text-terminal-primary-light">HULL STATUS</span>
          <button onClick={onClose} className="text-terminal-text-dimmer hover:text-terminal-primary-light transition-colors">✕</button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="text-center">
            <div className="text-terminal-text-dimmer text-xs uppercase tracking-wider mb-1">Ship</div>
            <div className="font-['Orbitron'] text-terminal-primary-light">{shipName}</div>
          </div>

          <div className="text-center">
            <div className="text-terminal-text-dimmer text-xs uppercase tracking-wider mb-2">Hull Integrity</div>
            <div className={`font-['Orbitron'] text-4xl font-bold ${statusColor()}`}>{hullPercent}%</div>
            <div className="text-terminal-text-dimmer text-sm mt-1">{currentHull} / {maxHull} HP</div>
          </div>

          <div className="h-3 bg-terminal-bg-border rounded overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${hullPercent >= 75 ? "bg-terminal-primary-light" : hullPercent >= 50 ? "bg-terminal-warning-alt" : "bg-terminal-danger-alt"}`}
              style={{ width: `${hullPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {([-5, -1, 1, 5] as const).map(n => (
              <Button key={n} variant="outline" size="sm"
                onClick={() => handleAdjust(n)}
                className={n < 0 ? "border-terminal-danger-alt text-terminal-danger-alt hover:bg-terminal-danger-alt/20" : "border-terminal-primary-light text-terminal-primary-light hover:bg-terminal-primary-light/20"}
              >
                {n > 0 ? `+${n}` : n}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-terminal-text-dimmer text-xs uppercase">Set HP:</span>
            <Input
              type="number"
              value={currentHull}
              onChange={e => setCurrentHull(Math.max(0, Math.min(maxHull, parseInt(e.target.value, 10) || 0)))}
              min={0}
              max={maxHull}
              className="h-8 w-20 text-center bg-terminal-bg-darker border-terminal-bg-border text-terminal-primary-light"
            />
            <span className="text-terminal-text-dimmer text-xs">/ {maxHull}</span>
          </div>

          {/* Quick Actions */}
          {confirmDestroy ? (
            <div className="border border-terminal-danger-alt/50 rounded p-2 space-y-2">
              <p className="text-terminal-danger-alt text-xs text-center">Confirm ship destroyed?</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setConfirmDestroy(false)}
                  className="flex-1 border-terminal-text-dimmer text-terminal-text-dimmer">
                  Cancel
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setCurrentHull(0); setConfirmDestroy(false); }}
                  className="flex-1 border-terminal-danger-alt text-terminal-danger-alt hover:bg-terminal-danger-alt/20">
                  Destroyed
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentHull(maxHull)}
                className="flex-1 border-terminal-primary-light text-terminal-primary-light hover:bg-terminal-primary-light/20">
                Full Repair
              </Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmDestroy(true)}
                className="flex-1 border-terminal-danger-alt text-terminal-danger-alt hover:bg-terminal-danger-alt/20">
                Destroyed
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2 p-4 border-t border-terminal-bg-border">
          <Button variant="outline" onClick={onClose}
            className="flex-1 border-terminal-text-dimmer text-terminal-text-dimmer hover:bg-terminal-text-dimmer/20">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}
            className="flex-1 bg-terminal-primary-light text-black hover:bg-terminal-primary-mid">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
