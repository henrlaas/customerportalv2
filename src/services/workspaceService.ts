
import { supabase } from "@/integrations/supabase/client";

export type WorkspaceSetting = {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export const workspaceService = {
  // Get all workspace settings
  getSettings: async (): Promise<WorkspaceSetting[]> => {
    try {
      // Use type casting to tell TypeScript that the result will be WorkspaceSetting[]
      const { data, error } = await supabase
        .from('workspace_settings')
        .select('*')
        .order('setting_key') as { data: WorkspaceSetting[] | null, error: any };
      
      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Error fetching workspace settings:', error.message);
      throw error;
    }
  },
  
  // Get a specific setting by key
  getSetting: async (key: string): Promise<WorkspaceSetting | null> => {
    try {
      // Use type casting here as well
      const { data, error } = await supabase
        .from('workspace_settings')
        .select('*')
        .eq('setting_key', key)
        .single() as { data: WorkspaceSetting | null, error: any };
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error(`Error fetching setting ${key}:`, error.message);
      throw error;
    }
  },
  
  // Update a setting
  updateSetting: async (id: string, value: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('workspace_settings')
        .update({ 
          setting_value: value,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', id);
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating setting:', error.message);
      throw error;
    }
  },
  
  // Create a new setting
  createSetting: async (key: string, value: string, description?: string): Promise<WorkspaceSetting> => {
    try {
      // Use type casting for the returned data
      const { data, error } = await supabase
        .from('workspace_settings')
        .insert({
          setting_key: key,
          setting_value: value,
          description
        } as any)
        .select()
        .single() as { data: WorkspaceSetting | null, error: any };
      
      if (error) throw error;
      if (!data) throw new Error('No data returned after insert');
      
      return data;
    } catch (error: any) {
      console.error('Error creating setting:', error.message);
      throw error;
    }
  },
  
  // Delete a setting
  deleteSetting: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('workspace_settings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting setting:', error.message);
      throw error;
    }
  }
};
