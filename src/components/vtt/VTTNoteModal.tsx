import { useState } from "react";
import { toast } from "sonner";
import { useVTT } from "@/contexts/VTTContext";
import type { MapNote } from "@/types/vtt";
import { X, Trash2 } from "lucide-react";

const NOTE_COLORS = ["#00ccff", "#3ae2b3", "#ff6600", "#ff3344", "#ffcc00", "#aa44ff"];

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
      toast.error("Note must have a title or content");
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
    <div className="vtt-modal-overlay">
      <div className="vtt-modal w-80 flex flex-col">
        {/* Header */}
        <div className="vtt-modal-header">
          <h3 className="vtt-modal-title">
            {note ? "Edit Note" : "New Note"}
          </h3>
          <button onClick={onClose} className="vtt-btn-icon">
            <X size={16} />
          </button>
        </div>

        <div className="vtt-modal-body space-y-3">
          <div>
            <label className="vtt-section-label">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="vtt-input"
              autoFocus
            />
          </div>

          <div>
            <label className="vtt-section-label">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Note content..."
              rows={5}
              className="vtt-input resize-none"
            />
          </div>

          <div>
            <label className="vtt-section-label">Color</label>
            <div className="flex gap-1.5">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded border-2 transition-all ${
                    color === c
                      ? "border-[var(--primary)] scale-110"
                      : "border-transparent hover:border-[rgba(58,226,179,0.3)]"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <label className="vtt-checkbox">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
            />
            Visible on map
          </label>
        </div>

        <div className="flex gap-2 px-4 py-3 border-t border-[rgba(58,226,179,0.15)]">
          {note && (
            <button onClick={handleDelete} className="vtt-btn danger">
              <Trash2 size={12} /> Delete
            </button>
          )}
          <div className="flex-1" />
          <button onClick={onClose} className="vtt-btn" style={{ background: 'transparent', boxShadow: 'none' }}>
            Cancel
          </button>
          <button onClick={handleSave} className="vtt-btn">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
