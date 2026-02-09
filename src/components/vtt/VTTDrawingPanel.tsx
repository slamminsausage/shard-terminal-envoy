import { useVTT } from "@/contexts/VTTContext";
import { LAYER_MAP, LAYER_TOKEN, LAYER_GM } from "@/types/vtt";
import type { LayerIndex } from "@/types/vtt";
import { Trash2, Undo2, Redo2 } from "lucide-react";

const PRESET_COLORS = [
  "#00ff00", "#00ccff", "#ff6600", "#ff3344", "#ffcc00",
  "#aa44ff", "#ffffff", "#888888", "#44ff44", "#ff44aa",
];

const PRESET_WIDTHS = [1, 2, 3, 5, 8, 12];

const LAYER_LABELS: { layer: LayerIndex; label: string }[] = [
  { layer: LAYER_MAP, label: "Map" },
  { layer: LAYER_TOKEN, label: "Token" },
  { layer: LAYER_GM, label: "GM" },
];

export default function VTTDrawingPanel() {
  const { state, dispatch, activeMap } = useVTT();

  return (
    <div className="flex flex-col h-full p-3 space-y-4">
      {/* Layer Selection */}
      <div>
        <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-1">
          Active Layer
        </label>
        <div className="flex gap-1">
          {LAYER_LABELS.map(({ layer, label }) => (
            <button
              key={layer}
              onClick={() => dispatch({ type: "SET_LAYER", payload: layer })}
              className={`flex-1 text-xs font-mono py-1 rounded border transition-colors ${
                state.activeLayer === layer
                  ? "bg-terminal-primary/20 border-terminal-primary/50 text-terminal-primary"
                  : "border-terminal-border/30 text-terminal-primary/40 hover:text-terminal-primary/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Color Picker */}
      <div>
        <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-1">
          Color
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => dispatch({ type: "SET_DRAW_COLOR", payload: color })}
              className={`w-6 h-6 rounded border-2 transition-all ${
                state.drawColor === color
                  ? "border-terminal-primary scale-110"
                  : "border-transparent hover:border-terminal-primary/30"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="color"
            value={state.drawColor}
            onChange={(e) =>
              dispatch({ type: "SET_DRAW_COLOR", payload: e.target.value })
            }
            className="w-8 h-6 rounded border border-terminal-border/30 bg-transparent cursor-pointer"
          />
          <span className="text-[10px] text-terminal-primary/40 font-mono">
            {state.drawColor}
          </span>
        </div>
      </div>

      {/* Stroke Width */}
      <div>
        <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-1">
          Width: {state.drawWidth}px
        </label>
        <div className="flex gap-1.5">
          {PRESET_WIDTHS.map((w) => (
            <button
              key={w}
              onClick={() => dispatch({ type: "SET_DRAW_WIDTH", payload: w })}
              className={`flex items-center justify-center w-8 h-8 rounded border transition-colors ${
                state.drawWidth === w
                  ? "bg-terminal-primary/20 border-terminal-primary/50"
                  : "border-terminal-border/30 hover:border-terminal-border/50"
              }`}
              title={`${w}px`}
            >
              <div
                className="rounded-full bg-terminal-primary"
                style={{ width: Math.min(w * 2, 20), height: Math.min(w * 2, 20) }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div>
        <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-1">
          Actions
        </label>
        <div className="flex gap-1">
          <button
            onClick={() => dispatch({ type: "UNDO" })}
            disabled={state.historyIndex < 0}
            className="flex items-center gap-1 px-2 py-1 text-xs font-mono rounded border border-terminal-border/30 text-terminal-primary/50 hover:text-terminal-primary hover:bg-terminal-primary/10 disabled:opacity-30 transition-colors"
          >
            <Undo2 size={12} /> Undo
          </button>
          <button
            onClick={() => dispatch({ type: "REDO" })}
            disabled={state.historyIndex >= state.history.length - 1}
            className="flex items-center gap-1 px-2 py-1 text-xs font-mono rounded border border-terminal-border/30 text-terminal-primary/50 hover:text-terminal-primary hover:bg-terminal-primary/10 disabled:opacity-30 transition-colors"
          >
            <Redo2 size={12} /> Redo
          </button>
        </div>
        {activeMap && (
          <button
            onClick={() =>
              dispatch({
                type: "CLEAR_STROKES",
                payload: { mapId: activeMap.id, layer: state.activeLayer },
              })
            }
            className="flex items-center gap-1 mt-2 px-2 py-1 text-xs font-mono rounded border border-red-500/30 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full justify-center"
          >
            <Trash2 size={12} /> Clear Layer
          </button>
        )}
      </div>
    </div>
  );
}
