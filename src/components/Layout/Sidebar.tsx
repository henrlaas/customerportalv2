
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
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Logo } from './Logo';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const sidebarItems = getSidebarItems();

  // Group sidebar items by category
  const menuItems = sidebarItems.filter(item => !item.category || item.category === 'MENU');

  return (
    <ShadcnSidebar className="border-r bg-[#004743]">
      <SidebarHeader className="p-6">
        <Logo />
      </SidebarHeader>
      <SidebarContent className="px-4 py-2">
        {/* MENU section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-300 text-xs font-medium mb-3 px-4">MENU</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href} className="mb-2">
                <SidebarMenuButton 
                  asChild
                  isActive={location.pathname === item.href}
                >
                  <Link 
                    to={item.href} 
                    className={`flex items-center justify-between w-full px-4 py-3.5 text-sm font-medium rounded-lg ${
                      location.pathname === item.href 
                        ? 'bg-[#F2FCE2] text-[#004743]' 
                        : 'text-gray-200 hover:bg-[#005e59]'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className={`h-5 w-5 mr-3 ${location.pathname === item.href ? 'text-[#004743]' : 'text-gray-300'}`} />
                      <span>{item.title}</span>
                    </div>
                    {item.hasDropdown && (
                      <ChevronDown className={`h-4 w-4 ${location.pathname === item.href ? 'text-[#004743]' : 'text-gray-400'}`} />
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
