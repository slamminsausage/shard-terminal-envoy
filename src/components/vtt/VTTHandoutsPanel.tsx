import { useVTT } from "@/contexts/VTTContext";
import type { Handout } from "@/types/vtt";
import type { PresenterMessage } from "@/hooks/useVTTPresenter";
import { Upload, Trash2, Eye, EyeOff, Maximize2, Monitor, MonitorOff } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { dbHelpers, supabaseDisabled } from "@/lib/supabase";

const CHANNEL_NAME = "shard-vtt-presenter";

export default function VTTHandoutsPanel() {
  const { state, dispatch } = useVTT();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [sentToPresenter, setSentToPresenter] = useState<string | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    return () => channelRef.current?.close();
  }, []);

  const handleAddHandout = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      let uploaded = 0;
      let fallbacks = 0;

      await Promise.all(
        Array.from(files).map(async (file) => {
          const id = crypto.randomUUID();

          // Upload to Supabase Storage so the handout syncs across devices.
          let persistentUrl: string | null = null;
          if (!supabaseDisabled) {
            try {
              persistentUrl = await dbHelpers.uploadVTTAsset(file, "handouts", id);
            } catch (err) {
              console.error("Handout upload failed:", err);
            }
          }

          if (!persistentUrl) {
            // Fallback: read as data URL so at least localStorage persistence works
            // on this device. Warn the user this won't sync across devices.
            fallbacks++;
            persistentUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (ev) => resolve(ev.target?.result as string);
              reader.onerror = () => reject(new Error("Failed to read file"));
              reader.readAsDataURL(file);
            });
          } else {
            uploaded++;
          }

          const handout: Handout = {
            id,
            name: file.name.replace(/\.[^.]+$/, ""),
            imageDataUrl: persistentUrl,
            visible: false,
          };
          dispatch({ type: "ADD_HANDOUT", payload: handout });
        })
      );

      if (uploaded > 0 && fallbacks === 0) {
        toast.success(`${uploaded} handout(s) uploaded`);
      } else if (uploaded > 0 && fallbacks > 0) {
        toast.warning(
          `${uploaded} uploaded, ${fallbacks} saved locally (won't sync across devices)`
        );
      } else if (fallbacks > 0) {
        toast.warning(
          `${fallbacks} handout(s) saved locally — won't sync across devices`
        );
      }
    };
    input.click();
  };

  const sendToPresenter = (handout: Handout) => {
    channelRef.current?.postMessage({
      type: "show-handout",
      imageDataUrl: handout.imageDataUrl,
      name: handout.name,
    } satisfies PresenterMessage);
    setSentToPresenter(handout.id);
    toast.success(`"${handout.name}" sent to presenter`);
  };

  const hideFromPresenter = () => {
    channelRef.current?.postMessage({
      type: "hide-handout",
    } satisfies PresenterMessage);
    setSentToPresenter(null);
    toast.success("Handout hidden from presenter");
  };

  const previewHandout = state.handouts.find((h) => h.id === previewId);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-terminal-border/30 space-y-2">
        <button
          onClick={handleAddHandout}
          className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs font-mono border border-dashed border-terminal-border/30 rounded text-terminal-primary/50 hover:text-terminal-primary hover:border-terminal-primary/30 transition-colors justify-center"
        >
          <Upload size={12} /> Add Handout Images
        </button>

        {sentToPresenter && (
          <button
            onClick={hideFromPresenter}
            className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs font-mono border border-red-500/30 rounded text-red-400/60 hover:text-red-400 hover:border-red-500/50 transition-colors justify-center"
          >
            <MonitorOff size={12} /> Hide from Presenter
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {state.handouts.length === 0 ? (
          <div className="text-terminal-primary/30 text-xs font-mono text-center py-8">
            No handouts.
            <br />
            Upload images above.
          </div>
        ) : (
          state.handouts.map((h) => (
            <div
              key={h.id}
              className={`group rounded border transition-colors overflow-hidden ${
                sentToPresenter === h.id
                  ? "border-cyan-500/40 bg-cyan-500/5"
                  : "border-terminal-border/20 hover:border-terminal-border/40 bg-terminal-bg-dark/50"
              }`}
            >
              {/* Thumbnail */}
              <div className="w-full h-20 overflow-hidden">
                <img
                  src={h.imageDataUrl}
                  alt={h.name}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                />
              </div>

              <div className="flex items-center justify-between p-1.5">
                <span className="text-[10px] text-terminal-primary font-mono truncate flex-1">
                  {h.name}
                </span>
                <div className="flex gap-0.5">
                  <button
                    onClick={() => sendToPresenter(h)}
                    className={`p-1 transition-colors ${
                      sentToPresenter === h.id
                        ? "text-cyan-400"
                        : "text-terminal-primary/40 hover:text-cyan-400"
                    }`}
                    title="Send to Presenter"
                  >
                    <Monitor size={10} />
                  </button>
                  <button
                    onClick={() => setPreviewId(h.id === previewId ? null : h.id)}
                    className="p-1 text-terminal-primary/40 hover:text-terminal-primary transition-colors"
                    title="Preview"
                  >
                    <Maximize2 size={10} />
                  </button>
                  <button
                    onClick={() =>
                      dispatch({
                        type: "TOGGLE_HANDOUT_VISIBILITY",
                        payload: h.id,
                      })
                    }
                    className="p-1 text-terminal-primary/40 hover:text-terminal-primary transition-colors"
                    title={h.visible ? "Hide from players" : "Show to players"}
                  >
                    {h.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                  </button>
                  <button
                    onClick={() => {
                      if (sentToPresenter === h.id) hideFromPresenter();
                      dispatch({ type: "REMOVE_HANDOUT", payload: h.id });
                    }}
                    className="p-1 text-terminal-primary/40 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fullscreen preview overlay */}
      {previewHandout && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-pointer"
          onClick={() => setPreviewId(null)}
        >
          <img
            src={previewHandout.imageDataUrl}
            alt={previewHandout.name}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
          <div className="absolute top-4 right-4 text-terminal-primary/50 text-xs font-mono">
            Click to close
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-terminal-primary/60 text-sm font-mono">
            {previewHandout.name}
          </div>
        </div>
      )}
    </div>
  );
}
