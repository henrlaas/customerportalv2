
-- First, drop all existing policies on project_documents to clean up completely
DROP POLICY IF EXISTS "Users can upload project documents" ON public.project_documents;
DROP POLICY IF EXISTS "Authenticated users can upload project documents" ON public.project_documents;
DROP POLICY IF EXISTS "Users can delete their own project documents" ON public.project_documents;
DROP POLICY IF EXISTS "Authenticated users can view project documents" ON public.project_documents;
DROP POLICY IF EXISTS "Users can view project documents" ON public.project_documents;

-- Make uploaded_by column NOT NULL since it's essential for RLS
ALTER TABLE public.project_documents 
ALTER COLUMN uploaded_by SET NOT NULL,
ALTER COLUMN uploaded_by SET DEFAULT auth.uid();

-- Create clean, non-conflicting policies
CREATE POLICY "Authenticated users can insert project documents" ON public.project_documents
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.role() = 'authenticated' AND 
  uploaded_by = auth.uid()
);

CREATE POLICY "Authenticated users can view project documents" ON public.project_documents
FOR SELECT 
TO authenticated
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own project documents" ON public.project_documents
FOR DELETE 
TO authenticated
USING (uploaded_by = auth.uid());
