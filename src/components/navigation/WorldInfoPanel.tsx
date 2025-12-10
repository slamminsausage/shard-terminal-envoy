import { useJumpPlanner } from "@/contexts/JumpPlannerContext";
import { parseUWP, getStarportDescription, getZoneDescription } from "@/lib/travellerMapApi";
import type { WorldStatus } from "@/types/navigation";
import { Loader2 } from "lucide-react";

const STATUS_OPTIONS: { value: WorldStatus; label: string; color: string }[] = [
  { value: "UNKNOWN", label: "Unknown", color: "#446655" },
  { value: "SAFE_HAVEN", label: "Safe Haven", color: "#00ff88" },
  { value: "ALLIED", label: "Allied", color: "#00ccff" },
  { value: "NEUTRAL", label: "Neutral", color: "#888888" },
  { value: "UNFRIENDLY", label: "Unfriendly", color: "#ffaa00" },
  { value: "RESTRICTED", label: "Restricted", color: "#ff6600" },
  { value: "PIRATE_BASE", label: "Pirate Base", color: "#ff4455" },
  { value: "CONTESTED", label: "Contested", color: "#ff00ff" },
];

export function WorldInfoPanel() {
  const {
    selectedWorld,
    currentNote,
    isLoadingNote,
    isSavingNote,
    updateNote,
    saveNote,
  } = useJumpPlanner();

  const uwp = selectedWorld ? parseUWP(selectedWorld.uwp) : null;

  return (
    <div className="world-info-panel flex flex-col gap-3 min-w-0">
      {/* World Data */}
      {selectedWorld && (
        <div className="panel overflow-hidden">
          <div className="panel-header">
            <span className="panel-title">WORLD DATA</span>
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
      )}

      {/* World Notes Editor */}
      <div className="panel flex-1">
        <div className="panel-header">
          <span className="panel-title">CAMPAIGN NOTES</span>
          {isSavingNote && (
            <span className="panel-status flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              SAVING...
            </span>
          )}
        </div>
        <div className="panel-content space-y-3">
          {isLoadingNote ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : currentNote ? (
            <>
              {/* World Status */}
              <div>
                <label className="text-[#446655] text-xs block mb-1">
                  STATUS:
                </label>
                <select
                  value={currentNote.status || "UNKNOWN"}
                  onChange={(e) =>
                    updateNote({ status: e.target.value as WorldStatus })
                  }
                  className="terminal-input text-sm"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="text-[#446655] text-xs block mb-1">
                  TAGS (comma separated):
                </label>
                <input
                  type="text"
                  value={currentNote.tags || ""}
                  onChange={(e) => updateNote({ tags: e.target.value })}
                  placeholder="fuel, repairs, patron, danger"
                  className="terminal-input text-sm"
                />
              </div>

              {/* Summary */}
              <div>
                <label className="text-[#446655] text-xs block mb-1">
                  SUMMARY (player-visible):
                </label>
                <textarea
                  value={currentNote.summary || ""}
                  onChange={(e) => updateNote({ summary: e.target.value })}
                  placeholder="Brief description for players..."
                  className="terminal-input text-sm min-h-[60px] resize-y"
                />
              </div>

              {/* Patrons */}
              <div>
                <label className="text-[#446655] text-xs block mb-1">
                  PATRONS / CONTACTS:
                </label>
                <textarea
                  value={currentNote.patrons || ""}
                  onChange={(e) => updateNote({ patrons: e.target.value })}
                  placeholder="Known contacts and patrons..."
                  className="terminal-input text-sm min-h-[60px] resize-y"
                />
              </div>

              {/* GM Notes */}
              <div>
                <label className="text-[#446655] text-xs block mb-1">
                  GM NOTES (hidden):
                </label>
                <textarea
                  value={currentNote.gm_notes || ""}
                  onChange={(e) => updateNote({ gm_notes: e.target.value })}
                  placeholder="Secret GM information..."
                  className="terminal-input text-sm min-h-[80px] resize-y border-[#ffaa00]/30"
                />
              </div>

              {/* GM Only Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentNote.gm_only || false}
                  onChange={(e) => updateNote({ gm_only: e.target.checked })}
                  className="accent-[#ffaa00]"
                />
                <span className="text-[#ffaa00] text-xs">
                  Entire note is GM-only
                </span>
              </label>

              {/* Last Visited */}
              {currentNote.last_visited && (
                <div className="text-xs text-[#446655]">
                  Last visited:{" "}
                  {new Date(currentNote.last_visited).toLocaleDateString()}
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={saveNote}
                disabled={isSavingNote}
                className="terminal-btn w-full"
              >
                {isSavingNote ? "SAVING..." : "SAVE NOTES"}
              </button>
            </>
          ) : (
            <div className="text-center py-8 text-[#446655]">
              <p>Select a world to view or add notes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
