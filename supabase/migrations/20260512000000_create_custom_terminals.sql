-- Custom terminals: GM-created terminals with their own log entries stored in Supabase.
-- These supplement the static TERMINALS array defined in src/lib/terminals.ts.

CREATE TABLE IF NOT EXISTS public.custom_terminals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'default',
  requires_roll INTEGER,
  description TEXT,
  created_by  UUID REFERENCES public.players(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived    BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.custom_terminal_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_code   TEXT NOT NULL REFERENCES public.custom_terminals(code) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  content         TEXT NOT NULL DEFAULT '',
  author          TEXT,
  date            TEXT,
  location        TEXT,
  security_level  TEXT NOT NULL DEFAULT 'unlocked',
  requires_password BOOLEAN NOT NULL DEFAULT FALSE,
  password        TEXT,
  audio_file      TEXT,
  video_file      TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_custom_terminals_code ON public.custom_terminals(code);
CREATE INDEX IF NOT EXISTS idx_custom_terminal_logs_terminal ON public.custom_terminal_logs(terminal_code);
CREATE INDEX IF NOT EXISTS idx_custom_terminal_logs_order ON public.custom_terminal_logs(terminal_code, sort_order);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_custom_terminals_updated_at'
  ) THEN
    CREATE TRIGGER trg_custom_terminals_updated_at
      BEFORE UPDATE ON public.custom_terminals
      FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_custom_terminal_logs_updated_at'
  ) THEN
    CREATE TRIGGER trg_custom_terminal_logs_updated_at
      BEFORE UPDATE ON public.custom_terminal_logs
      FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
  END IF;
END $$;

-- RLS
ALTER TABLE public.custom_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_terminal_logs ENABLE ROW LEVEL SECURITY;

-- Open access (GM gate enforced in app layer), consistent with all other tables in this codebase
DROP POLICY IF EXISTS "custom_terminals_read" ON public.custom_terminals;
DROP POLICY IF EXISTS "custom_terminals_write" ON public.custom_terminals;
CREATE POLICY "Allow all operations on custom_terminals"
  ON public.custom_terminals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "custom_terminal_logs_read" ON public.custom_terminal_logs;
DROP POLICY IF EXISTS "custom_terminal_logs_write" ON public.custom_terminal_logs;
CREATE POLICY "Allow all operations on custom_terminal_logs"
  ON public.custom_terminal_logs FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_terminals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_terminal_logs;
