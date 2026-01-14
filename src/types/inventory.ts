// TypeScript types for Inventory Management features

export interface InventoryItem {
  id: string;
  player_id: string;

  // Ownership
  owner_type: 'character' | 'vehicle' | 'storage';
  owner_id: string;

  // Item details
  name: string;
  description?: string;
  item_type?: string;

  // Physical properties
  quantity: number;
  weight_kg: number;
  volume_m3: number;

  // Financial
  value_credits: number;
  purchase_price?: number;

  // Technical
  tech_level?: number;

  // Location tracking
  location?: string; // worn, carried, stowed, cargo_hold
  container_id?: string;

  // Condition
  condition: 'excellent' | 'good' | 'worn' | 'damaged' | 'broken';

  // Metadata
  notes?: string;
  tags?: string[];

  created_at: string;
  updated_at: string;
}

export interface ItemTemplate {
  id: string;
  player_id: string;

  name: string;
  description?: string;
  item_type?: string;
  weight_kg: number;
  volume_m3: number;
  value_credits: number;
  tech_level?: number;

  is_system_template: boolean;

  created_at: string;
}

export interface EncumbranceCalculation {
  total_weight_kg: number;
  weight_limit_kg: number;
  is_encumbered: boolean;
  encumbrance_level: 'none' | 'light' | 'heavy' | 'overloaded';
  penalty: number;
}

export type OwnerType = 'character' | 'vehicle' | 'storage';
export type ItemCondition = 'excellent' | 'good' | 'worn' | 'damaged' | 'broken';
export type EncumbranceLevel = 'none' | 'light' | 'heavy' | 'overloaded';
