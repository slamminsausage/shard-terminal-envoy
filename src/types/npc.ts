// TypeScript types for NPC Relationship Tracker features

export interface NPC {
  id: string;
  player_id: string;

  // Basic info
  name: string;
  title?: string;
  species?: string;
  gender?: string;
  age?: number;

  // Characteristics (optional)
  characteristics?: any;

  // Career/role
  career?: string;
  rank?: string;
  skills?: any;

  // Appearance
  description?: string;
  portrait_url?: string;

  // Location
  current_location?: string;
  homeworld?: string;

  // Organization
  faction?: string;
  organization?: string;

  // Tags
  tags?: string[];

  notes?: string;
  gm_notes?: string;

  created_at: string;
  updated_at: string;
}

export interface NPCRelationship {
  id: string;
  player_id: string;

  npc_id: string;
  character_id: string;

  // Relationship status
  relationship_type: 'ally' | 'friend' | 'neutral' | 'rival' | 'enemy';
  relationship_level: number; // -10 to +10

  // Notes
  relationship_notes?: string;

  // Tracking
  first_met_date?: string; // imperial date
  first_met_session_id?: string;
  last_interaction_date?: string;
  last_interaction_session_id?: string;

  created_at: string;
  updated_at: string;
}

export interface NPCInteraction {
  id: string;
  player_id: string;

  npc_id: string;
  character_id: string;

  interaction_date: string;
  imperial_date?: string;
  session_id?: string;

  interaction_type: 'meeting' | 'favor' | 'betrayal' | 'trade' | 'combat';
  description: string;

  relationship_change: number; // +/- to relationship level

  created_at: string;
}

export type RelationshipType = 'ally' | 'friend' | 'neutral' | 'rival' | 'enemy';
export type InteractionType = 'meeting' | 'favor' | 'betrayal' | 'trade' | 'combat';
