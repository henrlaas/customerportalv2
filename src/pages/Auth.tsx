import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Define form schema for login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Define form schema for password setup
const passwordSetupSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type PasswordSetupFormValues = z.infer<typeof passwordSetupSchema>;

const Auth = () => {
  const { signIn, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const t = useTranslation();
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [isProcessingInvite, setIsProcessingInvite] = useState(true); // Start with loading
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Check if user is coming from an invite link or password reset
  useEffect(() => {
    // Debug information
    console.log("Auth page loaded with URL:", window.location.href);
    console.log("Search params:", location.search);
    console.log("Hash:", location.hash);
    
    // Check for setup query parameter that we set in the redirectTo URL
    const searchParams = new URLSearchParams(location.search);
    const isSetup = searchParams.get('setup') === 'true';
    const isReset = searchParams.get('reset') === 'true';
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    
    console.log("Setup mode:", isSetup, "Reset mode:", isReset);
    console.log("Token:", token, "Type:", type);
    
    if (isSetup || isReset) {
      setIsSetupMode(true);
    }
    
    // Process the hash fragment or token for authentication
    const handleAuthParams = async () => {
      try {
        // First check if we have a token in the URL (new style)
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
              description: 'Invalid or expired token. Please request a new invitation or password reset.',
              variant: 'destructive',
            });
            setIsProcessingInvite(false);
          } else if (data?.user) {
            console.log("Token verified successfully, user:", data.user);
            setUserEmail(data.user.email);
            setIsSetupMode(true);
            // Update the URL to clean it up but keep the setup flag
            window.history.replaceState({}, document.title, `${window.location.pathname}?setup=true`);
            toast({
              title: 'Welcome!',
              description: 'Please set up your password to continue.',
            });
            setIsProcessingInvite(false);
          }
        } 
        // Check for hash fragment (old style)
        else if (location.hash && location.hash.includes('type=')) {
          console.log("Processing hash fragment:", location.hash);
          // This will parse the hash and set the session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error processing invitation:', error);
            toast({
              title: 'Error',
              description: 'There was an error processing your invitation. Please try again or contact support.',
              variant: 'destructive',
            });
            setIsProcessingInvite(false);
          } else if (data?.session?.user) {
            console.log("User authenticated successfully:", data.session.user);
            setUserEmail(data.session.user.email);
            setIsSetupMode(true);
            // Remove the hash to clean up the URL
            window.history.replaceState({}, document.title, `${window.location.pathname}?setup=true`);
            toast({
              title: 'Welcome!',
              description: 'Please set up your password to continue.',
            });
            setIsProcessingInvite(false);
          } else {
            console.log("No session found in hash");
            setIsProcessingInvite(false);
          }
        }
        // If we're in setup mode but don't have a token or hash, may have been redirected normally
        else if (isSetup && !token && !location.hash) {
          console.log("In setup mode without token or hash, checking for existing session");
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            console.log("Found existing user session:", data.session.user);
            setUserEmail(data.session.user.email);
          }
          setIsProcessingInvite(false);
        }
        else {
          console.log("No auth parameters found, proceeding normally");
          setIsProcessingInvite(false);
        }
      } catch (err) {
        console.error('Error in authentication processing:', err);
        toast({
          title: 'Error',
          description: 'An error occurred while processing your authentication. Please try again.',
          variant: 'destructive',
        });
        setIsProcessingInvite(false);
      }
    };
    
    handleAuthParams();
  }, [location, toast]);

  // If user is already logged in and not in setup mode, redirect to dashboard
  useEffect(() => {
    if (session && !isSetupMode) {
      navigate('/dashboard');
    }
  }, [session, isSetupMode, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const passwordSetupForm = useForm<PasswordSetupFormValues>({
    resolver: zodResolver(passwordSetupSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const handleLogin = async (data: LoginFormValues) => {
    const { error } = await signIn(data.email, data.password);
    if (!error) {
      navigate('/dashboard');
    }
  };

  const handlePasswordSetup = async (data: PasswordSetupFormValues) => {
    try {
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
      } else {
        console.log("Password set successfully");
        toast({
          title: 'Success',
          description: 'Your password has been set successfully. You can now use it to log in.',
        });
        
        // Navigate to dashboard as the user is now logged in
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error("Exception setting password:", error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while setting your password.',
        variant: 'destructive',
      });
    }
  };

  if (isProcessingInvite) {
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
          
          {isSetupMode ? (
            <>
              <h2 className="text-2xl font-bold mb-2">Set Your Password</h2>
              <p className="text-gray-500 mb-6">
                {userEmail ? `Create a password for ${userEmail}` : 'Create a password to access your account'}
              </p>
              
              <Form {...passwordSetupForm}>
                <form onSubmit={passwordSetupForm.handleSubmit(handlePasswordSetup)} className="space-y-4">
                  <FormField
                    control={passwordSetupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">{t('New Password')}</FormLabel>
                        <FormControl>
                          <Input type="password" className="border-gray-300 focus:ring-blue-500" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordSetupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">{t('Confirm Password')}</FormLabel>
                        <FormControl>
                          <Input type="password" className="border-gray-300 focus:ring-blue-500" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    {t('Set Password')}
                  </Button>
                </form>
              </Form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2">Sign in</h2>
              <p className="text-gray-500 mb-6">Enter your credentials to access your account</p>
              
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">{t('Email')}</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" className="border-gray-300 focus:ring-blue-500" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">{t('Password')}</FormLabel>
                        <FormControl>
                          <Input type="password" className="border-gray-300 focus:ring-blue-500" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white">{t('Log In')}</Button>
                </form>
              </Form>
              <p className="mt-6 text-center text-sm text-gray-500">
                {t('Contact your administrator if you need access to the system')}
              </p>
            </>
          )}
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

export default Auth;
