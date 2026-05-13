import { useState } from "react";
import type { Contact } from "@/lib/bridge/bridgeTypes";
import type { Vehicle } from "@/types/database";
import type { AlertLevel } from "@/lib/bridge/bridgeTypes";
import { HullPointsModal } from "./HullPointsModal";
import { useBridge } from "@/contexts/BridgeContext";
import { useCampaign } from "@/contexts/CampaignContext";

interface ShipStatusMiniProps {
  ship: Contact;
  linkedVehicle?: Vehicle | null;
  alertLevel: AlertLevel;
}

export function ShipStatusMini({ ship, linkedVehicle, alertLevel }: ShipStatusMiniProps) {
  const { updateContactFields } = useBridge();
  const { saveVehicle } = useCampaign();
  const [jDriveStatus, setJDriveStatus] = useState<"CHARGING" | "ONLINE">("CHARGING");
  const [showHullModal, setShowHullModal] = useState(false);

  const hullMax = linkedVehicle?.hull ?? ship.hullMax ?? 0;
  const hullCurrent = linkedVehicle?.hull_current ?? ship.hullCurrent ?? hullMax;
  const hullPercent = hullMax > 0 ? Math.round((hullCurrent / hullMax) * 100) : 100;
  const armorValue = linkedVehicle?.armor ?? 0;
  const isWeaponsArmed = alertLevel === "combat" || alertLevel === "emergency";
  const weaponsStatus = isWeaponsArmed ? "ARMED" : "OFFLINE";
  const weaponsColor = isWeaponsArmed ? "text-terminal-danger-alt" : "text-terminal-text-dimmer";

  const toggleJDrive = () => {
    setJDriveStatus(prev => prev === "CHARGING" ? "ONLINE" : "CHARGING");
  };

  const statusColor = (value: number) => {
    if (value >= 75) return "text-terminal-primary-light";
    if (value >= 50) return "text-terminal-warning-alt";
    return "text-terminal-danger-alt";
  };

  const handleHullSave = async (newHull: number) => {
    if (linkedVehicle) {
      await saveVehicle({ ...linkedVehicle, hull_current: newHull });
    } else {
      await updateContactFields(ship.id, { hullCurrent: newHull });
    }
  };

  const canOpenHullModal = hullMax > 0;

  return (
    <>
      <div className="status-panel bg-terminal-bg-panel-alt border border-terminal-bg-border rounded overflow-hidden">
        <div className="panel-header flex justify-between items-center px-4 py-2 bg-terminal-primary-light/5 border-b border-terminal-bg-border">
          <span className="font-['Orbitron'] text-xs tracking-[3px] text-terminal-text-dimmer">SHIP STATUS</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 text-xs">
          <div
            className={`flex justify-between rounded px-1 -mx-1 transition-colors ${canOpenHullModal ? 'cursor-pointer hover:bg-terminal-bg-border' : ''}`}
            onClick={canOpenHullModal ? () => setShowHullModal(true) : undefined}
            title={canOpenHullModal ? "Click to adjust hull points" : undefined}
          >
            <span className="text-terminal-text-dimmer">HULL</span>
            <span className={`font-['Orbitron'] font-bold ${statusColor(hullPercent)}`}>{hullPercent}%</span>
          </div>

          <div className="flex justify-between">
            <span className="text-terminal-text-dimmer">ARMOR</span>
            <span className="font-['Orbitron'] font-bold text-terminal-primary-light">{armorValue}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-terminal-text-dimmer">M-DRIVE</span>
            <span className="font-['Orbitron'] font-bold text-terminal-primary-light">ONLINE</span>
          </div>

          <div
            className="flex justify-between cursor-pointer hover:bg-terminal-bg-border rounded px-1 -mx-1 transition-colors"
            onClick={toggleJDrive}
            title="Click to toggle J-Drive status"
          >
            <span className="text-terminal-text-dimmer">J-DRIVE</span>
            <span className={`font-['Orbitron'] font-bold ${jDriveStatus === "ONLINE" ? "text-terminal-primary-light" : "text-terminal-warning-alt"}`}>
              {jDriveStatus}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-terminal-text-dimmer">WEAPONS</span>
            <span className={`font-['Orbitron'] font-bold ${weaponsColor}`}>{weaponsStatus}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-terminal-text-dimmer">SENSORS</span>
            <span className="font-['Orbitron'] font-bold text-terminal-primary-light">ACTIVE</span>
          </div>
        </div>
      </div>

      {showHullModal && canOpenHullModal && (
        <HullPointsModal
          shipName={linkedVehicle?.name ?? ship.name}
          hullCurrent={hullCurrent}
          hullMax={hullMax}
          onClose={() => setShowHullModal(false)}
          onSave={handleHullSave}
        />
      )}
    </>
  );
}
