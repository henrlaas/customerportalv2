
import { z } from 'zod';

export const convertTempCompanySchema = z.object({
  // Pre-filled fields that can be edited
  name: z.string().min(1, { message: 'Company name is required' }),
  organization_number: z.string().min(1, { message: 'Organization number is required' }),
  website: z.string().url().min(1, { message: 'Valid website URL is required' }),
  phone: z.string().min(1, { message: 'Phone number is required' }),
  client_types: z.array(z.string()).min(1, { message: 'At least one client type is required' }),
  mrr: z.coerce.number().min(0, { message: 'MRR must be at least 0' }),
  
  // Address fields (may be pre-filled from Brunnøysund)
  street_address: z.string().min(1, { message: 'Street address is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  postal_code: z.string().min(1, { message: 'Postal code is required' }),
  country: z.string().optional(),
  
  // New fields to collect
  invoice_email: z.string().email({ message: 'Valid email is required' }),
  trial_period: z.boolean().default(false),
  is_partner: z.boolean().default(false),
  advisor_id: z.string().min(1, { message: 'Please select an advisor' }),
});

export type ConvertTempCompanyFormValues = z.infer<typeof convertTempCompanySchema>;
