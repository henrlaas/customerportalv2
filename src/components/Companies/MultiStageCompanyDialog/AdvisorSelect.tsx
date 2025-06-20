
import React from 'react';
import Select, { components, SingleValue } from 'react-select';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: string;
}

interface AdvisorSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const Option = (props: any) => {
  const { data } = props;
  return (
    <components.Option {...props}>
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={data.avatar_url} />
          <AvatarFallback className="text-xs">
            {data.first_name?.[0]}{data.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <span>{data.first_name} {data.last_name}</span>
      </div>
    </components.Option>
  );
};

const SingleValueComponent = (props: any) => {
  const { data } = props;
  return (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={data.avatar_url} />
          <AvatarFallback className="text-xs">
            {data.first_name?.[0]}{data.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <span>{data.first_name} {data.last_name}</span>
      </div>
    </components.SingleValue>
  );
};

export function AdvisorSelect({ value, onChange }: AdvisorSelectProps) {
  const { data: users = [] } = useQuery({
    queryKey: ['advisors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, role')
        .in('role', ['admin', 'employee']);
      
      if (error) throw error;
      return data || [];
    },
  });

  const options = users.map(user => ({
    value: user.id,
    label: `${user.first_name} ${user.last_name}`,
    ...user
  }));

  const selectedOption = options.find(option => option.value === value);

  const handleChange = (selectedOption: SingleValue<any>) => {
    onChange(selectedOption?.value || '');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Allow clearing the selection with Delete or Backspace when there's a selected value
    // and no text is being typed (the input is focused but empty)
    if ((event.key === 'Delete' || event.key === 'Backspace') && value) {
      const target = event.target as HTMLInputElement;
      if (!target.value || target.value.length === 0) {
        event.preventDefault();
        onChange('');
      }
    }
  };

  return (
    <Select
      value={selectedOption}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      options={options}
      components={{
        Option,
        SingleValue: SingleValueComponent
      }}
      isClearable
      isSearchable
      placeholder="Select an advisor"
      styles={{
        control: (base, state) => ({
          ...base,
          height: '40px',
          minHeight: '40px',
          border: '1px solid hsl(var(--border))',
          borderRadius: '6px',
          backgroundColor: 'hsl(var(--background))',
          boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--ring))' : 'none',
          '&:hover': {
            borderColor: 'hsl(var(--border))'
          }
        }),
        valueContainer: (base) => ({
          ...base,
          height: '38px',
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center'
        }),
        input: (base) => ({
          ...base,
          margin: 0,
          padding: 0,
          color: 'hsl(var(--foreground))'
        }),
        indicatorsContainer: (base) => ({
          ...base,
          height: '38px'
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '6px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          zIndex: 50
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isFocused ? 'hsl(var(--accent))' : 'transparent',
          color: 'hsl(var(--foreground))',
          '&:hover': {
            backgroundColor: 'hsl(var(--accent))'
          }
        }),
        singleValue: (base) => ({
          ...base,
          color: 'hsl(var(--foreground))'
        }),
        placeholder: (base) => ({
          ...base,
          color: 'hsl(var(--muted-foreground))'
        })
      }}
    />
  );
}
