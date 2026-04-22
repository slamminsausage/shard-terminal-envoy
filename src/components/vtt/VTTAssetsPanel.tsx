import { useState, useEffect, useCallback } from "react";
import { Upload, Trash2, Image as ImageIcon, X } from "lucide-react";
import { useVTT } from "@/contexts/VTTContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AssetItem {
  name: string;
  url: string;
}

const BUCKET = "vtt_assets";

export default function VTTAssetsPanel() {
  const { state, dispatch } = useVTT();
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from(BUCKET).list("", {
        limit: 200,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) throw error;
      const items: AssetItem[] = (data || [])
        .filter((f) => f.name && !f.name.startsWith("."))
        .map((f) => ({
          name: f.name,
          url: supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
        }));
      setAssets(items);
    } catch {
      // Supabase not configured — silently fall back to empty list
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/gif,image/webp";
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (!files.length) return;
      setUploading(true);
      let uploaded = 0;
      for (const file of files) {
        const ext = file.name.split(".").pop() || "png";
        const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(safeName, file, { cacheControl: "3600", upsert: false });
        if (!error) uploaded++;
        else toast.error(`Failed to upload ${file.name}: ${error.message}`);
      }
      if (uploaded > 0) {
        toast.success(`Uploaded ${uploaded} asset${uploaded > 1 ? "s" : ""}`);
        await loadAssets();
      }
      setUploading(false);
    };
    input.click();
  };

  const handleDelete = async (asset: AssetItem) => {
    const { error } = await supabase.storage.from(BUCKET).remove([asset.name]);
    if (error) {
      toast.error(`Delete failed: ${error.message}`);
      return;
    }
    toast.success("Asset deleted");
    setAssets((prev) => prev.filter((a) => a.name !== asset.name));
    // Disarm if this was the pending prop
    if (state.pendingPropImageUrl === asset.url) {
      dispatch({ type: "SET_PENDING_PROP", payload: null });
    }
  };

  const handleArm = (asset: AssetItem) => {
    const label = asset.name.replace(/^\d+_/, "").replace(/\.[^.]+$/, "");
    if (state.pendingPropImageUrl === asset.url) {
      dispatch({ type: "SET_PENDING_PROP", payload: null });
    } else {
      dispatch({ type: "SET_PENDING_PROP", payload: { imageUrl: asset.url, name: label } });
      toast.info(`Click the map to place "${label}"`);
    }
  };

  const isArmed = (asset: AssetItem) => state.pendingPropImageUrl === asset.url;

  return (
    <div className="flex flex-col h-full text-[var(--primary)] font-mono text-xs">
      {/* Upload + header */}
      <div className="p-2 border-b border-[rgba(58, 226, 179,0.15)] flex items-center gap-2">
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="flex items-center gap-1.5 px-2 py-1 bg-[rgba(58, 226, 179,0.08)] border border-[rgba(58, 226, 179,0.3)] rounded hover:bg-[rgba(58, 226, 179,0.15)] transition-colors disabled:opacity-50"
        >
          <Upload size={11} />
          {uploading ? "Uploading…" : "Upload Images"}
        </button>
        <button
          onClick={loadAssets}
          disabled={loading}
          className="px-2 py-1 border border-[rgba(58, 226, 179,0.2)] rounded hover:bg-[rgba(58, 226, 179,0.08)] transition-colors disabled:opacity-40 text-[10px]"
          title="Refresh"
        >
          ↻
        </button>
      </div>

      {/* Pending placement notice */}
      {state.pendingPropImageUrl && (
        <div className="flex items-center gap-1 px-2 py-1 bg-[rgba(58, 226, 179,0.1)] border-b border-[rgba(58, 226, 179,0.2)] text-[10px]">
          <span className="text-[var(--primary)] animate-pulse">● ARMED — click map to place</span>
          <button
            onClick={() => dispatch({ type: "SET_PENDING_PROP", payload: null })}
            className="ml-auto text-[rgba(58, 226, 179,0.5)] hover:text-[var(--primary)]"
          >
            <X size={10} />
          </button>
        </div>
      )}

      {/* Asset grid */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading && (
          <div className="text-center py-4 text-[rgba(58, 226, 179,0.4)]">Loading assets…</div>
        )}
        {!loading && assets.length === 0 && (
          <div className="text-center py-6 text-[rgba(58, 226, 179,0.35)] space-y-1">
            <ImageIcon size={24} className="mx-auto mb-2 opacity-30" />
            <div>No assets yet</div>
            <div className="text-[10px]">Upload JPEG, PNG, or GIF images</div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {assets.map((asset) => {
            const armed = isArmed(asset);
            const label = asset.name.replace(/^\d+_/, "").replace(/\.[^.]+$/, "");
            return (
              <div
                key={asset.name}
                className={`relative group rounded border cursor-pointer transition-all ${
                  armed
                    ? "border-[var(--primary)] bg-[rgba(58, 226, 179,0.12)] shadow-[0_0_8px_rgba(58, 226, 179,0.3)]"
                    : "border-[rgba(58, 226, 179,0.2)] hover:border-[rgba(58, 226, 179,0.5)] hover:bg-[rgba(58, 226, 179,0.06)]"
                }`}
                onClick={() => handleArm(asset)}
                title={armed ? "Click to disarm" : `Click to arm "${label}" for placement`}
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-black/40 overflow-hidden rounded-t">
                  <img
                    src={asset.url}
                    alt={label}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                {/* Name */}
                <div className="px-1 py-0.5 text-[9px] truncate text-[rgba(58, 226, 179,0.7)]">
                  {label}
                </div>
                {/* Armed badge */}
                {armed && (
                  <div className="absolute top-1 left-1 bg-[var(--primary)] text-black text-[8px] px-1 rounded font-bold">
                    ARMED
                  </div>
                )}
                {/* Delete button */}
                <button
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 rounded p-0.5 text-red-400 hover:text-red-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(asset);
                  }}
                  title="Delete asset"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Placed props list for active map */}
      {(() => {
        const props = (state.maps.find((m) => m.id === state.activeMapId)?.props || []);
        if (props.length === 0) return null;
        return (
          <div className="border-t border-[rgba(58, 226, 179,0.15)] p-2">
            <div className="text-[10px] text-[rgba(58, 226, 179,0.5)] mb-1">
              Placed on map ({props.length})
            </div>
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {props.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-1.5 px-1 py-0.5 rounded cursor-pointer text-[10px] transition-colors ${
                    (state.selectedPropIds || []).includes(p.id)
                      ? "bg-[rgba(58, 226, 179,0.12)] text-[var(--primary)]"
                      : "text-[rgba(58, 226, 179,0.6)] hover:bg-[rgba(58, 226, 179,0.06)]"
                  }`}
                  onClick={() =>
                    dispatch({ type: "SET_PROP_SELECTION", payload: [(state.selectedPropIds || []).includes(p.id) ? "" : p.id].filter(Boolean) })
                  }
                >
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-5 h-5 object-contain rounded bg-black/30 shrink-0"
                  />
                  <span className="truncate flex-1">{p.name}</span>
                  <button
                    className="shrink-0 text-red-500/60 hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: "REMOVE_PROP", payload: { mapId: state.activeMapId!, propId: p.id } });
                    }}
                    title="Remove from map"
                  >
                    <Trash2 size={9} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
