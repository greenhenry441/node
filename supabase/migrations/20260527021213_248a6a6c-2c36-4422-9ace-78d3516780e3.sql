CREATE POLICY "Users update own files in user-files bucket"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);