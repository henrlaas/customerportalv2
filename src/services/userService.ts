
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  email: string;
  user_metadata: {
    first_name?: string;
    last_name?: string;
    role?: string;
    team?: string;
  };
  created_at: string;
}

export const userService = {
  listUsers: async (): Promise<User[]> => {
    const response = await supabase.functions.invoke('user-management', {
      body: { action: 'list' }
    });
    
    if (response.error) {
      throw new Error(response.error.message || 'Error fetching users');
    }
    
    return response.data.users || [];
  },

  deleteUser: async (userId: string): Promise<any> => {
    const response = await supabase.functions.invoke('user-management', {
      body: {
        action: 'delete',
        userId,
      },
    });
    
    if (response.error) {
      throw new Error(response.error.message || 'Error deleting user');
    }
    
    return response.data;
  },

  resetPassword: async (email: string): Promise<any> => {
    const response = await supabase.functions.invoke('user-management', {
      body: {
        action: 'resetPassword',
        email,
      },
    });
    
    if (response.error) {
      throw new Error(response.error.message || 'Error sending password reset');
    }
    
    return response.data;
  }
};
