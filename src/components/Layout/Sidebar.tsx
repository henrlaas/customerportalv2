
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
  const { isAdmin, isEmployee } = useAuth();
  const sidebarItems = getSidebarItems();

  return (
    <ShadcnSidebar className="border-r bg-white max-w-[250px]">
      <SidebarHeader className="p-4 border-b">
        <Logo />
      </SidebarHeader>
      <SidebarContent className="p-0">
        <div className="py-4">
          <p className="px-4 mb-2 text-xs font-medium uppercase text-gray-400">Menu</p>
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
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-none ${
                      location.pathname === item.href 
                        ? 'bg-primary-50 text-primary border-l-4 border-primary' 
                        : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${location.pathname === item.href ? 'text-primary' : 'text-gray-500'}`} />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 mt-auto">
        <SidebarMenuButton 
          asChild
          isActive={location.pathname === '/settings'}
          tooltip="Settings"
        >
          <Link 
            to="/settings" 
            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-none ${
              location.pathname === '/settings' 
                ? 'bg-primary-50 text-primary border-l-4 border-primary' 
                : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
            }`}
          >
            <Settings className={`h-5 w-5 ${location.pathname === '/settings' ? 'text-primary' : 'text-gray-500'}`} />
            <span>Settings</span>
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};
