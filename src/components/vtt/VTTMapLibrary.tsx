import { useState, useRef } from "react";
import { Plus, Trash2, Upload, ImageIcon } from "lucide-react";
import { useVTT } from "@/contexts/VTTContext";
import { toast } from "sonner";

export default function VTTMapLibrary() {
  const { state, dispatch, addMap, loadMapImage } = useVTT();
  const [newMapName, setNewMapName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingMapId, setLoadingMapId] = useState<string | null>(null);

  const handleAddMap = () => {
    const name = newMapName.trim() || `Map ${state.maps.length + 1}`;
    addMap(name);
    setNewMapName("");
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
    dispatch({ type: "REMOVE_MAP", payload: mapId });
    toast.success(`Map "${map?.name}" deleted`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-terminal-border/30">
        <h3 className="text-terminal-primary text-sm font-mono mb-2 uppercase tracking-wider">
          Map Library
        </h3>
        <div className="flex gap-1">
          <input
            type="text"
            value={newMapName}
            onChange={(e) => setNewMapName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddMap()}
            placeholder="Map name..."
            className="flex-1 bg-terminal-bg-dark border border-terminal-border/30 text-terminal-primary text-xs px-2 py-1 rounded font-mono placeholder:text-terminal-primary/30 focus:border-terminal-primary/50 focus:outline-none"
          />
          <button
            onClick={handleAddMap}
            className="flex items-center justify-center w-7 h-7 bg-terminal-primary/10 text-terminal-primary border border-terminal-primary/30 rounded hover:bg-terminal-primary/20 transition-colors"
            title="Add Map"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {state.maps.length === 0 ? (
          <div className="text-terminal-primary/30 text-xs font-mono text-center py-8">
            No maps yet.
            <br />
            Create one above.
          </div>
        ) : (
          state.maps.map((map) => (
            <div
              key={map.id}
              className={`group p-2 rounded border cursor-pointer transition-colors ${
                state.activeMapId === map.id
                  ? "bg-terminal-primary/10 border-terminal-primary/50"
                  : "bg-terminal-bg-dark/50 border-terminal-border/20 hover:border-terminal-border/40"
              }`}
              onClick={() =>
                dispatch({ type: "SET_ACTIVE_MAP", payload: map.id })
              }
            >
              {/* Thumbnail / placeholder */}
              <div className="w-full h-16 rounded bg-terminal-bg-dark mb-1.5 overflow-hidden flex items-center justify-center">
                {map.imageDataUrl ? (
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
                {map.width}x{map.height} | {map.tokens.length} tokens |{" "}
                {map.strokes.length} strokes
              </div>
            </div>
          ))
        )}
      </div>

      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" />
    </div>
  );
}
