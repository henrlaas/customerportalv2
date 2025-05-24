
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

  return (
    <Select
      value={selectedOption}
      onChange={handleChange}
      options={options}
      components={{
        Option,
        SingleValue: SingleValueComponent
      }}
      isSearchable
      placeholder="Search and select an advisor..."
      styles={{
        control: (base) => ({
          ...base,
          minHeight: '40px',
          border: '1px solid hsl(var(--border))',
          borderRadius: '6px',
          backgroundColor: 'hsl(var(--background))',
          '&:hover': {
            borderColor: 'hsl(var(--border))'
          }
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
        input: (base) => ({
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
