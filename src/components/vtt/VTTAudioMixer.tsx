import { useVTT } from "@/contexts/VTTContext";
import { useVTTAudioApi } from "@/contexts/VTTAudioContext";
import type { AmbientSlot, AmbientTrack, CustomLibraryTrack } from "@/types/vtt";
import {
  Volume2,
  VolumeX,
  Upload,
  Play,
  Pause,
  Square,
  Trash2,
  ListMusic,
  Save,
  Library,
  ChevronDown,
  ChevronRight,
  Music,
  Zap,
  Plus,
} from "lucide-react";
import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { toast } from "sonner";
import { dbHelpers } from "@/lib/supabase";

// Built-in sound library catalog — organized from public/audio/
const LIBRARY_TRACKS = [
  { category: "Ambient", name: "Terminal Hum", path: "/audio/terminal-hum.mp3" },
  { category: "Ambient", name: "Server Room", path: "/audio/server-room.mp3" },
  { category: "Ambient", name: "Static Hum", path: "/audio/static-hum.mp3" },
  { category: "Music", name: "Rebel Radio", path: "/audio/SCRebelRadio.mp3" },
  { category: "Music", name: "Wolf Audio 1", path: "/audio/WolfAudioFile1.mp3" },
  { category: "Music", name: "Wolf Audio 2", path: "/audio/WolfAudioFile2.mp3" },
  { category: "Music", name: "Wolf Audio 3", path: "/audio/WolfAudioFile3.mp3" },
  { category: "Music", name: "Wolf Audio 4", path: "/audio/WolfAudioFile4.mp3" },
  { category: "Music", name: "Wolf Audio 5", path: "/audio/WolfAudioFile5.mp3" },
  { category: "Music", name: "Wolf Audio 6", path: "/audio/WolfAudioFile6.mp3" },
  { category: "SFX", name: "Mechanical Key", path: "/audio/mechanical-key.mp3" },
  { category: "SFX", name: "Glitch Sound", path: "/audio/glitch-sound.mp3" },
  { category: "SFX", name: "Error Buzz", path: "/audio/error-buzz.mp3" },
  { category: "SFX", name: "Warning Beep", path: "/audio/warning-beep.mp3" },
  { category: "SFX", name: "Success Chime", path: "/audio/success-chime.mp3" },
  { category: "SFX", name: "Typing Sound", path: "/audio/typing-sound.mp3" },
  { category: "SFX", name: "Electrical Sparks", path: "/audio/electrical-sparks.mp3" },
  { category: "SFX", name: "Signal Interference", path: "/audio/signal-interference.mp3" },
  { category: "SFX", name: "Connection Lost", path: "/audio/connection-lost.mp3" },
  { category: "SFX", name: "Data Corruption", path: "/audio/data-corruption.mp3" },
  { category: "Story", name: "Seren's Last Message", path: "/audio/serens_last_message.mp3" },
  { category: "Story", name: "Tobia Welcome", path: "/audio/tobia-jashu01-welcome.mp3" },
];

const AMBIENT_SLOTS: AmbientSlot[] = ["A", "B", "C", "D"];
const SLOT_COLORS: Record<AmbientSlot, string> = {
  A: "accent-green-500",
  B: "accent-cyan-500",
  C: "accent-amber-500",
  D: "accent-purple-500",
};
const SLOT_LABEL_COLORS: Record<AmbientSlot, string> = {
  A: "text-green-400/70",
  B: "text-cyan-400/70",
  C: "text-amber-400/70",
  D: "text-purple-400/70",
};

type MixerSection = "channels" | "library" | "playlists" | "sfx";

export default function VTTAudioMixer() {
  const { state, dispatch, saveSession } = useVTT();
  const audio = useVTTAudioApi();
  const visualizerRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [visualizerActive, setVisualizerActive] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<MixerSection, boolean>>({
    channels: true,
    library: false,
    playlists: false,
    sfx: true,
  });
  const [libraryFilter, setLibraryFilter] = useState<string>("all");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [libraryTargetSlot, setLibraryTargetSlot] = useState<AmbientSlot>("A");
  const [playingSFXSlots, setPlayingSFXSlots] = useState<Set<number>>(new Set());

  const toggleSection = (section: MixerSection) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

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
      const hue = 120;
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

  const handleLoadAmbient = (slot: AmbientSlot) => {
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

  const handlePlaySFX = useCallback((index: number) => {
    audio.playSFX(index);
    setPlayingSFXSlots((prev) => new Set(prev).add(index));
    setTimeout(() => {
      setPlayingSFXSlots((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }, 3000);
  }, [audio]);

  const getTrack = (slot: AmbientSlot): AmbientTrack | null => {
    return state.audio[`ambient${slot}` as keyof typeof state.audio] as AmbientTrack | null;
  };

  // Merge built-in and custom library tracks
  const allLibraryTracks = useMemo(() => {
    const builtIn = LIBRARY_TRACKS.map((t) => ({
      ...t,
      id: t.path,
      isCustom: false as const,
    }));
    const custom = (state.audio.customLibraryTracks || []).map((t) => ({
      name: t.name,
      category: t.category,
      path: t.url,
      id: t.id,
      isCustom: true as const,
    }));
    return [...builtIn, ...custom].sort((a, b) => {
      // Sort by category first, then name
      const catCmp = a.category.localeCompare(b.category);
      if (catCmp !== 0) return catCmp;
      return a.name.localeCompare(b.name);
    });
  }, [state.audio.customLibraryTracks]);

  const categories = [...new Set(allLibraryTracks.map((t) => t.category))];
  const filteredLibrary =
    libraryFilter === "all"
      ? allLibraryTracks
      : allLibraryTracks.filter((t) => t.category === libraryFilter);

  const [addingCustomTrack, setAddingCustomTrack] = useState(false);
  const [customTrackCategory, setCustomTrackCategory] = useState<CustomLibraryTrack["category"]>("Music");
  const [isUploadingCustom, setIsUploadingCustom] = useState(false);

  const handleAddCustomTrack = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsUploadingCustom(true);
      const trackId = crypto.randomUUID();

      try {
        // Upload to Supabase Storage — don't fall back to blob URLs
        // (blob URLs can't survive a page reload)
        const url = await dbHelpers.uploadVTTAudioFile(file, trackId);

        if (!url) {
          toast.error("Failed to upload audio file. Check your connection and try again.");
          return;
        }

        const track: CustomLibraryTrack = {
          id: trackId,
          name: file.name.replace(/\.[^/.]+$/, ""),
          url,
          category: customTrackCategory,
        };

        dispatch({ type: "ADD_CUSTOM_LIBRARY_TRACK", payload: track });
        setTimeout(() => saveSession(), 100);
        toast.success(`"${track.name}" added to library`);
        setAddingCustomTrack(false);
      } catch {
        toast.error("Failed to upload audio file. Check your connection and try again.");
      } finally {
        setIsUploadingCustom(false);
      }
    };
    input.click();
  };

  const handleRemoveCustomTrack = async (trackId: string) => {
    dispatch({ type: "REMOVE_CUSTOM_LIBRARY_TRACK", payload: trackId });
    setTimeout(() => saveSession(), 100);
    dbHelpers.deleteVTTAudioFile(trackId).catch(() => {});
    toast.success("Track removed from library");
  };

  // SFX keyboard hotkeys
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only fire when no input is focused
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const key = e.key;
      if (key >= "1" && key <= "9") {
        const index = parseInt(key, 10) - 1;
        const slot = state.audio.sfxSlots[index];
        if (slot?.url || slot?.name) {
          e.preventDefault();
          handlePlaySFX(index);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.audio.sfxSlots, handlePlaySFX]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Master Volume */}
      <div className="vtt-panel-section">
        <div className="flex items-center justify-between mb-1.5">
          <label className="vtt-section-label">
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
            {state.audio.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
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
          className="vtt-slider"
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

      {/* ═══════════════ AMBIENT CHANNELS ═══════════════ */}
      <SectionHeader
        label="Ambient Channels"
        icon={<Music size={11} />}
        expanded={expandedSections.channels}
        onToggle={() => toggleSection("channels")}
        count={AMBIENT_SLOTS.filter((s) => getTrack(s)).length}
      />
      {expandedSections.channels && (
        <div className="border-b border-terminal-border/30">
          {AMBIENT_SLOTS.map((slot) => {
            const track = getTrack(slot);
            return (
              <div
                key={slot}
                className="p-2 border-b border-terminal-border/10 last:border-b-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <label
                    className={`vtt-section-label ${SLOT_LABEL_COLORS[slot]}`}
                  >
                    Channel {slot}
                  </label>
                  <div className="flex gap-0.5">
                    <button
                      onClick={() => audio.playAmbient(slot)}
                      className="p-1 text-terminal-primary/40 hover:text-terminal-primary"
                      title="Play"
                    >
                      <Play size={10} />
                    </button>
                    <button
                      onClick={() => audio.pauseAmbient(slot)}
                      className="p-1 text-terminal-primary/40 hover:text-terminal-primary"
                      title="Pause"
                    >
                      <Pause size={10} />
                    </button>
                    <button
                      onClick={() => audio.stopAmbient(slot)}
                      className="p-1 text-terminal-primary/40 hover:text-terminal-primary"
                      title="Stop"
                    >
                      <Square size={10} />
                    </button>
                    {track && (
                      <button
                        onClick={() => audio.removeAmbient(slot)}
                        className="p-1 text-terminal-primary/40 hover:text-red-400"
                        title="Remove track"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                </div>
                {track ? (
                  <>
                    <div className="text-[10px] text-terminal-primary/60 font-mono truncate mb-1">
                      {track.name}
                      {track.isLibrary && (
                        <span className="ml-1 text-[8px] text-terminal-primary/30">
                          [library]
                        </span>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1">
                        <label className="text-[8px] text-terminal-primary/30 font-mono w-6">
                          Vol
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={track.volume}
                          onChange={(e) =>
                            dispatch({
                              type: "SET_AMBIENT_TRACK",
                              payload: {
                                slot,
                                track: {
                                  ...track,
                                  volume: parseFloat(e.target.value),
                                },
                              },
                            })
                          }
                          className={`vtt-slider flex-1 ${SLOT_COLORS[slot]}`}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="text-[8px] text-terminal-primary/30 font-mono w-6">
                          Pan
                        </label>
                        <input
                          type="range"
                          min={-1}
                          max={1}
                          step={0.01}
                          value={track.pan}
                          onChange={(e) =>
                            dispatch({
                              type: "SET_AMBIENT_TRACK",
                              payload: {
                                slot,
                                track: {
                                  ...track,
                                  pan: parseFloat(e.target.value),
                                },
                              },
                            })
                          }
                          className={`vtt-slider flex-1 ${SLOT_COLORS[slot]}`}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => handleLoadAmbient(slot)}
                    className="vtt-btn secondary w-full justify-center border-dashed"
                  >
                    <Upload size={9} /> Load file
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════ SOUND LIBRARY ═══════════════ */}
      <SectionHeader
        label="Sound Library"
        icon={<Library size={11} />}
        expanded={expandedSections.library}
        onToggle={() => toggleSection("library")}
        count={allLibraryTracks.length}
      />
      {expandedSections.library && (
        <div className="border-b border-terminal-border/30">
          {/* Target slot selector */}
          <div className="px-3 pt-2 pb-1 flex items-center gap-1">
            <span className="text-[9px] text-terminal-primary/40 font-mono">
              Load to:
            </span>
            {AMBIENT_SLOTS.map((slot) => (
              <button
                key={slot}
                onClick={() => setLibraryTargetSlot(slot)}
                className={`vtt-option px-1.5 py-0.5 text-[9px] ${
                  libraryTargetSlot === slot
                    ? `vtt-option--active ${SLOT_LABEL_COLORS[slot]} border-current bg-current/10`
                    : ""
                }`}
              >
                {slot}
              </button>
            ))}
          </div>

          {/* Category filter + Add button */}
          <div className="px-3 py-1 flex gap-1 flex-wrap items-center">
            <FilterPill
              label="All"
              active={libraryFilter === "all"}
              onClick={() => setLibraryFilter("all")}
            />
            {categories.map((cat) => (
              <FilterPill
                key={cat}
                label={cat}
                active={libraryFilter === cat}
                onClick={() => setLibraryFilter(cat)}
              />
            ))}
            <button
              onClick={() => setAddingCustomTrack(!addingCustomTrack)}
              className="ml-auto p-0.5 text-terminal-primary/40 hover:text-terminal-primary transition-colors"
              title="Add custom track to library"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Add custom track form */}
          {addingCustomTrack && (
            <div className="px-3 pb-2 space-y-1.5">
              <div className="flex gap-1 items-center">
                <span className="text-[9px] text-terminal-primary/40 font-mono">Type:</span>
                {(["Ambient", "Music", "SFX", "Story"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCustomTrackCategory(cat)}
                    className={`vtt-option px-1.5 py-0.5 text-[8px] ${
                      customTrackCategory === cat ? "vtt-option--active" : ""
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAddCustomTrack}
                disabled={isUploadingCustom}
                className="vtt-btn secondary w-full justify-center"
              >
                <Upload size={9} />
                {isUploadingCustom ? "Uploading..." : "Upload Audio File"}
              </button>
            </div>
          )}

          {/* Track list */}
          <div className="max-h-48 overflow-y-auto px-2 pb-2 space-y-0.5">
            {filteredLibrary.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between px-2 py-1 rounded hover:bg-terminal-primary/5 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-terminal-primary/70 font-mono truncate">
                    {track.name}
                    {track.isCustom && (
                      <span className="ml-1 text-[8px] text-cyan-400/40">[custom]</span>
                    )}
                  </div>
                  <div className="text-[8px] text-terminal-primary/30 font-mono">
                    {track.category}
                  </div>
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      audio.loadLibraryTrack(
                        libraryTargetSlot,
                        track.path,
                        track.name
                      );
                      setVisualizerActive(true);
                      toast.success(
                        `"${track.name}" → Channel ${libraryTargetSlot}`
                      );
                    }}
                    className={`px-1.5 py-0.5 text-[8px] font-mono rounded border border-terminal-primary/20 ${SLOT_LABEL_COLORS[libraryTargetSlot]} hover:bg-terminal-primary/10 transition-colors`}
                    title={`Load into Channel ${libraryTargetSlot}`}
                  >
                    → {libraryTargetSlot}
                  </button>
                  {track.category === "SFX" && (
                    <button
                      onClick={() => {
                        const emptySlot = state.audio.sfxSlots.findIndex(
                          (s) => !s.url && !s.name
                        );
                        const idx = emptySlot >= 0 ? emptySlot : 0;
                        audio.loadLibrarySFX(idx, track.path, track.name);
                        toast.success(`"${track.name}" → SFX Slot ${idx + 1}`);
                      }}
                      className="px-1.5 py-0.5 text-[8px] font-mono rounded border border-terminal-primary/20 text-yellow-400/70 hover:bg-yellow-500/10 transition-colors"
                      title="Add to SFX Soundboard"
                    >
                      SFX
                    </button>
                  )}
                  {track.isCustom && (
                    <button
                      onClick={() => handleRemoveCustomTrack(track.id)}
                      className="p-0.5 text-terminal-primary/30 hover:text-red-400 transition-colors"
                      title="Remove from library"
                    >
                      <Trash2 size={8} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════ PLAYLISTS ═══════════════ */}
      <SectionHeader
        label="Playlists"
        icon={<ListMusic size={11} />}
        expanded={expandedSections.playlists}
        onToggle={() => toggleSection("playlists")}
        count={(state.audio.playlists || []).length}
      />
      {expandedSections.playlists && (
        <div className="p-2 border-b border-terminal-border/30 space-y-1.5">
          {/* Save current as playlist */}
          <div className="flex gap-1">
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newPlaylistName.trim()) {
                  audio.saveAsPlaylist(newPlaylistName.trim());
                  setNewPlaylistName("");
                  toast.success("Playlist saved");
                }
              }}
              placeholder="Save current as..."
              className="vtt-input flex-1"
            />
            <button
              onClick={() => {
                if (newPlaylistName.trim()) {
                  audio.saveAsPlaylist(newPlaylistName.trim());
                  setNewPlaylistName("");
                  toast.success("Playlist saved");
                }
              }}
              disabled={!newPlaylistName.trim()}
              className="p-1 text-terminal-primary/40 hover:text-terminal-primary disabled:opacity-20 transition-colors"
              title="Save playlist"
            >
              <Save size={12} />
            </button>
          </div>

          {/* Playlist list */}
          {(state.audio.playlists || []).length === 0 ? (
            <div className="vtt-empty py-3">
              No playlists yet. Load tracks into channels, then save as a playlist.
            </div>
          ) : (
            (state.audio.playlists || []).map((playlist) => (
              <div
                key={playlist.id}
                className={`vtt-list-item justify-between ${
                  state.audio.activePlaylistId === playlist.id
                    ? "vtt-list-item--active"
                    : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-terminal-primary font-mono truncate">
                    {playlist.name}
                  </div>
                  <div className="text-[8px] text-terminal-primary/30 font-mono">
                    {AMBIENT_SLOTS.filter((s) => playlist.channels[s]).length} channels
                  </div>
                </div>
                <div className="flex gap-0.5">
                  <button
                    onClick={() => {
                      audio.activatePlaylist(playlist.id);
                      setVisualizerActive(true);
                      toast.success(`Playlist "${playlist.name}" activated`);
                    }}
                    className="p-1 text-terminal-primary/40 hover:text-green-400 transition-colors"
                    title="Activate playlist"
                  >
                    <Play size={10} />
                  </button>
                  <button
                    onClick={() =>
                      dispatch({
                        type: "REMOVE_PLAYLIST",
                        payload: playlist.id,
                      })
                    }
                    className="p-1 text-terminal-primary/40 hover:text-red-400 transition-colors"
                    title="Delete playlist"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ═══════════════ SFX SOUNDBOARD ═══════════════ */}
      <SectionHeader
        label="SFX Soundboard"
        icon={<Zap size={11} />}
        expanded={expandedSections.sfx}
        onToggle={() => toggleSection("sfx")}
        count={state.audio.sfxSlots.filter((s) => s.url || s.name).length}
      />
      {expandedSections.sfx && (
        <div className="p-2">
          <div className="text-[8px] text-terminal-primary/25 font-mono mb-1.5">
            Press 1-9 to trigger first 9 slots
          </div>
          <div className="grid grid-cols-3 gap-1">
            {state.audio.sfxSlots.slice(0, 18).map((slot, i) => (
              <div
                key={i}
                className={`relative group rounded border text-center py-1.5 px-1 cursor-pointer transition-all ${
                  playingSFXSlots.has(i)
                    ? "border-green-500/50 bg-green-500/10 shadow-[0_0_8px_rgba(34,197,94,0.2)]"
                    : slot.url || slot.name
                    ? "border-terminal-primary/30 bg-terminal-primary/5 hover:bg-terminal-primary/15"
                    : "border-terminal-border/20 hover:border-terminal-border/40"
                }`}
                onClick={() =>
                  slot.url || slot.name ? handlePlaySFX(i) : handleLoadSFX(i)
                }
              >
                {/* Hotkey badge */}
                {i < 9 && (slot.url || slot.name) && (
                  <span className="absolute top-0.5 left-0.5 text-[7px] text-terminal-primary/20 font-mono">
                    {i + 1}
                  </span>
                )}
                <div className="text-[9px] font-mono text-terminal-primary/60 truncate">
                  {slot.name || `Slot ${i + 1}`}
                </div>
                {/* Per-slot volume */}
                {(slot.url || slot.name) && (
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={slot.volume}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      dispatch({
                        type: "SET_SFX_SLOT",
                        payload: {
                          index: i,
                          slot: { volume: parseFloat(e.target.value) },
                        },
                      });
                    }}
                    className="vtt-slider w-full accent-yellow-500 h-0.5 mt-0.5"
                  />
                )}
                {(slot.url || slot.name) && (
                  <div className="absolute top-0 right-0 flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        audio.stopSFX(i);
                        setPlayingSFXSlots((prev) => {
                          const next = new Set(prev);
                          next.delete(i);
                          return next;
                        });
                      }}
                      className="p-0.5 text-terminal-primary/40 hover:text-terminal-primary"
                      title="Stop"
                    >
                      <Square size={7} />
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
                      <Trash2 size={7} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {state.audio.sfxSlots.some((s) => s.url || s.name) && (
            <button
              onClick={() => {
                audio.stopAllSFX();
                setPlayingSFXSlots(new Set());
              }}
              className="vtt-btn danger w-full justify-center mt-2"
            >
              Stop All SFX
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function SectionHeader({
  label,
  icon,
  expanded,
  onToggle,
  count,
}: {
  label: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 w-full px-3 py-2 border-b border-terminal-border/20 hover:bg-terminal-primary/5 transition-colors text-left"
    >
      {expanded ? (
        <ChevronDown size={10} className="text-terminal-primary/40" />
      ) : (
        <ChevronRight size={10} className="text-terminal-primary/40" />
      )}
      <span className="text-terminal-primary/40">{icon}</span>
      <span className="vtt-section-label flex-1">
        {label}
      </span>
      {count !== undefined && count > 0 && (
        <span className="text-[9px] text-terminal-primary/30 font-mono">
          {count}
        </span>
      )}
    </button>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`vtt-option px-1.5 py-0.5 text-[9px] ${active ? "vtt-option--active" : ""}`}
    >
      {label}
    </button>
  );
}
