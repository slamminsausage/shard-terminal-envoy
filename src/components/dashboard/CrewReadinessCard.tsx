import React from "react";
import { Character } from "@/types/database";

interface CrewReadinessCardProps {
  characters: Character[];
}

function readinessPct(c: Character): number {
  const curStr = c.current_strength ?? c.strength;
  const curEnd = c.current_endurance ?? c.endurance;
  const curDex = c.current_dexterity ?? c.dexterity;
  const total = (c.strength || 1) + (c.endurance || 1) + (c.dexterity || 1);
  return Math.round(((curStr + curEnd + curDex) / total) * 100);
}

function barClass(pct: number) {
  if (pct < 30) return "danger";
  if (pct < 75) return "warning";
  return "";
}

function badgeLabel(characters: Character[]) {
  const crit = characters.filter(c => readinessPct(c) < 30).length;
  if (crit > 0) return { text: `${crit} CRITICAL`, cls: "text-terminal-danger border-terminal-danger/40 bg-terminal-danger/10 animate-pulse" };
  const warn = characters.filter(c => readinessPct(c) < 75).length;
  if (warn > 0) return { text: `${warn} INJURED`, cls: "text-terminal-warning border-terminal-warning/40 bg-terminal-warning/10" };
  return { text: "COMBAT READY", cls: "text-terminal-primary border-terminal-primary/30 bg-terminal-primary/10" };
}

export default function CrewReadinessCard({ characters }: CrewReadinessCardProps) {
  const ready = characters.filter(c => readinessPct(c) >= 75).length;
  const badge = badgeLabel(characters);
  const shown = characters.slice(0, 4);

  return (
    <div className="dash-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-terminal-primary/40 text-base">◉</span>
          <span className="text-[9px] font-mono tracking-[0.2em] text-terminal-primary/40 uppercase">Crew Readiness</span>
        </div>
        <span className={`text-[8px] font-mono border px-1.5 py-0.5 rounded-sm ${badge.cls}`}>{badge.text}</span>
      </div>

      <div className="mb-1">
        <span
          className="text-terminal-primary font-display tabular-nums"
          style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", fontWeight: 900, lineHeight: 1, textShadow: "0 0 16px color-mix(in srgb, var(--primary) 40%, transparent)" }}
        >
          {characters.length === 0 ? "0/0" : `${ready}/${characters.length}`}
        </span>
        <p className="text-[9px] font-mono text-terminal-primary/30 uppercase tracking-wider mt-0.5">personnel combat-ready</p>
      </div>

      <div className="dash-card-divider" />

      {characters.length === 0 ? (
        <p className="text-[9px] font-mono text-terminal-primary/30 italic">No crew records found</p>
      ) : (
        <div className="space-y-1.5">
          {shown.map(c => {
            const pct = readinessPct(c);
            const bc = barClass(pct);
            return (
              <div key={c.id} className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-terminal-primary/60 w-20 truncate flex-shrink-0">{c.name}</span>
                <div className="power-bar flex-1">
                  <div className={`power-bar-fill ${bc}`} style={{ width: `${pct}%` }} />
                </div>
                <span className={`text-[9px] font-mono tabular-nums w-8 text-right ${bc === "danger" ? "text-terminal-danger" : bc === "warning" ? "text-terminal-warning" : "text-terminal-primary/70"}`}>{pct}%</span>
              </div>
            );
          })}
          {characters.length > 4 && (
            <p className="text-[8px] font-mono text-terminal-primary/30">+{characters.length - 4} more personnel</p>
          )}
        </div>
      )}
    </div>
  );
}
