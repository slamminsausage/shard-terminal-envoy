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
      if (!files) return;
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const dataUrl = ev.target?.result as string;
          const isVideo = file.type.startsWith("video/");
          await addHandout({
            title: file.name.replace(/\.[^.]+$/, ""),
            description: "",
            type: isVideo ? "video" : "image",
            mediaUrl: dataUrl,
            isVisible: false,
            tags: [],
          });
        };
        reader.readAsDataURL(file);
      }
      toast.success(`${files.length} handout(s) added`);
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
      <div className="p-3 border-b border-terminal-border/30 space-y-2">
        {/* Quick add images */}
        <button
          onClick={handleAddImageHandout}
          className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs font-mono border border-dashed border-terminal-border/30 rounded text-terminal-primary/50 hover:text-terminal-primary hover:border-terminal-primary/30 transition-colors justify-center"
        >
          <Upload size={12} /> Quick Add Images
        </button>

        {/* Create with details */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs font-mono border border-terminal-primary/20 rounded text-terminal-primary/50 hover:text-terminal-primary hover:border-terminal-primary/40 transition-colors justify-center"
        >
          <Plus size={12} /> Create Handout
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

      {/* Create form */}
      {showCreateForm && (
        <div className="p-3 border-b border-terminal-border/30 space-y-2">
          <div className="flex gap-1">
            <button
              onClick={() => setNewType("image")}
              className={`flex-1 px-2 py-1 text-[10px] font-mono rounded border transition-colors ${
                newType === "image"
                  ? "border-terminal-primary/50 bg-terminal-primary/10 text-terminal-primary"
                  : "border-terminal-border/20 text-terminal-primary/40 hover:border-terminal-border/40"
              }`}
            >
              Image/Video
            </button>
            <button
              onClick={() => setNewType("text")}
              className={`flex-1 px-2 py-1 text-[10px] font-mono rounded border transition-colors ${
                newType === "text"
                  ? "border-terminal-primary/50 bg-terminal-primary/10 text-terminal-primary"
                  : "border-terminal-border/20 text-terminal-primary/40 hover:border-terminal-border/40"
              }`}
            >
              Text
            </button>
          </div>

          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Handout title..."
            className="w-full bg-terminal-bg-dark border border-terminal-border/30 text-terminal-primary text-xs px-2 py-1.5 rounded font-mono placeholder:text-terminal-primary/30 focus:border-terminal-primary/50 focus:outline-none"
          />

          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (optional)..."
            className="w-full bg-terminal-bg-dark border border-terminal-border/30 text-terminal-primary text-xs px-2 py-1 rounded font-mono placeholder:text-terminal-primary/30 focus:border-terminal-primary/50 focus:outline-none"
          />

          {newType === "text" ? (
            <textarea
              value={newTextContent}
              onChange={(e) => setNewTextContent(e.target.value)}
              placeholder="Handout text content..."
              rows={4}
              className="w-full bg-terminal-bg-dark border border-terminal-border/30 text-terminal-primary text-xs px-2 py-1.5 rounded font-mono placeholder:text-terminal-primary/30 focus:border-terminal-primary/50 focus:outline-none resize-none"
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
                  className="flex items-center gap-1 w-full px-2 py-3 text-[10px] font-mono border border-dashed border-terminal-border/30 rounded text-terminal-primary/40 hover:text-terminal-primary hover:border-terminal-primary/30 transition-colors justify-center"
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
              className="flex-1 px-2 py-1.5 text-[10px] font-mono rounded border border-terminal-primary/40 bg-terminal-primary/10 text-terminal-primary hover:bg-terminal-primary/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
              className="px-2 py-1.5 text-[10px] font-mono rounded border border-terminal-border/30 text-terminal-primary/40 hover:text-terminal-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Handout list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {handouts.length === 0 ? (
          <div className="text-terminal-primary/30 text-xs font-mono text-center py-8">
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
              className={`group rounded border transition-colors overflow-hidden ${
                sentToPresenter === h.id
                  ? "border-cyan-500/40 bg-cyan-500/5"
                  : "border-terminal-border/20 hover:border-terminal-border/40 bg-terminal-bg-dark/50"
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
