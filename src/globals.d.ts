
// Global TypeScript Declarations

// Fix error with UserProfile type
declare module '@supabase/supabase-js' {
  interface UserProfile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    role: 'admin' | 'employee' | 'client';
    email: string | null; // Add email property
    phone_number?: string | null;
  }
}

// Global PlayfulUI utilities
interface PlayfulUI {
  validateForm: (form: HTMLFormElement) => boolean;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void;
  createBarChart: (container: HTMLElement, data: any[]) => void;
}

interface Window {
  PlayfulUI?: PlayfulUI;
}
