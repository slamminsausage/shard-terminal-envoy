-- Add current characteristics columns for tracking damage in Traveller combat
-- These fields track the current values of STR/DEX/END which can be reduced by damage
-- They default to NULL, which means "use the base characteristic value"

ALTER TABLE characters
ADD COLUMN IF NOT EXISTS current_strength INTEGER,
ADD COLUMN IF NOT EXISTS current_dexterity INTEGER,
ADD COLUMN IF NOT EXISTS current_endurance INTEGER;

COMMENT ON COLUMN characters.current_strength IS 'Current STR after damage (NULL means full strength)';
COMMENT ON COLUMN characters.current_dexterity IS 'Current DEX after damage (NULL means full dexterity)';
COMMENT ON COLUMN characters.current_endurance IS 'Current END after damage (NULL means full endurance)';
