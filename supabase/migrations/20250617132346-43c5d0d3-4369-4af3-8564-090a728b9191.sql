
-- Create news table
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_banner TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Create policies for admins and employees to manage news
CREATE POLICY "Admins and employees can view all news" 
  ON public.news 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

CREATE POLICY "Admins and employees can create news" 
  ON public.news 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

CREATE POLICY "Admins and employees can update news" 
  ON public.news 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

CREATE POLICY "Admins and employees can delete news" 
  ON public.news 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

-- Create storage bucket for news banners
INSERT INTO storage.buckets (id, name, public) 
VALUES ('news-banners', 'news-banners', true);

-- Create storage policies for news banners
CREATE POLICY "Admins and employees can upload news banners"
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'news-banners' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

CREATE POLICY "Anyone can view news banners"
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'news-banners');

CREATE POLICY "Admins and employees can update news banners"
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'news-banners' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

CREATE POLICY "Admins and employees can delete news banners"
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'news-banners' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );
