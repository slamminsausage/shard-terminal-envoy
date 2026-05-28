import React from "react";
import { Character, Vehicle } from "@/types/database";

interface SystemStatusFooterProps {
  characters: Character[];
  vehicle: Vehicle | null;
  activeQuestCount: number;
  balance: number | null;
}

function formatCr(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M Cr`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}k Cr`;
  return `${n} Cr`;
}

function Dot({ warn }: { warn?: boolean }) {
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full align-middle mx-1 ${warn ? "bg-terminal-warning animate-pulse" : "bg-terminal-primary animate-pulse"}`}
    />
  );
}

export default function SystemStatusFooter({ characters, vehicle, activeQuestCount, balance }: SystemStatusFooterProps) {
  const hullPct = vehicle
    ? Math.round(((vehicle.hull_current ?? vehicle.hull) / Math.max(vehicle.hull, 1)) * 100)
    : null;
  const hullWarn = hullPct !== null && hullPct < 60;

  return (
    <div className="border-t border-terminal-border/10 px-4 py-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[8px] font-mono text-terminal-primary/30 uppercase tracking-widest">
      <span><Dot /> SYS ONLINE</span>
      <span><Dot /> DB CONNECTED</span>
      <span><Dot /> {characters.length} CREW ACTIVE</span>
      {hullPct !== null && (
        <span><Dot warn={hullWarn} /> HULL {hullPct}%</span>
      )}
      <span><Dot warn={activeQuestCount > 3} /> {activeQuestCount} ACTIVE MISSIONS</span>
      {balance !== null && (
        <span><Dot warn={balance < 10_000} /> {formatCr(balance)}</span>
      )}
      <span><Dot /> CAMPAIGN: ECLIPSE SHARD v2.4</span>
    </div>
  );
}
