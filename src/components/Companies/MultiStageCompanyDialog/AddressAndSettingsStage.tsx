
import { UseFormReturn } from 'react-hook-form';
import { CompanyAddressSettingsForm } from './CompanyAddressSettingsForm';
import { CompanyFormValues } from './types';

interface AddressAndSettingsStageProps {
  form: UseFormReturn<CompanyFormValues>;
  users: any[];
  hasMarketingType: boolean;
}

export function AddressAndSettingsStage({ form, users, hasMarketingType }: AddressAndSettingsStageProps) {
  return <CompanyAddressSettingsForm form={form} users={users} hasMarketingType={hasMarketingType} />;
}
