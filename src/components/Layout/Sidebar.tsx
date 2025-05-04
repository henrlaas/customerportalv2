
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getSidebarItems } from './SidebarItems';
import { 
  ChevronLeft, 
  ChevronRight,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const sidebarItems = getSidebarItems();
  const [collapsed, setCollapsed] = React.useState(false);

  // Group sidebar items by category
  const menuItems = sidebarItems.filter(item => !item.category || item.category === 'MENU');

  return (
    <div className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="logo-container">
        {!collapsed && (
          <div className="logo">
            <Link to="/dashboard" className="d-flex align-items-center">
              <div className="sidebar-logo">
                <span className="text-primary">T</span>
                {!collapsed && <span className="logo-text">TailAdmin</span>}
              </div>
            </Link>
          </div>
        )}
        {collapsed && (
          <div className="sidebar-logo-small">
            <span className="text-primary">T</span>
          </div>
        )}
      </div>
      
      <div className="sidebar-menu">
        <div className="sidebar-header">MENU</div>
        
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`sidebar-item ${location.pathname === item.href ? 'active' : ''}`}
          >
            <item.icon className="sidebar-icon" />
            {!collapsed && <span>{item.title}</span>}
          </Link>
        ))}
      </div>
      
      <div className="sidebar-menu">
        <div className="sidebar-header">SUPPORT</div>
        
        <Link to="/chat" className={`sidebar-item ${location.pathname === '/chat' ? 'active' : ''}`}>
          <span className="sidebar-icon">💬</span>
          {!collapsed && <span>Chat</span>}
        </Link>
        
        <Link to="/email" className={`sidebar-item ${location.pathname === '/email' ? 'active' : ''}`}>
          <span className="sidebar-icon">📧</span>
          {!collapsed && <span>Email</span>}
        </Link>
        
        <Link to="/invoice" className={`sidebar-item ${location.pathname === '/invoice' ? 'active' : ''}`}>
          <span className="sidebar-icon">📄</span>
          {!collapsed && <span>Invoice</span>}
        </Link>
      </div>
      
      <div className="sidebar-menu">
        <div className="sidebar-header">OTHERS</div>
        
        <Link to="/charts" className={`sidebar-item ${location.pathname === '/charts' ? 'active' : ''}`}>
          <span className="sidebar-icon">📊</span>
          {!collapsed && <span>Charts</span>}
        </Link>
        
        <Link to="/ui-elements" className={`sidebar-item ${location.pathname === '/ui-elements' ? 'active' : ''}`}>
          <span className="sidebar-icon">🎨</span>
          {!collapsed && <span>UI Elements</span>}
        </Link>
        
        <Link to="/authentication" className={`sidebar-item ${location.pathname === '/authentication' ? 'active' : ''}`}>
          <span className="sidebar-icon">🔒</span>
          {!collapsed && <span>Authentication</span>}
        </Link>
      </div>
      
      <div
        className="collapse-button"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </div>
    </div>
  );
};

export default Sidebar;
