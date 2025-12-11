-- Add missing cost fields to vehicles table
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS life_support BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS salaries BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS hull_current INTEGER DEFAULT NULL;

-- Add comments to explain the columns
COMMENT ON COLUMN public.vehicles.life_support IS 'Monthly life support cost in credits';
COMMENT ON COLUMN public.vehicles.salaries IS 'Monthly crew salaries in credits';
COMMENT ON COLUMN public.vehicles.hull_current IS 'Current hull points (defaults to hull max if not set)';

-- Backfill hull_current for existing vehicles
UPDATE public.vehicles
SET hull_current = hull
WHERE hull_current IS NULL;
