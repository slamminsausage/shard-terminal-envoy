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
      <h4 className="vtt-section-label">
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
            <h4 className="vtt-section-label mb-2">
              Grid Config
            </h4>

            <ToggleRow
              label="Grid for this map"
              checked={grid.enabled}
              onChange={() =>
                dispatch({
                  type: "UPDATE_MAP",
                  payload: {
                    id: activeMap.id,
                    updates: { grid: { ...grid, enabled: !grid.enabled } },
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
                        grid: { ...grid, size: parseInt(e.target.value, 10) },
                      },
                    },
                  })
                }
                className="vtt-slider"
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
                className="vtt-slider"
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
                    className={`flex-1 vtt-option capitalize ${
                      grid.style === style ? "vtt-option--active" : ""
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

      {/* Canvas & Image Scaling */}
      {activeMap && (
        <div className="border-t border-terminal-border/20 pt-3">
          <h4 className="vtt-section-label mb-2">
            Canvas Size
          </h4>

          <div className="flex gap-2 mb-2">
            <div className="flex-1">
              <label className="text-[10px] text-terminal-primary/40 font-mono block mb-0.5">Width</label>
              <input
                type="number"
                min={100}
                max={10000}
                step={100}
                value={activeMap.width}
                onChange={(e) => {
                  const w = Math.max(100, parseInt(e.target.value, 10) || 1920);
                  dispatch({
                    type: "SET_CANVAS_SIZE",
                    payload: { mapId: activeMap.id, width: w, height: activeMap.height },
                  });
                }}
                className="vtt-input w-full text-center"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-terminal-primary/40 font-mono block mb-0.5">Height</label>
              <input
                type="number"
                min={100}
                max={10000}
                step={100}
                value={activeMap.height}
                onChange={(e) => {
                  const h = Math.max(100, parseInt(e.target.value, 10) || 1080);
                  dispatch({
                    type: "SET_CANVAS_SIZE",
                    payload: { mapId: activeMap.id, width: activeMap.width, height: h },
                  });
                }}
                className="vtt-input w-full text-center"
              />
            </div>
          </div>

          <div className="text-[10px] text-terminal-primary/30 font-mono mb-2">
            {activeMap.width}x{activeMap.height}px ({Math.round(activeMap.width / (grid?.size || 50))}x{Math.round(activeMap.height / (grid?.size || 50))} cells)
          </div>

          {activeMap.imageDataUrl && (
            <>
              <h4 className="vtt-section-label mb-2 mt-3">
                Image Transform
              </h4>

              <div className="mb-2">
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[10px] text-terminal-primary/50 font-mono">
                    Image Scale
                  </label>
                  <span className="text-[10px] text-terminal-primary/40 font-mono">
                    {(activeMap.imageScale || 1).toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={5}
                  step={0.01}
                  value={activeMap.imageScale || 1}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_MAP",
                      payload: {
                        id: activeMap.id,
                        updates: { imageScale: parseFloat(e.target.value) },
                      },
                    })
                  }
                  className="vtt-slider"
                />
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[10px] text-terminal-primary/50 font-mono">
                    Offset X
                  </label>
                  <span className="text-[10px] text-terminal-primary/40 font-mono">
                    {activeMap.imageOffsetX || 0}px
                  </span>
                </div>
                <input
                  type="range"
                  min={-2000}
                  max={2000}
                  step={1}
                  value={activeMap.imageOffsetX || 0}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_MAP",
                      payload: {
                        id: activeMap.id,
                        updates: { imageOffsetX: parseInt(e.target.value, 10) },
                      },
                    })
                  }
                  className="vtt-slider"
                />
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[10px] text-terminal-primary/50 font-mono">
                    Offset Y
                  </label>
                  <span className="text-[10px] text-terminal-primary/40 font-mono">
                    {activeMap.imageOffsetY || 0}px
                  </span>
                </div>
                <input
                  type="range"
                  min={-2000}
                  max={2000}
                  step={1}
                  value={activeMap.imageOffsetY || 0}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_MAP",
                      payload: {
                        id: activeMap.id,
                        updates: { imageOffsetY: parseInt(e.target.value, 10) },
                      },
                    })
                  }
                  className="vtt-slider"
                />
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => {
                    const natW = activeMap.imageNaturalWidth || activeMap.width;
                    const natH = activeMap.imageNaturalHeight || activeMap.height;
                    const scaleX = activeMap.width / natW;
                    const scaleY = activeMap.height / natH;
                    dispatch({
                      type: "UPDATE_MAP",
                      payload: {
                        id: activeMap.id,
                        updates: {
                          imageScale: Math.min(scaleX, scaleY),
                          imageOffsetX: 0,
                          imageOffsetY: 0,
                        },
                      },
                    });
                    toast.success("Image fitted to canvas");
                  }}
                  className="vtt-btn flex-1 justify-center"
                >
                  Fit to Canvas
                </button>
                <button
                  onClick={() => {
                    const natW = activeMap.imageNaturalWidth || 1920;
                    const natH = activeMap.imageNaturalHeight || 1080;
                    dispatch({
                      type: "SET_CANVAS_SIZE",
                      payload: { mapId: activeMap.id, width: natW, height: natH },
                    });
                    dispatch({
                      type: "UPDATE_MAP",
                      payload: {
                        id: activeMap.id,
                        updates: { imageScale: 1, imageOffsetX: 0, imageOffsetY: 0 },
                      },
                    });
                    toast.success("Canvas matched to image");
                  }}
                  className="vtt-btn flex-1 justify-center"
                >
                  Match to Image
                </button>
              </div>
              <button
                onClick={() => {
                  const natW = activeMap.imageNaturalWidth || activeMap.width;
                  const natH = activeMap.imageNaturalHeight || activeMap.height;
                  const imgScale = activeMap.imageScale || 1;
                  const scaledW = natW * imgScale;
                  const scaledH = natH * imgScale;
                  dispatch({
                    type: "UPDATE_MAP",
                    payload: {
                      id: activeMap.id,
                      updates: {
                        imageOffsetX: (activeMap.width - scaledW) / 2,
                        imageOffsetY: (activeMap.height - scaledH) / 2,
                      },
                    },
                  });
                  toast.success("Image centered");
                }}
                className="vtt-btn w-full mt-1 justify-center"
              >
                Center Image
              </button>

              {activeMap.imageNaturalWidth > 0 && (
                <div className="text-[10px] text-terminal-primary/20 font-mono mt-2">
                  Original: {activeMap.imageNaturalWidth}x{activeMap.imageNaturalHeight}px
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Session */}
      <div className="border-t border-terminal-border/20 pt-3">
        <h4 className="vtt-section-label mb-2">
          Session
        </h4>
        <div className="space-y-1.5">
          <button
            onClick={() => {
              saveSession();
              toast.success("Session saved to local storage");
            }}
            className="vtt-btn w-full justify-center"
          >
            Save Now
          </button>
          <button
            onClick={handleExport}
            className="vtt-btn w-full justify-center"
          >
            Export to File
          </button>
          <button
            onClick={handleImport}
            className="vtt-btn w-full justify-center"
          >
            Import from File
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="border-t border-terminal-border/20 pt-3">
        <h4 className="vtt-section-label mb-1">
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
    <label className="vtt-checkbox justify-between py-0.5">
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
