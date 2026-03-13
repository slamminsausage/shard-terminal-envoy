/**
 * EquipmentTable - Catalog-backed general equipment management.
 *
 * Handles communications, computers, software, medical, sensors,
 * survival gear, and toolkits. Grouped by equipment category.
 */

import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  EQUIPMENT_CATALOG,
  getEquipmentById,
} from "@/data/items";
import type { EquipmentCatalogItem, EquipmentCategory } from "@/data/items";
import { CatalogItemPicker, type CatalogPickerItem } from "./CatalogItemPicker";

export type EquipmentRow = {
  catalogId?: string;
  item: string;
  mass: string;
  notes?: string;
};

interface EquipmentTableProps {
  equipment: EquipmentRow[];
  onChange: (equipment: EquipmentRow[]) => void;
  /** When true, hide add/remove buttons and disable input editing */
  readOnly?: boolean;
}

const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  communications: "Communications",
  electronics: "Computers & Electronics",
  software: "Software",
  medical: "Medical & Drugs",
  sensors: "Sensors",
  survival: "Survival Gear",
  tools: "Toolkits",
  misc: "Miscellaneous",
};

function buildEquipmentPickerItems(): CatalogPickerItem[] {
  return EQUIPMENT_CATALOG.map((e) => ({
    id: e.id,
    name: e.name,
    group: CATEGORY_LABELS[e.equipmentType] || e.equipmentType,
    tl: e.tl,
    cost: e.cost,
    description: e.description,
  }));
}

function catalogToRow(item: EquipmentCatalogItem): EquipmentRow {
  return {
    catalogId: item.id,
    item: item.name,
    mass: item.mass_kg > 0 ? String(item.mass_kg) : "-",
  };
}

function emptyRow(): EquipmentRow {
  return { item: "", mass: "" };
}

export function EquipmentTable({ equipment, onChange, readOnly }: EquipmentTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const pickerItems = useMemo(buildEquipmentPickerItems, []);

  const handleAddFromCatalog = useCallback(
    (catalogId: string) => {
      const item = getEquipmentById(catalogId);
      if (!item) return;
      const nonEmpty = equipment.filter((e) => e.item.trim() !== "");
      onChange([...nonEmpty, catalogToRow(item)]);
    },
    [equipment, onChange],
  );

  const handleAddCustom = useCallback(() => {
    const nonEmpty = equipment.filter((e) => e.item.trim() !== "");
    onChange([...nonEmpty, emptyRow()]);
  }, [equipment, onChange]);

  const handleRemove = useCallback(
    (index: number) => {
      const next = equipment.filter((_, i) => i !== index);
      onChange(next.length > 0 ? next : []);
      if (expandedRow === index) setExpandedRow(null);
    },
    [equipment, onChange, expandedRow],
  );

  const handleFieldChange = useCallback(
    (index: number, field: keyof EquipmentRow, value: string) => {
      const next = [...equipment];
      next[index] = { ...next[index], [field]: value };
      onChange(next);
    },
    [equipment, onChange],
  );

  const toggleExpand = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const getDetail = (row: EquipmentRow): EquipmentCatalogItem | undefined => {
    if (!row.catalogId) return undefined;
    return getEquipmentById(row.catalogId);
  };

  const activeEquipment = equipment.filter((e) => e.item.trim() !== "");

  return (
    <div className="panel">
      <div className="panel-header flex items-center gap-2">
        <span className="panel-title flex-1">EQUIPMENT</span>
        {!readOnly && (
          <CatalogItemPicker
            items={pickerItems}
            placeholder="Add Equipment"
            onSelect={handleAddFromCatalog}
            onCustom={handleAddCustom}
          />
        )}
      </div>

      {activeEquipment.length === 0 && (
        <div className="p-4 text-center text-xs text-muted-foreground">
          No equipment. Use "Add Equipment" to select from the catalog.
        </div>
      )}

      {activeEquipment.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-primary/20 text-primary-foreground">
              <tr>
                {["", "Equipment", "KG", ""].map((header, i) => (
                  <th
                    key={`${header}-${i}`}
                    className="px-2 py-1 text-left uppercase tracking-wide font-semibold"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeEquipment.map((row, idx) => {
                const originalIndex = equipment.indexOf(row);
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
                          <span className="px-2 py-1 text-xs">{row.item}</span>
                        ) : (
                          <Input
                            className="h-7 text-xs"
                            value={row.item}
                            disabled={readOnly}
                            onChange={(e) =>
                              handleFieldChange(originalIndex, "item", e.target.value)
                            }
                            placeholder="Custom item..."
                          />
                        )}
                      </td>
                      <td className="p-1">
                        <Input
                          className="h-7 text-xs w-16"
                          value={row.mass}
                          disabled={readOnly}
                          onChange={(e) =>
                            handleFieldChange(originalIndex, "mass", e.target.value)
                          }
                        />
                      </td>
                      {!readOnly && (
                        <td className="p-1 w-6">
                          <button
                            onClick={() => handleRemove(originalIndex)}
                            className="text-destructive/60 hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </td>
                      )}
                    </tr>
                    {isExpanded && (
                      <tr key={`detail-${idx}`} className="bg-primary/5">
                        <td colSpan={4} className="px-4 py-2">
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
                                {detail.effect && (
                                  <span>{detail.effect}</span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              Custom equipment (no catalog data)
                            </div>
                          )}
                          <div className="mt-1">
                            <Input
                              className="h-7 text-xs"
                              value={row.notes || ""}
                              disabled={readOnly}
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
    </div>
  );
}
