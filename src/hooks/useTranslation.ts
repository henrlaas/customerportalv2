
import { useAuth } from '@/contexts/AuthContext';

// Define translations for both languages
const translations: Record<string, Record<string, string>> = {
  en: {
    'Dashboard': 'Dashboard',
    'Tasks': 'Tasks',
    'Time Tracking': 'Time Tracking',
    'Companies': 'Companies',
    'Contracts': 'Contracts',
    'Deals': 'Deals',
    'User Management': 'User Management',
    'Settings': 'Settings',
    'Email': 'Email',
    'Password': 'Password',
    'Sign In': 'Sign In',
    'Sign Up': 'Sign Up',
    'First Name': 'First Name',
    'Last Name': 'Last Name',
    'Already have an account?': 'Already have an account?',
    'Don\'t have an account?': 'Don\'t have an account?',
    'Email is required': 'Email is required',
    'Password is required': 'Password is required',
    'First Name is required': 'First Name is required',
    'Last Name is required': 'Last Name is required',
    'Create Account': 'Create Account',
    'Log In': 'Log In',
    'Marketing Agency Customer Portal': 'Marketing Agency Customer Portal',
  },
  no: {
    'Dashboard': 'Dashbord',
    'Tasks': 'Oppgaver',
    'Time Tracking': 'Tidssporing',
    'Companies': 'Bedrifter',
    'Contracts': 'Kontrakter',
    'Deals': 'Avtaler',
    'User Management': 'Brukerstyring',
    'Settings': 'Innstillinger',
    'Email': 'E-post',
    'Password': 'Passord',
    'Sign In': 'Logg Inn',
    'Sign Up': 'Registrer',
    'First Name': 'Fornavn',
    'Last Name': 'Etternavn',
    'Already have an account?': 'Har du allerede en konto?',
    'Don\'t have an account?': 'Har du ikke en konto?',
    'Email is required': 'E-post er påkrevd',
    'Password is required': 'Passord er påkrevd',
    'First Name is required': 'Fornavn er påkrevd',
    'Last Name is required': 'Etternavn er påkrevd',
    'Create Account': 'Opprett konto',
    'Log In': 'Logg Inn',
    'Marketing Agency Customer Portal': 'Markedsføringsbyrå Kundeportal',
  },
};

export const useTranslation = () => {
  const { language } = useAuth();
  const currentLang = language || 'en';

  // Translation function
  const t = (key: string): string => {
    return translations[currentLang][key] || key;
  };

  return t;
};
