
-- Step 1: Disable RLS temporarily to ensure we can clean everything
ALTER TABLE public.project_documents DISABLE ROW LEVEL SECURITY;

-- Step 2: Force drop ALL existing policies with CASCADE
DROP POLICY IF EXISTS "Users can upload project documents" ON public.project_documents CASCADE;
DROP POLICY IF EXISTS "Authenticated users can upload project documents" ON public.project_documents CASCADE;
DROP POLICY IF EXISTS "Users can delete their own project documents" ON public.project_documents CASCADE;
DROP POLICY IF EXISTS "Authenticated users can view project documents" ON public.project_documents CASCADE;
DROP POLICY IF EXISTS "Users can view project documents" ON public.project_documents CASCADE;
DROP POLICY IF EXISTS "Authenticated users can insert project documents" ON public.project_documents CASCADE;
DROP POLICY IF EXISTS "authenticated_insert_project_documents" ON public.project_documents CASCADE;
DROP POLICY IF EXISTS "authenticated_select_project_documents" ON public.project_documents CASCADE;
DROP POLICY IF EXISTS "authenticated_delete_project_documents" ON public.project_documents CASCADE;

-- Drop any other possible policy names
DROP POLICY IF EXISTS "project_documents_insert_policy" ON public.project_documents CASCADE;
DROP POLICY IF EXISTS "project_documents_select_policy" ON public.project_documents CASCADE;
DROP POLICY IF EXISTS "project_documents_delete_policy" ON public.project_documents CASCADE;
DROP POLICY IF EXISTS "project_documents_policy" ON public.project_documents CASCADE;

-- Step 3: Ensure uploaded_by column is properly configured
ALTER TABLE public.project_documents 
ALTER COLUMN uploaded_by SET NOT NULL,
ALTER COLUMN uploaded_by SET DEFAULT auth.uid();

-- Step 4: Re-enable RLS
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- Step 5: Create minimal, clean policies for authenticated users only
CREATE POLICY "auth_users_can_insert_documents" ON public.project_documents
FOR INSERT 
TO authenticated
WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "auth_users_can_view_documents" ON public.project_documents
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "auth_users_can_delete_own_documents" ON public.project_documents
FOR DELETE 
TO authenticated
USING (uploaded_by = auth.uid());

-- Step 6: Ensure storage bucket exists and has proper policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-documents', 'project-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Step 7: Create storage policies for the bucket
CREATE POLICY "Authenticated users can upload to project-documents" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'project-documents');

CREATE POLICY "Anyone can view project documents" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'project-documents');

CREATE POLICY "Users can delete their own project documents from storage" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'project-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
