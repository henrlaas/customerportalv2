
// This file exists in the project but I need to check and update it to ensure it properly handles profile data
export interface ProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  language?: string;
  team?: string;
}

export const updateUserProfile = async (
  supabaseClient: any,
  userId: string,
  profileData: ProfileData
) => {
  const { firstName, lastName, phoneNumber, language, team } = profileData;

  console.log(`Updating profile for user ${userId} with data:`, JSON.stringify({
    firstName,
    lastName,
    phoneNumber,
    language,
    team
  }));

  try {
    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error('Error checking for existing profile:', checkError);
      throw checkError;
    }

    const profileExists = !!existingProfile;
    console.log(`Profile for user ${userId} ${profileExists ? 'exists' : 'does not exist'}`);

    let result;
    const profilePayload = {
      id: userId,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      language,
      team,
      // Only set role if it doesn't exist in the existing profile (don't overwrite existing roles)
      ...(profileExists ? {} : (team === 'Employees' ? { role: 'employee' } : {}))
    };

    // Log the payload we're about to use
    console.log(`Profile payload for ${userId}:`, JSON.stringify(profilePayload));

    if (profileExists) {
      // Update existing profile
      console.log(`Updating existing profile for user ${userId}`);
      const { data, error } = await supabaseClient
        .from('profiles')
        .update(profilePayload)
        .eq('id', userId)
        .select();
        
      if (error) {
        console.error('Error updating profile in database:', error);
        throw error;
      }
      result = data;
    } else {
      // Insert new profile
      console.log(`Creating new profile for user ${userId}`);
      const { data, error } = await supabaseClient
        .from('profiles')
        .insert(profilePayload)
        .select();

      if (error) {
        console.error('Error inserting profile in database:', error);
        throw error;
      }
      result = data;
    }

    console.log(`Profile for user ${userId} updated successfully`, result);
    return result;
  } catch (error) {
    console.error('Exception in updateUserProfile:', error);
    throw error;
  }
};
