import { useRef, useEffect, useState } from "react";
import { useJumpPlanner } from "@/contexts/JumpPlannerContext";
import { generateMapUrl, padHex, getSectorFullName, type WorldSearchResult } from "@/lib/travellerMapApi";
import { WorldSearchAutocomplete } from "./WorldSearchAutocomplete";
import { MapPin, Navigation } from "lucide-react";

export function StarMapPanel() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const {
    mapSector,
    mapHex,
    currentLocation,
    playerLocation,
    markersWithWorldCoords,
    setMapLocation,
    setCurrentLocation,
    setPlayerLocation,
  } = useJumpPlanner();

  const [searchValue, setSearchValue] = useState("");
  const [hexInput, setHexInput] = useState(mapHex);

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

  // Generate map URL with "You Are Here" marker and custom markers
  const mapUrl = generateMapUrl(mapSector, mapHex, {
    style: "poster", // switch back to the original TravellerMap look
    scale: 32,
    yahSector: playerLocation?.sector,
    yahHex: playerLocation?.hex,
    markers: markersWithWorldCoords,
    markerRadius: 0.5, // 0.5 parsec radius circles
  });

  // Debug: Log the generated URL to verify oc parameter is present
  console.log("[StarMapPanel] Generated map URL:", mapUrl);
  console.log("[StarMapPanel] Number of markers with world coords:", markersWithWorldCoords.length);

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

        {/* Player Location Display */}
        {playerLocation && (
          <div className="px-4 py-2 bg-[#00ff88]/5 border-y border-primary/20">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-xs text-[#446655]">SHIP LOCATION:</span>
              <span className="text-primary font-bold text-sm">
                {playerLocation.worldName || playerLocation.hex}
              </span>
              <span className="text-[#00ccff] text-xs font-mono ml-auto">
                {playerLocation.sector} {playerLocation.hex}
              </span>
            </div>
          </div>
        )}

        {/* Map Iframe */}
        <div className="flex-1 relative min-h-[320px] min-w-0">
          <iframe
            ref={iframeRef}
            // Key forces iframe to fully reload when sector/hex changes
            key={`${mapSector}-${mapHex}`}
            src={mapUrl}
            className="absolute inset-0 w-full h-full border-t border-[#1a2420]"
            title="TravellerMap"
            allow="fullscreen"
          />
        </div>

        {/* Current Selection Display */}
        {currentLocation && (
          <div className="px-4 pb-4 border-t border-[#1a2420] pt-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[#446655] text-xs mr-2">SELECTED:</span>
                <span className="text-primary font-bold">
                  {currentLocation.worldName || currentLocation.hex}
                </span>
              </div>
              <span className="text-[#00ccff] text-sm font-mono">
                {currentLocation.sector} {currentLocation.hex}
              </span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="px-4 pb-3 text-center">
          <span className="text-xs text-[#446655]">
            Search for worlds by name, or click on the map to select a hex.
            Set your ship location to display "You Are Here" marker.
          </span>
        </div>
      </div>
    </div>
  );
}
