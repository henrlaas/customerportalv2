
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarItems } from './SidebarItems';
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
import { useAppearance } from '@/contexts/AppearanceContext';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { sidebarColor } = useAppearance();

  return (
    <ShadcnSidebar 
      className="border-r" 
      collapsible="icon"
      style={{
        "--sidebar-width-icon": "4.5rem",
        backgroundColor: sidebarColor,
      } as React.CSSProperties}
    >
      <SidebarHeader className="p-4 flex flex-col items-center pt-8" style={{ backgroundColor: sidebarColor }}>
        <div className="flex items-center">
          {!isCollapsed && (
            <div className="mr-4">
              <Logo />
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="text-white hover:text-[#F2FCE2] hover:bg-gray-500/20"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-2" style={{ backgroundColor: sidebarColor }}>
        <SidebarItems />
      </SidebarContent>
    </ShadcnSidebar>
  );
};
