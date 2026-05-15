import React from "react";
import { useVTT } from "@/contexts/VTTContext";
import { LAYER_MAP, LAYER_TOKEN, LAYER_GM } from "@/types/vtt";
import type { LayerIndex, VTTTool } from "@/types/vtt";
import { Trash2, Undo2, Redo2, Pencil, Minus, Square, Circle, Type } from "lucide-react";

const PRESET_COLORS = [
  "#3ae2b3", "#00ccff", "#ff6600", "#ff3344", "#ffcc00",
  "#aa44ff", "#ffffff", "#888888", "#44ff44", "#ff44aa",
];

const PRESET_WIDTHS = [1, 2, 3, 5, 8, 12];

const DRAW_TOOLS: { tool: VTTTool; label: string; icon: React.ReactNode }[] = [
  { tool: "draw-freehand", label: "Free", icon: <Pencil size={12} /> },
  { tool: "draw-line",     label: "Line", icon: <Minus size={12} /> },
  { tool: "draw-rect",     label: "Rect", icon: <Square size={12} /> },
  { tool: "draw-circle",   label: "Circle", icon: <Circle size={12} /> },
  { tool: "draw-text",     label: "Text", icon: <Type size={12} /> },
];

const LAYER_LABELS: { layer: LayerIndex; label: string }[] = [
  { layer: LAYER_MAP, label: "Map" },
  { layer: LAYER_TOKEN, label: "Token" },
  { layer: LAYER_GM, label: "GM" },
];

export default function VTTDrawingPanel() {
  const { state, dispatch, activeMap } = useVTT();

  return (
    <div className="flex flex-col h-full p-3 space-y-4">
      {/* Draw Tool Selector */}
      <div>
        <label className="vtt-section-label block mb-1">Draw Tool</label>
        <div className="flex gap-1">
          {DRAW_TOOLS.map(({ tool, label, icon }) => (
            <button
              key={tool}
              onClick={() => dispatch({ type: "SET_TOOL", payload: tool })}
              className={`vtt-option flex-1 flex flex-col items-center gap-0.5 py-1.5 text-[9px] ${
                state.activeTool === tool ? "vtt-option--active" : ""
              }`}
              title={label}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Layer Selection */}
      <div>
        <label className="vtt-section-label block mb-1">
          Active Layer
        </label>
        <div className="flex gap-1">
          {LAYER_LABELS.map(({ layer, label }) => (
            <button
              key={layer}
              onClick={() => dispatch({ type: "SET_LAYER", payload: layer })}
              className={`vtt-option flex-1 ${
                state.activeLayer === layer
                  ? "vtt-option--active"
                  : ""
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Color Picker */}
      <div>
        <label className="vtt-section-label block mb-1">
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

      {/* Stroke Width / Font Size */}
      <div>
        <label className="vtt-section-label block mb-1">
          {state.activeTool === "draw-text"
            ? `Font Size: ~${state.drawWidth * 6 + 10}px`
            : `Width: ${state.drawWidth}px`}
        </label>
        <div className="flex gap-1.5">
          {PRESET_WIDTHS.map((w) => (
            <button
              key={w}
              onClick={() => dispatch({ type: "SET_DRAW_WIDTH", payload: w })}
              className={`vtt-option flex items-center justify-center w-8 h-8 ${
                state.drawWidth === w
                  ? "vtt-option--active"
                  : ""
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
        <label className="vtt-section-label block mb-1">
          Actions
        </label>
        <div className="flex gap-1">
          <button
            onClick={() => dispatch({ type: "UNDO" })}
            disabled={state.historyIndex < 0}
            className="vtt-btn"
          >
            <Undo2 size={12} /> Undo
          </button>
          <button
            onClick={() => dispatch({ type: "REDO" })}
            disabled={state.historyIndex >= state.history.length - 1}
            className="vtt-btn"
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
            className="vtt-btn danger mt-2 w-full justify-center"
          >
            <Trash2 size={12} /> Clear Layer
          </button>
        )}
      </div>
    </div>
  );
}
