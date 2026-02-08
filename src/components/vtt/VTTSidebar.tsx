import { useVTT } from "@/contexts/VTTContext";
import VTTMapLibrary from "./VTTMapLibrary";
import VTTTokenPanel from "./VTTTokenPanel";
import VTTDrawingPanel from "./VTTDrawingPanel";
import VTTAudioMixer from "./VTTAudioMixer";
import VTTEffectsPanel from "./VTTEffectsPanel";
import VTTInitiativePanel from "./VTTInitiativePanel";
import VTTClocksPanel from "./VTTClocksPanel";
import VTTHandoutsPanel from "./VTTHandoutsPanel";
import VTTFogPanel from "./VTTFogPanel";
import VTTSettingsPanel from "./VTTSettingsPanel";
import { X } from "lucide-react";

export default function VTTSidebar() {
  const { state, dispatch } = useVTT();

  if (!state.sidebarPanel) return null;

  const panelLabels: Record<string, string> = {
    maps: "Maps",
    tokens: "Tokens",
    drawing: "Drawing",
    fog: "Fog of War",
    lighting: "Lighting",
    audio: "Audio Mixer",
    effects: "Effects",
    initiative: "Initiative",
    clocks: "Clocks",
    handouts: "Handouts",
    settings: "Settings",
  };

  return (
    <div className="w-64 h-full bg-terminal-bg-dark/95 border-l border-terminal-border/30 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-terminal-border/30">
        <span className="text-terminal-primary text-xs font-mono uppercase tracking-wider">
          {panelLabels[state.sidebarPanel] || state.sidebarPanel}
        </span>
        <button
          onClick={() => dispatch({ type: "SET_SIDEBAR", payload: null })}
          className="text-terminal-primary/50 hover:text-terminal-primary transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden">
        {state.sidebarPanel === "maps" && <VTTMapLibrary />}
        {state.sidebarPanel === "tokens" && <VTTTokenPanel />}
        {state.sidebarPanel === "drawing" && <VTTDrawingPanel />}
        {state.sidebarPanel === "audio" && <VTTAudioMixer />}
        {state.sidebarPanel === "effects" && <VTTEffectsPanel />}
        {state.sidebarPanel === "initiative" && <VTTInitiativePanel />}
        {state.sidebarPanel === "clocks" && <VTTClocksPanel />}
        {state.sidebarPanel === "handouts" && <VTTHandoutsPanel />}
        {state.sidebarPanel === "fog" && <VTTFogPanel />}
        {state.sidebarPanel === "lighting" && <PlaceholderPanel name="Dynamic Lighting" />}
        {state.sidebarPanel === "settings" && <VTTSettingsPanel />}
      </div>
    </div>
  );
}

function PlaceholderPanel({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-terminal-primary/30 font-mono text-xs p-4 text-center">
      <div className="mb-2 text-2xl opacity-30">&#9881;</div>
      {name}
      <div className="mt-1 text-[10px]">Coming soon</div>
    </div>
  );
}
