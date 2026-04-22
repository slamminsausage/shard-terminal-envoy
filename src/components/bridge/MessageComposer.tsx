import { useState } from "react";

interface MessageComposerProps {
  onSend: (sender: string, content: string, priority: string) => void;
  onClose: () => void;
}

export function MessageComposer({ onSend, onClose }: MessageComposerProps) {
  const [sender, setSender] = useState("Vanagandr CIC");
  const [priority, setPriority] = useState<"normal" | "priority" | "emergency">("normal");
  const [content, setContent] = useState("");

  const handleSend = () => {
    if (!sender.trim() || !content.trim()) return;
    onSend(sender.trim(), content.trim(), priority);
    setContent("");
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-terminal-bg-panel-alt border border-terminal-primary-mid rounded-lg w-full max-w-lg shadow-[0_0_40px_rgba(58, 226, 179,0.2)]">
        <div className="flex justify-between items-center px-4 py-3 bg-terminal-primary-light/10 border-b border-terminal-bg-border">
          <span className="font-['Orbitron'] text-sm tracking-[2px]">NEW TRANSMISSION</span>
          <button
            onClick={onClose}
            className="text-terminal-text-dimmer hover:text-terminal-danger-alt transition-colors text-lg"
            aria-label="Close"
          >
            x
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-terminal-text-dimmer tracking-[1px] mb-2">SENDER:</label>
            <input
              type="text"
              value={sender}
              onChange={e => setSender(e.target.value)}
              className="w-full bg-terminal-bg-darker border border-terminal-bg-border rounded px-3 py-2 text-terminal-primary-light font-mono text-sm focus:outline-none focus:border-terminal-primary-mid"
            />
          </div>

          <div>
            <label className="block text-xs text-terminal-text-dimmer tracking-[1px] mb-2">PRIORITY:</label>
            <div className="flex gap-2">
              {(["normal", "priority", "emergency"] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded text-xs font-mono transition-all border ${
                    priority === p
                      ? p === "emergency"
                        ? "bg-terminal-danger-alt/20 border-terminal-danger-alt text-terminal-danger-alt"
                        : p === "priority"
                          ? "bg-terminal-warning-alt/20 border-terminal-warning-alt text-terminal-warning-alt"
                          : "bg-terminal-primary-light/20 border-terminal-primary-light text-terminal-primary-light"
                      : "bg-terminal-primary-light/5 border-terminal-bg-border text-terminal-text-dimmer hover:border-terminal-primary-mid"
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-terminal-text-dimmer tracking-[1px] mb-2">MESSAGE:</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Enter message content..."
              rows={6}
              className="w-full bg-terminal-bg-darker border border-terminal-bg-border rounded px-3 py-2 text-terminal-text-muted font-mono text-sm focus:outline-none focus:border-terminal-primary-mid focus:shadow-[0_0_8px_rgba(58, 226, 179,0.2)] resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-terminal-bg-border">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded text-xs font-mono transition-all border border-terminal-bg-border text-terminal-text-dimmer bg-terminal-primary-light/5 hover:bg-terminal-primary-light/10 hover:text-terminal-primary-light"
          >
            CANCEL
          </button>
          <button
            onClick={handleSend}
            disabled={!sender.trim() || !content.trim()}
            className="flex-1 py-2.5 rounded text-xs font-mono transition-all border border-terminal-primary-mid text-terminal-primary-light bg-terminal-primary-light/20 hover:bg-terminal-primary-light/30 hover:shadow-[0_0_15px_rgba(58, 226, 179,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            SEND TRANSMISSION
          </button>
        </div>
      </div>
    </div>
  );
}
