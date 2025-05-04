
import { Bell, Globe, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

export const TopBar: React.FC = () => {
  const { signOut, profile, isAdmin, isEmployee, language, setLanguage } = useAuth();
  const today = new Date();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark-mode');
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setShowLanguageDropdown(false);
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h2 className="greeting-text">Hi there, {profile?.first_name}</h2>
        <p className="date-text">{format(today, 'EEEE, dd MMMM')}</p>
      </div>
      
      <div className="topbar-right">
        <button className="btn btn-icon btn-ghost" aria-label="Notifications">
          <Bell size={20} />
        </button>
        
        <div className="dropdown">
          <button 
            className="btn btn-icon btn-ghost dropdown-toggle" 
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            aria-label="Language"
          >
            <Globe size={20} />
          </button>
          <div className={`dropdown-menu ${showLanguageDropdown ? 'show' : ''}`}>
            <div className="dropdown-item" onClick={() => handleLanguageChange('en')}>
              <span className="flag-icon">🇺🇸</span>
              English
              {language === 'en' && <span className="check-icon">✓</span>}
            </div>
            <div className="dropdown-item" onClick={() => handleLanguageChange('no')}>
              <span className="flag-icon">🇳🇴</span>
              Norwegian
              {language === 'no' && <span className="check-icon">✓</span>}
            </div>
          </div>
        </div>
        
        <button 
          className="btn btn-icon btn-ghost"
          onClick={toggleTheme}
          aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="dropdown">
          <button 
            className="dropdown-toggle user-profile-button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            <img
              src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.first_name}+${profile?.last_name}&background=random`}
              alt={`${profile?.first_name} ${profile?.last_name}`}
              className="user-avatar"
            />
          </button>
          <div className={`dropdown-menu ${showUserDropdown ? 'show' : ''}`}>
            <div className="user-dropdown-header">
              {profile?.first_name} {profile?.last_name}
              <p className="user-role">{profile?.role}</p>
            </div>
            <div className="dropdown-divider"></div>
            <a href="/profile" className="dropdown-item">Profile</a>
            <a href="/settings" className="dropdown-item">Settings</a>
            <div className="dropdown-divider"></div>
            <div className="dropdown-item" onClick={() => signOut()}>Log out</div>
          </div>
        </div>
      </div>
    </div>
  );
};
