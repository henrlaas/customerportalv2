
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FormData } from './types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TemplateSelectionStageProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

export function TemplateSelectionStage({ formData, setFormData }: TemplateSelectionStageProps) {
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['contract-templates-excluding-project'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .neq('type', 'Project') // Exclude Project templates
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Contract Template</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the type of contract you want to create
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No contract templates available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(template => {
            const isSelected = formData.template?.id === template.id;
            
            return (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary border-primary' : ''
                }`}
                onClick={() => setFormData({ ...formData, template })}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.content.substring(0, 150)}...
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center ml-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
