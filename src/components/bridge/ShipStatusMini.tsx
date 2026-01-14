import { useState } from "react";
import type { Contact } from "@/lib/bridge/bridgeTypes";
import type { Vehicle } from "@/types/database";
import type { AlertLevel } from "@/lib/bridge/bridgeTypes";
import { HullPointsModal } from "./HullPointsModal";

interface ShipStatusMiniProps {
  ship: Contact;
  linkedVehicle?: Vehicle | null;
  alertLevel: AlertLevel;
}

export function ShipStatusMini({ ship, linkedVehicle, alertLevel }: ShipStatusMiniProps) {
  const [jDriveStatus, setJDriveStatus] = useState<"CHARGING" | "ONLINE">("CHARGING");
  const [showHullModal, setShowHullModal] = useState(false);

  // Hull percentage: prefer linked vehicle data, fallback to contact data
  const hullMax = linkedVehicle?.hull ?? ship.hullMax ?? 0;
  const hullCurrent = linkedVehicle?.hull_current ?? ship.hullCurrent ?? hullMax;
  const hullPercent = hullMax > 0 ? Math.round((hullCurrent / hullMax) * 100) : 100;

  // Armor value from linked vehicle (displayed instead of shields)
  const armorValue = linkedVehicle?.armor ?? 0;

  // Weapons status based on alert level
  const isWeaponsArmed = alertLevel === "combat" || alertLevel === "emergency";
  const weaponsStatus = isWeaponsArmed ? "ARMED" : "OFFLINE";
  const weaponsColor = isWeaponsArmed ? "text-terminal-danger-alt" : "text-terminal-text-dimmer";

  // J-Drive toggle handler
  const toggleJDrive = () => {
    setJDriveStatus(prev => prev === "CHARGING" ? "ONLINE" : "CHARGING");
  };

  const statusColor = (value: number) => {
    if (value >= 75) return "text-terminal-primary-light";
    if (value >= 50) return "text-terminal-warning-alt";
    return "text-terminal-danger-alt";
  };

  return (
    <>
      <div className="status-panel bg-terminal-bg-panel-alt border border-terminal-bg-border rounded overflow-hidden">
        <div className="panel-header flex justify-between items-center px-4 py-2 bg-terminal-primary-light/5 border-b border-terminal-bg-border">
          <span className="font-['Orbitron'] text-xs tracking-[3px] text-terminal-text-dimmer">SHIP STATUS</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 text-xs">
          {/* Hull - Clickable to open modal */}
          <div
            className="flex justify-between cursor-pointer hover:bg-terminal-bg-border rounded px-1 -mx-1 transition-colors"
            onClick={() => setShowHullModal(true)}
            title="Click to adjust hull points"
          >
            <span className="text-terminal-text-dimmer">HULL</span>
            <span className={`font-['Orbitron'] font-bold ${statusColor(hullPercent)}`}>
              {hullPercent}%
            </span>
          </div>

          {/* Armor (was Shields) */}
          <div className="flex justify-between">
            <span className="text-terminal-text-dimmer">ARMOR</span>
            <span className="font-['Orbitron'] font-bold text-terminal-primary-light">{armorValue}</span>
          </div>

          {/* M-Drive */}
          <div className="flex justify-between">
            <span className="text-terminal-text-dimmer">M-DRIVE</span>
            <span className="font-['Orbitron'] font-bold text-terminal-primary-light">ONLINE</span>
          </div>

          {/* J-Drive - Clickable to toggle */}
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

          {/* Weapons - Toggles based on alert level */}
          <div className="flex justify-between">
            <span className="text-terminal-text-dimmer">WEAPONS</span>
            <span className={`font-['Orbitron'] font-bold ${weaponsColor}`}>
              {weaponsStatus}
            </span>
          </div>

          {/* Sensors */}
          <div className="flex justify-between">
            <span className="text-terminal-text-dimmer">SENSORS</span>
            <span className="font-['Orbitron'] font-bold text-terminal-primary-light">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Hull Points Modal */}
      {showHullModal && linkedVehicle && (
        <HullPointsModal
          vehicle={linkedVehicle}
          onClose={() => setShowHullModal(false)}
        />
      )}
    </>
  );
}
