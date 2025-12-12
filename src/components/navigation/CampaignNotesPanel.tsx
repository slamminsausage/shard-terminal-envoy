import { useJumpPlanner } from "@/contexts/JumpPlannerContext";
import { AccordionPanel } from "./AccordionPanel";
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

export function CampaignNotesPanel() {
  const {
    currentNote,
    currentLocation,
    isLoadingNote,
    isSavingNote,
    updateNote,
    saveNote,
  } = useJumpPlanner();

  if (!currentLocation) {
    return null;
  }

  return (
    <AccordionPanel
      title="CAMPAIGN NOTES"
      statusLabel={isSavingNote ? "SAVING..." : undefined}
      defaultExpanded={false}
    >
      {isLoadingNote ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : currentNote ? (
        <div className="space-y-3">
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

          {/* Planet Description */}
          <div>
            <label className="text-[#446655] text-xs block mb-1">
              PLANET DESCRIPTION:
            </label>
            <textarea
              value={currentNote.planet_description || ""}
              onChange={(e) => updateNote({ planet_description: e.target.value })}
              placeholder="General planet information visible to all..."
              className="terminal-input text-sm min-h-[80px] resize-y"
            />
          </div>

          {/* Custom Notes */}
          <div>
            <label className="text-[#446655] text-xs block mb-1">
              CAMPAIGN NOTES:
            </label>
            <textarea
              value={currentNote.custom_notes || ""}
              onChange={(e) => updateNote({ custom_notes: e.target.value })}
              placeholder="Session notes, events, player actions..."
              className="terminal-input text-sm min-h-[80px] resize-y"
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
        </div>
      ) : (
        <div className="text-center py-8 text-[#446655]">
          <p>Select a world to view or add notes</p>
        </div>
      )}
    </AccordionPanel>
  );
}
