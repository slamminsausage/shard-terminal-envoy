// TypeScript types for Session Management features

export interface Session {
  id: string;
  player_id: string;
  session_number: number;
  session_date: string;
  title: string;
  summary?: string;
  status: 'planned' | 'in_progress' | 'completed';

  // Time tracking
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;

  // In-game time
  in_game_date?: string;
  in_game_time_elapsed?: string;

  // Session notes
  notes?: string;
  gm_notes?: string;

  created_at: string;
  updated_at: string;
}

export interface SessionLogEntry {
  id: string;
  session_id: string;
  timestamp: string;
  entry_type: 'note' | 'combat' | 'skill_check' | 'npc_interaction' | 'location_change';
  title?: string;
  content: string;
  created_by: 'gm' | 'player';

  // Linked entities
  character_ids?: string[];
  npc_ids?: string[];
  location?: string;

  created_at: string;
}

export interface SessionReward {
  id: string;
  session_id: string;
  character_id: string;

  // XP and progression
  xp_awarded: number;
  xp_reason?: string;

  // Financial rewards
  credits_awarded: number;

  // Item rewards (references to inventory items)
  item_ids?: string[];

  // Skill improvements
  skill_improvements?: Record<string, number>;

  created_at: string;
}

export type SessionStatus = 'planned' | 'in_progress' | 'completed';
export type LogEntryType = 'note' | 'combat' | 'skill_check' | 'npc_interaction' | 'location_change';
