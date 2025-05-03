
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

  return (
    <div className="border-b bg-white shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold">Hi there, {profile?.first_name}! 👋</h2>
          <p className="text-sm text-gray-500">{format(today, 'EEEE, dd MMMM')}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-gray-600 rounded-full relative">
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">2</span>
            <Bell className="h-5 w-5" />
          </Button>
          
          {/* Language selector dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-600 rounded-full">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl border border-gray-100 shadow-playful animate-fade-in">
              <DropdownMenuLabel>Select Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-2 rounded-lg transition-all hover:bg-soft-blue/30 ${language === 'en' ? 'bg-soft-blue/50' : ''}`}
              >
                <span className="text-lg mr-1">🇺🇸</span>
                English
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage('no')}
                className={`flex items-center gap-2 rounded-lg transition-all hover:bg-soft-blue/30 ${language === 'no' ? 'bg-soft-blue/50' : ''}`}
              >
                <span className="text-lg mr-1">🇳🇴</span>
                Norwegian
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full overflow-hidden p-0 hover:ring-2 hover:ring-soft-purple/50 transition-all">
                <img
                  src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.first_name}+${profile?.last_name}&background=random`}
                  alt={`${profile?.first_name} ${profile?.last_name}`}
                  className="h-9 w-9 rounded-full object-cover"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border border-gray-100 shadow-playful animate-fade-in">
              <div className="flex items-center gap-2 p-2">
                <div className="h-10 w-10 rounded-full overflow-hidden">
                  <img
                    src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.first_name}+${profile?.last_name}&background=random`}
                    alt={`${profile?.first_name} ${profile?.last_name}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{profile?.role}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg transition-all hover:bg-soft-blue/30" onSelect={() => window.location.href = '/profile'}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg transition-all hover:bg-soft-blue/30" onSelect={() => window.location.href = '/settings'}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg transition-all hover:bg-soft-pink/30" onSelect={() => signOut()}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
