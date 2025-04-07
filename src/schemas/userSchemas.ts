
import * as z from 'zod';

// Define the schema for the invite form
export const inviteSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  role: z.enum(['admin', 'employee', 'client'], { 
    required_error: 'Please select a role' 
  }),
  team: z.string().min(1, { message: 'Team is required' }),
});

export type InviteFormValues = z.infer<typeof inviteSchema>;
