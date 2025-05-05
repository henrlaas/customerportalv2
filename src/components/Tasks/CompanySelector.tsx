
import { useState } from 'react';
import Select from 'react-select';
import { Checkbox } from '@/components/ui/checkbox';
import { Company } from '@/types/company';

interface CompanySelectorProps {
  companies: Company[];
  selectedCompanyId: string | null;
  onSelect: (companyId: string | null) => void;
  showSubsidiaries: boolean;
  onToggleSubsidiaries: (show: boolean) => void;
  isLoading?: boolean;
  className?: string;
}

export function CompanySelector({
  companies,
  selectedCompanyId,
  onSelect,
  showSubsidiaries,
  onToggleSubsidiaries,
  isLoading = false,
  className,
}: CompanySelectorProps) {
  // Transform companies data for react-select
  const options = companies.map(company => ({
    value: company.id,
    label: company.name,
    isSubsidiary: !!company.parent_id,
  }));

  // Find the selected option
  const selectedOption = options.find(option => option.value === selectedCompanyId);
  
  return (
    <div className={className}>
      <div className="space-y-2">
        <Select
          className="react-select-container"
          classNamePrefix="react-select"
          options={options}
          value={selectedOption || null}
          onChange={(selected) => onSelect(selected ? selected.value : null)}
          isLoading={isLoading}
          isClearable
          placeholder="Select company..."
          formatOptionLabel={({ label, isSubsidiary }) => (
            <div className="flex items-center">
              <span className={isSubsidiary ? "pl-3" : ""}>{label}</span>
              {isSubsidiary && (
                <span className="ml-2 text-xs text-muted-foreground">(subsidiary)</span>
              )}
            </div>
          )}
          styles={{
            control: (baseStyles) => ({
              ...baseStyles,
              borderColor: 'hsl(var(--input))',
              backgroundColor: 'hsl(var(--background))',
              borderRadius: 'var(--radius)',
              boxShadow: 'none',
              '&:hover': {
                borderColor: 'hsl(var(--input))'
              },
              padding: '1px',
              minHeight: '40px'
            }),
            placeholder: (baseStyles) => ({
              ...baseStyles,
              color: 'hsl(var(--muted-foreground))'
            }),
            menu: (baseStyles) => ({
              ...baseStyles,
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
              zIndex: 50
            }),
            option: (baseStyles, { isFocused, isSelected }) => ({
              ...baseStyles,
              backgroundColor: isFocused 
                ? '#f3f3f3' // Light gray for hover/focus
                : isSelected 
                  ? 'hsl(var(--accent) / 0.2)'
                  : undefined,
              color: 'hsl(var(--foreground))'
            }),
            singleValue: (baseStyles) => ({
              ...baseStyles,
              color: 'hsl(var(--foreground))'
            }),
            input: (baseStyles) => ({
              ...baseStyles,
              color: 'hsl(var(--foreground))'
            }),
            indicatorsContainer: (baseStyles) => ({
              ...baseStyles,
              color: 'hsl(var(--foreground) / 0.5)'
            }),
            dropdownIndicator: (baseStyles) => ({
              ...baseStyles,
              color: 'hsl(var(--foreground) / 0.5)',
              '&:hover': {
                color: 'hsl(var(--foreground) / 0.8)'
              }
            }),
            clearIndicator: (baseStyles) => ({
              ...baseStyles,
              color: 'hsl(var(--foreground) / 0.5)',
              '&:hover': {
                color: 'hsl(var(--foreground) / 0.8)'
              }
            })
          }}
        />
        
        <div className="flex items-center pt-1">
          <Checkbox 
            id="show-subsidiaries"
            checked={showSubsidiaries}
            onCheckedChange={(checked) => onToggleSubsidiaries(!!checked)}
          />
          <label 
            htmlFor="show-subsidiaries" 
            className="ml-2 text-sm cursor-pointer"
          >
            Show subsidiaries
          </label>
        </div>
      </div>
    </div>
  );
}
