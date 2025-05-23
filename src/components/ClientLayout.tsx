
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Layout/Sidebar';
import { 
  SidebarProvider, 
  SidebarInset
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ClientLayout = () => {
  const { signOut, profile, language, setLanguage } = useAuth();
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-white" style={{
        "--sidebar-width-icon": "4rem",
      } as React.CSSProperties}>
        <Sidebar />
        <SidebarInset className="flex-1">
          <div className="flex-1 overflow-auto">
            <header className="bg-white border-b px-6 py-4">
              <div className="container mx-auto flex items-center justify-between">
                <h1 className="text-xl font-bold">Client Portal</h1>
                
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="icon" className="text-gray-600 rounded-full">
                    <Bell className="h-5 w-5" />
                  </Button>
                  
                  {/* Language selector dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-600 rounded-full">
                        <Globe className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setLanguage('en')}
                        className={`flex items-center gap-2 ${language === 'en' ? 'bg-gray-100' : ''} hover:bg-gray-100`}
                      >
                        <span className="text-lg mr-1">🇺🇸</span>
                        English
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setLanguage('no')}
                        className={`flex items-center gap-2 ${language === 'no' ? 'bg-gray-100' : ''} hover:bg-gray-100`}
                      >
                        <span className="text-lg mr-1">🇳🇴</span>
                        Norwegian
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* User profile dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full overflow-hidden">
                        <img
                          src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.first_name}+${profile?.last_name}&background=random`}
                          alt={`${profile?.first_name} ${profile?.last_name}`}
                          className="h-8 w-8 rounded-full"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>
                        {profile?.first_name} {profile?.last_name}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onSelect={() => window.location.href = '/client/settings'}
                        className="hover:bg-gray-100"
                      >
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onSelect={() => signOut()}
                        className="hover:bg-gray-100"
                      >
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>
            <main className="w-full overflow-x-hidden p-6">
              <Outlet />
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
