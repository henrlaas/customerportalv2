
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
import { useAppearance } from '@/components/AppearanceProvider';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const sidebarItems = getSidebarItems();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { sidebarColor } = useAppearance();

  // Group sidebar items by category
  const menuItems = sidebarItems.filter(item => !item.category || item.category === 'MENU');

  const handleProjectsClick = (e: React.MouseEvent) => {
    // Force page reload for Projects to avoid cache issues
    e.preventDefault();
    window.location.href = '/projects';
  };

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
        {/* MENU section without the label text */}
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href} className="mb-2">
                {item.disabled ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className={`sidebar-menu-link group flex items-center justify-between w-full px-4 py-3.5 text-sm font-medium rounded-lg 
                            text-white/60 bg-transparent cursor-not-allowed ${isCollapsed ? 'justify-center' : ''}`}
                        >
                          <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
                            <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} text-white/60`} />
                            {!isCollapsed && <span>{item.title}</span>}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.tooltip || "Disabled"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.href}
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    {item.href === '/projects' ? (
                      <a 
                        href={item.href}
                        onClick={handleProjectsClick}
                        className={`sidebar-menu-link group flex items-center justify-between w-full px-4 py-3.5 text-sm font-medium rounded-lg ${
                          location.pathname === item.href 
                            ? 'bg-[#F2FCE2] text-[#004743]' 
                            : 'text-white hover:bg-gray-500/20 hover:text-[#F2FCE2]'
                        }`}
                      >
                        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
                          <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${
                            location.pathname === item.href 
                              ? 'text-[#004743]' 
                              : 'text-white group-hover:text-[#F2FCE2] transition-colors'
                          }`} />
                          {!isCollapsed && <span>{item.title}</span>}
                        </div>
                        {item.hasDropdown && !isCollapsed && (
                          <ChevronDown className={`h-4 w-4 ${
                            location.pathname === item.href 
                              ? 'text-[#004743]' 
                              : 'text-gray-200 group-hover:text-[#F2FCE2] transition-colors'
                          }`} />
                        )}
                      </a>
                    ) : (
                      <Link 
                        to={item.href} 
                        className={`sidebar-menu-link group flex items-center justify-between w-full px-4 py-3.5 text-sm font-medium rounded-lg ${
                          location.pathname === item.href 
                            ? 'bg-[#F2FCE2] text-[#004743]' 
                            : 'text-white hover:bg-gray-500/20 hover:text-[#F2FCE2]'
                        }`}
                      >
                        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
                          <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${
                            location.pathname === item.href 
                              ? 'text-[#004743]' 
                              : 'text-white group-hover:text-[#F2FCE2] transition-colors'
                          }`} />
                          {!isCollapsed && <span>{item.title}</span>}
                        </div>
                        {item.hasDropdown && !isCollapsed && (
                          <ChevronDown className={`h-4 w-4 ${
                            location.pathname === item.href 
                              ? 'text-[#004743]' 
                              : 'text-gray-200 group-hover:text-[#F2FCE2] transition-colors'
                          }`} />
                        )}
                      </Link>
                    )}
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </ShadcnSidebar>
  );
};
