import { useVTT } from "@/contexts/VTTContext";
import type { Handout } from "@/types/vtt";
import { Upload, Trash2, Eye, EyeOff, Maximize2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function VTTHandoutsPanel() {
  const { state, dispatch } = useVTT();
  const [previewId, setPreviewId] = useState<string | null>(null);

  const handleAddHandout = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const handout: Handout = {
            id: crypto.randomUUID(),
            name: file.name.replace(/\.[^.]+$/, ""),
            imageDataUrl: ev.target?.result as string,
            visible: false,
          };
          dispatch({ type: "ADD_HANDOUT", payload: handout });
        };
        reader.readAsDataURL(file);
      });
      toast.success(`${files.length} handout(s) added`);
    };
    input.click();
  };

  const previewHandout = state.handouts.find((h) => h.id === previewId);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-terminal-border/30">
        <button
          onClick={handleAddHandout}
          className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs font-mono border border-dashed border-terminal-border/30 rounded text-terminal-primary/50 hover:text-terminal-primary hover:border-terminal-primary/30 transition-colors justify-center"
        >
          <Upload size={12} /> Add Handout Images
        </button>
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
              className="group rounded border border-terminal-border/20 hover:border-terminal-border/40 bg-terminal-bg-dark/50 transition-colors overflow-hidden"
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
                    onClick={() =>
                      dispatch({ type: "REMOVE_HANDOUT", payload: h.id })
                    }
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
