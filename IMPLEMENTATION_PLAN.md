# Traveller Terminal Envoy - Feature Implementation Plan

## Overview
This document outlines the implementation plan for 13 major feature enhancements to the Traveller Terminal Envoy application. All features will integrate with the existing Supabase backend and React frontend architecture.

## Tech Stack Analysis
- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui, Radix UI, Tailwind CSS
- **Backend**: Supabase (PostgreSQL), Supabase Storage
- **State Management**: React Context API
- **Charts**: Recharts (already installed)
- **Date Handling**: date-fns (already installed)
- **Forms**: react-hook-form + zod

## Current Database Schema
- `characters` - Character sheets with stats, skills, equipment
- `vehicles` - Ships and vehicles with specs
- `player_notes` - Campaign notes
- `combat_encounters` - Combat tracker state
- `world_notes` - Star map world notes
- `hex_markers` - Custom star map markers
- Storage buckets: `handouts`, `character-thumbnails`, `player-note-thumbnails`

---

## Feature 6: Session Management

### Priority: HIGH
**Impact**: Core campaign organization

### Database Schema
```sql
-- Create sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL DEFAULT 'campaign',
  session_number INTEGER NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  status TEXT DEFAULT 'planned', -- planned, in_progress, completed

  -- Time tracking
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,

  -- In-game time
  in_game_date TEXT,
  in_game_time_elapsed TEXT,

  -- Session notes
  notes TEXT,
  gm_notes TEXT, -- visible only to GM

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create session_log_entries table (detailed timestamped log)
CREATE TABLE public.session_log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  entry_type TEXT DEFAULT 'note', -- note, combat, skill_check, npc_interaction, location_change
  title TEXT,
  content TEXT NOT NULL,
  created_by TEXT DEFAULT 'gm', -- gm, player

  -- Linked entities
  character_ids UUID[],
  npc_ids UUID[],
  location TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create session_rewards table
CREATE TABLE public.session_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE,

  -- XP and progression
  xp_awarded INTEGER DEFAULT 0,
  xp_reason TEXT,

  -- Financial rewards
  credits_awarded BIGINT DEFAULT 0,

  -- Item rewards (references to inventory items)
  item_ids UUID[],

  -- Skill improvements
  skill_improvements JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_sessions_player_id ON public.sessions(player_id);
CREATE INDEX idx_sessions_date ON public.sessions(session_date DESC);
CREATE INDEX idx_session_log_session_id ON public.session_log_entries(session_id);
CREATE INDEX idx_session_rewards_session_id ON public.session_rewards(session_id);
```

### TypeScript Types
```typescript
// src/types/session.ts
export interface Session {
  id: string;
  player_id: string;
  session_number: number;
  session_date: string;
  title: string;
  summary?: string;
  status: 'planned' | 'in_progress' | 'completed';

  start_time?: string;
  end_time?: string;
  duration_minutes?: number;

  in_game_date?: string;
  in_game_time_elapsed?: string;

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

  character_ids?: string[];
  npc_ids?: string[];
  location?: string;

  created_at: string;
}

export interface SessionReward {
  id: string;
  session_id: string;
  character_id: string;

  xp_awarded: number;
  xp_reason?: string;

  credits_awarded: number;

  item_ids?: string[];
  skill_improvements?: Record<string, number>;

  created_at: string;
}
```

### Components to Create
1. `src/contexts/SessionContext.tsx` - Session state management
2. `src/components/sessions/SessionList.tsx` - List of all sessions
3. `src/components/sessions/SessionCard.tsx` - Individual session card
4. `src/components/sessions/SessionDetail.tsx` - Full session view
5. `src/components/sessions/SessionLog.tsx` - Timestamped log entries
6. `src/components/sessions/SessionRewards.tsx` - XP/rewards tracking
7. `src/components/sessions/SessionCreator.tsx` - Create new session
8. `src/components/sessions/LastSessionSummary.tsx` - "What happened last time"

### Integration Points
- Add "Sessions" tab to main navigation
- Link sessions to combat encounters
- Auto-log major events (combat start/end, NPCs met)
- Generate "Last Session" summary for GMs

---

## Feature 7: Quest/Mission Tracker

### Priority: HIGH
**Impact**: Campaign narrative organization

### Database Schema
```sql
-- Create quests table
CREATE TABLE public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL DEFAULT 'campaign',

  title TEXT NOT NULL,
  description TEXT,
  quest_giver TEXT,
  location TEXT,

  -- Status
  status TEXT DEFAULT 'active', -- active, completed, failed, on_hold
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent

  -- Organization
  category TEXT DEFAULT 'main', -- main, side, personal, faction
  parent_quest_id UUID REFERENCES public.quests(id),

  -- Rewards
  reward_credits BIGINT DEFAULT 0,
  reward_xp INTEGER DEFAULT 0,
  reward_items TEXT,
  reward_other TEXT,

  -- Tracking
  date_accepted TIMESTAMP WITH TIME ZONE DEFAULT now(),
  date_completed TIMESTAMP WITH TIME ZONE,
  date_failed TIMESTAMP WITH TIME ZONE,

  -- Sessions
  started_session_id UUID,
  completed_session_id UUID,

  -- Notes
  notes TEXT,
  gm_notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quest_objectives table
CREATE TABLE public.quest_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, failed
  is_optional BOOLEAN DEFAULT false,

  -- Progress tracking
  progress_current INTEGER DEFAULT 0,
  progress_required INTEGER DEFAULT 1,

  completed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_quests_player_id ON public.quests(player_id);
CREATE INDEX idx_quests_status ON public.quests(status);
CREATE INDEX idx_quest_objectives_quest_id ON public.quest_objectives(quest_id);
```

### TypeScript Types
```typescript
// src/types/quest.ts
export interface Quest {
  id: string;
  player_id: string;

  title: string;
  description?: string;
  quest_giver?: string;
  location?: string;

  status: 'active' | 'completed' | 'failed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';

  category: 'main' | 'side' | 'personal' | 'faction';
  parent_quest_id?: string;

  reward_credits: number;
  reward_xp: number;
  reward_items?: string;
  reward_other?: string;

  date_accepted: string;
  date_completed?: string;
  date_failed?: string;

  started_session_id?: string;
  completed_session_id?: string;

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

  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  is_optional: boolean;

  progress_current: number;
  progress_required: number;

  completed_at?: string;

  created_at: string;
  updated_at: string;
}
```

### Components to Create
1. `src/contexts/QuestContext.tsx` - Quest state management
2. `src/components/quests/QuestBoard.tsx` - Main quest overview
3. `src/components/quests/QuestCard.tsx` - Individual quest card
4. `src/components/quests/QuestDetail.tsx` - Full quest view with objectives
5. `src/components/quests/QuestObjectivesList.tsx` - Checklist of objectives
6. `src/components/quests/QuestCreator.tsx` - Create/edit quests
7. `src/components/quests/QuestFilters.tsx` - Filter by status/priority

### Integration Points
- Replace current note folders with structured quest system
- Link quests to sessions
- Track quest progress in session logs
- Auto-award XP/credits on quest completion

---

## Feature 8: Inventory Management

### Priority: HIGH
**Impact**: Complete character management

### Database Schema
```sql
-- Create inventory_items table
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL DEFAULT 'campaign',

  -- Ownership
  owner_type TEXT NOT NULL, -- character, vehicle, storage
  owner_id UUID NOT NULL,

  -- Item details
  name TEXT NOT NULL,
  description TEXT,
  item_type TEXT, -- weapon, armor, equipment, trade_good, consumable, currency

  -- Physical properties
  quantity INTEGER DEFAULT 1,
  weight_kg DECIMAL(10, 2) DEFAULT 0,
  volume_m3 DECIMAL(10, 3) DEFAULT 0,

  -- Financial
  value_credits BIGINT DEFAULT 0,
  purchase_price BIGINT,

  -- Technical
  tech_level INTEGER,

  -- Location tracking
  location TEXT, -- worn, carried, stowed, cargo_hold
  container_id UUID, -- if inside another item

  -- Condition
  condition TEXT DEFAULT 'good', -- excellent, good, worn, damaged, broken

  -- Metadata
  notes TEXT,
  tags TEXT[],

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create item_templates table (for quick adding)
CREATE TABLE public.item_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL DEFAULT 'campaign',

  name TEXT NOT NULL,
  description TEXT,
  item_type TEXT,
  weight_kg DECIMAL(10, 2) DEFAULT 0,
  volume_m3 DECIMAL(10, 3) DEFAULT 0,
  value_credits BIGINT DEFAULT 0,
  tech_level INTEGER,

  is_system_template BOOLEAN DEFAULT false, -- from core rulebook

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_inventory_owner ON public.inventory_items(owner_type, owner_id);
CREATE INDEX idx_inventory_player_id ON public.inventory_items(player_id);
CREATE INDEX idx_item_templates_player_id ON public.item_templates(player_id);
```

### TypeScript Types
```typescript
// src/types/inventory.ts
export interface InventoryItem {
  id: string;
  player_id: string;

  owner_type: 'character' | 'vehicle' | 'storage';
  owner_id: string;

  name: string;
  description?: string;
  item_type?: string;

  quantity: number;
  weight_kg: number;
  volume_m3: number;

  value_credits: number;
  purchase_price?: number;

  tech_level?: number;

  location?: string;
  container_id?: string;

  condition: 'excellent' | 'good' | 'worn' | 'damaged' | 'broken';

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
```

### Components to Create
1. `src/contexts/InventoryContext.tsx` - Inventory state management
2. `src/components/inventory/InventoryList.tsx` - Main inventory view
3. `src/components/inventory/InventoryItem.tsx` - Individual item row
4. `src/components/inventory/EncumbranceTracker.tsx` - Weight/capacity display
5. `src/components/inventory/ItemTransferDialog.tsx` - Transfer between characters/vehicles
6. `src/components/inventory/ItemTemplateSelector.tsx` - Quick add from templates
7. `src/components/inventory/CargoManagement.tsx` - Ship cargo integration
8. `src/lib/inventory/encumbrance.ts` - Encumbrance calculations

### Integration Points
- Add inventory tab to character sheets
- Add cargo tab to vehicle sheets
- Calculate encumbrance based on STR
- Link to financial system for tracking values
- Import Traveller Core Rulebook equipment as templates

---

## Feature 9: Calendar & Time Tracking

### Priority: MEDIUM
**Impact**: Campaign continuity

### Database Schema
```sql
-- Create campaign_calendar table
CREATE TABLE public.campaign_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL DEFAULT 'campaign',

  -- Imperial Calendar date (day-0 = 1/1/0001)
  imperial_date TEXT NOT NULL, -- format: "001-1105" (day of year - year)

  -- Converted date components
  day INTEGER NOT NULL,
  year INTEGER NOT NULL,

  -- Current campaign time
  is_current_date BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create calendar_events table
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL DEFAULT 'campaign',

  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'reminder', -- reminder, session, payment, arrival, departure

  -- Date
  imperial_date TEXT NOT NULL,

  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_type TEXT, -- daily, weekly, monthly, yearly
  recurrence_interval INTEGER DEFAULT 1,

  -- Related entities
  character_ids UUID[],
  vehicle_ids UUID[],
  session_id UUID,

  -- Payment automation
  auto_deduct_credits BOOLEAN DEFAULT false,
  deduct_amount BIGINT,

  completed BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_campaign_calendar_player_id ON public.campaign_calendar(player_id);
CREATE INDEX idx_calendar_events_player_id ON public.calendar_events(player_id);
CREATE INDEX idx_calendar_events_date ON public.calendar_events(imperial_date);
```

### TypeScript Types
```typescript
// src/types/calendar.ts
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

  is_recurring: boolean;
  recurrence_type?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrence_interval: number;

  character_ids?: string[];
  vehicle_ids?: string[];
  session_id?: string;

  auto_deduct_credits: boolean;
  deduct_amount?: number;

  completed: boolean;

  created_at: string;
  updated_at: string;
}
```

### Components to Create
1. `src/contexts/CalendarContext.tsx` - Calendar state management
2. `src/components/calendar/ImperialCalendar.tsx` - Main calendar view
3. `src/components/calendar/CurrentDateDisplay.tsx` - Current in-game date
4. `src/components/calendar/TravelTimeCalculator.tsx` - Calculate jump times
5. `src/components/calendar/EventList.tsx` - Upcoming events
6. `src/components/calendar/EventCreator.tsx` - Create calendar events
7. `src/components/calendar/MonthlyExpenseTracker.tsx` - Recurring payments
8. `src/lib/calendar/imperialCalendar.ts` - Date conversion utilities

### Integration Points
- Display current date in header
- Auto-advance time after sessions
- Calculate jump travel time based on parsecs
- Trigger monthly expense deductions
- Link events to sessions

---

## Feature 10: Financial Automation

### Priority: MEDIUM
**Impact**: Reduce bookkeeping overhead

### Database Schema
```sql
-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL DEFAULT 'campaign',

  -- Transaction details
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  imperial_date TEXT,

  amount BIGINT NOT NULL,
  transaction_type TEXT NOT NULL, -- income, expense, transfer, loan_taken, loan_payment
  category TEXT, -- salary, trade, loot, maintenance, fuel, supplies, misc

  description TEXT NOT NULL,
  notes TEXT,

  -- Related entities
  character_id UUID,
  vehicle_id UUID,
  session_id UUID,
  quest_id UUID,

  -- Party funds
  is_party_transaction BOOLEAN DEFAULT false,

  -- Counterparty (for transfers)
  from_character_id UUID,
  to_character_id UUID,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create party_funds table
CREATE TABLE public.party_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL DEFAULT 'campaign',

  balance BIGINT DEFAULT 0,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create recurring_expenses table
CREATE TABLE public.recurring_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL DEFAULT 'campaign',

  name TEXT NOT NULL,
  description TEXT,
  amount BIGINT NOT NULL,

  frequency TEXT NOT NULL, -- monthly, yearly

  character_id UUID,
  vehicle_id UUID,

  is_active BOOLEAN DEFAULT true,

  last_processed_date TEXT, -- imperial date
  next_due_date TEXT, -- imperial date

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_transactions_player_id ON public.transactions(player_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date DESC);
CREATE INDEX idx_transactions_character ON public.transactions(character_id);
CREATE INDEX idx_party_funds_player_id ON public.party_funds(player_id);
CREATE INDEX idx_recurring_expenses_player_id ON public.recurring_expenses(player_id);
```

### TypeScript Types
```typescript
// src/types/finance.ts
export interface Transaction {
  id: string;
  player_id: string;

  transaction_date: string;
  imperial_date?: string;

  amount: number;
  transaction_type: 'income' | 'expense' | 'transfer' | 'loan_taken' | 'loan_payment';
  category?: string;

  description: string;
  notes?: string;

  character_id?: string;
  vehicle_id?: string;
  session_id?: string;
  quest_id?: string;

  is_party_transaction: boolean;

  from_character_id?: string;
  to_character_id?: string;

  created_at: string;
}

export interface PartyFunds {
  id: string;
  player_id: string;
  balance: number;
  updated_at: string;
}

export interface RecurringExpense {
  id: string;
  player_id: string;

  name: string;
  description?: string;
  amount: number;

  frequency: 'monthly' | 'yearly';

  character_id?: string;
  vehicle_id?: string;

  is_active: boolean;

  last_processed_date?: string;
  next_due_date?: string;

  created_at: string;
  updated_at: string;
}
```

### Components to Create
1. `src/contexts/FinanceContext.tsx` - Financial state management
2. `src/components/finance/TransactionLedger.tsx` - Full transaction history
3. `src/components/finance/PartyFundsCard.tsx` - Shared party funds display
4. `src/components/finance/RecurringExpensesList.tsx` - Monthly expenses
5. `src/components/finance/TransactionCreator.tsx` - Add transaction
6. `src/components/finance/FinancialSummary.tsx` - Income/expense overview
7. `src/components/finance/TradeCalculator.tsx` - Trade profit calculator
8. `src/lib/finance/expenseProcessor.ts` - Auto-process monthly expenses

### Integration Points
- Link to character credits
- Link to vehicle maintenance costs
- Auto-deduct monthly ship payments
- Track quest rewards
- Generate financial reports

---

## Feature 11: Character Generator

### Priority: MEDIUM
**Impact**: Speed up character creation

### No Additional Database Tables Required
Uses existing `characters` table

### Components to Create
1. `src/components/character-gen/CharacterGenerator.tsx` - Main wizard
2. `src/components/character-gen/StepCharacteristics.tsx` - Roll/assign characteristics
3. `src/components/character-gen/StepCareerSelection.tsx` - Choose career
4. `src/components/character-gen/StepTermByTerm.tsx` - Term-by-term generation
5. `src/components/character-gen/StepBenefits.tsx` - Roll benefits
6. `src/components/character-gen/StepFinalDetails.tsx` - Name, background
7. `src/lib/character-gen/careers.ts` - Career data and tables
8. `src/lib/character-gen/generator.ts` - Generation logic

### Features
- Roll 2D6 for characteristics
- Career selection with prerequisites
- Term-by-term advancement
- Skill acquisition
- Event and mishap tables
- Benefit rolls
- Aging effects
- Mustering out benefits

### Integration Points
- Create new character from generator
- Save progress mid-generation
- Export generated character

---

## Feature 12: Trade System

### Priority: MEDIUM
**Impact**: Core Traveller gameplay

### Database Schema
```sql
-- Create trade_goods table
CREATE TABLE public.trade_goods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL DEFAULT 'campaign',

  -- Good details
  name TEXT NOT NULL,
  trade_code TEXT NOT NULL, -- e.g., "Common Manufactured Goods"
  base_price BIGINT NOT NULL,
  tons DECIMAL(10, 2) NOT NULL,

  -- Purchase info
  purchase_world TEXT,
  purchase_price BIGINT NOT NULL,
  purchase_date TEXT, -- imperial date

  -- Sale info (if sold)
  sale_world TEXT,
  sale_price BIGINT,
  sale_date TEXT,

  status TEXT DEFAULT 'in_cargo', -- in_cargo, sold

  -- Storage
  vehicle_id UUID,

  -- Speculation
  is_speculation BOOLEAN DEFAULT false,
  broker_skill_used INTEGER DEFAULT 0,

  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trade_market_rolls table (history)
CREATE TABLE public.trade_market_rolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL DEFAULT 'campaign',

  world_name TEXT NOT NULL,
  trade_codes TEXT[], -- world's trade codes

  roll_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  imperial_date TEXT,

  available_goods JSONB, -- list of goods with quantities and prices

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_trade_goods_player_id ON public.trade_goods(player_id);
CREATE INDEX idx_trade_goods_status ON public.trade_goods(status);
CREATE INDEX idx_trade_market_rolls_player_id ON public.trade_market_rolls(player_id);
```

### TypeScript Types
```typescript
// src/types/trade.ts
export interface TradeGood {
  id: string;
  player_id: string;

  name: string;
  trade_code: string;
  base_price: number;
  tons: number;

  purchase_world?: string;
  purchase_price: number;
  purchase_date?: string;

  sale_world?: string;
  sale_price?: number;
  sale_date?: string;

  status: 'in_cargo' | 'sold';

  vehicle_id?: string;

  is_speculation: boolean;
  broker_skill_used: number;

  notes?: string;

  created_at: string;
  updated_at: string;
}

export interface TradeMarketRoll {
  id: string;
  player_id: string;

  world_name: string;
  trade_codes: string[];

  roll_date: string;
  imperial_date?: string;

  available_goods: any;

  created_at: string;
}
```

### Components to Create
1. `src/contexts/TradeContext.tsx` - Trade state management
2. `src/components/trade/TradeBoard.tsx` - Main trade interface
3. `src/components/trade/MarketGenerator.tsx` - Generate available goods
4. `src/components/trade/SpeculationCalculator.tsx` - Broker skill modifiers
5. `src/components/trade/CargoManifest.tsx` - Current trade goods
6. `src/components/trade/ProfitTracker.tsx` - Profit/loss tracking
7. `src/components/trade/TradeGoodsList.tsx` - Standard trade goods
8. `src/lib/trade/marketTables.ts` - Trade tables from rulebook
9. `src/lib/trade/priceCalculator.ts` - Price modifiers

### Integration Points
- Link to vehicle cargo
- Link to financial system
- Use Broker skill from characters
- Track profits in transactions

---

## Feature 13: Ship Combat Rules

### Priority: HIGH
**Impact**: Complete space combat support

### Database Schema
```sql
-- Extend combat_encounters table
-- Add ship combat specific fields
ALTER TABLE public.combat_encounters ADD COLUMN combat_type TEXT DEFAULT 'personal'; -- personal, space

-- Create ship_combat_state table
CREATE TABLE public.ship_combat_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID REFERENCES public.combat_encounters(id) ON DELETE CASCADE,

  ship_id UUID NOT NULL, -- character_id for combatant
  vehicle_id UUID, -- reference to vehicle if player ship

  -- Position
  position_x DECIMAL(10, 2) DEFAULT 0,
  position_y DECIMAL(10, 2) DEFAULT 0,

  -- Combat stats
  range_band TEXT DEFAULT 'long', -- adjacent, close, short, medium, long, distant, very_distant
  facing INTEGER DEFAULT 0, -- 0-359 degrees

  -- Crew stations
  pilot_character_id UUID,
  gunner_character_ids UUID[],
  engineer_character_id UUID,
  sensors_character_id UUID,

  -- Ship conditions
  hull_current INTEGER,
  hull_max INTEGER,
  power_available INTEGER,
  power_total INTEGER,

  -- Critical hits
  critical_hits JSONB DEFAULT '[]',

  -- Actions this turn
  has_moved BOOLEAN DEFAULT false,
  weapons_fired INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ship_combat_actions table (log)
CREATE TABLE public.ship_combat_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID REFERENCES public.combat_encounters(id) ON DELETE CASCADE,

  round_number INTEGER NOT NULL,
  character_id UUID,
  ship_id UUID,

  action_type TEXT NOT NULL, -- pilot, shoot, engineering, sensors, damage_control
  description TEXT NOT NULL,

  roll_result INTEGER,
  effect INTEGER,

  damage_dealt INTEGER,

  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ship_combat_state_encounter ON public.ship_combat_state(encounter_id);
CREATE INDEX idx_ship_combat_actions_encounter ON public.ship_combat_actions(encounter_id);
```

### TypeScript Types
```typescript
// src/types/shipCombat.ts
export interface ShipCombatState {
  id: string;
  encounter_id: string;

  ship_id: string;
  vehicle_id?: string;

  position_x: number;
  position_y: number;

  range_band: 'adjacent' | 'close' | 'short' | 'medium' | 'long' | 'distant' | 'very_distant';
  facing: number;

  pilot_character_id?: string;
  gunner_character_ids?: string[];
  engineer_character_id?: string;
  sensors_character_id?: string;

  hull_current: number;
  hull_max: number;
  power_available: number;
  power_total: number;

  critical_hits: any[];

  has_moved: boolean;
  weapons_fired: number;

  created_at: string;
  updated_at: string;
}

export interface ShipCombatAction {
  id: string;
  encounter_id: string;

  round_number: number;
  character_id?: string;
  ship_id?: string;

  action_type: 'pilot' | 'shoot' | 'engineering' | 'sensors' | 'damage_control';
  description: string;

  roll_result?: number;
  effect?: number;

  damage_dealt?: number;

  timestamp: string;
}

export type RangeBand = 'adjacent' | 'close' | 'short' | 'medium' | 'long' | 'distant' | 'very_distant';

export interface WeaponRangeModifiers {
  [key: string]: {
    [key in RangeBand]: number;
  };
}
```

### Components to Create
1. `src/components/combat/ShipCombatTracker.tsx` - Ship combat UI
2. `src/components/combat/ShipPositioning.tsx` - Tactical map view
3. `src/components/combat/CrewStationAssignment.tsx` - Assign crew to stations
4. `src/components/combat/ShipActions.tsx` - Action buttons per station
5. `src/components/combat/RangeBandCalculator.tsx` - Range determination
6. `src/components/combat/DamageControlPanel.tsx` - Engineering actions
7. `src/components/combat/CriticalHitsTracker.tsx` - Critical hit effects
8. `src/lib/combat/shipCombat.ts` - Combat rules engine
9. `src/lib/combat/weaponRanges.ts` - Range band modifiers

### Integration Points
- Extend existing combat tracker
- Use Bridge tactical display
- Link to vehicle sheets for stats
- Use character skills for actions

---

## Feature 14: NPC Relationship Tracker

### Priority: MEDIUM
**Impact**: Social gameplay support

### Database Schema
```sql
-- Create npcs table
CREATE TABLE public.npcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL DEFAULT 'campaign',

  -- Basic info
  name TEXT NOT NULL,
  title TEXT,
  species TEXT,
  gender TEXT,
  age INTEGER,

  -- Characteristics (optional)
  characteristics JSONB,

  -- Career/role
  career TEXT,
  rank TEXT,
  skills JSONB,

  -- Appearance
  description TEXT,
  portrait_url TEXT,

  -- Location
  current_location TEXT,
  homeworld TEXT,

  -- Organization
  faction TEXT,
  organization TEXT,

  -- Tags
  tags TEXT[],

  notes TEXT,
  gm_notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create npc_relationships table
CREATE TABLE public.npc_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL DEFAULT 'campaign',

  npc_id UUID REFERENCES public.npcs(id) ON DELETE CASCADE,
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE,

  -- Relationship status
  relationship_type TEXT DEFAULT 'neutral', -- ally, friend, neutral, rival, enemy
  relationship_level INTEGER DEFAULT 0, -- -10 to +10

  -- Notes
  relationship_notes TEXT,

  -- Tracking
  first_met_date TEXT, -- imperial date
  first_met_session_id UUID,
  last_interaction_date TEXT,
  last_interaction_session_id UUID,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(npc_id, character_id)
);

-- Create npc_interactions table (history log)
CREATE TABLE public.npc_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL DEFAULT 'campaign',

  npc_id UUID REFERENCES public.npcs(id) ON DELETE CASCADE,
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE,

  interaction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  imperial_date TEXT,
  session_id UUID,

  interaction_type TEXT, -- meeting, favor, betrayal, trade, combat
  description TEXT NOT NULL,

  relationship_change INTEGER DEFAULT 0, -- +/- to relationship level

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_npcs_player_id ON public.npcs(player_id);
CREATE INDEX idx_npcs_faction ON public.npcs(faction);
CREATE INDEX idx_npc_relationships_npc ON public.npc_relationships(npc_id);
CREATE INDEX idx_npc_relationships_character ON public.npc_relationships(character_id);
CREATE INDEX idx_npc_interactions_npc ON public.npc_interactions(npc_id);
```

### TypeScript Types
```typescript
// src/types/npc.ts
export interface NPC {
  id: string;
  player_id: string;

  name: string;
  title?: string;
  species?: string;
  gender?: string;
  age?: number;

  characteristics?: any;

  career?: string;
  rank?: string;
  skills?: any;

  description?: string;
  portrait_url?: string;

  current_location?: string;
  homeworld?: string;

  faction?: string;
  organization?: string;

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

  relationship_type: 'ally' | 'friend' | 'neutral' | 'rival' | 'enemy';
  relationship_level: number;

  relationship_notes?: string;

  first_met_date?: string;
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

  relationship_change: number;

  created_at: string;
}
```

### Components to Create
1. `src/contexts/NPCContext.tsx` - NPC state management
2. `src/components/npcs/NPCDirectory.tsx` - List of all NPCs
3. `src/components/npcs/NPCCard.tsx` - Individual NPC card
4. `src/components/npcs/NPCDetail.tsx` - Full NPC profile
5. `src/components/npcs/RelationshipTracker.tsx` - Relationship web
6. `src/components/npcs/InteractionLog.tsx` - Interaction history
7. `src/components/npcs/NPCCreator.tsx` - Create/edit NPCs
8. `src/components/npcs/FactionView.tsx` - NPCs by faction

### Integration Points
- Link NPCs to sessions
- Track in session logs
- Replace ally/rival text fields in character sheets
- Link to quest system

---

## Feature 15: Enhanced Export/Import

### Priority: LOW
**Impact**: Data portability

### No Additional Database Tables Required
Enhances existing `ExportImportDialog` component

### Components to Update/Create
1. `src/components/campaign/ExportImportDialog.tsx` - Enhance existing
2. `src/components/campaign/PDFExporter.tsx` - PDF character sheets
3. `src/components/campaign/CSVExporter.tsx` - CSV exports
4. `src/components/campaign/SelectiveExport.tsx` - Choose what to export
5. `src/lib/export/pdfGenerator.ts` - PDF generation
6. `src/lib/export/csvGenerator.ts` - CSV generation

### Features to Add
- PDF character sheet export (use jsPDF or similar)
- CSV export for spreadsheets
- Selective export (single character/vehicle)
- Import wizard with preview
- Validation before import
- Conflict resolution

### Dependencies to Add
```json
{
  "jspdf": "^2.5.1",
  "@types/jspdf": "^2.0.0"
}
```

---

## Feature 16: Automatic Backups

### Priority: MEDIUM
**Impact**: Data safety

### No Additional Database Tables Required
Uses localStorage and optional cloud storage

### Components to Create
1. `src/components/backup/BackupManager.tsx` - Backup UI
2. `src/components/backup/RestoreDialog.tsx` - Restore from backup
3. `src/components/backup/BackupHistory.tsx` - List of backups
4. `src/lib/backup/autoBackup.ts` - Automatic backup logic
5. `src/lib/backup/versionControl.ts` - Version management

### Features
- Daily auto-export to localStorage
- Pre-session manual backup button
- Keep last 5 backups (rotate old ones)
- Restore functionality with preview
- Export backups as files
- Optional: Sync to Supabase Storage

### Integration Points
- Run daily backup check on app load
- Backup before major operations
- Show backup indicator in header

---

## Feature 17: Statistics Dashboard

### Priority: LOW
**Impact**: Data insights

### No Additional Database Tables Required
Aggregates existing data

### Components to Create
1. `src/components/stats/StatsDashboard.tsx` - Main dashboard
2. `src/components/stats/SkillDistributionChart.tsx` - Radar chart
3. `src/components/stats/CampaignTimeline.tsx` - Timeline view
4. `src/components/stats/CombatAnalytics.tsx` - Combat stats
5. `src/components/stats/FinancialCharts.tsx` - Income/expense graphs
6. `src/components/stats/CharacterComparison.tsx` - Compare characters
7. `src/lib/stats/aggregations.ts` - Data aggregation

### Charts to Create (using Recharts)
- Skill distribution (RadarChart)
- Campaign timeline (LineChart with sessions)
- Combat analytics (BarChart - damage dealt, actions taken)
- Financial graphs (AreaChart - income/expenses over time)
- Character level comparison (BarChart)
- Trade profit margins (LineChart)

### Integration Points
- Add "Statistics" tab to main navigation
- Generate reports per session
- Export charts as images

---

## Implementation Order Recommendation

### Phase 1: Core Campaign Features (Weeks 1-2)
1. **Session Management** - Foundation for tracking campaign progress
2. **Quest/Mission Tracker** - Structure campaign narrative
3. **Calendar & Time Tracking** - Track in-game time

### Phase 2: Character & Inventory (Weeks 3-4)
4. **Inventory Management** - Complete character management
5. **NPC Relationship Tracker** - Social gameplay
6. **Character Generator** - Speed up character creation

### Phase 3: Financial & Trade (Week 5)
7. **Financial Automation** - Reduce bookkeeping
8. **Trade System** - Core Traveller gameplay

### Phase 4: Combat & Advanced (Week 6)
9. **Ship Combat Rules** - Complete space combat
10. **Enhanced Export/Import** - Better data portability
11. **Automatic Backups** - Data safety

### Phase 5: Analytics & Polish (Week 7)
12. **Statistics Dashboard** - Data insights
13. Testing, bug fixes, polish

---

## Database Migration Strategy

Create a single new migration file: `20260114_feature_expansion.sql`

This will contain all new tables in order:
1. sessions, session_log_entries, session_rewards
2. quests, quest_objectives
3. inventory_items, item_templates
4. campaign_calendar, calendar_events
5. transactions, party_funds, recurring_expenses
6. trade_goods, trade_market_rolls
7. ship_combat_state, ship_combat_actions
8. npcs, npc_relationships, npc_interactions
9. ALTER TABLE combat_encounters (add combat_type)

---

## Testing Strategy

### Unit Tests
- Date conversion utilities
- Encumbrance calculations
- Trade price calculations
- Ship combat ranges

### Integration Tests
- Session creation and log entries
- Quest completion flow
- Inventory transfers
- Monthly expense processing

### Manual Testing Checklist
- Create session and add log entries
- Create quest with objectives
- Add inventory items and transfer
- Create calendar events
- Record transactions
- Generate character
- Run trade speculation
- Execute ship combat turn
- Create NPC and track relationships
- Export/import data
- Create backup and restore

---

## UI/UX Considerations

### Navigation Structure
```
Main Tabs:
- Crew (existing)
- Vehicles (existing)
- Bridge (existing)
- Navigation (existing)
- [NEW] Sessions
- [NEW] Quests
- [NEW] Inventory
- [NEW] Trade
- [NEW] NPCs
- [NEW] Statistics
- Campaign (existing - add Backups)
```

### Mobile Responsiveness
- All new components must be mobile-friendly
- Use responsive tables with horizontal scroll
- Collapsible sections for detail views
- Touch-friendly buttons and inputs

### Dark Mode
- All new components must support dark mode
- Use existing Tailwind dark: classes
- Test in both themes

---

## Dependencies to Install

```bash
npm install jspdf @types/jspdf
# All other dependencies already installed
```

---

## Estimated Effort

- **Total Features**: 12 major features
- **Estimated Time**: 6-7 weeks of development
- **Database Tables**: 20 new tables
- **TypeScript Types**: 30+ new interfaces
- **React Components**: 80+ new components
- **Contexts**: 6 new contexts
- **Utility Functions**: 20+ utility modules

---

## Next Steps

1. **Review this plan** - Confirm approach and priorities
2. **Create database migration** - Single migration with all tables
3. **Implement features in phases** - Follow recommended order
4. **Test incrementally** - Test each feature as completed
5. **Document features** - User guide for each feature
6. **Deploy** - Push to production branch

---

## Notes

- All features maintain existing data structures
- Backwards compatible with current data
- Uses existing authentication system
- Follows existing code patterns
- Mobile-responsive by default
- Dark mode compatible

---

**Ready to begin implementation?**
