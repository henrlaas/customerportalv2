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
import { Logo } from '@/components/Layout/Logo';

// Define form schema for login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Auth = () => {
  const { signIn, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const t = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Check if user is coming with an invitation token
  useEffect(() => {
    // Debug information
    console.log("Auth page loaded with URL:", window.location.href);
    console.log("Search params:", location.search);
    console.log("Hash:", location.hash);
    
    const checkInviteToken = async () => {
      // Check for token in URL params
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      // If we have token and type, redirect to set-password page
      if (token && (type === 'invite' || type === 'recovery')) {
        console.log("Found invitation token, redirecting to set-password");
        navigate(`/set-password?token=${token}&type=${type}`);
        return;
      }
      
      // Check for auth hash in URL (old format)
      if (location.hash && (location.hash.includes('type=invite') || location.hash.includes('type=recovery'))) {
        console.log("Found auth hash, redirecting to set-password");
        // Keep the hash intact for the set-password page to process
        navigate(`/set-password${location.hash}`);
        return;
      }
    };
    
    checkInviteToken();
  }, [location, navigate]);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (data: LoginFormValues) => {
    setIsProcessing(true);
    const { error } = await signIn(data.email, data.password);
    setIsProcessing(false);
    
    if (!error) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Logo className="mb-8" />
          
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

              <Button 
                type="submit" 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isProcessing}
              >
                {isProcessing ? 'Logging in...' : t('Log In')}
              </Button>
            </form>
          </Form>
          <p className="mt-6 text-center text-sm text-gray-500">
            {t('Contact your administrator if you need access to the system')}
          </p>
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
