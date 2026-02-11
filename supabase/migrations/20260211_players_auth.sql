-- Players table for multi-player authentication
CREATE TABLE IF NOT EXISTS public.players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('gm', 'player')),
  access_code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_accessed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS (permissive since app uses anon key without Supabase Auth)
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on players"
ON public.players
FOR ALL
USING (true)
WITH CHECK (true);

-- Seed a default GM account
INSERT INTO public.players (name, role, access_code)
VALUES ('Game Master', 'gm', 'GM-MASTER')
ON CONFLICT (access_code) DO NOTHING;

-- Add character_type and npc_role columns if they don't exist
-- (these support ownership filtering - PCs belong to players, NPCs are shared)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'characters' AND column_name = 'character_type'
  ) THEN
    ALTER TABLE public.characters ADD COLUMN character_type TEXT DEFAULT 'pc';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'characters' AND column_name = 'npc_role'
  ) THEN
    ALTER TABLE public.characters ADD COLUMN npc_role TEXT;
  END IF;
END $$;
