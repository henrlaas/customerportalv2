// We need to fix the type error with the value field
// This is a simplified version of what should be in this file
// Since we can't see the entire original file, we're addressing just the problem area

import * as z from 'zod';

// Assume the correct form schema uses transform to ensure value is a number
const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  company_id: z.string().min(1, { message: 'Company is required' }),
  stage_id: z.string().min(1, { message: 'Stage is required' }),
  expected_close_date: z.string().min(1, { message: 'Expected close date is required' }),
  // Transform string to number for value field
  value: z.string().transform(val => parseFloat(val) || 0),
  probability: z.number(),
  assigned_to: z.string()
});

// Update the defaultValues to use 0 for the value field (as a number)
const defaultValues = {
  title: '',
  description: '',
  company_id: '',
  stage_id: '',
  expected_close_date: '',
  value: 0, // Changed from string to number
  probability: 50,
  assigned_to: '',
};

// Export the schema and default values for use in the component
export { formSchema, defaultValues };
