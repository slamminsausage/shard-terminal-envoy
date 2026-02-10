import { useVTT } from "@/contexts/VTTContext";
import { useVTTAudioApi } from "@/contexts/VTTAudioContext";
import {
  Volume2,
  VolumeX,
  Upload,
  Play,
  Pause,
  Square,
  Trash2,
} from "lucide-react";
import { useRef, useEffect, useCallback, useState } from "react";

export default function VTTAudioMixer() {
  const { state, dispatch } = useVTT();
  const audio = useVTTAudioApi();
  const visualizerRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [visualizerActive, setVisualizerActive] = useState(false);

  // Visualizer render loop
  const renderVisualizer = useCallback(() => {
    const canvas = visualizerRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const data = audio.getFrequencyData();
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (data.length === 0) {
      animRef.current = requestAnimationFrame(renderVisualizer);
      return;
    }

    const barWidth = w / data.length;
    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] / 255) * h;
      const hue = 120; // green
      ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${0.3 + (data[i] / 255) * 0.7})`;
      ctx.fillRect(i * barWidth, h - barHeight, barWidth - 1, barHeight);
    }

    animRef.current = requestAnimationFrame(renderVisualizer);
  }, [audio]);

  useEffect(() => {
    if (visualizerActive) {
      animRef.current = requestAnimationFrame(renderVisualizer);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [visualizerActive, renderVisualizer]);

  const handleLoadAmbient = (slot: "A" | "B") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        audio.loadAmbient(slot, file);
        setVisualizerActive(true);
      }
    };
    input.click();
  };

  const handleLoadSFX = (index: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) audio.loadSFX(index, file);
    };
    input.click();
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Master Volume */}
      <div className="p-3 border-b border-terminal-border/30">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono">
            Master
          </label>
          <button
            onClick={() =>
              dispatch({
                type: "SET_AUDIO",
                payload: { muted: !state.audio.muted },
              })
            }
            className="text-terminal-primary/50 hover:text-terminal-primary transition-colors"
          >
            {state.audio.muted ? (
              <VolumeX size={14} />
            ) : (
              <Volume2 size={14} />
            )}
          </button>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={state.audio.masterVolume}
          onChange={(e) =>
            dispatch({
              type: "SET_AUDIO",
              payload: { masterVolume: parseFloat(e.target.value) },
            })
          }
          className="w-full accent-green-500 h-1"
        />
      </div>

      {/* Visualizer */}
      <div className="px-3 pt-2">
        <canvas
          ref={visualizerRef}
          width={220}
          height={32}
          className="w-full h-8 rounded bg-terminal-bg-dark border border-terminal-border/20"
        />
      </div>

      {/* Ambient A */}
      <div className="p-3 border-b border-terminal-border/30">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono">
            Ambient A
          </label>
          <div className="flex gap-0.5">
            <button
              onClick={() => audio.playAmbient("A")}
              className="p-1 text-terminal-primary/40 hover:text-terminal-primary"
              title="Play"
            >
              <Play size={12} />
            </button>
            <button
              onClick={() => audio.pauseAmbient("A")}
              className="p-1 text-terminal-primary/40 hover:text-terminal-primary"
              title="Pause"
            >
              <Pause size={12} />
            </button>
            <button
              onClick={() => audio.stopAmbient("A")}
              className="p-1 text-terminal-primary/40 hover:text-red-400"
              title="Stop & Remove"
            >
              <Square size={12} />
            </button>
          </div>
        </div>
        {state.audio.ambientA ? (
          <div className="text-[10px] text-terminal-primary/60 font-mono truncate mb-1.5">
            {state.audio.ambientA.name}
          </div>
        ) : (
          <button
            onClick={() => handleLoadAmbient("A")}
            className="flex items-center gap-1 w-full px-2 py-1.5 text-[10px] font-mono border border-dashed border-terminal-border/30 rounded text-terminal-primary/40 hover:text-terminal-primary hover:border-terminal-primary/30 transition-colors"
          >
            <Upload size={10} /> Load audio file
          </button>
        )}
        {state.audio.ambientA && (
          <>
            <label className="text-[9px] text-terminal-primary/30 font-mono">
              Volume
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={state.audio.ambientA.volume}
              onChange={(e) =>
                dispatch({
                  type: "SET_AMBIENT_TRACK",
                  payload: {
                    slot: "A",
                    track: {
                      ...state.audio.ambientA!,
                      volume: parseFloat(e.target.value),
                    },
                  },
                })
              }
              className="w-full accent-green-500 h-1"
            />
            <label className="text-[9px] text-terminal-primary/30 font-mono mt-1">
              Pan
            </label>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.01}
              value={state.audio.ambientA.pan}
              onChange={(e) =>
                dispatch({
                  type: "SET_AMBIENT_TRACK",
                  payload: {
                    slot: "A",
                    track: {
                      ...state.audio.ambientA!,
                      pan: parseFloat(e.target.value),
                    },
                  },
                })
              }
              className="w-full accent-green-500 h-1"
            />
          </>
        )}
      </div>

      {/* Ambient B */}
      <div className="p-3 border-b border-terminal-border/30">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono">
            Ambient B
          </label>
          <div className="flex gap-0.5">
            <button
              onClick={() => audio.playAmbient("B")}
              className="p-1 text-terminal-primary/40 hover:text-terminal-primary"
            >
              <Play size={12} />
            </button>
            <button
              onClick={() => audio.pauseAmbient("B")}
              className="p-1 text-terminal-primary/40 hover:text-terminal-primary"
            >
              <Pause size={12} />
            </button>
            <button
              onClick={() => audio.stopAmbient("B")}
              className="p-1 text-terminal-primary/40 hover:text-red-400"
            >
              <Square size={12} />
            </button>
          </div>
        </div>
        {state.audio.ambientB ? (
          <div className="text-[10px] text-terminal-primary/60 font-mono truncate mb-1.5">
            {state.audio.ambientB.name}
          </div>
        ) : (
          <button
            onClick={() => handleLoadAmbient("B")}
            className="flex items-center gap-1 w-full px-2 py-1.5 text-[10px] font-mono border border-dashed border-terminal-border/30 rounded text-terminal-primary/40 hover:text-terminal-primary hover:border-terminal-primary/30 transition-colors"
          >
            <Upload size={10} /> Load audio file
          </button>
        )}
        {state.audio.ambientB && (
          <>
            <label className="text-[9px] text-terminal-primary/30 font-mono">
              Volume
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={state.audio.ambientB.volume}
              onChange={(e) =>
                dispatch({
                  type: "SET_AMBIENT_TRACK",
                  payload: {
                    slot: "B",
                    track: {
                      ...state.audio.ambientB!,
                      volume: parseFloat(e.target.value),
                    },
                  },
                })
              }
              className="w-full accent-green-500 h-1"
            />
            <label className="text-[9px] text-terminal-primary/30 font-mono mt-1">
              Pan
            </label>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.01}
              value={state.audio.ambientB.pan}
              onChange={(e) =>
                dispatch({
                  type: "SET_AMBIENT_TRACK",
                  payload: {
                    slot: "B",
                    track: {
                      ...state.audio.ambientB!,
                      pan: parseFloat(e.target.value),
                    },
                  },
                })
              }
              className="w-full accent-green-500 h-1"
            />
          </>
        )}
      </div>

      {/* Crossfade */}
      <div className="p-3 border-b border-terminal-border/30">
        <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-1">
          Crossfade A ↔ B
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={state.audio.crossfade}
          onChange={(e) =>
            dispatch({
              type: "SET_AUDIO",
              payload: { crossfade: parseFloat(e.target.value) },
            })
          }
          className="w-full accent-cyan-500 h-1"
        />
        <div className="flex justify-between text-[9px] text-terminal-primary/30 font-mono">
          <span>A</span>
          <span>B</span>
        </div>
      </div>

      {/* SFX Soundboard */}
      <div className="p-3">
        <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-2">
          SFX Soundboard
        </label>
        <div className="grid grid-cols-3 gap-1">
          {state.audio.sfxSlots.slice(0, 18).map((slot, i) => (
            <div
              key={i}
              className={`relative group rounded border text-center py-1.5 px-1 cursor-pointer transition-colors ${
                slot.url
                  ? "border-terminal-primary/30 bg-terminal-primary/5 hover:bg-terminal-primary/15"
                  : "border-terminal-border/20 hover:border-terminal-border/40"
              }`}
              onClick={() => (slot.url ? audio.playSFX(i) : handleLoadSFX(i))}
            >
              <div className="text-[9px] font-mono text-terminal-primary/60 truncate">
                {slot.name || `Slot ${i + 1}`}
              </div>
              {slot.url && (
                <div className="absolute top-0 right-0 flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      audio.stopSFX(i);
                    }}
                    className="p-0.5 text-terminal-primary/40 hover:text-terminal-primary"
                    title="Stop"
                  >
                    <Square size={8} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({
                        type: "SET_SFX_SLOT",
                        payload: {
                          index: i,
                          slot: { name: "", url: "" },
                        },
                      });
                    }}
                    className="p-0.5 text-terminal-primary/40 hover:text-red-400"
                    title="Remove"
                  >
                    <Trash2 size={8} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        {state.audio.sfxSlots.some((s) => s.url) && (
          <button
            onClick={audio.stopAllSFX}
            className="w-full mt-2 px-2 py-1 text-[10px] font-mono rounded border border-red-500/30 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Stop All SFX
          </button>
        )}
      </div>
    </div>
  );
}
