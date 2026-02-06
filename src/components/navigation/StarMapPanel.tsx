import { useRef, useEffect, useState } from "react";
import { useJumpPlanner } from "@/contexts/JumpPlannerContext";
import { generateMapUrl, padHex, getSectorFullName, type WorldSearchResult } from "@/lib/travellerMapApi";
import { WorldSearchAutocomplete } from "./WorldSearchAutocomplete";
import { MapPin, Navigation, Info, Maximize2 } from "lucide-react";
import { StarMapLegendModal } from "./StarMapLegendModal";
import { usePinchZoom } from "@/hooks/usePinchZoom";

export function StarMapPanel() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const {
    mapSector,
    mapHex,
    currentLocation,
    playerLocation,
    setMapLocation,
    setCurrentLocation,
    setPlayerLocation,
  } = useJumpPlanner();

  const [searchValue, setSearchValue] = useState("");
  const [hexInput, setHexInput] = useState(mapHex);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  // Pinch zoom for mobile touch gestures
  const { ref: zoomRef, transform, resetZoom, style: zoomStyle } = usePinchZoom<HTMLDivElement>({
    minScale: 1,
    maxScale: 4
  });

  // Update hex input when map location changes
  useEffect(() => {
    setHexInput(padHex(mapHex));
  }, [mapHex]);

  const handleSearchSelect = async (result: WorldSearchResult) => {
    if (result.type === "world") {
      const sectorFull = getSectorFullName(result.sector);
      setMapLocation(sectorFull, result.hex);
      await setCurrentLocation(sectorFull, result.hex);
    } else {
      // For sectors/subsectors, just navigate to the center
      const sectorFull = getSectorFullName(result.sector);
      setMapLocation(sectorFull, "1620");
    }
    setSearchValue("");
  };

  const handleSetPlayerLocation = () => {
    if (currentLocation) {
      setPlayerLocation(currentLocation.sector, currentLocation.hex);
    }
  };

  const handleGoToPlayerLocation = async () => {
    if (playerLocation) {
      setMapLocation(playerLocation.sector, playerLocation.hex);
      await setCurrentLocation(playerLocation.sector, playerLocation.hex);
    }
  };

  // Generate map URL with "You Are Here" marker
  const mapUrl = generateMapUrl(mapSector, mapHex, {
    style: "poster",
    scale: 32,
    yahSector: playerLocation?.sector,
    yahHex: playerLocation?.hex,
  });

  return (
    <div className="star-map-panel flex-1 flex flex-col panel min-w-0">
      <div className="panel-header">
        <span className="panel-title">STAR MAP</span>
        <span className="panel-status">
          {currentLocation
            ? `${currentLocation.sector} ${currentLocation.hex}`
            : "Search for a world"}
        </span>
      </div>

      <div className="panel-content flex flex-col gap-0 p-0 min-h-0">
        {/* Compact Controls Toolbar */}
        <div className="px-3 pt-3 pb-2 flex flex-col gap-2">
          {/* Row 1: Search + Hex Input */}
          <div className="flex gap-2 items-center">
            <div className="flex-1 min-w-0">
              <WorldSearchAutocomplete
                value={searchValue}
                onChange={setSearchValue}
                onSelect={handleSearchSelect}
                placeholder="Search worlds by name (e.g., Drinax, Theev...)"
              />
            </div>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              placeholder="Hex"
              className="terminal-input w-16 text-xs text-center"
              maxLength={4}
            />
            <button
              onClick={() => {
                if (currentLocation?.sector && hexInput) {
                  const paddedHex = padHex(hexInput);
                  setMapLocation(currentLocation.sector, paddedHex);
                  setCurrentLocation(currentLocation.sector, paddedHex);
                }
              }}
              disabled={!currentLocation?.sector || !hexInput}
              className="terminal-btn secondary text-xs px-2 py-1 whitespace-nowrap"
            >
              GO
            </button>
          </div>

          {/* Row 2: Location buttons + Legend - compact */}
          <div className="flex gap-2 items-center">
            <button
              onClick={handleSetPlayerLocation}
              disabled={!currentLocation}
              className="terminal-btn text-xs flex-1 flex items-center justify-center gap-1 py-1"
              title="Mark current location as your ship's position"
            >
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="hidden sm:inline">SET LOCATION</span>
              <span className="sm:hidden">SET</span>
            </button>
            <button
              onClick={handleGoToPlayerLocation}
              disabled={!playerLocation}
              className="terminal-btn secondary text-xs flex-1 flex items-center justify-center gap-1 py-1"
              title="Navigate to your ship's location"
            >
              <Navigation className="w-3 h-3 shrink-0" />
              <span className="hidden sm:inline">GO TO SHIP</span>
              <span className="sm:hidden">SHIP</span>
            </button>
            <button
              onClick={() => setIsLegendOpen(true)}
              className="terminal-btn secondary text-xs px-2 py-1 flex items-center justify-center gap-1"
              title="View map legend and symbol key"
            >
              <Info className="w-3 h-3" />
              <span className="hidden sm:inline">LEGEND</span>
            </button>
          </div>
        </div>

        {/* Ship Location + Selection Status Bar */}
        <div className="px-3 py-1 bg-terminal-primary-light/5 border-y border-primary/20 flex items-center gap-3 text-xs min-h-[28px]">
          {playerLocation && (
            <div className="flex items-center gap-1.5 shrink-0">
              <MapPin className="w-3 h-3 text-primary" />
              <span className="text-terminal-text-dimmer">SHIP:</span>
              <span className="text-primary font-bold">
                {playerLocation.worldName || playerLocation.hex}
              </span>
              <span className="text-terminal-secondary font-mono">
                {playerLocation.hex}
              </span>
            </div>
          )}
          {playerLocation && currentLocation && (
            <span className="text-terminal-text-dimmer">|</span>
          )}
          {currentLocation && (
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-terminal-text-dimmer">SELECTED:</span>
              <span className="text-primary font-bold">
                {currentLocation.worldName || currentLocation.hex}
              </span>
              <span className="text-terminal-secondary font-mono">
                {currentLocation.sector} {currentLocation.hex}
              </span>
            </div>
          )}
          {!playerLocation && !currentLocation && (
            <span className="text-terminal-text-dimmer">Click on the map to select a hex</span>
          )}
        </div>

        {/* Map Iframe with Pinch Zoom - fills remaining space */}
        <div ref={zoomRef} className="flex-1 relative min-h-[500px] min-w-0 overflow-hidden touch-none">
          <div style={zoomStyle} className="absolute inset-0">
            <iframe
              ref={iframeRef}
              key={`${mapSector}-${mapHex}`}
              src={mapUrl}
              className="absolute inset-0 w-full h-full"
              title="TravellerMap"
              allow="fullscreen"
              style={{ pointerEvents: transform.scale > 1 ? 'auto' : 'auto' }}
            />
          </div>

          {/* Zoom Controls (Mobile-friendly) */}
          {transform.scale > 1 && (
            <button
              onClick={resetZoom}
              className="absolute top-2 right-2 z-10 p-2 bg-terminal-bg-panel border border-terminal-primary-mid rounded text-terminal-primary-light hover:bg-terminal-primary-light/10 transition-colors shadow-lg"
              title="Reset zoom"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Legend Modal */}
      <StarMapLegendModal
        isOpen={isLegendOpen}
        onClose={() => setIsLegendOpen(false)}
      />
    </div>
  );
}
