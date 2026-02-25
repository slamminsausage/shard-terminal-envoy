-- Crew groups: independent, color-coded teams optionally linked to a ship
CREATE TABLE IF NOT EXISTS public.crew_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT DEFAULT 'campaign',
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#00ff00',
  ship_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.crew_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to crew_groups"
  ON public.crew_groups FOR ALL
  USING (true)
  WITH CHECK (true);

-- Character crew assignment fields
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS crew_id UUID REFERENCES public.crew_groups(id) ON DELETE SET NULL;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS crew_position TEXT;
