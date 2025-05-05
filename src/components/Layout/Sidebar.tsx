
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getSidebarItems } from './SidebarItems';
import {
  Sidebar as ShadcnSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const sidebarItems = getSidebarItems();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Group sidebar items by category
  const menuItems = sidebarItems.filter(item => !item.category || item.category === 'MENU');

  return (
    <ShadcnSidebar 
      className="border-r bg-[#004743]" 
      collapsible="icon"
      style={{
        "--sidebar-width-icon": "4.5rem", // Increased width for collapsed sidebar
      } as React.CSSProperties}
    >
      <SidebarHeader className="p-4 bg-[#004743] flex items-center justify-between">
        {!isCollapsed && <div className="pl-2"><Logo /></div>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className={`text-white hover:text-[#F2FCE2] hover:bg-gray-500/20 ${isCollapsed ? 'mx-auto' : 'ml-auto'}`}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </SidebarHeader>
      <SidebarContent className="px-4 py-2 bg-[#004743]">
        {/* MENU section without the label text */}
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href} className="mb-2">
                <SidebarMenuButton 
                  asChild
                  isActive={location.pathname === item.href}
                  tooltip={isCollapsed ? item.title : undefined}
                >
                  <Link 
                    to={item.href} 
                    className={`sidebar-menu-link flex items-center justify-between w-full px-4 py-3.5 text-sm font-medium rounded-lg ${
                      location.pathname === item.href 
                        ? 'bg-[#F2FCE2] text-[#004743]' 
                        : 'text-white hover:bg-gray-500/20 hover:text-[#F2FCE2]'
                    }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
                      <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${location.pathname === item.href ? 'text-[#004743]' : 'text-white'}`} />
                      {!isCollapsed && <span>{item.title}</span>}
                    </div>
                    {item.hasDropdown && !isCollapsed && (
                      <ChevronDown className={`h-4 w-4 ${location.pathname === item.href ? 'text-[#004743]' : 'text-gray-200'}`} />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </ShadcnSidebar>
  );
};
