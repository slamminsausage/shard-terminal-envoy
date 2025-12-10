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
  SearchResponse,
  SearchResultItem,
} from "@/types/navigation";

const TRAVELLER_MAP_BASE_URL = "https://travellermap.com";

/**
 * Pad hex to 4 digits (e.g., "222" -> "0222")
 */
export function padHex(hex: string | undefined | null): string {
  if (!hex) return "0000";
  const cleaned = hex.replace(/\D/g, "");
  return cleaned.padStart(4, "0");
}

/**
 * Sector name to abbreviation mapping (reverse lookup)
 * TravellerMap uses first 4 letters as abbreviations (except Ley which is 3)
 */
const SECTOR_NAME_TO_ABBR: Record<string, string> = {
  "spinward marches": "spin",
  "deneb": "dene",
  "trojan reach": "troj",
  "reft": "reft",
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
  "riftspan reaches": "rift",
  "trojan reaches": "troj",
  "the beyond": "beyo",
  "far frontiers": "farf",
  "vanguard reaches": "vang",
  "crucis margin": "cruc",
  "magyar": "magy",
  "daibei": "daib",
  "reaver's deep": "reav",
  "dark nebula": "dark",
  "ustral quadrant": "ustr",
  "canopus": "cano",
  "aldebaran": "alde",
  "neworld": "newo",
  "langere": "lang",
  "aktifao": "akti",
  "mendan": "mend",
  "amdukan": "amdu",
  "zarushagar": "zaru",
  "ilelish": "ilel",
  "verge": "verg",
  "ealiyasiyw": "eali",
  "staihaia'yo": "stai",
  "hlakhoi": "hlak",
  "iwahfuah": "iwah",
  "arzul": "arzu",
  "kaa g'kul": "kaag",
  "touchstone": "touc",
  "delta": "delt",
  "hinterworlds": "hint",
  "pax rulin": "paxr",
  "spica": "spic",
  "foreven": "fore",
};

/**
 * Common sector abbreviations to full names
 */
export const SECTOR_ABBREVIATIONS: Record<string, string> = {
  spin: "Spinward Marches",
  dene: "Deneb",
  troj: "Trojan Reach",
  reft: "Reft",
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
  rift: "Riftspan Reaches",
  beyo: "The Beyond",
  farf: "Far Frontiers",
  vang: "Vanguard Reaches",
  cruc: "Crucis Margin",
  magy: "Magyar",
  daib: "Daibei",
  reav: "Reaver's Deep",
  dark: "Dark Nebula",
  ustr: "Ustral Quadrant",
  cano: "Canopus",
  alde: "Aldebaran",
  newo: "Neworld",
  lang: "Langere",
  akti: "Aktifao",
  mend: "Mendan",
  amdu: "Amdukan",
  zaru: "Zarushagar",
  ilel: "Ilelish",
  verg: "Verge",
  eali: "Ealiyasiyw",
  stai: "Staihaia'yo",
  hlak: "Hlakhoi",
  iwah: "Iwahfuah",
  arzu: "Arzul",
  kaag: "Kaa G'kul",
  touc: "Touchstone",
  delt: "Delta",
  hint: "Hinterworlds",
  paxr: "Pax Rulin",
  spic: "Spica",
  fore: "Foreven",
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
 * Get sector name from numeric sector coordinates (sx, sy)
 * Uses the Metadata API to look up sector info
 */
export async function getSectorNameFromCoords(
  sx: number,
  sy: number
): Promise<string | null> {
  try {
    const url = new URL("/api/metadata", TRAVELLER_MAP_BASE_URL);
    url.searchParams.set("sx", sx.toString());
    url.searchParams.set("sy", sy.toString());

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("Metadata API error:", response.status);
      return null;
    }

    const data = await response.json();

    // The Metadata API returns sector info with Names array
    // Names[0].Text contains the primary sector name
    if (data.Names && Array.isArray(data.Names) && data.Names.length > 0) {
      return data.Names[0].Text || null;
    }

    // Fallback to other possible field names
    return data.Name || data.Sector || data.SectorName || null;
  } catch (error) {
    console.error("Failed to get sector name from coordinates:", error);
    return null;
  }
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
    const sectorFull = getSectorFullName(sector);
    const url = new URL("/api/jumpworlds", TRAVELLER_MAP_BASE_URL);
    url.searchParams.set("sector", sectorFull);
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
    const worlds = Array.isArray(data)
      ? data
      : Array.isArray(data.Worlds)
        ? data.Worlds
        : [];

    return worlds.map((w) => toJumpWorld(w, sectorFull));
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

    // Get full sector names for more reliable API calls
    const startSector = getSectorFullName(startLoc.sector);
    const endSector = getSectorFullName(endLoc.sector);
    const startHex = padHex(startLoc.hex);
    const endHex = padHex(endLoc.hex);

    const url = new URL("/api/route", TRAVELLER_MAP_BASE_URL);
    url.searchParams.set("start", `${startSector} ${startHex}`);
    url.searchParams.set("end", `${endSector} ${endHex}`);
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
    const legs = Array.isArray(data)
      ? data
      : Array.isArray(data.route)
        ? data.route
        : Array.isArray(data.Route)
          ? data.Route
          : [];

    return legs.map((world) => ({
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
 *
 * The Coordinates API returns sx, sy (numeric sector coords) and hx, hy (hex coords)
 * but NOT the sector name. We need to look up the sector name via Metadata API.
 */
export async function getCoordinates(
  x: number,
  y: number
): Promise<CoordinatesResponse | null> {
  try {
    const url = new URL("/api/coordinates", TRAVELLER_MAP_BASE_URL);
    url.searchParams.set("x", x.toString());
    url.searchParams.set("y", y.toString());

    console.log("Fetching coordinates for:", { x, y, url: url.toString() });

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
    console.log("Coordinates API response:", JSON.stringify(data, null, 2));

    // Construct hex from hx/hy coordinates
    // hx and hy are separate numbers (e.g., hx=19, hy=10 → "1910")
    if (data.hx !== undefined && data.hy !== undefined) {
      // Hex format: XXYY where XX is column (hx) and YY is row (hy)
      const hxPadded = String(data.hx).padStart(2, "0");
      const hyPadded = String(data.hy).padStart(2, "0");
      data.Hex = `${hxPadded}${hyPadded}`;
    }

    // The Coordinates API does NOT return sector name when called with x/y
    // It only returns sx, sy (numeric sector coordinates)
    // We need to look up the sector name via the Metadata API
    if (!data.Sector && data.sx !== undefined && data.sy !== undefined) {
      console.log("Looking up sector name for sx:", data.sx, "sy:", data.sy);
      const sectorName = await getSectorNameFromCoords(data.sx, data.sy);
      if (sectorName) {
        data.Sector = sectorName;
        console.log("Resolved sector name:", sectorName);
      } else {
        console.error("Could not resolve sector name from coordinates sx:", data.sx, "sy:", data.sy);
      }
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
    const sectorFull = getSectorFullName(sector);

    // Prefer the data URL for a single world
    const dataUrl = new URL(`/data/${encodeURIComponent(sectorFull)}/${paddedHex}`, TRAVELLER_MAP_BASE_URL);
    let response = await fetch(dataUrl.toString(), {
      headers: { Accept: "application/json" },
    });

    // Fallback to jumpworlds if needed
    if (!response.ok) {
      const fallbackUrl = new URL("/api/jumpworlds", TRAVELLER_MAP_BASE_URL);
      fallbackUrl.searchParams.set("sector", sectorFull);
      fallbackUrl.searchParams.set("hex", paddedHex);
      fallbackUrl.searchParams.set("jump", "0");
      response = await fetch(fallbackUrl.toString(), { headers: { Accept: "application/json" } });
      if (!response.ok) {
        if (response.status === 404) return null;
        console.error("World data API error:", response.status);
        return null;
      }
    }

    const data = await response.json();

    // jumpworlds shape or bare array
    if (Array.isArray(data) && data.length > 0) {
      return toJumpWorld(data[0], sectorFull);
    }
    if (data.Worlds && Array.isArray(data.Worlds) && data.Worlds.length > 0) {
      return toJumpWorld(data.Worlds[0], sectorFull);
    }

    // data URL shape (single world)
    if (data && data.Sector && data.Hex) {
      return toJumpWorld(
        {
          Name: data.Name || data.World,
          World: data.World,
          Sector: data.Sector,
          Hex: data.Hex,
          UWP: data.UWP,
          Zone: data.Zone,
          Allegiance: data.Allegiance,
          Remarks: data.Remarks,
        } as any,
        sectorFull
      );
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
    style?: "poster" | "atlas" | "print" | "candy" | "draft" | "fasa" | "terminal" | "mongoose";
    scale?: number;
    hideui?: boolean;
    galdir?: boolean;
    routes?: boolean;
    yahSector?: string;
    yahHex?: string;
  } = {}
): string {
  const sectorFull = getSectorFullName(sector);
  const {
    style = "terminal",
    scale = 32,
    galdir = false,
    routes = true,
    yahSector,
    yahHex,
  } = options;

  const paddedHex = padHex(hex);

  // Use the /go/ URL format which properly handles sector+hex navigation
  const url = new URL(`/go/${encodeURIComponent(sectorFull)}/${paddedHex}`, TRAVELLER_MAP_BASE_URL);
  url.searchParams.set("style", style);
  url.searchParams.set("scale", scale.toString());

  // Build options bitmask for rendering
  // See: https://travellermap.com/doc/api#options
  let opts = 0;
  opts |= 0x0001; // SectorGrid
  opts |= 0x0002; // SubsectorGrid
  opts |= 0x0010; // BordersMajor
  opts |= 0x0020; // BordersMinor
  opts |= 0x0040; // NamesMajor
  opts |= 0x0080; // NamesMinor
  opts |= 0x0100; // WorldsCapitals
  opts |= 0x0200; // WorldsHomeworlds
  opts |= 0x8000; // FilledBorders

  url.searchParams.set("options", opts.toString());

  // Galactic directions overlay
  if (!galdir) {
    url.searchParams.set("galdir", "0");
  }

  // Routes
  if (!routes) {
    url.searchParams.set("routes", "0");
  }

  // "You Are Here" marker support
  if (yahSector && yahHex) {
    url.searchParams.set("yah_sector", yahSector);
    url.searchParams.set("yah_hex", padHex(yahHex));
  }

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

/**
 * Search result item normalized for display
 */
export interface WorldSearchResult {
  name: string;
  sector: string;
  hex: string;
  type: "world" | "sector" | "subsector";
}

/**
 * Search for worlds, sectors, and subsectors by name
 */
export async function searchWorlds(
  query: string,
  maxResults: number = 20
): Promise<WorldSearchResult[]> {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    const url = new URL("/api/search", TRAVELLER_MAP_BASE_URL);
    url.searchParams.set("q", query);

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("Search API error:", response.status);
      return [];
    }

    const data: SearchResponse = await response.json();

    if (!data.Results || !data.Results.Items) {
      return [];
    }

    const results: WorldSearchResult[] = [];

    for (const item of data.Results.Items) {
      if (results.length >= maxResults) break;

      if (item.World) {
        // Skip results with missing critical data
        if (!item.World.Sector) {
          console.warn("Skipping world with incomplete sector data:", item.World);
          continue;
        }

        // Get hex from Hex field or construct from HexX/HexY
        let hex = item.World.Hex;
        if (!hex && item.World.HexX !== undefined && item.World.HexY !== undefined) {
          hex = `${String(item.World.HexX).padStart(2, '0')}${String(item.World.HexY).padStart(2, '0')}`;
        }

        if (!hex) {
          console.warn("Skipping world with incomplete hex data:", item.World);
          continue;
        }

        results.push({
          name: item.World.World || item.World.Name || "Unknown",
          sector: item.World.Sector,
          hex: padHex(hex),
          type: "world",
        });
      } else if (item.Sector) {
        results.push({
          name: item.Sector.Sector,
          sector: item.Sector.Sector,
          hex: "",
          type: "sector",
        });
      } else if (item.Subsector) {
        results.push({
          name: `${item.Subsector.Subsector} (${item.Subsector.Sector})`,
          sector: item.Subsector.Sector,
          hex: "",
          type: "subsector",
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Failed to search worlds:", error);
    return [];
  }
}
