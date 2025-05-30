
import { useState } from 'react';
import Select from 'react-select';
import { Checkbox } from '@/components/ui/checkbox';
import { Company } from '@/types/company';
import { CompanyFavicon } from '@/components/CompanyFavicon';

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
  // Group companies by parent for better structure
  const parentCompanies = companies.filter(company => !company.parent_id);
  const subsidiaryCompanies = companies.filter(company => !!company.parent_id);

  // Create structured options based on showSubsidiaries toggle
  const createOptions = () => {
    if (!showSubsidiaries) {
      // Only show parent companies
      return parentCompanies.map(company => ({
        value: company.id,
        label: company.name,
        website: company.website,
        logoUrl: company.logo_url,
        isSubsidiary: false,
        parentName: null,
      }));
    }

    // Show all companies with better structure
    const options: any[] = [];
    
    // Add parent companies first
    parentCompanies.forEach(parent => {
      options.push({
        value: parent.id,
        label: parent.name,
        website: parent.website,
        logoUrl: parent.logo_url,
        isSubsidiary: false,
        parentName: null,
      });

      // Add subsidiaries of this parent
      const childCompanies = subsidiaryCompanies.filter(sub => sub.parent_id === parent.id);
      childCompanies.forEach(child => {
        options.push({
          value: child.id,
          label: child.name,
          website: child.website,
          logoUrl: child.logo_url,
          isSubsidiary: true,
          parentName: parent.name,
        });
      });
    });

    // Add any orphaned subsidiaries (subsidiaries without a parent in the current list)
    const orphanedSubsidiaries = subsidiaryCompanies.filter(sub => 
      !parentCompanies.some(parent => parent.id === sub.parent_id)
    );
    orphanedSubsidiaries.forEach(orphan => {
      options.push({
        value: orphan.id,
        label: orphan.name,
        website: orphan.website,
        logoUrl: orphan.logo_url,
        isSubsidiary: true,
        parentName: null,
      });
    });

    return options;
  };

  const options = createOptions();
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
          formatOptionLabel={({ label, website, logoUrl, isSubsidiary, parentName }) => (
            <div className={`flex items-center ${isSubsidiary ? 'pl-6' : ''}`}>
              <div className="flex items-center space-x-2 flex-1">
                <CompanyFavicon 
                  companyName={label}
                  website={website}
                  logoUrl={logoUrl}
                  size="sm"
                />
                <div className="flex flex-col">
                  <span className={isSubsidiary ? "text-sm" : ""}>{label}</span>
                  {isSubsidiary && parentName && (
                    <span className="text-xs text-muted-foreground">
                      Subsidiary of {parentName}
                    </span>
                  )}
                  {isSubsidiary && !parentName && (
                    <span className="text-xs text-muted-foreground">(subsidiary)</span>
                  )}
                </div>
              </div>
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
              color: 'hsl(var(--foreground))',
              padding: '8px 12px'
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
