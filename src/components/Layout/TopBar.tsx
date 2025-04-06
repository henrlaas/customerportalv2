
import { Bell, Globe, Search } from 'lucide-react';
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
          
          {/* Language selector dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-600 rounded-full">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Select Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-2 ${language === 'en' ? 'bg-accent' : ''}`}
              >
                <span className="inline-block w-6 h-4 bg-cover bg-center mr-1" 
                      style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjM1IDY1MCI+PHJlY3Qgd2lkdGg9IjEyMzUiIGhlaWdodD0iNjUwIiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTAsOTEuNVY1NTguNSwyNzUsMzI1TTEyMzUsMjc1SDYxNy41bTAgLTE4My41SDEyMzVNNjE3LjU1LDU1OC41SDEyMzVNMCw5MS41SDYxNy41TTAsMjc1SDYxNy41TTAsNDU4LjVINjE3LjUiIHN0cm9rZT0iI2NmMTQyYiIgc3Ryb2tlLXdpZHRoPSIxMDAiLz48cGF0aCBkPSJNMCwwVjY1MGgyNDdWME0wLDBoMTIzNXYyNDdIMCIgZmlsbD0iIzAwMjQ3ZCIvPjwvc3ZnPg==')" }}></span>
                EN
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage('no')}
                className={`flex items-center gap-2 ${language === 'no' ? 'bg-accent' : ''}`}
              >
                <span className="inline-block w-6 h-4 bg-cover bg-center mr-1" 
                      style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTAwIDgwMCI+PHBhdGggZmlsbD0iI2VmMmIyZCIgZD0iTTAsODAwaDExMDBWMEgweiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0zMDAsMEgwVjgwMGgzMDBWMHpNMTEwMCwzNDBoLTgwMHYxMjBoODAwVjM0MHoiLz48cGF0aCBmaWxsPSIjMDAyODY4IiBkPSJNMzUwLDBIMjUwVjgwMGgxMDBWMHpNMTEwMCwyOTBIOHYyMjBoMTA5MlYyOTB6Ii8+PC9zdmc+')" }}></span>
                NO
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
