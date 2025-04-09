
import { supabase } from "@/integrations/supabase/client";
import { EditUserFormValues } from "@/schemas/userSchemas";

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
    try {
      const response = await supabase.functions.invoke('user-management', {
        body: { action: 'list' }
      });
      
      if (response.error) {
        console.error('Error fetching users:', response.error);
        throw new Error(response.error.message || 'Error fetching users');
      }
      
      return response.data?.users || [];
    } catch (error) {
      console.error('Error in listUsers:', error);
      throw error;
    }
  },

  updateUser: async (userId: string, userData: EditUserFormValues): Promise<any> => {
    try {
      const response = await supabase.functions.invoke('user-management', {
        body: {
          action: 'update',
          userId,
          userData: {
            email: userData.email,
            user_metadata: {
              first_name: userData.firstName,
              last_name: userData.lastName,
              phone_number: userData.phone // Added phone number to user metadata
            }
          }
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Error updating user');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  },

  deleteUser: async (userId: string): Promise<any> => {
    try {
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
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  },

  resetPassword: async (email: string): Promise<any> => {
    try {
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
    } catch (error) {
      console.error('Error in resetPassword:', error);
      throw error;
    }
  }
};
