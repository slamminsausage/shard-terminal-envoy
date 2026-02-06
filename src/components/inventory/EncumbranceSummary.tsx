/**
 * EncumbranceSummary - Auto-calculated carried mass from all equipment.
 *
 * Reads weapon, armor, and equipment rows to compute total mass.
 * Applies Traveller encumbrance rules based on STR.
 */

import { useMemo } from "react";
import type { WeaponRow } from "./WeaponTable";
import type { ArmourRow } from "./ArmorTable";
import type { EquipmentRow } from "./EquipmentTable";
import { getArmorById } from "@/data/items";

interface EncumbranceSummaryProps {
  weapons: WeaponRow[];
  armour: ArmourRow[];
  equipment: EquipmentRow[];
  strengthScore: number;
}

function parseKg(value: string): number {
  if (!value || value === "-") return 0;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

export function EncumbranceSummary({
  weapons,
  armour,
  equipment,
  strengthScore,
}: EncumbranceSummaryProps) {
  const { totalMass, level, penalty } = useMemo(() => {
    let total = 0;

    // Weapons
    for (const w of weapons) {
      if (w.weapon.trim()) total += parseKg(w.kg);
    }

    // Armor (account for powered armor being 0 when worn)
    for (const a of armour) {
      if (!a.type.trim()) continue;
      if (a.catalogId) {
        const detail = getArmorById(a.catalogId);
        if (detail?.isPowered) continue; // Powered armor supports its own weight
      }
      total += parseKg(a.kg);
    }

    // Equipment
    for (const e of equipment) {
      if (e.item.trim()) total += parseKg(e.mass);
    }

    const str = strengthScore || 7;
    const lightThreshold = str * 2;
    const heavyThreshold = str * 4;
    const maxThreshold = str * 6;

    let lvl: "none" | "light" | "heavy" | "overloaded" = "none";
    let pen = 0;

    if (total > maxThreshold) {
      lvl = "overloaded";
      pen = -3;
    } else if (total > heavyThreshold) {
      lvl = "heavy";
      pen = -2;
    } else if (total > lightThreshold) {
      lvl = "light";
      pen = -1;
    }

    return { totalMass: total, level: lvl, penalty: pen };
  }, [weapons, armour, equipment, strengthScore]);

  const levelColors = {
    none: "text-green-400",
    light: "text-yellow-400",
    heavy: "text-orange-400",
    overloaded: "text-red-400",
  };

  const levelLabels = {
    none: "UNENCUMBERED",
    light: "LIGHT LOAD",
    heavy: "HEAVY LOAD",
    overloaded: "OVERLOADED",
  };

  return (
    <div className="panel flex flex-col">
      <div className="panel-header">
        <span className="panel-title">CARRIED MASS</span>
      </div>
      <div className="panel-content flex-1 flex flex-col items-center justify-center gap-1 py-3">
        <div className="text-lg font-mono font-bold text-primary">
          {totalMass.toFixed(1)} kg
        </div>
        <div className={`text-[10px] font-mono font-semibold ${levelColors[level]}`}>
          {levelLabels[level]}
          {penalty !== 0 && ` (DM${penalty} physical)`}
        </div>
        <div className="text-[9px] text-muted-foreground">
          Light: {(strengthScore || 7) * 2}kg | Heavy: {(strengthScore || 7) * 4}kg | Max: {(strengthScore || 7) * 6}kg
        </div>
      </div>
    </div>
  );
}
