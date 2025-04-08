
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vjqbgnjeuvuxvuruewyc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqcWJnbmpldXZ1eHZ1cnVld3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NTA5MDIsImV4cCI6MjA1OTUyNjkwMn0.MvXDNmHq771t4TbZrrnaylqBoTcEONv0qv31sZYmAA8";

// Get current site URL dynamically
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : '';

// Create a custom type that extends the Database type with our tables that might not be in the types.ts yet
type CustomDatabase = Database & {
  public: {
    Tables: {
      task_attachments: {
        Row: {
          id: string;
          task_id: string;
          file_name: string;
          file_size: number;
          file_type: string;
          file_url: string;
          created_at: string | null;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          task_id: string;
          file_name: string;
          file_size: number;
          file_type: string;
          file_url: string;
          created_at?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          task_id?: string;
          file_name?: string;
          file_size?: number;
          file_type?: string;
          file_url?: string;
          created_at?: string | null;
          created_by?: string | null;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          due_date: string | null;
          campaign_id: string | null;
          assigned_to: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          client_visible: boolean | null;
          related_type: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          campaign_id?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          client_visible?: boolean | null;
          related_type?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          campaign_id?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          client_visible?: boolean | null;
          related_type?: string | null;
        };
      };
      company_contacts: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          position: string | null;
          is_primary: boolean;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id: string;
          position?: string | null;
          is_primary?: boolean;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          user_id?: string;
          position?: string | null;
          is_primary?: boolean;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    } & Database['public']['Tables'];
  };
}

export const supabase = createClient<CustomDatabase>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Explicitly define the storage mechanism
    storage: typeof localStorage !== 'undefined' ? localStorage : undefined,
  },
  global: {
    headers: {
      'X-Client-Info': 'app-build-magic-wand',
    },
  },
});

// Create attachments bucket if it doesn't exist (will be ignored if exists)
(async () => {
  try {
    await supabase.storage.createBucket('attachments', {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024, // 50MB
    });
    console.log('Attachments bucket created or already exists');
  } catch (error) {
    console.error('Error creating attachments bucket:', error);
  }
})();

// Helper function to add created_by for any table that needs it
export const insertWithUser = async <T extends keyof CustomDatabase["public"]["Tables"]>(
  table: T,
  data: Record<string, any>
) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  return supabase
    .from(table as any)
    .insert({
      ...data,
      created_by: userId
    } as any);
};

// Helper function to update with user check
export const updateWithUser = async <T extends keyof CustomDatabase["public"]["Tables"]>(
  table: T,
  id: string,
  data: Record<string, any>
) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  return supabase
    .from(table as any)
    .update(data as any)
    .eq('id', id as any);
};
