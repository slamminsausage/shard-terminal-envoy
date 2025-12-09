/**
 * TravellerMap API Client
 *
 * Direct frontend client for travellermap.com API.
 * Documentation: https://travellermap.com/doc/api
 */

import type {
  TravellerWorld,
  JumpWorldsResponse,
  RouteResponse,
  CoordinatesResponse,
  JumpWorld,
  RouteLeg,
  RouteRequest,
} from "@/types/navigation";

const TRAVELLER_MAP_BASE_URL = "https://travellermap.com";

/**
 * Pad hex to 4 digits (e.g., "222" -> "0222")
 */
export function padHex(hex: string): string {
  const cleaned = hex.replace(/\D/g, "");
  return cleaned.padStart(4, "0");
}

/**
 * Sector name to abbreviation mapping (reverse lookup)
 */
const SECTOR_NAME_TO_ABBR: Record<string, string> = {
  "spinward marches": "spin",
  "deneb": "dene",
  "trojan reach": "trin",
  "reft": "rect",
  "gushemege": "gush",
  "dagudashaag": "dagu",
  "core": "core",
  "massilia": "mass",
  "solomani rim": "solo",
  "alpha crucis": "alph",
  "corridor": "corr",
  "vland": "vlan",
  "lishun": "lish",
  "antares": "anta",
  "empty quarter": "empt",
  "ley": "ley",
  "glimmerdrift reaches": "glim",
  "diaspora": "dias",
  "old expanses": "olde",
  "fornast": "forn",
  "riftspan reaches": "rsre",
};

/**
 * Common sector abbreviations to full names
 */
export const SECTOR_ABBREVIATIONS: Record<string, string> = {
  spin: "Spinward Marches",
  dene: "Deneb",
  trin: "Trojan Reach",
  rect: "Reft",
  gush: "Gushemege",
  dagu: "Dagudashaag",
  core: "Core",
  mass: "Massilia",
  solo: "Solomani Rim",
  alph: "Alpha Crucis",
  corr: "Corridor",
  vlan: "Vland",
  lish: "Lishun",
  anta: "Antares",
  empt: "Empty Quarter",
  ley: "Ley",
  glim: "Glimmerdrift Reaches",
  dias: "Diaspora",
  olde: "Old Expanses",
  forn: "Fornast",
};

/**
 * Get sector abbreviation from full name
 */
export function getSectorAbbreviation(sector: string): string {
  const lower = sector.toLowerCase().trim();
  // Check if it's already an abbreviation
  if (SECTOR_ABBREVIATIONS[lower]) {
    return lower;
  }
  // Look up the abbreviation
  return SECTOR_NAME_TO_ABBR[lower] || sector;
}

/**
 * Get full sector name from abbreviation
 */
export function getSectorFullName(abbr: string): string {
  const lower = abbr.toLowerCase();
  return SECTOR_ABBREVIATIONS[lower] || abbr;
}

/**
 * Converts TravellerMap API world to simplified JumpWorld
 */
function toJumpWorld(world: TravellerWorld, defaultSector?: string): JumpWorld {
  return {
    name: world.Name || "Unknown",
    sector: world.Sector || defaultSector || "",
    sectorAbbr: getSectorAbbreviation(world.Sector || defaultSector || ""),
    hex: padHex(world.Hex || ""),
    uwp: world.UWP || "???????-?",
    zone: world.Zone || "",
    allegiance: world.Allegiance || "",
    remarks: world.Remarks || "",
  };
}

/**
 * Get all worlds within N parsecs (jump distance) of a starting world
 */
export async function getJumpWorlds(
  sector: string,
  hex: string,
  jump: number = 2
): Promise<JumpWorld[]> {
  try {
    const paddedHex = padHex(hex);
    const url = new URL("/api/jumpworlds", TRAVELLER_MAP_BASE_URL);
    url.searchParams.set("sector", sector);
    url.searchParams.set("hex", paddedHex);
    url.searchParams.set("jump", jump.toString());

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("JumpWorlds API error:", response.status, text);
      throw new Error(`TravellerMap API error: ${response.status}`);
    }

    const data: JumpWorldsResponse = await response.json();

    if (!data.Worlds || !Array.isArray(data.Worlds)) {
      return [];
    }

    return data.Worlds.map((w) => toJumpWorld(w, sector));
  } catch (error) {
    console.error("Failed to fetch jump worlds:", error);
    throw error;
  }
}

/**
 * Calculate the shortest route between two worlds given a jump rating
 */
export async function calculateRoute(
  request: RouteRequest
): Promise<RouteLeg[]> {
  try {
    // Parse and format start/end locations
    const startLoc = parseLocation(request.start);
    const endLoc = parseLocation(request.end);

    if (!startLoc || !endLoc) {
      throw new Error("Invalid start or end location format. Use 'Sector Hex' (e.g., 'Spinward Marches 1910')");
    }

    // Use sector abbreviations for the API
    const startAbbr = getSectorAbbreviation(startLoc.sector);
    const endAbbr = getSectorAbbreviation(endLoc.sector);
    const startHex = padHex(startLoc.hex);
    const endHex = padHex(endLoc.hex);

    const url = new URL("/api/route", TRAVELLER_MAP_BASE_URL);
    url.searchParams.set("start", `${startAbbr} ${startHex}`);
    url.searchParams.set("end", `${endAbbr} ${endHex}`);
    url.searchParams.set("jump", request.jump.toString());

    if (request.wild) {
      url.searchParams.set("wild", "1");
    }
    if (request.nored) {
      url.searchParams.set("nored", "1");
    }
    if (request.im) {
      url.searchParams.set("im", "1");
    }

    console.log("Route API URL:", url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Route API error:", response.status, text);
      throw new Error(`Route calculation failed: ${text || response.status}`);
    }

    const data: RouteResponse = await response.json();

    if (!data.Route || !Array.isArray(data.Route)) {
      return [];
    }

    return data.Route.map((world) => ({
      sector: world.Sector || "",
      sectorAbbr: getSectorAbbreviation(world.Sector || ""),
      hex: padHex(world.Hex || ""),
      name: world.Name || "Unknown",
      uwp: world.UWP || "",
      distance: world.Distance,
    }));
  } catch (error) {
    console.error("Failed to calculate route:", error);
    throw error;
  }
}

/**
 * Convert map-space x,y coordinates to sector + hex
 */
export async function getCoordinates(
  x: number,
  y: number
): Promise<CoordinatesResponse | null> {
  try {
    const url = new URL("/api/coordinates", TRAVELLER_MAP_BASE_URL);
    url.searchParams.set("x", x.toString());
    url.searchParams.set("y", y.toString());

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Coordinates API error:", response.status, text);
      throw new Error(`TravellerMap API error: ${response.status}`);
    }

    const data = await response.json();
    // Ensure hex is padded
    if (data.hx !== undefined && data.hy !== undefined) {
      data.Hex = padHex(`${data.hx}${data.hy}`);
    }
    return data;
  } catch (error) {
    console.error("Failed to get coordinates:", error);
    throw error;
  }
}

/**
 * Get world data for a specific location using jumpworlds with jump=0
 */
export async function getWorldData(
  sector: string,
  hex: string
): Promise<JumpWorld | null> {
  try {
    const paddedHex = padHex(hex);

    // Use jumpworlds API with jump=0 to get just this world
    const url = new URL("/api/jumpworlds", TRAVELLER_MAP_BASE_URL);
    url.searchParams.set("sector", sector);
    url.searchParams.set("hex", paddedHex);
    url.searchParams.set("jump", "0");

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      console.error("World data API error:", response.status);
      return null;
    }

    const data: JumpWorldsResponse = await response.json();

    if (data.Worlds && data.Worlds.length > 0) {
      return toJumpWorld(data.Worlds[0], sector);
    }

    return null;
  } catch (error) {
    console.error("Failed to get world data:", error);
    return null;
  }
}

/**
 * Generate URL for embedding TravellerMap iframe
 */
export function generateMapUrl(
  sector: string,
  hex: string,
  options: {
    style?: "poster" | "atlas" | "print" | "candy" | "draft" | "fasa" | "terminal";
    scale?: number;
    hideui?: boolean;
    galdir?: boolean;
    routes?: boolean;
  } = {}
): string {
  const {
    style = "poster",
    scale = 32,
    galdir = false,
    routes = true,
  } = options;

  const paddedHex = padHex(hex);

  // Use the embed-friendly URL format
  const url = new URL("/", TRAVELLER_MAP_BASE_URL);
  url.searchParams.set("p", `${sector} ${paddedHex}`);
  url.searchParams.set("style", style);
  url.searchParams.set("scale", scale.toString());

  // Build options bitmask
  let opts = 0;
  if (galdir) opts |= 0x0001;
  if (routes) opts |= 0x0002;
  opts |= 0x0010; // dimunofficial
  opts |= 41975; // Default options that enable click events

  url.searchParams.set("options", opts.toString());

  return url.toString();
}

/**
 * Parse a UWP (Universal World Profile) string
 */
export function parseUWP(uwp: string): {
  starport: string;
  size: string;
  atmosphere: string;
  hydrographics: string;
  population: string;
  government: string;
  lawLevel: string;
  techLevel: string;
} | null {
  if (!uwp || uwp.length < 9) {
    return null;
  }

  // UWP format: XSAHPGL-T (e.g., A434934-A)
  // Position: 0123456 8
  return {
    starport: uwp[0],
    size: uwp[1],
    atmosphere: uwp[2],
    hydrographics: uwp[3],
    population: uwp[4],
    government: uwp[5],
    lawLevel: uwp[6],
    techLevel: uwp[8] || "?",
  };
}

/**
 * Get starport description from code
 */
export function getStarportDescription(code: string): string {
  const starports: Record<string, string> = {
    A: "Excellent quality starport. Refined fuel, annual maintenance, shipyard capable of constructing starships.",
    B: "Good quality starport. Refined fuel, annual maintenance, shipyard capable of constructing non-jump ships.",
    C: "Routine quality starport. Only unrefined fuel, reasonable repair facilities present.",
    D: "Poor quality starport. Only unrefined fuel, no repair facilities.",
    E: "Frontier installation. No fuel or facilities available.",
    X: "No starport. No fuel or facilities available.",
  };

  return starports[code.toUpperCase()] || "Unknown starport type";
}

/**
 * Get zone description
 */
export function getZoneDescription(zone: string | undefined): string {
  if (!zone) return "Green Zone - Safe for travel";

  switch (zone.toUpperCase()) {
    case "A":
    case "R":
      return "Amber Zone - Caution advised, travel at your own risk";
    case "F":
    case "X":
      return "Red Zone - Interdicted, travel forbidden";
    default:
      return "Green Zone - Safe for travel";
  }
}

/**
 * Format sector and hex for display
 */
export function formatLocation(sector: string, hex: string): string {
  return `${sector} ${padHex(hex)}`;
}

/**
 * Parse location string (e.g., "Spinward Marches 1910" or "spin 1910")
 */
export function parseLocation(location: string): { sector: string; hex: string } | null {
  const trimmed = location.trim();

  // Try to split by last space before hex (3 or 4 digits)
  const match = trimmed.match(/^(.+?)\s+(\d{3,4})$/);
  if (match) {
    return {
      sector: match[1].trim(),
      hex: padHex(match[2]),
    };
  }

  return null;
}
