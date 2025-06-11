
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProjectWithRelations } from '@/hooks/useProjects';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ConfirmationStageProps {
  form: UseFormReturn<any>;
  project: ProjectWithRelations;
}

export const ConfirmationStage: React.FC<ConfirmationStageProps> = ({ form, project }) => {
  const formData = form.getValues();

  // Fetch company and user details for display
  const { data: company } = useQuery({
    queryKey: ['company', formData.company_id],
    queryFn: async () => {
      if (!formData.company_id) return null;
      const { data, error } = await supabase
        .from('companies')
        .select('name')
        .eq('id', formData.company_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!formData.company_id
  });

  const { data: assignees = [] } = useQuery({
    queryKey: ['assignees-details', formData.assignees],
    queryFn: async () => {
      if (!formData.assignees || formData.assignees.length === 0) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', formData.assignees);
      
      if (error) throw error;
      return data;
    },
    enabled: !!formData.assignees && formData.assignees.length > 0
  });

  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'Not specified';
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatPriceType = (priceType: string) => {
    if (!priceType) return 'Not specified';
    return priceType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No deadline set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Confirm Changes</h3>
      <p className="text-sm text-gray-600">
        Please review your changes before saving.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-gray-700">Project Name</h4>
            <p className="text-sm">{formData.name}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-700">Company</h4>
            <p className="text-sm">{company?.name || 'Loading...'}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-700">Description</h4>
          <p className="text-sm">{formData.description || 'No description'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-gray-700">Value</h4>
            <p className="text-sm">{formatCurrency(formData.value)}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-700">Price Type</h4>
            <p className="text-sm">{formatPriceType(formData.price_type)}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-700">Deadline</h4>
          <p className="text-sm">{formatDate(formData.deadline)}</p>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-700">Team Members</h4>
          <div className="flex flex-wrap gap-2 mt-1">
            {assignees.length > 0 ? (
              assignees.map((assignee) => (
                <Badge key={assignee.id} variant="outline">
                  {`${assignee.first_name || ''} ${assignee.last_name || ''}`.trim() || 'Unknown User'}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-gray-500">No team members assigned</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
