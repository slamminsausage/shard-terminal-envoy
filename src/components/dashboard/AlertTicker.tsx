import React, { useState } from "react";

export interface AlertEntry {
  id: string;
  text: string;
  severity: "ok" | "warn" | "crit" | "info";
}

interface AlertTickerProps {
  alerts: AlertEntry[];
}

const SEV_CLASS: Record<AlertEntry["severity"], string> = {
  ok:   "text-terminal-primary/70",
  warn: "text-terminal-warning",
  crit: "text-terminal-danger",
  info: "text-terminal-secondary",
};

export default function AlertTicker({ alerts }: AlertTickerProps) {
  const [paused, setPaused] = useState(false);

  const items = alerts.length > 0 ? alerts : [
    { id: "ok", text: "ALL SYSTEMS NOMINAL — ECLIPSE SHARD CAMPAIGN ACTIVE", severity: "ok" as const },
  ];

  const tickerContent = items.map((a, i) => (
    <React.Fragment key={a.id + i}>
      <span className={`${SEV_CLASS[a.severity]} font-mono text-[10px] tracking-widest`}>
        {a.severity === "crit" && <span className="animate-[crit-flash_0.8s_ease-in-out_infinite] mr-1">⚠</span>}
        {a.severity === "warn" && <span className="mr-1">⚠</span>}
        {a.text}
      </span>
      <span className="mx-4 text-terminal-primary/20 font-mono text-[10px]">◆◆◆</span>
    </React.Fragment>
  ));

  return (
    <div
      className="h-7 flex items-center overflow-hidden bg-black/40 border-b border-terminal-border/20 relative select-none"
      style={{ maskImage: "linear-gradient(90deg, transparent 0px, black 40px, black calc(100% - 40px), transparent 100%)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex-shrink-0 px-2 text-[9px] font-mono tracking-[0.2em] text-terminal-warning border-r border-terminal-border/20 mr-2 h-full flex items-center bg-black/20">
        <span className="animate-pulse mr-1">⚠</span>ALERTS
      </div>
      <div
        className={`alert-ticker-track${paused ? " paused" : ""}`}
        aria-live="off"
      >
        {tickerContent}
        {tickerContent}
      </div>
    </div>
  );
}
