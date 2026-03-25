import { useVTT } from "@/contexts/VTTContext";
import { Trash2, Sun, DoorOpen, DoorClosed } from "lucide-react";

export default function VTTLightingPanel() {
  const { state, dispatch, activeMap } = useVTT();

  if (!activeMap) {
    return (
      <div className="vtt-empty">
        Load a map first
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 space-y-4">
      {/* Display toggles */}
      <div>
        <label className="vtt-checkbox justify-between">
          <span>Show Walls</span>
          <input
            type="checkbox"
            checked={state.showWalls}
            onChange={() => dispatch({ type: "TOGGLE_WALLS" })}
          />
        </label>
        <label className="vtt-checkbox justify-between">
          <span>Show Lights</span>
          <input
            type="checkbox"
            checked={state.showLights}
            onChange={() => dispatch({ type: "TOGGLE_LIGHTS" })}
          />
        </label>
      </div>

      {/* Tool shortcuts */}
      <div>
        <h4 className="vtt-section-label mb-1.5">
          Quick Tools
        </h4>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => dispatch({ type: "SET_TOOL", payload: "wall" })}
            className={`vtt-option ${
              state.activeTool === "wall"
                ? "vtt-option--active bg-orange-500/10 border-orange-500/50 text-orange-400"
                : ""
            }`}
          >
            Wall
          </button>
          <button
            onClick={() => dispatch({ type: "SET_TOOL", payload: "door" })}
            className={`vtt-option ${
              state.activeTool === "door"
                ? "vtt-option--active bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                : ""
            }`}
          >
            Door
          </button>
          <button
            onClick={() => dispatch({ type: "SET_TOOL", payload: "light" })}
            className={`vtt-option ${
              state.activeTool === "light"
                ? "vtt-option--active bg-yellow-500/10 border-yellow-500/50 text-yellow-400"
                : ""
            }`}
          >
            Light
          </button>
        </div>
      </div>

      {/* Walls list */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h4 className="vtt-section-label">
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
              className="vtt-btn danger"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Doors list */}
      <div>
        <h4 className="vtt-section-label mb-1">
          Doors ({activeMap.walls.filter((w) => w.type === "door").length})
        </h4>
        <div className="space-y-1">
          {activeMap.walls
            .filter((w) => w.type === "door")
            .map((door) => (
              <div
                key={door.id}
                className="vtt-list-item justify-between"
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
        <h4 className="vtt-section-label mb-1">
          Lights ({activeMap.lights.length})
        </h4>
        <div className="space-y-1">
          {activeMap.lights.map((light) => (
            <div
              key={light.id}
              className="vtt-list-item justify-between"
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
                        updates: { radius: parseInt(e.target.value, 10) },
                      },
                    })
                  }
                  className="vtt-slider w-16 accent-yellow-500"
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

      <div className="vtt-empty pt-2">
        Use Wall/Door/Light tools on the canvas to add elements.
        <br />
        Dynamic lighting renders when both walls and lights exist.
      </div>
    </div>
  );
}
