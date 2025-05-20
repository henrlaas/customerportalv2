
import { UseFormReturn } from 'react-hook-form';
import { CompanyContactForm } from './CompanyContactForm';
import { CompanyFormValues } from './types';

interface ContactDetailsStageProps {
  form: UseFormReturn<CompanyFormValues>;
}

export function ContactDetailsStage({ form }: ContactDetailsStageProps) {
  return <CompanyContactForm form={form} />;
}
