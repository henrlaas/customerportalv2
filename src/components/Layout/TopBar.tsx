
import { Bell, Globe, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useState } from 'react';

export const TopBar: React.FC = () => {
  const { signOut, profile, language, setLanguage } = useAuth();
  const today = new Date();
  const [showSearch, setShowSearch] = useState(false);

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
  };

  return (
    <div className="border-b bg-white shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div>
          <h2 className="text-xl font-display font-bold text-primary">
            Hey there, {profile?.first_name}! <span className="text-2xl">👋</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">{format(today, 'EEEE, dd MMMM')}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {showSearch ? (
            <div className="relative w-64 mr-2 transition-all duration-300 ease-in-out">
              <Input 
                placeholder="Search..." 
                className="pl-10"
                autoFocus
                onBlur={() => setShowSearch(false)}
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-600 rounded-full hover:bg-secondary"
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          <Button variant="ghost" size="icon" className="text-gray-600 rounded-full relative hover:bg-secondary">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 bg-accent-red rounded-full w-3 h-3 border-2 border-white"></span>
          </Button>
          
          {/* Language selector dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-600 rounded-full hover:bg-secondary">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-playful border-2">
              <DropdownMenuLabel className="font-display">Select Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-2 rounded-lg my-1 text-base ${language === 'en' ? 'bg-accent-blue/30' : ''}`}
              >
                <span className="text-lg mr-1">🇺🇸</span>
                English
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage('no')}
                className={`flex items-center gap-2 rounded-lg my-1 text-base ${language === 'no' ? 'bg-accent-blue/30' : ''}`}
              >
                <span className="text-lg mr-1">🇳🇴</span>
                Norwegian
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full overflow-hidden p-0 hover:ring-2 hover:ring-secondary">
                <Avatar className="h-9 w-9 border-0">
                  <AvatarImage
                    src={profile?.avatar_url}
                    alt={`${profile?.first_name} ${profile?.last_name}`}
                  />
                  <AvatarFallback>
                    {getInitials(profile?.first_name, profile?.last_name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 rounded-xl shadow-playful border-2">
              <div className="flex items-start p-4">
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage
                    src={profile?.avatar_url}
                    alt={`${profile?.first_name} ${profile?.last_name}`}
                  />
                  <AvatarFallback>
                    {getInitials(profile?.first_name, profile?.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-base">{profile?.first_name} {profile?.last_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{profile?.role}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="py-2.5 text-base rounded-lg my-1 cursor-pointer"
                onSelect={() => window.location.href = '/profile'}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="py-2.5 text-base rounded-lg my-1 cursor-pointer"
                onSelect={() => window.location.href = '/settings'}
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="py-2.5 text-base rounded-lg my-1 cursor-pointer text-destructive"
                onSelect={() => signOut()}
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
