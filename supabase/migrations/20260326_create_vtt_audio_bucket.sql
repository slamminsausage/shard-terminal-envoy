-- Create storage bucket for VTT custom audio files
-- Matches the pattern used for vtt_maps and vtt_token_images in 20260322_create_vtt_storage.sql

-- vtt_audio bucket: user-uploaded audio files (ambient, music, sfx, story)
INSERT INTO storage.buckets (id, name, public)
VALUES ('vtt_audio', 'vtt_audio', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access for VTT Audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'vtt_audio');

CREATE POLICY "Authenticated users can upload VTT audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vtt_audio');

CREATE POLICY "Anonymous users can upload VTT audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vtt_audio');

CREATE POLICY "Authenticated users can update VTT audio"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vtt_audio');

CREATE POLICY "Anonymous users can update VTT audio"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vtt_audio');

CREATE POLICY "Authenticated users can delete VTT audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'vtt_audio');

CREATE POLICY "Anonymous users can delete VTT audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'vtt_audio');
