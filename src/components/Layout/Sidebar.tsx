
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
    <ShadcnSidebar className="border-r bg-whiter dark:bg-boxdark dark:border-strokedark">
      <SidebarHeader className="p-5 border-b border-stroke dark:border-strokedark">
        <Logo />
      </SidebarHeader>
      <SidebarContent className="p-4">
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
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
                    location.pathname === item.href 
                      ? 'bg-primary text-white dark:bg-meta-4' 
                      : 'text-gray-700 dark:text-bodydark hover:bg-primary/10'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${location.pathname === item.href ? 'text-white' : 'text-primary dark:text-bodydark'}`} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 mt-auto border-stroke dark:border-strokedark">
        <SidebarMenuButton 
          asChild
          isActive={location.pathname === '/settings'}
          tooltip="Settings"
        >
          <Link 
            to="/settings" 
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md ${
              location.pathname === '/settings' 
                ? 'bg-primary text-white dark:bg-meta-4' 
                : 'text-gray-700 dark:text-bodydark hover:bg-primary/10'
            }`}
          >
            <Settings className={`h-5 w-5 ${location.pathname === '/settings' ? 'text-white' : 'text-primary dark:text-bodydark'}`} />
            <span>Settings</span>
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};
