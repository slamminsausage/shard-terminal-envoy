-- VTT assets bucket (maps, audio, handouts, tokens)
-- Public bucket so presenter windows and player devices can fetch assets directly.

INSERT INTO storage.buckets (id, name, public)
VALUES ('vtt-assets', 'vtt-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public reads of VTT assets
CREATE POLICY "VTT assets public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'vtt-assets');

-- Allow uploads (matches the permissive policy used for the handouts bucket)
CREATE POLICY "VTT assets upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vtt-assets');

-- Allow updates (upserts use this path)
CREATE POLICY "VTT assets update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vtt-assets');

-- Allow deletes
CREATE POLICY "VTT assets delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'vtt-assets');
