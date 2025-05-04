
// Global type definitions

declare global {
  interface Window {
    playfulUI?: {
      toggleSidebar: () => void;
      createToast: (type: string, message: string, title?: string) => void;
    };
  }
  
  // Extend existing interfaces if needed
  interface UserProfile {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    role: 'admin' | 'employee' | 'client';
    email?: string; // Added to fix SettingsPage email property error
  }
}

export {};
