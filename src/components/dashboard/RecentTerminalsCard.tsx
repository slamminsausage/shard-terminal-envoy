import React from "react";
import { useTerminalHistory } from "@/hooks/useTerminalHistory";

const SEV_COLORS = [
  "text-terminal-primary/70",
  "text-terminal-warning",
  "text-terminal-danger",
  "text-terminal-secondary",
  "text-terminal-primary/50",
  "text-terminal-primary/50",
];

export default function RecentTerminalsCard() {
  const { history } = useTerminalHistory();
  const shown = history.slice(0, 6);

  return (
    <div className="dash-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-terminal-primary/40 font-mono text-sm">&gt;_</span>
          <span className="text-[9px] font-mono tracking-[0.2em] text-terminal-primary/40 uppercase">Recent Terminals</span>
        </div>
        <span className="text-[8px] font-mono border px-1.5 py-0.5 rounded-sm text-terminal-primary/40 border-terminal-primary/20 bg-terminal-primary/5">
          {history.length} ENTRIES
        </span>
      </div>

      <div className="dash-card-divider" />

      {shown.length === 0 ? (
        <p className="text-[9px] font-mono text-terminal-primary/30 italic">No terminal history</p>
      ) : (
        <div className="space-y-1">
          {shown.map((entry, i) => (
            <div key={entry.terminalCode + i} className="flex items-start gap-2">
              <span className="text-[8px] font-mono text-terminal-primary/25 flex-shrink-0 tabular-nums w-20 truncate">
                {entry.lastAccessed ? new Date(entry.lastAccessed).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
              </span>
              <span className={`text-[9px] font-mono truncate ${SEV_COLORS[i % SEV_COLORS.length]}`}>
                [{entry.terminalCode}] {entry.terminalName}
              </span>
            </div>
          ))}
          <span className="inline-block text-terminal-primary font-mono text-xs animate-[blink_1.1s_step-end_infinite]">▋</span>
        </div>
      )}
    </div>
  );
}
