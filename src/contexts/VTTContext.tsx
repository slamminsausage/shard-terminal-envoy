import React, {
  createContext,
  useContext,
  useCallback,
  useReducer,
  useEffect,
  useRef,
} from "react";
import { dbHelpers } from "@/lib/supabase";
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
  LayerState,
  VTTSidebarPanel,
  VTTSession,
  VTTHistoryEntry,
  InitiativeEntry,
  Clock,
  ParticleConfig,
  FogState,
  AudioState,
  AmbientTrack,
  AmbientSlot,
  SFXSlot,
  AudioPlaylist,
  CustomLibraryTrack,
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
  // Audio
  | { type: "SET_AUDIO"; payload: Partial<AudioState> }
  | { type: "SET_AMBIENT_TRACK"; payload: { slot: AmbientSlot; track: AmbientTrack | null } }
  | { type: "SET_SFX_SLOT"; payload: { index: number; slot: Partial<SFXSlot> } }
  | { type: "ADD_PLAYLIST"; payload: AudioPlaylist }
  | { type: "REMOVE_PLAYLIST"; payload: string }
  | { type: "ACTIVATE_PLAYLIST"; payload: string }
  | { type: "UPDATE_PLAYLIST"; payload: { id: string; updates: Partial<AudioPlaylist> } }
  | { type: "ADD_CUSTOM_LIBRARY_TRACK"; payload: CustomLibraryTrack }
  | { type: "REMOVE_CUSTOM_LIBRARY_TRACK"; payload: string }
  // AoE Templates
  | { type: "ADD_AOE"; payload: import("@/types/vtt").AoETemplate }
  | { type: "REMOVE_AOE"; payload: string }
  | { type: "CLEAR_AOE" }
  | { type: "UPDATE_AOE"; payload: { aoeId: string; updates: Partial<import("@/types/vtt").AoETemplate> } }
  // Fog Brush
  | { type: "SET_FOG_BRUSH_SIZE"; payload: number }
  | { type: "SET_FOG_BRUSH_MODE"; payload: "reveal" | "conceal" }
  // Canvas size
  | { type: "SET_CANVAS_SIZE"; payload: { mapId: string; width: number; height: number } }
  // Presenter toggles
  | { type: "TOGGLE_INITIATIVE_PRESENTER" }
  | { type: "TOGGLE_FOLLOW_ACTIVE_TURN" }
  // Selection
  | { type: "SET_SELECTION"; payload: string[] }
  | { type: "SET_STROKE_SELECTION"; payload: string[] }
  | { type: "SET_TEXT_SELECTION"; payload: string[] }
  | { type: "SET_NOTE_SELECTION"; payload: string[] }
  | { type: "SET_AOE_SELECTION"; payload: string[] }
  | { type: "SET_LIGHT_SELECTION"; payload: string[] }
  | { type: "SET_FULL_SELECTION"; payload: { tokenIds: string[]; strokeIds: string[]; textIds: string[]; noteIds: string[]; aoeIds?: string[]; lightIds?: string[] } }
  | { type: "CLEAR_SELECTION" }
  // Clipboard
  | { type: "COPY_SELECTION" }
  | { type: "PASTE_CLIPBOARD"; payload: { mapId: string } }
  // Token ordering
  | { type: "REORDER_TOKEN"; payload: { mapId: string; tokenId: string; direction: "front" | "back" } }
  // Layers
  | { type: "TOGGLE_LAYER_VISIBILITY"; payload: LayerIndex }
  | { type: "TOGGLE_LAYER_LOCK"; payload: LayerIndex }
  // Alignment
  | { type: "ALIGN_SELECTION"; payload: { mapId: string; alignment: "left" | "right" | "top" | "bottom" | "center-h" | "center-v" | "distribute-h" | "distribute-v" } }
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
    case "aoe-add":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        aoeTemplates: (m.aoeTemplates || []).filter((a) => a.id !== (entry.after as any).id),
      }));
    case "aoe-remove":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        aoeTemplates: [...(m.aoeTemplates || []), entry.before as any],
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
    case "aoe-add":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        aoeTemplates: [...(m.aoeTemplates || []), entry.after as any],
      }));
    case "aoe-remove":
      return updateMapInState(state, mapId, (m) => ({
        ...m,
        aoeTemplates: (m.aoeTemplates || []).filter((a) => a.id !== (entry.before as any).id),
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

// ─── Alignment helper ────────────────────────────────────────────────────────

type AlignItem = { type: "token" | "stroke" | "text" | "note"; id: string };

function applyAlignDelta(state: VTTState, mapId: string, item: AlignItem, dx: number, dy: number): VTTState {
  if (dx === 0 && dy === 0) return state;
  if (item.type === "token") {
    return updateMapInState(state, mapId, (m) => ({
      ...m,
      tokens: m.tokens.map((t) => t.id === item.id ? { ...t, x: t.x + dx, y: t.y + dy } : t),
    }));
  }
  if (item.type === "stroke") {
    return updateMapInState(state, mapId, (m) => ({
      ...m,
      strokes: m.strokes.map((s) => s.id === item.id ? { ...s, points: s.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) } : s),
    }));
  }
  if (item.type === "text") {
    return updateMapInState(state, mapId, (m) => ({
      ...m,
      texts: m.texts.map((t) => t.id === item.id ? { ...t, x: t.x + dx, y: t.y + dy } : t),
    }));
  }
  if (item.type === "note") {
    return updateMapInState(state, mapId, (m) => ({
      ...m,
      notes: m.notes.map((n) => n.id === item.id ? { ...n, x: n.x + dx, y: n.y + dy } : n),
    }));
  }
  return state;
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

    // Audio
    case "SET_AUDIO":
      return { ...state, audio: { ...state.audio, ...action.payload } };
    case "SET_AMBIENT_TRACK": {
      const slotKey = `ambient${action.payload.slot}` as keyof AudioState;
      return {
        ...state,
        audio: {
          ...state.audio,
          [slotKey]: action.payload.track,
        },
      };
    }
    case "SET_SFX_SLOT": {
      const slots = [...state.audio.sfxSlots];
      slots[action.payload.index] = {
        ...slots[action.payload.index],
        ...action.payload.slot,
      };
      return { ...state, audio: { ...state.audio, sfxSlots: slots } };
    }
    case "ADD_PLAYLIST":
      return {
        ...state,
        audio: {
          ...state.audio,
          playlists: [...(state.audio.playlists || []), action.payload],
        },
      };
    case "REMOVE_PLAYLIST":
      return {
        ...state,
        audio: {
          ...state.audio,
          playlists: (state.audio.playlists || []).filter((p) => p.id !== action.payload),
          activePlaylistId: state.audio.activePlaylistId === action.payload ? null : state.audio.activePlaylistId,
        },
      };
    case "ACTIVATE_PLAYLIST": {
      const playlist = (state.audio.playlists || []).find((p) => p.id === action.payload);
      if (!playlist) return state;
      return {
        ...state,
        audio: {
          ...state.audio,
          activePlaylistId: action.payload,
          ambientA: playlist.channels.A,
          ambientB: playlist.channels.B,
          ambientC: playlist.channels.C,
          ambientD: playlist.channels.D,
        },
      };
    }
    case "UPDATE_PLAYLIST":
      return {
        ...state,
        audio: {
          ...state.audio,
          playlists: (state.audio.playlists || []).map((p) =>
            p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
          ),
        },
      };

    // Custom library tracks
    case "ADD_CUSTOM_LIBRARY_TRACK":
      return {
        ...state,
        audio: {
          ...state.audio,
          customLibraryTracks: [...(state.audio.customLibraryTracks || []), action.payload],
        },
      };
    case "REMOVE_CUSTOM_LIBRARY_TRACK":
      return {
        ...state,
        audio: {
          ...state.audio,
          customLibraryTracks: (state.audio.customLibraryTracks || []).filter(
            (t) => t.id !== action.payload
          ),
        },
      };

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
    case "UPDATE_AOE":
      if (!state.activeMapId) return state;
      return updateMapInState(state, state.activeMapId, (m) => ({
        ...m,
        aoeTemplates: (m.aoeTemplates || []).map((a) =>
          a.id === action.payload.aoeId ? { ...a, ...action.payload.updates } : a
        ),
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
    case "TOGGLE_FOLLOW_ACTIVE_TURN":
      return { ...state, followActiveTurn: !(state.followActiveTurn ?? false) };

    // Selection
    case "SET_SELECTION":
      return { ...state, selectedTokenIds: action.payload };
    case "SET_STROKE_SELECTION":
      return { ...state, selectedStrokeIds: action.payload };
    case "SET_TEXT_SELECTION":
      return { ...state, selectedTextIds: action.payload };
    case "SET_NOTE_SELECTION":
      return { ...state, selectedNoteIds: action.payload };
    case "SET_AOE_SELECTION":
      return { ...state, selectedAoEIds: action.payload };
    case "SET_LIGHT_SELECTION":
      return { ...state, selectedLightIds: action.payload };
    case "SET_FULL_SELECTION":
      return {
        ...state,
        selectedTokenIds: action.payload.tokenIds,
        selectedStrokeIds: action.payload.strokeIds,
        selectedTextIds: action.payload.textIds,
        selectedNoteIds: action.payload.noteIds,
        selectedAoEIds: action.payload.aoeIds || [],
        selectedLightIds: action.payload.lightIds || [],
      };
    case "CLEAR_SELECTION":
      return { ...state, selectedTokenIds: [], selectedStrokeIds: [], selectedTextIds: [], selectedNoteIds: [], selectedAoEIds: [], selectedLightIds: [] };

    // Clipboard
    case "COPY_SELECTION": {
      const activeMap = state.maps.find((m) => m.id === state.activeMapId);
      if (!activeMap) return state;
      return {
        ...state,
        clipboard: {
          tokens: (state.selectedTokenIds || []).map((id) => activeMap.tokens.find((t) => t.id === id)).filter(Boolean) as Token[],
          strokes: (state.selectedStrokeIds || []).map((id) => activeMap.strokes.find((s) => s.id === id)).filter(Boolean) as Stroke[],
          texts: (state.selectedTextIds || []).map((id) => activeMap.texts.find((t) => t.id === id)).filter(Boolean) as TextOverlay[],
          notes: (state.selectedNoteIds || []).map((id) => activeMap.notes.find((n) => n.id === id)).filter(Boolean) as MapNote[],
        },
      };
    }
    case "PASTE_CLIPBOARD": {
      const clip = state.clipboard;
      if (!clip) return state;
      const mapId = action.payload.mapId;
      const offset = 30;
      const newTokenIds: string[] = [];
      const newStrokeIds: string[] = [];
      const newTextIds: string[] = [];
      const newNoteIds: string[] = [];
      let result = state;
      for (const t of clip.tokens) {
        const newId = crypto.randomUUID();
        newTokenIds.push(newId);
        result = updateMapInState(result, mapId, (m) => ({
          ...m,
          tokens: [...m.tokens, { ...t, id: newId, x: t.x + offset, y: t.y + offset, name: `${t.name}` }],
        }));
      }
      for (const s of clip.strokes) {
        const newId = crypto.randomUUID();
        newStrokeIds.push(newId);
        result = updateMapInState(result, mapId, (m) => ({
          ...m,
          strokes: [...m.strokes, { ...s, id: newId, points: s.points.map((p) => ({ x: p.x + offset, y: p.y + offset })) }],
        }));
      }
      for (const t of clip.texts) {
        const newId = crypto.randomUUID();
        newTextIds.push(newId);
        result = updateMapInState(result, mapId, (m) => ({
          ...m,
          texts: [...m.texts, { ...t, id: newId, x: t.x + offset, y: t.y + offset }],
        }));
      }
      for (const n of clip.notes) {
        const newId = crypto.randomUUID();
        newNoteIds.push(newId);
        result = updateMapInState(result, mapId, (m) => ({
          ...m,
          notes: [...m.notes, { ...n, id: newId, x: n.x + offset, y: n.y + offset }],
        }));
      }
      return {
        ...result,
        selectedTokenIds: newTokenIds,
        selectedStrokeIds: newStrokeIds,
        selectedTextIds: newTextIds,
        selectedNoteIds: newNoteIds,
      };
    }

    // Token ordering
    case "REORDER_TOKEN": {
      const { mapId, tokenId, direction } = action.payload;
      return updateMapInState(state, mapId, (m) => {
        const idx = m.tokens.findIndex((t) => t.id === tokenId);
        if (idx < 0) return m;
        const tokens = [...m.tokens];
        const [token] = tokens.splice(idx, 1);
        if (direction === "front") tokens.push(token);
        else tokens.unshift(token);
        return { ...m, tokens };
      });
    }

    // Layers
    case "TOGGLE_LAYER_VISIBILITY": {
      const layer = action.payload;
      const current = state.layerStates?.[layer] ?? { visible: true, locked: false };
      return {
        ...state,
        layerStates: {
          ...state.layerStates,
          [layer]: { ...current, visible: !current.visible },
        },
      };
    }
    case "TOGGLE_LAYER_LOCK": {
      const layer = action.payload;
      const current = state.layerStates?.[layer] ?? { visible: true, locked: false };
      return {
        ...state,
        layerStates: {
          ...state.layerStates,
          [layer]: { ...current, locked: !current.locked },
        },
      };
    }

    // Alignment
    case "ALIGN_SELECTION": {
      const { mapId, alignment } = action.payload;
      const map = state.maps.find((m) => m.id === mapId);
      if (!map) return state;

      const gridSize = map.grid.size || 50;
      type ItemBox = { type: "token" | "stroke" | "text" | "note"; id: string; left: number; right: number; top: number; bottom: number; cx: number; cy: number };
      const items: ItemBox[] = [];

      for (const id of (state.selectedTokenIds || [])) {
        const t = map.tokens.find((tk) => tk.id === id);
        if (!t) continue;
        const hs = (t.size * gridSize) / 2;
        items.push({ type: "token", id, left: t.x - hs, right: t.x + hs, top: t.y - hs, bottom: t.y + hs, cx: t.x, cy: t.y });
      }
      for (const id of (state.selectedStrokeIds || [])) {
        const s = map.strokes.find((sk) => sk.id === id);
        if (!s || s.points.length === 0) continue;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const p of s.points) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }
        items.push({ type: "stroke", id, left: minX, right: maxX, top: minY, bottom: maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 });
      }
      for (const id of (state.selectedTextIds || [])) {
        const t = map.texts.find((tx) => tx.id === id);
        if (!t) continue;
        const w = t.text.length * t.fontSize * 0.6;
        items.push({ type: "text", id, left: t.x, right: t.x + w, top: t.y, bottom: t.y + t.fontSize, cx: t.x + w / 2, cy: t.y + t.fontSize / 2 });
      }
      for (const id of (state.selectedNoteIds || [])) {
        const n = map.notes.find((nt) => nt.id === id);
        if (!n) continue;
        items.push({ type: "note", id, left: n.x - 8, right: n.x + 8, top: n.y - 8, bottom: n.y + 8, cx: n.x, cy: n.y });
      }

      if (items.length < 2) return state;

      let result = state;
      const allLeft = Math.min(...items.map((i) => i.left));
      const allRight = Math.max(...items.map((i) => i.right));
      const allTop = Math.min(...items.map((i) => i.top));
      const allBottom = Math.max(...items.map((i) => i.bottom));
      const allCenterH = (allLeft + allRight) / 2;
      const allCenterV = (allTop + allBottom) / 2;

      for (const item of items) {
        let dx = 0, dy = 0;
        switch (alignment) {
          case "left": dx = allLeft - item.left; break;
          case "right": dx = allRight - item.right; break;
          case "top": dy = allTop - item.top; break;
          case "bottom": dy = allBottom - item.bottom; break;
          case "center-h": dx = allCenterH - item.cx; break;
          case "center-v": dy = allCenterV - item.cy; break;
          case "distribute-h":
          case "distribute-v":
            continue; // handled below
        }
        if (dx === 0 && dy === 0) continue;
        result = applyAlignDelta(result, mapId, item, dx, dy);
      }

      if (alignment === "distribute-h" && items.length >= 3) {
        const sorted = [...items].sort((a, b) => a.cx - b.cx);
        const totalSpan = sorted[sorted.length - 1].cx - sorted[0].cx;
        const spacing = totalSpan / (sorted.length - 1);
        for (let i = 1; i < sorted.length - 1; i++) {
          const targetCx = sorted[0].cx + spacing * i;
          const dx = targetCx - sorted[i].cx;
          result = applyAlignDelta(result, mapId, sorted[i], dx, 0);
        }
      }
      if (alignment === "distribute-v" && items.length >= 3) {
        const sorted = [...items].sort((a, b) => a.cy - b.cy);
        const totalSpan = sorted[sorted.length - 1].cy - sorted[0].cy;
        const spacing = totalSpan / (sorted.length - 1);
        for (let i = 1; i < sorted.length - 1; i++) {
          const targetCy = sorted[0].cy + spacing * i;
          const dy = targetCy - sorted[i].cy;
          result = applyAlignDelta(result, mapId, sorted[i], 0, dy);
        }
      }

      return result;
    }

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

/** Prepare a VTT state snapshot for persistence (strip ephemeral data) */
function prepareForSave(state: VTTState): VTTState {
  const toSave = JSON.parse(JSON.stringify(state)) as VTTState;
  // Strip blob URLs for video maps (they can't persist across reloads)
  for (const m of toSave.maps) {
    if (m.isVideo && m.imageDataUrl?.startsWith("blob:")) {
      m.imageDataUrl = null;
    }
  }
  // Strip blob URLs from custom audio tracks (they can't persist)
  if (toSave.audio?.customLibraryTracks) {
    toSave.audio.customLibraryTracks = toSave.audio.customLibraryTracks.filter(
      t => t.url && !t.url.startsWith('blob:')
    );
  }
  // Don't persist transient selection state
  toSave.selectedTokenIds = [];
  toSave.selectedStrokeIds = [];
  toSave.selectedTextIds = [];
  toSave.selectedNoteIds = [];
  return toSave;
}

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
        if (parsed.followActiveTurn === undefined) {
          (parsed as any).followActiveTurn = false;
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
        // Migrate audio state: add channels C/D, playlists, remove crossfade
        const audio = parsed.audio as any;
        if (audio.ambientC === undefined) audio.ambientC = null;
        if (audio.ambientD === undefined) audio.ambientD = null;
        if (!audio.playlists) audio.playlists = [];
        if (audio.activePlaylistId === undefined) audio.activePlaylistId = null;
        if (!audio.customLibraryTracks) audio.customLibraryTracks = [];
        // Remove custom tracks with stale blob URLs (they can't survive a reload)
        audio.customLibraryTracks = audio.customLibraryTracks.filter(
          (t: any) => t.url && !t.url.startsWith('blob:')
        );
        delete audio.crossfade;
        // Remove legacy VTT handouts from state (now in NotesContext)
        delete (parsed as any).handouts;
        // Migrate: ensure layerStates exist
        if (!(parsed as any).layerStates) {
          (parsed as any).layerStates = {
            0: { visible: true, locked: false },
            1: { visible: true, locked: false },
            2: { visible: true, locked: false },
          };
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

  // On mount: load from Supabase (overrides localStorage-based initial state),
  // and migrate any existing base64 map images to Supabase Storage
  useEffect(() => {
    const loadAndMigrate = async () => {
      try {
        const dbState = await dbHelpers.loadVTTSession();
        if (dbState) {
          // Apply same migrations as the lazy initializer
          if (!dbState.selectedTokenIds) dbState.selectedTokenIds = [];
          if (!dbState.selectedStrokeIds) dbState.selectedStrokeIds = [];
          if (!dbState.selectedTextIds) dbState.selectedTextIds = [];
          if (!dbState.selectedNoteIds) dbState.selectedNoteIds = [];
          if (!dbState.layerStates) {
            dbState.layerStates = {
              0: { visible: true, locked: false },
              1: { visible: true, locked: false },
              2: { visible: true, locked: false },
            };
          }
          for (const m of dbState.maps || []) {
            if (!m.aoeTemplates) m.aoeTemplates = [];
            if (m.imageScale === undefined) m.imageScale = 1;
            if (m.imageOffsetX === undefined) m.imageOffsetX = 0;
            if (m.imageOffsetY === undefined) m.imageOffsetY = 0;
            if (m.imageNaturalWidth === undefined) m.imageNaturalWidth = 0;
            if (m.imageNaturalHeight === undefined) m.imageNaturalHeight = 0;
            // Clear stale blob URLs
            if (m.isVideo && m.imageDataUrl?.startsWith("blob:")) {
              m.imageDataUrl = null;
            }
          }
          // Strip stale blob URLs from custom audio tracks
          if (dbState.audio?.customLibraryTracks) {
            dbState.audio.customLibraryTracks = dbState.audio.customLibraryTracks.filter(
              (t: any) => t.url && !t.url.startsWith('blob:')
            );
          }
          dispatch({ type: "LOAD_SESSION", payload: dbState });

          // Migrate any remaining base64 map images to Supabase Storage
          for (const m of dbState.maps || []) {
            if (m.imageDataUrl && m.imageDataUrl.startsWith("data:image/")) {
              const mimeType = m.imageDataUrl.split(";")[0].split(":")[1];
              const url = await dbHelpers.uploadVTTMapImageFromDataURL(m.imageDataUrl, m.id, mimeType);
              if (url) {
                dispatch({ type: "SET_MAP_IMAGE", payload: { mapId: m.id, dataUrl: url, width: m.imageNaturalWidth || m.width, height: m.imageNaturalHeight || m.height } });
              }
            }
          }
        } else {
          // No Supabase state yet — migrate any base64 images from the localStorage state
          const current = stateRef.current;
          for (const m of current.maps) {
            if (m.imageDataUrl && m.imageDataUrl.startsWith("data:image/")) {
              const mimeType = m.imageDataUrl.split(";")[0].split(":")[1];
              const url = await dbHelpers.uploadVTTMapImageFromDataURL(m.imageDataUrl, m.id, mimeType);
              if (url) {
                dispatch({ type: "SET_MAP_IMAGE", payload: { mapId: m.id, dataUrl: url, width: m.width, height: m.height } });
              }
            }
          }
        }
      } catch (e) {
        console.warn("Failed to load VTT session from Supabase:", e);
      }
    };
    loadAndMigrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave every 2 minutes — write to Supabase + keep localStorage as fallback
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const toSave = prepareForSave(stateRef.current);
        dbHelpers.saveVTTSession(toSave).catch(e => console.warn("VTT Supabase autosave failed:", e));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch (e) {
        console.warn("VTT autosave failed:", e);
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Save on page unload to prevent data loss
  useEffect(() => {
    const handleUnload = () => {
      try {
        const toSave = prepareForSave(stateRef.current);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        // Note: Supabase async save may not complete during unload,
        // but localStorage save is synchronous and will persist
      } catch {
        // Best-effort during unload
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  const activeMap =
    state.maps.find((m) => m.id === state.activeMapId) ?? null;

  const addMap = useCallback(
    (name?: string) => {
      const map = createDefaultMap(name);
      dispatch({ type: "ADD_MAP", payload: map });
      dispatch({ type: "SET_ACTIVE_MAP", payload: map.id });
      // Save immediately so new maps persist without waiting for autosave
      setTimeout(() => {
        try {
          const toSave = prepareForSave(stateRef.current);
          dbHelpers.saveVTTSession(toSave).catch(e => console.warn("VTT save failed:", e));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        } catch (e) {
          console.warn("VTT immediate save after addMap failed:", e);
        }
      }, 100); // Small delay to let state update propagate
      return map;
    },
    []
  );

  const loadMapImage = useCallback(
    async (mapId: string, file: File) => {
      const isVideo = file.type.startsWith("video/");

      if (isVideo) {
        // Revoke old objectURL if replacing a video map
        const oldMap = stateRef.current.maps.find((m) => m.id === mapId);
        if (oldMap?.isVideo && oldMap.imageDataUrl) {
          URL.revokeObjectURL(oldMap.imageDataUrl);
        }
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

      // Upload to Supabase Storage, fall back to data URL if upload fails
      let imageUrl: string | null = null;
      try {
        imageUrl = await dbHelpers.uploadVTTMapImage(file, mapId);
      } catch (e) {
        console.warn("Failed to upload map image to Supabase, falling back to data URL:", e);
      }

      if (imageUrl) {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const currentMap = stateRef.current.maps.find((m) => m.id === mapId);
            const canvasW = currentMap?.width || 1920;
            const canvasH = currentMap?.height || 1080;
            const fitScale = Math.min(canvasW / img.naturalWidth, canvasH / img.naturalHeight);
            dispatch({ type: "SET_MAP_IMAGE", payload: { mapId, dataUrl: imageUrl!, width: canvasW, height: canvasH } });
            dispatch({
              type: "UPDATE_MAP",
              payload: {
                id: mapId,
                updates: { isVideo: false, imageScale: fitScale, imageOffsetX: 0, imageOffsetY: 0, imageNaturalWidth: img.naturalWidth, imageNaturalHeight: img.naturalHeight },
              },
            });
            resolve();
          };
          img.onerror = () => reject(new Error("Failed to load image from URL"));
          img.src = imageUrl!;
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
      const toSave = prepareForSave(stateRef.current);
      dbHelpers.saveVTTSession(toSave).catch(e => console.warn("VTT Supabase save failed:", e));
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
