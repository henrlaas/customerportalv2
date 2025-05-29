
import { EnhancedAdCard } from './EnhancedAdCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, SortAsc } from 'lucide-react';
import { useState, useMemo } from 'react';

interface Props {
  ads: any[];
  campaignPlatform?: string;
  onAdUpdate?: () => void;
  disableModifications?: boolean;
}

export function AdsList({ ads, campaignPlatform, onAdUpdate, disableModifications = false }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredAndSortedAds = useMemo(() => {
    let filtered = ads;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(ad => 
        ad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.headline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.main_text?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(ad => {
        if (filterType === 'image') return ad.ad_type === 'image';
        if (filterType === 'video') return ad.ad_type === 'video';
        if (filterType === 'text') return ad.ad_type === 'text' || !ad.ad_type;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [ads, searchTerm, filterType, sortBy]);

  if (ads.length === 0) {
    return (
      <div className="text-center p-12 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Ads Yet</h3>
          <p className="text-muted-foreground">Create your first ad to get started with this ad set.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="text">Text Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          {filteredAndSortedAds.length} of {ads.length} ads
        </div>
      </div>

      {/* Ads Grid */}
      {filteredAndSortedAds.length === 0 ? (
        <div className="text-center p-8 rounded-lg bg-muted/30">
          <h3 className="text-lg font-medium mb-2">No ads match your filters</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
            }}
            className="mt-3"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedAds.map((ad) => (
            <EnhancedAdCard 
              key={ad.id} 
              ad={ad} 
              campaignPlatform={campaignPlatform}
              onAdUpdate={disableModifications ? undefined : onAdUpdate}
              disableModifications={disableModifications}
            />
          ))}
        </div>
      )}
    </div>
  );
}
