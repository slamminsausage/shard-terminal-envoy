import { useState } from "react";
import type { NewContact } from "@/lib/bridge/bridgeTypes";

interface AddContactModalProps {
  onAdd: (contact: NewContact) => void;
  onClose: () => void;
}

export function AddContactModal({ onAdd, onClose }: AddContactModalProps) {
  const [name, setName] = useState("");
  const [shipClass, setShipClass] = useState("");
  const [status, setStatus] = useState<"friendly" | "unknown" | "enemy">("unknown");
  const [isPlayerShip, setIsPlayerShip] = useState(false);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({
      name,
      shipClass: shipClass || undefined,
      status,
      isPlayerShip,
      hexQ: 0,
      hexR: 0,
      facing: 0
    });
  };

  const shipClasses = [
    "Free Trader",
    "Far Trader",
    "Scout/Courier",
    "Corsair",
    "Patrol Cruiser",
    "Mercenary Cruiser",
    "System Defense Boat",
    "Subsidized Liner"
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1210] border border-[#00aa55] rounded-lg w-full max-w-md shadow-[0_0_40px_rgba(0,255,136,0.2)]">
        <div className="flex justify-between items-center px-4 py-3 bg-[#00ff8810] border-b border-[#1a2420]">
          <span className="font-['Orbitron'] text-sm tracking-[2px]">ADD CONTACT</span>
          <button
            onClick={onClose}
            className="text-[#446655] hover:text-[#ff4455] transition-colors text-lg"
            aria-label="Close"
          >
            x
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-[#446655] tracking-[1px] mb-2">DESIGNATION:</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ship name or contact ID..."
              className="w-full bg-[#0a0e0c] border border-[#1a2420] rounded px-3 py-2 text-[#00ff88] font-mono text-sm focus:outline-none focus:border-[#00aa55]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#446655] tracking-[1px] mb-2">SHIP CLASS:</label>
            <input
              type="text"
              value={shipClass}
              onChange={e => setShipClass(e.target.value)}
              placeholder="Optional..."
              className="w-full bg-[#0a0e0c] border border-[#1a2420] rounded px-3 py-2 text-[#00ff88] font-mono text-sm focus:outline-none focus:border-[#00aa55]"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {shipClasses.map(cls => (
                <button
                  key={cls}
                  onClick={() => setShipClass(cls)}
                  className="text-[0.65rem] px-2 py-1 bg-[#00ff8808] border border-[#1a2420] rounded text-[#446655] hover:text-[#00ff88] hover:border-[#00aa55] transition-all"
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#446655] tracking-[1px] mb-2">STATUS:</label>
            <div className="flex gap-2">
              {(["friendly", "unknown", "enemy"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 rounded text-xs font-mono transition-all border ${
                    status === s
                      ? s === "enemy"
                        ? "bg-[#ff445520] border-[#ff4455] text-[#ff4455]"
                        : s === "unknown"
                          ? "bg-[#00ccff20] border-[#00ccff] text-[#00ccff]"
                          : "bg-[#00ff8820] border-[#00ff88] text-[#00ff88]"
                      : "bg-[#00ff8808] border-[#1a2420] text-[#446655] hover:border-[#00aa55]"
                  }`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPlayerShip"
              checked={isPlayerShip}
              onChange={e => setIsPlayerShip(e.target.checked)}
              className="w-4 h-4 accent-[#00ff88]"
            />
            <label htmlFor="isPlayerShip" className="text-xs text-[#446655]">
              This is the player ship (centers tactical view)
            </label>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-[#1a2420]">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded text-xs font-mono transition-all border border-[#1a2420] text-[#446655] bg-[#00ff8808] hover:bg-[#00ff8815] hover:text-[#00ff88]"
          >
            CANCEL
          </button>
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded text-xs font-mono transition-all border border-[#00aa55] text-[#00ff88] bg-[#00ff8820] hover:bg-[#00ff8830] hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ADD CONTACT
          </button>
        </div>
      </div>
    </div>
  );
}
