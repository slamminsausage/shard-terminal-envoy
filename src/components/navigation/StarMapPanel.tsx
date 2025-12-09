import { useRef, useEffect, useState } from "react";
import { useJumpPlanner } from "@/contexts/JumpPlannerContext";
import { generateMapUrl } from "@/lib/travellerMapApi";

export function StarMapPanel() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const {
    mapSector,
    mapHex,
    currentLocation,
    setMapLocation,
  } = useJumpPlanner();

  const [sectorInput, setSectorInput] = useState(mapSector);
  const [hexInput, setHexInput] = useState(mapHex);

  // Update inputs when map location changes
  useEffect(() => {
    setSectorInput(mapSector);
    setHexInput(mapHex);
  }, [mapSector, mapHex]);

  const handleGoToLocation = () => {
    if (sectorInput && hexInput) {
      setMapLocation(sectorInput, hexInput);
    }
  };

  const mapUrl = generateMapUrl(mapSector, mapHex, {
    style: "poster",
    hideui: true,
  });

  return (
    <div className="star-map-panel flex-1 flex flex-col panel">
      <div className="panel-header">
        <span className="panel-title">STAR MAP</span>
        <span className="panel-status">
          {currentLocation
            ? `${currentLocation.sector} ${currentLocation.hex}`
            : "Click map to select"}
        </span>
      </div>

      <div className="panel-content flex flex-col gap-3 p-0">
        {/* Quick Nav Controls */}
        <div className="flex gap-2 px-4 pt-4">
          <input
            type="text"
            value={sectorInput}
            onChange={(e) => setSectorInput(e.target.value)}
            placeholder="Sector"
            className="terminal-input flex-1 text-sm"
          />
          <input
            type="text"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            placeholder="Hex"
            className="terminal-input w-20 text-sm"
            maxLength={4}
          />
          <button
            onClick={handleGoToLocation}
            className="terminal-btn text-xs"
          >
            GO
          </button>
        </div>

        {/* Map Iframe */}
        <div className="flex-1 relative min-h-[400px]">
          <iframe
            ref={iframeRef}
            src={mapUrl}
            className="absolute inset-0 w-full h-full border-t border-[#1a2420]"
            title="TravellerMap"
            sandbox="allow-scripts allow-same-origin"
          />

          {/* Overlay for instructions */}
          <div className="absolute bottom-2 left-2 right-2 text-center">
            <span className="text-xs text-[#446655] bg-black/80 px-2 py-1 rounded">
              Click on a world to select it. The map will post click events.
            </span>
          </div>
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
              <span className="text-[#00ccff] text-sm">
                {currentLocation.sector} {currentLocation.hex}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
