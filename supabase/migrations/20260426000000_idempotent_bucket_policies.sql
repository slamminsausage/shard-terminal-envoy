-- Make existing storage bucket policies safe to re-run.
-- The original *bucket* migrations (20260112_create_handouts_bucket.sql,
-- 20260113000001_create_character_thumbnails_bucket.sql,
-- 20260113000002_create_player_note_thumbnails_bucket.sql,
-- 20260322_create_vtt_storage.sql, 20260326_create_vtt_audio_bucket.sql)
-- use bare `CREATE POLICY`, which fails with `policy ... already exists`
-- if the migration is re-applied during recovery or local resets.
-- Add idempotent DROP POLICY IF EXISTS + CREATE POLICY for the same set
-- of policies so a re-run is a no-op rather than a failure.

DO $$
DECLARE
  policy_record RECORD;
  policies TEXT[][] := ARRAY[
    -- handouts
    ARRAY['Public Access', 'SELECT'],
    ARRAY['Authenticated users can upload handout files', 'INSERT'],
    ARRAY['Authenticated users can update handout files', 'UPDATE'],
    ARRAY['Authenticated users can delete handout files', 'DELETE'],
    -- character_thumbnails
    ARRAY['Public Access for Character Thumbnails', 'SELECT'],
    ARRAY['Authenticated users can upload character thumbnails', 'INSERT'],
    ARRAY['Anonymous users can upload character thumbnails', 'INSERT'],
    ARRAY['Authenticated users can update character thumbnails', 'UPDATE'],
    ARRAY['Anonymous users can update character thumbnails', 'UPDATE'],
    ARRAY['Authenticated users can delete character thumbnails', 'DELETE'],
    ARRAY['Anonymous users can delete character thumbnails', 'DELETE'],
    -- player_note_thumbnails
    ARRAY['Public Access for Player Note Thumbnails', 'SELECT'],
    ARRAY['Authenticated users can upload player note thumbnails', 'INSERT'],
    ARRAY['Anonymous users can upload player note thumbnails', 'INSERT'],
    ARRAY['Authenticated users can update player note thumbnails', 'UPDATE'],
    ARRAY['Anonymous users can update player note thumbnails', 'UPDATE'],
    ARRAY['Authenticated users can delete player note thumbnails', 'DELETE'],
    ARRAY['Anonymous users can delete player note thumbnails', 'DELETE'],
    -- vtt_maps
    ARRAY['Public Access for VTT Maps', 'SELECT'],
    ARRAY['Authenticated users can upload VTT maps', 'INSERT'],
    ARRAY['Anonymous users can upload VTT maps', 'INSERT'],
    ARRAY['Authenticated users can update VTT maps', 'UPDATE'],
    ARRAY['Anonymous users can update VTT maps', 'UPDATE'],
    ARRAY['Authenticated users can delete VTT maps', 'DELETE'],
    ARRAY['Anonymous users can delete VTT maps', 'DELETE'],
    -- vtt_token_images
    ARRAY['Public Access for VTT Token Images', 'SELECT'],
    ARRAY['Authenticated users can upload VTT token images', 'INSERT'],
    ARRAY['Anonymous users can upload VTT token images', 'INSERT'],
    ARRAY['Authenticated users can update VTT token images', 'UPDATE'],
    ARRAY['Anonymous users can update VTT token images', 'UPDATE'],
    ARRAY['Authenticated users can delete VTT token images', 'DELETE'],
    ARRAY['Anonymous users can delete VTT token images', 'DELETE'],
    -- vtt_audio
    ARRAY['Public Access for VTT Audio', 'SELECT'],
    ARRAY['Authenticated users can upload VTT audio', 'INSERT'],
    ARRAY['Anonymous users can upload VTT audio', 'INSERT'],
    ARRAY['Authenticated users can update VTT audio', 'UPDATE'],
    ARRAY['Anonymous users can update VTT audio', 'UPDATE'],
    ARRAY['Authenticated users can delete VTT audio', 'DELETE'],
    ARRAY['Anonymous users can delete VTT audio', 'DELETE']
  ];
  i INT;
BEGIN
  FOR i IN 1..array_length(policies, 1) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policies[i][1]);
  END LOOP;
END
$$;

-- Re-create the policies with the same definitions as the originals.

-- handouts
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'handouts');
CREATE POLICY "Authenticated users can upload handout files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'handouts');
CREATE POLICY "Authenticated users can update handout files" ON storage.objects FOR UPDATE USING (bucket_id = 'handouts');
CREATE POLICY "Authenticated users can delete handout files" ON storage.objects FOR DELETE USING (bucket_id = 'handouts');

-- character_thumbnails
CREATE POLICY "Public Access for Character Thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'character_thumbnails');
CREATE POLICY "Authenticated users can upload character thumbnails" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'character_thumbnails');
CREATE POLICY "Anonymous users can upload character thumbnails" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'character_thumbnails');
CREATE POLICY "Authenticated users can update character thumbnails" ON storage.objects FOR UPDATE USING (bucket_id = 'character_thumbnails');
CREATE POLICY "Anonymous users can update character thumbnails" ON storage.objects FOR UPDATE USING (bucket_id = 'character_thumbnails');
CREATE POLICY "Authenticated users can delete character thumbnails" ON storage.objects FOR DELETE USING (bucket_id = 'character_thumbnails');
CREATE POLICY "Anonymous users can delete character thumbnails" ON storage.objects FOR DELETE USING (bucket_id = 'character_thumbnails');

-- player_note_thumbnails
CREATE POLICY "Public Access for Player Note Thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'player_note_thumbnails');
CREATE POLICY "Authenticated users can upload player note thumbnails" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'player_note_thumbnails');
CREATE POLICY "Anonymous users can upload player note thumbnails" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'player_note_thumbnails');
CREATE POLICY "Authenticated users can update player note thumbnails" ON storage.objects FOR UPDATE USING (bucket_id = 'player_note_thumbnails');
CREATE POLICY "Anonymous users can update player note thumbnails" ON storage.objects FOR UPDATE USING (bucket_id = 'player_note_thumbnails');
CREATE POLICY "Authenticated users can delete player note thumbnails" ON storage.objects FOR DELETE USING (bucket_id = 'player_note_thumbnails');
CREATE POLICY "Anonymous users can delete player note thumbnails" ON storage.objects FOR DELETE USING (bucket_id = 'player_note_thumbnails');

-- vtt_maps
CREATE POLICY "Public Access for VTT Maps" ON storage.objects FOR SELECT USING (bucket_id = 'vtt_maps');
CREATE POLICY "Authenticated users can upload VTT maps" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vtt_maps');
CREATE POLICY "Anonymous users can upload VTT maps" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vtt_maps');
CREATE POLICY "Authenticated users can update VTT maps" ON storage.objects FOR UPDATE USING (bucket_id = 'vtt_maps');
CREATE POLICY "Anonymous users can update VTT maps" ON storage.objects FOR UPDATE USING (bucket_id = 'vtt_maps');
CREATE POLICY "Authenticated users can delete VTT maps" ON storage.objects FOR DELETE USING (bucket_id = 'vtt_maps');
CREATE POLICY "Anonymous users can delete VTT maps" ON storage.objects FOR DELETE USING (bucket_id = 'vtt_maps');

-- vtt_token_images
CREATE POLICY "Public Access for VTT Token Images" ON storage.objects FOR SELECT USING (bucket_id = 'vtt_token_images');
CREATE POLICY "Authenticated users can upload VTT token images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vtt_token_images');
CREATE POLICY "Anonymous users can upload VTT token images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vtt_token_images');
CREATE POLICY "Authenticated users can update VTT token images" ON storage.objects FOR UPDATE USING (bucket_id = 'vtt_token_images');
CREATE POLICY "Anonymous users can update VTT token images" ON storage.objects FOR UPDATE USING (bucket_id = 'vtt_token_images');
CREATE POLICY "Authenticated users can delete VTT token images" ON storage.objects FOR DELETE USING (bucket_id = 'vtt_token_images');
CREATE POLICY "Anonymous users can delete VTT token images" ON storage.objects FOR DELETE USING (bucket_id = 'vtt_token_images');

-- vtt_audio
CREATE POLICY "Public Access for VTT Audio" ON storage.objects FOR SELECT USING (bucket_id = 'vtt_audio');
CREATE POLICY "Authenticated users can upload VTT audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vtt_audio');
CREATE POLICY "Anonymous users can upload VTT audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vtt_audio');
CREATE POLICY "Authenticated users can update VTT audio" ON storage.objects FOR UPDATE USING (bucket_id = 'vtt_audio');
CREATE POLICY "Anonymous users can update VTT audio" ON storage.objects FOR UPDATE USING (bucket_id = 'vtt_audio');
CREATE POLICY "Authenticated users can delete VTT audio" ON storage.objects FOR DELETE USING (bucket_id = 'vtt_audio');
CREATE POLICY "Anonymous users can delete VTT audio" ON storage.objects FOR DELETE USING (bucket_id = 'vtt_audio');
