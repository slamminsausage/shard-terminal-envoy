-- Create vtt_sessions table for persistent VTT state
-- Stores the entire VTT session JSON (maps, tokens, strokes, fog, audio, etc.)
-- excluding large media data URLs which are stored in vtt_maps/vtt_token_images buckets
CREATE TABLE IF NOT EXISTS vtt_sessions (
  id TEXT NOT NULL DEFAULT 'default' PRIMARY KEY,
  state_json JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vtt_sessions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated operations
CREATE POLICY "Enable all operations for authenticated users" ON vtt_sessions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow all operations for anonymous users (campaign mode)
CREATE POLICY "Enable all operations for anonymous users" ON vtt_sessions
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
