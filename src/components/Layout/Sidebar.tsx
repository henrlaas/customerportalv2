
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getSidebarItems } from './SidebarItems';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Logo } from './Logo';

interface SidebarProps {
  collapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const location = useLocation();
  const { isAdmin, isEmployee } = useAuth();
  const sidebarItems = getSidebarItems();

  return (
    <div className={`playful-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="playful-sidebar-header">
        <Logo />
      </div>
      
      <div className="playful-sidebar-content">
        <ul className="playful-nav">
          {sidebarItems.map((item) => (
            <li 
              key={item.href} 
              className={`playful-nav-item ${location.pathname === item.href ? 'active' : ''}`}
            >
              <Link to={item.href} className="playful-nav-link">
                <span className="playful-nav-icon">
                  <item.icon size={20} />
                </span>
                <span className="playful-nav-text">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="playful-sidebar-footer">
        <Link 
          to="/settings"
          className={`playful-nav-link ${location.pathname === '/settings' ? 'active' : ''}`}
        >
          <span className="playful-nav-icon">
            <Settings size={20} />
          </span>
          <span className="playful-nav-text">Settings</span>
        </Link>
      </div>
    </div>
  );
};
