-- Bridge Console Database Schema
-- Run this in your Supabase SQL editor

-- ============================================
-- BRIDGE STATE TABLE
-- ============================================
-- Stores the current state of the bridge console

CREATE TABLE IF NOT EXISTS bridge_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Display mode
  mode TEXT DEFAULT 'tactical' CHECK (mode IN ('tactical', 'navigation')),
  
  -- Navigation info
  current_system TEXT DEFAULT 'UNKNOWN',
  destination TEXT,
  eta TEXT,
  
  -- Alert status
  alert_level TEXT DEFAULT 'normal' CHECK (alert_level IN ('normal', 'elevated', 'combat', 'emergency')),
  
  -- Player ship reference (optional, links to vehicles table)
  player_ship_id UUID REFERENCES vehicles(id) ON DELETE SET NULL
);

-- ============================================
-- BRIDGE CONTACTS TABLE
-- ============================================
-- Ships/contacts visible on the tactical display

CREATE TABLE IF NOT EXISTS bridge_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_state_id UUID NOT NULL REFERENCES bridge_state(id) ON DELETE CASCADE,
  
  -- Ship identity
  name TEXT NOT NULL,
  ship_class TEXT,
  tonnage INTEGER,
  
  -- Tactical status
  status TEXT DEFAULT 'unknown' CHECK (status IN ('friendly', 'unknown', 'enemy', 'derelict')),
  
  -- Position (hex coordinates, 0,0 is center)
  hex_q INTEGER DEFAULT 0,
  hex_r INTEGER DEFAULT 0,
  facing INTEGER DEFAULT 0 CHECK (facing >= 0 AND facing <= 5), -- 0-5 for hex directions
  
  -- Combat state
  hull_current INTEGER,
  hull_max INTEGER,
  
  -- Flags
  is_player_ship BOOLEAN DEFAULT FALSE,
  
  -- Link to vehicles table (optional)
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_bridge_contacts_state ON bridge_contacts(bridge_state_id);

-- ============================================
-- BRIDGE MESSAGES TABLE
-- ============================================
-- Communications/transmissions

CREATE TABLE IF NOT EXISTS bridge_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_state_id UUID NOT NULL REFERENCES bridge_state(id) ON DELETE CASCADE,
  
  -- Message content
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'priority', 'emergency')),
  
  -- Encryption (for skill check mechanics)
  encrypted BOOLEAN DEFAULT FALSE,
  encryption_difficulty INTEGER, -- Roll required to decrypt (e.g., 8 for 8+)
  
  -- Read status
  is_read BOOLEAN DEFAULT FALSE,
  
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_bridge_messages_state ON bridge_messages(bridge_state_id);
CREATE INDEX IF NOT EXISTS idx_bridge_messages_sent ON bridge_messages(sent_at DESC);

-- ============================================
-- SECTOR ANNOTATIONS TABLE
-- ============================================
-- Campaign notes and flags per world/hex

CREATE TABLE IF NOT EXISTS sector_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Location identifier
  sector_name TEXT NOT NULL,
  hex TEXT NOT NULL, -- e.g., "1910"
  world_name TEXT,
  
  -- Quick flags (checkboxes)
  visited BOOLEAN DEFAULT FALSE,
  safe_haven BOOLEAN DEFAULT FALSE,
  hostile BOOLEAN DEFAULT FALSE,
  network_present BOOLEAN DEFAULT FALSE, -- Spy network
  hideout BOOLEAN DEFAULT FALSE,
  patron BOOLEAN DEFAULT FALSE, -- Known patron contact
  active_mission BOOLEAN DEFAULT FALSE,
  treasure BOOLEAN DEFAULT FALSE,
  
  -- Custom flags (array of strings)
  custom_flags JSONB DEFAULT '[]'::jsonb,
  
  -- Notes
  gm_notes TEXT, -- Hidden from players (for future GM mode)
  player_notes TEXT, -- Visible to everyone
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Each sector/hex can only have one annotation
  UNIQUE(sector_name, hex)
);

-- Index for location lookups
CREATE INDEX IF NOT EXISTS idx_sector_annotations_location ON sector_annotations(sector_name, hex);

-- ============================================
-- HIDDEN CONTACTS + SCAN LOGGING (NEW)
-- ============================================

ALTER TABLE bridge_contacts
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS scan_dc INTEGER;

CREATE TABLE IF NOT EXISTS bridge_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_state_id UUID NOT NULL REFERENCES bridge_state(id) ON DELETE CASCADE,
  initiated_by TEXT,
  skill_check_roll INTEGER,
  difficulty INTEGER,
  result TEXT,
  revealed_contact_ids TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bridge_scans_state ON bridge_scans(bridge_state_id);

-- ============================================
-- ENABLE REAL-TIME
-- ============================================
-- This allows Supabase real-time subscriptions

-- Note: Run these one at a time if you get errors

ALTER PUBLICATION supabase_realtime ADD TABLE bridge_state;
ALTER PUBLICATION supabase_realtime ADD TABLE bridge_contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE bridge_messages;

-- ============================================
-- STATUS CHECK CONSTRAINT UPDATE (DERELICT)
-- ============================================
ALTER TABLE bridge_contacts DROP CONSTRAINT IF EXISTS bridge_contacts_status_check;
ALTER TABLE bridge_contacts ADD CONSTRAINT bridge_contacts_status_check CHECK (status IN ('friendly', 'unknown', 'enemy', 'derelict'));

-- ============================================
-- ROW LEVEL SECURITY (Optional)
-- ============================================
-- For now, we're keeping everything open (anyone can read/write)
-- This matches your current Terminal Envoy setup

ALTER TABLE bridge_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridge_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridge_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sector_annotations ENABLE ROW LEVEL SECURITY;

-- Allow all operations for everyone (matches your open-access model)
CREATE POLICY "Allow all on bridge_state" ON bridge_state FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on bridge_contacts" ON bridge_contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on bridge_messages" ON bridge_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on sector_annotations" ON sector_annotations FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- HELPER FUNCTIONS (Optional)
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for bridge_state
DROP TRIGGER IF EXISTS update_bridge_state_updated_at ON bridge_state;
CREATE TRIGGER update_bridge_state_updated_at
  BEFORE UPDATE ON bridge_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for sector_annotations
DROP TRIGGER IF EXISTS update_sector_annotations_updated_at ON sector_annotations;
CREATE TRIGGER update_sector_annotations_updated_at
  BEFORE UPDATE ON sector_annotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment and run this to create sample data:

/*
-- Create initial bridge state
INSERT INTO bridge_state (mode, current_system, destination, eta, alert_level)
VALUES ('tactical', 'DRINAX SYSTEM', 'ASIM', '6D 14H', 'normal')
RETURNING id;

-- Use the returned ID for contacts (replace YOUR_BRIDGE_STATE_ID)
-- INSERT INTO bridge_contacts (bridge_state_id, name, ship_class, status, hex_q, hex_r, is_player_ship)
-- VALUES 
--   ('YOUR_BRIDGE_STATE_ID', 'VANAGANDR', 'Far Trader', 'friendly', 0, 0, true),
--   ('YOUR_BRIDGE_STATE_ID', 'SILVER DAWN', 'Free Trader', 'friendly', -2, -1, false),
--   ('YOUR_BRIDGE_STATE_ID', 'CONTACT-01', NULL, 'unknown', 3, -2, false),
--   ('YOUR_BRIDGE_STATE_ID', 'CORSAIR ALPHA', 'Corsair', 'enemy', -1, 3, false);

-- INSERT INTO bridge_messages (bridge_state_id, sender, content, priority)
-- VALUES
--   ('YOUR_BRIDGE_STATE_ID', 'KING OLEB XVI', 'Your next assignment awaits. Report to the floating palace immediately for briefing on a matter of utmost importance to the Kingdom.', 'priority'),
--   ('YOUR_BRIDGE_STATE_ID', 'RACHANDO STARPORT', 'Docking clearance approved. Assigned Bay 17. Current refined fuel price: Cr500/ton.', 'normal'),
--   ('YOUR_BRIDGE_STATE_ID', '[ENCRYPTED]', 'ENCRYPTED TRANSMISSION - DECRYPTION REQUIRED', 'normal');
*/
