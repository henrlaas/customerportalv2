
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getSidebarItems } from './SidebarItems';
import { Link } from 'react-router-dom';
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/custom-ui.css';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const sidebarItems = getSidebarItems();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`custom-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="custom-sidebar-header">
        <div className="custom-sidebar-logo">
          <img 
            src="/lovable-uploads/d7b0c9d2-fac0-45d7-8f1f-0f8977a6ced2.png" 
            alt="Logo" 
            className="h-8"
          />
          <span className="custom-sidebar-logo-text">BOX</span>
        </div>
        <button className="custom-sidebar-toggle" onClick={toggleSidebar}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="custom-sidebar-menu">
        {sidebarItems.map((item) => (
          <li className="custom-sidebar-menu-item" key={item.href}>
            <Link 
              to={item.href} 
              className={`custom-sidebar-menu-link ${location.pathname === item.href ? 'active' : ''}`}
            >
              <item.icon className="custom-sidebar-menu-icon" size={20} />
              <span className="custom-sidebar-menu-text">{item.title}</span>
            </Link>
          </li>
        ))}
      </nav>

      <div className="custom-sidebar-footer">
        <div className="custom-sidebar-user">
          <div className="custom-avatar">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${profile?.first_name} ${profile?.last_name}`}
              />
            ) : (
              profile?.first_name?.charAt(0) || 'U'
            )}
          </div>
          <div className="custom-sidebar-user-info">
            <div className="custom-sidebar-user-name">
              {profile?.first_name} {profile?.last_name}
            </div>
            <div className="custom-sidebar-user-role">
              {profile?.role}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
