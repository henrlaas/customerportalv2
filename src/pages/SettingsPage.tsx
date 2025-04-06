
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Settings,
  User,
  Bell,
  Shield,
  LogOut
} from 'lucide-react';

// Profile form schema
const profileFormSchema = z.object({
  first_name: z.string().min(1, { message: 'First name is required' }),
  last_name: z.string().min(1, { message: 'Last name is required' }),
  avatar_url: z.string().url().or(z.literal('')).optional(),
});

// Account form schema
const accountFormSchema = z.object({
  language: z.enum(['en', 'es', 'de', 'fr', 'ja']),
  password: z.string().min(8).optional(),
  confirm_password: z.string().optional(),
}).refine((data) => {
  if (data.password && !data.confirm_password) return false;
  if (!data.password && data.confirm_password) return false;
  if (data.password && data.confirm_password && data.password !== data.confirm_password) return false;
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

// Notification settings schema
const notificationsFormSchema = z.object({
  email_notifications: z.boolean(),
  task_notifications: z.boolean(),
  deal_notifications: z.boolean(),
  marketing_emails: z.boolean(),
});

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);

  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      avatar_url: '',
    },
  });

  // Account form
  const accountForm = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      language: 'en',
      password: '',
      confirm_password: '',
    },
  });

  // Notifications form
  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      email_notifications: true,
      task_notifications: true,
      deal_notifications: true,
      marketing_emails: false,
    },
  });

  // Fetch user profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        toast({
          title: 'Error fetching profile',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      }
      
      // Set form defaults
      profileForm.reset({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        avatar_url: data.avatar_url || '',
      });
      
      accountForm.reset({
        language: data.language || 'en',
      });
      
      return data;
    },
    enabled: !!user,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: z.infer<typeof profileFormSchema>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(values)
        .eq('id', user.id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update account settings mutation
  const updateAccountMutation = useMutation({
    mutationFn: async (values: z.infer<typeof accountFormSchema>) => {
      if (!user) throw new Error('Not authenticated');
      
      // First update language
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ language: values.language })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // If password is provided, update password
      if (values.password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: values.password,
        });
        
        if (passwordError) throw passwordError;
        setIsPasswordChanged(true);
      }
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Account settings updated',
        description: 'Your account settings have been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      // Reset password fields
      accountForm.setValue('password', '');
      accountForm.setValue('confirm_password', '');
    },
    onError: (error) => {
      toast({
        title: 'Error updating account settings',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Save notifications settings mutation
  const saveNotificationsMutation = useMutation({
    mutationFn: async (values: z.infer<typeof notificationsFormSchema>) => {
      // In a real app, you would save these to the user's preferences
      // For now, we'll just simulate a successful update
      return values;
    },
    onSuccess: () => {
      toast({
        title: 'Notification settings updated',
        description: 'Your notification preferences have been saved.',
      });
    },
  });

  // Handle profile form submission
  const onProfileSubmit = (values: z.infer<typeof profileFormSchema>) => {
    updateProfileMutation.mutate(values);
  };

  // Handle account form submission
  const onAccountSubmit = (values: z.infer<typeof accountFormSchema>) => {
    updateAccountMutation.mutate(values);
  };

  // Handle notifications form submission
  const onNotificationsSubmit = (values: z.infer<typeof notificationsFormSchema>) => {
    saveNotificationsMutation.mutate(values);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Section */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile picture.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback>
                    {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">Profile Picture</h3>
                  <p className="text-sm text-gray-500">
                    Upload a new profile picture by providing a URL.
                  </p>
                </div>
              </div>
              
              {isLoadingProfile ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={profileForm.control}
                      name="avatar_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Avatar URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com/avatar.png" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the URL of your profile picture.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Account Section */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Update your account preferences and change your password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingProfile ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <Form {...accountForm}>
                  <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-6">
                    <FormField
                      control={accountForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="ja">Japanese</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose your preferred language for the interface.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium mb-3">Change Password</h3>
                      {isPasswordChanged && (
                        <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md text-sm">
                          Your password has been changed successfully.
                        </div>
                      )}
                      <div className="space-y-4">
                        <FormField
                          control={accountForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormDescription>
                                Enter a new password (minimum 8 characters).
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
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
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={updateAccountMutation.isPending}
                      >
                        {updateAccountMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Section */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control what notifications you receive from the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationsForm}>
                <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                  <FormField
                    control={notificationsForm.control}
                    name="email_notifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Notifications</FormLabel>
                          <FormDescription>
                            Receive email notifications about important updates.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={notificationsForm.control}
                    name="task_notifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Task Updates</FormLabel>
                          <FormDescription>
                            Get notified when tasks are assigned to you or updated.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={notificationsForm.control}
                    name="deal_notifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Deal Updates</FormLabel>
                          <FormDescription>
                            Receive notifications about deal stage changes and updates.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={notificationsForm.control}
                    name="marketing_emails"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Marketing Emails</FormLabel>
                          <FormDescription>
                            Receive marketing emails about new features and updates.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={saveNotificationsMutation.isPending}
                    >
                      {saveNotificationsMutation.isPending ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Section */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium mb-3">Account Security</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Security settings help keep your account safe. You can change your password and manage other security features here.
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account.
                    </p>
                  </div>
                  <Button variant="outline" disabled>Coming Soon</Button>
                </div>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium mb-3">Active Sessions</h3>
                <p className="text-sm text-gray-500 mb-4">
                  These are the devices that are currently logged into your account.
                </p>
                <div className="rounded-md border p-4 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Current Session</h4>
                      <p className="text-sm text-gray-500">
                        This device • {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <h3 className="text-lg font-medium mb-3 text-red-600">Danger Zone</h3>
                <div className="rounded-md border border-red-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Sign Out</h4>
                      <p className="text-sm text-gray-500">
                        Sign out from all devices and sessions.
                      </p>
                    </div>
                    <Button variant="destructive" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper Badge component for this page only
const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <span className={`px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 ${className}`}>
      {children}
    </span>
  );
};

export default SettingsPage;
