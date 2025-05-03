
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
    <div 
      className="relative transition-all duration-300 ease-in-out" 
      style={{ width: collapsed ? '80px' : '240px' }}
    >
      <ShadcnSidebar 
        className="border-r border-r-evergreen/30 bg-evergreen transition-all duration-300"
      >
        <SidebarHeader className="p-4 flex justify-center items-center">
          <Logo collapsed={collapsed} />
        </SidebarHeader>

        <button 
          className="absolute -right-3 top-16 bg-evergreen text-white rounded-full p-1 shadow-md z-10 flex items-center justify-center"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>

        <SidebarContent>
          <SidebarMenu>
            {sidebarItems.map((item) => (
              <SidebarMenuItem key={item.href} className="my-2"> {/* Added my-2 for more space between items */}
                <SidebarMenuButton 
                  asChild
                  isActive={location.pathname === item.href}
                  tooltip={collapsed ? item.title : undefined}
                >
                  <Link 
                    to={item.href} 
                    className={cn(
                      "flex items-center gap-4 px-4 py-4 text-xl font-medium rounded-lg transition-all duration-200", /* Increased text size to text-xl and padding-y to py-4 */
                      location.pathname === item.href 
                        ? "bg-sidebar-accent/80 text-white" 
                        : "text-white/80 hover:bg-sidebar-accent/50 hover:text-white",
                      collapsed && "justify-center"
                    )}
                  >
                    <item.icon className={cn(
                      "h-8 w-8 transition-all", /* Increased icon size from h-7 w-7 to h-8 w-8 */
                      location.pathname === item.href ? "text-white" : "text-white/80",
                      collapsed && "h-9 w-9" /* Increased collapsed icon size from h-8 w-8 to h-9 w-9 */
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
                "flex items-center gap-4 px-4 py-4 text-xl font-medium rounded-lg transition-all duration-200", /* Increased text size to text-xl and padding-y to py-4 */
                location.pathname === '/settings' 
                  ? "bg-sidebar-accent/80 text-white" 
                  : "text-white/80 hover:bg-sidebar-accent/50 hover:text-white",
                collapsed && "justify-center"
              )}
            >
              <Settings className={cn(
                "h-8 w-8 transition-all", /* Increased icon size from h-7 w-7 to h-8 w-8 */
                location.pathname === '/settings' ? "text-white" : "text-white/80",
                collapsed && "h-9 w-9" /* Increased collapsed icon size from h-8 w-8 to h-9 w-9 */
              )} />
              {!collapsed && <span>Settings</span>}
            </Link>
          </SidebarMenuButton>
        </SidebarFooter>
      </ShadcnSidebar>
    </div>
  );
};
