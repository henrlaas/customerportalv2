
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
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAdmin, isEmployee, profile } = useAuth();
  const sidebarItems = getSidebarItems();

  return (
    <ShadcnSidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-gray-800">Marketing Portal</h1>
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
                <Link to={item.href} className="flex items-center gap-2">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {profile && (
          <div className="p-4 border-t">
            <div className="text-sm font-medium">
              {profile.first_name} {profile.last_name}
            </div>
            <div className="text-xs text-gray-500">
              {isAdmin ? 'Admin' : (isEmployee ? 'Employee' : 'Client')}
            </div>
          </div>
        )}
      </SidebarFooter>
    </ShadcnSidebar>
  );
};
