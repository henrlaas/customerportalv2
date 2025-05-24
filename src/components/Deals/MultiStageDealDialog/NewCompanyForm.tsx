
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChevronLeft } from 'lucide-react';
import { CompanyCreationMethodStage } from './CompanyCreationMethodStage';
import { BrunnøysundSearchStage } from './BrunnøysundSearchStage';

const newCompanySchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  organization_number: z.string().optional(),
  website: z.string().url().or(z.literal('')).optional(),
});

type NewCompanyFormData = z.infer<typeof newCompanySchema>;

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
  onNext: (data: NewCompanyFormData) => void;
  onBack: () => void;
  defaultValues?: Partial<NewCompanyFormData>;
}

export const NewCompanyForm: React.FC<NewCompanyFormProps> = ({
  onNext,
  onBack,
  defaultValues,
}) => {
  const [subStage, setSubStage] = useState<'method-selection' | 'search' | 'form'>('method-selection');
  const [creationMethod, setCreationMethod] = useState<CreationMethod | null>(null);

  const form = useForm<NewCompanyFormData>({
    resolver: zodResolver(newCompanySchema),
    defaultValues: {
      company_name: '',
      organization_number: '',
      website: '',
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
    // Prefill form with selected company data
    form.setValue('company_name', company.navn);
    form.setValue('organization_number', company.organisasjonsnummer);
    setSubStage('form');
  };

  const handleBackToMethodSelection = () => {
    setSubStage('method-selection');
    setCreationMethod(null);
  };

  const handleBackToSearch = () => {
    setSubStage('search');
  };

  const onSubmit = (data: NewCompanyFormData) => {
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
              <FormLabel>Organization Number</FormLabel>
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
              <FormLabel>Website (optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://acme.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
