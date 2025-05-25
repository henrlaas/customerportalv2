
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
    console.log(`Updating profile for user ID: ${userId} with data:`, JSON.stringify(userData));
    
    // Prepare update data object
    const updateData: Record<string, any> = {
      id: userId, // Ensure ID is set for upsert
      updated_at: new Date().toISOString()
    };
    
    // Only update fields that are provided
    if (userData.firstName !== undefined) {
      updateData.first_name = userData.firstName;
    }
    if (userData.lastName !== undefined) {
      updateData.last_name = userData.lastName;
    }
    if (userData.phoneNumber !== undefined) {
      updateData.phone_number = userData.phoneNumber;
    }
    if (userData.language !== undefined) {
      updateData.language = userData.language;
    }
    if (userData.team !== undefined) {
      updateData.team = userData.team;
    }

    // Use upsert to handle both insert and update cases
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(updateData, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error('Error updating user profile:', error.message);
      throw error;
    }
    
    console.log(`Profile successfully updated for user ${userId}:`, data);
    return true;
  } catch (error) {
    console.error('Error in updateUserProfile:', error instanceof Error ? error.message : String(error));
    throw error;
  }
};
