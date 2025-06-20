
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Select from 'react-select';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { dealDetailsStage2Schema, DealDetailsStage2Values } from '@/components/Deals/types/deal';
import { Repeat, CircleDollarSign, Megaphone, Globe, Calendar, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DealDetailsStage2FormProps {
  onSubmit: (data: DealDetailsStage2Values) => void;
  onBack: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<DealDetailsStage2Values>;
}

interface AssigneeOption {
  value: string;
  label: string;
  avatar_url?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

export const DealDetailsStage2Form: React.FC<DealDetailsStage2FormProps> = ({
  onSubmit,
  onBack,
  isSubmitting = false,
  defaultValues = {}
}) => {
  const { user } = useAuth();

  const form = useForm<DealDetailsStage2Values>({
    resolver: zodResolver(dealDetailsStage2Schema),
    defaultValues: {
      deal_type: 'one-time',
      client_deal_type: 'web',
      value: 0,
      price_type: 'Project',
      assigned_to: user?.id || '',
      ...defaultValues
    }
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role, avatar_url')
        .order('first_name');
      if (error) {
        console.error('Error fetching profiles:', error);
        return [];
      }
      return data;
    }
  });

  const eligibleProfiles = profiles.filter(
    (profile: any) => profile.role === 'admin' || profile.role === 'employee'
  );

  const assigneeOptions: AssigneeOption[] = eligibleProfiles.map((profile: any) => ({
    value: profile.id,
    label: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User',
    avatar_url: profile.avatar_url,
    first_name: profile.first_name,
    last_name: profile.last_name
  }));

  const dealTypeOptions = [
    {
      value: 'recurring',
      label: 'Recurring',
      description: 'Ongoing subscription or service',
      icon: Repeat,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      value: 'one-time', 
      label: 'One-Time',
      description: 'Single payment transaction',
      icon: CircleDollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  const clientTypeOptions = [
    {
      value: 'web',
      label: 'Web Development',
      description: 'Website and web application services',
      icon: Globe,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      value: 'marketing',
      label: 'Marketing',
      description: 'Digital marketing and advertising',
      icon: Megaphone,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  const priceTypeOptions = [
    {
      value: 'MRR',
      label: 'Monthly Recurring Revenue',
      description: 'Recurring monthly payments',
      icon: Calendar,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      value: 'Project',
      label: 'Project-Based',
      description: 'One-time project payment',
      icon: CreditCard,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    }
  ];

  const SingleValue = ({ data }: { data: AssigneeOption }) => (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6">
        <AvatarImage src={data.avatar_url || undefined} />
        <AvatarFallback className="text-xs">
          {data.first_name?.[0]}{data.last_name?.[0]}
        </AvatarFallback>
      </Avatar>
      <span>{data.label}</span>
    </div>
  );

  const Option = ({ innerRef, innerProps, data, isFocused, isSelected }: any) => (
    <div
      ref={innerRef}
      {...innerProps}
      className={`flex items-center gap-2 p-2 cursor-pointer ${
        isFocused ? 'bg-accent' : ''
      } ${isSelected ? 'bg-primary text-primary-foreground' : ''}`}
    >
      <Avatar className="h-6 w-6">
        <AvatarImage src={data.avatar_url || undefined} />
        <AvatarFallback className="text-xs">
          {data.first_name?.[0]}{data.last_name?.[0]}
        </AvatarFallback>
      </Avatar>
      <span>{data.label}</span>
    </div>
  );

  const renderCardOptions = (
    options: any[],
    selectedValue: string,
    onSelect: (value: string) => void,
    name: string
  ) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = selectedValue === option.value;
        
        return (
          <Card
            key={option.value}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              isSelected
                ? `ring-2 ring-primary ${option.borderColor}`
                : 'border-border hover:border-muted-foreground'
            )}
            onClick={() => onSelect(option.value)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg', option.bgColor)}>
                  <Icon className={cn('h-5 w-5', option.color)} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{option.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="deal_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deal Type *</FormLabel>
              <FormControl>
                <div>
                  {renderCardOptions(dealTypeOptions, field.value, field.onChange, 'deal_type')}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client_deal_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Type *</FormLabel>
              <FormControl>
                <div>
                  {renderCardOptions(clientTypeOptions, field.value, field.onChange, 'client_deal_type')}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price Type *</FormLabel>
              <FormControl>
                <div>
                  {renderCardOptions(priceTypeOptions, field.value, field.onChange, 'price_type')}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value (NOK) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter deal value"
                  value={field.value === 0 ? '' : field.value}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      field.onChange(0);
                    } else {
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue) && numValue >= 0) {
                        field.onChange(numValue);
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      field.onChange(0);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assigned_to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deal Holder *</FormLabel>
              <FormControl>
                <Select
                  options={assigneeOptions}
                  value={assigneeOptions.find(option => option.value === field.value)}
                  onChange={(selectedOption) => field.onChange(selectedOption?.value || '')}
                  placeholder="Search for a team member..."
                  isSearchable
                  components={{ SingleValue, Option }}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--input))',
                      backgroundColor: 'hsl(var(--background))',
                      borderRadius: 'calc(var(--radius) - 2px)',
                      boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--ring))' : 'none',
                      '&:hover': { borderColor: 'hsl(var(--input))' },
                      height: '40px',
                      minHeight: '40px',
                      cursor: 'text'
                    }),
                    valueContainer: baseStyles => ({
                      ...baseStyles,
                      height: '38px',
                      padding: '0 8px',
                      display: 'flex',
                      alignItems: 'center'
                    }),
                    input: baseStyles => ({
                      ...baseStyles,
                      margin: '0',
                      padding: '0',
                      color: 'hsl(var(--foreground))',
                      fontSize: '14px',
                      lineHeight: '1.25',
                      caretColor: 'hsl(var(--foreground))',
                      opacity: 1,
                      '&:focus': { outline: 'none' }
                    }),
                    indicatorsContainer: baseStyles => ({
                      ...baseStyles,
                      height: '38px'
                    }),
                    placeholder: baseStyles => ({
                      ...baseStyles,
                      color: 'hsl(var(--muted-foreground))',
                      fontSize: '14px'
                    }),
                    menu: baseStyles => ({
                      ...baseStyles,
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      zIndex: 50
                    }),
                    option: baseStyles => ({
                      ...baseStyles,
                      backgroundColor: 'transparent',
                      padding: 0,
                      '&:hover': { backgroundColor: 'transparent' }
                    }),
                    singleValue: baseStyles => ({
                      ...baseStyles,
                      color: 'hsl(var(--foreground))'
                    }),
                    dropdownIndicator: baseStyles => ({
                      ...baseStyles,
                      color: 'hsl(var(--foreground) / 0.5)',
                      '&:hover': { color: 'hsl(var(--foreground) / 0.8)' }
                    })
                  }}
                  filterOption={(option, inputValue) => {
                    if (!inputValue) return true;
                    const searchTerm = inputValue.toLowerCase();
                    const label = option.label.toLowerCase();
                    return label.includes(searchTerm);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Deal'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
