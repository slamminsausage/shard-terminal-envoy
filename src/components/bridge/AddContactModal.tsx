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
      <div className="bg-terminal-bg-panel-alt border border-terminal-primary-mid rounded-lg w-full max-w-md shadow-[0_0_40px_rgba(0,255,136,0.2)]">
        <div className="flex justify-between items-center px-4 py-3 bg-terminal-primary-light/10 border-b border-terminal-bg-border">
          <span className="font-['Orbitron'] text-sm tracking-[2px]">ADD CONTACT</span>
          <button
            onClick={onClose}
            className="text-terminal-text-dimmer hover:text-terminal-danger-alt transition-colors text-lg"
            aria-label="Close"
          >
            x
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-terminal-text-dimmer tracking-[1px] mb-2">DESIGNATION:</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ship name or contact ID..."
              className="w-full bg-terminal-bg-darker border border-terminal-bg-border rounded px-3 py-2 text-terminal-primary-light font-mono text-sm focus:outline-none focus:border-terminal-primary-mid"
            />
          </div>

          <div>
            <label className="block text-xs text-terminal-text-dimmer tracking-[1px] mb-2">SHIP CLASS:</label>
            <input
              type="text"
              value={shipClass}
              onChange={e => setShipClass(e.target.value)}
              placeholder="Optional..."
              className="w-full bg-terminal-bg-darker border border-terminal-bg-border rounded px-3 py-2 text-terminal-primary-light font-mono text-sm focus:outline-none focus:border-terminal-primary-mid"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {shipClasses.map(cls => (
                <button
                  key={cls}
                  onClick={() => setShipClass(cls)}
                  className="text-[0.65rem] px-2 py-1 bg-terminal-primary-light/5 border border-terminal-bg-border rounded text-terminal-text-dimmer hover:text-terminal-primary-light hover:border-terminal-primary-mid transition-all"
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-terminal-text-dimmer tracking-[1px] mb-2">STATUS:</label>
            <div className="flex gap-2">
              {(["friendly", "unknown", "enemy"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 rounded text-xs font-mono transition-all border ${
                    status === s
                      ? s === "enemy"
                        ? "bg-terminal-danger-alt/20 border-terminal-danger-alt text-terminal-danger-alt"
                        : s === "unknown"
                          ? "bg-terminal-secondary/20 border-terminal-secondary text-terminal-secondary"
                          : "bg-terminal-primary-light/20 border-terminal-primary-light text-terminal-primary-light"
                      : "bg-terminal-primary-light/5 border-terminal-bg-border text-terminal-text-dimmer hover:border-terminal-primary-mid"
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
              className="w-4 h-4 accent-terminal-primary-light"
            />
            <label htmlFor="isPlayerShip" className="text-xs text-terminal-text-dimmer">
              This is the player ship (centers tactical view)
            </label>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-terminal-bg-border">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded text-xs font-mono transition-all border border-terminal-bg-border text-terminal-text-dimmer bg-terminal-primary-light/5 hover:bg-terminal-primary-light/10 hover:text-terminal-primary-light"
          >
            CANCEL
          </button>
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded text-xs font-mono transition-all border border-terminal-primary-mid text-terminal-primary-light bg-terminal-primary-light/20 hover:bg-terminal-primary-light/30 hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ADD CONTACT
          </button>
        </div>
      </div>
    </div>
  );
}
