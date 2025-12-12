-- Create marker_type enum for predefined marker categories
CREATE TYPE public.marker_type AS ENUM (
  'CUSTOM_PLANET',
  'RESEARCH_STATION',
  'PIRATE_SHIP',
  'CONVOY',
  'MISSION',
  'STORY_POINT',
  'IMPERIAL_VESSEL',
  'TRADE_ROUTE',
  'ANOMALY',
  'WAYPOINT',
  'DANGER_ZONE',
  'RESOURCE',
  'SETTLEMENT',
  'RUINS',
  'CUSTOM'
);

-- Create hex_markers table for custom markers on star map hexes
-- Allows multiple markers per hex with different types and visual styles
CREATE TABLE public.hex_markers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sector TEXT NOT NULL,
  hex TEXT NOT NULL,

  -- Marker Classification
  marker_type public.marker_type NOT NULL DEFAULT 'CUSTOM',
  marker_label TEXT NOT NULL,           -- e.g., "SS Maelstrom", "Research Outpost Alpha"
  marker_icon TEXT,                     -- Icon identifier (emoji or custom icon name)
  marker_color TEXT DEFAULT '#00ff00',  -- Hex color code

  -- Content
  description TEXT,                     -- What players see
  gm_notes TEXT,                        -- GM-only information (for future GM mode)

  -- Metadata
  is_active BOOLEAN DEFAULT true,       -- Can be toggled on/off without deletion
  is_visible_to_players BOOLEAN DEFAULT true,  -- For future GM mode
  display_order INTEGER DEFAULT 0,      -- For sorting multiple markers on same hex

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hex_markers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (global access for campaign mode)
CREATE POLICY "Allow all operations on hex_markers"
ON public.hex_markers
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hex_markers_updated_at
  BEFORE UPDATE ON public.hex_markers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for fast lookups
CREATE INDEX idx_hex_markers_sector ON public.hex_markers(sector);
CREATE INDEX idx_hex_markers_hex ON public.hex_markers(hex);
CREATE INDEX idx_hex_markers_sector_hex ON public.hex_markers(sector, hex);
CREATE INDEX idx_hex_markers_type ON public.hex_markers(marker_type);
CREATE INDEX idx_hex_markers_active ON public.hex_markers(is_active);
CREATE INDEX idx_hex_markers_display_order ON public.hex_markers(display_order);
