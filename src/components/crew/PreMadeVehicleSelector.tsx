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
import {
  PRE_MADE_VEHICLES,
  VEHICLE_CATEGORY_LABELS,
  SPEED_BAND_LABELS,
  type PreMadeVehicle,
  type VehicleCategory,
} from "@/data/vehicleCatalog";

interface PreMadeVehicleSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectVehicle: (vehicle: PreMadeVehicle) => void;
}

const CATEGORY_ORDER: VehicleCategory[] = [
  "civilian",
  "exploration",
  "utility",
  "military",
];

export default function PreMadeVehicleSelector({
  open,
  onOpenChange,
  onSelectVehicle,
}: PreMadeVehicleSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory | "all">("all");
  const [selectedVehicle, setSelectedVehicle] = useState<PreMadeVehicle | null>(null);

  const filteredVehicles = useMemo(() => {
    const vehicles =
      selectedCategory === "all"
        ? PRE_MADE_VEHICLES
        : PRE_MADE_VEHICLES.filter((v) => v.category === selectedCategory);
    return vehicles.sort((a, b) => a.shippingTons - b.shippingTons);
  }, [selectedCategory]);

  const availableCategories = useMemo(() => {
    const cats = new Set(PRE_MADE_VEHICLES.map((v) => v.category));
    return CATEGORY_ORDER.filter((c) => cats.has(c));
  }, []);

  const handleConfirm = () => {
    if (selectedVehicle) {
      onSelectVehicle(selectedVehicle);
      setSelectedVehicle(null);
      setSelectedCategory("all");
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setSelectedVehicle(null);
    onOpenChange(false);
  };

  const formatCost = (cr: number) => {
    if (cr >= 1_000_000) return `MCr${(cr / 1_000_000).toLocaleString()}`;
    return `Cr${cr.toLocaleString()}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col bg-terminal-bg border-terminal-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-terminal-primary">
            VEHICLE CATALOG // SELECT DESIGN
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
            All ({PRE_MADE_VEHICLES.length})
          </Button>
          {availableCategories.map((cat) => {
            const count = PRE_MADE_VEHICLES.filter((v) => v.category === cat).length;
            return (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                className="font-mono text-xs"
                onClick={() => setSelectedCategory(cat)}
              >
                {VEHICLE_CATEGORY_LABELS[cat]} ({count})
              </Button>
            );
          })}
        </div>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Vehicle list */}
          <ScrollArea className="w-1/2 pr-2">
            <div className="space-y-1">
              {filteredVehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle)}
                  className={`w-full text-left p-3 rounded border font-mono text-sm transition-colors ${
                    selectedVehicle?.id === vehicle.id
                      ? "border-terminal-primary bg-terminal-primary/10 text-terminal-primary"
                      : "border-terminal-border/30 hover:border-terminal-primary/50 text-terminal-primary/80 hover:text-terminal-primary"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{vehicle.name}</div>
                      <div className="text-xs opacity-70">
                        {vehicle.locomotion} · {vehicle.shippingTons}t · TL{vehicle.tl}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                      {VEHICLE_CATEGORY_LABELS[vehicle.category]}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* Detail panel */}
          <ScrollArea className="w-1/2 pl-2 border-l border-terminal-border/30">
            {selectedVehicle ? (
              <div className="space-y-4 font-mono text-sm text-terminal-primary pr-2">
                <div>
                  <h3 className="text-base font-bold">{selectedVehicle.name}</h3>
                  <p className="text-xs opacity-70 mt-1 leading-relaxed">
                    {selectedVehicle.description}
                  </p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="opacity-60">Skill:</span>
                    <span>{selectedVehicle.skill}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Tech Level:</span>
                    <span>TL{selectedVehicle.tl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Agility:</span>
                    <span>{selectedVehicle.agility >= 0 ? `+${selectedVehicle.agility}` : selectedVehicle.agility}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Hull:</span>
                    <span>{selectedVehicle.hull}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Speed (Max):</span>
                    <span>{selectedVehicle.speed.maxLabel} ({selectedVehicle.speed.max})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Speed (Cruise):</span>
                    <span>{selectedVehicle.speed.cruiseLabel} ({selectedVehicle.speed.cruise})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Range:</span>
                    <span>{selectedVehicle.rangeKm === 0 ? "Unlimited" : `${selectedVehicle.rangeKm.toLocaleString()} km`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Shipping:</span>
                    <span>{selectedVehicle.shippingTons}t</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Crew:</span>
                    <span>{selectedVehicle.crew}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Passengers:</span>
                    <span>{selectedVehicle.passengers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Cargo:</span>
                    <span>{selectedVehicle.cargoTons}t</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">Cost:</span>
                    <span>{formatCost(selectedVehicle.costCr)}</span>
                  </div>
                </div>

                {/* Armour */}
                <div>
                  <div className="text-xs font-semibold opacity-80 mb-1">ARMOUR</div>
                  <div className="grid grid-cols-3 gap-x-4 text-xs">
                    <div className="flex justify-between">
                      <span className="opacity-60">Front:</span>
                      <span>{selectedVehicle.armour.front}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Rear:</span>
                      <span>{selectedVehicle.armour.rear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Sides:</span>
                      <span>{selectedVehicle.armour.sides}</span>
                    </div>
                  </div>
                </div>

                {/* Equipment */}
                {selectedVehicle.equipment.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold opacity-80 mb-1">EQUIPMENT</div>
                    <div className="space-y-0.5">
                      {selectedVehicle.equipment.map((eq, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="opacity-70 truncate mr-2">{eq.name}</span>
                          <span className="shrink-0 opacity-50">{eq.description ?? "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weapons */}
                {selectedVehicle.weapons.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold opacity-80 mb-1">WEAPONS</div>
                    <div className="space-y-0.5">
                      {selectedVehicle.weapons.map((w, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="opacity-70 truncate mr-2">{w.weapon}</span>
                          <span className="shrink-0 opacity-50">
                            {w.damage ?? ""} {w.traits ? `(${w.traits})` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button className="w-full mt-2" onClick={handleConfirm}>
                  Deploy {selectedVehicle.name}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-terminal-primary/40 font-mono text-sm">
                Select a vehicle design to view details
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
