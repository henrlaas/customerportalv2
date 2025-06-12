
-- Create project_documents table
CREATE TABLE public.project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for project documents
CREATE POLICY "Users can view project documents they have access to" 
  ON public.project_documents 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_documents.project_id
    )
  );

CREATE POLICY "Users can insert project documents" 
  ON public.project_documents 
  FOR INSERT 
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own project documents" 
  ON public.project_documents 
  FOR UPDATE 
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own project documents" 
  ON public.project_documents 
  FOR DELETE 
  USING (auth.uid() = uploaded_by);

-- Create storage bucket for project documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-documents', 'project-documents', false);

-- Create storage policies
CREATE POLICY "Users can view project documents in storage" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'project-documents');

CREATE POLICY "Users can upload project documents" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'project-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their project documents in storage" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'project-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their project documents in storage" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'project-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
