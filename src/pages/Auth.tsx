
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { LoaderCircle, HelpCircle } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [loginError, setLoginError] = useState<string | null>(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  
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
    setLoginError(null); // Clear any previous errors
    
    const { error } = await signIn(data.email, data.password);
    setIsProcessing(false);
    
    if (error) {
      console.log("Login error:", error);
      setLoginError("Invalid details");
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-8">
          <AuthLogo />
        </div>
        
        {loginError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        )}
        
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
      
      {/* Help button in bottom right corner */}
      <div className="fixed bottom-6 right-6">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full h-10 w-10 bg-white shadow-md border-gray-200 hover:bg-gray-100"
          onClick={() => setHelpModalOpen(true)}
        >
          <HelpCircle className="h-5 w-5 text-gray-600" />
        </Button>
      </div>
      
      {/* Help Modal */}
      <Dialog open={helpModalOpen} onOpenChange={setHelpModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Need help?</DialogTitle>
          </DialogHeader>
          <DialogDescription className="space-y-4">
            <p>Contact our developer at henrik@box.no if you are experiencing any issues with the application.</p>
            <p className="text-sm text-gray-500 pt-4">Box Workspace v5.2</p>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
