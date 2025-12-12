import { useJumpPlanner } from "@/contexts/JumpPlannerContext";
import { parseUWP, getStarportDescription, getZoneDescription } from "@/lib/travellerMapApi";

export function WorldInfoPanel() {
  const { selectedWorld } = useJumpPlanner();

  const uwp = selectedWorld ? parseUWP(selectedWorld.uwp) : null;

  // Only show when there's an actual world at this hex
  if (!selectedWorld) {
    return null;
  }

  return (
    <div className="panel overflow-hidden">
      <div className="panel-header">
        <span className="panel-title">WORLD INFORMATION</span>
        <span className="panel-status">{selectedWorld.hex}</span>
      </div>
      <div className="panel-content space-y-3 max-h-[70vh] overflow-y-auto pr-2">
        {/* World Name & Basic Info */}
        <div className="text-center border-b border-[#1a2420] pb-3">
          <h3 className="text-xl font-['Orbitron'] font-bold text-primary drop-shadow-[0_0_10px_rgba(0,255,0,0.4)]">
            {selectedWorld.name}
          </h3>
          <div className="text-[#00ccff] font-mono text-sm mt-1">
            {selectedWorld.uwp}
          </div>
          <div className="text-[#446655] text-xs mt-1">
            {selectedWorld.sector}
          </div>
        </div>

        {/* UWP Breakdown */}
        {uwp && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-black/30 border border-[#1a2420]">
              <div className="text-[#446655]">STARPORT</div>
              <div className="text-primary font-bold">{uwp.starport}</div>
              <div className="text-[#446655] text-[10px] mt-1">
                {getStarportDescription(uwp.starport).split('.')[0]}
              </div>
            </div>
            <div className="p-2 bg-black/30 border border-[#1a2420]">
              <div className="text-[#446655]">TECH LEVEL</div>
              <div className="text-[#00ccff] font-bold">TL{uwp.techLevel}</div>
            </div>
            <div className="p-2 bg-black/30 border border-[#1a2420]">
              <div className="text-[#446655]">POPULATION</div>
              <div className="text-primary font-bold">
                10^{uwp.population}
              </div>
            </div>
            <div className="p-2 bg-black/30 border border-[#1a2420]">
              <div className="text-[#446655]">LAW LEVEL</div>
              <div className="text-[#ffaa00] font-bold">{uwp.lawLevel}</div>
            </div>
          </div>
        )}

        {/* Zone Info */}
        {selectedWorld.zone && (
          <div
            className={`p-2 border text-sm ${
              selectedWorld.zone === "A" || selectedWorld.zone === "R"
                ? "border-[#ffaa00] text-[#ffaa00]"
                : selectedWorld.zone === "F" || selectedWorld.zone === "X"
                  ? "border-[#ff4455] text-[#ff4455]"
                  : "border-primary text-primary"
            }`}
          >
            {getZoneDescription(selectedWorld.zone)}
          </div>
        )}

        {/* Allegiance */}
        {selectedWorld.allegiance && (
          <div className="text-xs">
            <span className="text-[#446655]">ALLEGIANCE: </span>
            <span className="text-[#00ccff]">{selectedWorld.allegiance}</span>
          </div>
        )}

        {/* Remarks */}
        {selectedWorld.remarks && (
          <div className="text-xs">
            <span className="text-[#446655]">REMARKS: </span>
            <span className="text-[#888888]">{selectedWorld.remarks}</span>
          </div>
        )}
      </div>
    </div>
  );
}
