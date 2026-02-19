/**
 * OptionsPicker - Multi-select dropdown for equipping catalog options/upgrades.
 *
 * Accepts a pre-filtered list of compatible OptionEntry objects and a list of
 * currently selected option keys. Renders a Popover with searchable checkboxes
 * and displays selected options as dismissible chips below the trigger button.
 *
 * Key format:
 *   - Single-variant option: "optionId"
 *   - Multi-variant option:  "optionId:variantIndex"
 */

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Settings2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OptionEntry {
  /** Unique key: "optionId" (single variant) or "optionId:variantIndex" (multi) */
  key: string;
  optionId: string;
  variantIndex: number;
  /** Display name: "Scope" or "Scope (TL7)" when multiple variants exist */
  name: string;
  tl: number;
  cost: number;
  mass_kg?: number;
  /** Short effect summary (always shown as subtitle) */
  effect: string;
  /** Full description (shown when expanded) */
  description: string;
}

interface OptionsPickerProps {
  available: OptionEntry[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCost(cost: number): string {
  if (cost >= 1_000_000) return `MCr${cost / 1_000_000}`;
  return `Cr${cost.toLocaleString()}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function OptionsPicker({
  available,
  selected,
  onChange,
  disabled = false,
  className,
}: OptionsPickerProps) {
  const [open, setOpen] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const selectedSet = new Set(selected);

  function toggle(key: string) {
    const next = new Set(selectedSet);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onChange(Array.from(next));
  }

  function remove(key: string) {
    onChange(selected.filter((k) => k !== key));
  }

  function toggleExpand(key: string, e: React.MouseEvent) {
    e.stopPropagation();
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const selectedEntries = selected
    .map((key) => available.find((e) => e.key === key))
    .filter(Boolean) as OptionEntry[];

  const buttonLabel =
    selected.length === 0
      ? "Add Options"
      : `Options (${selected.length})`;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {/* Trigger button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || available.length === 0}
            className="justify-between text-xs h-7 font-mono w-full"
          >
            <Settings2 className="mr-1 h-3 w-3 shrink-0" />
            <span className="flex-1 text-left">{buttonLabel}</span>
            <ChevronDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[420px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search options..." className="text-xs" />
            <CommandList className="max-h-64">
              <CommandEmpty>No compatible options found.</CommandEmpty>
              <CommandGroup>
                {available.map((entry) => {
                  const isSelected = selectedSet.has(entry.key);
                  const isExpanded = expandedKeys.has(entry.key);
                  return (
                    <CommandItem
                      key={entry.key}
                      value={`${entry.name} ${entry.effect}`}
                      onSelect={() => toggle(entry.key)}
                      className="flex-col items-start text-xs gap-0 py-1"
                    >
                      <div className="flex w-full items-center gap-1">
                        {/* Checkbox indicator */}
                        <span
                          className={cn(
                            "flex h-3.5 w-3.5 items-center justify-center rounded border mr-1 shrink-0",
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-primary/40",
                          )}
                        >
                          {isSelected && (
                            <Check className="h-2.5 w-2.5 text-primary-foreground" />
                          )}
                        </span>
                        {/* Name */}
                        <span className="flex-1 font-medium">{entry.name}</span>
                        {/* TL + cost */}
                        <span className="text-muted-foreground text-[10px]">
                          TL{entry.tl}
                        </span>
                        <span className="text-muted-foreground text-[10px] ml-1">
                          {formatCost(entry.cost)}
                        </span>
                        {entry.mass_kg != null && entry.mass_kg > 0 && (
                          <span className="text-muted-foreground text-[10px] ml-1">
                            {entry.mass_kg}kg
                          </span>
                        )}
                        {/* Expand/collapse description */}
                        <button
                          onClick={(e) => toggleExpand(entry.key, e)}
                          className="ml-1 text-muted-foreground hover:text-primary shrink-0"
                          tabIndex={-1}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      {/* Effect subtitle */}
                      <div className="pl-5 text-[10px] text-muted-foreground leading-tight">
                        {entry.effect}
                      </div>
                      {/* Expanded description */}
                      {isExpanded && (
                        <div className="pl-5 mt-1 text-[10px] text-primary/70 leading-tight border-l border-primary/20 ml-1.5">
                          {entry.description}
                        </div>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected option chips */}
      {selectedEntries.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedEntries.map((entry) => (
            <Badge
              key={entry.key}
              variant="secondary"
              className="text-[10px] h-5 px-1.5 font-mono gap-1 cursor-default"
            >
              {entry.name}
              <button
                onClick={() => remove(entry.key)}
                className="hover:text-destructive shrink-0"
                aria-label={`Remove ${entry.name}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
