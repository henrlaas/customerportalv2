import { useState } from 'react';
import { User, Bell, Globe, Lock, CreditCard, Monitor, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { profile } = useAuth();
  
  return (
    <div className="w-full max-w-full px-4 sm:px-6 py-6 space-y-6">
      <div className="playful-d-flex playful-justify-between playful-items-center">
        <h1 className="playful-text-2xl playful-font-bold">Settings</h1>
      </div>
      
      <div className="playful-row">
        {/* Settings Sidebar */}
        <div className="playful-col playful-col-third" style={{ maxWidth: '280px' }}>
          <div className="playful-card">
            <div className="playful-card-content playful-p-0">
              <div className="playful-d-flex playful-flex-column">
                <div 
                  className={`playful-d-flex playful-items-center playful-gap-2 playful-p-3 playful-border-b ${
                    activeTab === 'profile' ? 'playful-bg-accent' : ''
                  }`}
                  onClick={() => setActiveTab('profile')}
                  style={{ cursor: 'pointer' }}
                >
                  <User size={18} />
                  <span className={activeTab === 'profile' ? 'playful-font-semibold' : ''}>
                    Profile Settings
                  </span>
                </div>
                
                <div 
                  className={`playful-d-flex playful-items-center playful-gap-2 playful-p-3 playful-border-b ${
                    activeTab === 'notifications' ? 'playful-bg-accent' : ''
                  }`}
                  onClick={() => setActiveTab('notifications')}
                  style={{ cursor: 'pointer' }}
                >
                  <Bell size={18} />
                  <span className={activeTab === 'notifications' ? 'playful-font-semibold' : ''}>
                    Notification Settings
                  </span>
                </div>
                
                <div 
                  className={`playful-d-flex playful-items-center playful-gap-2 playful-p-3 playful-border-b ${
                    activeTab === 'language' ? 'playful-bg-accent' : ''
                  }`}
                  onClick={() => setActiveTab('language')}
                  style={{ cursor: 'pointer' }}
                >
                  <Globe size={18} />
                  <span className={activeTab === 'language' ? 'playful-font-semibold' : ''}>
                    Language & Region
                  </span>
                </div>
                
                <div 
                  className={`playful-d-flex playful-items-center playful-gap-2 playful-p-3 playful-border-b ${
                    activeTab === 'security' ? 'playful-bg-accent' : ''
                  }`}
                  onClick={() => setActiveTab('security')}
                  style={{ cursor: 'pointer' }}
                >
                  <Lock size={18} />
                  <span className={activeTab === 'security' ? 'playful-font-semibold' : ''}>
                    Security
                  </span>
                </div>
                
                <div 
                  className={`playful-d-flex playful-items-center playful-gap-2 playful-p-3 playful-border-b ${
                    activeTab === 'billing' ? 'playful-bg-accent' : ''
                  }`}
                  onClick={() => setActiveTab('billing')}
                  style={{ cursor: 'pointer' }}
                >
                  <CreditCard size={18} />
                  <span className={activeTab === 'billing' ? 'playful-font-semibold' : ''}>
                    Billing & Subscription
                  </span>
                </div>
                
                <div 
                  className={`playful-d-flex playful-items-center playful-gap-2 playful-p-3 ${
                    activeTab === 'appearance' ? 'playful-bg-accent' : ''
                  }`}
                  onClick={() => setActiveTab('appearance')}
                  style={{ cursor: 'pointer' }}
                >
                  <Monitor size={18} />
                  <span className={activeTab === 'appearance' ? 'playful-font-semibold' : ''}>
                    Appearance
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Settings Content */}
        <div className="playful-col playful-col-two-thirds">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="playful-card">
              <div className="playful-card-header">
                <div className="playful-card-title">Profile Settings</div>
              </div>
              <div className="playful-card-content">
                <div className="playful-d-flex playful-mb-4">
                  <div className="playful-mr-4">
                    <div className="playful-user-avatar" style={{ width: '100px', height: '100px' }}>
                      <img
                        src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.first_name}+${profile?.last_name}&background=random&size=100`}
                        alt={`${profile?.first_name} ${profile?.last_name}`}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="playful-text-lg playful-font-semibold">{profile?.first_name} {profile?.last_name}</h3>
                    <p className="playful-text-medium">{profile?.role}</p>
                    <div className="playful-d-flex playful-mt-2">
                      <button className="playful-btn playful-btn-sm playful-btn-outline playful-mr-2">
                        Change Avatar
                      </button>
                      <button className="playful-btn playful-btn-sm playful-btn-ghost">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="playful-form-group">
                  <label className="playful-label">First Name</label>
                  <input type="text" className="playful-input" defaultValue={profile?.first_name} />
                </div>
                
                <div className="playful-form-group">
                  <label className="playful-label">Last Name</label>
                  <input type="text" className="playful-input" defaultValue={profile?.last_name} />
                </div>
                
                <div className="playful-form-group">
                  <label className="playful-label">Email</label>
                  <input type="email" className="playful-input" defaultValue={profile?.email} disabled />
                </div>
                
                <div className="playful-form-group">
                  <label className="playful-label">Role</label>
                  <input type="text" className="playful-input" defaultValue={profile?.role} disabled />
                </div>
                
                <div className="playful-d-flex playful-justify-end">
                  <button className="playful-btn playful-btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Other Settings Tabs (placeholder content) */}
          {activeTab !== 'profile' && (
            <div className="playful-card">
              <div className="playful-card-header">
                <div className="playful-card-title">
                  {activeTab === 'notifications' && 'Notification Settings'}
                  {activeTab === 'language' && 'Language & Region'}
                  {activeTab === 'security' && 'Security'}
                  {activeTab === 'billing' && 'Billing & Subscription'}
                  {activeTab === 'appearance' && 'Appearance'}
                </div>
              </div>
              <div className="playful-card-content">
                <div className="playful-d-flex playful-flex-column playful-items-center playful-justify-center playful-p-5">
                  <Settings size={48} className="playful-text-medium playful-mb-3" />
                  <h3 className="playful-text-lg playful-font-semibold playful-mb-2">Settings Coming Soon</h3>
                  <p className="playful-text-medium">This section is under development</p>
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
