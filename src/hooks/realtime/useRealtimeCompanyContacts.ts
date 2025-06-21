
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '@/hooks/useRealtime';

interface UseRealtimeCompanyContactsOptions {
  enabled?: boolean;
}

export const useRealtimeCompanyContacts = ({ enabled = true }: UseRealtimeCompanyContactsOptions = {}) => {
  const queryClient = useQueryClient();

  console.log('👥 useRealtimeCompanyContacts: Setting up real-time subscription, enabled:', enabled);

  useRealtime({
    table: 'company_contacts',
    enabled,
    onInsert: (payload) => {
      console.log('👥 useRealtimeCompanyContacts: Company contact inserted:', payload.new);
      queryClient.invalidateQueries({ queryKey: ['companyContacts'] });
      queryClient.invalidateQueries({ queryKey: ['company', payload.new.company_id] });
    },
    onUpdate: (payload) => {
      console.log('👥 useRealtimeCompanyContacts: Company contact updated:', payload.new);
      queryClient.invalidateQueries({ queryKey: ['companyContacts'] });
      queryClient.invalidateQueries({ queryKey: ['company', payload.new.company_id] });
    },
    onDelete: (payload) => {
      console.log('👥 useRealtimeCompanyContacts: Company contact deleted:', payload.old);
      queryClient.invalidateQueries({ queryKey: ['companyContacts'] });
      queryClient.invalidateQueries({ queryKey: ['company', payload.old.company_id] });
    },
  });
};
