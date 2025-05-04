
import { Bell, Globe, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useTheme } from 'next-themes';

export const TopBar: React.FC = () => {
  const { signOut, profile, isAdmin, isEmployee, language, setLanguage } = useAuth();
  const { theme, setTheme } = useTheme();
  const today = new Date();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="sticky top-0 z-10 border-b bg-whiter dark:bg-boxdark dark:border-strokedark">
      <div className="flex items-center justify-between px-4 py-4 md:px-6 2xl:px-10">
        <div>
          <h2 className="text-title-sm font-medium">Hi there, {profile?.first_name}</h2>
          <p className="text-sm text-body dark:text-bodydark">{format(today, 'EEEE, dd MMMM')}</p>
        </div>
        
        <div className="flex items-center gap-3 2xl:gap-6">
          {/* Theme toggler */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="text-body dark:text-bodydark hover:bg-gray-100 dark:hover:bg-meta-4 rounded-full"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          <Button variant="ghost" size="icon" className="text-body dark:text-bodydark hover:bg-gray-100 dark:hover:bg-meta-4 rounded-full">
            <Bell className="h-5 w-5" />
          </Button>
          
          {/* Language selector dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-body dark:text-bodydark hover:bg-gray-100 dark:hover:bg-meta-4 rounded-full">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 border border-stroke dark:border-strokedark dark:bg-boxdark">
              <DropdownMenuLabel className="text-body dark:text-bodydark">Select Language</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-stroke dark:bg-strokedark" />
              <DropdownMenuItem 
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-2 hover:bg-primary/10 ${language === 'en' ? 'bg-primary/10' : ''}`}
              >
                <span className="text-lg mr-1">🇺🇸</span>
                English
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage('no')}
                className={`flex items-center gap-2 hover:bg-primary/10 ${language === 'no' ? 'bg-primary/10' : ''}`}
              >
                <span className="text-lg mr-1">🇳🇴</span>
                Norwegian
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full overflow-hidden p-0">
                <img
                  src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.first_name}+${profile?.last_name}&background=random`}
                  alt={`${profile?.first_name} ${profile?.last_name}`}
                  className="h-10 w-10 rounded-full border-2 border-primary/20"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border border-stroke dark:border-strokedark dark:bg-boxdark w-64">
              <div className="flex items-center gap-3.5 py-3 px-5 border-b border-stroke dark:border-strokedark">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.first_name}+${profile?.last_name}&background=random`}
                    alt={`${profile?.first_name} ${profile?.last_name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-black dark:text-white">
                    {profile?.first_name} {profile?.last_name}
                  </h5>
                  <p className="text-xs text-body dark:text-bodydark">{profile?.role}</p>
                </div>
              </div>
              
              <DropdownMenuSeparator className="bg-stroke dark:bg-strokedark" />
              
              <DropdownMenuItem 
                onSelect={() => window.location.href = '/profile'}
                className="hover:bg-primary/10"
              >
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={() => window.location.href = '/settings'}
                className="hover:bg-primary/10"
              >
                Account Settings
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-stroke dark:bg-strokedark" />
              
              <DropdownMenuItem 
                onSelect={() => signOut()}
                className="hover:bg-primary/10"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
