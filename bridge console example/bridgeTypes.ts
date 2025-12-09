// src/lib/bridge/bridgeTypes.ts
// TypeScript interfaces for Bridge Console

export interface BridgeState {
  id: string;
  created_at: string;
  updated_at: string;
  mode: 'tactical' | 'navigation';
  current_system: string;
  destination: string | null;
  eta: string | null;
  alert_level: 'normal' | 'elevated' | 'combat' | 'emergency';
  player_ship_id: string | null;
}

export interface Contact {
  id: string;
  bridge_state_id: string;
  name: string;
  ship_class: string | null;
  tonnage: number | null;
  status: 'friendly' | 'unknown' | 'enemy';
  hex_q: number;
  hex_r: number;
  facing: number; // 0-5 for hex directions
  hull_current: number | null;
  hull_max: number | null;
  is_player_ship: boolean;
  vehicle_id: string | null; // Link to vehicles table
  created_at: string;
}

export interface BridgeMessage {
  id: string;
  bridge_state_id: string;
  sender: string;
  content: string;
  priority: 'normal' | 'priority' | 'emergency';
  encrypted: boolean;
  encryption_difficulty: number | null;
  is_read: boolean;
  sent_at: string;
}

export interface SectorAnnotation {
  id: string;
  sector_name: string;
  hex: string;
  world_name: string | null;
  visited: boolean;
  safe_haven: boolean;
  hostile: boolean;
  network_present: boolean;
  hideout: boolean;
  patron: boolean;
  active_mission: boolean;
  treasure: boolean;
  custom_flags: string[];
  gm_notes: string | null;
  player_notes: string | null;
  created_at: string;
  updated_at: string;
}

// For creating new contacts
export interface NewContact {
  name: string;
  ship_class?: string;
  tonnage?: number;
  status: 'friendly' | 'unknown' | 'enemy';
  hex_q?: number;
  hex_r?: number;
  facing?: number;
  hull_current?: number;
  hull_max?: number;
  is_player_ship?: boolean;
  vehicle_id?: string;
}

// For creating new messages
export interface NewMessage {
  sender: string;
  content: string;
  priority?: 'normal' | 'priority' | 'emergency';
  encrypted?: boolean;
  encryption_difficulty?: number;
}

// Hex coordinate utilities
export interface HexCoord {
  q: number;
  r: number;
}

// For the ship selector dropdown (links to your vehicles table)
export interface VehicleOption {
  id: string;
  name: string;
  ship_class: string;
  tonnage: number;
  hull: number;
}
