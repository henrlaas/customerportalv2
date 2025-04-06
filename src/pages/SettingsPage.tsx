import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Languages } from '@/components/Settings/Languages';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Avatar, AvatarFallback, AvatarImage 
} from "@/components/ui/avatar";

const SettingsPage = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Profile form schema
  const profileSchema = z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email().optional(),
  });

  // Password form schema
  const passwordSchema = z.object({
    old_password: z.string().min(6).optional(),
    new_password: z.string().min(6).optional(),
    confirm_password: z.string().min(6).optional(),
  }).refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"], // path of error
  });

  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: user?.email || '',
    },
  });

  // Password form
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  // Fix profile mutation
  const profileMutation = useMutation({
    mutationFn: async (values: z.infer<typeof profileSchema>) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
        })
        .eq('id', user.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Fix password mutation
  const passwordMutation = useMutation({
    mutationFn: async (values: z.infer<typeof passwordSchema>) => {
      if (!values.new_password) throw new Error("New password is required");
      
      const { data, error } = await supabase.auth.updateUser({
        password: values.new_password,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating password',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Fix handleSubmit functions to match the mutation functions
  const handleProfileSubmit = (values: z.infer<typeof profileSchema>) => {
    profileMutation.mutate(values);
  };

  const handlePasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
    passwordMutation.mutate(values);
  };

  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {/* Profile Card */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} type="email" disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={profileMutation.isPending}>
                {profileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Password Card */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="old_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Old Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={passwordMutation.isPending}>
                {passwordMutation.isPending ? 'Saving...' : 'Change Password'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Manage your app preferences.</CardDescription>
        </CardHeader>
        <CardContent className="pl-6">
          <Languages />
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
