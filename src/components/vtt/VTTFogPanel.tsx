import { useVTT } from "@/contexts/VTTContext";
import { Eye, EyeOff, Eraser } from "lucide-react";

export default function VTTFogPanel() {
  const { state, dispatch, activeMap } = useVTT();

  if (!activeMap) {
    return (
      <div className="flex items-center justify-center h-full text-terminal-primary/30 font-mono text-xs p-4 text-center">
        Select a map first
      </div>
    );
  }

  const fog = activeMap.fog;

  return (
    <div className="flex flex-col h-full p-3 space-y-4">
      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <label className="vtt-section-label">
          Fog of War
        </label>
        <button
          onClick={() =>
            dispatch({
              type: "UPDATE_FOG",
              payload: {
                mapId: activeMap.id,
                fog: { enabled: !fog.enabled },
              },
            })
          }
          className={`vtt-option ${fog.enabled ? "vtt-option--active" : ""}`}
        >
          {fog.enabled ? <Eye size={10} /> : <EyeOff size={10} />}
          {fog.enabled ? "On" : "Off"}
        </button>
      </div>

      {/* Tool selection */}
      <div>
        <label className="vtt-section-label block mb-1.5">
          Fog Brush
        </label>
        <div className="flex gap-1">
          {[
            { tool: "fog-circle", label: "Circle" },
            { tool: "fog-rect", label: "Rect" },
            { tool: "fog-polygon", label: "Polygon" },
          ].map(({ tool, label }) => (
            <button
              key={tool}
              onClick={() =>
                dispatch({ type: "SET_TOOL", payload: tool as any })
              }
              className={`vtt-option flex-1 ${state.activeTool === tool ? "vtt-option--active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Opacity */}
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <label className="vtt-section-label">
            Opacity
          </label>
          <span className="text-[10px] text-terminal-primary/40 font-mono">
            {Math.round(fog.opacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={fog.opacity}
          onChange={(e) =>
            dispatch({
              type: "UPDATE_FOG",
              payload: {
                mapId: activeMap.id,
                fog: { opacity: parseFloat(e.target.value) },
              },
            })
          }
          className="vtt-slider"
        />
      </div>

      {/* Fog color */}
      <div>
        <label className="vtt-section-label block mb-1">
          Fog Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={fog.color}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_FOG",
                payload: {
                  mapId: activeMap.id,
                  fog: { color: e.target.value },
                },
              })
            }
            className="w-8 h-6 rounded border border-terminal-border/30 bg-transparent cursor-pointer"
          />
          <span className="text-[10px] text-terminal-primary/40 font-mono">
            {fog.color}
          </span>
        </div>
      </div>

      {/* Brush Size */}
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <label className="vtt-section-label">
            Brush Size
          </label>
          <span className="text-[10px] text-terminal-primary/40 font-mono">
            {state.fogBrushSize}px
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={200}
          step={5}
          value={state.fogBrushSize}
          onChange={(e) =>
            dispatch({
              type: "SET_FOG_BRUSH_SIZE",
              payload: parseInt(e.target.value, 10),
            })
          }
          className="vtt-slider"
        />
      </div>

      {/* Brush Mode */}
      <div>
        <label className="vtt-section-label block mb-1.5">
          Brush Mode
        </label>
        <div className="flex gap-1">
          {[
            { mode: "reveal" as const, label: "Reveal" },
            { mode: "conceal" as const, label: "Conceal" },
          ].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() =>
                dispatch({ type: "SET_FOG_BRUSH_MODE", payload: mode })
              }
              className={`vtt-option flex-1 ${state.fogBrushMode === mode ? "vtt-option--active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="text-[10px] text-terminal-primary/30 font-mono leading-relaxed mt-auto">
        Select a fog brush tool, then click & drag on the map to paint fog.
        Use brush mode to reveal or conceal areas.
      </div>

      {/* Reset fog */}
      <button
        onClick={() =>
          dispatch({
            type: "UPDATE_FOG",
            payload: {
              mapId: activeMap.id,
              fog: { dataUrl: null },
            },
          })
        }
        className="vtt-btn danger justify-center w-full"
      >
        <Eraser size={10} /> Reset All Fog
      </button>
    </div>
  );
}
