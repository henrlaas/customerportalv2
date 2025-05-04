
import React from 'react';
import { Bell, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export const TopBar: React.FC = () => {
  const { signOut, profile, language, setLanguage } = useAuth();
  const today = new Date();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'no' : 'en');
  };

  return (
    <div className="app-header">
      <div>
        <h2 className="text-lg font-medium">Hi there, {profile?.first_name}</h2>
        <p className="text-sm text-gray">{format(today, 'EEEE, dd MMMM')}</p>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="btn btn-icon btn-ghost">
          <Bell size={20} />
        </button>
        
        <button 
          className="btn btn-icon btn-ghost"
          onClick={toggleLanguage}
          aria-label="Change language"
        >
          <Globe size={20} />
        </button>
        
        <div className="dropdown tooltip tooltip-bottom">
          <button className="tooltip-trigger">
            <img
              src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.first_name}+${profile?.last_name}&background=random`}
              alt={`${profile?.first_name} ${profile?.last_name}`}
              className="rounded-full w-10 h-10 object-cover"
            />
            <div className="tooltip-content">
              Profile settings
            </div>
          </button>
          
          <div className="dropdown-menu">
            <div className="dropdown-header">
              <div className="font-semibold">{profile?.first_name} {profile?.last_name}</div>
              <div className="text-xs text-gray-500">{profile?.role}</div>
            </div>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item" onClick={() => window.location.href = '/profile'}>Profile</button>
            <button className="dropdown-item" onClick={() => window.location.href = '/settings'}>Settings</button>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item" onClick={() => signOut()}>Log out</button>
          </div>
        </div>
      </div>
    </div>
  );
};
