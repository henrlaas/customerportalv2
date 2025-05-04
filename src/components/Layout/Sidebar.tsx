
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getSidebarItems } from './SidebarItems';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleSidebar }) => {
  const location = useLocation();
  const { isAdmin, isEmployee, profile } = useAuth();
  const sidebarItems = getSidebarItems();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img 
            src="/lovable-uploads/d7b0c9d2-fac0-45d7-8f1f-0f8977a6ced2.png" 
            alt="Logo" 
            className="sidebar-logo-image"
          />
          <span className="sidebar-logo-text">Workspace</span>
        </div>
        <button 
          className="sidebar-toggle" 
          onClick={toggleSidebar} 
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      
      <div className="sidebar-content">
        <div className="sidebar-group">
          <div className="sidebar-group-label">Navigation</div>
          <ul className="sidebar-menu">
            {sidebarItems.map((item) => (
              <li key={item.href} className="sidebar-menu-item">
                <Link 
                  to={item.href} 
                  className={`sidebar-menu-button ${location.pathname === item.href ? 'active' : ''}`}
                >
                  <span className="sidebar-menu-icon">
                    <item.icon size={20} />
                  </span>
                  <span className="sidebar-menu-text">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <img
            src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.first_name}+${profile?.last_name}&background=random`}
            alt={`${profile?.first_name} ${profile?.last_name}`}
            className="sidebar-user-avatar"
          />
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{profile?.first_name} {profile?.last_name}</div>
            <div className="sidebar-user-role">{profile?.role}</div>
          </div>
        </div>
        
        <Link to="/settings" className="sidebar-menu-button">
          <span className="sidebar-menu-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </span>
        </Link>
      </div>
    </aside>
  );
};
