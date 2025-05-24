
import { Search, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface CompanyFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clientTypeFilter: string;
  setClientTypeFilter: (type: string) => void;
  showSubsidiaries: boolean;
  setShowSubsidiaries: (show: boolean) => void;
}

export const CompanyFilters = ({ 
  searchQuery, 
  setSearchQuery, 
  clientTypeFilter, 
  setClientTypeFilter,
  showSubsidiaries,
  setShowSubsidiaries
}: CompanyFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex-grow">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search companies..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
        <div className="flex items-center gap-2 mr-2">
          <Switch
            id="show-subsidiaries"
            checked={showSubsidiaries}
            onCheckedChange={setShowSubsidiaries}
          />
          <Label htmlFor="show-subsidiaries" className="cursor-pointer flex items-center gap-1">
            <Building className="h-4 w-4" />
            <span>Show subsidiaries</span>
          </Label>
        </div>
        
        {/* Client Type Filter with Clickable Badges */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Type:</span>
          <div className="flex items-center gap-2">
            <Badge
              variant={clientTypeFilter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setClientTypeFilter('all')}
            >
              All
            </Badge>
            <Badge
              variant={clientTypeFilter === 'Marketing' ? 'marketing' : 'outline'}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setClientTypeFilter('Marketing')}
            >
              Marketing
            </Badge>
            <Badge
              variant={clientTypeFilter === 'Web' ? 'web' : 'outline'}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setClientTypeFilter('Web')}
            >
              Web
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
