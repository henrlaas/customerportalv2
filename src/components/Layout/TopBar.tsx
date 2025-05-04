
import React from 'react';
import { Bell, Globe, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import '@/styles/custom-ui.css';

export const TopBar: React.FC = () => {
  const { signOut, profile, language, setLanguage } = useAuth();
  const today = new Date();

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="custom-topbar">
      <div className="custom-topbar-left">
        <h2 className="custom-page-title custom-mb-0">{getCurrentPageTitle()}</h2>
      </div>
      
      <div className="custom-topbar-center">
        <p className="custom-text-secondary custom-mb-0">{format(today, 'EEEE, dd MMMM')}</p>
      </div>
      
      <div className="custom-topbar-right">
        <div className="custom-topbar-search">
          <Search className="custom-topbar-search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="custom-topbar-search-input" 
          />
        </div>
        
        <div className="custom-dropdown">
          <button className="custom-btn custom-btn-icon">
            <Bell size={18} />
          </button>
          {/* Dropdown content would go here */}
        </div>
        
        <div className="custom-dropdown">
          <button className="custom-btn custom-btn-icon">
            <Globe size={18} />
          </button>
          <div className="custom-dropdown-content">
            <div 
              className={`custom-dropdown-item ${language === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              <span className="custom-mr-2">🇺🇸</span> English
            </div>
            <div 
              className={`custom-dropdown-item ${language === 'no' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('no')}
            >
              <span className="custom-mr-2">🇳🇴</span> Norwegian
            </div>
          </div>
        </div>
        
        <div className="custom-dropdown">
          <button className="custom-btn custom-btn-icon">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${profile?.first_name} ${profile?.last_name}`}
                className="custom-avatar custom-avatar-sm"
              />
            ) : (
              <div className="custom-avatar custom-avatar-sm">
                {profile?.first_name?.charAt(0) || 'U'}
              </div>
            )}
          </button>
          <div className="custom-dropdown-content">
            <div className="custom-dropdown-header">
              {profile?.first_name} {profile?.last_name}
              <span className="custom-text-tertiary custom-text-sm">{profile?.role}</span>
            </div>
            <div className="custom-dropdown-item" onClick={() => window.location.href = '/profile'}>
              Profile
            </div>
            <div className="custom-dropdown-item" onClick={() => window.location.href = '/settings'}>
              Settings
            </div>
            <div className="custom-dropdown-divider"></div>
            <div className="custom-dropdown-item" onClick={handleSignOut}>
              Log out
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get the current page title based on the URL
function getCurrentPageTitle(): string {
  const pathname = window.location.pathname;
  
  if (pathname.includes('/dashboard')) return 'Dashboard';
  if (pathname.includes('/campaigns')) return 'Campaigns';
  if (pathname.includes('/tasks')) return 'Tasks';
  if (pathname.includes('/time-tracking')) return 'Time Tracking';
  if (pathname.includes('/companies')) return 'Companies';
  if (pathname.includes('/deals')) return 'Deals';
  if (pathname.includes('/contracts')) return 'Contracts';
  if (pathname.includes('/media')) return 'Media';
  if (pathname.includes('/finance')) return 'Finance';
  if (pathname.includes('/workspace-management')) return 'Workspace Management';
  if (pathname.includes('/settings')) return 'Settings';
  
  return 'Dashboard';
}
