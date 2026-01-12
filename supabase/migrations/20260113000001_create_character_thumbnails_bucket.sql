-- Create a storage bucket for character thumbnail images
INSERT INTO storage.buckets (id, name, public)
VALUES ('character_thumbnails', 'character_thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the character_thumbnails bucket
-- Allow anyone to read public files
CREATE POLICY "Public Access for Character Thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'character_thumbnails');

-- Allow authenticated users to upload character thumbnails
CREATE POLICY "Authenticated users can upload character thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'character_thumbnails');

-- Allow anonymous users to upload character thumbnails (for campaign mode)
CREATE POLICY "Anonymous users can upload character thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'character_thumbnails');

-- Allow authenticated users to update character thumbnails
CREATE POLICY "Authenticated users can update character thumbnails"
ON storage.objects FOR UPDATE
USING (bucket_id = 'character_thumbnails');

-- Allow anonymous users to update character thumbnails (for campaign mode)
CREATE POLICY "Anonymous users can update character thumbnails"
ON storage.objects FOR UPDATE
USING (bucket_id = 'character_thumbnails');

-- Allow authenticated users to delete character thumbnails
CREATE POLICY "Authenticated users can delete character thumbnails"
ON storage.objects FOR DELETE
USING (bucket_id = 'character_thumbnails');

-- Allow anonymous users to delete character thumbnails (for campaign mode)
CREATE POLICY "Anonymous users can delete character thumbnails"
ON storage.objects FOR DELETE
USING (bucket_id = 'character_thumbnails');
