-- Create handouts table for persistent campaign handouts
-- Migrates handout metadata from localStorage to Supabase DB
-- (Media files already stored in 'handouts' Storage bucket)
CREATE TABLE IF NOT EXISTS handouts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'video')),
  content TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_handouts_is_visible ON handouts(is_visible);
CREATE INDEX IF NOT EXISTS idx_handouts_type ON handouts(type);
CREATE INDEX IF NOT EXISTS idx_handouts_created_at ON handouts(created_at DESC);

-- Enable RLS
ALTER TABLE handouts ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated operations
CREATE POLICY "Enable all operations for authenticated users" ON handouts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow all operations for anonymous users (campaign mode)
CREATE POLICY "Enable all operations for anonymous users" ON handouts
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
