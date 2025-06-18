
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { workspaceService, WorkspaceSetting } from '@/services/workspaceService';
import { SettingItem } from '@/components/WorkspaceManagement/SettingItem';
import { AddSettingForm } from '@/components/WorkspaceManagement/AddSettingForm';
import { useToast } from '@/hooks/use-toast';
import { DollarSign } from 'lucide-react';

export const PricingTab: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch workspace settings
  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['workspaceSettings'],
    queryFn: () => workspaceService.getSettings(),
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) => 
      workspaceService.updateSetting(id, value),
    onSuccess: () => {
      toast({
        title: 'Setting updated',
        description: 'The workspace setting has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['workspaceSettings'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating setting',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Create setting mutation
  const createSettingMutation = useMutation({
    mutationFn: ({ key, value, description }: { key: string; value: string; description?: string }) => 
      workspaceService.createSetting(key, value, description),
    onSuccess: () => {
      toast({
        title: 'Setting created',
        description: 'The new workspace setting has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['workspaceSettings'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating setting',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSaveSetting = async (id: string, newValue: string) => {
    updateSettingMutation.mutate({ id, value: newValue });
  };

  const handleAddSetting = async (key: string, value: string, description?: string) => {
    createSettingMutation.mutate({ key, value, description });
  };

  // Filter settings that are related to pricing/rates
  const pricingSettings = settings.filter(setting => 
    setting.setting_key.includes('rate') || 
    setting.setting_key.includes('price') || 
    setting.setting_key.includes('cost')
  );

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Pricing Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage hourly rates, pricing tiers, and cost settings for your workspace
          </p>
        </div>
      </div>

      {/* Pricing Settings Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Configuration
          </CardTitle>
          <CardDescription>
            Configure rates and pricing settings that will be used throughout the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {pricingSettings.map((setting) => (
              <SettingItem
                key={setting.id}
                setting={setting}
                onSave={handleSaveSetting}
              />
            ))}
            
            {pricingSettings.length === 0 && (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                No pricing settings found. Add your first pricing setting below.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add New Setting */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Pricing Setting</CardTitle>
          <CardDescription>
            Create a new pricing setting for rates, costs, or other monetary values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddSettingForm onAdd={handleAddSetting} />
        </CardContent>
      </Card>
    </div>
  );
};
