
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type TimeEntrySearchProps = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
};

export const TimeEntrySearch = ({ searchQuery, setSearchQuery }: TimeEntrySearchProps) => {
  return (
    <div className="mb-6">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search time entries..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
};
