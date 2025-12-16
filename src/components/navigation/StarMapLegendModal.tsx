import { X } from "lucide-react";

interface StarMapLegendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StarMapLegendModal({ isOpen, onClose }: StarMapLegendModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="terminal-modal max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-[#1a2420]">
          <h2 className="text-xl font-bold text-primary uppercase tracking-wider">
            Map Legend
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1a2420] text-[#00ccff] hover:text-primary transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* World Characteristics */}
        <div className="mb-6 pb-6 border-b border-[#1a2420]">
          <h3 className="text-sm font-bold text-primary uppercase mb-3 tracking-wider">
            World Characteristics
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#00ccff] text-lg">●</span>
              <span className="text-white">Water Present</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">●</span>
              <span className="text-white">No Water Present</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">∷</span>
              <span className="text-white">Asteroid Belt</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">∗</span>
              <span className="text-white">Unknown</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#ff3344] text-lg">⌖</span>
              <span className="text-white">Anomaly</span>
            </div>
          </div>
        </div>

        {/* Bases */}
        <div className="mb-6 pb-6 border-b border-[#1a2420]">
          <h3 className="text-sm font-bold text-primary uppercase mb-3 tracking-wider">
            Bases
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">★</span>
              <span className="text-white">Imperial Naval Base</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">▲</span>
              <span className="text-white">Imperial Scout Base</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">▲</span>
              <span className="text-white">Imperial Scout Way Station</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">■</span>
              <span className="text-white">Imperial Naval Depot</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">♦</span>
              <span className="text-white">Zhodani Base</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#ff3344] text-lg">♦</span>
              <span className="text-white">Zhodani Relay Station</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#ff3344] text-lg">★</span>
              <span className="text-white">Other Naval / Tlauku Base</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#ff3344] text-lg">■</span>
              <span className="text-white">Other Naval Outpost / Depot</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">∗∗</span>
              <span className="text-white">Corsair / Clan / Embassy</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">✦</span>
              <span className="text-white">Military Base / Garrison</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">•</span>
              <span className="text-white">Independent Base</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">Γ</span>
              <span className="text-white">Research Station</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">R</span>
              <span className="text-white">Imperial Reserve</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">P</span>
              <span className="text-white">Penal Colony</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">X</span>
              <span className="text-white">Prison, Exile Camp</span>
            </div>
          </div>
        </div>

        {/* Travel Zones */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-primary uppercase mb-3 tracking-wider">
            Travel Zones
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="inline-block w-6 h-0.5 bg-[#ffa500]"></span>
                <span className="text-[#ffa500]">▬</span>
              </div>
              <span className="text-white">Amber Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="inline-block w-6 h-0.5 bg-[#ff3344]"></span>
                <span className="text-[#ff3344]">▬</span>
              </div>
              <span className="text-white">Red Zone</span>
            </div>
          </div>
        </div>

        {/* Footer - optional close button */}
        <div className="mt-6 pt-4 border-t border-[#1a2420] flex justify-end">
          <button
            onClick={onClose}
            className="terminal-btn secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
