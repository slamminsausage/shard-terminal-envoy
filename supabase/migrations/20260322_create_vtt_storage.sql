-- Create storage buckets for VTT map and token images
-- These replace base64 data URLs stored in localStorage

-- vtt_maps bucket: map background images
INSERT INTO storage.buckets (id, name, public)
VALUES ('vtt_maps', 'vtt_maps', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access for VTT Maps"
ON storage.objects FOR SELECT
USING (bucket_id = 'vtt_maps');

CREATE POLICY "Authenticated users can upload VTT maps"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vtt_maps');

CREATE POLICY "Anonymous users can upload VTT maps"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vtt_maps');

CREATE POLICY "Authenticated users can update VTT maps"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vtt_maps');

CREATE POLICY "Anonymous users can update VTT maps"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vtt_maps');

CREATE POLICY "Authenticated users can delete VTT maps"
ON storage.objects FOR DELETE
USING (bucket_id = 'vtt_maps');

CREATE POLICY "Anonymous users can delete VTT maps"
ON storage.objects FOR DELETE
USING (bucket_id = 'vtt_maps');

-- vtt_token_images bucket: token portrait images
INSERT INTO storage.buckets (id, name, public)
VALUES ('vtt_token_images', 'vtt_token_images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access for VTT Token Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'vtt_token_images');

CREATE POLICY "Authenticated users can upload VTT token images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vtt_token_images');

CREATE POLICY "Anonymous users can upload VTT token images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vtt_token_images');

CREATE POLICY "Authenticated users can update VTT token images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vtt_token_images');

CREATE POLICY "Anonymous users can update VTT token images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vtt_token_images');

CREATE POLICY "Authenticated users can delete VTT token images"
ON storage.objects FOR DELETE
USING (bucket_id = 'vtt_token_images');

CREATE POLICY "Anonymous users can delete VTT token images"
ON storage.objects FOR DELETE
USING (bucket_id = 'vtt_token_images');
