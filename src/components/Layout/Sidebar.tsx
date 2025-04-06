
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

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAdmin, isEmployee, profile } = useAuth();
  const sidebarItems = getSidebarItems();

  return (
    <ShadcnSidebar className="border-r bg-white">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="bg-black text-white p-2 rounded">
            <span className="text-xl font-bold">W</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Workspace</h1>
        </div>
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
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg ${
                    location.pathname === item.href 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${location.pathname === item.href ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 mt-auto">
        <SidebarMenuButton 
          asChild
          isActive={location.pathname === '/settings'}
          tooltip="Settings"
        >
          <Link 
            to="/settings" 
            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg ${
              location.pathname === '/settings' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings className={`h-5 w-5 ${location.pathname === '/settings' ? 'text-blue-600' : 'text-gray-500'}`} />
            <span>Settings</span>
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};
