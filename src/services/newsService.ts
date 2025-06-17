
import { supabase } from '@/integrations/supabase/client';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  banner_subtitle?: string;
  image_banner?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNewsData {
  title: string;
  description: string;
  banner_subtitle?: string;
  image_banner?: string;
}

export interface UpdateNewsData {
  title?: string;
  description?: string;
  banner_subtitle?: string;
  image_banner?: string;
}

export const newsService = {
  async getAll(): Promise<NewsItem[]> {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<NewsItem | null> {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(newsData: CreateNewsData): Promise<NewsItem> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from('news')
      .insert({
        ...newsData,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, newsData: UpdateNewsData): Promise<NewsItem> {
    const { data, error } = await supabase
      .from('news')
      .update({
        ...newsData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async uploadBanner(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('news-banners')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('news-banners')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async deleteBanner(imageUrl: string): Promise<void> {
    // Extract the file path from the URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    const { error } = await supabase.storage
      .from('news-banners')
      .remove([fileName]);

    if (error) throw error;
  }
};
