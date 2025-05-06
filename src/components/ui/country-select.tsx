
import React, { useState } from 'react';
import Select, { StylesConfig, components } from 'react-select';
import { countries, Country, DEFAULT_COUNTRY } from '@/lib/countries';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { FormDescription, FormMessage } from './form';

// Option type for react-select
interface Option {
  value: string;
  label: string;
  country: Country;
}

// Component props
interface CountrySelectProps {
  value?: string;
  onChange: (value: string) => void;
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  error?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
}

// Custom Option component to show flag emoji with country name
const Option = (props: any) => {
  return (
    <components.Option {...props}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{props.data.country.flag}</span>
        <span>{props.data.label}</span>
      </div>
    </components.Option>
  );
};

// Custom SingleValue component to show flag emoji with selected country name
const SingleValue = (props: any) => {
  return (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{props.data.country.flag}</span>
        <span>{props.data.label}</span>
      </div>
    </components.SingleValue>
  );
};

export function CountrySelect({
  value,
  onChange,
  id,
  name,
  label,
  placeholder = "Select a country",
  className,
  error,
  description,
  disabled = false,
  required = false
}: CountrySelectProps) {
  // Convert countries array to options format for react-select
  const options: Option[] = countries.map((country) => ({
    value: country.name,
    label: country.name,
    country
  }));

  // Find the selected option based on value
  const selectedOption = value
    ? options.find(option => option.value === value)
    : null;

  // Default to Norway if no value is provided initially
  const [defaultSelected] = useState(() => {
    if (value) {
      return options.find(option => option.value === value) || null;
    }
    return options.find(option => option.value === DEFAULT_COUNTRY.name) || null;
  });

  // Custom styles for the Select component
  const customStyles: StylesConfig = {
    control: (provided, state) => ({
      ...provided,
      borderColor: error ? 'rgb(239, 68, 68)' : state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--input))',
      borderRadius: 'var(--radius)',
      backgroundColor: 'hsl(var(--background))',
      boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--ring))' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--input))',
      },
      padding: '2px',
      height: '40px',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'hsl(var(--background))',
      borderColor: 'hsl(var(--border))',
      borderWidth: '1px',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-md)',
      zIndex: 50,
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '4px',
      maxHeight: '250px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? 'hsl(var(--primary))' 
        : state.isFocused 
          ? 'hsl(var(--muted))' 
          : 'transparent',
      color: state.isSelected ? 'white' : 'hsl(var(--foreground))',
      cursor: 'pointer',
      borderRadius: 'var(--radius)',
      margin: '2px 0',
      padding: '8px 12px',
      '&:active': {
        backgroundColor: 'hsl(var(--muted))',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0 12px',
    }),
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label 
          htmlFor={id} 
          className="flex items-center gap-1"
        >
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <Select
        id={id}
        name={name}
        options={options}
        value={selectedOption || defaultSelected}
        onChange={(option) => {
          const selectedValue = (option as Option)?.value || '';
          onChange(selectedValue);
        }}
        placeholder={placeholder}
        isDisabled={disabled}
        styles={customStyles}
        components={{ Option, SingleValue }}
        className="react-select-container"
        classNamePrefix="react-select"
        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
        menuPosition="fixed"
      />
      {description && <FormDescription>{description}</FormDescription>}
      {error && <FormMessage>{error}</FormMessage>}
    </div>
  );
}
