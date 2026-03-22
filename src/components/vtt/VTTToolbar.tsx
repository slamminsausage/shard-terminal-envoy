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
} from "lucide-react";
import { useVTT } from "@/contexts/VTTContext";
import type { VTTTool } from "@/types/vtt";
import { toast } from "sonner";

interface ToolDef {
  tool: VTTTool;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
}

const tools: ToolDef[] = [
  { tool: "cursor", icon: <MousePointer size={14} />, label: "Select", shortcut: "V" },
  { tool: "pan", icon: <Hand size={14} />, label: "Pan", shortcut: "H" },
  { tool: "draw-freehand", icon: <Pencil size={14} />, label: "Draw", shortcut: "B" },
  { tool: "draw-line", icon: <Minus size={14} />, label: "Line", shortcut: "L" },
  { tool: "draw-rect", icon: <Square size={14} />, label: "Rect", shortcut: "R" },
  { tool: "draw-circle", icon: <Circle size={14} />, label: "Circle", shortcut: "O" },
  { tool: "draw-text", icon: <Type size={14} />, label: "Text", shortcut: "T" },
  { tool: "measure", icon: <Ruler size={14} />, label: "Measure", shortcut: "M" },
];

const mapTools: ToolDef[] = [
  { tool: "wall", icon: <Minus size={14} className="text-orange-400" />, label: "Wall", shortcut: "W" },
  { tool: "door", icon: <Minus size={14} className="text-cyan-400" />, label: "Door", shortcut: "D" },
  { tool: "light", icon: <Lightbulb size={14} />, label: "Light", shortcut: "P" },
  { tool: "note", icon: <StickyNote size={14} />, label: "Note", shortcut: "N" },
];

const aoeTools: ToolDef[] = [
  { tool: "aoe-cone", icon: <Target size={14} className="text-red-400" />, label: "Cone", shortcut: "J" },
  { tool: "aoe-circle", icon: <Target size={14} className="text-yellow-400" />, label: "AoE", shortcut: "C" },
  { tool: "aoe-line", icon: <Target size={14} className="text-blue-400" />, label: "Blast", shortcut: "K" },
];

export default function VTTToolbar() {
  const { state, dispatch, activeMap, saveSession, exportSession, loadSession } = useVTT();

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

  return (
    <div className="vtt-toolbar border-r" style={{ width: 38 }}>
      {/* Drawing tools */}
      {tools.map(({ tool, icon, label, shortcut }) => (
        <button
          key={tool}
          onClick={() => dispatch({ type: "SET_TOOL", payload: tool })}
          className={btnClass(state.activeTool === tool)}
          title={`${label}${shortcut ? ` (${shortcut})` : ""}`}
        >
          {icon}
        </button>
      ))}

      <div className="vtt-separator" />

      {/* Map building tools */}
      {mapTools.map(({ tool, icon, label, shortcut }) => (
        <button
          key={tool}
          onClick={() => dispatch({ type: "SET_TOOL", payload: tool })}
          className={btnClass(state.activeTool === tool)}
          title={`${label}${shortcut ? ` (${shortcut})` : ""}`}
        >
          {icon}
        </button>
      ))}

      <div className="vtt-separator" />

      {/* AoE tools */}
      {aoeTools.map(({ tool, icon, label, shortcut }) => (
        <button
          key={tool}
          onClick={() => dispatch({ type: "SET_TOOL", payload: tool })}
          className={btnClass(state.activeTool === tool)}
          title={`${label}${shortcut ? ` (${shortcut})` : ""}`}
        >
          {icon}
        </button>
      ))}

      <div className="vtt-separator" />

      {/* View toggles */}
      <button
        onClick={() => dispatch({ type: "TOGGLE_GRID" })}
        className={btnClass(state.showGrid)}
        title="Toggle Grid (Ctrl+G)"
      >
        <Grid3X3 size={14} />
      </button>
      <button
        onClick={() => dispatch({ type: "TOGGLE_FOG" })}
        className={btnClass(state.showFog)}
        title="Toggle Fog"
      >
        {state.showFog ? <Eye size={14} /> : <EyeOff size={14} />}
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
