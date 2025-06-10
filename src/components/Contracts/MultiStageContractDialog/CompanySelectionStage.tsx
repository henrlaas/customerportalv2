
import React, { useState } from 'react';
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
  const [searchInput, setSearchInput] = useState('');

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies-for-contracts', searchInput],
    queryFn: async () => {
      let query = supabase
        .from('companies')
        .select('id, name, organization_number, street_address, postal_code, city, country, website, logo_url, mrr')
        .order('name');
      
      // If there's a search input, filter by name, otherwise show first 5 companies
      if (searchInput.trim()) {
        query = query.ilike('name', `%${searchInput}%`);
      }
      
      // Limit to 5 results to prevent overflow
      query = query.limit(5);
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });

  const companyOptions: CompanyOption[] = companies.map(company => ({
    value: company.id,
    label: company.name,
    company: company
  }));

  const customOption = (props: any) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div 
        ref={innerRef} 
        {...innerProps} 
        className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
      >
        <CompanyFavicon 
          companyName={data.company.name}
          website={data.company.website}
          logoUrl={data.company.logo_url}
          size="sm"
        />
        <span>{data.label}</span>
      </div>
    );
  };

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

  const customNoOptionsMessage = () => (
    <div className="p-3 text-sm text-gray-500">
      {searchInput.trim() ? 'No companies found. Try a different search term.' : 'Type to search for more companies...'}
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Company</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the company for this contract. Type to search through your companies.
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
          onInputChange={(inputValue) => {
            setSearchInput(inputValue);
          }}
          components={{
            Option: customOption,
            SingleValue: customSingleValue,
            NoOptionsMessage: customNoOptionsMessage
          }}
          placeholder="Search and select a company..."
          noOptionsMessage={customNoOptionsMessage}
          isSearchable
          className="react-select-container"
          classNamePrefix="react-select"
          styles={{
            control: (baseStyles, state) => ({
              ...baseStyles,
              minHeight: '44px',
              height: '44px',
              borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--border))',
              boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--ring))' : 'none',
              '&:hover': {
                borderColor: 'hsl(var(--border))'
              }
            }),
            valueContainer: (baseStyles) => ({
              ...baseStyles,
              height: '44px',
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center'
            }),
            input: (baseStyles) => ({
              ...baseStyles,
              margin: 0,
              padding: 0
            }),
            indicatorsContainer: (baseStyles) => ({
              ...baseStyles,
              height: '44px'
            }),
            menu: (baseStyles) => ({
              ...baseStyles,
              zIndex: 50
            }),
            menuList: (baseStyles) => ({
              ...baseStyles,
              maxHeight: '200px'
            })
          }}
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
