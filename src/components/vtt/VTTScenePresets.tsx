import { useVTT } from "@/contexts/VTTContext";
import { weatherPresets, type WeatherPresetName } from "@/lib/vtt/weatherPresets";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ScenePreset {
  id: string;
  name: string;
  description: string;
  particles: { preset: WeatherPresetName } & Record<string, unknown>;
  fog?: { enabled: boolean; opacity: number; color: string };
  gridColor?: string;
}

const SCENE_PRESETS: ScenePreset[] = [
  {
    id: "clear",
    name: "Clear",
    description: "No effects, clean map view",
    particles: { preset: "none" as WeatherPresetName },
  },
  {
    id: "rainstorm",
    name: "Rainstorm",
    description: "Heavy rain with dim lighting",
    particles: { preset: "rain" as WeatherPresetName },
    fog: { enabled: true, opacity: 0.3, color: "#0a0a1a" },
  },
  {
    id: "blizzard",
    name: "Blizzard",
    description: "Dense snowfall with white fog",
    particles: { preset: "snow" as WeatherPresetName },
    fog: { enabled: true, opacity: 0.25, color: "#1a1a2e" },
  },
  {
    id: "dungeon",
    name: "Dark Dungeon",
    description: "Thick fog, no particles",
    particles: { preset: "none" as WeatherPresetName },
    fog: { enabled: true, opacity: 0.9, color: "#000000" },
    gridColor: "#33333366",
  },
  {
    id: "volcanic",
    name: "Volcanic",
    description: "Glowing embers and ash",
    particles: { preset: "embers" as WeatherPresetName },
    fog: { enabled: true, opacity: 0.2, color: "#1a0500" },
  },
  {
    id: "sandstorm",
    name: "Sandstorm",
    description: "Dust and low visibility",
    particles: { preset: "dust" as WeatherPresetName },
    fog: { enabled: true, opacity: 0.35, color: "#1a1500" },
  },
  {
    id: "misty-forest",
    name: "Misty Forest",
    description: "Light fog drifting through",
    particles: { preset: "fog" as WeatherPresetName },
    fog: { enabled: true, opacity: 0.15, color: "#0a1a0a" },
    gridColor: "#00ff0015",
  },
  {
    id: "space",
    name: "Deep Space",
    description: "Starfield particles, dark void",
    particles: {
      preset: "custom" as WeatherPresetName,
    },
    fog: { enabled: false, opacity: 0, color: "#000000" },
    gridColor: "#ffffff08",
  },
  {
    id: "ashfall",
    name: "Ashfall",
    description: "Drifting ash with gray haze",
    particles: { preset: "ash" as WeatherPresetName },
    fog: { enabled: true, opacity: 0.2, color: "#1a1a1a" },
  },
];

// Custom particle config for "space" starfield
const SPACE_PARTICLES = {
  preset: "custom" as const,
  count: 80,
  speed: 0.2,
  size: 1.5,
  color: "#ffffff",
  opacity: 0.8,
  wind: 0,
  gravity: 0,
  enabled: true,
};

export default function VTTScenePresets() {
  const { state, dispatch, activeMap } = useVTT();

  const applyPreset = (preset: ScenePreset) => {
    // Apply particles
    if (preset.id === "space") {
      dispatch({ type: "SET_PARTICLES", payload: SPACE_PARTICLES });
    } else if (preset.particles.preset === "none") {
      dispatch({
        type: "SET_PARTICLES",
        payload: { preset: "none", enabled: false },
      });
    } else {
      const particleConfig =
        weatherPresets[preset.particles.preset as WeatherPresetName];
      if (particleConfig) {
        dispatch({
          type: "SET_PARTICLES",
          payload: {
            ...particleConfig,
            preset: preset.particles.preset,
            enabled: true,
          },
        });
      }
    }

    // Apply fog if map is active
    if (activeMap && preset.fog) {
      dispatch({
        type: "UPDATE_FOG",
        payload: {
          mapId: activeMap.id,
          fog: preset.fog,
        },
      });
    }

    // Apply grid color if specified
    if (activeMap && preset.gridColor) {
      dispatch({
        type: "UPDATE_MAP",
        payload: {
          id: activeMap.id,
          updates: {
            grid: { ...activeMap.grid, color: preset.gridColor },
          },
        },
      });
    }

    toast.success(`Applied "${preset.name}" scene`);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 space-y-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles size={12} className="text-terminal-primary/50" />
        <span className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono">
          Quick Scene Presets
        </span>
      </div>

      <div className="text-[10px] text-terminal-primary/30 font-mono">
        Apply atmosphere presets to quickly set up weather, fog, and grid.
      </div>

      <div className="space-y-1.5">
        {SCENE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            className="w-full text-left p-2 rounded border border-terminal-border/20 hover:border-terminal-primary/40 hover:bg-terminal-primary/5 transition-colors group"
          >
            <div className="text-xs font-mono text-terminal-primary/70 group-hover:text-terminal-primary transition-colors">
              {preset.name}
            </div>
            <div className="text-[10px] font-mono text-terminal-primary/30 mt-0.5">
              {preset.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
