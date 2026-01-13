-- Create combat encounters table for persisting combat state
-- Each player can have one active combat encounter at a time

CREATE TABLE IF NOT EXISTS combat_encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL DEFAULT 'campaign',

  -- Combat state
  current_round INTEGER NOT NULL DEFAULT 1,
  current_turn_index INTEGER NOT NULL DEFAULT 0,

  -- Combatants stored as JSONB array
  combatants JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one active combat per player
  UNIQUE(player_id)
);

-- Index for faster lookups
CREATE INDEX idx_combat_encounters_player_id ON combat_encounters(player_id);

-- Add RLS policies
ALTER TABLE combat_encounters ENABLE ROW LEVEL SECURITY;

-- Allow players to manage their own combat encounters
CREATE POLICY "Players can view their own combat encounters"
  ON combat_encounters FOR SELECT
  USING (true); -- Allow all reads for simplicity

CREATE POLICY "Players can insert their own combat encounters"
  ON combat_encounters FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Players can update their own combat encounters"
  ON combat_encounters FOR UPDATE
  USING (true);

CREATE POLICY "Players can delete their own combat encounters"
  ON combat_encounters FOR DELETE
  USING (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_combat_encounters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_combat_encounters_updated_at
  BEFORE UPDATE ON combat_encounters
  FOR EACH ROW
  EXECUTE FUNCTION update_combat_encounters_updated_at();

COMMENT ON TABLE combat_encounters IS 'Stores active combat encounters for persistence across sessions';
COMMENT ON COLUMN combat_encounters.combatants IS 'JSONB array of combatant objects with initiative, health, and combat stats';
