
-- Update the project-documents bucket to be public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'project-documents';
