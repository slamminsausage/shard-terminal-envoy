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
 * Converts TravellerMap API world to simplified JumpWorld
 */
function toJumpWorld(world: TravellerWorld, defaultSector?: string): JumpWorld {
  return {
    name: world.Name || "Unknown",
    sector: world.Sector || defaultSector || "",
    hex: world.Hex || "",
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
    const url = new URL("/api/jumpworlds", TRAVELLER_MAP_BASE_URL);
    url.searchParams.set("sector", sector);
    url.searchParams.set("hex", hex);
    url.searchParams.set("jump", jump.toString());

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
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
    const url = new URL("/api/route", TRAVELLER_MAP_BASE_URL);
    url.searchParams.set("start", request.start);
    url.searchParams.set("end", request.end);
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

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`TravellerMap API error: ${response.status}`);
    }

    const data: RouteResponse = await response.json();

    if (!data.Route || !Array.isArray(data.Route)) {
      return [];
    }

    return data.Route.map((world) => ({
      sector: world.Sector || "",
      sectorAbbr: world.SectorAbbreviation || "",
      hex: world.Hex || "",
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
      throw new Error(`TravellerMap API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get coordinates:", error);
    throw error;
  }
}

/**
 * Get world data for a specific location
 */
export async function getWorldData(
  sector: string,
  hex: string
): Promise<JumpWorld | null> {
  try {
    const url = new URL(`/data/${encodeURIComponent(sector)}/${hex}`, TRAVELLER_MAP_BASE_URL);

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`TravellerMap API error: ${response.status}`);
    }

    const data = await response.json();

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
    style = "terminal",
    scale,
    hideui = true,
    galdir = false,
    routes = true,
  } = options;

  const url = new URL(
    `/go/${encodeURIComponent(sector)}/${encodeURIComponent(hex)}`,
    TRAVELLER_MAP_BASE_URL
  );

  url.searchParams.set("style", style);

  if (scale !== undefined) {
    url.searchParams.set("scale", scale.toString());
  }

  if (hideui) {
    url.searchParams.set("options", buildOptions({ galdir, routes, dimunofficial: true }));
  }

  return url.toString();
}

/**
 * Build options bitmask for TravellerMap
 */
function buildOptions(flags: {
  galdir?: boolean;
  routes?: boolean;
  dimunofficial?: boolean;
}): string {
  let options = 0;

  // TravellerMap option flags (from their API docs)
  // These are bitmask values
  if (flags.galdir) options |= 0x0001;
  if (flags.routes) options |= 0x0002;
  if (flags.dimunofficial) options |= 0x0010;

  return options.toString();
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
  return `${sector} ${hex}`;
}

/**
 * Parse location string (e.g., "Spinward Marches 1910" or "spin 1910")
 */
export function parseLocation(location: string): { sector: string; hex: string } | null {
  const trimmed = location.trim();

  // Try to split by last space before 4-digit hex
  const match = trimmed.match(/^(.+?)\s+(\d{4})$/);
  if (match) {
    return {
      sector: match[1].trim(),
      hex: match[2],
    };
  }

  return null;
}

/**
 * Common sector abbreviations
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
  shar: "Solomani Rim",
  alph: "Alpha Crucis",
};

/**
 * Get full sector name from abbreviation
 */
export function getSectorFullName(abbr: string): string {
  const lower = abbr.toLowerCase();
  return SECTOR_ABBREVIATIONS[lower] || abbr;
}
