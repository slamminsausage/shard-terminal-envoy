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
  age: string;
  career: string;
  rank: string;
  homeworld: string;
  
  // Characteristics
  characteristics: Record<string, any>;
  
  // Skills
  skills: Record<string, any>;
  
  // Equipment and finances
  equipment: any[];
  credits: string;
  debt: string;
  ship_shares: string;
  
  // Weapons and armor
  weapons: any[];
  armor: any[];
  
  // Augments
  augments: any[];
  
  // Additional notes
  notes: string;
  
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  player_id: string;
  
  // Basic information
  name: string;
  class_name: string;
  configuration: string;
  tech_level: string;
  
  // Technical specifications
  hull_points: string;
  armor: string;
  jump_drive: string;
  maneuver_drive: string;
  power_plant: string;
  computer: string;
  
  // Systems and equipment
  software: Record<string, any>;
  sensors: Record<string, any>;
  power_requirements: any[];
  weapons: any[];
  cargo: any[];
  critical_hits: Record<string, any>;
  
  // Costs and crew
  cost: string;
  maintenance: string;
  crew: string;
  passengers: string;
  
  // Vehicle type
  vehicle_type: 'ship' | 'ground_vehicle' | 'other';
  
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