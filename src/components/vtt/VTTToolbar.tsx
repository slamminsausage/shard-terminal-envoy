import { useState, useRef, useEffect } from "react";
import {
  MousePointer,
  Hand,
  Pencil,
  Minus,
  Square,
  Circle,
  Grid3X3,
  Eye,
  EyeOff,
  Type,
  Ruler,
  Lightbulb,
  StickyNote,
  Target,
  Presentation,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Save,
  Download,
  Upload,
  ChevronRight,
  Undo2,
  Redo2,
  Eraser,
  Trash2,
} from "lucide-react";
import { useVTT } from "@/contexts/VTTContext";
import type { VTTTool } from "@/types/vtt";
import { LAYER_MAP, LAYER_TOKEN, LAYER_GM } from "@/types/vtt";
import type { LayerIndex } from "@/types/vtt";
import { toast } from "sonner";

// ─── Popout Wrapper ────────────────────────────────────────────────────────

function ToolPopout({
  open,
  onClose,
  children,
  anchorY,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  anchorY: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        // Check if clicking on the parent toolbar button
        const parent = (e.target as HTMLElement).closest(".vtt-toolbar");
        if (!parent) onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="fixed z-50 ml-1"
      style={{
        left: 38,
        top: Math.max(4, anchorY),
      }}
    >
      <div className="bg-[#0a0f0a] border border-terminal-border/30 rounded shadow-lg shadow-black/50 min-w-[160px] max-w-[220px] py-1">
        {children}
      </div>
    </div>
  );
}

function PopoutItem({
  icon,
  label,
  shortcut,
  active,
  onClick,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  shortcut?: string;
  active?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 text-left font-mono text-[11px] transition-colors ${
        active
          ? "text-[var(--primary)] bg-[rgba(58,226,179,0.08)]"
          : "text-[rgba(58,226,179,0.6)] hover:text-[var(--primary)] hover:bg-[rgba(58,226,179,0.04)]"
      } ${className || ""}`}
    >
      {icon && <span className="w-4 flex-shrink-0">{icon}</span>}
      <span className="flex-1">{label}</span>
      {shortcut && (
        <span className="text-[9px] text-[rgba(58,226,179,0.3)] ml-2">{shortcut}</span>
      )}
    </button>
  );
}

function PopoutDivider() {
  return <div className="border-t border-terminal-border/15 my-1" />;
}

function PopoutLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-1 text-[8px] text-[rgba(58,226,179,0.3)] font-mono uppercase tracking-wider">
      {children}
    </div>
  );
}

// ─── Preset Colors ─────────────────────────────────────────────────────────

const PRESET_COLORS = [
  "#3ae2b3", "#00ccff", "#ff6600", "#ff3344", "#ffcc00",
  "#aa44ff", "#ffffff", "#888888", "#44ff44", "#ff44aa",
];

const PRESET_WIDTHS = [1, 2, 3, 5, 8, 12];

// ─── Main Toolbar ──────────────────────────────────────────────────────────

export default function VTTToolbar() {
  const { state, dispatch, activeMap, saveSession, exportSession, loadSession } = useVTT();
  const [openPopout, setOpenPopout] = useState<string | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const getAnchorY = (key: string) => {
    const btn = buttonRefs.current[key];
    if (!btn) return 0;
    return btn.getBoundingClientRect().top;
  };

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
        const json = ev.target?.result as string;
        loadSession(json);
        toast.success("Session loaded");
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const btnClass = (active: boolean) =>
    `vtt-btn-icon ${active ? "vtt-btn-icon--active" : ""}`;

  const isDrawTool = (t: VTTTool) =>
    ["draw-freehand", "draw-line", "draw-rect", "draw-circle", "draw-text"].includes(t);
  const isMapTool = (t: VTTTool) =>
    ["wall", "door", "light", "note"].includes(t);
  const isAoETool = (t: VTTTool) =>
    ["aoe-cone", "aoe-circle", "aoe-line"].includes(t);
  const isFogTool = (t: VTTTool) =>
    ["fog-circle", "fog-rect", "fog-polygon"].includes(t);

  const togglePopout = (key: string) =>
    setOpenPopout(openPopout === key ? null : key);

  // Active draw tool icon
  const drawIcon = (() => {
    switch (state.activeTool) {
      case "draw-line": return <Minus size={14} />;
      case "draw-rect": return <Square size={14} />;
      case "draw-circle": return <Circle size={14} />;
      case "draw-text": return <Type size={14} />;
      default: return <Pencil size={14} />;
    }
  })();

  const mapToolIcon = (() => {
    switch (state.activeTool) {
      case "door": return <Minus size={14} className="text-cyan-400" />;
      case "light": return <Lightbulb size={14} />;
      case "note": return <StickyNote size={14} />;
      default: return <Minus size={14} className="text-orange-400" />;
    }
  })();

  const aoeToolIcon = (() => {
    switch (state.activeTool) {
      case "aoe-cone": return <Target size={14} className="text-red-400" />;
      case "aoe-line": return <Target size={14} className="text-blue-400" />;
      default: return <Target size={14} className="text-yellow-400" />;
    }
  })();

  return (
    <div className="vtt-toolbar border-r" style={{ width: 38 }}>
      {/* Select / Pan */}
      <button
        onClick={() => dispatch({ type: "SET_TOOL", payload: "cursor" })}
        className={btnClass(state.activeTool === "cursor")}
        title="Select (V)"
      >
        <MousePointer size={14} />
      </button>
      <button
        onClick={() => dispatch({ type: "SET_TOOL", payload: "pan" })}
        className={btnClass(state.activeTool === "pan")}
        title="Pan (H)"
      >
        <Hand size={14} />
      </button>

      <div className="vtt-separator" />

      {/* Drawing tools group with popout */}
      <div className="relative">
        <button
          ref={(el) => (buttonRefs.current["draw"] = el)}
          onClick={() => {
            if (!isDrawTool(state.activeTool)) {
              dispatch({ type: "SET_TOOL", payload: "draw-freehand" });
            }
            togglePopout("draw");
          }}
          className={`${btnClass(isDrawTool(state.activeTool))} relative`}
          title="Drawing Tools"
        >
          {drawIcon}
          <ChevronRight size={6} className="absolute right-0.5 bottom-0.5 opacity-40" />
        </button>
      </div>

      {/* Drawing popout */}
      <ToolPopout open={openPopout === "draw"} onClose={() => setOpenPopout(null)} anchorY={getAnchorY("draw")}>
        <PopoutLabel>Drawing Tools</PopoutLabel>
        <PopoutItem icon={<Pencil size={12} />} label="Freehand" shortcut="B" active={state.activeTool === "draw-freehand"} onClick={() => { dispatch({ type: "SET_TOOL", payload: "draw-freehand" }); }} />
        <PopoutItem icon={<Minus size={12} />} label="Line" shortcut="L" active={state.activeTool === "draw-line"} onClick={() => { dispatch({ type: "SET_TOOL", payload: "draw-line" }); }} />
        <PopoutItem icon={<Square size={12} />} label="Rectangle" shortcut="R" active={state.activeTool === "draw-rect"} onClick={() => { dispatch({ type: "SET_TOOL", payload: "draw-rect" }); }} />
        <PopoutItem icon={<Circle size={12} />} label="Ellipse" shortcut="O" active={state.activeTool === "draw-circle"} onClick={() => { dispatch({ type: "SET_TOOL", payload: "draw-circle" }); }} />
        <PopoutItem icon={<Type size={12} />} label="Text" shortcut="T" active={state.activeTool === "draw-text"} onClick={() => { dispatch({ type: "SET_TOOL", payload: "draw-text" }); }} />

        <PopoutDivider />
        <PopoutLabel>Color</PopoutLabel>
        <div className="px-3 py-1 flex flex-wrap gap-1">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => dispatch({ type: "SET_DRAW_COLOR", payload: color })}
              className={`w-5 h-5 rounded border transition-all ${
                state.drawColor === color
                  ? "border-terminal-primary scale-110"
                  : "border-transparent hover:border-terminal-primary/30"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <input
            type="color"
            value={state.drawColor}
            onChange={(e) => dispatch({ type: "SET_DRAW_COLOR", payload: e.target.value })}
            className="w-5 h-5 rounded border border-terminal-border/30 bg-transparent cursor-pointer"
          />
        </div>

        <PopoutDivider />
        <PopoutLabel>Width: {state.drawWidth}px</PopoutLabel>
        <div className="px-3 py-1 flex gap-1">
          {PRESET_WIDTHS.map((w) => (
            <button
              key={w}
              onClick={() => dispatch({ type: "SET_DRAW_WIDTH", payload: w })}
              className={`flex items-center justify-center w-6 h-6 rounded border transition-all ${
                state.drawWidth === w
                  ? "border-[var(--primary)] bg-[rgba(58,226,179,0.1)]"
                  : "border-transparent hover:border-[rgba(58,226,179,0.2)]"
              }`}
            >
              <div className="rounded-full bg-terminal-primary" style={{ width: Math.min(w * 2, 16), height: Math.min(w * 2, 16) }} />
            </button>
          ))}
        </div>

        <PopoutDivider />
        <PopoutLabel>Layer</PopoutLabel>
        <div className="px-3 py-1 flex gap-1">
          {([
            { layer: LAYER_MAP as LayerIndex, label: "Map" },
            { layer: LAYER_TOKEN as LayerIndex, label: "Token" },
            { layer: LAYER_GM as LayerIndex, label: "GM" },
          ]).map(({ layer, label }) => (
            <button
              key={layer}
              onClick={() => dispatch({ type: "SET_LAYER", payload: layer })}
              className={`flex-1 text-[9px] font-mono py-1 rounded border transition-all ${
                state.activeLayer === layer
                  ? "border-[var(--primary)] bg-[rgba(58,226,179,0.1)] text-[var(--primary)]"
                  : "border-transparent text-[rgba(58,226,179,0.4)] hover:text-[var(--primary)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <PopoutDivider />
        <div className="px-3 py-1 flex gap-1">
          <button
            onClick={() => dispatch({ type: "UNDO" })}
            disabled={state.historyIndex < 0}
            className="vtt-btn flex-1 justify-center"
          >
            <Undo2 size={10} /> Undo
          </button>
          <button
            onClick={() => dispatch({ type: "REDO" })}
            disabled={state.historyIndex >= state.history.length - 1}
            className="vtt-btn flex-1 justify-center"
          >
            <Redo2 size={10} /> Redo
          </button>
        </div>
        {activeMap && (
          <div className="px-3 py-1">
            <button
              onClick={() => dispatch({ type: "CLEAR_STROKES", payload: { mapId: activeMap.id, layer: state.activeLayer } })}
              className="vtt-btn danger w-full justify-center"
            >
              <Trash2 size={10} /> Clear Layer
            </button>
          </div>
        )}
      </ToolPopout>

      {/* Measure tool */}
      <button
        onClick={() => dispatch({ type: "SET_TOOL", payload: "measure" })}
        className={btnClass(state.activeTool === "measure")}
        title="Measure (M)"
      >
        <Ruler size={14} />
      </button>

      <div className="vtt-separator" />

      {/* Map building tools group with popout */}
      <div className="relative">
        <button
          ref={(el) => (buttonRefs.current["map"] = el)}
          onClick={() => {
            if (!isMapTool(state.activeTool)) {
              dispatch({ type: "SET_TOOL", payload: "wall" });
            }
            togglePopout("map");
          }}
          className={`${btnClass(isMapTool(state.activeTool))} relative`}
          title="Map Tools (Wall/Door/Light/Note)"
        >
          {mapToolIcon}
          <ChevronRight size={6} className="absolute right-0.5 bottom-0.5 opacity-40" />
        </button>
      </div>

      <ToolPopout open={openPopout === "map"} onClose={() => setOpenPopout(null)} anchorY={getAnchorY("map")}>
        <PopoutLabel>Map Building</PopoutLabel>
        <PopoutItem icon={<Minus size={12} className="text-orange-400" />} label="Wall" shortcut="W" active={state.activeTool === "wall"} onClick={() => dispatch({ type: "SET_TOOL", payload: "wall" })} />
        <PopoutItem icon={<Minus size={12} className="text-cyan-400" />} label="Door" shortcut="D" active={state.activeTool === "door"} onClick={() => dispatch({ type: "SET_TOOL", payload: "door" })} />
        <PopoutItem icon={<Lightbulb size={12} />} label="Light" shortcut="P" active={state.activeTool === "light"} onClick={() => dispatch({ type: "SET_TOOL", payload: "light" })} />
        <PopoutItem icon={<StickyNote size={12} />} label="Note" shortcut="N" active={state.activeTool === "note"} onClick={() => dispatch({ type: "SET_TOOL", payload: "note" })} />
      </ToolPopout>

      {/* AoE tools group with popout */}
      <div className="relative">
        <button
          ref={(el) => (buttonRefs.current["aoe"] = el)}
          onClick={() => {
            if (!isAoETool(state.activeTool)) {
              dispatch({ type: "SET_TOOL", payload: "aoe-circle" });
            }
            togglePopout("aoe");
          }}
          className={`${btnClass(isAoETool(state.activeTool))} relative`}
          title="AoE Templates"
        >
          {aoeToolIcon}
          <ChevronRight size={6} className="absolute right-0.5 bottom-0.5 opacity-40" />
        </button>
      </div>

      <ToolPopout open={openPopout === "aoe"} onClose={() => setOpenPopout(null)} anchorY={getAnchorY("aoe")}>
        <PopoutLabel>Area of Effect</PopoutLabel>
        <PopoutItem icon={<Target size={12} className="text-red-400" />} label="Cone" shortcut="J" active={state.activeTool === "aoe-cone"} onClick={() => dispatch({ type: "SET_TOOL", payload: "aoe-cone" })} />
        <PopoutItem icon={<Target size={12} className="text-yellow-400" />} label="Circle" shortcut="C" active={state.activeTool === "aoe-circle"} onClick={() => dispatch({ type: "SET_TOOL", payload: "aoe-circle" })} />
        <PopoutItem icon={<Target size={12} className="text-blue-400" />} label="Line/Blast" shortcut="K" active={state.activeTool === "aoe-line"} onClick={() => dispatch({ type: "SET_TOOL", payload: "aoe-line" })} />
        {activeMap && (activeMap.aoeTemplates || []).length > 0 && (
          <>
            <PopoutDivider />
            <PopoutItem icon={<Trash2 size={12} className="text-red-400" />} label={`Clear All (${(activeMap.aoeTemplates || []).length})`} onClick={() => dispatch({ type: "CLEAR_AOE" })} className="text-red-400/60 hover:text-red-400" />
          </>
        )}
      </ToolPopout>

      {/* Fog tools group with popout */}
      <div className="relative">
        <button
          ref={(el) => (buttonRefs.current["fog"] = el)}
          onClick={() => {
            if (!isFogTool(state.activeTool)) {
              dispatch({ type: "SET_TOOL", payload: "fog-circle" });
            }
            togglePopout("fog");
          }}
          className={`${btnClass(isFogTool(state.activeTool) || state.showFog)} relative`}
          title="Fog of War"
        >
          {state.showFog ? <Eye size={14} /> : <EyeOff size={14} />}
          <ChevronRight size={6} className="absolute right-0.5 bottom-0.5 opacity-40" />
        </button>
      </div>

      <ToolPopout open={openPopout === "fog"} onClose={() => setOpenPopout(null)} anchorY={getAnchorY("fog")}>
        <PopoutLabel>Fog of War</PopoutLabel>
        <PopoutItem icon={state.showFog ? <Eye size={12} /> : <EyeOff size={12} />} label={state.showFog ? "Fog On" : "Fog Off"} active={state.showFog} onClick={() => dispatch({ type: "TOGGLE_FOG" })} />
        <PopoutDivider />
        <PopoutLabel>Brush Shape</PopoutLabel>
        <PopoutItem label="Circle" shortcut="F" active={state.activeTool === "fog-circle"} onClick={() => dispatch({ type: "SET_TOOL", payload: "fog-circle" })} />
        <PopoutItem label="Rectangle" active={state.activeTool === "fog-rect"} onClick={() => dispatch({ type: "SET_TOOL", payload: "fog-rect" })} />
        <PopoutItem label="Polygon" active={state.activeTool === "fog-polygon"} onClick={() => dispatch({ type: "SET_TOOL", payload: "fog-polygon" })} />
        <PopoutDivider />
        <PopoutLabel>Mode</PopoutLabel>
        <div className="px-3 py-1 flex gap-1">
          <button
            onClick={() => dispatch({ type: "SET_FOG_BRUSH_MODE", payload: "reveal" })}
            className={`flex-1 text-[9px] font-mono py-1 rounded border transition-all ${
              state.fogBrushMode === "reveal"
                ? "border-[var(--primary)] bg-[rgba(58,226,179,0.1)] text-[var(--primary)]"
                : "border-transparent text-[rgba(58,226,179,0.4)]"
            }`}
          >
            Reveal
          </button>
          <button
            onClick={() => dispatch({ type: "SET_FOG_BRUSH_MODE", payload: "conceal" })}
            className={`flex-1 text-[9px] font-mono py-1 rounded border transition-all ${
              state.fogBrushMode === "conceal"
                ? "border-[var(--primary)] bg-[rgba(58,226,179,0.1)] text-[var(--primary)]"
                : "border-transparent text-[rgba(58,226,179,0.4)]"
            }`}
          >
            Conceal
          </button>
        </div>
        <PopoutDivider />
        <PopoutLabel>Brush Size: {state.fogBrushSize}px</PopoutLabel>
        <div className="px-3 py-1">
          <input
            type="range"
            min={10}
            max={200}
            step={5}
            value={state.fogBrushSize}
            onChange={(e) => dispatch({ type: "SET_FOG_BRUSH_SIZE", payload: parseInt(e.target.value, 10) })}
            className="vtt-slider w-full"
          />
        </div>
        {activeMap && (
          <>
            <PopoutDivider />
            <PopoutItem
              icon={<Eraser size={12} className="text-red-400" />}
              label="Reset All Fog"
              onClick={() => dispatch({ type: "UPDATE_FOG", payload: { mapId: activeMap.id, fog: { dataUrl: null } } })}
              className="text-red-400/60 hover:text-red-400"
            />
          </>
        )}
      </ToolPopout>

      <div className="vtt-separator" />

      {/* View toggles */}
      <button
        onClick={() => dispatch({ type: "TOGGLE_GRID" })}
        className={btnClass(state.showGrid)}
        title="Toggle Grid (Ctrl+G)"
      >
        <Grid3X3 size={14} />
      </button>

      {/* Map controls */}
      {activeMap && (
        <>
          <div className="vtt-separator" />
          <button
            onClick={() =>
              dispatch({
                type: "UPDATE_MAP",
                payload: {
                  id: activeMap.id,
                  updates: { rotation: (activeMap.rotation + 90) % 360 },
                },
              })
            }
            className="vtt-btn-icon"
            title={`Rotate Map (${activeMap.rotation}°)`}
          >
            <RotateCw size={13} />
          </button>
          <button
            onClick={() =>
              dispatch({
                type: "UPDATE_MAP",
                payload: {
                  id: activeMap.id,
                  updates: { flipH: !activeMap.flipH },
                },
              })
            }
            className={`vtt-btn-icon ${activeMap.flipH ? "vtt-btn-icon--active" : ""}`}
            title="Flip Horizontal"
          >
            <FlipHorizontal size={13} />
          </button>
          <button
            onClick={() =>
              dispatch({
                type: "UPDATE_MAP",
                payload: {
                  id: activeMap.id,
                  updates: { flipV: !activeMap.flipV },
                },
              })
            }
            className={`vtt-btn-icon ${activeMap.flipV ? "vtt-btn-icon--active" : ""}`}
            title="Flip Vertical"
          >
            <FlipVertical size={13} />
          </button>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom actions */}
      <button
        onClick={() => window.open("/presenter", "_blank", "popup=true")}
        className="vtt-btn-icon hover:!text-cyan-400 hover:!border-cyan-400/30"
        title="Presenter View"
      >
        <Presentation size={14} />
      </button>

      <div className="vtt-separator" />

      <button onClick={saveSession} className="vtt-btn-icon" title="Save (Ctrl+S)">
        <Save size={13} />
      </button>
      <button onClick={handleExport} className="vtt-btn-icon" title="Export Session">
        <Download size={13} />
      </button>
      <button onClick={handleImport} className="vtt-btn-icon" title="Import Session">
        <Upload size={13} />
      </button>
    </div>
  );
}
