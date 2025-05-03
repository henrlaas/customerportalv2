
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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
      <div className="flex-grow relative">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Search companies..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
        <div className="flex items-center gap-2 mr-2 bg-soft-purple/10 px-3 py-1.5 rounded-lg">
          <Switch
            id="show-subsidiaries"
            checked={showSubsidiaries}
            onCheckedChange={setShowSubsidiaries}
          />
          <Label htmlFor="show-subsidiaries" className="cursor-pointer flex items-center gap-1 text-sm">
            <Building className="h-4 w-4" />
            <span>Show subsidiaries</span>
          </Label>
        </div>
        
        <Select
          value={clientTypeFilter}
          onValueChange={setClientTypeFilter}
        >
          <SelectTrigger className="w-full md:w-[180px] rounded-lg">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-gray-100 shadow-playful animate-fade-in">
            <SelectGroup>
              <SelectLabel>Client Type</SelectLabel>
              <SelectItem value="all" className="rounded-lg">All Types</SelectItem>
              <SelectItem value="Marketing" className="rounded-lg">Marketing</SelectItem>
              <SelectItem value="Web" className="rounded-lg">Web</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex rounded-xl overflow-hidden border shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-l-xl rounded-r-none ${viewMode === 'list' ? 'bg-soft-blue/20' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <Briefcase className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-r-xl rounded-l-none ${viewMode === 'card' ? 'bg-soft-blue/20' : ''}`}
            onClick={() => setViewMode('card')}
          >
            <Layers className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
