
-- Force drop ALL policies on project_documents table using CASCADE to ensure complete cleanup
DROP POLICY IF EXISTS "Users can upload project documents" ON public.project_documents CASCADE;
DROP POLICY IF EXISTS "Authenticated users can upload project documents" ON public.project_documents CASCADE;
DROP POLICY IF EXISTS "Users can delete their own project documents" ON public.project_documents CASCADE;
DROP POLICY IF EXISTS "Authenticated users can view project documents" ON public.project_documents CASCADE;
DROP POLICY IF EXISTS "Users can view project documents" ON public.project_documents CASCADE;
DROP POLICY IF EXISTS "Authenticated users can insert project documents" ON public.project_documents CASCADE;

-- Also drop any policies that might exist with different names
DROP POLICY IF EXISTS "project_documents_insert_policy" ON public.project_documents CASCADE;
DROP POLICY IF EXISTS "project_documents_select_policy" ON public.project_documents CASCADE;
DROP POLICY IF EXISTS "project_documents_delete_policy" ON public.project_documents CASCADE;

-- Ensure uploaded_by column is properly configured
ALTER TABLE public.project_documents 
ALTER COLUMN uploaded_by SET NOT NULL,
ALTER COLUMN uploaded_by SET DEFAULT auth.uid();

-- Create a single, clean set of policies targeting only authenticated users
CREATE POLICY "authenticated_insert_project_documents" ON public.project_documents
FOR INSERT 
TO authenticated
WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "authenticated_select_project_documents" ON public.project_documents
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "authenticated_delete_project_documents" ON public.project_documents
FOR DELETE 
TO authenticated
USING (uploaded_by = auth.uid());
