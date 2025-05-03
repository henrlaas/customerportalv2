
import { useState } from 'react';
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
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAdmin, isEmployee, profile } = useAuth();
  const sidebarItems = getSidebarItems();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ShadcnSidebar className="border-r border-r-evergreen/30 bg-evergreen transition-all duration-300 relative" 
      collapsed={collapsed}
      style={{ width: collapsed ? '80px' : '240px' }}
    >
      <SidebarHeader className="p-4 flex justify-between items-center">
        <Logo showText={!collapsed} className={collapsed ? 'justify-center' : ''} />
      </SidebarHeader>

      <button 
        className="absolute -right-3 top-16 bg-evergreen text-white rounded-full p-1 shadow-md z-10 flex items-center justify-center"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      <SidebarContent>
        <SidebarMenu>
          {sidebarItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton 
                asChild
                isActive={location.pathname === item.href}
                tooltip={collapsed ? item.title : undefined}
              >
                <Link 
                  to={item.href} 
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200",
                    location.pathname === item.href 
                      ? "bg-sidebar-accent/80 text-white" 
                      : "text-white/80 hover:bg-sidebar-accent/50 hover:text-white",
                    collapsed && "justify-center"
                  )}
                >
                  <item.icon className={cn(
                    "h-6 w-6 transition-all",
                    location.pathname === item.href ? "text-white" : "text-white/80",
                    collapsed && "h-7 w-7"
                  )} />
                  {!collapsed && <span className="animate-slide-in">{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border/30 p-4 mt-auto">
        <SidebarMenuButton 
          asChild
          isActive={location.pathname === '/settings'}
          tooltip={collapsed ? "Settings" : undefined}
        >
          <Link 
            to="/settings" 
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200",
              location.pathname === '/settings' 
                ? "bg-sidebar-accent/80 text-white" 
                : "text-white/80 hover:bg-sidebar-accent/50 hover:text-white",
              collapsed && "justify-center"
            )}
          >
            <Settings className={cn(
              "h-6 w-6 transition-all", 
              location.pathname === '/settings' ? "text-white" : "text-white/80",
              collapsed && "h-7 w-7"
            )} />
            {!collapsed && <span>Settings</span>}
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};
