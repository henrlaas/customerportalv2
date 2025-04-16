
import * as z from 'zod';

export const userSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  displayName: z.string().min(1, 'Display name is required'),
  phone: z.string().optional(),
  role: z.string().optional(),
  team: z.string().optional(),
  language: z.string().optional(),
});

export const inviteUserSchema = userSchema;

export const editUserSchema = z.object({
  email: z.string().email('Please enter a valid email address').optional(),
  displayName: z.string().min(1, 'Display name is required').optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  team: z.string().optional(),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;
export type InviteUserFormValues = z.infer<typeof userSchema>;
