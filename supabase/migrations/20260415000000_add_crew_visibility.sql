-- Per-crew content scoping for West Marches style play.
--
-- Adds a nullable visible_crew_ids UUID[] column to every GM-authored content
-- surface. Semantics:
--   NULL or empty array = visible to all crews (backward compatible; existing
--                          rows default here, so nothing disappears on upgrade).
--   Non-empty array     = visible only to viewers whose active character
--                          belongs to one of the listed crew_groups.
-- GMs bypass this filter in application code.
--
-- Also adds players.active_character_id so a player can pick which of their
-- characters they are "playing as" right now; the selected character's
-- crew_id is what the visibility filter checks against.

-- -------- Content tables --------
ALTER TABLE public.quests
  ADD COLUMN IF NOT EXISTS visible_crew_ids UUID[] DEFAULT NULL;

ALTER TABLE public.handouts
  ADD COLUMN IF NOT EXISTS visible_crew_ids UUID[] DEFAULT NULL;

ALTER TABLE public.player_notes
  ADD COLUMN IF NOT EXISTS visible_crew_ids UUID[] DEFAULT NULL;

ALTER TABLE public.world_notes
  ADD COLUMN IF NOT EXISTS visible_crew_ids UUID[] DEFAULT NULL;

ALTER TABLE public.hex_markers
  ADD COLUMN IF NOT EXISTS visible_crew_ids UUID[] DEFAULT NULL;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS visible_crew_ids UUID[] DEFAULT NULL;

ALTER TABLE public.calendar_events
  ADD COLUMN IF NOT EXISTS visible_crew_ids UUID[] DEFAULT NULL;

-- GIN indexes speed up "crew id ∈ array" membership queries if we ever push
-- filtering into the database. Filtering is currently client-side, but the
-- indexes are cheap insurance.
CREATE INDEX IF NOT EXISTS idx_quests_visible_crew_ids          ON public.quests          USING GIN (visible_crew_ids);
CREATE INDEX IF NOT EXISTS idx_handouts_visible_crew_ids        ON public.handouts        USING GIN (visible_crew_ids);
CREATE INDEX IF NOT EXISTS idx_player_notes_visible_crew_ids    ON public.player_notes    USING GIN (visible_crew_ids);
CREATE INDEX IF NOT EXISTS idx_world_notes_visible_crew_ids     ON public.world_notes     USING GIN (visible_crew_ids);
CREATE INDEX IF NOT EXISTS idx_hex_markers_visible_crew_ids     ON public.hex_markers     USING GIN (visible_crew_ids);
CREATE INDEX IF NOT EXISTS idx_sessions_visible_crew_ids        ON public.sessions        USING GIN (visible_crew_ids);
CREATE INDEX IF NOT EXISTS idx_calendar_events_visible_crew_ids ON public.calendar_events USING GIN (visible_crew_ids);

-- -------- Active character per player --------
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS active_character_id UUID REFERENCES public.characters(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_players_active_character_id ON public.players(active_character_id);
