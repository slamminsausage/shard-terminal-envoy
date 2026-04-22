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
      <div className="bg-terminal-bg-panel-alt border border-terminal-primary-mid rounded-lg w-full max-w-md shadow-[0_0_40px_rgba(58, 226, 179,0.2)]">
        <div className="flex justify-between items-center px-4 py-3 bg-terminal-primary-light/10 border-b border-terminal-bg-border">
          <span className="font-['Orbitron'] text-sm tracking-[2px]">ACTIVE SCAN</span>
          <button
            onClick={onClose}
            className="text-terminal-text-dimmer hover:text-terminal-danger-alt transition-colors text-lg"
            aria-label="Close"
          >
            x
          </button>
        </div>

        <div className="p-4 space-y-4 text-sm text-terminal-text-muted">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs text-terminal-text-dimmer">
              SKILL ROLL
              <input
                type="number"
                value={roll}
                onChange={e => setRoll(Number(e.target.value))}
                className="bg-terminal-bg-darker border border-terminal-bg-border rounded px-3 py-2 text-terminal-primary-light font-mono text-sm focus:outline-none focus:border-terminal-primary-mid"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-terminal-text-dimmer">
              DIFFICULTY
              <input
                type="number"
                value={difficulty}
                onChange={e => setDifficulty(Number(e.target.value))}
                className="bg-terminal-bg-darker border border-terminal-bg-border rounded px-3 py-2 text-terminal-primary-light font-mono text-sm focus:outline-none focus:border-terminal-primary-mid"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-xs text-terminal-text-dimmer">
            NOTES (optional)
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="bg-terminal-bg-darker border border-terminal-bg-border rounded px-3 py-2 text-terminal-text-muted font-mono text-sm focus:outline-none focus:border-terminal-primary-mid resize-none"
            />
          </label>
        </div>

        <div className="flex gap-3 p-4 border-t border-terminal-bg-border">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded text-xs font-mono transition-all border border-terminal-bg-border text-terminal-text-dimmer bg-terminal-primary-light/5 hover:bg-terminal-primary-light/10 hover:text-terminal-primary-light"
          >
            CANCEL
          </button>
          <button
            onClick={handleRun}
            className="flex-1 py-2.5 rounded text-xs font-mono transition-all border border-terminal-primary-mid text-terminal-primary-light bg-terminal-primary-light/20 hover:bg-terminal-primary-light/30 hover:shadow-[0_0_15px_rgba(58, 226, 179,0.3)]"
          >
            RUN SCAN
          </button>
        </div>
      </div>
    </div>
  );
}
