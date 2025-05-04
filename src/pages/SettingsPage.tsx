
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Globe, Moon, Sun, Bell, Shield, User } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const SettingsPage = () => {
  const { profile, language, setLanguage } = useAuth();
  const t = useTranslation();
  const [activeTab, setActiveTab] = useState('general');

  // Theme settings
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    mobile: false
  });

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    // Simulated theme change - in a real app, you'd apply the theme
    document.documentElement.classList.toggle('dark', theme === 'light');
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">{t('Settings')}</h1>
        <p className="page-subtitle">{t('Manage your account settings and preferences')}</p>
      </div>

      <div className="card mb-6 animate-slide-in">
        <div className="card-header">
          <div className="card-title">Account Information</div>
        </div>
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative">
              <img 
                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.first_name}+${profile?.last_name}&background=random&size=128`}
                alt={`${profile?.first_name} ${profile?.last_name}`}
                className="rounded-full w-24 h-24 object-cover border-4 border-white shadow"
              />
              <button className="btn btn-icon btn-sm btn-primary absolute bottom-0 right-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                  <line x1="2" x2="22" y1="2" y2="22"></line>
                </svg>
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{profile?.first_name} {profile?.last_name}</h2>
              <p className="text-gray mb-2">{profile?.email}</p>
              <div className="flex items-center">
                <span className="badge badge-success mr-2">{profile?.role}</span>
                <span className="text-sm text-gray">Joined January 2023</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tabs mb-6">
        <div className="tabs-header">
          <button 
            className={`tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button 
            className={`tab ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </button>
          <button 
            className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button 
            className={`tab ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy
          </button>
        </div>
        
        <div className="tab-content active">
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <div className="card-header">
                  <div className="flex items-center">
                    <Globe className="mr-2" size={18} />
                    <div className="card-title">Language Preferences</div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label className="form-label">Application Language</label>
                    <div className="select-container">
                      <select 
                        value={language} 
                        onChange={handleLanguageChange} 
                        className="form-control"
                      >
                        <option value="en">English</option>
                        <option value="no">Norwegian</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date Format</label>
                    <div className="select-container">
                      <select className="form-control">
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <div className="flex items-center">
                    <User className="mr-2" size={18} />
                    <div className="card-title">Personal Information</div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={profile?.first_name || ''} 
                      placeholder="First Name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={profile?.last_name || ''} 
                      placeholder="Last Name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={profile?.email || ''} 
                      placeholder="Email Address"
                      disabled
                    />
                    <div className="form-text">Your email address is used for important notifications and cannot be changed.</div>
                  </div>
                  <button className="btn btn-primary mt-2">Save Changes</button>
                </div>
              </div>
            </div>
          )}
          
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center">
                  {theme === 'light' ? (
                    <Sun className="mr-2" size={18} />
                  ) : (
                    <Moon className="mr-2" size={18} />
                  )}
                  <div className="card-title">Theme Settings</div>
                </div>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Theme Mode</label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="radio-container">
                      <input 
                        type="radio" 
                        name="theme" 
                        checked={theme === 'light'} 
                        onChange={() => setTheme('light')} 
                      />
                      <span className="radio-mark"></span>
                      Light Mode
                    </label>
                    <label className="radio-container">
                      <input 
                        type="radio" 
                        name="theme" 
                        checked={theme === 'dark'} 
                        onChange={() => setTheme('dark')}
                      />
                      <span className="radio-mark"></span>
                      Dark Mode
                    </label>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Sidebar Position</label>
                  <div className="select-container">
                    <select className="form-control">
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Accent Color</label>
                  <div className="flex items-center gap-3 mt-2">
                    <button className="w-8 h-8 rounded-full bg-primary border-2 border-white shadow-md"></button>
                    <button className="w-8 h-8 rounded-full bg-secondary border-2 border-transparent"></button>
                    <button className="w-8 h-8 rounded-full bg-success border-2 border-transparent"></button>
                    <button className="w-8 h-8 rounded-full bg-warning border-2 border-transparent"></button>
                    <button className="w-8 h-8 rounded-full bg-error border-2 border-transparent"></button>
                  </div>
                </div>
                
                <button className="btn btn-primary mt-4">Save Appearance Settings</button>
              </div>
            </div>
          )}
          
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center">
                  <Bell className="mr-2" size={18} />
                  <div className="card-title">Notification Preferences</div>
                </div>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Email Notifications</label>
                  <div className="flex items-center justify-between">
                    <span>Receive email notifications</span>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={notifications.email}
                        onChange={() => setNotifications({...notifications, email: !notifications.email})}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Browser Notifications</label>
                  <div className="flex items-center justify-between">
                    <span>Show browser notifications</span>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={notifications.browser}
                        onChange={() => setNotifications({...notifications, browser: !notifications.browser})}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Mobile Notifications</label>
                  <div className="flex items-center justify-between">
                    <span>Push notifications to mobile device</span>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={notifications.mobile}
                        onChange={() => setNotifications({...notifications, mobile: !notifications.mobile})}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Notification Types</label>
                  <div className="mt-2">
                    <label className="checkbox-container">
                      <input type="checkbox" checked />
                      <span className="checkmark"></span>
                      Task assignments and updates
                    </label>
                    <label className="checkbox-container">
                      <input type="checkbox" checked />
                      <span className="checkmark"></span>
                      Campaign status changes
                    </label>
                    <label className="checkbox-container">
                      <input type="checkbox" checked />
                      <span className="checkmark"></span>
                      New comments and mentions
                    </label>
                    <label className="checkbox-container">
                      <input type="checkbox" />
                      <span className="checkmark"></span>
                      Marketing performance alerts
                    </label>
                  </div>
                </div>
                
                <button className="btn btn-primary mt-4">Save Notification Settings</button>
              </div>
            </div>
          )}
          
          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center">
                  <Shield className="mr-2" size={18} />
                  <div className="card-title">Privacy & Security</div>
                </div>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="password"
                      className="form-control"
                      value="************"
                      disabled
                    />
                    <button className="btn btn-outline">Change Password</button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Two-Factor Authentication</label>
                  <div className="flex items-center justify-between">
                    <span>Enable 2FA for additional security</span>
                    <label className="switch">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Session Management</label>
                  <p className="form-text mb-2">You are currently signed in on these devices:</p>
                  
                  <div className="border rounded-lg p-3 mb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Current browser</div>
                        <div className="text-sm text-gray">Chrome on Windows · Oslo, Norway · Active now</div>
                      </div>
                      <div className="badge badge-success">Current</div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">iPhone 14</div>
                        <div className="text-sm text-gray">iOS App · Oslo, Norway · 2 days ago</div>
                      </div>
                      <button className="btn btn-ghost btn-sm text-error">Sign out</button>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Data & Privacy</label>
                  <div className="flex flex-col gap-2 mt-2">
                    <button className="btn btn-outline">Download My Data</button>
                    <button className="btn btn-outline btn-danger">Delete Account</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
