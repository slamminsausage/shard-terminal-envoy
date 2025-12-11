-- Add missing character sheet fields to characters table
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS rads TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS species_traits TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS pension BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS ship_payments BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS living_cost BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS cash_on_hand BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS study_skill TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS study_weeks TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS study_complete TEXT DEFAULT '';

-- Add comments to explain the columns
COMMENT ON COLUMN public.characters.rads IS 'Radiation exposure level';
COMMENT ON COLUMN public.characters.species_traits IS 'Species-specific traits and abilities';
COMMENT ON COLUMN public.characters.notes IS 'General character notes';
COMMENT ON COLUMN public.characters.pension IS 'Monthly pension amount in credits';
COMMENT ON COLUMN public.characters.ship_payments IS 'Monthly ship payment amount in credits';
COMMENT ON COLUMN public.characters.living_cost IS 'Monthly living cost in credits';
COMMENT ON COLUMN public.characters.cash_on_hand IS 'Current cash available in credits';
COMMENT ON COLUMN public.characters.study_skill IS 'Skill currently being studied';
COMMENT ON COLUMN public.characters.study_weeks IS 'Weeks spent studying';
COMMENT ON COLUMN public.characters.study_complete IS 'Study completion status';
