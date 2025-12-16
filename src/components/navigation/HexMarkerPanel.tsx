import { useState } from "react";
import { useJumpPlanner } from "@/contexts/JumpPlannerContext";
import { getMarkerTypeConfig } from "@/config/markerTypes";
import { AccordionPanel } from "./AccordionPanel";
import { Plus, Edit2, Trash2, Eye, EyeOff, Navigation } from "lucide-react";
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
    toggleMarkerActive,
    currentLocation,
    setMapLocation,
    setCurrentLocation
  } = useJumpPlanner();
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleToggleActive = async (marker: HexMarker) => {
    if (!marker.id) return;
    try {
      await toggleMarkerActive(marker.id, !marker.is_active);
    } catch (error) {
      console.error("Failed to toggle marker:", error);
    }
  };

  const handleGoTo = async (marker: HexMarker) => {
    setMapLocation(marker.sector, marker.hex);
    await setCurrentLocation(marker.sector, marker.hex);
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
        <div className="text-center py-4 text-[#446655]">Loading markers...</div>
      ) : hexMarkers.length === 0 ? (
        <div className="text-center py-4 text-[#446655]">
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
        <div className="space-y-2">
              {hexMarkers.map((marker) => {
                const config = getMarkerTypeConfig(marker.marker_type);
                const isInactive = marker.is_active === false;

                return (
                  <div
                    key={marker.id}
                    className={`p-2 border border-[#1a2420] bg-black/30 transition-opacity ${
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
                            <div className="text-xs text-[#446655]">
                              {config.label}
                            </div>
                            <div className="text-xs text-[#00ccff] font-mono mt-0.5">
                              {marker.sector} {marker.hex}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {marker.description && (
                          <div className="text-xs text-[#00aa00] mt-1 line-clamp-2">
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
                          className="p-1 hover:bg-[#1a2420] text-[#00ccff] hover:text-primary transition-colors"
                          onClick={() => handleToggleActive(marker)}
                          title={isInactive ? "Activate marker" : "Deactivate marker"}
                        >
                          {isInactive ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          className="p-1 hover:bg-[#1a2420] text-[#00ccff] hover:text-primary transition-colors"
                          onClick={() => onEditMarker(marker)}
                          title="Edit marker"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          className="p-1 hover:bg-[#1a2420] text-[#ff4455] hover:text-[#ff6666] transition-colors"
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
    </AccordionPanel>
  );
}
