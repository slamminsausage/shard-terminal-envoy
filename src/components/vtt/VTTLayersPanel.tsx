import { useVTT } from "@/contexts/VTTContext";
import { Eye, EyeOff, Lock, Unlock } from "lucide-react";
import { LAYER_MAP, LAYER_TOKEN, LAYER_GM } from "@/types/vtt";
import type { LayerIndex } from "@/types/vtt";

const LAYER_DEFS: { index: LayerIndex; name: string; color: string }[] = [
  { index: LAYER_GM, name: "GM Layer", color: "#ff6600" },
  { index: LAYER_TOKEN, name: "Token Layer", color: "#3ae2b3" },
  { index: LAYER_MAP, name: "Map Layer", color: "#00ccff" },
];

export default function VTTLayersPanel() {
  const { state, dispatch, activeMap } = useVTT();

  const getObjectCount = (layer: LayerIndex): number => {
    if (!activeMap) return 0;
    let count = 0;
    count += activeMap.strokes.filter((s) => s.layer === layer).length;
    count += activeMap.texts.filter((t) => t.layer === layer).length;
    if (layer === LAYER_TOKEN) {
      count += activeMap.tokens.filter((t) => t.layer === layer).length;
    }
    if (layer === LAYER_GM) {
      count += activeMap.notes.length;
    }
    return count;
  };

  return (
    <div className="flex flex-col gap-1 p-2">
      <div className="vtt-section-label mb-1">
        Render Order (top → bottom)
      </div>

      {LAYER_DEFS.map(({ index, name, color }) => {
        const isActive = state.activeLayer === index;
        const layerState = state.layerStates?.[index] ?? { visible: true, locked: false };
        const count = getObjectCount(index);

        return (
          <div
            key={index}
            className={`vtt-list-item cursor-pointer ${
              isActive
                ? "vtt-list-item--active border-l-2"
                : "border-l-2 border-transparent"
            }`}
            style={isActive ? { borderLeftColor: color } : undefined}
            onClick={() => dispatch({ type: "SET_LAYER", payload: index })}
          >
            {/* Layer color dot */}
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: color, opacity: layerState.visible ? 1 : 0.3 }}
            />

            {/* Layer name + count */}
            <div className="flex-1 min-w-0">
              <div
                className={`text-xs font-mono truncate ${
                  isActive ? "text-terminal-primary" : "text-terminal-primary/60"
                }`}
                style={isActive ? { color } : undefined}
              >
                {name}
              </div>
              {count > 0 && (
                <div className="text-[9px] text-terminal-primary/30">
                  {count} object{count !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            {/* Visibility toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: "TOGGLE_LAYER_VISIBILITY", payload: index });
              }}
              className={`p-1 rounded transition-colors ${
                layerState.visible
                  ? "text-terminal-primary/60 hover:text-terminal-primary"
                  : "text-terminal-primary/20 hover:text-terminal-primary/40"
              }`}
              title={layerState.visible ? "Hide layer" : "Show layer"}
            >
              {layerState.visible ? <Eye size={13} /> : <EyeOff size={13} />}
            </button>

            {/* Lock toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: "TOGGLE_LAYER_LOCK", payload: index });
              }}
              className={`p-1 rounded transition-colors ${
                layerState.locked
                  ? "text-yellow-400/70 hover:text-yellow-400"
                  : "text-terminal-primary/20 hover:text-terminal-primary/40"
              }`}
              title={layerState.locked ? "Unlock layer" : "Lock layer"}
            >
              {layerState.locked ? <Lock size={13} /> : <Unlock size={13} />}
            </button>
          </div>
        );
      })}

      <div className="border-t border-terminal-border/20 mt-2 pt-2">
        <div className="text-[10px] text-terminal-primary/30 px-2">
          Click a layer to make it active for drawing. Toggle eye to show/hide, lock to prevent selection.
        </div>
      </div>
    </div>
  );
}
