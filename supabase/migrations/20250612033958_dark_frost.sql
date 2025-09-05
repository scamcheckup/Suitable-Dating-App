-- Create storage bucket for verification photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-photos', 'verification-photos', true);

-- Set up RLS policies for verification photos bucket
CREATE POLICY "Users can upload their own verification photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'verification-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own verification photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'verification-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own verification photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'verification-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public access to verification photos for admin review
CREATE POLICY "Public can view verification photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'verification-photos');