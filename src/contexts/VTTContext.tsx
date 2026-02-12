import React, {
  createContext,
  useContext,
  useCallback,
  useReducer,
  useEffect,
  useRef,
} from "react";
import type {
  VTTState,
  VTTMap,
  Token,
  Stroke,
  TextOverlay,
  MapNote,
  Wall,
  LightSource,
  VTTTool,
  LayerIndex,
  VTTSidebarPanel,
  VTTSession,
  VTTHistoryEntry,
  InitiativeEntry,
  Clock,
  Handout,
  ParticleConfig,
  FogState,
  AudioState,
  AmbientTrack,
  SFXSlot,
} from "@/types/vtt";
import {
  createDefaultVTTState,
  createDefaultMap,
} from "@/types/vtt";

// ─── Storage Keys ───────────────────────────────────────────────────────────

const STORAGE_KEY = "vtt_session";
const AUTOSAVE_INTERVAL = 120_000; // 2 minutes

// ─── Actions ────────────────────────────────────────────────────────────────

type VTTAction =
  | { type: "LOAD_SESSION"; payload: VTTState }
  | { type: "SET_TOOL"; payload: VTTTool }
  | { type: "SET_LAYER"; payload: LayerIndex }
  | { type: "SET_DRAW_COLOR"; payload: string }
  | { type: "SET_DRAW_WIDTH"; payload: number }
  | { type: "SET_SIDEBAR"; payload: VTTSidebarPanel | null }
  | { type: "TOGGLE_GRID" }
  | { type: "TOGGLE_TOKEN_NAMES" }
  | { type: "TOGGLE_WALLS" }
  | { type: "TOGGLE_LIGHTS" }
  | { type: "TOGGLE_FOG" }
  | { type: "TOGGLE_PRESENTER" }
  // Map actions
  | { type: "ADD_MAP"; payload: VTTMap }
  | { type: "REMOVE_MAP"; payload: string }
  | { type: "SET_ACTIVE_MAP"; payload: string }
  | { type: "UPDATE_MAP"; payload: { id: string; updates: Partial<VTTMap> } }
  | { type: "SET_MAP_IMAGE"; payload: { mapId: string; dataUrl: string; width: number; height: number } }
  // Token actions
  | { type: "ADD_TOKEN"; payload: { mapId: string; token: Token } }
  | { type: "REMOVE_TOKEN"; payload: { mapId: string; tokenId: string } }
  | { type: "UPDATE_TOKEN"; payload: { mapId: string; tokenId: string; updates: Partial<Token> } }
  // Stroke actions
  | { type: "ADD_STROKE"; payload: { mapId: string; stroke: Stroke } }
  | { type: "REMOVE_STROKE"; payload: { mapId: string; strokeId: string } }
  | { type: "UPDATE_STROKE"; payload: { mapId: string; strokeId: string; updates: Partial<Stroke> } }
  | { type: "CLEAR_STROKES"; payload: { mapId: string; layer: LayerIndex } }
  // Text actions
  | { type: "ADD_TEXT"; payload: { mapId: string; text: TextOverlay } }
  | { type: "REMOVE_TEXT"; payload: { mapId: string; textId: string } }
  | { type: "UPDATE_TEXT"; payload: { mapId: string; textId: string; updates: Partial<TextOverlay> } }
  // Note actions
  | { type: "ADD_NOTE"; payload: { mapId: string; note: MapNote } }
  | { type: "REMOVE_NOTE"; payload: { mapId: string; noteId: string } }
  | { type: "UPDATE_NOTE"; payload: { mapId: string; noteId: string; updates: Partial<MapNote> } }
  // Wall/Door actions
  | { type: "ADD_WALL"; payload: { mapId: string; wall: Wall } }
  | { type: "REMOVE_WALL"; payload: { mapId: string; wallId: string } }
  | { type: "TOGGLE_DOOR"; payload: { mapId: string; wallId: string } }
  // Light actions
  | { type: "ADD_LIGHT"; payload: { mapId: string; light: LightSource } }
  | { type: "REMOVE_LIGHT"; payload: { mapId: string; lightId: string } }
  | { type: "UPDATE_LIGHT"; payload: { mapId: string; lightId: string; updates: Partial<LightSource> } }
  // Fog actions
  | { type: "UPDATE_FOG"; payload: { mapId: string; fog: Partial<FogState> } }
  // Viewport actions
  | { type: "SET_VIEWPORT"; payload: { mapId: string; scrollX: number; scrollY: number; zoom: number } }
  // Particles
  | { type: "SET_PARTICLES"; payload: Partial<ParticleConfig> }
  // Initiative
  | { type: "SET_INITIATIVE"; payload: InitiativeEntry[] }
  | { type: "ADD_INITIATIVE"; payload: InitiativeEntry }
  | { type: "REMOVE_INITIATIVE"; payload: string }
  // Clocks
  | { type: "ADD_CLOCK"; payload: Clock }
  | { type: "REMOVE_CLOCK"; payload: string }
  | { type: "UPDATE_CLOCK"; payload: { id: string; updates: Partial<Clock> } }
  // Handouts
  | { type: "ADD_HANDOUT"; payload: Handout }
  | { type: "REMOVE_HANDOUT"; payload: string }
  | { type: "TOGGLE_HANDOUT_VISIBILITY"; payload: string }
  // Audio
  | { type: "SET_AUDIO"; payload: Partial<AudioState> }
  | { type: "SET_AMBIENT_TRACK"; payload: { slot: "A" | "B"; track: AmbientTrack | null } }
  | { type: "SET_SFX_SLOT"; payload: { index: number; slot: Partial<SFXSlot> } }
  // AoE Templates
  | { type: "ADD_AOE"; payload: import("@/types/vtt").AoETemplate }
  | { type: "REMOVE_AOE"; payload: string }
  | { type: "CLEAR_AOE" }
  // Fog Brush
  | { type: "SET_FOG_BRUSH_SIZE"; payload: number }
  | { type: "SET_FOG_BRUSH_MODE"; payload: "reveal" | "conceal" }
  // Canvas size
  | { type: "SET_CANVAS_SIZE"; payload: { mapId: string; width: number; height: number } }
  // Presenter toggles
  | { type: "TOGGLE_INITIATIVE_PRESENTER" }
  // Selection
  | { type: "SET_SELECTION"; payload: string[] }
  | { type: "SET_STROKE_SELECTION"; payload: string[] }
  | { type: "SET_TEXT_SELECTION"; payload: string[] }
  | { type: "SET_NOTE_SELECTION"; payload: string[] }
  | { type: "SET_FULL_SELECTION"; payload: { tokenIds: string[]; strokeIds: string[]; textIds: string[]; noteIds: string[] } }
  | { type: "CLEAR_SELECTION" }
  // History
  | { type: "PUSH_HISTORY"; payload: VTTHistoryEntry }
  | { type: "UNDO" }
  | { type: "REDO" };

// ─── Helper: update map in state ────────────────────────────────────────────

function updateMapInState(
  state: VTTState,
  mapId: string,
  updater: (map: VTTMap) => VTTMap
): VTTState {
  return {
    ...state,
    maps: state.maps.map((m) => (m.id === mapId ? updater(m) : m)),
  };
}

// ─── Undo/Redo helpers ──────────────────────────────────────────────────────

function applyHistoryReverse(state: VTTState, entry: VTTHistoryEntry): VTTState {
  const { type: actionType, mapId } = entry;
  switch (actionType) {
    case "stroke-add":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        strokes: m.strokes.filter((s) => s.id !== (entry.after as any).id),
      }));
    case "stroke-remove":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        strokes: [...m.strokes, entry.before as Stroke],
      }));
    case "token-move": {
      const before = entry.before as { tokenId: string; x: number; y: number };
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        tokens: m.tokens.map((t) =>
          t.id === before.tokenId ? { ...t, x: before.x, y: before.y } : t
        ),
      }));
    }
    case "token-add":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        tokens: m.tokens.filter((t) => t.id !== (entry.after as any).id),
      }));
    case "token-remove":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        tokens: [...m.tokens, entry.before as Token],
      }));
    case "text-add":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        texts: m.texts.filter((t) => t.id !== (entry.after as any).id),
      }));
    case "text-remove":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        texts: [...m.texts, entry.before as TextOverlay],
      }));
    case "wall-add":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        walls: m.walls.filter((w) => w.id !== (entry.after as any).id),
      }));
    case "wall-remove":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        walls: [...m.walls, entry.before as Wall],
      }));
    case "note-add":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        notes: m.notes.filter((n) => n.id !== (entry.after as any).id),
      }));
    case "note-remove":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        notes: [...m.notes, entry.before as MapNote],
      }));
    case "light-add":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        lights: m.lights.filter((l) => l.id !== (entry.after as any).id),
      }));
    case "light-remove":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        lights: [...m.lights, entry.before as LightSource],
      }));
    case "fog-update":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        fog: { ...m.fog, dataUrl: entry.before as string | null },
      }));
    default:
      return state;
  }
}

function applyHistoryForward(state: VTTState, entry: VTTHistoryEntry): VTTState {
  const { type: actionType, mapId } = entry;
  switch (actionType) {
    case "stroke-add":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        strokes: [...m.strokes, entry.after as Stroke],
      }));
    case "stroke-remove":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        strokes: m.strokes.filter((s) => s.id !== (entry.before as any).id),
      }));
    case "token-move": {
      const after = entry.after as { tokenId: string; x: number; y: number };
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        tokens: m.tokens.map((t) =>
          t.id === after.tokenId ? { ...t, x: after.x, y: after.y } : t
        ),
      }));
    }
    case "token-add":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        tokens: [...m.tokens, entry.after as Token],
      }));
    case "token-remove":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        tokens: m.tokens.filter((t) => t.id !== (entry.before as any).id),
      }));
    case "text-add":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        texts: [...m.texts, entry.after as TextOverlay],
      }));
    case "text-remove":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        texts: m.texts.filter((t) => t.id !== (entry.before as any).id),
      }));
    case "wall-add":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        walls: [...m.walls, entry.after as Wall],
      }));
    case "wall-remove":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        walls: m.walls.filter((w) => w.id !== (entry.before as any).id),
      }));
    case "note-add":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        notes: [...m.notes, entry.after as MapNote],
      }));
    case "note-remove":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        notes: m.notes.filter((n) => n.id !== (entry.before as any).id),
      }));
    case "light-add":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        lights: [...m.lights, entry.after as LightSource],
      }));
    case "light-remove":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        lights: m.lights.filter((l) => l.id !== (entry.before as any).id),
      }));
    case "fog-update":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        fog: { ...m.fog, dataUrl: entry.after as string | null },
      }));
    default:
      return state;
  }
}

// ─── Reducer ────────────────────────────────────────────────────────────────

const MAX_HISTORY = 50;

function vttReducer(state: VTTState, action: VTTAction): VTTState {
  switch (action.type) {
    case "LOAD_SESSION":
      return action.payload;

    // Tool & UI
    case "SET_TOOL":
      return { ...state, activeTool: action.payload };
    case "SET_LAYER":
      return { ...state, activeLayer: action.payload };
    case "SET_DRAW_COLOR":
      return { ...state, drawColor: action.payload };
    case "SET_DRAW_WIDTH":
      return { ...state, drawWidth: action.payload };
    case "SET_SIDEBAR":
      return { ...state, sidebarPanel: action.payload };
    case "TOGGLE_GRID": {
      const newShowGrid = !state.showGrid;
      const gridToggledState = { ...state, showGrid: newShowGrid };
      if (state.activeMapId) {
        return updateMapInState(gridToggledState, state.activeMapId, (m) => ({
          ...m,
          grid: { ...m.grid, enabled: newShowGrid },
        }));
      }
      return gridToggledState;
    }
    case "TOGGLE_TOKEN_NAMES":
      return { ...state, showTokenNames: !state.showTokenNames };
    case "TOGGLE_WALLS":
      return { ...state, showWalls: !state.showWalls };
    case "TOGGLE_LIGHTS":
      return { ...state, showLights: !state.showLights };
    case "TOGGLE_FOG":
      return { ...state, showFog: !state.showFog };
    case "TOGGLE_PRESENTER":
      return { ...state, presenterMode: !state.presenterMode };

    // Maps
    case "ADD_MAP":
      return { ...state, maps: [...state.maps, action.payload] };
    case "REMOVE_MAP":
      return {
        ...state,
        maps: state.maps.filter((m) => m.id !== action.payload),
        activeMapId:
          state.activeMapId === action.payload
            ? state.maps[0]?.id ?? null
            : state.activeMapId,
      };
    case "SET_ACTIVE_MAP":
      return { ...state, activeMapId: action.payload };
    case "UPDATE_MAP":
      return updateMapInState(state, action.payload.id, (m) => ({
        ...m,
        ...action.payload.updates,
      }));
    case "SET_MAP_IMAGE":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        imageDataUrl: action.payload.dataUrl,
        width: action.payload.width,
        height: action.payload.height,
      }));

    // Tokens
    case "ADD_TOKEN":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        tokens: [...m.tokens, action.payload.token],
      }));
    case "REMOVE_TOKEN":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        tokens: m.tokens.filter((t) => t.id !== action.payload.tokenId),
      }));
    case "UPDATE_TOKEN":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        tokens: m.tokens.map((t) =>
          t.id === action.payload.tokenId
            ? { ...t, ...action.payload.updates }
            : t
        ),
      }));

    // Strokes
    case "ADD_STROKE":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        strokes: [...m.strokes, action.payload.stroke],
      }));
    case "REMOVE_STROKE":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        strokes: m.strokes.filter((s) => s.id !== action.payload.strokeId),
      }));
    case "UPDATE_STROKE":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        strokes: m.strokes.map((s) =>
          s.id === action.payload.strokeId
            ? { ...s, ...action.payload.updates }
            : s
        ),
      }));
    case "CLEAR_STROKES":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        strokes: m.strokes.filter((s) => s.layer !== action.payload.layer),
      }));

    // Texts
    case "ADD_TEXT":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        texts: [...m.texts, action.payload.text],
      }));
    case "REMOVE_TEXT":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        texts: m.texts.filter((t) => t.id !== action.payload.textId),
      }));
    case "UPDATE_TEXT":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        texts: m.texts.map((t) =>
          t.id === action.payload.textId
            ? { ...t, ...action.payload.updates }
            : t
        ),
      }));

    // Notes
    case "ADD_NOTE":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        notes: [...m.notes, action.payload.note],
      }));
    case "REMOVE_NOTE":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        notes: m.notes.filter((n) => n.id !== action.payload.noteId),
      }));
    case "UPDATE_NOTE":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        notes: m.notes.map((n) =>
          n.id === action.payload.noteId
            ? { ...n, ...action.payload.updates }
            : n
        ),
      }));

    // Walls / Doors
    case "ADD_WALL":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        walls: [...m.walls, action.payload.wall],
      }));
    case "REMOVE_WALL":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        walls: m.walls.filter((w) => w.id !== action.payload.wallId),
      }));
    case "TOGGLE_DOOR":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        walls: m.walls.map((w) =>
          w.id === action.payload.wallId && w.type === "door"
            ? { ...w, doorOpen: !w.doorOpen }
            : w
        ),
      }));

    // Lights
    case "ADD_LIGHT":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        lights: [...m.lights, action.payload.light],
      }));
    case "REMOVE_LIGHT":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        lights: m.lights.filter((l) => l.id !== action.payload.lightId),
      }));
    case "UPDATE_LIGHT":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        lights: m.lights.map((l) =>
          l.id === action.payload.lightId
            ? { ...l, ...action.payload.updates }
            : l
        ),
      }));

    // Fog
    case "UPDATE_FOG":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        fog: { ...m.fog, ...action.payload.fog },
      }));

    // Viewport
    case "SET_VIEWPORT":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        scrollX: action.payload.scrollX,
        scrollY: action.payload.scrollY,
        zoom: action.payload.zoom,
      }));

    // Particles
    case "SET_PARTICLES":
      return { ...state, particles: { ...state.particles, ...action.payload } };

    // Initiative
    case "SET_INITIATIVE":
      return { ...state, initiative: action.payload };
    case "ADD_INITIATIVE":
      return { ...state, initiative: [...state.initiative, action.payload] };
    case "REMOVE_INITIATIVE":
      return {
        ...state,
        initiative: state.initiative.filter((e) => e.id !== action.payload),
      };

    // Clocks
    case "ADD_CLOCK":
      return { ...state, clocks: [...state.clocks, action.payload] };
    case "REMOVE_CLOCK":
      return {
        ...state,
        clocks: state.clocks.filter((c) => c.id !== action.payload),
      };
    case "UPDATE_CLOCK":
      return {
        ...state,
        clocks: state.clocks.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
        ),
      };

    // Handouts
    case "ADD_HANDOUT":
      return { ...state, handouts: [...state.handouts, action.payload] };
    case "REMOVE_HANDOUT":
      return {
        ...state,
        handouts: state.handouts.filter((h) => h.id !== action.payload),
      };
    case "TOGGLE_HANDOUT_VISIBILITY":
      return {
        ...state,
        handouts: state.handouts.map((h) =>
          h.id === action.payload ? { ...h, visible: !h.visible } : h
        ),
      };

    // Audio
    case "SET_AUDIO":
      return { ...state, audio: { ...state.audio, ...action.payload } };
    case "SET_AMBIENT_TRACK":
      return {
        ...state,
        audio: {
          ...state.audio,
          [action.payload.slot === "A" ? "ambientA" : "ambientB"]:
            action.payload.track,
        },
      };
    case "SET_SFX_SLOT": {
      const slots = [...state.audio.sfxSlots];
      slots[action.payload.index] = {
        ...slots[action.payload.index],
        ...action.payload.slot,
      };
      return { ...state, audio: { ...state.audio, sfxSlots: slots } };
    }

    // AoE Templates (per-map)
    case "ADD_AOE":
      if (!state.activeMapId) return state;
      return updateMapInState(state, state.activeMapId, (m) => ({
        ...m,
        aoeTemplates: [...(m.aoeTemplates || []), action.payload],
      }));
    case "REMOVE_AOE":
      if (!state.activeMapId) return state;
      return updateMapInState(state, state.activeMapId, (m) => ({
        ...m,
        aoeTemplates: (m.aoeTemplates || []).filter((a) => a.id !== action.payload),
      }));
    case "CLEAR_AOE":
      if (!state.activeMapId) return state;
      return updateMapInState(state, state.activeMapId, (m) => ({
        ...m,
        aoeTemplates: [],
      }));

    // Fog Brush
    case "SET_FOG_BRUSH_SIZE":
      return { ...state, fogBrushSize: action.payload };
    case "SET_FOG_BRUSH_MODE":
      return { ...state, fogBrushMode: action.payload };

    // Canvas size
    case "SET_CANVAS_SIZE":
      return updateMapInState(state, action.payload.mapId, (m) => ({
        ...m,
        width: action.payload.width,
        height: action.payload.height,
      }));

    // Presenter toggles
    case "TOGGLE_INITIATIVE_PRESENTER":
      return { ...state, showInitiativeOnPresenter: !(state.showInitiativeOnPresenter ?? false) };

    // Selection
    case "SET_SELECTION":
      return { ...state, selectedTokenIds: action.payload };
    case "SET_STROKE_SELECTION":
      return { ...state, selectedStrokeIds: action.payload };
    case "SET_TEXT_SELECTION":
      return { ...state, selectedTextIds: action.payload };
    case "SET_NOTE_SELECTION":
      return { ...state, selectedNoteIds: action.payload };
    case "SET_FULL_SELECTION":
      return {
        ...state,
        selectedTokenIds: action.payload.tokenIds,
        selectedStrokeIds: action.payload.strokeIds,
        selectedTextIds: action.payload.textIds,
        selectedNoteIds: action.payload.noteIds,
      };
    case "CLEAR_SELECTION":
      return { ...state, selectedTokenIds: [], selectedStrokeIds: [], selectedTextIds: [], selectedNoteIds: [] };

    // History
    case "PUSH_HISTORY": {
      const trimmed = state.history.slice(0, state.historyIndex + 1);
      const next = [...trimmed, action.payload].slice(-MAX_HISTORY);
      return { ...state, history: next, historyIndex: next.length - 1 };
    }
    case "UNDO": {
      if (state.historyIndex < 0) return state;
      const entry = state.history[state.historyIndex];
      const undoneState = applyHistoryReverse(state, entry);
      return { ...undoneState, historyIndex: state.historyIndex - 1 };
    }
    case "REDO": {
      if (state.historyIndex >= state.history.length - 1) return state;
      const nextIndex = state.historyIndex + 1;
      const entry = state.history[nextIndex];
      const redoneState = applyHistoryForward(state, entry);
      return { ...redoneState, historyIndex: nextIndex };
    }

    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

interface VTTContextValue {
  state: VTTState;
  dispatch: React.Dispatch<VTTAction>;
  activeMap: VTTMap | null;

  // Convenience methods
  addMap: (name?: string) => VTTMap;
  loadMapImage: (mapId: string, file: File) => Promise<void>;
  saveSession: () => void;
  loadSession: (json: string) => void;
  exportSession: () => string;
}

const VTTContext = createContext<VTTContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

export function VTTProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(vttReducer, null, () => {
    // Try loading from localStorage on init
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as VTTState & { aoeTemplates?: unknown[] };
        // Migrate: move top-level aoeTemplates to per-map if present (old format)
        if (parsed.aoeTemplates && Array.isArray(parsed.aoeTemplates) && parsed.aoeTemplates.length > 0) {
          const activeMap = parsed.maps.find((m) => m.id === parsed.activeMapId);
          if (activeMap && !activeMap.aoeTemplates) {
            activeMap.aoeTemplates = parsed.aoeTemplates as any;
          }
          delete parsed.aoeTemplates;
        }
        // Ensure all maps have aoeTemplates array and image scaling fields
        for (const m of parsed.maps) {
          if (!m.aoeTemplates) m.aoeTemplates = [];
          if (m.imageScale === undefined) m.imageScale = 1;
          if (m.imageOffsetX === undefined) m.imageOffsetX = 0;
          if (m.imageOffsetY === undefined) m.imageOffsetY = 0;
          if (m.imageNaturalWidth === undefined) m.imageNaturalWidth = 0;
          if (m.imageNaturalHeight === undefined) m.imageNaturalHeight = 0;
        }
        // Ensure new state fields exist
        if (parsed.showInitiativeOnPresenter === undefined) {
          (parsed as any).showInitiativeOnPresenter = false;
        }
        if (!parsed.selectedTokenIds) {
          (parsed as any).selectedTokenIds = [];
        }
        if (!parsed.selectedStrokeIds) {
          (parsed as any).selectedStrokeIds = [];
        }
        if (!parsed.selectedTextIds) {
          (parsed as any).selectedTextIds = [];
        }
        if (!parsed.selectedNoteIds) {
          (parsed as any).selectedNoteIds = [];
        }
        // Clean up stale video blob URLs (objectURLs don't persist across reloads)
        for (const m of parsed.maps) {
          if (m.isVideo && m.imageDataUrl && m.imageDataUrl.startsWith("blob:")) {
            m.imageDataUrl = null;
          }
        }
        return parsed as VTTState;
      }
    } catch (e) {
      console.warn("Failed to load VTT session from localStorage:", e);
    }
    return createDefaultVTTState();
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Autosave every 2 minutes (strip non-persistent data like blob URLs)
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const toSave = JSON.parse(JSON.stringify(stateRef.current)) as VTTState;
        // Strip blob URLs for video maps (they can't persist)
        for (const m of toSave.maps) {
          if (m.isVideo && m.imageDataUrl?.startsWith("blob:")) {
            m.imageDataUrl = null;
          }
        }
        // Don't persist transient selection state
        toSave.selectedTokenIds = [];
        toSave.selectedStrokeIds = [];
        toSave.selectedTextIds = [];
        toSave.selectedNoteIds = [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch (e) {
        console.warn("VTT autosave failed:", e);
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const activeMap =
    state.maps.find((m) => m.id === state.activeMapId) ?? null;

  const addMap = useCallback(
    (name?: string) => {
      const map = createDefaultMap(name);
      dispatch({ type: "ADD_MAP", payload: map });
      dispatch({ type: "SET_ACTIVE_MAP", payload: map.id });
      return map;
    },
    []
  );

  const loadMapImage = useCallback(
    async (mapId: string, file: File) => {
      const isVideo = file.type.startsWith("video/");

      if (isVideo) {
        // Use objectURL for video (dataURL would be too large)
        const url = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.muted = true;
        video.preload = "metadata";

        return new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => {
            const currentMap = stateRef.current.maps.find((m) => m.id === mapId);
            const canvasW = currentMap?.width || 1920;
            const canvasH = currentMap?.height || 1080;
            const scaleX = canvasW / video.videoWidth;
            const scaleY = canvasH / video.videoHeight;
            const fitScale = Math.min(scaleX, scaleY);

            dispatch({
              type: "SET_MAP_IMAGE",
              payload: { mapId, dataUrl: url, width: canvasW, height: canvasH },
            });
            dispatch({
              type: "UPDATE_MAP",
              payload: {
                id: mapId,
                updates: {
                  isVideo: true,
                  imageScale: fitScale,
                  imageOffsetX: 0,
                  imageOffsetY: 0,
                  imageNaturalWidth: video.videoWidth,
                  imageNaturalHeight: video.videoHeight,
                },
              },
            });
            resolve();
          };
          video.onerror = () => reject(new Error("Failed to load video"));
          video.src = url;
        });
      }

      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          const img = new Image();
          img.onload = () => {
            // Find current map to get its canvas dimensions
            const currentMap = stateRef.current.maps.find((m) => m.id === mapId);
            const canvasW = currentMap?.width || 1920;
            const canvasH = currentMap?.height || 1080;

            // Calculate scale to fit image within canvas
            const scaleX = canvasW / img.naturalWidth;
            const scaleY = canvasH / img.naturalHeight;
            const fitScale = Math.min(scaleX, scaleY);

            dispatch({
              type: "SET_MAP_IMAGE",
              payload: {
                mapId,
                dataUrl,
                width: canvasW,
                height: canvasH,
              },
            });
            dispatch({
              type: "UPDATE_MAP",
              payload: {
                id: mapId,
                updates: {
                  isVideo: false,
                  imageScale: fitScale,
                  imageOffsetX: 0,
                  imageOffsetY: 0,
                  imageNaturalWidth: img.naturalWidth,
                  imageNaturalHeight: img.naturalHeight,
                },
              },
            });
            resolve();
          };
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = dataUrl;
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
    },
    []
  );

  const saveSession = useCallback(() => {
    try {
      const toSave = JSON.parse(JSON.stringify(stateRef.current)) as VTTState;
      for (const m of toSave.maps) {
        if (m.isVideo && m.imageDataUrl?.startsWith("blob:")) {
          m.imageDataUrl = null;
        }
      }
      toSave.selectedTokenIds = [];
      toSave.selectedStrokeIds = [];
      toSave.selectedTextIds = [];
      toSave.selectedNoteIds = [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn("VTT save failed:", e);
    }
  }, []);

  const loadSession = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as VTTState;
      dispatch({ type: "LOAD_SESSION", payload: parsed });
    } catch (e) {
      console.warn("Failed to parse VTT session JSON:", e);
    }
  }, []);

  const exportSession = useCallback(() => {
    return JSON.stringify(stateRef.current, null, 2);
  }, []);

  const value: VTTContextValue = {
    state,
    dispatch,
    activeMap,
    addMap,
    loadMapImage,
    saveSession,
    loadSession,
    exportSession,
  };

  return <VTTContext.Provider value={value}>{children}</VTTContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useVTT() {
  const ctx = useContext(VTTContext);
  if (!ctx) {
    throw new Error("useVTT must be used within a VTTProvider");
  }
  return ctx;
}
