import { useNotes } from "@/contexts/NotesContext";
import type { Handout } from "@/types/notes";
import type { PresenterMessage } from "@/hooks/useVTTPresenter";
import {
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Maximize2,
  Monitor,
  MonitorOff,
  FileText,
  Image as ImageIcon,
  Video,
  Plus,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { dbHelpers, supabaseDisabled } from "@/lib/supabase";

const CHANNEL_NAME = "shard-vtt-presenter";

export default function VTTHandoutsPanel() {
  const {
    handouts,
    addHandout,
    deleteHandout,
    toggleHandoutVisibility,
  } = useNotes();

  const [previewId, setPreviewId] = useState<string | null>(null);
  const [sentToPresenter, setSentToPresenter] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<"image" | "text">("image");
  const [newTextContent, setNewTextContent] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    return () => channelRef.current?.close();
  }, []);

  const handleAddImageHandout = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
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

  const handleCreateTextHandout = async () => {
    if (!newTitle.trim()) return;

    if (newType === "text") {
      await addHandout({
        title: newTitle.trim(),
        description: newDescription.trim(),
        type: "text",
        content: newTextContent,
        isVisible: false,
        tags: [],
      });
    } else if (pendingFile) {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(pendingFile);
      });
      const isVideo = pendingFile.type.startsWith("video/");
      await addHandout({
        title: newTitle.trim(),
        description: newDescription.trim(),
        type: isVideo ? "video" : "image",
        mediaUrl: dataUrl,
        isVisible: false,
        tags: [],
      });
    }

    setNewTitle("");
    setNewDescription("");
    setNewTextContent("");
    setPendingFile(null);
    setPendingPreviewUrl(null);
    setShowCreateForm(false);
    toast.success("Handout created");
  };

  const handlePendingFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setPendingFile(file);
        setPendingPreviewUrl(URL.createObjectURL(file));
        if (!newTitle.trim()) {
          setNewTitle(file.name.replace(/\.[^.]+$/, ""));
        }
      }
    };
    input.click();
  };

  const sendToPresenter = (handout: Handout) => {
    const imageUrl = handout.mediaUrl || "";
    if (!imageUrl && handout.type !== "text") return;

    if (handout.type === "text") {
      // For text handouts, we can't send image data — just show a notification
      toast.info(`Text handout "${handout.title}" — use the Campaign tab to share text`);
      return;
    }

    channelRef.current?.postMessage({
      type: "show-handout",
      imageDataUrl: imageUrl,
      name: handout.title,
    } satisfies PresenterMessage);
    setSentToPresenter(handout.id);
    toast.success(`"${handout.title}" sent to presenter`);
  };

  const hideFromPresenter = () => {
    channelRef.current?.postMessage({
      type: "hide-handout",
    } satisfies PresenterMessage);
    setSentToPresenter(null);
    toast.success("Handout hidden from presenter");
  };

  const previewHandout = handouts.find((h) => h.id === previewId);

  const typeIcon = (type: string) => {
    switch (type) {
      case "image": return <ImageIcon size={10} className="text-terminal-primary/40" />;
      case "video": return <Video size={10} className="text-terminal-primary/40" />;
      case "text": return <FileText size={10} className="text-terminal-primary/40" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="vtt-panel-section space-y-2">
        {/* Quick add images */}
        <button
          onClick={handleAddImageHandout}
          className="vtt-btn w-full justify-center gap-1.5 border-dashed"
        >
          <Upload size={12} /> Quick Add Images
        </button>

        {/* Create with details */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="vtt-btn w-full justify-center gap-1.5"
        >
          <Plus size={12} /> Create Handout
        </button>

        {sentToPresenter && (
          <button
            onClick={hideFromPresenter}
            className="vtt-btn danger w-full justify-center gap-1.5"
          >
            <MonitorOff size={12} /> Hide from Presenter
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="vtt-panel-section space-y-2">
          <div className="flex gap-1">
            <button
              onClick={() => setNewType("image")}
              className={`flex-1 vtt-option ${newType === "image" ? "vtt-option--active" : ""}`}
            >
              Image/Video
            </button>
            <button
              onClick={() => setNewType("text")}
              className={`flex-1 vtt-option ${newType === "text" ? "vtt-option--active" : ""}`}
            >
              Text
            </button>
          </div>

          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Handout title..."
            className="vtt-input w-full"
          />

          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (optional)..."
            className="vtt-input w-full"
          />

          {newType === "text" ? (
            <textarea
              value={newTextContent}
              onChange={(e) => setNewTextContent(e.target.value)}
              placeholder="Handout text content..."
              rows={4}
              className="vtt-input w-full resize-none"
            />
          ) : (
            <div>
              {pendingPreviewUrl ? (
                <div className="relative">
                  <img
                    src={pendingPreviewUrl}
                    alt="Preview"
                    className="w-full h-20 object-cover rounded border border-terminal-border/20 opacity-70"
                  />
                  <button
                    onClick={handlePendingFileSelect}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded text-terminal-primary text-[10px] font-mono"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  onClick={handlePendingFileSelect}
                  className="vtt-btn w-full justify-center border-dashed py-3"
                >
                  <Upload size={10} /> Select file
                </button>
              )}
            </div>
          )}

          <div className="flex gap-1">
            <button
              onClick={handleCreateTextHandout}
              disabled={!newTitle.trim() || (newType === "image" && !pendingFile)}
              className="vtt-btn flex-1 justify-center disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewTitle("");
                setNewDescription("");
                setNewTextContent("");
                setPendingFile(null);
                setPendingPreviewUrl(null);
              }}
              className="vtt-btn justify-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Handout list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {handouts.length === 0 ? (
          <div className="vtt-empty">
            No handouts.
            <br />
            Upload images or create handouts above.
            <br />
            <span className="text-terminal-primary/20 text-[10px]">
              Handouts sync with Campaign Notes tab.
            </span>
          </div>
        ) : (
          handouts.map((h) => (
            <div
              key={h.id}
              className={`vtt-list-item flex-col !p-0 overflow-hidden ${
                sentToPresenter === h.id
                  ? "vtt-list-item--active border-cyan-500/40 bg-cyan-500/5"
                  : ""
              }`}
            >
              {/* Thumbnail */}
              {h.type === "image" && h.mediaUrl && (
                <div className="w-full h-20 overflow-hidden">
                  <img
                    src={h.mediaUrl}
                    alt={h.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  />
                </div>
              )}
              {h.type === "video" && h.mediaUrl && (
                <div className="w-full h-20 overflow-hidden">
                  <video
                    src={h.mediaUrl}
                    className="w-full h-full object-cover opacity-60"
                    muted
                  />
                </div>
              )}
              {h.type === "text" && (
                <div className="w-full h-12 px-2 py-1.5 overflow-hidden">
                  <p className="text-[9px] text-terminal-primary/40 font-mono line-clamp-3">
                    {h.content || h.description || "Empty text handout"}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between p-1.5">
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  {typeIcon(h.type)}
                  <span className="text-[10px] text-terminal-primary font-mono truncate">
                    {h.title}
                  </span>
                </div>
                <div className="flex gap-0.5">
                  {(h.type === "image" || h.type === "video") && h.mediaUrl && (
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
                  )}
                  {(h.type === "image" || h.type === "video") && h.mediaUrl && (
                    <button
                      onClick={() => setPreviewId(h.id === previewId ? null : h.id)}
                      className="p-1 text-terminal-primary/40 hover:text-terminal-primary transition-colors"
                      title="Preview"
                    >
                      <Maximize2 size={10} />
                    </button>
                  )}
                  <button
                    onClick={() => toggleHandoutVisibility(h.id)}
                    className="p-1 text-terminal-primary/40 hover:text-terminal-primary transition-colors"
                    title={h.isVisible ? "Hide from players" : "Show to players"}
                  >
                    {h.isVisible ? <Eye size={10} /> : <EyeOff size={10} />}
                  </button>
                  <button
                    onClick={async () => {
                      if (sentToPresenter === h.id) hideFromPresenter();
                      await deleteHandout(h.id);
                    }}
                    className="p-1 text-terminal-primary/40 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>

              {/* Visibility badge */}
              {h.isVisible && (
                <div className="px-1.5 pb-1">
                  <span className="text-[8px] font-mono text-green-400/60 bg-green-500/10 px-1 py-0.5 rounded">
                    VISIBLE TO PLAYERS
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Fullscreen preview overlay */}
      {previewHandout && previewHandout.mediaUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-pointer"
          onClick={() => setPreviewId(null)}
        >
          {previewHandout.type === "video" ? (
            <video
              src={previewHandout.mediaUrl}
              controls
              autoPlay
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
          ) : (
            <img
              src={previewHandout.mediaUrl}
              alt={previewHandout.title}
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
          )}
          <div className="absolute top-4 right-4 text-terminal-primary/50 text-xs font-mono">
            Click to close
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-terminal-primary/60 text-sm font-mono">
            {previewHandout.title}
          </div>
        </div>
      )}
    </div>
  );
}
