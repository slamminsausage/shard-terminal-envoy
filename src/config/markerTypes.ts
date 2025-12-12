import { MarkerType, MarkerTypeConfig } from "../types/navigation";

/**
 * Configuration for all marker type presets
 * Defines default icons, colors, and descriptions for each marker type
 */
export const MARKER_TYPE_CONFIGS: Record<MarkerType, MarkerTypeConfig> = {
  CUSTOM_PLANET: {
    type: "CUSTOM_PLANET",
    label: "Custom Planet",
    icon: "🌍",
    defaultColor: "#00ccff",
    description: "Player-created planet or moon",
  },
  RESEARCH_STATION: {
    type: "RESEARCH_STATION",
    label: "Research Station",
    icon: "🔬",
    defaultColor: "#00ffff",
    description: "Scientific research facility",
  },
  PIRATE_SHIP: {
    type: "PIRATE_SHIP",
    label: "Pirate Ship",
    icon: "🏴‍☠️",
    defaultColor: "#ff4455",
    description: "Known pirate vessel or fleet",
  },
  CONVOY: {
    type: "CONVOY",
    label: "Convoy",
    icon: "🚢",
    defaultColor: "#ffaa00",
    description: "Trade convoy or fleet",
  },
  MISSION: {
    type: "MISSION",
    label: "Mission",
    icon: "📋",
    defaultColor: "#ff00ff",
    description: "Active mission location",
  },
  STORY_POINT: {
    type: "STORY_POINT",
    label: "Story Point",
    icon: "📖",
    defaultColor: "#ffff00",
    description: "Main storyline location",
  },
  IMPERIAL_VESSEL: {
    type: "IMPERIAL_VESSEL",
    label: "Imperial Vessel",
    icon: "👑",
    defaultColor: "#ffffff",
    description: "Imperial Navy ship or station",
  },
  TRADE_ROUTE: {
    type: "TRADE_ROUTE",
    label: "Trade Route",
    icon: "💰",
    defaultColor: "#00ff00",
    description: "Established trade route waypoint",
  },
  ANOMALY: {
    type: "ANOMALY",
    label: "Anomaly",
    icon: "❓",
    defaultColor: "#9933ff",
    description: "Unexplained phenomenon",
  },
  WAYPOINT: {
    type: "WAYPOINT",
    label: "Waypoint",
    icon: "📍",
    defaultColor: "#888888",
    description: "Navigation waypoint",
  },
  DANGER_ZONE: {
    type: "DANGER_ZONE",
    label: "Danger Zone",
    icon: "⚠️",
    defaultColor: "#ff6600",
    description: "Hazardous area",
  },
  RESOURCE: {
    type: "RESOURCE",
    label: "Resource",
    icon: "⛏️",
    defaultColor: "#996600",
    description: "Valuable resource location",
  },
  SETTLEMENT: {
    type: "SETTLEMENT",
    label: "Settlement",
    icon: "🏘️",
    defaultColor: "#00aa00",
    description: "Small settlement or outpost",
  },
  RUINS: {
    type: "RUINS",
    label: "Ancient Ruins",
    icon: "🏛️",
    defaultColor: "#666666",
    description: "Archaeological site",
  },
  CUSTOM: {
    type: "CUSTOM",
    label: "Custom",
    icon: "⭐",
    defaultColor: "#00ff00",
    description: "Custom marker type",
  },
};

/**
 * Get sorted array of all marker type configs
 */
export const getAllMarkerTypes = (): MarkerTypeConfig[] => {
  return Object.values(MARKER_TYPE_CONFIGS);
};

/**
 * Get config for specific marker type
 */
export const getMarkerTypeConfig = (type: MarkerType): MarkerTypeConfig => {
  return MARKER_TYPE_CONFIGS[type];
};

/**
 * Common emoji icons available for markers (beyond type defaults)
 * Can be extended with custom SVG icons in the future
 */
export const MARKER_ICONS = [
  // Navigation & Location
  "📍",
  "🗺️",
  "🧭",
  "🎯",

  // Celestial Bodies
  "🌍",
  "🌎",
  "🌏",
  "🪐",
  "🌑",
  "🌕",
  "☄️",
  "⭐",
  "✨",

  // Vessels & Stations
  "🚀",
  "🛸",
  "🚢",
  "⚓",
  "🛰️",

  // Danger & Warning
  "⚠️",
  "☢️",
  "⚡",
  "💥",
  "🔥",
  "☠️",

  // Organizations & Factions
  "🏴‍☠️",
  "👑",
  "⚔️",
  "🛡️",

  // Resources & Trade
  "💰",
  "💎",
  "⛏️",
  "🔧",
  "⚙️",

  // Science & Research
  "🔬",
  "🔭",
  "🧪",
  "📡",

  // Mission & Quest
  "📋",
  "📖",
  "📜",
  "🎲",

  // Structures
  "🏛️",
  "🏘️",
  "🏭",
  "🏗️",

  // Mystery & Unknown
  "❓",
  "❔",
  "🔮",

  // General Markers
  "🔴",
  "🟠",
  "🟡",
  "🟢",
  "🔵",
  "🟣",
  "⚪",
  "⚫",
];
