-- Add psionics and initiative characteristics to characters table
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS psionics INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS initiative INTEGER DEFAULT 7;

-- Add comment to explain the columns
COMMENT ON COLUMN public.characters.psionics IS 'Psionic characteristic value (0 = no psionic ability)';
COMMENT ON COLUMN public.characters.initiative IS 'Initiative characteristic value (typically defaults to dexterity)';
