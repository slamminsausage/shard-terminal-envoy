import React from "react";
import { Quest } from "@/types/quest";

interface ActiveQuestsCardProps {
  quests: Quest[];
}

function dotClass(q: Quest) {
  if (q.priority === "urgent") return "bg-terminal-danger animate-[crit-flash_0.8s_ease-in-out_infinite] border-terminal-danger";
  if (q.priority === "high")   return "bg-terminal-warning animate-pulse border-terminal-warning";
  if (q.status === "completed") return "bg-terminal-primary/20 border-terminal-primary/20";
  return "bg-terminal-primary animate-pulse border-terminal-primary";
}

export default function ActiveQuestsCard({ quests }: ActiveQuestsCardProps) {
  const shown = quests.slice(0, 5);
  const overflow = quests.length - shown.length;

  return (
    <div className="dash-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-terminal-primary/40 text-base">◈</span>
          <span className="text-[9px] font-mono tracking-[0.2em] text-terminal-primary/40 uppercase">Active Quests</span>
        </div>
        <span className="text-[8px] font-mono border px-1.5 py-0.5 rounded-sm text-terminal-secondary border-terminal-secondary/30 bg-terminal-secondary/10">
          {quests.length} OPEN
        </span>
      </div>

      <div className="mb-1">
        <span
          className="text-terminal-primary font-display tabular-nums"
          style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", fontWeight: 900, lineHeight: 1, textShadow: "0 0 16px color-mix(in srgb, var(--primary) 40%, transparent)" }}
        >
          {quests.length}
        </span>
        <p className="text-[9px] font-mono text-terminal-primary/30 uppercase tracking-wider mt-0.5">missions in progress</p>
      </div>

      <div className="dash-card-divider" />

      {quests.length === 0 ? (
        <p className="text-[9px] font-mono text-terminal-primary/30 italic">No active missions</p>
      ) : (
        <div className="space-y-1.5">
          {shown.map(q => (
            <div key={q.id} className="flex items-start gap-2">
              <span className={`mt-0.5 inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 border ${dotClass(q)}`} />
              <div className="min-w-0">
                <p className="text-[9px] font-mono text-terminal-primary/80 truncate">{q.title}</p>
                <p className="text-[8px] font-mono text-terminal-primary/30 uppercase">{q.category} · {q.priority}</p>
              </div>
            </div>
          ))}
          {overflow > 0 && (
            <p className="text-[8px] font-mono text-terminal-primary/30">+{overflow} more missions</p>
          )}
        </div>
      )}
    </div>
  );
}
