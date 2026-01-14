import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCampaign } from "@/contexts/CampaignContext";
import type { Vehicle } from "@/types/database";

interface HullPointsModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export function HullPointsModal({ vehicle, onClose }: HullPointsModalProps) {
  const { saveVehicle } = useCampaign();

  const [currentHull, setCurrentHull] = useState(vehicle.hull_current ?? vehicle.hull ?? 0);
  const [isSaving, setIsSaving] = useState(false);

  const maxHull = vehicle.hull ?? 0;
  const hullPercent = maxHull > 0 ? Math.round((currentHull / maxHull) * 100) : 100;

  const statusColor = () => {
    if (hullPercent >= 75) return "text-terminal-primary-light";
    if (hullPercent >= 50) return "text-terminal-warning-alt";
    return "text-terminal-danger-alt";
  };

  const handleAdjust = (amount: number) => {
    setCurrentHull(prev => {
      const newValue = prev + amount;
      return Math.max(0, Math.min(maxHull, newValue));
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveVehicle({
        ...vehicle,
        hull_current: currentHull,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save hull points:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-terminal-bg-panel-alt border border-terminal-bg-border rounded-lg shadow-[0_0_32px_rgba(0,255,0,0.2)] w-full max-w-sm mx-4">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-terminal-bg-border bg-terminal-primary-light/5">
          <span className="font-['Orbitron'] text-sm tracking-[2px] text-terminal-primary-light">HULL STATUS</span>
          <button
            onClick={onClose}
            className="text-terminal-text-dimmer hover:text-terminal-primary-light transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Ship Name */}
          <div className="text-center">
            <div className="text-terminal-text-dimmer text-xs uppercase tracking-wider mb-1">Ship</div>
            <div className="font-['Orbitron'] text-terminal-primary-light">{vehicle.name}</div>
          </div>

          {/* Hull Display */}
          <div className="text-center">
            <div className="text-terminal-text-dimmer text-xs uppercase tracking-wider mb-2">Hull Integrity</div>
            <div className={`font-['Orbitron'] text-4xl font-bold ${statusColor()}`}>
              {hullPercent}%
            </div>
            <div className="text-terminal-text-dimmer text-sm mt-1">
              {currentHull} / {maxHull} HP
            </div>
          </div>

          {/* Hull Progress Bar */}
          <div className="h-3 bg-terminal-bg-border rounded overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                hullPercent >= 75 ? "bg-terminal-primary-light" :
                hullPercent >= 50 ? "bg-terminal-warning-alt" :
                "bg-terminal-danger-alt"
              }`}
              style={{ width: `${hullPercent}%` }}
            />
          </div>

          {/* Quick Adjust Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAdjust(-5)}
              className="border-terminal-danger-alt text-terminal-danger-alt hover:bg-terminal-danger-alt/20"
            >
              -5
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAdjust(-1)}
              className="border-terminal-danger-alt text-terminal-danger-alt hover:bg-terminal-danger-alt/20"
            >
              -1
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAdjust(1)}
              className="border-terminal-primary-light text-terminal-primary-light hover:bg-terminal-primary-light/20"
            >
              +1
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAdjust(5)}
              className="border-terminal-primary-light text-terminal-primary-light hover:bg-terminal-primary-light/20"
            >
              +5
            </Button>
          </div>

          {/* Direct Input */}
          <div className="flex items-center gap-2">
            <span className="text-terminal-text-dimmer text-xs uppercase">Set HP:</span>
            <Input
              type="number"
              value={currentHull}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setCurrentHull(Math.max(0, Math.min(maxHull, val)));
              }}
              min={0}
              max={maxHull}
              className="h-8 w-20 text-center bg-terminal-bg-darker border-terminal-bg-border text-terminal-primary-light"
            />
            <span className="text-terminal-text-dimmer text-xs">/ {maxHull}</span>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentHull(maxHull)}
              className="flex-1 border-terminal-primary-light text-terminal-primary-light hover:bg-terminal-primary-light/20"
            >
              Full Repair
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentHull(0)}
              className="flex-1 border-terminal-danger-alt text-terminal-danger-alt hover:bg-terminal-danger-alt/20"
            >
              Destroyed
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-terminal-bg-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-terminal-text-dimmer text-terminal-text-dimmer hover:bg-terminal-text-dimmer/20"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-terminal-primary-light text-black hover:bg-terminal-primary-mid"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
