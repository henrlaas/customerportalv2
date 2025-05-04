
import { Search, Briefcase, Layers, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CompanyFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clientTypeFilter: string;
  setClientTypeFilter: (type: string) => void;
  viewMode: 'list' | 'card';
  setViewMode: (mode: 'list' | 'card') => void;
  showSubsidiaries: boolean;
  setShowSubsidiaries: (show: boolean) => void;
}

export const CompanyFilters = ({ 
  searchQuery, 
  setSearchQuery, 
  clientTypeFilter, 
  setClientTypeFilter,
  viewMode,
  setViewMode,
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
      <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto items-center">
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
        
        <Select
          value={clientTypeFilter}
          onValueChange={setClientTypeFilter}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Client Type</SelectLabel>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Web">Web</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex rounded-md border">
          <Button
            variant="ghost"
            size="icon"
            className={viewMode === 'list' ? 'bg-accent' : ''}
            onClick={() => setViewMode('list')}
          >
            <Briefcase className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={viewMode === 'card' ? 'bg-accent' : ''}
            onClick={() => setViewMode('card')}
          >
            <Layers className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
