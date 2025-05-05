
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
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
import { AuthLogo } from '@/components/Layout/AuthLogo';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-8">
          <AuthLogo />
        </div>
        
        <Form {...loginForm}>
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Email')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="email@example.com" 
                      className="rounded-md border-gray-300" 
                      {...field} 
                    />
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
                  <FormLabel>{t('Password')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      className="rounded-md border-gray-300" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className={`w-full text-[18px] font-[500] rounded-[15px] px-8 py-[14px] bg-[#004743] text-[#E4EDED] hover:bg-[#004743]/90 transition-all duration-300 ease-in-out relative ${isProcessing ? 'animate-pulse' : ''}`}
              disabled={isProcessing}
            >
              <span className={`flex items-center justify-center gap-2 ${isProcessing ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
                {t('Log In')}
              </span>
              {isProcessing && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <LoaderCircle className="animate-spin" size={24} />
                </span>
              )}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {t('Contact your advisor if you have not received access to Workspace.')}
        </p>
      </div>
    </div>
  );
};

export default Auth;
