/**
 * AugmentTable - Catalog-backed augment management for character sheets.
 *
 * Handles cybernetic augments grouped by type (physical, cognitive, neural,
 * sensory, skill, protective). Shows medical penalties and conflicts.
 */

import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  AUGMENT_CATALOG,
  AUGMENT_TYPE_LABELS,
  getAugmentById,
  formatAugmentCost,
} from "@/data/items";
import type { AugmentCatalogItem, AugmentType } from "@/data/items";
import { CatalogItemPicker, type CatalogPickerItem } from "./CatalogItemPicker";

export type AugmentRow = {
  catalogId?: string;
  type: string;
  tl: string;
  improvement: string;
  notes?: string;
};

interface AugmentTableProps {
  augments: AugmentRow[];
  onChange: (augments: AugmentRow[]) => void;
  /** When true, hide add/remove buttons and disable input editing */
  readOnly?: boolean;
}

function buildAugmentPickerItems(): CatalogPickerItem[] {
  return AUGMENT_CATALOG.map((a) => ({
    id: a.id,
    name: a.name,
    group: AUGMENT_TYPE_LABELS[a.augmentType],
    tl: a.tl,
    cost: a.cost,
    description: a.description,
  }));
}

function catalogToRow(augment: AugmentCatalogItem): AugmentRow {
  return {
    catalogId: augment.id,
    type: augment.name,
    tl: String(augment.tl),
    improvement: augment.improvement,
  };
}

function emptyRow(): AugmentRow {
  return { type: "", tl: "", improvement: "" };
}

export function AugmentTable({ augments, onChange, readOnly }: AugmentTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const pickerItems = useMemo(buildAugmentPickerItems, []);

  const handleAddFromCatalog = useCallback(
    (catalogId: string) => {
      const augment = getAugmentById(catalogId);
      if (!augment) return;
      const nonEmpty = augments.filter((a) => a.type.trim() !== "");
      onChange([...nonEmpty, catalogToRow(augment)]);
    },
    [augments, onChange],
  );

  const handleAddCustom = useCallback(() => {
    const nonEmpty = augments.filter((a) => a.type.trim() !== "");
    onChange([...nonEmpty, emptyRow()]);
  }, [augments, onChange]);

  const handleRemove = useCallback(
    (index: number) => {
      const next = augments.filter((_, i) => i !== index);
      onChange(next.length > 0 ? next : []);
      if (expandedRow === index) setExpandedRow(null);
    },
    [augments, onChange, expandedRow],
  );

  const handleFieldChange = useCallback(
    (index: number, field: keyof AugmentRow, value: string) => {
      const next = [...augments];
      next[index] = { ...next[index], [field]: value };
      onChange(next);
    },
    [augments, onChange],
  );

  const toggleExpand = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const getDetail = (row: AugmentRow): AugmentCatalogItem | undefined => {
    if (!row.catalogId) return undefined;
    return getAugmentById(row.catalogId);
  };

  const activeAugments = augments.filter((a) => a.type.trim() !== "");

  return (
    <div className="panel">
      <div className="panel-header flex items-center gap-2">
        <span className="panel-title flex-1">AUGMENTS</span>
        {!readOnly && (
          <CatalogItemPicker
            items={pickerItems}
            placeholder="Add Augment"
            onSelect={handleAddFromCatalog}
            onCustom={handleAddCustom}
          />
        )}
      </div>

      {activeAugments.length === 0 && (
        <div className="p-4 text-center text-xs text-muted-foreground">
          No augments installed. Use "Add Augment" to select from the catalog.
        </div>
      )}

      {activeAugments.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-primary/20 text-primary-foreground">
              <tr>
                {["", "Augment", "TL", "Improvement", ""].map((header, i) => (
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
              {activeAugments.map((row, idx) => {
                const originalIndex = augments.indexOf(row);
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
                            disabled={readOnly}
                            onChange={(e) =>
                              handleFieldChange(originalIndex, "type", e.target.value)
                            }
                            placeholder="Custom augment..."
                          />
                        )}
                      </td>
                      <td className="p-1">
                        <Input
                          className="h-7 text-xs w-12"
                          value={row.tl}
                          disabled={readOnly}
                          onChange={(e) =>
                            handleFieldChange(originalIndex, "tl", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          className="h-7 text-xs"
                          value={row.improvement}
                          disabled={readOnly}
                          onChange={(e) =>
                            handleFieldChange(
                              originalIndex,
                              "improvement",
                              e.target.value,
                            )
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
                        <td colSpan={5} className="px-4 py-2">
                          {detail ? (
                            <div className="space-y-1 text-xs">
                              <div className="text-primary/80">
                                {detail.description}
                              </div>
                              <div className="flex gap-4 text-[10px] text-muted-foreground">
                                <span>TL {detail.tl}</span>
                                <span>{formatAugmentCost(detail.cost)}</span>
                                {detail.slot && (
                                  <span>Slot: {detail.slot}</span>
                                )}
                                <span>Install: {detail.installationTime}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              Custom augment (no catalog data)
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
