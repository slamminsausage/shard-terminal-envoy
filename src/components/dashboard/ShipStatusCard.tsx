import React, { useMemo } from "react";
import { Vehicle } from "@/types/database";

interface ShipStatusCardProps {
  vehicle: Vehicle | null;
}

const GRID_CELLS = 40;

export default function ShipStatusCard({ vehicle }: ShipStatusCardProps) {
  const hullPct = vehicle
    ? Math.round(((vehicle.hull_current ?? vehicle.hull) / Math.max(vehicle.hull, 1)) * 100)
    : 0;

  const filledCells = vehicle ? Math.round((hullPct / 100) * GRID_CELLS) : 0;
  const isCrit = hullPct < 30;
  const isWarn = hullPct < 60;

  const cells = useMemo(() => {
    return Array.from({ length: GRID_CELLS }, (_, i) => {
      if (i < filledCells) {
        if (isCrit) return "crit";
        if (isWarn && i >= filledCells - 4) return "dmg";
        return "ok";
      }
      return "empty";
    });
  }, [filledCells, isCrit, isWarn]);

  const badge = hullPct >= 60
    ? { text: "OPERATIONAL", cls: "text-terminal-primary border-terminal-primary/30 bg-terminal-primary/10" }
    : hullPct >= 30
    ? { text: "DAMAGED", cls: "text-terminal-warning border-terminal-warning/40 bg-terminal-warning/10 animate-pulse" }
    : { text: "CRITICAL", cls: "text-terminal-danger border-terminal-danger/40 bg-terminal-danger/10 animate-pulse" };

  const jumpRating = vehicle?.jump_rating ?? 0;
  const fuelPct = vehicle
    ? Math.round(((vehicle.fuel_capacity ?? 0) > 0 ? 100 : 0))
    : 0;

  return (
    <div className="dash-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-terminal-primary/40 text-base">△</span>
          <span className="text-[9px] font-mono tracking-[0.2em] text-terminal-primary/40 uppercase">Ship Status</span>
        </div>
        <span className={`text-[8px] font-mono border px-1.5 py-0.5 rounded-sm ${badge.cls}`}>{badge.text}</span>
      </div>

      {!vehicle ? (
        <p className="text-[9px] font-mono text-terminal-primary/30 italic py-4">No ship on record</p>
      ) : (
        <>
          <div className="mb-1">
            <span
              className="font-display tabular-nums"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2.4rem",
                fontWeight: 900,
                lineHeight: 1,
                color: isCrit ? "var(--danger)" : isWarn ? "var(--warning)" : "var(--primary)",
                textShadow: `0 0 16px ${isCrit ? "color-mix(in srgb, var(--danger) 40%, transparent)" : "color-mix(in srgb, var(--primary) 40%, transparent)"}`,
              }}
            >
              {hullPct}%
            </span>
            <p className="text-[9px] font-mono text-terminal-primary/30 uppercase tracking-wider mt-0.5 truncate">
              hull integrity — {vehicle.class_type || vehicle.vehicle_type} '{vehicle.name}'
            </p>
          </div>

          <div className="dash-card-divider" />

          {/* Hull grid 10×4 */}
          <div className="grid gap-[2px] mb-2" style={{ gridTemplateColumns: "repeat(10, 1fr)" }}>
            {cells.map((state, i) => (
              <div
                key={i}
                className={`h-2 rounded-[1px] ${
                  state === "ok"    ? "hull-cell" :
                  state === "dmg"   ? "hull-cell--damaged" :
                  state === "crit"  ? "hull-cell--critical" :
                  "bg-terminal-primary/5 border border-terminal-primary/10"
                }`}
              />
            ))}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-terminal-primary/40">Jump Drive</span>
              <span className="text-terminal-primary/70">{jumpRating > 0 ? `READY J-${jumpRating}` : "N/A"}</span>
            </div>
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-terminal-primary/40">Fuel</span>
              <span className={fuelPct < 40 ? "text-terminal-warning" : "text-terminal-primary/70"}>
                {vehicle.fuel_capacity ? `${vehicle.fuel_capacity}t` : "—"}
              </span>
            </div>
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-terminal-primary/40">Cargo</span>
              <span className="text-terminal-primary/70">{vehicle.cargo_capacity ? `${vehicle.cargo_capacity}t` : "—"}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
