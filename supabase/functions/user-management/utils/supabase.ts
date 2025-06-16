
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Create a Supabase admin client for server operations
export const createAdminClient = () => {
  return createClient(
    Deno.env.get('NEW_SUPABASE_URL') ?? '',
    Deno.env.get('NEW_SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
