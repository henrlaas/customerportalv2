
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getSidebarItems } from './SidebarItems';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Logo } from './Logo';
import { useState, useEffect } from 'react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAdmin, isEmployee, profile } = useAuth();
  const sidebarItems = getSidebarItems();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Load collapsed state from localStorage
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState === 'true') {
      setCollapsed(true);
    }

    // Handle window resize for mobile
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    const isMobile = window.innerWidth < 1024;
    
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      const newState = !collapsed;
      setCollapsed(newState);
      localStorage.setItem('sidebar-collapsed', String(newState));
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={`mobile-sidebar-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      ></div>
      
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <Logo showText={!collapsed} />
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>
        
        <div className="sidebar-content">
          {sidebarItems.map((section, index) => (
            <div className="sidebar-section" key={index}>
              {section.title && (
                <div className="sidebar-section-title">{section.title}</div>
              )}
              <ul className="sidebar-menu">
                {section.items.map((item) => (
                  <li className="sidebar-menu-item" key={item.href}>
                    <Link 
                      to={item.href} 
                      className={`sidebar-menu-link ${
                        location.pathname === item.href ? 'active' : ''
                      }`}
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
          ))}
          
          <div className="sidebar-section">
            <ul className="sidebar-menu">
              <li className="sidebar-menu-item">
                <Link 
                  to="/settings" 
                  className={`sidebar-menu-link ${
                    location.pathname === '/settings' ? 'active' : ''
                  }`}
                >
                  <span className="sidebar-menu-icon">
                    <Settings size={20} />
                  </span>
                  <span className="sidebar-menu-text">Settings</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              <img
                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.first_name}+${profile?.last_name}&background=random`}
                alt={`${profile?.first_name} ${profile?.last_name}`}
              />
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{profile?.first_name} {profile?.last_name}</div>
              <div className="sidebar-user-role">{profile?.role}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
