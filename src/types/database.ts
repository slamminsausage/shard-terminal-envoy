// Database types for the Traveller Terminal system

export interface Player {
  id: string;
  name: string;
  access_code: string;
  created_at: string;
  last_accessed: string;
  is_active: boolean;
}

export interface Character {
  id: string;
  player_id: string;
  name: string;
  
  // Header information
  species: string;
  gender: string;
  age: number;
  career: string;
  rank: string;
  homeworld: string;
  rads?: string;
  species_traits?: string;
  notes?: string;
  
  // Characteristics - matching database schema
  strength: number;
  dexterity: number;
  endurance: number;
  intellect: number;
  education: number;
  social_standing: number;
  psionics?: number;
  initiative?: number;

  // Current characteristics (for tracking damage)
  current_strength?: number;
  current_dexterity?: number;
  current_endurance?: number;
  
  // Derived characteristics
  melee_dmg: number;
  ranged_dmg: number;
  lifeblood: number;
  stamina: number;
  
  // Career details
  terms_served: number;

  // Skills (stored as JSONB)
  skills: Record<string, any>;

  // Study tracking
  study_skill?: string;
  study_weeks?: string;
  study_complete?: string;
  
  // Equipment and finances
  equipment: Record<string, any>;
  credits: number;
  debt: number;
  pension?: number;
  ship_payments?: number;
  living_cost?: number;
  cash_on_hand?: number;
  
  // Personal details
  allies: string;
  contacts: string;
  rivals: string;
  enemies: string;
  
  // Weapons and armor (stored as JSONB)
  weapons: Record<string, any>;
  armor: Record<string, any>;
  
  // Augments (stored as JSONB)
  augments: Record<string, any>;

  // Character portrait
  thumbnail_url?: string;

  // Character classification
  character_type?: 'pc' | 'npc';
  npc_role?: 'crew' | 'enemy' | 'contact' | 'patron';

  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  player_id: string;
  
  // Basic information
  name: string;
  vehicle_type: string;
  class_type: string;
  
  // Technical specifications
  tech_level: number;
  tonnage: number;
  cost: number;
  
  // Hull and structure
  hull: number;
  hull_current?: number;
  structure: number;
  armor: number;
  
  // Core systems
  maneuver_drive: number;
  jump_drive: number;
  power_plant: number;
  
  // Performance
  acceleration: number;
  top_speed: number;
  jump_rating: number;
  
  // Fuel and cargo
  fuel_capacity: number;
  cargo_capacity: number;
  passenger_capacity: number;
  
  // Weapons and defenses (stored as JSONB)
  weapons: Record<string, any>;
  screens: Record<string, any>;
  
  // Systems and equipment
  computer_rating: number;
  sensors: number;
  communications: number;
  
  // Maintenance and operations
  maintenance_cost: number;
  life_support?: number;
  salaries?: number;
  crew_requirements: Record<string, any>;
  
  // Additional specifications (stored as JSONB)
  specifications: Record<string, any>;
  
  created_at: string;
  updated_at: string;
}

export interface AccessCode {
  id: string;
  code: string;
  player_id: string;
  created_by: string;
  expires_at: string | null;
  used_at: string | null;
  is_used: boolean;
  created_at: string;
}

export interface Combatant {
  id: string;
  name: string;
  type: 'character' | 'npc';
  characterId?: string;

  // Initiative
  initiative: number;
  turnOrder: number; // Separate turn order for dynamic reordering

  // Health - flexible system for Traveller
  healthType: 'characteristics' | 'hits';

  // For characters (sophonts) - track STR, DEX, END
  currentStr?: number;
  maxStr?: number;
  currentDex?: number;
  maxDex?: number;
  currentEnd?: number;
  maxEnd?: number;

  // For inanimate objects, robots, animals - track Hits
  hits?: number;
  hitsMax?: number;

  // Combat stats
  armor: number;
  cover: 'none' | 'partial' | 'full';
  range: 'close' | 'short' | 'medium' | 'long' | 'extreme';

  // Action economy
  actionsRemaining: number;
  reactionsRemaining: number;
  hasMovedThisRound: boolean;

  // Status
  isActive: boolean;
  isDowned: boolean;
  notes: string;
}

export interface CombatEncounter {
  id: string;
  player_id: string;
  current_round: number;
  current_turn_index: number;
  combatants: Combatant[];
  created_at: string;
  updated_at: string;
}

// API response types
export interface CodeValidationResponse {
  is_valid: boolean;
  player_id: string | null;
  player_name: string | null;
  error_message: string;
}

export interface CreatePlayerResponse {
  player_id: string;
  access_code: string;
}

// Form data types for character sheet
export interface CharacterFormData {
  // Header
  name: string;
  species: string;
  gender: string;
  age: string;
  career: string;
  rank: string;
  homeworld: string;
  
  // Characteristics
  characteristics: Record<string, { value: string; dm: string }>;
  
  // Skills
  skills: Record<string, any>;
  
  // Equipment
  equipment: Array<{
    item: string;
    location: string;
    kg: string;
    value: string;
  }>;
  
  // Finances
  credits: string;
  debt: string;
  ship_shares: string;
  
  // Combat
  weapons: Array<{
    weapon: string;
    range: string;
    damage: string;
    kg: string;
    cost: string;
    magazine: string;
    traits: string;
  }>;
  
  armor: Array<{
    type: string;
    protection: string;
    kg: string;
    cost: string;
    location: string;
  }>;
  
  augments: Array<{
    augment: string;
    tl: string;
    cost: string;
    notes: string;
  }>;
  
  notes: string;
}

// Form data types for vehicle sheet
export interface VehicleFormData {
  // Basic info
  name: string;
  class_name: string;
  configuration: string;
  tech_level: string;
  
  // Hull and drives
  hull_points: string;
  armor: string;
  jump_drive: string;
  maneuver_drive: string;
  power_plant: string;
  computer: string;
  
  // Systems
  software: Record<string, string>;
  sensors: Record<string, string>;
  power_requirements: Array<{
    system: string;
    power: string;
    active: boolean;
  }>;
  
  // Combat and cargo
  weapons: Array<{
    weapon: string;
    location: string;
    damage: string;
    range: string;
    traits: string;
  }>;
  
  cargo: Array<{
    item: string;
    tons: string;
    value: string;
    location: string;
  }>;
  
  critical_hits: Record<string, boolean>;
  
  // Costs
  cost: string;
  maintenance: string;
  crew: string;
  passengers: string;
  
  vehicle_type: 'ship' | 'ground_vehicle' | 'other';
}