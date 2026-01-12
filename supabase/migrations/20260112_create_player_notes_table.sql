-- Create player_notes table for persistent campaign notes
CREATE TABLE IF NOT EXISTS player_notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT NOT NULL CHECK (created_by IN ('player', 'gm')),
  folder TEXT DEFAULT 'general' CHECK (folder IN ('general', 'planets', 'locations', 'npcs', 'quests', 'items', 'other')),
  tags TEXT[] DEFAULT '{}'::TEXT[]
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_player_notes_folder ON player_notes(folder);
CREATE INDEX IF NOT EXISTS idx_player_notes_created_by ON player_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_player_notes_updated_at ON player_notes(updated_at DESC);

-- Add RLS (Row Level Security) policies if needed
-- For now, we'll keep it simple and allow all operations
ALTER TABLE player_notes ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated operations (you can customize this later)
CREATE POLICY "Enable all operations for authenticated users" ON player_notes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow all operations for anonymous users (for campaign mode)
CREATE POLICY "Enable all operations for anonymous users" ON player_notes
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
