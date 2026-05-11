-- Ensure vehicle cost/hull columns exist (idempotent; safe to re-run)
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS hull_current INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS life_support BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS salaries BIGINT DEFAULT 0;

-- Backfill hull_current for any rows that are still NULL
UPDATE public.vehicles
SET hull_current = hull
WHERE hull_current IS NULL;
