import { useVTT } from "@/contexts/VTTContext";
import { weatherPresets, type WeatherPresetName } from "@/lib/vtt/weatherPresets";
import type { WeatherPreset } from "@/types/vtt";

const PRESETS: { id: WeatherPreset; label: string }[] = [
  { id: "none", label: "None" },
  { id: "rain", label: "Rain" },
  { id: "snow", label: "Snow" },
  { id: "dust", label: "Dust" },
  { id: "embers", label: "Embers" },
  { id: "fog", label: "Fog" },
  { id: "ash", label: "Ash" },
  { id: "custom", label: "Custom" },
];

export default function VTTEffectsPanel() {
  const { state, dispatch } = useVTT();
  const p = state.particles;

  const applyPreset = (preset: WeatherPreset) => {
    if (preset === "none") {
      dispatch({ type: "SET_PARTICLES", payload: { preset: "none", enabled: false } });
      return;
    }
    if (preset === "custom") {
      dispatch({ type: "SET_PARTICLES", payload: { preset: "custom", enabled: true } });
      return;
    }
    const config = weatherPresets[preset as WeatherPresetName];
    dispatch({
      type: "SET_PARTICLES",
      payload: { ...config, preset, enabled: true },
    });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 space-y-4">
      {/* Presets */}
      <div>
        <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-1.5">
          Weather Preset
        </label>
        <div className="grid grid-cols-2 gap-1">
          {PRESETS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => applyPreset(id)}
              className={`text-xs font-mono py-1.5 rounded border transition-colors ${
                p.preset === id
                  ? "bg-terminal-primary/20 border-terminal-primary/50 text-terminal-primary"
                  : "border-terminal-border/30 text-terminal-primary/40 hover:text-terminal-primary/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Enabled toggle */}
      <label className="flex items-center gap-2 text-xs text-terminal-primary/60 font-mono cursor-pointer">
        <input
          type="checkbox"
          checked={p.enabled}
          onChange={(e) =>
            dispatch({
              type: "SET_PARTICLES",
              payload: { enabled: e.target.checked },
            })
          }
          className="accent-green-500"
        />
        Particles Active
      </label>

      {/* Sliders */}
      <SliderControl
        label="Count"
        value={p.count}
        min={1}
        max={500}
        step={1}
        onChange={(v) =>
          dispatch({ type: "SET_PARTICLES", payload: { count: v } })
        }
      />
      <SliderControl
        label="Speed"
        value={p.speed}
        min={0}
        max={10}
        step={0.1}
        onChange={(v) =>
          dispatch({ type: "SET_PARTICLES", payload: { speed: v } })
        }
      />
      <SliderControl
        label="Size"
        value={p.size}
        min={1}
        max={30}
        step={0.5}
        onChange={(v) =>
          dispatch({ type: "SET_PARTICLES", payload: { size: v } })
        }
      />
      <SliderControl
        label="Opacity"
        value={p.opacity}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) =>
          dispatch({ type: "SET_PARTICLES", payload: { opacity: v } })
        }
      />
      <SliderControl
        label="Wind"
        value={p.wind}
        min={-5}
        max={5}
        step={0.1}
        onChange={(v) =>
          dispatch({ type: "SET_PARTICLES", payload: { wind: v } })
        }
      />
      <SliderControl
        label="Gravity"
        value={p.gravity}
        min={-3}
        max={5}
        step={0.1}
        onChange={(v) =>
          dispatch({ type: "SET_PARTICLES", payload: { gravity: v } })
        }
      />

      {/* Color */}
      <div>
        <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-1">
          Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={p.color}
            onChange={(e) =>
              dispatch({
                type: "SET_PARTICLES",
                payload: { color: e.target.value },
              })
            }
            className="w-8 h-6 rounded border border-terminal-border/30 bg-transparent cursor-pointer"
          />
          <span className="text-[10px] text-terminal-primary/40 font-mono">
            {p.color}
          </span>
        </div>
      </div>
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono">
          {label}
        </label>
        <span className="text-[10px] text-terminal-primary/40 font-mono">
          {typeof value === "number" ? value.toFixed(step < 1 ? 1 : 0) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-green-500 h-1"
      />
    </div>
  );
}
