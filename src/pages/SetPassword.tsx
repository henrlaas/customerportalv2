
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
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
import { Logo } from '@/components/Layout/Logo';

// Define form schema for password setting
const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const SetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const t = useTranslation();

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Parse URL params or hash to get invitation token and type
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchToken = searchParams.get('token');
    const searchType = searchParams.get('type');
    
    // Check URL params first
    if (searchToken && (searchType === 'invite' || searchType === 'recovery')) {
      setToken(searchToken);
      setType(searchType);
      setLoading(false);
      return;
    }
    
    // Fallback to hash format
    if (location.hash) {
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const hashToken = hashParams.get('token');
      const hashType = hashParams.get('type');
      
      if (hashToken && (hashType === 'invite' || hashType === 'recovery')) {
        setToken(hashToken);
        setType(hashType);
        setLoading(false);
        return;
      }
    }
    
    // If no valid token found, show error and redirect
    toast({
      title: t('Invalid invitation'),
      description: t('This invitation link is invalid or has expired.'),
      variant: "destructive",
    });
    setTimeout(() => navigate('/auth'), 3000);
  }, [location, navigate, toast, t]);

  const handleSetPassword = async (data: PasswordFormValues) => {
    if (!token) return;
    
    setIsProcessing(true);
    
    try {
      let result;
      
      if (type === 'invite') {
        // Handle invite - updateUser accepts password property
        result = await supabase.auth.updateUser({
          password: data.password
        });
      } else {
        // Handle recovery - resetPasswordForEmail doesn't accept password parameter
        // Corrected to match the API - don't pass password here
        result = await supabase.auth.resetPasswordForEmail(token);
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: t('Success'),
        description: t('Your password has been set. You can now log in.'),
      });
      
      navigate('/auth');
    } catch (error: any) {
      console.error('Error setting password:', error);
      toast({
        title: t('Error'),
        description: error?.message || t('There was an error setting your password.'),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex min-h-screen flex-wrap items-center">
        <div className="w-full xl:w-1/2">
          <div className="px-10 py-12 sm:p-22.5 xl:p-27.5">
            <div className="mb-12 flex justify-center">
              <Logo />
            </div>
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
              {t('Set your password')}
            </h2>
            <p className="mb-9 text-base leading-7 text-body-color">
              {type === 'invite' 
                ? t('Please set a password to access your account.') 
                : t('Reset your password.')}
            </p>

            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handleSetPassword)} className="space-y-5">
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2.5 block font-medium text-black dark:text-white">
                        {t('New Password')}
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

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2.5 block font-medium text-black dark:text-white">
                        {t('Confirm Password')}
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
                    {t('Set Password')}
                  </span>
                  {isProcessing && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <LoaderCircle className="animate-spin" size={24} />
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
        <div className="hidden w-full xl:block xl:w-1/2">
          <div className="py-17.5 px-26 text-center">
            <div className="mb-5.5 inline-block">
              <Logo />
            </div>
            <p className="2xl:px-20">
              {t('Welcome to Workspace. Please set your password to continue.')}
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

export default SetPassword;
