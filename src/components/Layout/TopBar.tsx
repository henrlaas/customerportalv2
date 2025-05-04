
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Bell, Moon, Sun, ChevronDown } from 'lucide-react';

export const TopBar: React.FC = () => {
  const { signOut, profile } = useAuth();
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Here you would actually toggle the dark mode
  };

  return (
    <div className="header">
      <div className="header-left">
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search or type command..." 
          />
          <Search className="search-icon" size={18} />
          <span className="search-shortcut">⌘K</span>
        </div>
      </div>
      
      <div className="header-right">
        <button className="btn-icon" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button className="btn-icon notification-button">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="dropdown">
          <div 
            className="user-menu" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="user-avatar">
              <img
                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.first_name}+${profile?.last_name}&background=random`}
                alt={`${profile?.first_name} ${profile?.last_name}`}
              />
            </div>
            <div className="user-info d-none d-md-block">
              <div className="user-name">
                {profile?.first_name} {profile?.last_name}
              </div>
              <div className="user-role text-sm text-gray">
                {profile?.role}
              </div>
            </div>
            <ChevronDown size={16} className="dropdown-indicator" />
          </div>
          
          {isDropdownOpen && (
            <div className="dropdown-menu show">
              <div className="dropdown-header">
                <div className="dropdown-user-name">
                  {profile?.first_name} {profile?.last_name}
                </div>
                <div className="dropdown-user-email text-sm text-gray">
                  {profile?.email}
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <a href="/profile" className="dropdown-item">Profile</a>
              <a href="/settings" className="dropdown-item">Settings</a>
              <div className="dropdown-divider"></div>
              <a href="#" className="dropdown-item" onClick={() => signOut()}>Log out</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
