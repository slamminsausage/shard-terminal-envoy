-- VTT Asset System: storage bucket + map assets table
-- Allows GMs to upload images (JPEG/PNG/GIF) and place them on the tactical map

-- vtt_assets storage bucket for GM-uploaded scatter terrain, bodies, etc.
INSERT INTO storage.buckets (id, name, public)
VALUES ('vtt_assets', 'vtt_assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read for VTT assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'vtt_assets');

CREATE POLICY "Anyone can upload VTT assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vtt_assets');

CREATE POLICY "Anyone can update VTT assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vtt_assets');

CREATE POLICY "Anyone can delete VTT assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'vtt_assets');

-- Placed asset instances on the tactical map
CREATE TABLE IF NOT EXISTS vtt_map_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_state_id TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  svg_x FLOAT NOT NULL DEFAULT 0,
  svg_y FLOAT NOT NULL DEFAULT 0,
  width FLOAT NOT NULL DEFAULT 100,
  height FLOAT NOT NULL DEFAULT 100,
  rotation FLOAT NOT NULL DEFAULT 0,
  z_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vtt_map_assets_bridge_state_id ON vtt_map_assets(bridge_state_id);

-- RLS: open access (matches existing bridge table patterns)
ALTER TABLE vtt_map_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for map assets"
ON vtt_map_assets FOR SELECT USING (true);

CREATE POLICY "Public insert for map assets"
ON vtt_map_assets FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update for map assets"
ON vtt_map_assets FOR UPDATE USING (true);

CREATE POLICY "Public delete for map assets"
ON vtt_map_assets FOR DELETE USING (true);
