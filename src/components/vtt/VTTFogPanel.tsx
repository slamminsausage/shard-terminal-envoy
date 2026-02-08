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
        <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono">
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
          className={`flex items-center gap-1 px-2 py-1 text-[10px] font-mono rounded border transition-colors ${
            fog.enabled
              ? "bg-terminal-primary/20 border-terminal-primary/50 text-terminal-primary"
              : "border-terminal-border/30 text-terminal-primary/40"
          }`}
        >
          {fog.enabled ? <Eye size={10} /> : <EyeOff size={10} />}
          {fog.enabled ? "On" : "Off"}
        </button>
      </div>

      {/* Tool selection */}
      <div>
        <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-1.5">
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
              className={`flex-1 text-xs font-mono py-1.5 rounded border transition-colors ${
                state.activeTool === tool
                  ? "bg-terminal-primary/20 border-terminal-primary/50 text-terminal-primary"
                  : "border-terminal-border/30 text-terminal-primary/40 hover:text-terminal-primary/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Opacity */}
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono">
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
          className="w-full accent-green-500 h-1"
        />
      </div>

      {/* Fog color */}
      <div>
        <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-1">
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

      {/* Info */}
      <div className="text-[10px] text-terminal-primary/30 font-mono leading-relaxed mt-auto">
        Select a fog brush tool, then click & drag on the map to reveal or
        conceal areas. Left-click reveals; right-click conceals.
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
        className="flex items-center gap-1 justify-center px-2 py-1.5 text-[10px] font-mono rounded border border-red-500/30 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <Eraser size={10} /> Reset All Fog
      </button>
    </div>
  );
}
