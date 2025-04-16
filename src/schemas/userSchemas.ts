
import * as z from 'zod';

export const userSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  role: z.string().optional(),
  team: z.string().optional(),
  language: z.string().optional(),
});

export const inviteUserSchema = userSchema;

export const editUserSchema = z.object({
  email: z.string().email('Please enter a valid email address').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  team: z.string().optional(),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;
export type InviteUserFormValues = z.infer<typeof userSchema>;
