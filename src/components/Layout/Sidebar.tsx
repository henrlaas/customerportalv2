
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
      className="border-r bg-[#E4EDED]" 
      collapsible="icon"
      style={{
        "--sidebar-width-icon": "4rem", // Increasing the width of collapsed sidebar
      } as React.CSSProperties}
    >
      <SidebarHeader className="p-6 bg-[#E4EDED] flex items-center justify-between">
        {!isCollapsed && <Logo />}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className={`text-gray-700 hover:text-gray-900 hover:bg-[#d6d9d9] ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </SidebarHeader>
      <SidebarContent className="px-4 py-2 bg-[#E4EDED]">
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
                    className={`flex items-center justify-between w-full px-4 py-3.5 text-sm font-medium rounded-lg ${
                      location.pathname === item.href 
                        ? 'bg-[#F2FCE2] text-[#004743]' 
                        : 'text-gray-700 hover:bg-[#d6d9d9] hover:text-gray-900'
                    }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
                      <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} ${location.pathname === item.href ? 'text-[#004743]' : 'text-gray-600'}`} />
                      {!isCollapsed && <span>{item.title}</span>}
                    </div>
                    {item.hasDropdown && !isCollapsed && (
                      <ChevronDown className={`h-4 w-4 ${location.pathname === item.href ? 'text-[#004743]' : 'text-gray-500'}`} />
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
