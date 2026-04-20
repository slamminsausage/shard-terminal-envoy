-- Add is_hidden column to quests table so GMs can draft quests that are
-- invisible to players until the GM activates them in-game.

ALTER TABLE public.quests
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;

-- Index for filtering visible quests efficiently on list queries.
CREATE INDEX IF NOT EXISTS idx_quests_is_hidden ON public.quests(is_hidden);
