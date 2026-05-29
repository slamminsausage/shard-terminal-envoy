import React, { useEffect, useState } from "react";
import { useJumpPlanner } from "@/contexts/JumpPlannerContext";
import { getWorldData, parseUWP } from "@/lib/travellerMapApi";
import { JumpWorld } from "@/types/navigation";

interface WorldStatusCardProps {
  onNavigate?: () => void;
}

const CAMPAIGN_STATUS: Record<string, { label: string; color: string }> = {
  SAFE_HAVEN: { label: "SAFE HAVEN", color: "var(--primary)" },
  ALLIED:     { label: "ALLIED",     color: "var(--primary)" },
  NEUTRAL:    { label: "NEUTRAL",    color: "var(--text-muted)" },
  UNFRIENDLY: { label: "UNFRIENDLY", color: "var(--warning)" },
  CONTESTED:  { label: "CONTESTED",  color: "var(--warning)" },
  RESTRICTED: { label: "RESTRICTED", color: "var(--warning)" },
  PIRATE_BASE:{ label: "PIRATE BASE",color: "var(--danger)" },
  UNKNOWN:    { label: "UNKNOWN",    color: "var(--text-dimmer)" },
};

export default function WorldStatusCard({ onNavigate }: WorldStatusCardProps) {
  const { playerLocation, currentNote } = useJumpPlanner();
  const [worldData, setWorldData] = useState<JumpWorld | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!playerLocation?.sector || !playerLocation?.hex) {
      setWorldData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getWorldData(playerLocation.sector, playerLocation.hex)
      .then(data => { if (!cancelled) { setWorldData(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [playerLocation?.sector, playerLocation?.hex]);

  const uwp = worldData?.uwp ? parseUWP(worldData.uwp) : null;
  const worldName = worldData?.name ?? playerLocation?.worldName ?? null;
  const zone = worldData?.zone;
  const zoneLabel = !zone ? "GREEN" : (zone === "A" || zone === "R") ? "AMBER" : "RED";
  const zoneColor = !zone ? "var(--primary)" : (zone === "A" || zone === "R") ? "var(--warning)" : "var(--danger)";
  const noteStatus = currentNote?.status;
  const statusInfo = noteStatus ? CAMPAIGN_STATUS[noteStatus] : null;

  return (
    <div className="dash-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-terminal-primary/40 text-base">✦</span>
          <span className="text-[9px] font-mono tracking-[0.2em] text-terminal-primary/40 uppercase">Current System</span>
        </div>
        <div className="flex items-center gap-1.5">
          {statusInfo && (
            <span
              className="text-[8px] font-mono border px-1.5 py-0.5 rounded-sm"
              style={{ color: statusInfo.color, borderColor: `color-mix(in srgb, ${statusInfo.color} 40%, transparent)`, backgroundColor: `color-mix(in srgb, ${statusInfo.color} 10%, transparent)` }}
            >
              {statusInfo.label}
            </span>
          )}
          {onNavigate && (
            <button
              onClick={onNavigate}
              className="text-[8px] font-mono text-terminal-primary/30 hover:text-terminal-primary transition-colors"
            >
              → NAV
            </button>
          )}
        </div>
      </div>

      {!playerLocation ? (
        <p className="text-[9px] font-mono text-terminal-primary/30 italic py-4 text-center">
          No position set — use Star Map to mark location
        </p>
      ) : (
        <>
          <div className="mb-1">
            <span
              className="font-display block truncate"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.6rem",
                fontWeight: 900,
                lineHeight: 1.1,
                color: "var(--primary)",
                textShadow: "0 0 16px color-mix(in srgb, var(--primary) 40%, transparent)",
              }}
            >
              {loading ? "SCANNING..." : (worldName ?? "UNKNOWN SYSTEM")}
            </span>
            <p className="text-[9px] font-mono text-terminal-primary/30 uppercase tracking-wider mt-0.5">
              {playerLocation.sectorAbbr ?? playerLocation.sector} · {playerLocation.hex}
            </p>
          </div>

          <div className="dash-card-divider" />

          {uwp ? (
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] font-mono mb-1.5">
                <span className="text-terminal-primary/40">UWP</span>
                <span className="text-terminal-primary/80 font-bold tracking-[0.2em]">{worldData!.uwp}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                {[
                  { label: "Starport",   value: uwp.starport },
                  { label: "Tech Level", value: uwp.techLevel },
                  { label: "Atmosphere", value: uwp.atmosphere },
                  { label: "Population", value: uwp.population },
                  { label: "Law Level",  value: uwp.lawLevel },
                  { label: "Government", value: uwp.government },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-[9px] font-mono">
                    <span className="text-terminal-primary/30">{label}</span>
                    <span className="text-terminal-primary/70">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] font-mono mt-1 pt-1 border-t border-terminal-primary/10">
                <span className="text-terminal-primary/40">Travel Zone</span>
                <span style={{ color: zoneColor }}>{zoneLabel}</span>
              </div>
              {worldData?.allegiance && (
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-terminal-primary/40">Allegiance</span>
                  <span className="text-terminal-primary/60">{worldData.allegiance}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[9px] font-mono text-terminal-primary/30 italic py-2">
              {loading ? "Querying stellar database..." : "No world data on record"}
            </p>
          )}
        </>
      )}
    </div>
  );
}
