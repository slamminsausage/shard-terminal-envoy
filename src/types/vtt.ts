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

export interface LayerState {
  visible: boolean;
  locked: boolean;
}

// --- Bounding Box ---

export interface BoundingBox {
  cx: number;
  cy: number;
  width: number;
  height: number;
  rotation: number; // degrees
}

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
  gmOnly?: boolean;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  originX?: number;
  originY?: number;
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
  gmOnly?: boolean;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
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
  rotation?: number;
  scale?: number;
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
  // Movement & positioning
  moveSpeed?: number; // grid cells of normal movement (default 6)
  elevation?: number; // vertical position for 3D combat
  // Token light emission
  lightBrightRadius?: number; // grid units of bright light
  lightDimRadius?: number; // grid units of dim light
  lightColor?: string; // light color (default #ffaa44)
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
  rotation: number;
  phase: number;
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
  isVideo?: boolean;
  width: number;
  height: number;
  // Image transform (independent of canvas size)
  imageScale: number;
  imageOffsetX: number;
  imageOffsetY: number;
  imageNaturalWidth: number;
  imageNaturalHeight: number;
  // Per-map state
  strokes: Stroke[];
  texts: TextOverlay[];
  notes: MapNote[];
  tokens: Token[];
  fog: FogState;
  walls: Wall[];
  lights: LightSource[];
  aoeTemplates: AoETemplate[];
  props: SceneProp[];
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
  /** Data URL, object URL, or path to built-in file (e.g. "/audio/file.mp3") */
  url: string;
  volume: number;
  pan: number;
  loop: boolean;
  /** Whether this is a built-in library track (path-based, not data URL) */
  isLibrary?: boolean;
}

export type AmbientSlot = "A" | "B" | "C" | "D";

export interface SFXSlot {
  id: number;
  name: string;
  url: string;
  volume: number;
  loop: boolean;
  /** Keyboard shortcut key (e.g. "1"-"9") */
  hotkey?: string;
  /** Category for organization */
  category?: string;
  /** Whether this is a built-in library track */
  isLibrary?: boolean;
}

export interface AudioPlaylist {
  id: string;
  name: string;
  /** Which tracks to load into which channels when this playlist is activated */
  channels: {
    A: AmbientTrack | null;
    B: AmbientTrack | null;
    C: AmbientTrack | null;
    D: AmbientTrack | null;
  };
}

/** A user-added track in the sound library */
export interface CustomLibraryTrack {
  id: string;
  name: string;
  /** Supabase Storage URL or path */
  url: string;
  category: "Ambient" | "Music" | "SFX" | "Story";
}

export interface AudioState {
  masterVolume: number;
  muted: boolean;
  ambientA: AmbientTrack | null;
  ambientB: AmbientTrack | null;
  ambientC: AmbientTrack | null;
  ambientD: AmbientTrack | null;
  sfxSlots: SFXSlot[];
  playlists: AudioPlaylist[];
  activePlaylistId: string | null;
  /** User-uploaded tracks added to the sound library */
  customLibraryTracks: CustomLibraryTrack[];
}

// --- Scene Props (placed image assets on the map) ---

export interface SceneProp {
  id: string;
  name: string;
  imageUrl: string;  // Public URL or data URL
  x: number;        // World-space center X
  y: number;        // World-space center Y
  width: number;    // World-space width
  height: number;   // World-space height
  rotation: number; // Degrees
  opacity: number;  // 0–1
  layer: LayerIndex;
  locked: boolean;
  visible: boolean;
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
  combatantId?: string;
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
  | "aoe-add"
  | "aoe-remove"
  | "prop-add"
  | "prop-remove"
  | "prop-update"
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

  // Presenter toggles
  showInitiativeOnPresenter: boolean;
  followActiveTurn: boolean;

  // Selection
  selectedTokenIds: string[];
  selectedStrokeIds: string[];
  selectedTextIds: string[];
  selectedNoteIds: string[];
  selectedAoEIds: string[];
  selectedLightIds: string[];
  selectedPropIds: string[];

  // Pending prop placement (armed for placing on canvas)
  pendingPropImageUrl: string | null;
  pendingPropName: string;

  // Fog brush settings
  fogBrushSize: number;
  fogBrushMode: "reveal" | "conceal";

  // Clipboard
  clipboard: { tokens: Token[]; strokes: Stroke[]; texts: TextOverlay[]; notes: MapNote[] } | null;

  // Layers
  layerStates: Record<number, LayerState>;

  // Sidebar
  sidebarPanel: VTTSidebarPanel | null;
}

// --- Object Grouping ---

export interface ObjectGroup {
  id: string;
  name: string;
  tokenIds: string[];
  strokeIds: string[];
  textIds: string[];
  noteIds: string[];
  locked: boolean;
}

export type VTTSidebarPanel =
  | "maps"
  | "layers"
  | "tokens"
  | "notes"
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
  | "assets"
  | "settings";

// --- Default Factories ---

export function createDefaultGrid(): GridConfig {
  return {
    enabled: true,
    size: 50,
    color: "#3ae2b3",
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
    ambientC: null,
    ambientD: null,
    sfxSlots: Array.from({ length: 18 }, (_, i) => ({
      id: i,
      name: "",
      url: "",
      volume: 0.7,
      loop: false,
    })),
    playlists: [],
    activePlaylistId: null,
    customLibraryTracks: [],
  };
}

export function createDefaultMap(name: string = "New Map"): VTTMap {
  return {
    id: crypto.randomUUID(),
    name,
    imageDataUrl: null,
    width: 1920,
    height: 1080,
    imageScale: 1,
    imageOffsetX: 0,
    imageOffsetY: 0,
    imageNaturalWidth: 0,
    imageNaturalHeight: 0,
    strokes: [],
    texts: [],
    notes: [],
    tokens: [],
    fog: createDefaultFog(),
    walls: [],
    lights: [],
    aoeTemplates: [],
    props: [],
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
    drawColor: "#3ae2b3",
    drawWidth: 3,
    audio: createDefaultAudio(),
    particles: createDefaultParticles(),
    initiative: [],
    clocks: [],
    history: [],
    historyIndex: -1,
    showGrid: true,
    showTokenNames: true,
    showWalls: true,
    showLights: true,
    showFog: true,
    presenterMode: false,
    showInitiativeOnPresenter: false,
    selectedTokenIds: [],
    selectedStrokeIds: [],
    selectedTextIds: [],
    selectedNoteIds: [],
    selectedAoEIds: [],
    selectedLightIds: [],
    selectedPropIds: [],
    pendingPropImageUrl: null,
    pendingPropName: "",
    fogBrushSize: 40,
    fogBrushMode: "reveal",
    layerStates: {
      0: { visible: true, locked: false },
      1: { visible: true, locked: false },
      2: { visible: true, locked: false },
    },
    clipboard: null,
    sidebarPanel: "maps",
  };
}
