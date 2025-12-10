// Types for TravellerMap API and Jump Planner functionality

// ===== TravellerMap API Types =====

export interface TravellerWorld {
  Name: string;
  Sector: string;
  Hex: string;
  UWP: string;
  Zone?: string;
  Allegiance?: string;
  Remarks?: string;
  PBG?: string;
  Worlds?: number;
  SectorX?: number;
  SectorY?: number;
  HexX?: number;
  HexY?: number;
}

export type JumpWorldsResponse = TravellerWorld[] | { Worlds?: TravellerWorld[] };

export interface RouteWorld {
  Sector: string;
  SectorAbbreviation?: string;
  Hex: string;
  Name: string;
  UWP?: string;
  Distance?: number;
}

export type RouteResponse = RouteWorld[] | { route?: RouteWorld[]; Route?: RouteWorld[] };

export interface CoordinatesResponse {
  // Sector name - resolved via Metadata API lookup from sx/sy
  Sector?: string;
  SectorAbbreviation?: string;
  // Hex in XXYY format, constructed from hx/hy
  Hex?: string;
  // World-space coordinates (input)
  x: number;
  y: number;
  // Sector coordinates (numeric)
  sx: number;
  sy: number;
  // Hex coordinates (numeric, separate column/row)
  hx: number;
  hy: number;
}

// Search API response types
export interface SearchResultWorld {
  Name?: string;    // TravellerMap often returns Name
  World?: string;   // Sometimes World is present
  Sector: string;
  Hex: string;
}

export interface SearchResultSector {
  Sector: string;
  SectorX: number;
  SectorY: number;
}

export interface SearchResultSubsector {
  Subsector: string;
  Sector: string;
  Index: string;
}

export interface SearchResultItem {
  World?: SearchResultWorld;
  Sector?: SearchResultSector;
  Subsector?: SearchResultSubsector;
}

export interface SearchResponse {
  Results: {
    Count: number;
    Items: SearchResultItem[];
  };
}

// TravellerMap iframe message types
export interface TravellerMapMessage {
  source: "travellermap";
  type: "click" | "doubleclick";
  location: {
    x: number;
    y: number;
    sector?: string;
    hex?: string;
  };
}

// ===== Simplified types for internal use =====

export interface JumpWorld {
  name: string;
  sector: string;
  sectorAbbr?: string;
  hex: string;
  uwp: string;
  zone?: string;
  allegiance?: string;
  remarks?: string;
}

export interface RouteLeg {
  sector: string;
  sectorAbbr?: string;
  hex: string;
  name: string;
  uwp?: string;
  distance?: number;
}

export interface CurrentLocation {
  sector: string;
  sectorAbbr?: string;
  hex: string;
  worldName?: string;
}

// ===== World Notes Types =====

export type WorldStatus =
  | "SAFE_HAVEN"
  | "UNFRIENDLY"
  | "PIRATE_BASE"
  | "NEUTRAL"
  | "RESTRICTED"
  | "ALLIED"
  | "CONTESTED"
  | "UNKNOWN";

export interface WorldNote {
  id?: string;
  sector: string;
  hex: string;
  world_name?: string;
  status?: WorldStatus;
  tags?: string;
  summary?: string;
  patrons?: string;
  gm_notes?: string;
  last_visited?: string;
  gm_only?: boolean;
  created_at?: string;
  updated_at?: string;
}

// ===== Route Planning Types =====

export interface RouteRequest {
  start: string; // e.g., "Spinward Marches 1910" or "spin 1910"
  end: string;
  jump: number;
  wild?: boolean;  // Allow wildcards in path
  nored?: boolean; // Avoid red zones
  im?: boolean;    // Imperium worlds only
}

// ===== Jump Planner State Types =====

export interface JumpPlannerState {
  // Current selection
  currentLocation: CurrentLocation | null;
  selectedWorld: JumpWorld | null;

  // Jump calculations
  jumpRating: number;
  jumpWorlds: JumpWorld[];
  isLoadingJumpWorlds: boolean;

  // Route planning
  routeStart: string;
  routeEnd: string;
  route: RouteLeg[];
  isLoadingRoute: boolean;
  routeOptions: {
    wild: boolean;
    nored: boolean;
    im: boolean;
  };

  // World notes
  currentNote: WorldNote | null;
  isLoadingNote: boolean;
  isSavingNote: boolean;

  // Map state
  mapSector: string;
  mapHex: string;

  // Error handling
  error: string | null;
}

// Starport types for UWP parsing
export type StarportClass = "A" | "B" | "C" | "D" | "E" | "X";

export interface ParsedUWP {
  starport: StarportClass;
  size: number;
  atmosphere: number;
  hydrographics: number;
  population: number;
  government: number;
  lawLevel: number;
  techLevel: number;
}
