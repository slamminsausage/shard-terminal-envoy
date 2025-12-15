import { useMemo } from "react";
import type { HexMarker } from "@/types/navigation";
import { parseHexCoords } from "@/lib/travellerMapApi";

interface MapMarkerOverlayProps {
  markers: HexMarker[];
  centerSector: string;
  centerHex: string;
  scale: number;
}

interface MarkerPosition {
  marker: HexMarker;
  x: number;
  y: number;
  visible: boolean;
}

/**
 * Calculate pixel position for a hex marker relative to the map center
 *
 * TravellerMap hex grid:
 * - Each hex column is offset (odd columns shift down by half hex height)
 * - Hex width = scale * 0.75 (approximate, based on TravellerMap rendering)
 * - Hex height = scale (approximate)
 */
function calculateHexPixelPosition(
  markerSector: string,
  markerHex: string,
  centerSector: string,
  centerHex: string,
  scale: number,
  mapWidth: number,
  mapHeight: number
): { x: number; y: number; visible: boolean } {
  // For now, only show markers in the same sector as the map center
  // Cross-sector positioning would require world-space coordinate conversion
  if (markerSector.toLowerCase() !== centerSector.toLowerCase()) {
    return { x: 0, y: 0, visible: false };
  }

  const markerCoords = parseHexCoords(markerHex);
  const centerCoords = parseHexCoords(centerHex);

  // Calculate hex offset from center
  const deltaCol = markerCoords.hx - centerCoords.hx;
  const deltaRow = markerCoords.hy - centerCoords.hy;

  // Hex grid geometry (approximate TravellerMap rendering)
  const hexWidth = scale * 0.9; // Horizontal spacing between hex centers
  const hexHeight = scale * 1.05; // Vertical spacing between hex centers

  // Calculate pixel offset
  // Odd columns are offset down by half a hex height
  const colOffsetY = (markerCoords.hx % 2) !== (centerCoords.hx % 2) ? hexHeight * 0.5 : 0;

  const pixelX = deltaCol * hexWidth;
  const pixelY = deltaRow * hexHeight + colOffsetY;

  // Center of map
  const centerX = mapWidth / 2;
  const centerY = mapHeight / 2;

  // Final position
  const x = centerX + pixelX;
  const y = centerY + pixelY;

  // Check if visible (within map bounds with some padding)
  const padding = 100;
  const visible = x >= -padding && x <= mapWidth + padding &&
                  y >= -padding && y <= mapHeight + padding;

  return { x, y, visible };
}

export function MapMarkerOverlay({
  markers,
  centerSector,
  centerHex,
  scale
}: MapMarkerOverlayProps) {
  // Assume standard map dimensions (will be constrained by parent container)
  const mapWidth = 800;
  const mapHeight = 600;

  // Calculate positions for all active markers
  const markerPositions = useMemo<MarkerPosition[]>(() => {
    const activeMarkers = markers.filter(m => m.is_active !== false);

    return activeMarkers.map(marker => {
      const position = calculateHexPixelPosition(
        marker.sector,
        marker.hex,
        centerSector,
        centerHex,
        scale,
        mapWidth,
        mapHeight
      );

      return {
        marker,
        ...position
      };
    }).filter(mp => mp.visible);
  }, [markers, centerSector, centerHex, scale]);

  if (markerPositions.length === 0) {
    return null;
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 10 }}
      viewBox={`0 0 ${mapWidth} ${mapHeight}`}
      preserveAspectRatio="xMidYMid slice"
    >
      {markerPositions.map((mp, idx) => {
        const color = mp.marker.marker_color || "#00ff88";
        const radius = Math.max(8, scale * 0.15); // Scale marker size with zoom

        return (
          <g key={mp.marker.id || idx}>
            {/* Marker circle with glow effect */}
            <circle
              cx={mp.x}
              cy={mp.y}
              r={radius * 1.5}
              fill={color}
              opacity={0.2}
            />
            <circle
              cx={mp.x}
              cy={mp.y}
              r={radius}
              fill={color}
              opacity={0.6}
              stroke={color}
              strokeWidth={2}
            />
            <circle
              cx={mp.x}
              cy={mp.y}
              r={radius * 0.5}
              fill="white"
              opacity={0.8}
            />

            {/* Marker label (if zoom is high enough) */}
            {scale >= 64 && mp.marker.marker_label && (
              <text
                x={mp.x}
                y={mp.y + radius + 14}
                textAnchor="middle"
                fontSize="10"
                fill={color}
                stroke="#0a1612"
                strokeWidth={3}
                paintOrder="stroke"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {mp.marker.marker_icon || ''} {mp.marker.marker_label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
