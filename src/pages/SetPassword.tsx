
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Define form schema for password setup
const passwordSetupSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PasswordSetupFormValues = z.infer<typeof passwordSetupSchema>;

const SetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  const form = useForm<PasswordSetupFormValues>({
    resolver: zodResolver(passwordSetupSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Process token on page load
  useEffect(() => {
    console.log("SetPassword page loaded with URL:", window.location.href);
    console.log("Search params:", location.search);
    console.log("Hash:", location.hash);
    
    // Check for token in URL query params (new style)
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    const handleToken = async () => {
      try {
        if (token && (type === 'invite' || type === 'recovery')) {
          console.log("Processing token:", token, "type:", type);
          // Exchange the token for a session
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type === 'invite' ? 'invite' : 'recovery',
          });
          
          if (error) {
            console.error('Error processing token:', error);
            toast({
              title: 'Error',
              description: 'Invalid or expired token. Please request a new invitation.',
              variant: 'destructive',
            });
            setIsProcessing(false);
            // Redirect to login after a delay
            setTimeout(() => navigate('/auth'), 3000);
          } else if (data?.user) {
            console.log("Token verified successfully, user:", data.user);
            setUserEmail(data.user.email);
            setIsProcessing(false);
            // Clean up the URL
            window.history.replaceState({}, document.title, `/set-password`);
          }
        } 
        // Handle hash fragment in URL (old style)
        else if (location.hash && location.hash.includes('type=')) {
          console.log("Processing hash fragment:", location.hash);
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error processing invitation:', error);
            toast({
              title: 'Error',
              description: 'There was an error processing your invitation. Please try again or contact support.',
              variant: 'destructive',
            });
            setIsProcessing(false);
            // Redirect to login after a delay
            setTimeout(() => navigate('/auth'), 3000);
          } else if (data?.session?.user) {
            console.log("User authenticated successfully:", data.session.user);
            setUserEmail(data.session.user.email);
            setIsProcessing(false);
            // Clean up the URL
            window.history.replaceState({}, document.title, `/set-password`);
          } else {
            console.log("No session found in hash");
            toast({
              title: 'Error',
              description: 'Invalid or expired invitation link. Please contact your administrator.',
              variant: 'destructive',
            });
            setIsProcessing(false);
            // Redirect to login after a delay
            setTimeout(() => navigate('/auth'), 3000);
          }
        } else {
          console.log("No token or hash found");
          toast({
            title: 'Error',
            description: 'Invalid invitation link. Please contact your administrator.',
            variant: 'destructive',
          });
          setIsProcessing(false);
          // Redirect to login after a delay
          setTimeout(() => navigate('/auth'), 3000);
        }
      } catch (err) {
        console.error('Error in token processing:', err);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again or contact support.',
          variant: 'destructive',
        });
        setIsProcessing(false);
        // Redirect to login after a delay
        setTimeout(() => navigate('/auth'), 3000);
      }
    };
    
    handleToken();
  }, [location, navigate, toast]);

  const handleSetPassword = async (data: PasswordSetupFormValues) => {
    try {
      setIsProcessing(true);
      console.log("Setting up password for user");
      
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        console.error("Error setting password:", error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        setIsProcessing(false);
      } else {
        console.log("Password set successfully");
        toast({
          title: 'Success',
          description: 'Your password has been set successfully. You will be redirected to the dashboard.',
        });
        
        // Navigate to dashboard as the user is now logged in
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (error: any) {
      console.error("Exception setting password:", error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while setting your password.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  if (isProcessing && !userEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <h2 className="text-xl font-semibold mb-2">Processing your invitation</h2>
          <p className="text-gray-600">Please wait a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-black text-white p-2 rounded">
              <span className="text-xl font-bold">W</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Workspace</h1>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Set Your Password</h2>
          <p className="text-gray-500 mb-6">
            {userEmail ? `Create a password for ${userEmail}` : 'Create a password to access your account'}
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSetPassword)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">New Password</FormLabel>
                    <FormControl>
                      <Input type="password" className="border-gray-300 focus:ring-blue-500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" className="border-gray-300 focus:ring-blue-500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isProcessing}
              >
                {isProcessing ? 'Setting Password...' : 'Set Password'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
      
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-blue-500 to-blue-600">
        <div className="h-full flex items-center justify-center text-white p-12">
          <div className="max-w-lg">
            <h2 className="text-3xl font-bold mb-4">Marketing Agency Customer Portal</h2>
            <p className="text-lg opacity-80">Manage your marketing campaigns, tasks, and contracts all in one place.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
