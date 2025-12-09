import { useState } from "react";

interface ScanModalProps {
  onRun: (roll: number, difficulty: number, notes?: string) => void;
  onClose: () => void;
}

export function ScanModal({ onRun, onClose }: ScanModalProps) {
  const [roll, setRoll] = useState(8);
  const [difficulty, setDifficulty] = useState(8);
  const [notes, setNotes] = useState("");

  const handleRun = () => {
    onRun(roll, difficulty, notes.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1210] border border-[#00aa55] rounded-lg w-full max-w-md shadow-[0_0_40px_rgba(0,255,136,0.2)]">
        <div className="flex justify-between items-center px-4 py-3 bg-[#00ff8810] border-b border-[#1a2420]">
          <span className="font-['Orbitron'] text-sm tracking-[2px]">ACTIVE SCAN</span>
          <button
            onClick={onClose}
            className="text-[#446655] hover:text-[#ff4455] transition-colors text-lg"
            aria-label="Close"
          >
            x
          </button>
        </div>

        <div className="p-4 space-y-4 text-sm text-[#88bbaa]">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs text-[#446655]">
              SKILL ROLL
              <input
                type="number"
                value={roll}
                onChange={e => setRoll(Number(e.target.value))}
                className="bg-[#0a0e0c] border border-[#1a2420] rounded px-3 py-2 text-[#00ff88] font-mono text-sm focus:outline-none focus:border-[#00aa55]"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[#446655]">
              DIFFICULTY
              <input
                type="number"
                value={difficulty}
                onChange={e => setDifficulty(Number(e.target.value))}
                className="bg-[#0a0e0c] border border-[#1a2420] rounded px-3 py-2 text-[#00ff88] font-mono text-sm focus:outline-none focus:border-[#00aa55]"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-xs text-[#446655]">
            NOTES (optional)
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="bg-[#0a0e0c] border border-[#1a2420] rounded px-3 py-2 text-[#88bbaa] font-mono text-sm focus:outline-none focus:border-[#00aa55] resize-none"
            />
          </label>
        </div>

        <div className="flex gap-3 p-4 border-t border-[#1a2420]">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded text-xs font-mono transition-all border border-[#1a2420] text-[#446655] bg-[#00ff8808] hover:bg-[#00ff8815] hover:text-[#00ff88]"
          >
            CANCEL
          </button>
          <button
            onClick={handleRun}
            className="flex-1 py-2.5 rounded text-xs font-mono transition-all border border-[#00aa55] text-[#00ff88] bg-[#00ff8820] hover:bg-[#00ff8830] hover:shadow-[0_0_15px_rgba(0,255,136,0.3)]"
          >
            RUN SCAN
          </button>
        </div>
      </div>
    </div>
  );
}
