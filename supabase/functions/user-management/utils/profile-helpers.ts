
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
    
    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Error checking existing profile:', fetchError.message);
      throw fetchError;
    }
    
    // Prepare update data object
    const updateData: Record<string, any> = {
      id: userId, // Ensure ID is set for upsert
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone_number: userData.phoneNumber,
      language: userData.language || 'en',
      updated_at: new Date().toISOString()
    };
    
    // Add team if provided
    if (userData.team) {
      updateData.team = userData.team;
    }
    
    // If profile doesn't exist, add created_at
    if (!existingProfile) {
      updateData.created_at = new Date().toISOString();
    }

    // Use upsert to handle both insert and update cases
    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert(updateData)
      .select();

    if (error) {
      console.error('Error updating user profile:', error.message);
      throw error;
    }
    
    console.log(`Profile successfully updated for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error in updateUserProfile:', error instanceof Error ? error.message : String(error));
    throw error;
  }
};
