
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type Project = {
  id: string;
  name: string;
  description: string | null;
  company_id: string;
  value: number;
  price_type: string;
  deadline: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

export type ProjectWithRelations = Project & {
  company: {
    name: string;
    organization_number?: string | null;
    address?: string | null;
    postal_code?: string | null;
    city?: string | null;
    country?: string | null;
  };
  creator: User;
};

export const useProjects = () => {
  const { profile } = useAuth();
  
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects', profile?.id],
    queryFn: async () => {
      // Build the query based on user role
      let query = supabase
        .from('projects')
        .select(`
          *,
          company:company_id (
            name, 
            organization_number,
            address,
            postal_code,
            city,
            country
          ),
          creator:created_by (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });
      
      // If user is a client, only show projects for their company
      if (profile?.role === 'client') {
        // Get companies where the user is a contact
        const { data: contactData } = await supabase
          .from('company_contacts')
          .select('company_id')
          .eq('user_id', profile.id);
        
        const companyIds = contactData?.map(c => c.company_id) || [];
        
        if (companyIds.length > 0) {
          query = query.in('company_id', companyIds);
        } else {
          // If client has no companies, return empty array
          return [];
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }
      
      return data as unknown as ProjectWithRelations[];
    },
    enabled: !!profile
  });
  
  return {
    projects,
    isLoading,
    error
  };
};
