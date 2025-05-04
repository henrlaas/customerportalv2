
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
import { Logo } from '@/components/Layout/Logo';
import { LoaderCircle } from 'lucide-react';

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
  const [inviteType, setInviteType] = useState<string | null>(null);
  
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
    
    const searchParams = new URLSearchParams(location.search);
    const typeParam = searchParams.get('type');
    
    // Get token from any of the possible parameters
    let token = searchParams.get('token') || searchParams.get('token_hash');
    
    setInviteType(typeParam);
    console.log("Invite type:", typeParam);
    console.log("Token value:", token);

    // Check if we're coming from the auth flow with a token in the URL
    if (token) {
      console.log("Found token in URL params:", token);
      
      const handleToken = async () => {
        try {
          // This handles both invite and recovery flows
          const otpType = typeParam === 'recovery' ? 'recovery' : 'invite';
          console.log("Processing token with type:", otpType);
          
          // Direct authentication attempt using the token
          let { data, error } = await supabase.auth.verifyOtp({
            token_hash: token as string,
            type: otpType,
          });
          
          if (error) {
            console.error('Error processing token:', error);
            
            // Fallback: Try to exchange the token for a session
            console.log("Trying alternative token processing method...");
            
            // For Supabase invites, we need to make a direct API call to the verify endpoint
            const supabaseUrl = process.env.SUPABASE_URL || "https://vjqbgnjeuvuxvuruewyc.supabase.co";
            const apiKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqcWJnbmpldXZ1eHZ1cnVld3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NTA5MDIsImV4cCI6MjA1OTUyNjkwMn0.MvXDNmHq771t4TbZrrnaylqBoTcEONv0qv31sZYmAA8";
            
            const authResponse = await fetch(`${supabaseUrl}/auth/v1/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey
              },
              body: JSON.stringify({
                type: otpType,
                token: token
              })
            });
            
            const authResult = await authResponse.json();
            console.log("Alternative auth result:", authResult);
            
            if (authResult.error) {
              // If still failing, show error to user
              toast({
                title: 'Error',
                description: 'Invalid or expired token. Please request a new invitation or password reset.',
                variant: 'destructive',
              });
              setIsProcessing(false);
              setTimeout(() => navigate('/auth'), 3000);
            } else if (authResult.user) {
              // If successful, use the user data
              setUserEmail(authResult.user.email);
              setIsProcessing(false);
              window.history.replaceState({}, document.title, `/set-password?type=${typeParam}`);
            }
          } else if (data?.user) {
            console.log("Token verified successfully, user:", data.user);
            setUserEmail(data.user.email);
            setIsProcessing(false);
            
            // Clean up URL but keep the type parameter
            window.history.replaceState({}, document.title, `/set-password?type=${typeParam}`);
          }
        } catch (err) {
          console.error('Error in token processing:', err);
          toast({
            title: 'Error',
            description: 'An unexpected error occurred. Please try again or contact support.',
            variant: 'destructive',
          });
          setIsProcessing(false);
          setTimeout(() => navigate('/auth'), 3000);
        }
      };
      
      handleToken();
    } 
    // Handle hash fragment in URL (old style auth flow)
    else if (location.hash && location.hash.includes('type=')) {
      console.log("Processing hash fragment:", location.hash);
      
      const handleHash = async () => {
        try {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error processing hash:', error);
            toast({
              title: 'Error',
              description: 'There was an error processing your request. Please try again.',
              variant: 'destructive',
            });
            setIsProcessing(false);
            setTimeout(() => navigate('/auth'), 3000);
          } else if (data?.session?.user) {
            console.log("User authenticated from hash:", data.session.user);
            setUserEmail(data.session.user.email);
            setIsProcessing(false);
            
            // Keep the type in the URL but remove the hash
            window.history.replaceState({}, document.title, `/set-password?type=${typeParam || 'invite'}`);
          } else {
            console.log("No session found in hash");
            toast({
              title: 'Error',
              description: 'Invalid or expired link. Please request a new invitation.',
              variant: 'destructive',
            });
            setIsProcessing(false);
            setTimeout(() => navigate('/auth'), 3000);
          }
        } catch (err) {
          console.error('Error processing hash:', err);
          toast({
            title: 'Error',
            description: 'An unexpected error occurred.',
            variant: 'destructive',
          });
          setIsProcessing(false);
          setTimeout(() => navigate('/auth'), 3000);
        }
      };
      
      handleHash();
    }
    // If we have a type but no token or hash, check for existing session
    else if (typeParam) {
      console.log("Type parameter found but no token/hash, checking for session");
      
      const checkSession = async () => {
        const { data } = await supabase.auth.getSession();
        
        if (data?.session?.user) {
          console.log("Found existing session:", data.session.user);
          setUserEmail(data.session.user.email);
        } else {
          console.log("No session found, redirecting to auth");
          toast({
            title: 'Session expired',
            description: 'Your session has expired. Please request a new invitation.',
            variant: 'destructive',
          });
          setTimeout(() => navigate('/auth'), 1500);
        }
        
        setIsProcessing(false);
      };
      
      checkSession();
    } 
    // No parameters at all
    else {
      console.log("No parameters found, redirecting to auth");
      toast({
        title: 'Invalid access',
        description: 'Please use the link sent in your invitation email.',
        variant: 'destructive',
      });
      setIsProcessing(false);
      setTimeout(() => navigate('/auth'), 1500);
    }
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
          <h2 className="text-xl font-semibold mb-2">Processing your {inviteType === 'recovery' ? 'password reset' : 'invitation'}</h2>
          <p className="text-gray-600">Please wait a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        
        {isProcessing && !userEmail ? (
          <div className="text-center">
            <div className="mb-4 animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <h2 className="text-xl font-semibold mb-2">
              Processing your {inviteType === 'recovery' ? 'password reset' : 'invitation'}
            </h2>
            <p className="text-gray-600">Please wait a moment...</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">
              {inviteType === 'recovery' ? 'Reset Your Password' : 'Set Your Password'}
            </h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSetPassword)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          className="rounded-md border-gray-300" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-gray-500">Must be at least 6 characters</p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          className="rounded-md border-gray-300" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-gray-500">Both passwords must match</p>
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 text-[18px] font-[500] rounded-[15px] px-8 py-[14px] border-[#0D352A] text-[#0D352A] hover:bg-[#0D352A]/10 transition-all duration-300 ease-in-out"
                    onClick={() => navigate('/auth')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className={`flex-1 text-[18px] font-[500] rounded-[15px] px-8 py-[14px] bg-[#0D352A] text-[#85FAA1] hover:bg-[#0D352A]/90 transition-all duration-300 ease-in-out relative ${isProcessing ? 'animate-pulse' : ''}`}
                    disabled={isProcessing}
                  >
                    <span className={`flex items-center justify-center gap-2 ${isProcessing ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
                      {inviteType === 'recovery' ? 'Reset Password' : 'Set Password'}
                    </span>
                    {isProcessing && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <LoaderCircle className="animate-spin" size={24} />
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </div>
    </div>
  );
};

export default SetPassword;
