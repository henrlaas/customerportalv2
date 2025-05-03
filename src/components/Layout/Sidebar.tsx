
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
  useSidebar,
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';

export const Sidebar: React.FC = () => {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const { isAdmin, isEmployee } = useAuth();
  const sidebarItems = getSidebarItems();
  const isExpanded = state === 'expanded';

  return (
    <ShadcnSidebar className="border-r bg-sidebar">
      <SidebarHeader className={`p-4 flex items-center justify-between ${isExpanded ? 'px-4' : 'px-2'}`}>
        <Logo />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="text-sidebar-foreground hover:bg-sidebar-accent rounded-full"
        >
          {isExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
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
                  className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                    location.pathname === item.href 
                      ? 'bg-sidebar-accent text-sidebar-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/70'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${location.pathname === item.href ? 'text-sidebar-foreground' : 'text-sidebar-foreground/80'}`} />
                  {isExpanded && <span>{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4 mt-auto">
        <SidebarMenuButton 
          asChild
          isActive={location.pathname === '/settings'}
          tooltip="Settings"
        >
          <Link 
            to="/settings" 
            className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
              location.pathname === '/settings' 
                ? 'bg-sidebar-accent text-sidebar-foreground' 
                : 'text-sidebar-foreground hover:bg-sidebar-accent/70'
            }`}
          >
            <Settings className={`h-5 w-5 ${location.pathname === '/settings' ? 'text-sidebar-foreground' : 'text-sidebar-foreground/80'}`} />
            {isExpanded && <span>Settings</span>}
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};
