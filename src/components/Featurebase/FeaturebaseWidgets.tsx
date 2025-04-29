
import { useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";

const FeaturebaseWidgets = () => {
  const { profile } = useAuth();
  const userName = profile?.first_name || '';
  const userEmail = profile?.id ? `${profile.id}@example.com` : ''; // Use actual email if available

  useEffect(() => {
    const win = window as any;
    
    // Initialize Featurebase function if it doesn't exist
    if (typeof win.Featurebase !== "function") {
      win.Featurebase = function () {
        (win.Featurebase.q = win.Featurebase.q || []).push(arguments);
      };
    }
    
    // Initialize changelog widget
    win.Featurebase("init_changelog_widget", {
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

    // Initialize feedback widget
    win.Featurebase("initialize_feedback_widget", {
      organization: "boxmarketing",
      theme: "light",
      placement: "left",
      email: userEmail,
      locale: "en",
      metadata: null
    });
  }, [userName, userEmail]);

  // Function to manually open the changelog popup
  const openChangelogPopup = () => {
    const win = window as any;
    if (typeof win.Featurebase === "function") {
      win.Featurebase('manually_open_changelog_popup');
      console.log('Opening changelog popup');
    } else {
      console.error('Featurebase not initialized');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <Button 
        variant="primary"
        className="flex items-center space-x-2"
        onClick={openChangelogPopup}
      >
        <span>What's new</span>
        <span id="fb-update-badge"></span>
      </Button>
      
      {/* Feedback widget will use its floating button due to placement: "left" */}
    </div>
  );
};

export default FeaturebaseWidgets;
