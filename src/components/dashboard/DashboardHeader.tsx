import React, { useEffect, useState } from "react";

interface DashboardHeaderProps {
  imperialDate?: string;
}

export default function DashboardHeader({ imperialDate }: DashboardHeaderProps) {
  const [localTime, setLocalTime] = useState("");

  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      const s = String(d.getSeconds()).padStart(2, "0");
      setLocalTime(`${h}:${m}:${s}`);
    };
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-3 pb-2">
      <div>
        <h1
          className="font-display text-terminal-primary uppercase tracking-widest"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
            textShadow: "0 0 20px color-mix(in srgb, var(--primary) 50%, transparent), 0 0 4px var(--primary)",
          }}
        >
          MISSION CONTROL
        </h1>
        <p className="text-[9px] font-mono tracking-[0.2em] text-terminal-primary/40 uppercase mt-0.5">
          Eclipse Shard Saga — Operational Overview
        </p>
      </div>
      <div className="text-right font-mono text-[10px] leading-relaxed">
        <div className="text-terminal-primary/40 uppercase tracking-widest">
          Imperial Date: <span className="text-terminal-primary/70">{imperialDate ?? "—"}</span>
        </div>
        <div className="text-terminal-primary/40 uppercase tracking-widest">
          Local Time: <span className="text-terminal-primary font-bold tabular-nums">{localTime}</span>
        </div>
        <div className="text-terminal-primary/30 uppercase tracking-widest text-[9px]">
          Starport Class A · Highport
        </div>
      </div>
    </div>
  );
}
