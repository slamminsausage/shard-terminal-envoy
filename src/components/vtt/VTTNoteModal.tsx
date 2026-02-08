import { useState } from "react";
import { useVTT } from "@/contexts/VTTContext";
import type { MapNote } from "@/types/vtt";
import { X, Trash2 } from "lucide-react";

const NOTE_COLORS = ["#00ccff", "#00ff00", "#ff6600", "#ff3344", "#ffcc00", "#aa44ff"];

interface VTTNoteModalProps {
  note: MapNote | null; // null = creating new
  mapId: string;
  defaultX?: number;
  defaultY?: number;
  onClose: () => void;
}

export default function VTTNoteModal({
  note,
  mapId,
  defaultX = 0,
  defaultY = 0,
  onClose,
}: VTTNoteModalProps) {
  const { dispatch } = useVTT();
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [color, setColor] = useState(note?.color || "#00ccff");
  const [visible, setVisible] = useState(note?.visible ?? true);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      onClose();
      return;
    }

    if (note) {
      dispatch({
        type: "UPDATE_NOTE",
        payload: {
          mapId,
          noteId: note.id,
          updates: { title, content, color, visible },
        },
      });
    } else {
      dispatch({
        type: "ADD_NOTE",
        payload: {
          mapId,
          note: {
            id: crypto.randomUUID(),
            x: defaultX,
            y: defaultY,
            title,
            content,
            color,
            visible,
          },
        },
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (note) {
      dispatch({ type: "REMOVE_NOTE", payload: { mapId, noteId: note.id } });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-terminal-bg-dark border border-terminal-border/40 rounded-lg shadow-xl w-80 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-terminal-border/30">
          <h3 className="text-terminal-primary text-sm font-mono uppercase tracking-wider">
            {note ? "Edit Note" : "New Note"}
          </h3>
          <button onClick={onClose} className="text-terminal-primary/50 hover:text-terminal-primary">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full bg-terminal-bg-dark border border-terminal-border/30 text-terminal-primary text-xs px-2 py-1.5 rounded font-mono placeholder:text-terminal-primary/20 focus:border-terminal-primary/50 focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-1">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Note content..."
              rows={5}
              className="w-full bg-terminal-bg-dark border border-terminal-border/30 text-terminal-primary text-xs px-2 py-1.5 rounded font-mono placeholder:text-terminal-primary/20 focus:border-terminal-primary/50 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-terminal-primary/50 uppercase tracking-wider font-mono block mb-1">
              Color
            </label>
            <div className="flex gap-1.5">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded border-2 transition-all ${
                    color === c
                      ? "border-terminal-primary scale-110"
                      : "border-transparent hover:border-terminal-primary/30"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <label className="flex items-center gap-1.5 text-xs text-terminal-primary/60 font-mono cursor-pointer">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              className="accent-green-500"
            />
            Visible on map
          </label>
        </div>

        <div className="flex gap-2 px-4 py-3 border-t border-terminal-border/30">
          {note && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-mono rounded border border-terminal-border/30 text-terminal-primary/50 hover:text-terminal-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-xs font-mono rounded border border-terminal-primary/50 text-terminal-primary bg-terminal-primary/10 hover:bg-terminal-primary/20 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
