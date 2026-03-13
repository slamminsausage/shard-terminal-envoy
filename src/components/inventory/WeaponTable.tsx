/**
 * WeaponTable - Catalog-backed weapon management for character sheets.
 *
 * Replaces the old manual text-input weapon table. Users select weapons
 * from the catalog dropdown (auto-fills all fields) or add custom entries.
 * Existing text-based data loads seamlessly (backward compatible).
 */

import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  WEAPON_CATALOG,
  WEAPON_OPTIONS,
  WEAPON_TYPE_LABELS,
  getWeaponById,
  getCompatibleWeaponOptions,
  formatDamage,
  formatMagazine,
  formatMagazineCost,
} from "@/data/items";
import type { WeaponCatalogItem } from "@/data/items";
import { CatalogItemPicker, type CatalogPickerItem } from "./CatalogItemPicker";
import { OptionsPicker, type OptionEntry } from "./OptionsPicker";

export type WeaponRow = {
  catalogId?: string;
  weapon: string;
  accuracy: string;
  range: string;
  damage: string;
  kg: string;
  magazine: string;
  traits: string;
  options?: string[];
  notes?: string;
};

interface WeaponTableProps {
  weapons: WeaponRow[];
  onChange: (weapons: WeaponRow[]) => void;
  /** Characteristic modifier per weapon row */
  charMods: string[];
  onCharModChange: (index: number, value: string) => void;
  /** Callback for rolling damage */
  onRoll?: (index: number) => void;
  /** Last roll log line */
  lastRollLog?: string;
  /** When true, hide add/remove buttons and disable input editing */
  readOnly?: boolean;
}

/** Convert catalog weapons to picker items grouped by weapon type */
function buildWeaponPickerItems(): CatalogPickerItem[] {
  return WEAPON_CATALOG.map((w) => ({
    id: w.id,
    name: w.name,
    group: WEAPON_TYPE_LABELS[w.weaponType],
    tl: w.tl,
    cost: w.cost,
    description: w.description,
  }));
}

/** Build OptionEntry list for the given weapon catalog ID (or all options if custom). */
function buildWeaponOptionEntries(catalogId?: string): OptionEntry[] {
  if (!catalogId) {
    // Custom weapon — show all options (no compatibility filter)
    return WEAPON_OPTIONS.flatMap((option) =>
      option.variants.map((v, i) => ({
        key: option.variants.length > 1 ? `${option.id}:${i}` : option.id,
        optionId: option.id,
        variantIndex: i,
        name: option.variants.length > 1 ? `${option.name} (TL${v.tl})` : option.name,
        tl: v.tl,
        cost: v.cost,
        mass_kg: v.mass_kg,
        effect: v.effect,
        description: option.description,
      })),
    );
  }
  const weapon = getWeaponById(catalogId);
  if (!weapon) return [];
  return getCompatibleWeaponOptions(weapon).flatMap(({ option, compatibleVariants }) =>
    compatibleVariants.map(({ index, variant }) => ({
      key: option.variants.length > 1 ? `${option.id}:${index}` : option.id,
      optionId: option.id,
      variantIndex: index,
      name: option.variants.length > 1 ? `${option.name} (TL${variant.tl})` : option.name,
      tl: variant.tl,
      cost: variant.cost,
      mass_kg: variant.mass_kg,
      effect: variant.effect,
      description: option.description,
    })),
  );
}

/** Create a WeaponRow from a catalog item */
function catalogToRow(weapon: WeaponCatalogItem): WeaponRow {
  return {
    catalogId: weapon.id,
    weapon: weapon.name,
    accuracy: "",
    range: weapon.range,
    damage: formatDamage(weapon),
    kg: weapon.mass_kg > 0 ? String(weapon.mass_kg) : "-",
    magazine: formatMagazine(weapon),
    traits: weapon.traits.join(", "),
    options: [],
  };
}

/** Create an empty custom weapon row */
function emptyRow(): WeaponRow {
  return {
    weapon: "",
    accuracy: "",
    range: "",
    damage: "",
    kg: "",
    magazine: "",
    traits: "",
    options: [],
  };
}

/** Coerce legacy undefined/null options to string array */
function coerceOptions(options: unknown): string[] {
  if (Array.isArray(options)) return options as string[];
  return [];
}

export function WeaponTable({
  weapons,
  onChange,
  charMods,
  onCharModChange,
  onRoll,
  lastRollLog,
  readOnly,
}: WeaponTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const pickerItems = useMemo(buildWeaponPickerItems, []);

  const handleAddFromCatalog = useCallback(
    (catalogId: string) => {
      const weapon = getWeaponById(catalogId);
      if (!weapon) return;
      const row = catalogToRow(weapon);
      // Filter out empty placeholder rows, add the new one
      const nonEmpty = weapons.filter((w) => w.weapon.trim() !== "");
      onChange([...nonEmpty, row]);
    },
    [weapons, onChange],
  );

  const handleAddCustom = useCallback(() => {
    const nonEmpty = weapons.filter((w) => w.weapon.trim() !== "");
    onChange([...nonEmpty, emptyRow()]);
    setShowCustomForm(false);
  }, [weapons, onChange]);

  const handleRemove = useCallback(
    (index: number) => {
      const next = weapons.filter((_, i) => i !== index);
      onChange(next.length > 0 ? next : []);
      if (expandedRow === index) setExpandedRow(null);
    },
    [weapons, onChange, expandedRow],
  );

  const handleFieldChange = useCallback(
    (index: number, field: Exclude<keyof WeaponRow, "options">, value: string) => {
      const next = [...weapons];
      next[index] = { ...next[index], [field]: value };
      onChange(next);
    },
    [weapons, onChange],
  );

  const handleOptionsChange = useCallback(
    (index: number, opts: string[]) => {
      const next = [...weapons];
      next[index] = { ...next[index], options: opts };
      onChange(next);
    },
    [weapons, onChange],
  );

  const toggleExpand = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  // Get catalog item for expanded detail view
  const getDetail = (row: WeaponRow): WeaponCatalogItem | undefined => {
    if (!row.catalogId) return undefined;
    return getWeaponById(row.catalogId);
  };

  const activeWeapons = weapons.filter((w) => w.weapon.trim() !== "");

  return (
    <section className="panel">
      <div className="panel-header flex items-center gap-2">
        <span className="panel-title flex-1">WEAPONS</span>
        {!readOnly && (
          <CatalogItemPicker
            items={pickerItems}
            placeholder="Add Weapon"
            onSelect={handleAddFromCatalog}
            onCustom={handleAddCustom}
          />
        )}
        {lastRollLog && (
          <div className="text-[11px] font-mono text-primary/80">
            {lastRollLog}
          </div>
        )}
      </div>

      {activeWeapons.length === 0 && (
        <div className="p-4 text-center text-xs text-muted-foreground">
          No weapons equipped. Use "Add Weapon" to select from the catalog or add a custom entry.
        </div>
      )}

      {activeWeapons.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-primary/20 text-primary-foreground">
              <tr>
                {[
                  "",
                  "Weapon",
                  "Range",
                  "Damage",
                  "KG",
                  "Magazine",
                  "Traits",
                  "Char Mod",
                  "Roll",
                  "",
                ].map((header) => (
                  <th
                    key={header || "spacer"}
                    className="px-2 py-1 text-left uppercase tracking-wide font-semibold"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeWeapons.map((row, idx) => {
                // Map active index back to the original weapons array index
                const originalIndex = weapons.indexOf(row);
                const detail = getDetail(row);
                const isExpanded = expandedRow === idx;
                const selectedOptions = coerceOptions(row.options);
                const availableOptions = buildWeaponOptionEntries(row.catalogId);

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
                          <span className="px-2 py-1 text-xs">{row.weapon}</span>
                        ) : (
                          <Input
                            className="h-7 text-xs"
                            value={row.weapon}
                            disabled={readOnly}
                            onChange={(e) =>
                              handleFieldChange(originalIndex, "weapon", e.target.value)
                            }
                            placeholder="Custom weapon..."
                          />
                        )}
                      </td>
                      <td className="p-1">
                        <Input
                          className="h-7 text-xs w-20"
                          value={row.range}
                          disabled={readOnly}
                          onChange={(e) =>
                            handleFieldChange(originalIndex, "range", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          className="h-7 text-xs w-16"
                          value={row.damage}
                          disabled={readOnly}
                          onChange={(e) =>
                            handleFieldChange(originalIndex, "damage", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          className="h-7 text-xs w-12"
                          value={row.kg}
                          disabled={readOnly}
                          onChange={(e) =>
                            handleFieldChange(originalIndex, "kg", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          className="h-7 text-xs w-16"
                          value={row.magazine}
                          disabled={readOnly}
                          onChange={(e) =>
                            handleFieldChange(originalIndex, "magazine", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          className="h-7 text-xs"
                          value={row.traits}
                          disabled={readOnly}
                          onChange={(e) =>
                            handleFieldChange(originalIndex, "traits", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-1">
                        <select
                          className="bg-background border border-primary/40 rounded px-2 h-7 text-xs"
                          value={charMods[originalIndex] || "none"}
                          disabled={readOnly}
                          onChange={(e) =>
                            onCharModChange(originalIndex, e.target.value)
                          }
                        >
                          <option value="none">None</option>
                          <option value="strength">STR</option>
                          <option value="dexterity">DEX</option>
                          <option value="endurance">END</option>
                        </select>
                      </td>
                      <td className="p-1">
                        {onRoll && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2"
                            onClick={() => onRoll(originalIndex)}
                          >
                            Roll
                          </Button>
                        )}
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
                        <td colSpan={10} className="px-4 py-2 space-y-2">
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
                                  <span>Skill: {detail.requiredSkill}</span>
                                )}
                                {detail.magazineCost != null &&
                                  detail.magazineCost > 0 && (
                                    <span>
                                      Reload: {formatMagazineCost(detail)}
                                    </span>
                                  )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              Custom weapon (no catalog data)
                            </div>
                          )}
                          {/* Options / upgrades picker */}
                          {!readOnly && (
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                                Options &amp; Upgrades
                              </div>
                              <OptionsPicker
                                available={availableOptions}
                                selected={selectedOptions}
                                onChange={(opts) => handleOptionsChange(originalIndex, opts)}
                              />
                            </div>
                          )}
                          {/* Notes */}
                          <div>
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
    </section>
  );
}
