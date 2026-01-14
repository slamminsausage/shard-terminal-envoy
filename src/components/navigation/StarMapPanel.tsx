import { useRef, useEffect, useState } from "react";
import { useJumpPlanner } from "@/contexts/JumpPlannerContext";
import { generateMapUrl, padHex, getSectorFullName, type WorldSearchResult } from "@/lib/travellerMapApi";
import { WorldSearchAutocomplete } from "./WorldSearchAutocomplete";
import { MapPin, Navigation, Info, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
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

      <div className="panel-content flex flex-col gap-3 p-0 min-h-0">
        {/* Search Controls */}
        <div className="px-4 pt-4">
          <WorldSearchAutocomplete
            value={searchValue}
            onChange={setSearchValue}
            onSelect={handleSearchSelect}
            placeholder="Search worlds by name (e.g., Drinax, Theev...)"
          />
        </div>

        {/* Quick Nav - Hex input for manual entry */}
        <div className="flex gap-2 px-4">
          <input
            type="text"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            placeholder="Hex (e.g., 2223)"
            className="terminal-input w-24 text-sm"
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
            className="terminal-btn secondary text-xs flex-1"
          >
            GO TO HEX
          </button>
        </div>

        {/* Player Location Controls */}
        <div className="flex gap-2 px-4">
          <button
            onClick={handleSetPlayerLocation}
            disabled={!currentLocation}
            className="terminal-btn text-xs flex-1 flex items-center justify-center gap-1"
            title="Mark current location as your ship's position"
          >
            <MapPin className="w-3 h-3" />
            SET "YOU ARE HERE"
          </button>
          <button
            onClick={handleGoToPlayerLocation}
            disabled={!playerLocation}
            className="terminal-btn secondary text-xs flex-1 flex items-center justify-center gap-1"
            title="Navigate to your ship's location"
          >
            <Navigation className="w-3 h-3" />
            GO TO SHIP
          </button>
        </div>

        {/* Legend Button */}
        <div className="px-4">
          <button
            onClick={() => setIsLegendOpen(true)}
            className="terminal-btn secondary text-xs w-full flex items-center justify-center gap-1"
            title="View map legend and symbol key"
          >
            <Info className="w-3 h-3" />
            MAP LEGEND
          </button>
        </div>

        {/* Player Location Display */}
        {playerLocation && (
          <div className="px-4 py-2 bg-terminal-primary-light/5 border-y border-primary/20">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-xs text-terminal-text-dimmer">SHIP LOCATION:</span>
              <span className="text-primary font-bold text-sm">
                {playerLocation.worldName || playerLocation.hex}
              </span>
              <span className="text-terminal-secondary text-xs font-mono ml-auto">
                {playerLocation.sector} {playerLocation.hex}
              </span>
            </div>
          </div>
        )}

        {/* Map Iframe with Pinch Zoom */}
        <div ref={zoomRef} className="flex-1 relative min-h-[320px] min-w-0 overflow-hidden touch-none">
          <div style={zoomStyle} className="absolute inset-0">
            <iframe
              ref={iframeRef}
              // Key forces iframe to fully reload when sector/hex changes
              key={`${mapSector}-${mapHex}`}
              src={mapUrl}
              className="absolute inset-0 w-full h-full border-t border-terminal-bg-border"
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

        {/* Current Selection Display */}
        {currentLocation && (
          <div className="px-4 pb-4 border-t border-terminal-bg-border pt-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-terminal-text-dimmer text-xs mr-2">SELECTED:</span>
                <span className="text-primary font-bold">
                  {currentLocation.worldName || currentLocation.hex}
                </span>
              </div>
              <span className="text-terminal-secondary text-sm font-mono">
                {currentLocation.sector} {currentLocation.hex}
              </span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="px-4 pb-3 text-center">
          <span className="text-xs text-terminal-text-dimmer">
            Search for worlds by name, or click on the map to select a hex.
            Set your ship location to display "You Are Here" marker.
          </span>
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
