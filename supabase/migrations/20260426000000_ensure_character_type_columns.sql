-- Ensure character type classification columns exist and are constrained.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'characters'
      AND column_name = 'character_type'
  ) THEN
    ALTER TABLE public.characters ADD COLUMN character_type TEXT DEFAULT 'pc';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'characters'
      AND column_name = 'npc_role'
  ) THEN
    ALTER TABLE public.characters ADD COLUMN npc_role TEXT;
  END IF;
END $$;

UPDATE public.characters
SET character_type = 'pc'
WHERE character_type IS NULL;

ALTER TABLE public.characters
  ALTER COLUMN character_type SET DEFAULT 'pc',
  ALTER COLUMN character_type SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'characters_character_type_check'
      AND conrelid = 'public.characters'::regclass
  ) THEN
    ALTER TABLE public.characters
      ADD CONSTRAINT characters_character_type_check
      CHECK (character_type IN ('pc', 'npc'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'characters_npc_role_check'
      AND conrelid = 'public.characters'::regclass
  ) THEN
    ALTER TABLE public.characters
      ADD CONSTRAINT characters_npc_role_check
      CHECK (npc_role IS NULL OR npc_role IN ('crew', 'enemy', 'contact', 'patron'));
  END IF;
END $$;
