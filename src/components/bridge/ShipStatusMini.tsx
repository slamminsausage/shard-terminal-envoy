import type { Contact } from "@/lib/bridge/bridgeTypes";

interface ShipStatusMiniProps {
  ship: Contact;
}

export function ShipStatusMini({ ship }: ShipStatusMiniProps) {
  const hullMax = ship.hullMax ?? 0;
  const hullCurrent = ship.hullCurrent ?? 0;
  const hullPercent = hullMax > 0 ? Math.round((hullCurrent / hullMax) * 100) : 100;

  const statusColor = (value: number) => {
    if (value >= 75) return "text-[#00ff88]";
    if (value >= 50) return "text-[#ffaa00]";
    return "text-[#ff4455]";
  };

  return (
    <div className="status-panel bg-[#0d1210] border border-[#1a2420] rounded overflow-hidden">
      <div className="panel-header flex justify-between items-center px-4 py-2 bg-[#00ff8808] border-b border-[#1a2420]">
        <span className="font-['Orbitron'] text-xs tracking-[3px] text-[#446655]">SHIP STATUS</span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 text-xs">
        <div className="flex justify-between">
          <span className="text-[#446655]">HULL</span>
          <span className={`font-['Orbitron'] font-bold ${statusColor(hullPercent)}`}>
            {hullPercent}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#446655]">SHIELDS</span>
          <span className="font-['Orbitron'] font-bold text-[#00ff88]">100%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#446655]">M-DRIVE</span>
          <span className="font-['Orbitron'] font-bold text-[#00ff88]">ONLINE</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#446655]">J-DRIVE</span>
          <span className="font-['Orbitron'] font-bold text-[#ffaa00]">CHARGING</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#446655]">WEAPONS</span>
          <span className="font-['Orbitron'] font-bold text-[#ff4455]">ARMED</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#446655]">SENSORS</span>
          <span className="font-['Orbitron'] font-bold text-[#00ff88]">ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
