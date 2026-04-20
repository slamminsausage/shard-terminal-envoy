-- Character lifepath history: term-by-term record produced by the character
-- generator and editable from the PC sheet.
ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS lifepath_log JSONB NOT NULL DEFAULT '[]'::jsonb;
