import { useJumpPlanner } from "@/contexts/JumpPlannerContext";
import { parseUWP, getStarportDescription, getZoneDescription } from "@/lib/travellerMapApi";
import { AccordionPanel } from "./AccordionPanel";

export function WorldInfoPanel() {
  const { selectedWorld } = useJumpPlanner();

  const uwp = selectedWorld ? parseUWP(selectedWorld.uwp) : null;

  return (
    <AccordionPanel
      title="WORLD INFORMATION"
      statusLabel={selectedWorld?.hex || "????"}
      defaultExpanded={true}
    >
      <div className="space-y-3">
        {selectedWorld ? (
          <>
            {/* World Name & Basic Info */}
            <div className="text-center border-b border-terminal-bg-border pb-3">
              <h3 className="text-xl font-['Orbitron'] font-bold text-primary drop-shadow-[0_0_10px_rgba(0,255,0,0.4)]">
                {selectedWorld.name}
              </h3>
              <div className="text-terminal-secondary font-mono text-sm mt-1">
                {selectedWorld.uwp}
              </div>
              <div className="text-terminal-text-dimmer text-xs mt-1">
                {selectedWorld.sector}
              </div>
            </div>

            {/* UWP Breakdown */}
            {uwp && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-black/30 border border-terminal-bg-border">
                  <div className="text-terminal-text-dimmer">STARPORT</div>
                  <div className="text-primary font-bold">{uwp.starport}</div>
                  <div className="text-terminal-text-dimmer text-[10px] mt-1">
                    {getStarportDescription(uwp.starport).split('.')[0]}
                  </div>
                </div>
                <div className="p-2 bg-black/30 border border-terminal-bg-border">
                  <div className="text-terminal-text-dimmer">TECH LEVEL</div>
                  <div className="text-terminal-secondary font-bold">TL{uwp.techLevel}</div>
                </div>
                <div className="p-2 bg-black/30 border border-terminal-bg-border">
                  <div className="text-terminal-text-dimmer">POPULATION</div>
                  <div className="text-primary font-bold">
                    10^{uwp.population}
                  </div>
                </div>
                <div className="p-2 bg-black/30 border border-terminal-bg-border">
                  <div className="text-terminal-text-dimmer">LAW LEVEL</div>
                  <div className="text-terminal-warning-alt font-bold">{uwp.lawLevel}</div>
                </div>
              </div>
            )}

            {/* Zone Info */}
            {selectedWorld.zone && (
              <div
                className={`p-2 border text-sm ${
                  selectedWorld.zone === "A" || selectedWorld.zone === "R"
                    ? "border-terminal-warning-alt text-terminal-warning-alt"
                    : selectedWorld.zone === "F" || selectedWorld.zone === "X"
                      ? "border-terminal-danger-alt text-terminal-danger-alt"
                      : "border-primary text-primary"
                }`}
              >
                {getZoneDescription(selectedWorld.zone)}
              </div>
            )}

            {/* Allegiance */}
            {selectedWorld.allegiance && (
              <div className="text-xs">
                <span className="text-terminal-text-dimmer">ALLEGIANCE: </span>
                <span className="text-terminal-secondary">{selectedWorld.allegiance}</span>
              </div>
            )}

            {/* Remarks */}
            {selectedWorld.remarks && (
              <div className="text-xs">
                <span className="text-terminal-text-dimmer">REMARKS: </span>
                <span className="text-[#888888]">{selectedWorld.remarks}</span>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Placeholder when no world selected */}
            <div className="text-center border-b border-terminal-bg-border pb-3">
              <h3 className="text-xl font-['Orbitron'] font-bold text-terminal-text-dimmer drop-shadow-[0_0_10px_rgba(0,255,0,0.2)]">
                ????????
              </h3>
              <div className="text-terminal-text-dimmer font-mono text-sm mt-1">
                ???????-?
              </div>
              <div className="text-terminal-text-dimmer text-xs mt-1">
                ???? ????
              </div>
            </div>

            {/* UWP Breakdown Placeholder */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-black/30 border border-terminal-bg-border">
                <div className="text-terminal-text-dimmer">STARPORT</div>
                <div className="text-terminal-text-dimmer font-bold">?</div>
                <div className="text-terminal-text-dimmer text-[10px] mt-1">
                  Unknown
                </div>
              </div>
              <div className="p-2 bg-black/30 border border-terminal-bg-border">
                <div className="text-terminal-text-dimmer">TECH LEVEL</div>
                <div className="text-terminal-text-dimmer font-bold">TL?</div>
              </div>
              <div className="p-2 bg-black/30 border border-terminal-bg-border">
                <div className="text-terminal-text-dimmer">POPULATION</div>
                <div className="text-terminal-text-dimmer font-bold">
                  10^?
                </div>
              </div>
              <div className="p-2 bg-black/30 border border-terminal-bg-border">
                <div className="text-terminal-text-dimmer">LAW LEVEL</div>
                <div className="text-terminal-text-dimmer font-bold">?</div>
              </div>
            </div>

            {/* Empty state message */}
            <div className="text-center py-4 text-terminal-text-dimmer text-sm">
              Click on a hex to view world information
            </div>
          </>
        )}
      </div>
    </AccordionPanel>
  );
}
