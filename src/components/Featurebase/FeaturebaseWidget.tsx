
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

declare global {
  interface Window {
    Featurebase: {
      (...args: any[]): void;
      q?: any[];
    }
  }
}

const FeaturebaseWidget = () => {
  const { profile } = useAuth();
  const userName = profile?.first_name || 'User';

  useEffect(() => {
    // Initialize Featurebase SDK if it doesn't exist
    if (typeof window !== 'undefined') {
      const loadFeaturebaseScript = () => {
        if (!document.getElementById('featurebase-sdk')) {
          const script = document.createElement('script');
          script.id = 'featurebase-sdk';
          script.src = 'https://do.featurebase.app/js/sdk.js';
          script.async = true;
          document.head.appendChild(script);
        }
      };

      if (!window.Featurebase) {
        window.Featurebase = function() {
          (window.Featurebase.q = window.Featurebase.q || []).push(arguments);
        } as any;
        loadFeaturebaseScript();
      }

      // Initialize the changelog widget with the user's first name
      window.Featurebase('init_changelog_widget', {
        organization: "boxmarketing",
        dropdown: {
          enabled: true,
          placement: "right",
        },
        popup: {
          enabled: true,
          usersName: userName,
          autoOpenForNewUpdates: true,
        },
        theme: "light",
        locale: "en",
      });
    }

    // Cleanup function
    return () => {
      // Optional: Clean up any event listeners or remove the script when component unmounts
      const script = document.getElementById('featurebase-sdk');
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      
      // Reset Featurebase if needed
      if (window.Featurebase && window.Featurebase.q) {
        window.Featurebase.q = [];
      }
    };
  }, [userName]); // Re-initialize when the user name changes

  return null; // This component doesn't render anything visible
};

export default FeaturebaseWidget;
