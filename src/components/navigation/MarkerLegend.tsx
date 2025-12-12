import { useJumpPlanner } from "@/contexts/JumpPlannerContext";
import { getAllMarkerTypes } from "@/config/markerTypes";
import { AccordionPanel } from "./AccordionPanel";
import { Filter } from "lucide-react";
import type { MarkerType } from "@/types/navigation";

export function MarkerLegend() {
  const { markerFilter, setMarkerFilter, hexMarkers } = useJumpPlanner();
  const markerTypes = getAllMarkerTypes();

  // Count markers by type
  const markerCounts = markerTypes.reduce(
    (acc, type) => {
      acc[type.type] = hexMarkers.filter((m) => m.marker_type === type.type).length;
      return acc;
    },
    {} as Record<MarkerType, number>
  );

  const totalActiveMarkers = hexMarkers.filter((m) => m.is_active !== false).length;
  const totalInactiveMarkers = hexMarkers.length - totalActiveMarkers;

  const handleToggleType = (type: MarkerType) => {
    const types = markerFilter.types.includes(type)
      ? markerFilter.types.filter((t) => t !== type)
      : [...markerFilter.types, type];
    setMarkerFilter({ types });
  };

  const handleShowAll = () => {
    setMarkerFilter({ types: [] });
  };

  const handleHideAll = () => {
    setMarkerFilter({ types: markerTypes.map((t) => t.type) });
  };

  const isTypeVisible = (type: MarkerType) => {
    // If no filters, all are visible
    if (markerFilter.types.length === 0) return true;
    // If type is in filter, it's hidden
    return !markerFilter.types.includes(type);
  };

  const headerAction = (
    <div className="flex items-center gap-2 text-[#446655]">
      <Filter className="w-4 h-4" />
    </div>
  );

  return (
    <AccordionPanel
      title="MARKER LEGEND"
      statusLabel={hexMarkers.length}
      defaultExpanded={false}
      headerAction={headerAction}
    >
      <div>
          {/* Quick Actions */}
          <div className="flex gap-2 mb-3">
            <button
              className="terminal-btn secondary text-xs px-2 py-1 flex-1"
              onClick={handleShowAll}
            >
              SHOW ALL
            </button>
            <button
              className="terminal-btn secondary text-xs px-2 py-1 flex-1"
              onClick={handleHideAll}
            >
              HIDE ALL
            </button>
          </div>

          {/* Inactive Markers Toggle */}
          <label className="flex items-center gap-2 cursor-pointer mb-3 p-2 border border-[#1a2420] bg-black/30">
            <input
              type="checkbox"
              className="w-4 h-4 bg-black border border-primary rounded accent-primary"
              checked={markerFilter.showInactive}
              onChange={(e) => setMarkerFilter({ showInactive: e.target.checked })}
            />
            <span className="text-sm text-[#00aa00] flex-1">
              Show inactive markers
            </span>
            <span className="text-xs text-[#446655]">({totalInactiveMarkers})</span>
          </label>

          {/* Marker Types */}
          <div className="space-y-1">
            <div className="text-xs text-[#446655] mb-2">MARKER TYPES:</div>
            {markerTypes
              .filter((type) => markerCounts[type.type] > 0)
              .map((type) => {
                const visible = isTypeVisible(type.type);
                return (
                  <label
                    key={type.type}
                    className={`flex items-center gap-2 cursor-pointer p-2 border border-[#1a2420] bg-black/30 transition-opacity hover:bg-black/50 ${
                      !visible ? "opacity-50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 bg-black border border-primary rounded accent-primary"
                      checked={visible}
                      onChange={() => handleToggleType(type.type)}
                    />
                    <span
                      className="text-base flex-shrink-0 marker-legend-icon"
                      style={{ color: type.defaultColor }}
                    >
                      {type.icon}
                    </span>
                    <span className="text-sm text-[#00aa00] flex-1 min-w-0">
                      {type.label}
                    </span>
                    <span className="text-xs text-[#446655]">
                      ({markerCounts[type.type]})
                    </span>
                  </label>
                );
              })}
          </div>

          {/* Empty State */}
          {hexMarkers.length === 0 && (
            <div className="text-center py-4 text-[#446655] text-sm">
              No markers created yet.
            </div>
          )}

          {/* Summary */}
          <div className="mt-3 pt-3 border-t border-[#1a2420] text-xs text-[#446655]">
            <div className="flex justify-between">
              <span>Active markers:</span>
              <span className="text-primary">{totalActiveMarkers}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Inactive markers:</span>
              <span className="text-[#888888]">{totalInactiveMarkers}</span>
            </div>
            <div className="flex justify-between mt-1 font-bold">
              <span>Total markers:</span>
              <span className="text-primary">{hexMarkers.length}</span>
            </div>
          </div>
        </div>
    </AccordionPanel>
  );
}
