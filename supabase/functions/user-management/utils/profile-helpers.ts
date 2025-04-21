
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

export const updateUserProfile = async (
  supabaseAdmin: SupabaseClient,
  userId: string,
  userData: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    language?: string;
    team?: string;
  }
) => {
  try {
    // Prepare update data object
    const updateData: Record<string, any> = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone_number: userData.phoneNumber,
      language: userData.language || 'en'
    };
    
    // Add team if provided
    if (userData.team) {
      updateData.team = userData.team;
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user profile:', error.message);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateUserProfile:', error.message);
    throw error;
  }
};
