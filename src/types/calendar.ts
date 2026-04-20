// TypeScript types for Calendar & Time Tracking features

export interface ImperialDate {
  day: number; // 1-365 (366 for leap years)
  year: number;
  formatted: string; // "001-1105"
}

export interface CampaignCalendar {
  id: string;
  player_id: string;
  imperial_date: string;
  day: number;
  year: number;
  is_current_date: boolean;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  player_id: string;

  title: string;
  description?: string;
  event_type: 'reminder' | 'session' | 'payment' | 'arrival' | 'departure';

  imperial_date: string;

  // Recurrence
  is_recurring: boolean;
  recurrence_type?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrence_interval: number;

  // Related entities
  character_ids?: string[];
  vehicle_ids?: string[];
  session_id?: string;

  // Payment automation
  auto_deduct_credits: boolean;
  deduct_amount?: number;

  completed: boolean;

  created_at: string;
  updated_at: string;

  /** Per-crew scoping. NULL/empty = visible to all crews. */
  visible_crew_ids?: string[] | null;
}

export type EventType = 'reminder' | 'session' | 'payment' | 'arrival' | 'departure';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';
