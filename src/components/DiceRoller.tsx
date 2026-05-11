import React, { useState, useCallback, useEffect, useRef } from "react";
import { roll2d6, rollWithBoon, rollWithBane, roll1d6, rollDamageExpression } from "@/lib/dice";
import { cn } from "@/lib/utils";

interface RollRecord {
  id: number;
  label: string;
  total: number;
  detail: string;
  timestamp: number;
}

let rollId = 0;

export function DiceRoller() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"normal" | "boon" | "bane">("normal");
  const [expr, setExpr] = useState("2d6");
  const [history, setHistory] = useState<RollRecord[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const addRoll = useCallback((record: Omit<RollRecord, "id" | "timestamp">) => {
    setHistory(prev => [{ ...record, id: ++rollId, timestamp: Date.now() }, ...prev].slice(0, 8));
  }, []);

  const rollQuick = useCallback((sides: number) => {
    const result = sides === 6 ? roll1d6() : Math.floor(Math.random() * sides) + 1;
    addRoll({ label: `d${sides}`, total: result, detail: `= ${result}` });
  }, [addRoll]);

  const rollMain = useCallback(() => {
    const trimmed = expr.trim() || "2d6";
    if (trimmed.toLowerCase() === "2d6") {
      if (mode === "boon") {
        const r = rollWithBoon();
        addRoll({ label: "2d6 boon", total: r.total, detail: `[${r.rolls.join(", ")}] keep [${r.kept.join(", ")}] = ${r.total}` });
      } else if (mode === "bane") {
        const r = rollWithBane();
        addRoll({ label: "2d6 bane", total: r.total, detail: `[${r.rolls.join(", ")}] keep [${r.kept.join(", ")}] = ${r.total}` });
      } else {
        const total = roll2d6();
        addRoll({ label: "2d6", total, detail: `= ${total}` });
      }
      return;
    }
    try {
      const r = rollDamageExpression(trimmed);
      const diceStr = r.diceResults.length > 0 ? `[${r.diceResults.join(", ")}]` : "";
      addRoll({ label: trimmed, total: r.total, detail: `${diceStr} = ${r.total}` });
    } catch {
      // ignore malformed expressions
    }
  }, [expr, mode, addRoll]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Keyboard shortcut: press `R` outside of inputs to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return;
      if (e.key === "r" || e.key === "R") setOpen(v => !v);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const lastRoll = history[0];

  return (
    <div className="fixed bottom-4 right-4 z-[9700] flex flex-col items-end gap-2 pointer-events-none">
      {open && (
        <div
          ref={panelRef}
          className="pointer-events-auto w-64 rounded border border-terminal-primary/40 bg-black/95 backdrop-blur shadow-xl shadow-black/60 overflow-hidden font-mono text-xs"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-terminal-primary/20 bg-terminal-primary/5">
            <span className="text-terminal-primary tracking-widest text-[10px]">DICE ROLLER</span>
            <span className="text-terminal-primary/40 text-[9px]">R to toggle</span>
          </div>

          {/* Expression input */}
          <div className="px-3 pt-2.5 pb-1 flex gap-2">
            <input
              value={expr}
              onChange={e => setExpr(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") rollMain(); }}
              className="flex-1 bg-black border border-terminal-primary/30 rounded px-2 py-1 text-terminal-primary text-xs font-mono focus:border-terminal-primary/70 outline-none"
              placeholder="2d6, 3d6+2, ..."
            />
            <button
              onClick={rollMain}
              className="px-3 py-1 bg-terminal-primary/15 border border-terminal-primary/40 rounded text-terminal-primary hover:bg-terminal-primary/25 transition-colors text-xs"
            >
              Roll
            </button>
          </div>

          {/* Mode toggles */}
          <div className="flex gap-1 px-3 pb-2">
            {(["normal", "boon", "bane"] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 py-0.5 rounded border text-[10px] uppercase tracking-wider transition-colors",
                  mode === m
                    ? "border-terminal-primary/60 bg-terminal-primary/20 text-terminal-primary"
                    : "border-terminal-primary/20 text-terminal-primary/40 hover:text-terminal-primary/60"
                )}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Quick-roll buttons */}
          <div className="flex gap-1 px-3 pb-2">
            {[4, 6, 8, 10, 12, 20].map(d => (
              <button
                key={d}
                onClick={() => rollQuick(d)}
                className="flex-1 py-1 rounded border border-terminal-primary/20 text-terminal-primary/60 hover:text-terminal-primary hover:border-terminal-primary/50 text-[10px] transition-colors"
              >
                d{d}
              </button>
            ))}
          </div>

          {/* Roll history */}
          {history.length > 0 && (
            <div className="border-t border-terminal-primary/20 px-3 py-2 flex flex-col gap-1 max-h-40 overflow-y-auto">
              {history.map((r, i) => (
                <div
                  key={r.id}
                  className={cn("flex items-baseline justify-between gap-2", i === 0 ? "text-terminal-primary" : "text-terminal-primary/40")}
                >
                  <span className="truncate">{r.label}</span>
                  <span className={cn("font-bold flex-shrink-0", i === 0 ? "text-base" : "text-xs")}>{r.total}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating trigger button */}
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        title="Dice Roller (R)"
        className={cn(
          "pointer-events-auto w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg transition-all shadow-lg",
          open
            ? "border-terminal-primary bg-terminal-primary/20 text-terminal-primary shadow-[0_0_16px_var(--primary)]"
            : "border-terminal-primary/40 bg-black/80 text-terminal-primary/60 hover:border-terminal-primary/70 hover:text-terminal-primary"
        )}
      >
        ⚄
      </button>

      {/* Last result badge */}
      {!open && lastRoll && (
        <div className="pointer-events-none absolute bottom-11 right-0 text-[10px] font-mono text-terminal-primary bg-black/80 border border-terminal-primary/30 rounded px-1.5 py-0.5">
          {lastRoll.label}: <span className="font-bold">{lastRoll.total}</span>
        </div>
      )}
    </div>
  );
}
