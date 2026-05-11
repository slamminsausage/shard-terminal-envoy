-- Ensure combat_encounters table exists (idempotent)
CREATE TABLE IF NOT EXISTS public.combat_encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL DEFAULT 'campaign',
  current_round INTEGER NOT NULL DEFAULT 1,
  current_turn_index INTEGER NOT NULL DEFAULT 0,
  combatants JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(player_id)
);

CREATE INDEX IF NOT EXISTS idx_combat_encounters_player_id ON public.combat_encounters(player_id);

ALTER TABLE public.combat_encounters ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'combat_encounters' AND policyname = 'Allow all operations on combat_encounters'
  ) THEN
    CREATE POLICY "Allow all operations on combat_encounters"
      ON public.combat_encounters FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION public.update_combat_encounters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_combat_encounters_updated_at ON public.combat_encounters;
CREATE TRIGGER update_combat_encounters_updated_at
  BEFORE UPDATE ON public.combat_encounters
  FOR EACH ROW EXECUTE FUNCTION public.update_combat_encounters_updated_at();
