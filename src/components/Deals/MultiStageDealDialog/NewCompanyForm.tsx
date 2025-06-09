
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChevronLeft } from 'lucide-react';
import { CompanyCreationMethodStage } from './CompanyCreationMethodStage';
import { BrunnøysundSearchStage } from './BrunnøysundSearchStage';
import { newCompanyFormSchema, NewCompanyFormValues } from '../types/deal';

type CreationMethod = 'manual' | 'brunnøysund';

interface BrregCompany {
  organisasjonsnummer: string;
  navn: string;
  forretningsadresse?: {
    land?: string;
    postnummer?: string;
    poststed?: string;
    adresse?: string[];
  };
}

interface NewCompanyFormProps {
  onNext: (data: NewCompanyFormValues) => void;
  onBack: () => void;
  defaultValues?: Partial<NewCompanyFormValues>;
}

export const NewCompanyForm: React.FC<NewCompanyFormProps> = ({
  onNext,
  onBack,
  defaultValues,
}) => {
  const [subStage, setSubStage] = useState<'method-selection' | 'search' | 'form'>('method-selection');
  const [creationMethod, setCreationMethod] = useState<CreationMethod | null>(null);

  const form = useForm<NewCompanyFormValues>({
    resolver: zodResolver(newCompanyFormSchema),
    defaultValues: {
      company_name: '',
      organization_number: '',
      website: '',
      street_address: '',
      city: '',
      postal_code: '',
      country: 'Norway',
      ...defaultValues,
    },
  });

  const handleMethodSelect = (method: CreationMethod) => {
    setCreationMethod(method);
    if (method === 'manual') {
      setSubStage('form');
    } else {
      setSubStage('search');
    }
  };

  const handleBrregCompanySelect = (company: BrregCompany) => {
    // Prefill form with selected company data including address (but address won't be shown in UI)
    form.setValue('company_name', company.navn);
    form.setValue('organization_number', company.organisasjonsnummer);
    
    const address = company.forretningsadresse;
    if (address) {
      if (address.land) form.setValue('country', address.land);
      if (address.postnummer) form.setValue('postal_code', address.postnummer);
      if (address.poststed) form.setValue('city', address.poststed);
      if (address.adresse) form.setValue('street_address', address.adresse.join(', '));
    } else {
      // Set Norge as default for Norwegian companies from Brunnøysund
      form.setValue('country', 'Norge');
    }
    
    setSubStage('form');
  };

  const handleBackToMethodSelection = () => {
    setSubStage('method-selection');
    setCreationMethod(null);
  };

  const handleBackToSearch = () => {
    setSubStage('search');
  };

  const onSubmit = (data: NewCompanyFormValues) => {
    onNext(data);
  };

  if (subStage === 'method-selection') {
    return (
      <div className="space-y-4">
        <CompanyCreationMethodStage onSelect={handleMethodSelect} />
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </div>
      </div>
    );
  }

  if (subStage === 'search') {
    return (
      <div className="space-y-4">
        <BrunnøysundSearchStage onCompanySelect={handleBrregCompanySelect} />
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={handleBackToMethodSelection} className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Corp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organization_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Number*</FormLabel>
              <FormControl>
                <Input placeholder="123456789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website*</FormLabel>
              <FormControl>
                <Input placeholder="https://acme.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Only show address fields for manual creation method */}
        {creationMethod === 'manual' && (
          <>
            <FormField
              control={form.control}
              name="street_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Oslo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Norge" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={creationMethod === 'brunnøysund' ? handleBackToSearch : handleBackToMethodSelection} 
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </Form>
  );
};
