
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
    
    // Prepare update data object with non-null values
    const updateData: Record<string, any> = {
      id: userId, // Ensure ID is set for upsert
      updated_at: new Date().toISOString()
    };
    
    // Only add fields that are provided and not undefined
    if (userData.firstName !== undefined) updateData.first_name = userData.firstName;
    if (userData.lastName !== undefined) updateData.last_name = userData.lastName;
    if (userData.phoneNumber !== undefined) updateData.phone_number = userData.phoneNumber;
    if (userData.language !== undefined) updateData.language = userData.language || 'en';
    if (userData.team !== undefined) updateData.team = userData.team;
    
    // If profile doesn't exist, add created_at
    if (!existingProfile) {
      updateData.created_at = new Date().toISOString();
    }

    // Log the data we're about to upsert
    console.log("Profile data to upsert:", updateData);

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
