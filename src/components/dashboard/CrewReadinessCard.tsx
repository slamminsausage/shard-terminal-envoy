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

// Thresholds: CRITICAL <25% | INJURED 25–49% | IMPAIRED 50–74% | READY ≥75%
function statusInfo(pct: number): {
  label: string;
  color: string;        // CSS color value for bar fill + text
  glow: string;         // box-shadow glow
  bg: string;           // bar track tint
  pulse: boolean;
} {
  if (pct < 25) return {
    label: "CRITICAL",
    color: "var(--danger)",
    glow: "0 0 8px var(--danger)",
    bg: "color-mix(in srgb, var(--danger) 12%, transparent)",
    pulse: true,
  };
  if (pct < 50) return {
    label: "INJURED",
    color: "var(--warning)",
    glow: "0 0 8px var(--warning)",
    bg: "color-mix(in srgb, var(--warning) 10%, transparent)",
    pulse: false,
  };
  if (pct < 75) return {
    label: "IMPAIRED",
    color: "#c8d44a",   // yellow-green mid tone
    glow: "0 0 6px rgba(200,212,74,0.5)",
    bg: "color-mix(in srgb, #c8d44a 8%, transparent)",
    pulse: false,
  };
  return {
    label: "READY",
    color: "var(--primary)",
    glow: "0 0 8px color-mix(in srgb, var(--primary) 60%, transparent)",
    bg: "color-mix(in srgb, var(--primary) 10%, transparent)",
    pulse: false,
  };
}

function badgeLabel(characters: Character[]) {
  const crit = characters.filter(c => readinessPct(c) < 25).length;
  if (crit > 0) return { text: `${crit} CRITICAL`, cls: "text-terminal-danger border-terminal-danger/40 bg-terminal-danger/10 animate-pulse" };
  const injured = characters.filter(c => readinessPct(c) < 50).length;
  if (injured > 0) return { text: `${injured} INJURED`, cls: "text-terminal-warning border-terminal-warning/40 bg-terminal-warning/10 animate-pulse" };
  const impaired = characters.filter(c => readinessPct(c) < 75).length;
  if (impaired > 0) return { text: `${impaired} IMPAIRED`, cls: "text-[#c8d44a] border-[#c8d44a]/40 bg-[#c8d44a]/10" };
  return { text: "COMBAT READY", cls: "text-terminal-primary border-terminal-primary/30 bg-terminal-primary/10" };
}

export default function CrewReadinessCard({ characters }: CrewReadinessCardProps) {
  const ready = characters.filter(c => readinessPct(c) >= 75).length;
  const badge = badgeLabel(characters);
  const shown = characters.slice(0, 6);

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
          className="font-display tabular-nums"
          style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", fontWeight: 900, lineHeight: 1, color: "var(--primary)", textShadow: "0 0 16px color-mix(in srgb, var(--primary) 40%, transparent)" }}
        >
          {characters.length === 0 ? "0/0" : `${ready}/${characters.length}`}
        </span>
        <p className="text-[9px] font-mono text-terminal-primary/30 uppercase tracking-wider mt-0.5">personnel combat-ready</p>
      </div>

      <div className="dash-card-divider" />

      {characters.length === 0 ? (
        <p className="text-[9px] font-mono text-terminal-primary/30 italic">No crew records found</p>
      ) : (
        <div className="space-y-2">
          {shown.map(c => {
            const pct = readinessPct(c);
            const st = statusInfo(pct);
            return (
              <div key={c.id}>
                {/* Name row */}
                <div className="flex items-baseline justify-between mb-0.5">
                  <span className="text-[9px] font-mono truncate" style={{ color: st.color, maxWidth: "60%" }}>{c.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] font-mono tracking-widest opacity-60" style={{ color: st.color }}>{st.label}</span>
                    <span className="text-[9px] font-mono tabular-nums font-bold" style={{ color: st.color }}>{pct}%</span>
                  </div>
                </div>
                {/* Bar */}
                <div
                  className="relative h-2 rounded-[1px] overflow-hidden"
                  style={{ background: st.bg }}
                >
                  <div
                    className={`h-full rounded-[1px] transition-all duration-500${st.pulse ? " animate-[danger-pulse_0.7s_ease-in-out_infinite]" : ""}`}
                    style={{
                      width: `${pct}%`,
                      background: pct >= 75
                        ? `linear-gradient(90deg, color-mix(in srgb, var(--primary) 70%, transparent), var(--primary))`
                        : pct >= 50
                        ? `linear-gradient(90deg, #a0b030, #c8d44a)`
                        : pct >= 25
                        ? `linear-gradient(90deg, #cc7700, var(--warning))`
                        : `linear-gradient(90deg, #cc1122, var(--danger))`,
                      boxShadow: st.glow,
                    }}
                  />
                  {/* Threshold tick marks at 25 / 50 / 75% */}
                  {[25, 50, 75].map(tick => (
                    <div
                      key={tick}
                      className="absolute top-0 bottom-0 w-px opacity-30"
                      style={{ left: `${tick}%`, background: "var(--bg-darker)" }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          {characters.length > 6 && (
            <p className="text-[8px] font-mono text-terminal-primary/30">+{characters.length - 6} more personnel</p>
          )}
        </div>
      )}

      {/* Threshold legend */}
      {characters.length > 0 && (
        <div className="flex gap-3 mt-2 pt-1.5 border-t border-terminal-primary/10">
          {[
            { label: "Ready", color: "var(--primary)" },
            { label: "Impaired", color: "#c8d44a" },
            { label: "Injured", color: "var(--warning)" },
            { label: "Critical", color: "var(--danger)" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1">
              <span className="inline-block w-2 h-1.5 rounded-[1px]" style={{ background: color }} />
              <span className="text-[7px] font-mono uppercase tracking-wider" style={{ color }}>{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
