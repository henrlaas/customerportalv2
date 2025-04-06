
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Define form schema for login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Auth = () => {
  const { signIn, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const t = useTranslation();

  // If user is already logged in, redirect to dashboard
  if (session) {
    navigate('/dashboard');
    return null;
  }

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (data: LoginFormValues) => {
    const { error } = await signIn(data.email, data.password);
    if (!error) {
      navigate('/dashboard');
    }
  };

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
