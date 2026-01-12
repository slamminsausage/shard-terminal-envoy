-- Create a storage bucket for handout media files
INSERT INTO storage.buckets (id, name, public)
VALUES ('handouts', 'handouts', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the handouts bucket
-- Allow anyone to read public files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'handouts');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload handout files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'handouts');

-- Allow authenticated users to update their files
CREATE POLICY "Authenticated users can update handout files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'handouts');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete handout files"
ON storage.objects FOR DELETE
USING (bucket_id = 'handouts');
