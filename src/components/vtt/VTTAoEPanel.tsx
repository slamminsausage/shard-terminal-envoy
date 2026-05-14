import { useVTT } from "@/contexts/VTTContext";
import { Target, Trash2, X } from "lucide-react";

export default function VTTAoEPanel() {
  const { state, dispatch, activeMap } = useVTT();
  const templates = activeMap?.aoeTemplates || [];

  return (
    <div className="flex flex-col h-full p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="vtt-section-label">
          AoE Templates
        </span>
        {templates.length > 0 && (
          <button
            onClick={() => dispatch({ type: "CLEAR_AOE" })}
            className="vtt-btn danger"
          >
            <X size={10} /> Clear All
          </button>
        )}
      </div>

      {/* Tool shortcuts */}
      <div>
        <label className="vtt-section-label block mb-1.5">
          Place AoE
        </label>
        <div className="grid grid-cols-3 gap-1">
          {[
            { tool: "aoe-cone" as const, label: "Cone", color: "text-red-400 border-red-500/30" },
            { tool: "aoe-circle" as const, label: "Circle", color: "text-yellow-400 border-yellow-500/30" },
            { tool: "aoe-line" as const, label: "Line", color: "text-blue-400 border-blue-500/30" },
          ].map(({ tool, label, color }) => (
            <button
              key={tool}
              onClick={() => dispatch({ type: "SET_TOOL", payload: tool })}
              className={`vtt-option justify-center py-1.5 ${
                state.activeTool === tool
                  ? `vtt-option--active ${color}`
                  : ""
              }`}
            >
              <Target size={10} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Active templates list */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {templates.length === 0 ? (
          <div className="vtt-empty py-6">
            No active AoE templates.
            <br />
            <span className="text-[10px]">
              Select a tool above, then drag on the map.
            </span>
          </div>
        ) : (
          templates.map((aoe) => (
            <div
              key={aoe.id}
              className="vtt-list-item group"
            >
              <div
                className="w-4 h-4 rounded-sm flex-shrink-0"
                style={{ backgroundColor: aoe.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-terminal-primary/60 text-xs font-mono capitalize">
                  {aoe.shape}
                </div>
                <div className="text-[10px] text-terminal-primary/30 font-mono">
                  {activeMap?.grid?.size
                    ? `${Math.round(aoe.radius / activeMap.grid.size)} sq`
                    : `r=${Math.round(aoe.radius)}px`}
                </div>
              </div>
              <button
                onClick={() =>
                  dispatch({ type: "REMOVE_AOE", payload: aoe.id })
                }
                className="p-1 text-terminal-primary/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="text-[10px] text-terminal-primary/30 font-mono leading-relaxed">
        Click and drag on the canvas to place AoE templates. Drag direction
        determines size and orientation.
      </div>
    </div>
  );
}
