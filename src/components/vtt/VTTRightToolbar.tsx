import {
  Map,
  Layers,
  Users,
  UserPlus,
  Paintbrush,
  Eye,
  Lightbulb,
  Target,
  Cloud,
  Sparkles,
  Music,
  Swords,
  Clock,
  Image,
  Dice5,
  Settings,
} from "lucide-react";
import { useVTT } from "@/contexts/VTTContext";
import type { VTTSidebarPanel } from "@/types/vtt";

interface PanelDef {
  panel: VTTSidebarPanel;
  icon: React.ReactNode;
  label: string;
}

const topPanels: PanelDef[] = [
  { panel: "maps", icon: <Map size={15} />, label: "MAP" },
  { panel: "layers", icon: <Layers size={15} />, label: "LAYERS" },
  { panel: "tokens", icon: <Users size={15} />, label: "TOKENS" },
  { panel: "characters", icon: <UserPlus size={15} />, label: "CHARS" },
  { panel: "drawing", icon: <Paintbrush size={15} />, label: "DRAW" },
  { panel: "fog", icon: <Eye size={15} />, label: "FOG" },
  { panel: "lighting", icon: <Lightbulb size={15} />, label: "LIGHT" },
  { panel: "aoe", icon: <Target size={15} />, label: "AOE" },
];

const bottomPanels: PanelDef[] = [
  { panel: "initiative", icon: <Swords size={15} />, label: "INIT" },
  { panel: "dice", icon: <Dice5 size={15} />, label: "DICE" },
  { panel: "clocks", icon: <Clock size={15} />, label: "CLOCKS" },
  { panel: "handouts", icon: <Image size={15} />, label: "NOTES" },
  { panel: "audio", icon: <Music size={15} />, label: "AUDIO" },
  { panel: "effects", icon: <Cloud size={15} />, label: "FX" },
  { panel: "scenes", icon: <Sparkles size={15} />, label: "SCENES" },
  { panel: "settings", icon: <Settings size={15} />, label: "SETS" },
];

export default function VTTRightToolbar() {
  const { state, dispatch } = useVTT();

  const toggle = (panel: VTTSidebarPanel) =>
    dispatch({
      type: "SET_SIDEBAR",
      payload: state.sidebarPanel === panel ? null : panel,
    });

  const PanelButton = ({ panel, icon, label }: PanelDef) => {
    const active = state.sidebarPanel === panel;
    return (
      <button
        onClick={() => toggle(panel)}
        className={`flex flex-col items-center justify-center gap-0 py-1 w-full rounded transition-colors ${
          active
            ? "bg-terminal-primary/15 text-terminal-primary"
            : "text-terminal-primary/40 hover:text-terminal-primary hover:bg-terminal-primary/8"
        }`}
        title={label}
      >
        <span className={active ? "text-terminal-primary" : ""}>{icon}</span>
        <span className="text-[7px] font-mono leading-tight mt-0.5 tracking-wider">
          {label}
        </span>
      </button>
    );
  };

  return (
    <div
      className="flex flex-col items-center py-1 px-0.5 bg-terminal-bg-dark border-l border-terminal-border/30 select-none"
      style={{ width: 44 }}
    >
      {/* Map & canvas panels */}
      {topPanels.map((p) => (
        <PanelButton key={p.panel} {...p} />
      ))}

      {/* Separator */}
      <div className="w-6 border-t border-terminal-border/25 my-1" />

      {/* Game & audio panels */}
      {bottomPanels.map((p) => (
        <PanelButton key={p.panel} {...p} />
      ))}
    </div>
  );
}
