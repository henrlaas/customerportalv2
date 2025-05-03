
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getSidebarItems } from './SidebarItems';
import {
  Sidebar as ShadcnSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Logo } from './Logo';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAdmin, isEmployee, profile } = useAuth();
  const sidebarItems = getSidebarItems();

  return (
    <ShadcnSidebar className="border-r border-sidebar-border bg-teal text-white">
      <SidebarHeader className="p-6">
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {sidebarItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton 
                asChild
                isActive={location.pathname === item.href}
                tooltip={item.title}
              >
                <Link 
                  to={item.href} 
                  className={`sidebar-item ${
                    location.pathname === item.href 
                      ? 'bg-coral text-black' 
                      : 'text-white hover:bg-teal-700'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${location.pathname === item.href ? 'text-black' : 'text-white'}`} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-6 mt-auto">
        <SidebarMenuButton 
          asChild
          isActive={location.pathname === '/settings'}
          tooltip="Settings"
        >
          <Link 
            to="/settings" 
            className={`sidebar-item ${
              location.pathname === '/settings' 
                ? 'bg-coral text-black' 
                : 'text-white hover:bg-teal-700'
            }`}
          >
            <Settings className={`h-5 w-5 ${location.pathname === '/settings' ? 'text-black' : 'text-white'}`} />
            <span>Settings</span>
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};
