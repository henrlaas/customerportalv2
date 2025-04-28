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
    // Use upsert to handle both new and existing profiles
    const { error } = await supabaseClient
      .from('profiles')
      .upsert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        language,
        team,
        // Only set role if it doesn't already exist (don't overwrite existing roles)
        ...(team === 'Employees' ? { role: 'employee' } : {})
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error updating profile in database:', error);
      throw error;
    }

    console.log(`Profile for user ${userId} updated successfully`);
    return true;
  } catch (error) {
    console.error('Exception in updateUserProfile:', error);
    throw error;
  }
};
