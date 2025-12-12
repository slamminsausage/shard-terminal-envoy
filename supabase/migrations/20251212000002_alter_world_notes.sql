-- Add new columns to existing world_notes table if they don't exist
-- This is a safe migration that won't fail if columns already exist

DO $$
BEGIN
  -- Add planet_description column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'world_notes'
    AND column_name = 'planet_description'
  ) THEN
    ALTER TABLE public.world_notes ADD COLUMN planet_description TEXT;
  END IF;

  -- Add custom_notes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'world_notes'
    AND column_name = 'custom_notes'
  ) THEN
    ALTER TABLE public.world_notes ADD COLUMN custom_notes TEXT;
  END IF;
END $$;
