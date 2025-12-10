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
  const weaponsColor = isWeaponsArmed ? "text-[#ff4455]" : "text-[#446655]";

  // J-Drive toggle handler
  const toggleJDrive = () => {
    setJDriveStatus(prev => prev === "CHARGING" ? "ONLINE" : "CHARGING");
  };

  const statusColor = (value: number) => {
    if (value >= 75) return "text-[#00ff88]";
    if (value >= 50) return "text-[#ffaa00]";
    return "text-[#ff4455]";
  };

  return (
    <>
      <div className="status-panel bg-[#0d1210] border border-[#1a2420] rounded overflow-hidden">
        <div className="panel-header flex justify-between items-center px-4 py-2 bg-[#00ff8808] border-b border-[#1a2420]">
          <span className="font-['Orbitron'] text-xs tracking-[3px] text-[#446655]">SHIP STATUS</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 text-xs">
          {/* Hull - Clickable to open modal */}
          <div
            className="flex justify-between cursor-pointer hover:bg-[#1a2420] rounded px-1 -mx-1 transition-colors"
            onClick={() => setShowHullModal(true)}
            title="Click to adjust hull points"
          >
            <span className="text-[#446655]">HULL</span>
            <span className={`font-['Orbitron'] font-bold ${statusColor(hullPercent)}`}>
              {hullPercent}%
            </span>
          </div>

          {/* Armor (was Shields) */}
          <div className="flex justify-between">
            <span className="text-[#446655]">ARMOR</span>
            <span className="font-['Orbitron'] font-bold text-[#00ff88]">{armorValue}</span>
          </div>

          {/* M-Drive */}
          <div className="flex justify-between">
            <span className="text-[#446655]">M-DRIVE</span>
            <span className="font-['Orbitron'] font-bold text-[#00ff88]">ONLINE</span>
          </div>

          {/* J-Drive - Clickable to toggle */}
          <div
            className="flex justify-between cursor-pointer hover:bg-[#1a2420] rounded px-1 -mx-1 transition-colors"
            onClick={toggleJDrive}
            title="Click to toggle J-Drive status"
          >
            <span className="text-[#446655]">J-DRIVE</span>
            <span className={`font-['Orbitron'] font-bold ${jDriveStatus === "ONLINE" ? "text-[#00ff88]" : "text-[#ffaa00]"}`}>
              {jDriveStatus}
            </span>
          </div>

          {/* Weapons - Toggles based on alert level */}
          <div className="flex justify-between">
            <span className="text-[#446655]">WEAPONS</span>
            <span className={`font-['Orbitron'] font-bold ${weaponsColor}`}>
              {weaponsStatus}
            </span>
          </div>

          {/* Sensors */}
          <div className="flex justify-between">
            <span className="text-[#446655]">SENSORS</span>
            <span className="font-['Orbitron'] font-bold text-[#00ff88]">ACTIVE</span>
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
