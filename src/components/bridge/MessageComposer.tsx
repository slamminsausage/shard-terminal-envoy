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
      <div className="bg-[#0d1210] border border-[#00aa55] rounded-lg w-full max-w-lg shadow-[0_0_40px_rgba(0,255,136,0.2)]">
        <div className="flex justify-between items-center px-4 py-3 bg-[#00ff8810] border-b border-[#1a2420]">
          <span className="font-['Orbitron'] text-sm tracking-[2px]">NEW TRANSMISSION</span>
          <button
            onClick={onClose}
            className="text-[#446655] hover:text-[#ff4455] transition-colors text-lg"
            aria-label="Close"
          >
            x
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-[#446655] tracking-[1px] mb-2">SENDER:</label>
            <input
              type="text"
              value={sender}
              onChange={e => setSender(e.target.value)}
              className="w-full bg-[#0a0e0c] border border-[#1a2420] rounded px-3 py-2 text-[#00ff88] font-mono text-sm focus:outline-none focus:border-[#00aa55]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#446655] tracking-[1px] mb-2">PRIORITY:</label>
            <div className="flex gap-2">
              {(["normal", "priority", "emergency"] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded text-xs font-mono transition-all border ${
                    priority === p
                      ? p === "emergency"
                        ? "bg-[#ff445520] border-[#ff4455] text-[#ff4455]"
                        : p === "priority"
                          ? "bg-[#ffaa0020] border-[#ffaa00] text-[#ffaa00]"
                          : "bg-[#00ff8820] border-[#00ff88] text-[#00ff88]"
                      : "bg-[#00ff8808] border-[#1a2420] text-[#446655] hover:border-[#00aa55]"
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#446655] tracking-[1px] mb-2">MESSAGE:</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Enter message content..."
              rows={6}
              className="w-full bg-[#0a0e0c] border border-[#1a2420] rounded px-3 py-2 text-[#88bbaa] font-mono text-sm focus:outline-none focus:border-[#00aa55] focus:shadow-[0_0_8px_rgba(0,255,136,0.2)] resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-[#1a2420]">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded text-xs font-mono transition-all border border-[#1a2420] text-[#446655] bg-[#00ff8808] hover:bg-[#00ff8815] hover:text-[#00ff88]"
          >
            CANCEL
          </button>
          <button
            onClick={handleSend}
            disabled={!sender.trim() || !content.trim()}
            className="flex-1 py-2.5 rounded text-xs font-mono transition-all border border-[#00aa55] text-[#00ff88] bg-[#00ff8820] hover:bg-[#00ff8830] hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            SEND TRANSMISSION
          </button>
        </div>
      </div>
    </div>
  );
}
