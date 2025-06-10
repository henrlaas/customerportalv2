
import React from 'react';
import Select from 'react-select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CompanyFavicon } from '@/components/CompanyFavicon';
import { FormData } from './types';

interface CompanySelectionStageProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

interface CompanyOption {
  value: string;
  label: string;
  company: FormData['company'];
}

export function CompanySelectionStage({ formData, setFormData }: CompanySelectionStageProps) {
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies-for-contracts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, organization_number, street_address, postal_code, city, country, website, logo_url, mrr')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const companyOptions: CompanyOption[] = companies.map(company => ({
    value: company.id,
    label: company.name,
    company: company
  }));

  const customOption = ({ data, ...props }: any) => (
    <div ref={props.innerRef} {...props.innerProps} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
      <CompanyFavicon 
        companyName={data.company.name}
        website={data.company.website}
        logoUrl={data.company.logo_url}
        size="sm"
      />
      <span>{data.label}</span>
    </div>
  );

  const customSingleValue = ({ data }: any) => (
    <div className="flex items-center gap-2">
      <CompanyFavicon 
        companyName={data.company.name}
        website={data.company.website}
        logoUrl={data.company.logo_url}
        size="sm"
      />
      <span>{data.label}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Company</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the company for this contract
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Company</label>
        <Select
          isLoading={isLoading}
          options={companyOptions}
          value={formData.company ? companyOptions.find(opt => opt.value === formData.company?.id) : null}
          onChange={(selected) => {
            setFormData({
              ...formData,
              company: selected?.company || null,
              contact: null // Reset contact when company changes
            });
          }}
          components={{
            Option: customOption,
            SingleValue: customSingleValue
          }}
          placeholder="Search and select a company..."
          isSearchable
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      {formData.company && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Selected Company Details</h4>
          <div className="text-sm space-y-1">
            <p><strong>Name:</strong> {formData.company.name}</p>
            {formData.company.organization_number && (
              <p><strong>Organization Number:</strong> {formData.company.organization_number}</p>
            )}
            {formData.company.street_address && (
              <p><strong>Address:</strong> {formData.company.street_address}</p>
            )}
            {formData.company.city && (
              <p><strong>City:</strong> {formData.company.city}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
