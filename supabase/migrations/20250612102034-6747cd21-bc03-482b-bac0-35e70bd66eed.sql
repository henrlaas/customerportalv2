
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can upload project documents" ON public.project_documents;
DROP POLICY IF EXISTS "Users can view project documents" ON public.project_documents;

-- Create simplified INSERT policy for authenticated users
CREATE POLICY "Authenticated users can upload project documents" ON public.project_documents
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND 
  uploaded_by = auth.uid()
);

-- Create simplified SELECT policy for authenticated users
CREATE POLICY "Authenticated users can view project documents" ON public.project_documents
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Ensure the existing DELETE policy remains (users can delete their own documents)
-- The policy "Users can delete their own project documents" should already exist
