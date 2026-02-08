import { useVTT } from "@/contexts/VTTContext";
import { Trash2, Sun, DoorOpen, DoorClosed } from "lucide-react";

export default function VTTLightingPanel() {
  const { state, dispatch, activeMap } = useVTT();

  if (!activeMap) {
    return (
      <div className="flex items-center justify-center h-full text-terminal-primary/30 text-xs font-mono p-4 text-center">
        Load a map first
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 space-y-4">
      {/* Display toggles */}
      <div>
        <label className="flex items-center justify-between py-0.5 cursor-pointer">
          <span className="text-xs text-terminal-primary/60 font-mono">Show Walls</span>
          <input
            type="checkbox"
            checked={state.showWalls}
            onChange={() => dispatch({ type: "TOGGLE_WALLS" })}
            className="accent-green-500"
          />
        </label>
        <label className="flex items-center justify-between py-0.5 cursor-pointer">
          <span className="text-xs text-terminal-primary/60 font-mono">Show Lights</span>
          <input
            type="checkbox"
            checked={state.showLights}
            onChange={() => dispatch({ type: "TOGGLE_LIGHTS" })}
            className="accent-green-500"
          />
        </label>
      </div>

      {/* Tool shortcuts */}
      <div>
        <h4 className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono mb-1.5">
          Quick Tools
        </h4>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => dispatch({ type: "SET_TOOL", payload: "wall" })}
            className={`px-2 py-1.5 text-xs font-mono rounded border transition-colors ${
              state.activeTool === "wall"
                ? "bg-orange-500/10 border-orange-500/50 text-orange-400"
                : "border-terminal-border/30 text-terminal-primary/50 hover:text-terminal-primary"
            }`}
          >
            Wall
          </button>
          <button
            onClick={() => dispatch({ type: "SET_TOOL", payload: "door" })}
            className={`px-2 py-1.5 text-xs font-mono rounded border transition-colors ${
              state.activeTool === "door"
                ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                : "border-terminal-border/30 text-terminal-primary/50 hover:text-terminal-primary"
            }`}
          >
            Door
          </button>
          <button
            onClick={() => dispatch({ type: "SET_TOOL", payload: "light" })}
            className={`px-2 py-1.5 text-xs font-mono rounded border transition-colors ${
              state.activeTool === "light"
                ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-400"
                : "border-terminal-border/30 text-terminal-primary/50 hover:text-terminal-primary"
            }`}
          >
            Light
          </button>
        </div>
      </div>

      {/* Walls list */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono">
            Walls ({activeMap.walls.filter((w) => w.type === "wall").length})
          </h4>
          {activeMap.walls.filter((w) => w.type === "wall").length > 0 && (
            <button
              onClick={() => {
                activeMap.walls
                  .filter((w) => w.type === "wall")
                  .forEach((w) =>
                    dispatch({
                      type: "REMOVE_WALL",
                      payload: { mapId: activeMap.id, wallId: w.id },
                    })
                  );
              }}
              className="text-[10px] font-mono text-red-400/50 hover:text-red-400 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Doors list */}
      <div>
        <h4 className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono mb-1">
          Doors ({activeMap.walls.filter((w) => w.type === "door").length})
        </h4>
        <div className="space-y-1">
          {activeMap.walls
            .filter((w) => w.type === "door")
            .map((door) => (
              <div
                key={door.id}
                className="flex items-center justify-between px-2 py-1 rounded border border-terminal-border/20 bg-terminal-bg-dark/50"
              >
                <span className="text-xs font-mono text-cyan-400/70">
                  {door.doorOpen ? "Open" : "Closed"}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      dispatch({
                        type: "TOGGLE_DOOR",
                        payload: { mapId: activeMap.id, wallId: door.id },
                      })
                    }
                    className="p-1 text-cyan-400/50 hover:text-cyan-400 transition-colors"
                    title={door.doorOpen ? "Close Door" : "Open Door"}
                  >
                    {door.doorOpen ? <DoorOpen size={12} /> : <DoorClosed size={12} />}
                  </button>
                  <button
                    onClick={() =>
                      dispatch({
                        type: "REMOVE_WALL",
                        payload: { mapId: activeMap.id, wallId: door.id },
                      })
                    }
                    className="p-1 text-terminal-primary/30 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Lights list */}
      <div>
        <h4 className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono mb-1">
          Lights ({activeMap.lights.length})
        </h4>
        <div className="space-y-1">
          {activeMap.lights.map((light) => (
            <div
              key={light.id}
              className="flex items-center justify-between px-2 py-1 rounded border border-terminal-border/20 bg-terminal-bg-dark/50"
            >
              <div className="flex items-center gap-2">
                <Sun size={12} style={{ color: light.color }} />
                <span className="text-xs font-mono text-terminal-primary/60">
                  r:{light.radius}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="color"
                  value={light.color}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_LIGHT",
                      payload: {
                        mapId: activeMap.id,
                        lightId: light.id,
                        updates: { color: e.target.value },
                      },
                    })
                  }
                  className="w-5 h-4 rounded border border-terminal-border/30 bg-transparent cursor-pointer"
                />
                <input
                  type="range"
                  min={50}
                  max={500}
                  value={light.radius}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_LIGHT",
                      payload: {
                        mapId: activeMap.id,
                        lightId: light.id,
                        updates: { radius: parseInt(e.target.value) },
                      },
                    })
                  }
                  className="w-16 accent-yellow-500 h-1"
                />
                <button
                  onClick={() =>
                    dispatch({
                      type: "REMOVE_LIGHT",
                      payload: { mapId: activeMap.id, lightId: light.id },
                    })
                  }
                  className="p-1 text-terminal-primary/30 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-[10px] text-terminal-primary/20 font-mono text-center pt-2">
        Use Wall/Door/Light tools on the canvas to add elements.
        <br />
        Dynamic lighting renders when both walls and lights exist.
      </div>
    </div>
  );
}
