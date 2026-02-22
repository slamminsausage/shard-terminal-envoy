import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PRE_MADE_SHIPS, SHIP_SOURCE_LABELS, getShipSource, type PreMadeShip, type ShipCategory } from "@/data/shipConstruction";
import { formatCredits } from "@/data/shipConstruction";

interface PreMadeShipSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectShip: (ship: PreMadeShip) => void;
}

const CATEGORY_LABELS: Record<ShipCategory, string> = {
  scout: "Scout",
  trader: "Trader",
  military: "Military",
  passenger: "Passenger",
  exploration: "Exploration",
  mining: "Mining",
  small_craft: "Small Craft",
};

const CATEGORY_ORDER: ShipCategory[] = [
  "scout",
  "trader",
  "military",
  "passenger",
  "exploration",
  "mining",
  "small_craft",
];

export default function PreMadeShipSelector({
  open,
  onOpenChange,
  onSelectShip,
}: PreMadeShipSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<ShipCategory | "all">("all");
  const [selectedShip, setSelectedShip] = useState<PreMadeShip | null>(null);

  const filteredShips = useMemo(() => {
    const ships =
      selectedCategory === "all"
        ? PRE_MADE_SHIPS
        : PRE_MADE_SHIPS.filter((s) => s.category === selectedCategory);
    return ships.sort((a, b) => {
      const sourceCompare = getShipSource(a).localeCompare(getShipSource(b));
      if (sourceCompare !== 0) return sourceCompare;
      return a.tonnage - b.tonnage;
    });
  }, [selectedCategory]);

  const availableCategories = useMemo(() => {
    const cats = new Set(PRE_MADE_SHIPS.map((s) => s.category));
    return CATEGORY_ORDER.filter((c) => cats.has(c));
  }, []);

  const handleConfirm = () => {
    if (selectedShip) {
      onSelectShip(selectedShip);
      setSelectedShip(null);
      setSelectedCategory("all");
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setSelectedShip(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col bg-terminal-bg border-terminal-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-terminal-primary">
            SHIP CATALOG // SELECT DESIGN
          </DialogTitle>
        </DialogHeader>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-terminal-border/30">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            className="font-mono text-xs"
            onClick={() => setSelectedCategory("all")}
          >
            All ({PRE_MADE_SHIPS.length})
          </Button>
          {availableCategories.map((cat) => {
            const count = PRE_MADE_SHIPS.filter((s) => s.category === cat).length;
            return (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                className="font-mono text-xs"
                onClick={() => setSelectedCategory(cat)}
              >
                {CATEGORY_LABELS[cat]} ({count})
              </Button>
            );
          })}
        </div>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Ship list */}
          <ScrollArea className="w-1/2 pr-2">
            <div className="space-y-1">
              {filteredShips.map((ship, index) => {
                const source = getShipSource(ship);
                const prevSource = index > 0 ? getShipSource(filteredShips[index - 1]) : null;
                const showSourceHeader = source !== prevSource;
                return (
                <React.Fragment key={ship.id}>
                  {showSourceHeader && (
                    <div className="pt-2 pb-1 text-[10px] uppercase tracking-wider text-terminal-primary/60 border-b border-terminal-border/20">
                      {SHIP_SOURCE_LABELS[source]}
                    </div>
                  )}
                <button
                  key={ship.id}
                  onClick={() => setSelectedShip(ship)}
                  className={`w-full text-left p-3 rounded border font-mono text-sm transition-colors ${
                    selectedShip?.id === ship.id
                      ? "border-terminal-primary bg-terminal-primary/10 text-terminal-primary"
                      : "border-terminal-border/30 hover:border-terminal-primary/50 text-terminal-primary/80 hover:text-terminal-primary"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{ship.name}</div>
                      <div className="text-xs opacity-70">
                        {ship.designation && `${ship.designation} · `}
                        {ship.tonnage}t · TL{ship.tl}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                      {CATEGORY_LABELS[ship.category]}
                    </Badge>
                  </div>
                </button>
                </React.Fragment>
              );
              })}
            </div>
          </ScrollArea>

          {/* Detail panel */}
          <ScrollArea className="w-1/2 pl-2 border-l border-terminal-border/30">
            {selectedShip ? (
              <div className="space-y-4 font-mono text-sm text-terminal-primary pr-2">
                <div>
                  <h3 className="text-base font-bold">
                    {selectedShip.name}
                    {selectedShip.designation && (
                      <span className="font-normal opacity-70"> — {selectedShip.designation}</span>
                    )}
                  </h3>
                  <p className="text-xs opacity-70 mt-1 leading-relaxed">
                    {selectedShip.description}
                  </p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="opacity-60">Tonnage:</span>
                    <span>{selectedShip.tonnage}t</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Tech Level:</span>
                    <span>TL{selectedShip.tl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Hull Points:</span>
                    <span>{selectedShip.hullPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Purchase:</span>
                    <span>MCr{selectedShip.purchaseCostMCr.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Maintenance:</span>
                    <span>{formatCredits(selectedShip.maintenanceCostCrPerMonth)}/mo</span>
                  </div>
                  {selectedShip.design.jumpRating > 0 && (
                    <div className="flex justify-between">
                      <span className="opacity-60">Jump Rating:</span>
                      <span>J-{selectedShip.design.jumpRating}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="opacity-60">Thrust:</span>
                    <span>{selectedShip.design.manoeuvreRating}G</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Cargo:</span>
                    <span>{selectedShip.design.cargoTons}t</span>
                  </div>
                </div>

                {/* Crew */}
                <div>
                  <div className="text-xs font-semibold opacity-80 mb-1">CREW</div>
                  <div className="text-xs opacity-70">
                    {selectedShip.crew.join(", ")}
                  </div>
                </div>

                {/* Components summary */}
                <div>
                  <div className="text-xs font-semibold opacity-80 mb-1">COMPONENTS</div>
                  <div className="space-y-0.5">
                    {selectedShip.components
                      .filter((c) => c.category !== "Software" && c.category !== "Cargo")
                      .map((comp, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="opacity-70 truncate mr-2">{comp.name}</span>
                          <span className="shrink-0 opacity-50">
                            {comp.tons != null ? `${comp.tons}t` : "—"}
                            {comp.costMCr != null ? ` / MCr${comp.costMCr}` : ""}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Power requirements */}
                <div>
                  <div className="text-xs font-semibold opacity-80 mb-1">POWER REQUIREMENTS</div>
                  <div className="space-y-0.5">
                    {selectedShip.powerRequirements.map((pr, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="opacity-70">{pr.system}</span>
                        <span>{pr.power}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs font-semibold border-t border-terminal-border/20 pt-1">
                      <span>Total</span>
                      <span>
                        {selectedShip.powerRequirements.reduce((sum, pr) => sum + pr.power, 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Software */}
                <div>
                  <div className="text-xs font-semibold opacity-80 mb-1">SOFTWARE</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedShip.components
                      .filter((c) => c.category === "Software")
                      .map((sw, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] font-mono">
                          {sw.name}
                        </Badge>
                      ))}
                  </div>
                </div>

                <Button className="w-full mt-2" onClick={handleConfirm}>
                  Deploy {selectedShip.name}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-terminal-primary/40 font-mono text-sm">
                Select a ship design to view details
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
