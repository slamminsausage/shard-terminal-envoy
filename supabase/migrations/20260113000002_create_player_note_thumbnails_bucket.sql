-- Create a storage bucket for player note thumbnail images (e.g., NPC portraits)
INSERT INTO storage.buckets (id, name, public)
VALUES ('player_note_thumbnails', 'player_note_thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the player_note_thumbnails bucket
-- Allow anyone to read public files
CREATE POLICY "Public Access for Player Note Thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'player_note_thumbnails');

-- Allow authenticated users to upload player note thumbnails
CREATE POLICY "Authenticated users can upload player note thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'player_note_thumbnails');

-- Allow anonymous users to upload player note thumbnails (for campaign mode)
CREATE POLICY "Anonymous users can upload player note thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'player_note_thumbnails');

-- Allow authenticated users to update player note thumbnails
CREATE POLICY "Authenticated users can update player note thumbnails"
ON storage.objects FOR UPDATE
USING (bucket_id = 'player_note_thumbnails');

-- Allow anonymous users to update player note thumbnails (for campaign mode)
CREATE POLICY "Anonymous users can update player note thumbnails"
ON storage.objects FOR UPDATE
USING (bucket_id = 'player_note_thumbnails');

-- Allow authenticated users to delete player note thumbnails
CREATE POLICY "Authenticated users can delete player note thumbnails"
ON storage.objects FOR DELETE
USING (bucket_id = 'player_note_thumbnails');

-- Allow anonymous users to delete player note thumbnails (for campaign mode)
CREATE POLICY "Anonymous users can delete player note thumbnails"
ON storage.objects FOR DELETE
USING (bucket_id = 'player_note_thumbnails');
