
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Define types for profile data
type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'employee' | 'client';
  language: string;
  created_at: string;
  updated_at: string;
}

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  isClient: boolean;
  language: string;
  setLanguage: (lang: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Fetch user profile in a separate execution context to avoid Supabase auth deadlock
          setTimeout(async () => {
            await fetchProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // Use type assertion to avoid TypeScript errors with Supabase client
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single() as { data: Profile | null, error: any };

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive'
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName
          }
        }
      });

      if (error) throw error;
      
      toast({
        title: 'Account created',
        description: 'Please check your email to confirm your account',
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive'
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out',
      });
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      toast({
        title: 'Sign out failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const setLanguage = async (lang: string) => {
    if (!user) return;
    
    try {
      // Use type assertion to avoid TypeScript errors with Supabase client
      const { error } = await supabase
        .from('profiles')
        .update({ language: lang })
        .eq('id', user.id) as { data: any, error: any };
      
      if (error) throw error;
      
      // Update local profile state
      setProfile((prev: any) => ({ ...prev, language: lang }));
      
      toast({
        title: 'Language updated',
        description: `Interface language set to ${lang === 'en' ? 'English' : 'Norwegian'}`,
      });
    } catch (error: any) {
      console.error('Error updating language:', error.message);
      toast({
        title: 'Failed to update language',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const isAdmin = profile?.role === 'admin';
  const isEmployee = profile?.role === 'employee';
  const isClient = profile?.role === 'client';
  const language = profile?.language || 'en';

  const value = {
    session,
    user,
    profile,
    signIn,
    signUp,
    signOut,
    loading,
    isAdmin,
    isEmployee,
    isClient,
    language,
    setLanguage
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
