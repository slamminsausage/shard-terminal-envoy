import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import {
  getJumpWorlds,
  calculateRoute,
  getCoordinates,
  getWorldData,
  getSectorCoordinates,
  parseHexCoords,
  padHex,
  getSectorAbbreviation,
  getSectorFullName,
} from "@/lib/travellerMapApi";
import { dbHelpers } from "@/lib/supabase";
import { toast } from "sonner";
import type {
  JumpWorld,
  RouteLeg,
  WorldNote,
  CurrentLocation,
  TravellerMapMessage,
  HexMarker,
  MarkerFilter,
  MarkerType,
} from "@/types/navigation";

// ===== Context Types =====

interface JumpPlannerState {
  // Current selection
  currentLocation: CurrentLocation | null;
  selectedWorld: JumpWorld | null;

  // Player location ("You Are Here" marker)
  playerLocation: CurrentLocation | null;

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
  allNotes: WorldNote[];
  isLoadingNote: boolean;
  isSavingNote: boolean;

  // Hex markers
  hexMarkers: HexMarker[];
  currentHexMarkers: HexMarker[];
  isLoadingMarkers: boolean;
  isSavingMarker: boolean;
  markerFilter: MarkerFilter;

  // Map state
  mapSector: string;
  mapHex: string;

  // Error handling
  error: string | null;
}

interface JumpPlannerActions {
  // Location actions
  setCurrentLocation: (sector: string, hex: string) => Promise<void>;
  setPlayerLocation: (sector: string, hex: string) => void;
  handleMapClick: (x: number, y: number) => Promise<void>;

  // Jump world actions
  setJumpRating: (rating: number) => void;
  loadJumpWorlds: () => Promise<void>;
  selectJumpWorld: (world: JumpWorld) => void;

  // Route actions
  setRouteStart: (location: string) => void;
  setRouteEnd: (location: string) => void;
  setRouteOptions: (options: Partial<JumpPlannerState["routeOptions"]>) => void;
  planRoute: () => Promise<void>;
  setRouteEndFromWorld: (world: JumpWorld) => void;

  // Note actions
  loadNote: (sector: string, hex: string) => Promise<void>;
  updateNote: (note: Partial<WorldNote>) => void;
  saveNote: () => Promise<void>;
  loadAllNotes: () => Promise<void>;

  // Marker actions
  loadAllMarkers: () => Promise<void>;
  loadMarkersForHex: (sector: string, hex: string) => Promise<void>;
  saveMarker: (marker: HexMarker) => Promise<void>;
  deleteMarker: (id: string) => Promise<void>;
  toggleMarkerActive: (id: string, isActive: boolean) => Promise<void>;
  setMarkerFilter: (filter: Partial<MarkerFilter>) => void;

  // Map actions
  setMapLocation: (sector: string, hex: string) => void;

  // Error handling
  clearError: () => void;
}

interface JumpPlannerContextValue extends JumpPlannerState, JumpPlannerActions {}

// ===== Constants =====

const PLAYER_LOCATION_STORAGE_KEY = 'traveller_player_location';

// ===== Initial State =====

const initialState: JumpPlannerState = {
  currentLocation: null,
  selectedWorld: null,
  playerLocation: null,
  jumpRating: 2,
  jumpWorlds: [],
  isLoadingJumpWorlds: false,
  routeStart: "",
  routeEnd: "",
  route: [],
  isLoadingRoute: false,
  routeOptions: {
    wild: false,
    nored: true,
    im: false,
  },
  currentNote: null,
  allNotes: [],
  isLoadingNote: false,
  isSavingNote: false,
  hexMarkers: [],
  currentHexMarkers: [],
  isLoadingMarkers: false,
  isSavingMarker: false,
  markerFilter: {
    types: [],
    showInactive: false,
  },
  mapSector: "Trojan Reach",
  mapHex: "2223",
  error: null,
};

// ===== Context =====

const JumpPlannerContext = createContext<JumpPlannerContextValue | null>(null);

export function useJumpPlanner(): JumpPlannerContextValue {
  const context = useContext(JumpPlannerContext);
  if (!context) {
    throw new Error("useJumpPlanner must be used within a JumpPlannerProvider");
  }
  return context;
}

// ===== Provider =====

export function JumpPlannerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<JumpPlannerState>(initialState);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  const initialLoadComplete = useRef(false);

  // Load player location from Supabase (with localStorage fallback) on mount
  useEffect(() => {
    async function loadPlayerLocation() {
      try {
        const playerLocation = await dbHelpers.getGameSetting<CurrentLocation>(PLAYER_LOCATION_STORAGE_KEY);
        if (playerLocation?.sector && playerLocation?.hex) {
          setState((prev) => ({ ...prev, playerLocation }));
        }
      } catch (error) {
        console.error("Failed to load player location:", error);
      } finally {
        initialLoadComplete.current = true;
      }
    }

    loadPlayerLocation();
  }, []);

  // When playerLocation changes, pre-fetch the numeric sector coords (sx, sy) needed
  // for the yah_sx/yah_sy/yah_hx/yah_hy marker params.  These bypass TravellerMap's
  // broken named-lookup entirely. hx/hy are parsed directly from the hex string.
  // Also back-fill worldName if it was missing (e.g. loaded from storage).
  useEffect(() => {
    if (!state.playerLocation) return;
    const { sector, hex, sx, sy, worldName } = state.playerLocation;

    // Only fetch if something is still missing
    if (sx !== undefined && sy !== undefined && worldName !== undefined) return;

    const updates: Partial<typeof state.playerLocation> = {};

    // hx/hy are derived directly from the hex string — no API call needed
    const { hx, hy } = parseHexCoords(hex);
    updates.hx = hx;
    updates.hy = hy;

    const coordsPromise = sx === undefined || sy === undefined
      ? getSectorCoordinates(sector).then((coords) => {
          if (coords) { updates.sx = coords.sx; updates.sy = coords.sy; }
        }).catch(() => {})
      : Promise.resolve();

    const namePromise = worldName === undefined
      ? getWorldData(sector, hex).then((worldData) => {
          if (worldData) updates.worldName = worldData.name;
        }).catch(() => {})
      : Promise.resolve();

    Promise.all([coordsPromise, namePromise]).then(() => {
      if (Object.keys(updates).length === 0) return;
      setState((prev) => {
        if (prev.playerLocation?.sector !== sector || prev.playerLocation?.hex !== hex) return prev;
        return { ...prev, playerLocation: { ...prev.playerLocation, ...updates } };
      });
    });
  }, [state.playerLocation?.sector, state.playerLocation?.hex]);

  // Save player location to Supabase (with localStorage backup) when it changes
  useEffect(() => {
    // Skip the initial save - only save after user interactions
    if (!initialLoadComplete.current) return;

    async function savePlayerLocation() {
      try {
        if (state.playerLocation) {
          await dbHelpers.setGameSetting(PLAYER_LOCATION_STORAGE_KEY, state.playerLocation);
        } else {
          await dbHelpers.deleteGameSetting(PLAYER_LOCATION_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Failed to save player location:", error);
      }
    }

    savePlayerLocation();
  }, [state.playerLocation]);

  // Listen for TravellerMap iframe messages
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data as TravellerMapMessage;
      if (!data || data.source !== "travellermap") return;

      if (data.type === "click" || data.type === "doubleclick") {
        const { sector, hex, x, y } = data.location || {};
        if (sector && hex) {
          // Prefer direct sector/hex from TravellerMap event to avoid coordinate jitter
          void setCurrentLocation(sector, hex);
        } else if (typeof x === "number" && typeof y === "number") {
          // Fallback: resolve via coordinates API
          void handleMapClick(x, y);
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [state.jumpRating]);

  // ===== Location Actions =====

  const setCurrentLocation = useCallback(
    async (sector: string, hex: string) => {
      const paddedHex = padHex(hex);
      const sectorFull = getSectorFullName(sector);

      setState((prev) => ({
        ...prev,
        currentLocation: { sector: sectorFull, hex: paddedHex },
        mapSector: sectorFull,
        mapHex: paddedHex,
        error: null,
      }));

      // Try to get world data for name
      try {
        const worldData = await getWorldData(sectorFull, paddedHex);
        if (worldData) {
          const sectorAbbr = getSectorAbbreviation(sectorFull);
          setState((prev) => ({
            ...prev,
            currentLocation: {
              sector: sectorFull,
              sectorAbbr,
              hex: paddedHex,
              worldName: worldData.name,
            },
            selectedWorld: worldData,
            routeStart: `${sectorFull} ${paddedHex}`,
          }));
        } else {
          // No world at this hex - clear selectedWorld
          setState((prev) => ({
            ...prev,
            selectedWorld: null,
          }));
        }
      } catch (error) {
        console.error("Failed to get world data:", error);
        // Clear selectedWorld on error too
        setState((prev) => ({
          ...prev,
          selectedWorld: null,
        }));
      }

      // Load note for this location
      await loadNote(sector, paddedHex);

      // Load markers for this location
      await loadMarkersForHex(sector, paddedHex);
    },
    []
  );

  const handleMapClick = useCallback(
    async (x: number, y: number) => {
      try {
        // getCoordinates now resolves sector name via Metadata API
        const coords = await getCoordinates(x, y);
        if (!coords) {
          console.warn("No coordinates returned from API");
          return;
        }

        console.log("Processing coordinates:", coords);

        // Sector name is now resolved by getCoordinates via Metadata API lookup
        if (!coords.Sector) {
          console.error("Could not determine sector from coordinates:", coords);
          setState((prev) => ({
            ...prev,
            error: "Could not determine sector for map location",
          }));
          return;
        }

        // Hex is now properly constructed by getCoordinates (XXYY format)
        const hex = coords.Hex;
        if (!hex || hex === "0000") {
          console.error("Could not determine valid hex from coordinates:", coords);
          return;
        }

        const sectorFull = getSectorFullName(coords.Sector);
        console.log("Setting location to:", sectorFull, hex);

        await setCurrentLocation(sectorFull, hex);
      } catch (error) {
        console.error("Coordinate lookup failed:", error);
        setState((prev) => ({
          ...prev,
          error: "Failed to get coordinates from map click",
        }));
      }
    },
    [setCurrentLocation]
  );

  // ===== Jump World Actions =====

  const setJumpRating = useCallback((rating: number) => {
    setState((prev) => ({
      ...prev,
      jumpRating: Math.max(1, Math.min(6, rating)),
    }));
  }, []);

  const loadJumpWorlds = useCallback(async () => {
    const { currentLocation, jumpRating } = stateRef.current;
    if (!currentLocation) {
      setState((prev) => ({
        ...prev,
        error: "No location selected",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoadingJumpWorlds: true, error: null }));

    try {
      const worlds = await getJumpWorlds(
        currentLocation.sector,
        currentLocation.hex,
        jumpRating
      );
      setState((prev) => ({
        ...prev,
        jumpWorlds: worlds,
        isLoadingJumpWorlds: false,
      }));
    } catch (error) {
      console.error("Failed to load jump worlds:", error);
      setState((prev) => ({
        ...prev,
        isLoadingJumpWorlds: false,
        error: "Failed to load nearby worlds",
      }));
    }
  }, [state.currentLocation, state.jumpRating]);

  // ===== Note Actions (declared before selectJumpWorld which depends on loadNote) =====

  const loadNote = useCallback(async (sector: string, hex: string) => {
    const paddedHex = padHex(hex);
    setState((prev) => ({ ...prev, isLoadingNote: true }));

    try {
      const note = await dbHelpers.getWorldNote(sector, paddedHex);
      setState((prev) => ({
        ...prev,
        currentNote: note || {
          sector,
          hex: paddedHex,
          status: "UNKNOWN",
        },
        isLoadingNote: false,
      }));
    } catch (error) {
      console.error("Failed to load note:", error);
      setState((prev) => ({
        ...prev,
        currentNote: { sector, hex: paddedHex, status: "UNKNOWN" },
        isLoadingNote: false,
      }));
    }
  }, []);

  const selectJumpWorld = useCallback((world: JumpWorld) => {
    const paddedHex = padHex(world.hex);
    setState((prev) => ({
      ...prev,
      selectedWorld: { ...world, hex: paddedHex },
    }));
    // Load note for selected world
    loadNote(world.sector, paddedHex);
  }, [loadNote]);

  // ===== Route Actions =====

  const setRouteStart = useCallback((location: string) => {
    setState((prev) => ({ ...prev, routeStart: location }));
  }, []);

  const setRouteEnd = useCallback((location: string) => {
    setState((prev) => ({ ...prev, routeEnd: location }));
  }, []);

  const setRouteOptions = useCallback(
    (options: Partial<JumpPlannerState["routeOptions"]>) => {
      setState((prev) => ({
        ...prev,
        routeOptions: { ...prev.routeOptions, ...options },
      }));
    },
    []
  );

  const setRouteEndFromWorld = useCallback((world: JumpWorld) => {
    const paddedHex = padHex(world.hex);
    setState((prev) => ({
      ...prev,
      routeEnd: `${world.sector} ${paddedHex}`,
    }));
  }, []);

  const planRoute = useCallback(async () => {
    const { routeStart, routeEnd, jumpRating, routeOptions } = stateRef.current;

    if (!routeStart || !routeEnd) {
      setState((prev) => ({
        ...prev,
        error: "Please specify start and end locations",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoadingRoute: true, error: null }));

    try {
      const legs = await calculateRoute({
        start: routeStart,
        end: routeEnd,
        jump: jumpRating,
        wild: routeOptions.wild,
        nored: routeOptions.nored,
        im: routeOptions.im,
      });

      setState((prev) => ({
        ...prev,
        route: legs,
        isLoadingRoute: false,
      }));
    } catch (error) {
      console.error("Route planning failed:", error);
      setState((prev) => ({
        ...prev,
        isLoadingRoute: false,
        error: "Failed to calculate route",
      }));
    }
  }, [state.routeStart, state.routeEnd, state.jumpRating, state.routeOptions]);

  const loadAllNotes = useCallback(async () => {
    try {
      const notes = await dbHelpers.getAllWorldNotes();
      setState((prev) => ({ ...prev, allNotes: notes }));
    } catch (error) {
      console.error("Failed to load all notes:", error);
      toast.error("Failed to load world notes. Check your connection.");
    }
  }, []);

  const updateNote = useCallback((updates: Partial<WorldNote>) => {
    setState((prev) => ({
      ...prev,
      currentNote: prev.currentNote
        ? { ...prev.currentNote, ...updates }
        : null,
    }));
  }, []);

  const saveNote = useCallback(async () => {
    const { currentNote } = state;
    if (!currentNote) return;

    setState((prev) => ({ ...prev, isSavingNote: true }));

    try {
      const saved = await dbHelpers.saveWorldNote(currentNote);
      setState((prev) => ({
        ...prev,
        currentNote: saved || currentNote,
        isSavingNote: false,
      }));
      // Reload all notes
      await loadAllNotes();
    } catch (error) {
      console.error("Failed to save note:", error);
      setState((prev) => ({
        ...prev,
        isSavingNote: false,
        error: "Failed to save world note",
      }));
    }
  }, [state.currentNote, loadAllNotes]);

  // ===== Marker Actions =====

  const loadAllMarkers = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoadingMarkers: true }));
    try {
      const markers = await dbHelpers.getAllHexMarkers();
      setState((prev) => ({
        ...prev,
        hexMarkers: markers,
        isLoadingMarkers: false
      }));
    } catch (error) {
      console.error("Failed to load all markers:", error);
      toast.error("Failed to load hex markers. Check your connection.");
      setState((prev) => ({ ...prev, isLoadingMarkers: false }));
    }
  }, []);

  // Load all notes on mount (must be after loadAllNotes is defined)
  useEffect(() => {
    loadAllNotes();
  }, [loadAllNotes]);

  // Load all markers on mount (must be after loadAllMarkers is defined)
  useEffect(() => {
    loadAllMarkers();
  }, [loadAllMarkers]);

  const loadMarkersForHex = useCallback(async (sector: string, hex: string) => {
    const paddedHex = padHex(hex);
    setState((prev) => ({ ...prev, isLoadingMarkers: true }));
    try {
      const markers = await dbHelpers.getHexMarkers(sector, paddedHex);
      setState((prev) => ({
        ...prev,
        currentHexMarkers: markers,
        isLoadingMarkers: false,
      }));
    } catch (error) {
      console.error("Failed to load hex markers:", error);
      setState((prev) => ({
        ...prev,
        currentHexMarkers: [],
        isLoadingMarkers: false,
      }));
    }
  }, []);

  const saveMarker = useCallback(async (marker: HexMarker) => {
    setState((prev) => ({ ...prev, isSavingMarker: true }));
    try {
      const saved = await dbHelpers.saveHexMarker(marker);
      setState((prev) => ({ ...prev, isSavingMarker: false }));

      // Reload markers for current hex and all markers
      if (saved) {
        await loadMarkersForHex(marker.sector, marker.hex);
        await loadAllMarkers();
      }
    } catch (error) {
      console.error("Failed to save marker:", error);
      setState((prev) => ({
        ...prev,
        isSavingMarker: false,
        error: "Failed to save marker",
      }));
      throw error;
    }
  }, [loadMarkersForHex, loadAllMarkers]);

  const deleteMarker = useCallback(async (id: string) => {
    try {
      await dbHelpers.deleteHexMarker(id);

      // Remove from local state
      setState((prev) => ({
        ...prev,
        hexMarkers: prev.hexMarkers.filter((m) => m.id !== id),
        currentHexMarkers: prev.currentHexMarkers.filter((m) => m.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete marker:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to delete marker",
      }));
      throw error;
    }
  }, []);

  const toggleMarkerActive = useCallback(async (id: string, isActive: boolean) => {
    try {
      await dbHelpers.toggleMarkerActive(id, isActive);

      // Update local state
      setState((prev) => ({
        ...prev,
        hexMarkers: prev.hexMarkers.map((m) =>
          m.id === id ? { ...m, is_active: isActive } : m
        ),
        currentHexMarkers: prev.currentHexMarkers.map((m) =>
          m.id === id ? { ...m, is_active: isActive } : m
        ),
      }));
    } catch (error) {
      console.error("Failed to toggle marker active:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to update marker status",
      }));
      throw error;
    }
  }, []);

  const setMarkerFilter = useCallback((filter: Partial<MarkerFilter>) => {
    setState((prev) => ({
      ...prev,
      markerFilter: { ...prev.markerFilter, ...filter },
    }));
  }, []);

  // ===== Map Actions =====

  const setMapLocation = useCallback((sector: string, hex: string) => {
    const paddedHex = padHex(hex);
    setState((prev) => ({
      ...prev,
      mapSector: sector,
      mapHex: paddedHex,
    }));
  }, []);

  // ===== Player Location Actions =====

  const setPlayerLocation = useCallback((sector: string, hex: string) => {
    const paddedHex = padHex(hex);
    setState((prev) => {
      // Get world name from current location if it matches
      const worldName =
        prev.currentLocation?.sector === sector &&
        prev.currentLocation?.hex === paddedHex
          ? prev.currentLocation.worldName
          : prev.selectedWorld?.sector === sector &&
            prev.selectedWorld?.hex === paddedHex
            ? prev.selectedWorld.name
            : undefined;

      return {
        ...prev,
        playerLocation: {
          sector,
          hex: paddedHex,
          worldName,
        },
      };
    });
  }, []);

  // ===== Error Handling =====

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // ===== Context Value =====

  const value: JumpPlannerContextValue = {
    ...state,
    setCurrentLocation,
    setPlayerLocation,
    handleMapClick,
    setJumpRating,
    loadJumpWorlds,
    selectJumpWorld,
    setRouteStart,
    setRouteEnd,
    setRouteOptions,
    setRouteEndFromWorld,
    planRoute,
    loadNote,
    loadAllNotes,
    updateNote,
    saveNote,
    loadAllMarkers,
    loadMarkersForHex,
    saveMarker,
    deleteMarker,
    toggleMarkerActive,
    setMarkerFilter,
    setMapLocation,
    clearError,
  };

  return (
    <JumpPlannerContext.Provider value={value}>
      {children}
    </JumpPlannerContext.Provider>
  );
}
