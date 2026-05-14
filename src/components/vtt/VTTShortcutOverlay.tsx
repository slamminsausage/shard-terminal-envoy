import { useEffect } from "react";
import { X } from "lucide-react";

interface VTTShortcutOverlayProps {
  onClose: () => void;
}

const shortcuts = [
  {
    category: "Tools",
    items: [
      { key: "V", desc: "Select / Cursor" },
      { key: "H", desc: "Pan" },
      { key: "B", desc: "Freehand Draw" },
      { key: "L", desc: "Line" },
      { key: "R", desc: "Rectangle" },
      { key: "O", desc: "Circle" },
      { key: "T", desc: "Text" },
      { key: "M", desc: "Measure" },
      { key: "W", desc: "Wall" },
      { key: "D", desc: "Door" },
      { key: "N", desc: "Note" },
      { key: "P", desc: "Light" },
      { key: "F", desc: "Fog Brush" },
    ],
  },
  {
    category: "View & Canvas",
    items: [
      { key: "G", desc: "Toggle Grid Snap" },
      { key: "+/-", desc: "Zoom In/Out" },
      { key: "0", desc: "Reset Zoom (100%)" },
      { key: "Home", desc: "Fit Map to Screen" },
      { key: "Ctrl+G", desc: "Toggle Grid Display" },
      { key: "Esc", desc: "Deselect / Close Panel" },
    ],
  },
  {
    category: "Selection & Editing",
    items: [
      { key: "Arrow Keys", desc: "Nudge Token (1 cell)" },
      { key: "Shift+Click", desc: "Multi-select" },
      { key: "Ctrl+C", desc: "Copy Selection" },
      { key: "Ctrl+V", desc: "Paste" },
      { key: "Ctrl+D", desc: "Duplicate" },
      { key: "Delete", desc: "Delete Selected" },
      { key: "Ctrl+Z", desc: "Undo" },
      { key: "Ctrl+Shift+Z", desc: "Redo" },
      { key: "Shift+Scroll", desc: "Adjust HP (over token)" },
      { key: "Dbl-Click HP", desc: "Inline HP Edit" },
    ],
  },
  {
    category: "Session",
    items: [
      { key: "Ctrl+S", desc: "Save Session" },
      { key: "?", desc: "Toggle This Overlay" },
      { key: "Ctrl+Click", desc: "GM Ping (labeled)" },
      { key: "Middle-Click", desc: "Pan Canvas" },
    ],
  },
  {
    category: "Measurement",
    items: [
      { key: "Click", desc: "Add Waypoint" },
      { key: "Double-Click", desc: "Finish Measurement" },
      { key: "Esc", desc: "Cancel Measurement" },
    ],
  },
];

export default function VTTShortcutOverlay({ onClose }: VTTShortcutOverlayProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "?") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="vtt-shortcut-overlay"
      onClick={onClose}
    >
      <div
        className="vtt-shortcut-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="vtt-sidebar-title text-sm">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="vtt-btn-icon"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {shortcuts.map(({ category, items }) => (
            <div key={category}>
              <h3 className="vtt-section-label mb-2 pb-1 border-b border-[rgba(58,226,179,0.12)]">
                {category}
              </h3>
              <div className="space-y-1">
                {items.map(({ key, desc }) => (
                  <div key={key + desc} className="flex items-center gap-2 text-xs">
                    <kbd className="vtt-kbd">
                      {key}
                    </kbd>
                    <span className="text-[rgba(58,226,179,0.5)] font-mono text-xs">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center text-[10px] text-[rgba(58,226,179,0.25)] font-mono">
          Press ? or Esc to close
        </div>
      </div>
    </div>
  );
}
