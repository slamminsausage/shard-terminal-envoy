-- GM-injected live terminal transmissions
-- Each row is a message the GM pushes to a specific terminal in real-time.

CREATE TABLE IF NOT EXISTS public.terminal_transmissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Which terminal this message appears on
  terminal_code TEXT NOT NULL,

  -- Log content (mirrors the LogEntry shape used by the terminal UI)
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  author TEXT,
  date TEXT,                          -- in-game date string e.g. "1105-04-12"
  location TEXT,
  security_level TEXT NOT NULL DEFAULT 'unlocked',

  -- Soft-delete / expiry (NULL = never expires)
  expires_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_terminal_transmissions_code
  ON public.terminal_transmissions (terminal_code);

CREATE INDEX IF NOT EXISTS idx_terminal_transmissions_created
  ON public.terminal_transmissions (created_at DESC);

ALTER TABLE public.terminal_transmissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on terminal_transmissions"
  ON public.terminal_transmissions FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.terminal_transmissions;
