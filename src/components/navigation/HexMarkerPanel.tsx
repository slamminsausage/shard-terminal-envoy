import { useState } from "react";
import { useJumpPlanner } from "@/contexts/JumpPlannerContext";
import { getMarkerTypeConfig } from "@/config/markerTypes";
import { AccordionPanel } from "./AccordionPanel";
import { MarkerInfoModal } from "./MarkerInfoModal";
import { Plus, Edit2, Trash2, Info, Navigation, ChevronDown, ChevronRight } from "lucide-react";
import type { HexMarker } from "@/types/navigation";

interface HexMarkerPanelProps {
  onEditMarker: (marker: HexMarker) => void;
  onCreateMarker: () => void;
}

export function HexMarkerPanel({ onEditMarker, onCreateMarker }: HexMarkerPanelProps) {
  const {
    hexMarkers,
    isLoadingMarkers,
    deleteMarker,
    currentLocation,
    setMapLocation,
    setCurrentLocation
  } = useJumpPlanner();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingMarker, setViewingMarker] = useState<HexMarker | null>(null);
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());

  // Group markers by sector
  const markersBySector = hexMarkers.reduce((acc, marker) => {
    if (!acc[marker.sector]) {
      acc[marker.sector] = [];
    }
    acc[marker.sector].push(marker);
    return acc;
  }, {} as Record<string, HexMarker[]>);

  // Sort sectors alphabetically
  const sortedSectors = Object.keys(markersBySector).sort();

  const toggleSector = (sector: string) => {
    const newExpanded = new Set(expandedSectors);
    if (newExpanded.has(sector)) {
      newExpanded.delete(sector);
    } else {
      newExpanded.add(sector);
    }
    setExpandedSectors(newExpanded);
  };

  const handleDelete = async (marker: HexMarker) => {
    if (!marker.id) return;

    const confirmed = window.confirm(
      `Delete marker "${marker.marker_label}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(marker.id);
    try {
      await deleteMarker(marker.id);
    } catch (error) {
      console.error("Failed to delete marker:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleGoTo = async (marker: HexMarker) => {
    setMapLocation(marker.sector, marker.hex);
    await setCurrentLocation(marker.sector, marker.hex);
  };

  const handleViewInfo = (marker: HexMarker) => {
    setViewingMarker(marker);
  };

  const headerAction = (
    <button
      className="terminal-btn px-2 py-1 text-xs"
      onClick={onCreateMarker}
    >
      <Plus className="w-3 h-3 inline mr-1" />
      ADD
    </button>
  );

  return (
    <AccordionPanel
      title="CUSTOM MARKERS"
      statusLabel={isLoadingMarkers ? "..." : hexMarkers.length}
      defaultExpanded={false}
      headerAction={currentLocation ? headerAction : undefined}
    >
      {isLoadingMarkers ? (
        <div className="text-center py-4 text-terminal-text-dimmer">Loading markers...</div>
      ) : hexMarkers.length === 0 ? (
        <div className="text-center py-4 text-terminal-text-dimmer">
          No markers created yet.
          {currentLocation && (
            <button
              className="terminal-btn mt-2 text-xs"
              onClick={onCreateMarker}
            >
              <Plus className="w-3 h-3 inline mr-1" />
              Create First Marker
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedSectors.map((sector) => {
            const sectorMarkers = markersBySector[sector];
            const isExpanded = expandedSectors.has(sector);

            return (
              <div key={sector} className="border border-terminal-bg-border bg-black/20">
                {/* Sector Header */}
                <button
                  onClick={() => toggleSector(sector)}
                  className="w-full flex items-center justify-between p-3 hover:bg-black/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-primary" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-primary" />
                    )}
                    <span className="font-bold text-primary uppercase tracking-wider">
                      {sector}
                    </span>
                    <span className="text-xs text-terminal-text-dimmer">
                      ({sectorMarkers.length} {sectorMarkers.length === 1 ? 'marker' : 'markers'})
                    </span>
                  </div>
                </button>

                {/* Sector Markers */}
                {isExpanded && (
                  <div className="space-y-2 p-2 border-t border-terminal-bg-border">
                    {sectorMarkers.map((marker) => {
                      const config = getMarkerTypeConfig(marker.marker_type);
                      const isInactive = marker.is_active === false;

                      return (
                        <div
                          key={marker.id}
                          className={`p-2 border border-terminal-bg-border bg-black/30 transition-opacity ${
                            isInactive ? "opacity-50" : ""
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {/* Icon and Label */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className="text-xl flex-shrink-0 hex-marker-icon"
                                  style={{ color: marker.marker_color || config.defaultColor }}
                                  title={config.label}
                                >
                                  {marker.marker_icon || config.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-sm text-primary truncate">
                                    {marker.marker_label}
                                  </div>
                                  <div className="text-xs text-terminal-text-dimmer">
                                    {config.label}
                                  </div>
                                  <div className="text-xs text-terminal-secondary font-mono mt-0.5">
                                    {marker.hex}
                                  </div>
                                </div>
                              </div>

                              {/* Description */}
                              {marker.description && (
                                <div className="text-xs text-terminal-primary-mid mt-1 line-clamp-2">
                                  {marker.description}
                                </div>
                              )}

                              {/* Go To Button */}
                              <button
                                className="terminal-btn secondary text-xs mt-2 w-full flex items-center justify-center gap-1"
                                onClick={() => handleGoTo(marker)}
                                title="Navigate map to this location"
                              >
                                <Navigation className="w-3 h-3" />
                                GO TO HEX
                              </button>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-1 flex-shrink-0">
                              <button
                                className="p-1 hover:bg-terminal-bg-border text-terminal-secondary hover:text-primary transition-colors"
                                onClick={() => handleViewInfo(marker)}
                                title="View marker details"
                              >
                                <Info className="w-3 h-3" />
                              </button>
                              <button
                                className="p-1 hover:bg-terminal-bg-border text-terminal-secondary hover:text-primary transition-colors"
                                onClick={() => onEditMarker(marker)}
                                title="Edit marker"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                className="p-1 hover:bg-terminal-bg-border text-terminal-danger-alt hover:text-terminal-danger-light transition-colors"
                                onClick={() => handleDelete(marker)}
                                disabled={deletingId === marker.id}
                                title="Delete marker"
                              >
                                {deletingId === marker.id ? (
                                  <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Marker Info Modal */}
      {viewingMarker && (
        <MarkerInfoModal
          marker={viewingMarker}
          isOpen={!!viewingMarker}
          onClose={() => setViewingMarker(null)}
        />
      )}
    </AccordionPanel>
  );
}
