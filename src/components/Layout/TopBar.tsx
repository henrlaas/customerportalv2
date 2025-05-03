
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
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export const TopBar: React.FC = () => {
  const { signOut, profile, isAdmin, isEmployee, language, setLanguage } = useAuth();
  const today = new Date();

  return (
    <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between p-5">
        <div>
          <h2 className="text-xl font-heading font-bold">Hi there, {profile?.first_name}! 👋</h2>
          <p className="text-sm text-teal-800 mt-1">{format(today, 'EEEE, dd MMMM')}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-gray-600 rounded-full hover:bg-offwhite">
            <Bell className="h-5 w-5" />
          </Button>
          
          {/* Language selector dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-600 rounded-full hover:bg-offwhite">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-playful border-2 border-offwhite">
              <DropdownMenuLabel>Select Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-2 rounded-lg transition-all ${language === 'en' ? 'bg-offwhite' : ''}`}
              >
                <span className="text-lg mr-1">🇺🇸</span>
                English
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage('no')}
                className={`flex items-center gap-2 rounded-lg transition-all ${language === 'no' ? 'bg-offwhite' : ''}`}
              >
                <span className="text-lg mr-1">🇳🇴</span>
                Norwegian
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full overflow-hidden border-2 hover:border-coral p-0">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.first_name}+${profile?.last_name}&background=random`}
                    alt={`${profile?.first_name} ${profile?.last_name}`}
                  />
                  <AvatarFallback className="bg-teal text-white font-medium">
                    {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-playful border-2 border-offwhite">
              <DropdownMenuLabel className="font-heading">
                {profile?.first_name} {profile?.last_name}
                <p className="text-xs text-teal-600 font-sans mt-1">{profile?.role}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => window.location.href = '/profile'} className="rounded-lg cursor-pointer">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => window.location.href = '/settings'} className="rounded-lg cursor-pointer">
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => signOut()} className="text-red-600 rounded-lg cursor-pointer">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
