/**
 * CatalogItemPicker - A searchable grouped dropdown for selecting items
 * from any catalog (weapons, armor, equipment, augments).
 *
 * Uses cmdk (Command) + Popover for a terminal-style combobox with search,
 * grouped by item type/category.
 */

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

export interface CatalogPickerItem {
  id: string;
  name: string;
  group: string;
  tl: number;
  cost: number;
  description?: string;
}

interface CatalogItemPickerProps {
  items: CatalogPickerItem[];
  placeholder?: string;
  onSelect: (itemId: string) => void;
  onCustom?: () => void;
  className?: string;
}

export function CatalogItemPicker({
  items,
  placeholder = "Select item...",
  onSelect,
  onCustom,
  className,
}: CatalogItemPickerProps) {
  const [open, setOpen] = useState(false);

  // Group items by their group property
  const groups = items.reduce<Record<string, CatalogPickerItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between text-xs h-8 font-mono",
            className,
          )}
        >
          <Plus className="mr-1 h-3 w-3 shrink-0" />
          {placeholder}
          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search catalog..." className="text-xs" />
          <CommandList>
            <CommandEmpty>No items found.</CommandEmpty>
            {Object.entries(groups).map(([groupName, groupItems]) => (
              <CommandGroup key={groupName} heading={groupName}>
                {groupItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.name} ${item.group}`}
                    onSelect={() => {
                      onSelect(item.id);
                      setOpen(false);
                    }}
                    className="text-xs"
                  >
                    <Check className="mr-1 h-3 w-3 opacity-0" />
                    <span className="flex-1">{item.name}</span>
                    <span className="text-muted-foreground ml-2">
                      TL{item.tl}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {item.cost >= 1000000
                        ? `MCr${item.cost / 1000000}`
                        : `Cr${item.cost.toLocaleString()}`}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            {onCustom && (
              <CommandGroup heading="Custom">
                <CommandItem
                  value="__custom__"
                  onSelect={() => {
                    onCustom();
                    setOpen(false);
                  }}
                  className="text-xs"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  <span>Add Custom Item...</span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
