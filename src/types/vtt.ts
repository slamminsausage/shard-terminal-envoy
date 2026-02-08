// =============================================================================
// VTT (Virtual Tabletop) Type Definitions
// Rift Display integration for Shard Terminal Envoy
// =============================================================================

// --- Geometry Primitives ---

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// --- Layers ---

export const LAYER_MAP = 0;
export const LAYER_TOKEN = 1;
export const LAYER_GM = 2;
export type LayerIndex = typeof LAYER_MAP | typeof LAYER_TOKEN | typeof LAYER_GM;

// --- Tools ---

export type VTTTool =
  | "cursor"
  | "pan"
  | "draw-freehand"
  | "draw-line"
  | "draw-rect"
  | "draw-circle"
  | "draw-text"
  | "fog-circle"
  | "fog-polygon"
  | "fog-rect"
  | "wall"
  | "door"
  | "light"
  | "measure"
  | "note"
  | "aoe-cone"
  | "aoe-circle"
  | "aoe-line";

// --- Drawing Strokes ---

export interface Stroke {
  id: string;
  tool: "freehand" | "line" | "rect" | "circle";
  points: Point[];
  color: string;
  width: number;
  layer: LayerIndex;
  opacity?: number;
}

// --- Text Overlays ---

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily?: string;
  layer: LayerIndex;
}

// --- Notes (GM Pins) ---

export interface MapNote {
  id: string;
  x: number;
  y: number;
  title: string;
  content: string;
  color: string;
  icon?: string;
  visible: boolean;
}

// --- Tokens ---

export interface TokenCondition {
  name: string;
  color: string;
}

export interface Token {
  id: string;
  name: string;
  imageDataUrl: string | null;
  x: number;
  y: number;
  size: number; // grid cells
  layer: LayerIndex;
  rotation: number;
  hp: number;
  maxHp: number;
  conditions: TokenCondition[];
  auraRadius: number;
  auraColor: string;
  showName: boolean;
  showHpBar: boolean;
  locked: boolean;
  visible: boolean; // GM can hide tokens from presenter
}

// --- Fog of War ---

export interface FogState {
  enabled: boolean;
  opacity: number;
  color: string;
  // Canvas data stored as data URL for persistence
  dataUrl: string | null;
}

// --- Walls & Doors (Dynamic Lighting) ---

export interface Wall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: "wall" | "door";
  doorOpen?: boolean;
  color?: string;
}

// --- Light Sources ---

export interface LightSource {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity: number;
  flickering?: boolean;
}

// --- Particle / Weather Effects ---

export type WeatherPreset =
  | "none"
  | "rain"
  | "snow"
  | "dust"
  | "embers"
  | "fog"
  | "ash"
  | "custom";

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface ParticleConfig {
  preset: WeatherPreset;
  count: number;
  speed: number;
  size: number;
  color: string;
  opacity: number;
  wind: number;
  gravity: number;
  enabled: boolean;
}

// --- Grid ---

export interface GridConfig {
  enabled: boolean;
  size: number; // pixels per cell
  color: string;
  opacity: number;
  snap: boolean;
  style: "square" | "hex";
}

// --- Map ---

export interface VTTMap {
  id: string;
  name: string;
  // Image stored as data URL from local file or as objectURL
  imageDataUrl: string | null;
  width: number;
  height: number;
  // Per-map state
  strokes: Stroke[];
  texts: TextOverlay[];
  notes: MapNote[];
  tokens: Token[];
  fog: FogState;
  walls: Wall[];
  lights: LightSource[];
  grid: GridConfig;
  // Viewport state
  scrollX: number;
  scrollY: number;
  zoom: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
}

// --- Audio ---

export interface AmbientTrack {
  id: string;
  name: string;
  /** Data URL or object URL from local file */
  url: string;
  volume: number;
  pan: number;
  loop: boolean;
}

export interface SFXSlot {
  id: number;
  name: string;
  url: string;
  volume: number;
  loop: boolean;
  /** Keyboard shortcut key (e.g. "1"-"9", "a"-"i") */
  hotkey?: string;
}

export interface AudioState {
  masterVolume: number;
  muted: boolean;
  ambientA: AmbientTrack | null;
  ambientB: AmbientTrack | null;
  crossfade: number; // 0 = full A, 1 = full B
  sfxSlots: SFXSlot[];
}

// --- AoE Templates ---

export type AoEShape = "cone" | "circle" | "line";

export interface AoETemplate {
  id: string;
  shape: AoEShape;
  x: number;
  y: number;
  radius: number; // or length for line
  angle?: number; // for cone/line direction
  coneAngle?: number; // spread for cone
  color: string;
  opacity: number;
}

// --- Initiative Tracker ---

export interface InitiativeEntry {
  id: string;
  name: string;
  initiative: number;
  hp: number;
  maxHp: number;
  isNPC: boolean;
  tokenId?: string;
  notes?: string;
}

// --- Clocks ---

export interface Clock {
  id: string;
  name: string;
  segments: number;
  filled: number;
  color: string;
}

// --- Handouts ---

export interface Handout {
  id: string;
  name: string;
  imageDataUrl: string;
  visible: boolean;
}

// --- Measurement ---

export interface Measurement {
  start: Point;
  end: Point;
  distance: number; // in grid units
}

// --- Session Save/Load ---

export interface VTTSession {
  version: number;
  timestamp: number;
  maps: VTTMap[];
  activeMapId: string | null;
  audio: AudioState;
  initiative: InitiativeEntry[];
  clocks: Clock[];
  handouts: Handout[];
  particles: ParticleConfig;
  gridDefaults: GridConfig;
}

// --- Undo/Redo ---

export type VTTActionType =
  | "stroke-add"
  | "stroke-remove"
  | "token-add"
  | "token-remove"
  | "token-move"
  | "token-update"
  | "text-add"
  | "text-remove"
  | "note-add"
  | "note-remove"
  | "wall-add"
  | "wall-remove"
  | "light-add"
  | "light-remove"
  | "fog-update";

export interface VTTHistoryEntry {
  type: VTTActionType;
  mapId: string;
  before: unknown;
  after: unknown;
  timestamp: number;
}

// --- VTT Context State ---

export interface VTTState {
  // Maps
  maps: VTTMap[];
  activeMapId: string | null;

  // Tools
  activeTool: VTTTool;
  activeLayer: LayerIndex;
  drawColor: string;
  drawWidth: number;

  // Audio
  audio: AudioState;

  // Effects
  particles: ParticleConfig;

  // Initiative & Clocks
  initiative: InitiativeEntry[];
  clocks: Clock[];

  // Handouts
  handouts: Handout[];

  // History
  history: VTTHistoryEntry[];
  historyIndex: number;

  // UI State
  showGrid: boolean;
  showTokenNames: boolean;
  showWalls: boolean;
  showLights: boolean;
  showFog: boolean;
  presenterMode: boolean;

  // AoE Templates (active on canvas)
  aoeTemplates: AoETemplate[];

  // Fog brush settings
  fogBrushSize: number;
  fogBrushMode: "reveal" | "conceal";

  // Sidebar
  sidebarPanel: VTTSidebarPanel | null;
}

export type VTTSidebarPanel =
  | "maps"
  | "tokens"
  | "characters"
  | "drawing"
  | "fog"
  | "lighting"
  | "audio"
  | "effects"
  | "scenes"
  | "initiative"
  | "clocks"
  | "handouts"
  | "aoe"
  | "dice"
  | "settings";

// --- Default Factories ---

export function createDefaultGrid(): GridConfig {
  return {
    enabled: true,
    size: 50,
    color: "#00ff00",
    opacity: 0.15,
    snap: true,
    style: "square",
  };
}

export function createDefaultFog(): FogState {
  return {
    enabled: false,
    opacity: 0.85,
    color: "#000000",
    dataUrl: null,
  };
}

export function createDefaultParticles(): ParticleConfig {
  return {
    preset: "none",
    count: 100,
    speed: 1,
    size: 2,
    color: "#ffffff",
    opacity: 0.6,
    wind: 0,
    gravity: 1,
    enabled: false,
  };
}

export function createDefaultAudio(): AudioState {
  return {
    masterVolume: 0.5,
    muted: false,
    ambientA: null,
    ambientB: null,
    crossfade: 0,
    sfxSlots: Array.from({ length: 18 }, (_, i) => ({
      id: i,
      name: "",
      url: "",
      volume: 0.7,
      loop: false,
    })),
  };
}

export function createDefaultMap(name: string = "New Map"): VTTMap {
  return {
    id: crypto.randomUUID(),
    name,
    imageDataUrl: null,
    width: 1920,
    height: 1080,
    strokes: [],
    texts: [],
    notes: [],
    tokens: [],
    fog: createDefaultFog(),
    walls: [],
    lights: [],
    grid: createDefaultGrid(),
    scrollX: 0,
    scrollY: 0,
    zoom: 1,
    rotation: 0,
    flipH: false,
    flipV: false,
  };
}

export function createDefaultVTTState(): VTTState {
  return {
    maps: [],
    activeMapId: null,
    activeTool: "cursor",
    activeLayer: LAYER_TOKEN,
    drawColor: "#00ff00",
    drawWidth: 3,
    audio: createDefaultAudio(),
    particles: createDefaultParticles(),
    initiative: [],
    clocks: [],
    handouts: [],
    history: [],
    historyIndex: -1,
    showGrid: true,
    showTokenNames: true,
    showWalls: false,
    showLights: true,
    showFog: true,
    presenterMode: false,
    aoeTemplates: [],
    fogBrushSize: 40,
    fogBrushMode: "reveal",
    sidebarPanel: "maps",
  };
}
