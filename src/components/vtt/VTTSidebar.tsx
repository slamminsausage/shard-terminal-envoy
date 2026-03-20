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
import VTTDiceRoller from "./VTTDiceRoller";
import VTTLightingPanel from "./VTTLightingPanel";
import VTTSettingsPanel from "./VTTSettingsPanel";
import VTTCharacterImport from "./VTTCharacterImport";
import VTTScenePresets from "./VTTScenePresets";
import VTTAoEPanel from "./VTTAoEPanel";
import VTTLayersPanel from "./VTTLayersPanel";
import { X } from "lucide-react";

export default function VTTSidebar() {
  const { state, dispatch } = useVTT();

  if (!state.sidebarPanel) return null;

  const panelLabels: Record<string, string> = {
    maps: "Maps",
    layers: "Layers",
    tokens: "Tokens",
    characters: "Characters",
    drawing: "Drawing",
    fog: "Fog of War",
    lighting: "Lighting",
    audio: "Audio Mixer",
    effects: "Effects",
    scenes: "Scene Presets",
    initiative: "Initiative",
    clocks: "Clocks",
    handouts: "Handouts",
    aoe: "AoE Templates",
    dice: "Dice Roller",
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
        {state.sidebarPanel === "layers" && <VTTLayersPanel />}
        {state.sidebarPanel === "tokens" && <VTTTokenPanel />}
        {state.sidebarPanel === "characters" && <VTTCharacterImport />}
        {state.sidebarPanel === "drawing" && <VTTDrawingPanel />}
        {state.sidebarPanel === "audio" && <VTTAudioMixer />}
        {state.sidebarPanel === "effects" && <VTTEffectsPanel />}
        {state.sidebarPanel === "scenes" && <VTTScenePresets />}
        {state.sidebarPanel === "initiative" && <VTTInitiativePanel />}
        {state.sidebarPanel === "clocks" && <VTTClocksPanel />}
        {state.sidebarPanel === "handouts" && <VTTHandoutsPanel />}
        {state.sidebarPanel === "aoe" && <VTTAoEPanel />}
        {state.sidebarPanel === "fog" && <VTTFogPanel />}
        {state.sidebarPanel === "lighting" && <VTTLightingPanel />}
        {state.sidebarPanel === "dice" && <VTTDiceRoller />}
        {state.sidebarPanel === "settings" && <VTTSettingsPanel />}
      </div>
    </div>
  );
}
