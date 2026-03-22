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
      { key: "0", desc: "Reset Zoom" },
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
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-terminal-bg-dark/95 border border-terminal-border/50 rounded-lg p-6 max-w-3xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-terminal-primary font-mono text-sm uppercase tracking-wider">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-terminal-primary/50 hover:text-terminal-primary"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {shortcuts.map(({ category, items }) => (
            <div key={category}>
              <h3 className="text-terminal-primary/70 text-xs font-mono uppercase tracking-wider mb-2 border-b border-terminal-border/20 pb-1">
                {category}
              </h3>
              <div className="space-y-1">
                {items.map(({ key, desc }) => (
                  <div key={key + desc} className="flex items-center gap-2 text-xs">
                    <kbd className="bg-terminal-primary/10 text-terminal-primary border border-terminal-border/30 rounded px-1.5 py-0.5 font-mono text-[10px] min-w-[2rem] text-center">
                      {key}
                    </kbd>
                    <span className="text-terminal-primary/50">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center text-[10px] text-terminal-primary/30">
          Press ? or Esc to close
        </div>
      </div>
    </div>
  );
}
