import React from 'react';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User,
  Mail,
  Lock,
  Check,
  X,
  Image,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useDropzone } from 'react-dropzone';

// Define Zod schema for profile update form
const profileSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

// Define Zod schema for password update form
const passwordSchema = z.object({
  old_password: z.string().min(8, {
    message: "Old password must be at least 8 characters.",
  }),
  new_password: z.string().min(8, {
    message: "New password must be at least 8 characters.",
  }),
  confirm_password: z.string().min(8, {
    message: "Confirm password must be at least 8 characters.",
  }),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"], // Path of the error
});

const SettingsPage = () => {
  const { user, signOut, profile, loading } = useAuth();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile data
  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
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
      return data;
    },
    enabled: !!user, // Only run when user is available
  });

  // Initialize form for profile updates
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: userProfile?.first_name || '',
      last_name: userProfile?.last_name || '',
      email: user?.email || '',
    },
    mode: "onChange",
  });

  // Initialize form for password updates
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    },
    mode: "onChange",
  });

  // Mutation for updating user profile
  const updateProfileMutation = useMutation(
    async (values: z.infer<typeof profileSchema>) => {
      const { error } = await supabase.from('profiles').update({
        first_name: values.first_name,
        last_name: values.last_name,
      }).eq('id', user?.id);

      if (error) {
        throw error;
      }

      // Also update the email if it has changed
      if (values.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: values.email,
        });

        if (emailError) {
          throw emailError;
        }
      }
    },
    {
      onSuccess: () => {
        toast({
          title: 'Profile updated successfully',
        });
        queryClient.invalidateQueries(['profile']);
        setIsProfileDialogOpen(false);
      },
      onError: (error: any) => {
        toast({
          title: 'Error updating profile',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  // Mutation for updating user password
  const updatePasswordMutation = useMutation(
    async (values: z.infer<typeof passwordSchema>) => {
      const { error } = await supabase.auth.updateUser({
        password: values.new_password,
      });

      if (error) {
        throw error;
      }
    },
    {
      onSuccess: () => {
        toast({
          title: 'Password updated successfully',
        });
        setIsPasswordDialogOpen(false);
        passwordForm.reset();
      },
      onError: (error: any) => {
        toast({
          title: 'Error updating password',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  // Function to handle profile form submission
  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(values);
  };

  // Function to handle password form submission
  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    updatePasswordMutation.mutate(values);
  };

  // Function to handle avatar upload
  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true)

      if (!user) {
        throw new Error('You must be logged in to upload an avatar.');
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}.${fileExt}`
      const filePath = `${fileName}`

      const { error: storageError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (storageError) {
        throw storageError
      }

      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${filePath}`;
      setAvatarUrl(url);

      // Update user profile with the new avatar URL
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', user.id)

      if (dbError) {
        throw dbError
      }

      toast({
        title: 'Avatar updated successfully',
      });
      queryClient.invalidateQueries(['profile']);
    } catch (error: any) {
      toast({
        title: 'Error uploading avatar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false)
    }
  }

  // Function to handle avatar deletion
  const deleteAvatar = async () => {
    try {
      setUploading(true);
  
      if (!user) {
        throw new Error('You must be logged in to delete an avatar.');
      }
  
      // Get the current avatar URL from the profile
      const currentAvatarUrl = userProfile?.avatar_url;
  
      if (!currentAvatarUrl) {
        throw new Error('No avatar to delete.');
      }
  
      // Extract the file path from the URL
      const filePath = currentAvatarUrl.replace(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/`, '');
  
      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);
  
      if (storageError) {
        throw storageError;
      }
  
      // Update user profile to remove the avatar URL
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);
  
      if (dbError) {
        throw dbError;
      }
  
      setAvatarUrl(null);
      toast({
        title: 'Avatar deleted successfully',
      });
      queryClient.invalidateQueries(['profile']);
    } catch (error: any) {
      toast({
        title: 'Error deleting avatar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // This function will be called when files are dropped into the dropzone
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      await uploadAvatar(file);
    }
  }, [uploadAvatar]);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, accept: {'image/*': ['.jpeg', '.png', '.gif', '.jpg']}})

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={userProfile?.avatar_url || ''} />
              <AvatarFallback>{user?.email?.[0].toUpperCase() || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">{user?.email}</p>
              <p className="text-sm text-muted-foreground">
                {userProfile?.first_name} {userProfile?.last_name}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={() => setIsProfileDialogOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              Update Profile
            </Button>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
              <Lock className="mr-2 h-4 w-4" />
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4">
            <div {...getRootProps()} className="relative w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center cursor-pointer">
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-sm text-muted-foreground">Drop it here...</p>
              ) : (
                <>
                  {userProfile?.avatar_url ? (
                    <Avatar>
                      <AvatarImage src={userProfile.avatar_url} alt="Avatar" className="object-cover" />
                      <AvatarFallback>{user?.email?.[0].toUpperCase() || '?'}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Image className="h-6 w-6 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Click or drag and drop an image to change your avatar.
              </p>
              {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
            </div>
          </div>
          <div className="grid">
            {userProfile?.avatar_url && (
              <Button 
                variant="destructive" 
                onClick={deleteAvatar}
                disabled={uploading}
              >
                {uploading ? "Deleting..." : "Delete Avatar"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            Be careful with these actions.
          </p>
          <Button variant="destructive" onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Profile Update Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
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
                      <Input placeholder="johndoe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? (
                    <>
                      Updating <span className="animate-spin ml-2">...</span>
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Password Update Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your password here. Make sure to use a strong password.
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
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
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={updatePasswordMutation.isPending}>
                  {updatePasswordMutation.isPending ? (
                    <>
                      Updating <span className="animate-spin ml-2">...</span>
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
