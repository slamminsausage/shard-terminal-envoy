-- Create world_notes table for campaign notes and world information
-- Stores notes, descriptions, and metadata for specific star system hexes
CREATE TABLE public.world_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sector TEXT NOT NULL,
  hex TEXT NOT NULL,
  world_name TEXT,

  -- Status & Classification
  status TEXT DEFAULT 'UNKNOWN',
  tags TEXT,

  -- Enhanced Notes Structure
  planet_description TEXT,      -- General planet info (player-visible)
  custom_notes TEXT,             -- Campaign/session notes (player-visible)
  gm_notes TEXT,                 -- GM-only notes (for future GM mode)

  -- Legacy fields (keep for compatibility)
  summary TEXT,
  patrons TEXT,

  -- Metadata
  gm_only BOOLEAN DEFAULT false,
  last_visited TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  UNIQUE(sector, hex)
);

-- Enable RLS
ALTER TABLE public.world_notes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (global access for campaign mode)
CREATE POLICY "Allow all operations on world_notes"
ON public.world_notes
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_world_notes_updated_at
  BEFORE UPDATE ON public.world_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for fast lookups
CREATE INDEX idx_world_notes_sector ON public.world_notes(sector);
CREATE INDEX idx_world_notes_hex ON public.world_notes(hex);
CREATE INDEX idx_world_notes_sector_hex ON public.world_notes(sector, hex);
CREATE INDEX idx_world_notes_status ON public.world_notes(status);
