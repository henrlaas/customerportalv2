
import { Bell, Search, User } from 'lucide-react';
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
import { LanguageToggle } from '@/components/LanguageToggle';
import { format } from 'date-fns';

export const TopBar: React.FC = () => {
  const { signOut, profile, isAdmin, isEmployee } = useAuth();
  const today = new Date();

  return (
    <div className="border-b bg-white">
      <div className="flex items-center justify-between p-4">
        <div>
          <h2 className="text-lg font-medium">Hi there, {profile?.first_name}</h2>
          <p className="text-sm text-gray-500">{format(today, 'EEEE, dd MMMM')}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-gray-600 rounded-full">
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="text-gray-600 rounded-full">
            <Bell className="h-5 w-5" />
          </Button>
          
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
              {(isAdmin || isEmployee) && (
                <DropdownMenuItem>
                  <LanguageToggle className="w-full" />
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={() => window.location.href = '/profile'}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => window.location.href = '/settings'}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => signOut()}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
