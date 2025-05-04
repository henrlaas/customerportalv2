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
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';
import { Settings, ChevronDown } from 'lucide-react';
import { Logo } from './Logo';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAdmin, isEmployee } = useAuth();
  const sidebarItems = getSidebarItems();

  // Group sidebar items by category
  const menuItems = sidebarItems.filter(item => !item.category || item.category === 'MENU');
  const supportItems = sidebarItems.filter(item => item.category === 'SUPPORT');
  const otherItems = sidebarItems.filter(item => item.category === 'OTHERS');

  return (
    <ShadcnSidebar className="border-r bg-[#F7F7FF]">
      <SidebarHeader className="p-6">
        <Logo />
      </SidebarHeader>
      <SidebarContent className="px-4 py-2">
        {/* MENU section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 text-xs font-medium mb-3 px-4">MENU</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  asChild
                  isActive={location.pathname === item.href}
                >
                  <Link 
                    to={item.href} 
                    className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium rounded-lg ${
                      location.pathname === item.href 
                        ? 'bg-[#EAEAFE] text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className={`h-5 w-5 mr-3 ${location.pathname === item.href ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>{item.title}</span>
                    </div>
                    {item.hasDropdown && (
                      <ChevronDown className={`h-4 w-4 ${location.pathname === item.href ? 'text-blue-600' : 'text-gray-400'}`} />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* SUPPORT section */}
        {supportItems.length > 0 && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-gray-500 text-xs font-medium mb-3 px-4">SUPPORT</SidebarGroupLabel>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.href}
                  >
                    <Link 
                      to={item.href} 
                      className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium rounded-lg ${
                        location.pathname === item.href 
                          ? 'bg-[#EAEAFE] text-blue-600' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon className={`h-5 w-5 mr-3 ${location.pathname === item.href ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span>{item.title}</span>
                      </div>
                      {item.hasDropdown && (
                        <ChevronDown className={`h-4 w-4 ${location.pathname === item.href ? 'text-blue-600' : 'text-gray-400'}`} />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* OTHERS section */}
        {otherItems.length > 0 && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-gray-500 text-xs font-medium mb-3 px-4">OTHERS</SidebarGroupLabel>
            <SidebarMenu>
              {otherItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.href}
                  >
                    <Link 
                      to={item.href} 
                      className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium rounded-lg ${
                        location.pathname === item.href 
                          ? 'bg-[#EAEAFE] text-blue-600' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon className={`h-5 w-5 mr-3 ${location.pathname === item.href ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span>{item.title}</span>
                      </div>
                      {item.hasDropdown && (
                        <ChevronDown className={`h-4 w-4 ${location.pathname === item.href ? 'text-blue-600' : 'text-gray-400'}`} />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="mt-auto px-4 py-6">
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <h3 className="font-bold text-sm">#1 Marketing Agency Portal</h3>
          <p className="text-xs text-gray-600 mt-1">
            Your complete marketing management solution
          </p>
          <button className="mt-3 bg-blue-600 text-white w-full py-2 rounded-lg text-sm font-medium">
            Upgrade Plan
          </button>
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};
