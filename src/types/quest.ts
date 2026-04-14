// TypeScript types for Quest/Mission Tracker features

export interface Quest {
  id: string;
  player_id: string;

  title: string;
  description?: string;
  quest_giver?: string;
  location?: string;

  // Status
  status: 'active' | 'completed' | 'failed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // Visibility — when true, the quest is hidden from non-GM players.
  // GMs use this to draft quests ahead of time and reveal them when the
  // players actually encounter them in-game.
  is_hidden?: boolean;

  // Organization
  category: 'main' | 'side' | 'personal' | 'faction';
  parent_quest_id?: string;

  // Rewards
  reward_credits: number;
  reward_xp: number;
  reward_items?: string;
  reward_other?: string;

  // Tracking
  date_accepted: string;
  date_completed?: string;
  date_failed?: string;

  // Sessions
  started_session_id?: string;
  completed_session_id?: string;

  // Notes
  notes?: string;
  gm_notes?: string;

  created_at: string;
  updated_at: string;
}

export interface QuestObjective {
  id: string;
  quest_id: string;

  title: string;
  description?: string;
  order_index: number;

  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  is_optional: boolean;

  // Progress tracking
  progress_current: number;
  progress_required: number;

  completed_at?: string;

  created_at: string;
  updated_at: string;
}

export type QuestStatus = 'active' | 'completed' | 'failed' | 'on_hold';
export type QuestPriority = 'low' | 'medium' | 'high' | 'urgent';
export type QuestCategory = 'main' | 'side' | 'personal' | 'faction';
export type ObjectiveStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
