/**
 * ArmorTable - Catalog-backed armor management for character sheets.
 *
 * Users select armor from the catalog dropdown (auto-fills all fields)
 * or add custom entries. Backward compatible with old text-based data.
 */

import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  ARMOR_CATALOG,
  getArmorById,
  formatProtection,
  getEffectiveMass,
} from "@/data/items";
import type { ArmorCatalogItem } from "@/data/items";
import { CatalogItemPicker, type CatalogPickerItem } from "./CatalogItemPicker";

export type ArmourRow = {
  catalogId?: string;
  type: string;
  rad: string;
  protection: string;
  kg: string;
  options: string;
  total: string;
  notes?: string;
};

interface ArmorTableProps {
  armour: ArmourRow[];
  onChange: (armour: ArmourRow[]) => void;
}

/** Group armor into logical categories for the picker */
function getArmorGroup(armor: ArmorCatalogItem): string {
  if (armor.isPowered) return "Battle Dress";
  if (armor.id.startsWith("hev-")) return "HEV Suits";
  if (armor.id.startsWith("vacc-")) return "Vacc Suits";
  if (armor.id.startsWith("combat-")) return "Combat Armour";
  if (armor.id === "reflec" || armor.id === "ablat") return "Specialised";
  return "Light / Civilian";
}

function buildArmorPickerItems(): CatalogPickerItem[] {
  return ARMOR_CATALOG.map((a) => ({
    id: a.id,
    name: a.name,
    group: getArmorGroup(a),
    tl: a.tl,
    cost: a.cost,
    description: a.description,
  }));
}

function catalogToRow(armor: ArmorCatalogItem): ArmourRow {
  return {
    catalogId: armor.id,
    type: armor.name,
    rad: armor.rad > 0 ? String(armor.rad) : "-",
    protection: formatProtection(armor),
    kg: armor.mass_kg > 0 ? String(armor.mass_kg) : "-",
    options: "",
    total: formatProtection(armor),
  };
}

function emptyRow(): ArmourRow {
  return { type: "", rad: "", protection: "", kg: "", options: "", total: "" };
}

export function ArmorTable({ armour, onChange }: ArmorTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const pickerItems = useMemo(buildArmorPickerItems, []);

  const handleAddFromCatalog = useCallback(
    (catalogId: string) => {
      const armor = getArmorById(catalogId);
      if (!armor) return;
      const nonEmpty = armour.filter((a) => a.type.trim() !== "");
      onChange([...nonEmpty, catalogToRow(armor)]);
    },
    [armour, onChange],
  );

  const handleAddCustom = useCallback(() => {
    const nonEmpty = armour.filter((a) => a.type.trim() !== "");
    onChange([...nonEmpty, emptyRow()]);
  }, [armour, onChange]);

  const handleRemove = useCallback(
    (index: number) => {
      const next = armour.filter((_, i) => i !== index);
      onChange(next.length > 0 ? next : []);
      if (expandedRow === index) setExpandedRow(null);
    },
    [armour, onChange, expandedRow],
  );

  const handleFieldChange = useCallback(
    (index: number, field: keyof ArmourRow, value: string) => {
      const next = [...armour];
      next[index] = { ...next[index], [field]: value };
      onChange(next);
    },
    [armour, onChange],
  );

  const toggleExpand = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const getDetail = (row: ArmourRow): ArmorCatalogItem | undefined => {
    if (!row.catalogId) return undefined;
    return getArmorById(row.catalogId);
  };

  const activeArmour = armour.filter((a) => a.type.trim() !== "");

  return (
    <section className="panel">
      <div className="panel-header flex items-center gap-2">
        <span className="panel-title flex-1">ARMOUR</span>
        <CatalogItemPicker
          items={pickerItems}
          placeholder="Add Armour"
          onSelect={handleAddFromCatalog}
          onCustom={handleAddCustom}
        />
      </div>

      {activeArmour.length === 0 && (
        <div className="p-4 text-center text-xs text-muted-foreground">
          No armour equipped. Use "Add Armour" to select from the catalog or add a custom entry.
        </div>
      )}

      {activeArmour.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-primary/20 text-primary-foreground">
              <tr>
                {["", "Type", "RAD", "Protection", "KG", "Options", ""].map(
                  (header, i) => (
                    <th
                      key={`${header}-${i}`}
                      className="px-2 py-1 text-left uppercase tracking-wide font-semibold"
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {activeArmour.map((row, idx) => {
                const originalIndex = armour.indexOf(row);
                const detail = getDetail(row);
                const isExpanded = expandedRow === idx;

                return (
                  <>
                    <tr
                      key={`row-${idx}`}
                      className="border-t border-primary/20"
                    >
                      <td className="p-1 w-6">
                        <button
                          onClick={() => toggleExpand(idx)}
                          className="text-primary/60 hover:text-primary"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      </td>
                      <td className="p-1">
                        {row.catalogId ? (
                          <span className="px-2 py-1 text-xs">{row.type}</span>
                        ) : (
                          <Input
                            className="h-7 text-xs"
                            value={row.type}
                            onChange={(e) =>
                              handleFieldChange(originalIndex, "type", e.target.value)
                            }
                            placeholder="Custom armour..."
                          />
                        )}
                      </td>
                      <td className="p-1">
                        <Input
                          className="h-7 text-xs w-14"
                          value={row.rad}
                          onChange={(e) =>
                            handleFieldChange(originalIndex, "rad", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          className="h-7 text-xs w-24"
                          value={row.protection}
                          onChange={(e) =>
                            handleFieldChange(
                              originalIndex,
                              "protection",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          className="h-7 text-xs w-14"
                          value={row.kg}
                          onChange={(e) =>
                            handleFieldChange(originalIndex, "kg", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          className="h-7 text-xs"
                          value={row.options}
                          onChange={(e) =>
                            handleFieldChange(originalIndex, "options", e.target.value)
                          }
                          placeholder="Options..."
                        />
                      </td>
                      <td className="p-1 w-6">
                        <button
                          onClick={() => handleRemove(originalIndex)}
                          className="text-destructive/60 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`detail-${idx}`} className="bg-primary/5">
                        <td colSpan={7} className="px-4 py-2">
                          {detail ? (
                            <div className="space-y-1 text-xs">
                              <div className="text-primary/80">
                                {detail.description}
                              </div>
                              <div className="flex gap-4 text-[10px] text-muted-foreground">
                                <span>TL {detail.tl}</span>
                                <span>
                                  {detail.cost >= 1000000
                                    ? `MCr${detail.cost / 1000000}`
                                    : `Cr${detail.cost.toLocaleString()}`}
                                </span>
                                {detail.requiredSkill && (
                                  <span>
                                    Requires: {detail.requiredSkill}{" "}
                                    {detail.requiredSkillLevel}
                                  </span>
                                )}
                                {detail.hasLifeSupport && (
                                  <span>Life Support: 6hrs</span>
                                )}
                                {detail.isPowered && (
                                  <span>Powered (0kg when worn)</span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              Custom armour (no catalog data)
                            </div>
                          )}
                          <div className="mt-1">
                            <Input
                              className="h-7 text-xs"
                              value={row.notes || ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  originalIndex,
                                  "notes",
                                  e.target.value,
                                )
                              }
                              placeholder="Notes..."
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
