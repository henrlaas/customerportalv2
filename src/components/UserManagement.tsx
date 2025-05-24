
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { userService } from "@/services/userService";
import { UserRoleSelect } from "./UserManagement/UserRoleSelect";
import { TeamSelect } from "./UserManagement/TeamSelect";
import { LanguageSelect } from "./UserManagement/LanguageSelect";

const inviteUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  team: z.string().min(1, "Team is required"),
  language: z.string().min(1, "Language is required"),
});

type InviteUserFormValues = z.infer<typeof inviteUserSchema>;

interface UserManagementProps {
  onSuccess?: () => void;
}

export function UserManagement({ onSuccess }: UserManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      role: "employee",
      team: "Employees",
      language: "en",
    },
  });

  const inviteUserMutation = useMutation({
    mutationFn: (data: InviteUserFormValues) => 
      userService.inviteUser(data.email, data),
    onSuccess: () => {
      toast({
        title: "User invited",
        description: "The user has been invited successfully and will receive an email with setup instructions.",
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      form.reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to invite user: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: InviteUserFormValues) {
    inviteUserMutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <PhoneInput
                  country={'no'}
                  value={field.value}
                  onChange={field.onChange}
                  inputStyle={{
                    width: '100%',
                    height: '40px',
                    fontSize: '14px',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    paddingLeft: '48px',
                    backgroundColor: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                  }}
                  buttonStyle={{
                    border: '1px solid hsl(var(--border))',
                    borderRight: 'none',
                    borderRadius: '6px 0 0 6px',
                    backgroundColor: 'hsl(var(--background))',
                  }}
                  dropdownStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    zIndex: 50,
                  }}
                  searchStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '4px',
                    color: 'hsl(var(--foreground))',
                  }}
                  placeholder="Enter phone number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role *</FormLabel>
                <FormControl>
                  <UserRoleSelect value={field.value} onValueChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="team"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team *</FormLabel>
                <FormControl>
                  <TeamSelect value={field.value} onValueChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language *</FormLabel>
                <FormControl>
                  <LanguageSelect value={field.value} onValueChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={inviteUserMutation.isPending}
        >
          {inviteUserMutation.isPending ? "Sending Invitation..." : "Send Invitation"}
        </Button>
      </form>
    </Form>
  );
}
