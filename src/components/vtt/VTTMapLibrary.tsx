import { useState, useRef } from "react";
import { Plus, Trash2, Upload, ImageIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useVTT } from "@/contexts/VTTContext";
import { toast } from "sonner";

const SIZE_PRESETS = [
  { label: "Standard (1920×1080)", w: 1920, h: 1080 },
  { label: "Large (2560×1440)", w: 2560, h: 1440 },
  { label: "Huge (3840×2160)", w: 3840, h: 2160 },
  { label: "Square (2000×2000)", w: 2000, h: 2000 },
] as const;

export default function VTTMapLibrary() {
  const { state, dispatch, addMap, loadMapImage } = useVTT();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMapName, setNewMapName] = useState("");
  const [canvasWidth, setCanvasWidth] = useState(1920);
  const [canvasHeight, setCanvasHeight] = useState(1080);
  const [gridStyle, setGridStyle] = useState<"square" | "hex">("square");
  const [gridSize, setGridSize] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingMapId, setLoadingMapId] = useState<string | null>(null);

  const handleAddMap = () => {
    const name = newMapName.trim() || `Map ${state.maps.length + 1}`;
    const map = addMap(name);

    // Apply chosen settings
    dispatch({
      type: "SET_CANVAS_SIZE",
      payload: { mapId: map.id, width: canvasWidth, height: canvasHeight },
    });
    dispatch({
      type: "UPDATE_MAP",
      payload: {
        id: map.id,
        updates: {
          grid: {
            enabled: true,
            size: gridSize,
            color: "#3ae2b3",
            opacity: 0.15,
            snap: true,
            style: gridStyle,
          },
        },
      },
    });

    setNewMapName("");
    setShowCreateForm(false);
    toast.success(`Map "${name}" created`);
  };

  const handleLoadImage = async (mapId: string, file: File) => {
    setLoadingMapId(mapId);
    try {
      await loadMapImage(mapId, file);
      toast.success("Map image loaded from local file");
    } catch {
      toast.error("Failed to load image");
    } finally {
      setLoadingMapId(null);
    }
  };

  const handleFileSelect = (mapId: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/mp4,video/webm";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleLoadImage(mapId, file);
    };
    input.click();
  };

  const handleDeleteMap = (mapId: string) => {
    const map = state.maps.find((m) => m.id === mapId);
    // Clean up video objectURL to prevent memory leak
    if (map?.isVideo && map.imageDataUrl) {
      URL.revokeObjectURL(map.imageDataUrl);
    }
    dispatch({ type: "REMOVE_MAP", payload: mapId });
    if (state.activeMapId === mapId) {
      const next = state.maps.find((m) => m.id !== mapId);
      if (next) dispatch({ type: "SET_ACTIVE_MAP", payload: next.id });
    }
    toast.success(`Map "${map?.name}" deleted`);
  };

  const applyPreset = (w: number, h: number) => {
    setCanvasWidth(w);
    setCanvasHeight(h);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="vtt-panel-section">
        <h3 className="text-terminal-primary text-sm font-mono mb-2 uppercase tracking-wider">
          Map Library
        </h3>

        {/* Toggle create form */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="vtt-btn w-full justify-between"
        >
          <span className="flex items-center gap-1.5">
            <Plus size={12} />
            New Map
          </span>
          {showCreateForm ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {/* Expandable creation form */}
        {showCreateForm && (
          <div className="mt-2 space-y-2.5 p-2 rounded border border-terminal-border/20 bg-terminal-bg-dark/50">
            {/* Map name */}
            <div>
              <label className="vtt-section-label block mb-0.5">
                Name
              </label>
              <input
                type="text"
                value={newMapName}
                onChange={(e) => setNewMapName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddMap()}
                placeholder="Map name..."
                className="vtt-input w-full"
              />
            </div>

            {/* Canvas size presets */}
            <div>
              <label className="vtt-section-label block mb-1">
                Canvas Size
              </label>
              <div className="grid grid-cols-2 gap-1 mb-1.5">
                {SIZE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset.w, preset.h)}
                    className={`vtt-option text-[10px] ${
                      canvasWidth === preset.w && canvasHeight === preset.h
                        ? "vtt-option--active"
                        : ""
                    }`}
                  >
                    {preset.w}×{preset.h}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                <div className="flex-1">
                  <label className="text-[10px] text-terminal-primary/30 font-mono block mb-0.5">
                    W
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={10000}
                    step={100}
                    value={canvasWidth}
                    onChange={(e) => setCanvasWidth(Math.max(100, parseInt(e.target.value, 10) || 1920))}
                    className="vtt-input w-full text-[10px] text-center"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-terminal-primary/30 font-mono block mb-0.5">
                    H
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={10000}
                    step={100}
                    value={canvasHeight}
                    onChange={(e) => setCanvasHeight(Math.max(100, parseInt(e.target.value, 10) || 1080))}
                    className="vtt-input w-full text-[10px] text-center"
                  />
                </div>
              </div>
              <div className="text-[9px] text-terminal-primary/25 font-mono mt-0.5 text-center">
                {Math.round(canvasWidth / gridSize)}×{Math.round(canvasHeight / gridSize)} cells
              </div>
            </div>

            {/* Grid style */}
            <div>
              <label className="vtt-section-label block mb-1">
                Grid Style
              </label>
              <div className="flex gap-1">
                {(["square", "hex"] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setGridStyle(style)}
                    className={`vtt-option flex-1 capitalize ${
                      gridStyle === style
                        ? "vtt-option--active"
                        : ""
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid size */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="vtt-section-label">
                  Cell Size
                </label>
                <span className="text-[10px] text-terminal-primary/40 font-mono">
                  {gridSize}px
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={200}
                step={5}
                value={gridSize}
                onChange={(e) => setGridSize(parseInt(e.target.value, 10))}
                className="vtt-slider"
              />
            </div>

            {/* Create button */}
            <button
              onClick={handleAddMap}
              className="vtt-btn w-full justify-center"
            >
              Create Map
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {state.maps.length === 0 ? (
          <div className="vtt-empty">
            No maps yet.
            <br />
            Create one above.
          </div>
        ) : (
          state.maps.map((map) => (
            <div
              key={map.id}
              className={`vtt-list-item group cursor-pointer ${
                state.activeMapId === map.id
                  ? "vtt-list-item--active"
                  : ""
              }`}
              onClick={() =>
                dispatch({ type: "SET_ACTIVE_MAP", payload: map.id })
              }
            >
              {/* Thumbnail / placeholder */}
              <div className="w-full h-16 rounded bg-terminal-bg-dark mb-1.5 overflow-hidden flex items-center justify-center">
                {map.imageDataUrl && map.isVideo ? (
                  <video
                    src={map.imageDataUrl}
                    muted
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-cover opacity-70"
                  />
                ) : map.imageDataUrl ? (
                  <img
                    src={map.imageDataUrl}
                    alt={map.name}
                    className="w-full h-full object-cover opacity-70"
                  />
                ) : (
                  <ImageIcon size={20} className="text-terminal-primary/20" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-terminal-primary text-xs font-mono truncate flex-1">
                  {map.name}
                </span>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileSelect(map.id);
                    }}
                    className="p-1 text-terminal-primary/50 hover:text-terminal-primary transition-colors"
                    title="Load image from local file"
                  >
                    {loadingMapId === map.id ? (
                      <span className="text-[10px] animate-pulse">...</span>
                    ) : (
                      <Upload size={12} />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMap(map.id);
                    }}
                    className="p-1 text-terminal-primary/50 hover:text-red-400 transition-colors"
                    title="Delete map"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-terminal-primary/30 font-mono mt-0.5">
                {map.width}x{map.height} | {map.grid.style} {map.grid.size}px | {map.tokens.length} tokens
              </div>
            </div>
          ))
        )}
      </div>

      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" />
    </div>
  );
}
