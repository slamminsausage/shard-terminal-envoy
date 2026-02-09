import { useVTT } from "@/contexts/VTTContext";
import { toast } from "sonner";

export default function VTTSettingsPanel() {
  const { state, dispatch, activeMap, saveSession, exportSession, loadSession } = useVTT();

  const grid = activeMap?.grid;

  const handleExport = () => {
    const json = exportSession();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vtt-session-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Session exported");
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        loadSession(ev.target?.result as string);
        toast.success("Session imported");
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 space-y-4">
      <h4 className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono">
        Display
      </h4>

      <ToggleRow
        label="Grid Overlay"
        checked={state.showGrid}
        onChange={() => dispatch({ type: "TOGGLE_GRID" })}
      />
      <ToggleRow
        label="Token Names"
        checked={state.showTokenNames}
        onChange={() => dispatch({ type: "TOGGLE_TOKEN_NAMES" })}
      />
      <ToggleRow
        label="Walls (GM)"
        checked={state.showWalls}
        onChange={() => dispatch({ type: "TOGGLE_WALLS" })}
      />
      <ToggleRow
        label="Lights (GM)"
        checked={state.showLights}
        onChange={() => dispatch({ type: "TOGGLE_LIGHTS" })}
      />
      <ToggleRow
        label="Fog of War"
        checked={state.showFog}
        onChange={() => dispatch({ type: "TOGGLE_FOG" })}
      />

      {/* Grid settings */}
      {activeMap && grid && (
        <>
          <div className="border-t border-terminal-border/20 pt-3">
            <h4 className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono mb-2">
              Grid Config
            </h4>

            <ToggleRow
              label="Grid Enabled"
              checked={grid.enabled}
              onChange={() =>
                dispatch({
                  type: "UPDATE_MAP",
                  payload: {
                    id: activeMap.id,
                    updates: {
                      grid: { ...grid, enabled: !grid.enabled },
                    },
                  },
                })
              }
            />

            <div className="mt-2">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[10px] text-terminal-primary/50 font-mono">
                  Cell Size
                </label>
                <span className="text-[10px] text-terminal-primary/40 font-mono">
                  {grid.size}px
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={200}
                step={5}
                value={grid.size}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_MAP",
                    payload: {
                      id: activeMap.id,
                      updates: {
                        grid: { ...grid, size: parseInt(e.target.value) },
                      },
                    },
                  })
                }
                className="w-full accent-green-500 h-1"
              />
            </div>

            <div className="mt-2">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[10px] text-terminal-primary/50 font-mono">
                  Grid Opacity
                </label>
                <span className="text-[10px] text-terminal-primary/40 font-mono">
                  {Math.round(grid.opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={grid.opacity}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_MAP",
                    payload: {
                      id: activeMap.id,
                      updates: {
                        grid: {
                          ...grid,
                          opacity: parseFloat(e.target.value),
                        },
                      },
                    },
                  })
                }
                className="w-full accent-green-500 h-1"
              />
            </div>

            <div className="mt-2">
              <label className="text-[10px] text-terminal-primary/50 font-mono block mb-1">
                Grid Style
              </label>
              <div className="flex gap-1">
                {(["square", "hex"] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() =>
                      dispatch({
                        type: "UPDATE_MAP",
                        payload: {
                          id: activeMap.id,
                          updates: {
                            grid: { ...grid, style },
                          },
                        },
                      })
                    }
                    className={`flex-1 text-xs font-mono py-1 rounded border transition-colors capitalize ${
                      grid.style === style
                        ? "bg-terminal-primary/20 border-terminal-primary/50 text-terminal-primary"
                        : "border-terminal-border/30 text-terminal-primary/40 hover:text-terminal-primary/60"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <ToggleRow
              label="Snap to Grid"
              checked={grid.snap}
              onChange={() =>
                dispatch({
                  type: "UPDATE_MAP",
                  payload: {
                    id: activeMap.id,
                    updates: {
                      grid: { ...grid, snap: !grid.snap },
                    },
                  },
                })
              }
            />

            <div className="mt-2">
              <label className="text-[10px] text-terminal-primary/50 font-mono block mb-1">
                Grid Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={grid.color}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_MAP",
                      payload: {
                        id: activeMap.id,
                        updates: {
                          grid: { ...grid, color: e.target.value },
                        },
                      },
                    })
                  }
                  className="w-8 h-6 rounded border border-terminal-border/30 bg-transparent cursor-pointer"
                />
                <span className="text-[10px] text-terminal-primary/40 font-mono">
                  {grid.color}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Session */}
      <div className="border-t border-terminal-border/20 pt-3">
        <h4 className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono mb-2">
          Session
        </h4>
        <div className="space-y-1.5">
          <button
            onClick={() => {
              saveSession();
              toast.success("Session saved to local storage");
            }}
            className="w-full px-2 py-1.5 text-xs font-mono rounded border border-terminal-primary/30 text-terminal-primary/60 hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
          >
            Save Now
          </button>
          <button
            onClick={handleExport}
            className="w-full px-2 py-1.5 text-xs font-mono rounded border border-terminal-border/30 text-terminal-primary/50 hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
          >
            Export to File
          </button>
          <button
            onClick={handleImport}
            className="w-full px-2 py-1.5 text-xs font-mono rounded border border-terminal-border/30 text-terminal-primary/50 hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
          >
            Import from File
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="border-t border-terminal-border/20 pt-3">
        <h4 className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono mb-1">
          Stats
        </h4>
        <div className="text-[10px] text-terminal-primary/30 font-mono space-y-0.5">
          <div>Maps: {state.maps.length}</div>
          <div>
            Tokens:{" "}
            {state.maps.reduce((sum, m) => sum + m.tokens.length, 0)}
          </div>
          <div>
            Strokes:{" "}
            {state.maps.reduce((sum, m) => sum + m.strokes.length, 0)}
          </div>
          <div>Initiative entries: {state.initiative.length}</div>
          <div>Clocks: {state.clocks.length}</div>
          <div>Handouts: {state.handouts.length}</div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center justify-between py-0.5 cursor-pointer">
      <span className="text-xs text-terminal-primary/60 font-mono">
        {label}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="accent-green-500"
      />
    </label>
  );
}
