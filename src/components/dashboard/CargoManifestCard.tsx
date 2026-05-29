import React, { useMemo } from "react";
import { useTrade } from "@/contexts/TradeContext";
import { Vehicle } from "@/types/database";

interface CargoManifestCardProps {
  activeShip: Vehicle | null;
}

export default function CargoManifestCard({ activeShip }: CargoManifestCardProps) {
  const { tradeGoods } = useTrade();

  const cargo = useMemo(() => {
    const inCargo = (tradeGoods ?? []).filter(g => g.status === "in_cargo");
    if (activeShip) {
      const shipCargo = inCargo.filter(g => g.vehicle_id === activeShip.id);
      return shipCargo.length > 0 ? shipCargo : inCargo;
    }
    return inCargo;
  }, [tradeGoods, activeShip]);

  const usedTons = useMemo(() => cargo.reduce((s, g) => s + (g.tons ?? 0), 0), [cargo]);
  const capacity = activeShip?.cargo_capacity ?? null;
  const pct = capacity ? Math.min(100, Math.round((usedTons / capacity) * 100)) : null;
  const isNearFull = pct !== null && pct >= 80;
  const isFull = pct !== null && pct >= 100;

  const badge = isFull
    ? { text: "FULL", cls: "text-terminal-danger border-terminal-danger/40 bg-terminal-danger/10 animate-pulse" }
    : isNearFull
    ? { text: "NEAR CAPACITY", cls: "text-terminal-warning border-terminal-warning/40 bg-terminal-warning/10 animate-pulse" }
    : cargo.length === 0
    ? { text: "EMPTY", cls: "text-terminal-primary/30 border-terminal-primary/10" }
    : { text: "IN TRANSIT", cls: "text-terminal-primary border-terminal-primary/30 bg-terminal-primary/10" };

  const barColor = isFull
    ? "linear-gradient(90deg, #cc1122, var(--danger))"
    : isNearFull
    ? "linear-gradient(90deg, #cc7700, var(--warning))"
    : "linear-gradient(90deg, color-mix(in srgb, var(--primary) 70%, transparent), var(--primary))";

  return (
    <div className="dash-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-terminal-primary/40 text-base">▣</span>
          <span className="text-[9px] font-mono tracking-[0.2em] text-terminal-primary/40 uppercase">Cargo Manifest</span>
        </div>
        <span className={`text-[8px] font-mono border px-1.5 py-0.5 rounded-sm ${badge.cls}`}>{badge.text}</span>
      </div>

      <div className="mb-1">
        <span
          className="font-display tabular-nums"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.4rem",
            fontWeight: 900,
            lineHeight: 1,
            color: isNearFull ? "var(--warning)" : "var(--primary)",
            textShadow: "0 0 16px color-mix(in srgb, var(--primary) 40%, transparent)",
          }}
        >
          {usedTons}t
        </span>
        <p className="text-[9px] font-mono text-terminal-primary/30 uppercase tracking-wider mt-0.5">
          {capacity ? `of ${capacity}t hold capacity` : "cargo on board"}
        </p>
      </div>

      <div className="dash-card-divider" />

      {capacity && (
        <div className="relative h-2 rounded-[1px] overflow-hidden mb-2" style={{ background: "color-mix(in srgb, var(--primary) 8%, transparent)" }}>
          <div
            className="h-full rounded-[1px] transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: barColor,
              boxShadow: `0 0 6px ${isNearFull ? "var(--warning)" : "var(--primary)"}`,
            }}
          />
          {[25, 50, 75].map(tick => (
            <div key={tick} className="absolute top-0 bottom-0 w-px opacity-20" style={{ left: `${tick}%`, background: "var(--bg-darker)" }} />
          ))}
        </div>
      )}

      {cargo.length === 0 ? (
        <p className="text-[9px] font-mono text-terminal-primary/30 italic">No cargo on board</p>
      ) : (
        <div className="space-y-1">
          {cargo.slice(0, 5).map(g => (
            <div key={g.id} className="flex items-baseline justify-between text-[9px] font-mono gap-2">
              <span className="text-terminal-primary/70 truncate flex-1">{g.name}</span>
              <span className="text-terminal-primary/40 flex-shrink-0 tabular-nums">{g.tons}t</span>
              {g.purchase_world && (
                <span className="text-terminal-primary/25 flex-shrink-0 text-[8px]">from {g.purchase_world}</span>
              )}
            </div>
          ))}
          {cargo.length > 5 && (
            <p className="text-[8px] font-mono text-terminal-primary/30">+{cargo.length - 5} more lots</p>
          )}
        </div>
      )}
    </div>
  );
}
