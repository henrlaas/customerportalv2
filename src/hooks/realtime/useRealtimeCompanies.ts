
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '@/hooks/useRealtime';

interface UseRealtimeCompaniesOptions {
  enabled?: boolean;
}

export const useRealtimeCompanies = ({ enabled = true }: UseRealtimeCompaniesOptions = {}) => {
  const queryClient = useQueryClient();

  console.log('🏢 useRealtimeCompanies: Setting up real-time subscription, enabled:', enabled);

  useRealtime({
    table: 'companies',
    enabled,
    onInsert: (payload) => {
      console.log('🏢 useRealtimeCompanies: Company inserted:', payload.new);
      queryClient.invalidateQueries({ queryKey: ['companyList'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onUpdate: (payload) => {
      console.log('🏢 useRealtimeCompanies: Company updated:', payload.new);
      queryClient.invalidateQueries({ queryKey: ['companyList'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company', payload.new.id] });
    },
    onDelete: (payload) => {
      console.log('🏢 useRealtimeCompanies: Company deleted:', payload.old);
      queryClient.invalidateQueries({ queryKey: ['companyList'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};
