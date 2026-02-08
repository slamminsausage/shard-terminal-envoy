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
  Map,
  Users,
  Paintbrush,
  Cloud,
  Music,
  Swords,
  Clock,
  Image,
  Settings,
  Save,
  Download,
  Upload,
  Type,
} from "lucide-react";
import { useVTT } from "@/contexts/VTTContext";
import type { VTTTool, VTTSidebarPanel } from "@/types/vtt";
import { toast } from "sonner";

interface ToolDef {
  tool: VTTTool;
  icon: React.ReactNode;
  label: string;
}

const tools: ToolDef[] = [
  { tool: "cursor", icon: <MousePointer size={16} />, label: "Select" },
  { tool: "pan", icon: <Hand size={16} />, label: "Pan" },
  { tool: "draw-freehand", icon: <Pencil size={16} />, label: "Freehand" },
  { tool: "draw-line", icon: <Minus size={16} />, label: "Line" },
  { tool: "draw-rect", icon: <Square size={16} />, label: "Rectangle" },
  { tool: "draw-circle", icon: <Circle size={16} />, label: "Circle" },
  { tool: "draw-text", icon: <Type size={16} />, label: "Text" },
];

interface PanelDef {
  panel: VTTSidebarPanel;
  icon: React.ReactNode;
  label: string;
}

const panels: PanelDef[] = [
  { panel: "maps", icon: <Map size={16} />, label: "Maps" },
  { panel: "tokens", icon: <Users size={16} />, label: "Tokens" },
  { panel: "drawing", icon: <Paintbrush size={16} />, label: "Drawing" },
  { panel: "effects", icon: <Cloud size={16} />, label: "Effects" },
  { panel: "audio", icon: <Music size={16} />, label: "Audio" },
  { panel: "initiative", icon: <Swords size={16} />, label: "Initiative" },
  { panel: "clocks", icon: <Clock size={16} />, label: "Clocks" },
  { panel: "handouts", icon: <Image size={16} />, label: "Handouts" },
  { panel: "settings", icon: <Settings size={16} />, label: "Settings" },
];

export default function VTTToolbar() {
  const { state, dispatch, saveSession, exportSession, loadSession } = useVTT();

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

  return (
    <div className="flex flex-col gap-1 p-1 bg-terminal-bg-dark border-r border-terminal-border/30">
      {/* Tools */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[9px] text-terminal-primary/40 uppercase tracking-wider px-1 pt-1">
          Tools
        </span>
        {tools.map(({ tool, icon, label }) => (
          <button
            key={tool}
            onClick={() => dispatch({ type: "SET_TOOL", payload: tool })}
            className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
              state.activeTool === tool
                ? "bg-terminal-primary/20 text-terminal-primary border border-terminal-primary/50"
                : "text-terminal-primary/50 hover:text-terminal-primary hover:bg-terminal-primary/10"
            }`}
            title={label}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="border-t border-terminal-border/20 my-1" />

      {/* Panels */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[9px] text-terminal-primary/40 uppercase tracking-wider px-1">
          Panels
        </span>
        {panels.map(({ panel, icon, label }) => (
          <button
            key={panel}
            onClick={() =>
              dispatch({
                type: "SET_SIDEBAR",
                payload: state.sidebarPanel === panel ? null : panel,
              })
            }
            className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
              state.sidebarPanel === panel
                ? "bg-terminal-primary/20 text-terminal-primary border border-terminal-primary/50"
                : "text-terminal-primary/50 hover:text-terminal-primary hover:bg-terminal-primary/10"
            }`}
            title={label}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="border-t border-terminal-border/20 my-1" />

      {/* Toggle buttons */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[9px] text-terminal-primary/40 uppercase tracking-wider px-1">
          View
        </span>
        <button
          onClick={() => dispatch({ type: "TOGGLE_GRID" })}
          className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
            state.showGrid
              ? "text-terminal-primary bg-terminal-primary/10"
              : "text-terminal-primary/30"
          }`}
          title="Toggle Grid"
        >
          <Grid3X3 size={16} />
        </button>
        <button
          onClick={() => dispatch({ type: "TOGGLE_FOG" })}
          className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
            state.showFog
              ? "text-terminal-primary bg-terminal-primary/10"
              : "text-terminal-primary/30"
          }`}
          title="Toggle Fog"
        >
          {state.showFog ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Session actions */}
      <div className="flex flex-col gap-0.5">
        <button
          onClick={saveSession}
          className="flex items-center justify-center w-8 h-8 rounded text-terminal-primary/50 hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
          title="Save Session"
        >
          <Save size={16} />
        </button>
        <button
          onClick={handleExport}
          className="flex items-center justify-center w-8 h-8 rounded text-terminal-primary/50 hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
          title="Export Session"
        >
          <Download size={16} />
        </button>
        <button
          onClick={handleImport}
          className="flex items-center justify-center w-8 h-8 rounded text-terminal-primary/50 hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
          title="Import Session"
        >
          <Upload size={16} />
        </button>
      </div>
    </div>
  );
}
