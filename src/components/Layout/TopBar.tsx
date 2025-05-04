
import { Bell, Globe, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { useState } from 'react';

interface TopBarProps {
  onToggleSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const { signOut, profile, language, setLanguage } = useAuth();
  const today = new Date();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const toggleLangDropdown = () => {
    setLangDropdownOpen(!langDropdownOpen);
    if (userDropdownOpen) setUserDropdownOpen(false);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
    if (langDropdownOpen) setLangDropdownOpen(false);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setLangDropdownOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    setUserDropdownOpen(false);
  };

  return (
    <div className="playful-topbar">
      <div className="playful-d-flex playful-items-center playful-gap-3">
        <button className="playful-menu-trigger" onClick={onToggleSidebar}>
          <Menu size={20} />
        </button>
        
        <div>
          <h2 className="playful-font-medium playful-text-lg">Hi there, {profile?.first_name}</h2>
          <p className="playful-text-medium playful-text-sm">{format(today, 'EEEE, dd MMMM')}</p>
        </div>
      </div>
      
      <div className="playful-topbar-right">
        <div className="playful-search">
          <input 
            className="playful-search-input" 
            placeholder="Search..." 
          />
          <span className="playful-search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
        </div>
        
        <div className="playful-notification">
          <Bell size={20} />
          <span className="playful-notification-badge"></span>
        </div>
        
        <div className="playful-dropdown" onClick={toggleLangDropdown}>
          <div className="playful-notification">
            <Globe size={20} />
          </div>
          {langDropdownOpen && (
            <div className="playful-dropdown-menu">
              <div className="playful-dropdown-item" onClick={() => handleLanguageChange('en')}>
                <span className="playful-mr-2">🇺🇸</span> English
              </div>
              <div className="playful-dropdown-item" onClick={() => handleLanguageChange('no')}>
                <span className="playful-mr-2">🇳🇴</span> Norwegian
              </div>
            </div>
          )}
        </div>
        
        <div className="playful-dropdown" onClick={toggleUserDropdown}>
          <div className="playful-user">
            <div className="playful-user-avatar">
              <img
                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.first_name}+${profile?.last_name}&background=random`}
                alt={`${profile?.first_name} ${profile?.last_name}`}
              />
            </div>
            <div className="playful-user-info">
              <div className="playful-user-name">{profile?.first_name} {profile?.last_name}</div>
              <div className="playful-user-role">{profile?.role}</div>
            </div>
          </div>
          
          {userDropdownOpen && (
            <div className="playful-dropdown-menu">
              <div className="playful-dropdown-item" onClick={() => window.location.href = '/profile'}>
                Profile
              </div>
              <div className="playful-dropdown-item" onClick={() => window.location.href = '/settings'}>
                Settings
              </div>
              <div className="playful-dropdown-divider"></div>
              <div className="playful-dropdown-item" onClick={handleSignOut}>
                Log out
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
