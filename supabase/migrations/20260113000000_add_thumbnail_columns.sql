-- Add thumbnail_url column to characters table
ALTER TABLE public.characters
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT DEFAULT NULL;

-- Add thumbnail_url column to player_notes table
ALTER TABLE public.player_notes
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT DEFAULT NULL;

-- Add comments to explain the columns
COMMENT ON COLUMN public.characters.thumbnail_url IS 'URL to character portrait image stored in Supabase Storage';
COMMENT ON COLUMN public.player_notes.thumbnail_url IS 'URL to note thumbnail image (e.g., NPC portrait) stored in Supabase Storage';
