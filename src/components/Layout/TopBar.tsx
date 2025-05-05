
import { Bell, Globe } from 'lucide-react';
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

export const TopBar: React.FC = () => {
  const { signOut, profile, isAdmin, isEmployee, language, setLanguage } = useAuth();
  const today = new Date();
  
  // Determine greeting based on time of day
  const getGreeting = () => {
    const currentHour = today.getHours();
    return currentHour < 12 ? "Good morning" : "Good afternoon";
  };

  return (
    <div className="border-b bg-white">
      <div className="flex items-center justify-between p-4">
        <div>
          <h2 className="text-lg font-medium">{getGreeting()}, {profile?.first_name} 👋</h2>
          <p className="text-sm text-gray-500">{format(today, 'EEEE, dd MMMM')}</p>
        </div>
        
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
                <p className="text-xs text-gray-500 mt-1">{profile?.role}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onSelect={() => window.location.href = '/settings'}
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
    </div>
  );
};
