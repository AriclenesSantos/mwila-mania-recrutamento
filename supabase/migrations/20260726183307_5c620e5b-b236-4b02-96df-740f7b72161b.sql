CREATE POLICY "Anyone can upload candidate photo"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'candidate-photos');

CREATE POLICY "Admins can read candidate photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'candidate-photos' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete candidate photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'candidate-photos' AND public.has_role(auth.uid(), 'admin'::app_role));