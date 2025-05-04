
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
import Logo from '@/components/Layout/Logo';

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
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex min-h-screen flex-wrap items-center">
        <div className="w-full xl:w-1/2">
          <div className="px-10 py-12 sm:p-22.5 xl:p-27.5">
            <div className="mb-12 flex justify-center">
              <Logo />
            </div>
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
              {t('Sign In to Workspace')}
            </h2>

            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2.5 block font-medium text-black dark:text-white">
                        {t('Email')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="email@example.com" 
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-meta-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2.5 block font-medium text-black dark:text-white">
                        {t('Password')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-meta-1" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className={`w-full cursor-pointer rounded-md border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90 ${isProcessing ? 'animate-pulse' : ''}`}
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

            <div className="mt-6 text-center">
              <p className="text-center text-sm font-medium text-gray-dark">
                {t('Contact your advisor if you have not received access to Workspace.')}
              </p>
            </div>
          </div>
        </div>
        <div className="hidden w-full xl:block xl:w-1/2">
          <div className="py-17.5 px-26 text-center">
            <div className="mb-5.5 inline-block">
              <Logo />
            </div>
            <p className="2xl:px-20">
              {t('Effortlessly manage your workspace with our comprehensive platform.')}
            </p>
            <span className="mt-15 inline-block">
              <img
                src="/lovable-uploads/c05a2912-ba94-40c9-850b-ac912e18ea1f.png"
                alt="TailAdmin"
                className="rounded-md"
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
