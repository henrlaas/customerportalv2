
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
      
      // Process the data to handle errors and ensure types are correct
      return data.map(project => {
        // Ensure the creator field is properly typed even if it's null or an error
        let creator: User;
        
        // First check if project.creator exists at all
        if (project.creator !== null) {
          // Now check if it's a valid object without errors
          if (typeof project.creator === 'object' && 
              !('error' in project.creator)) {
            creator = project.creator as User;
          } else {
            // Create a fallback user object if creator has an error
            creator = {
              id: project.created_by || '',
              first_name: null,
              last_name: null,
              avatar_url: null
            };
          }
        } else {
          // Create a fallback user object if creator is null
          creator = {
            id: project.created_by || '',
            first_name: null,
            last_name: null,
            avatar_url: null
          };
        }
        
        return {
          ...project,
          creator
        };
      }) as ProjectWithRelations[];
    },
    enabled: !!profile
  });
  
  return {
    projects,
    isLoading,
    error
  };
};
