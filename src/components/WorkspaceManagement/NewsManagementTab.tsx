
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { newsService, NewsItem } from '@/services/newsService';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { CreateNewsDialog } from './NewsManagement/CreateNewsDialog';
import { EditNewsDialog } from './NewsManagement/EditNewsDialog';
import { DeleteNewsDialog } from './NewsManagement/DeleteNewsDialog';
import { NewsPagination } from './NewsManagement/NewsPagination';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Image as ImageIcon,
  Newspaper
} from 'lucide-react';
import { format } from 'date-fns';

const ITEMS_PER_PAGE = 3;

export function NewsManagementTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: news = [], isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: newsService.getAll,
  });

  // Get unique user IDs for profile fetching
  const creatorUserIds = [...new Set(news.map(item => item.created_by))];
  const { data: userProfiles = {} } = useUserProfiles(creatorUserIds);

  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.banner_subtitle && item.banner_subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedNews = filteredNews.slice(startIndex, endIndex);

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const getCreatorName = (userId: string) => {
    const profile = userProfiles[userId];
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    return 'Unknown User';
  };

  const handleEdit = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setEditDialogOpen(true);
  };

  const handleDelete = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setDeleteDialogOpen(true);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['news'] });
    toast({
      title: 'Success',
      description: 'News operation completed successfully',
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading news...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          <h2 className="text-xl font-semibold">News Management</h2>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create News
        </Button>
      </div>

      <p className="text-muted-foreground">
        Manage company news and announcements for employees.
      </p>

      <Separator />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search news..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* News List */}
      {filteredNews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Newspaper className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No news found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm ? 'No news match your search criteria.' : 'Get started by creating your first news article.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create News
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {paginatedNews.map((newsItem) => (
              <Card 
                key={newsItem.id} 
                className="overflow-hidden relative min-h-[200px]"
                style={{
                  backgroundImage: newsItem.image_banner ? `url(${newsItem.image_banner})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Black overlay */}
                {newsItem.image_banner && (
                  <div className="absolute inset-0 bg-black bg-opacity-40" />
                )}
                
                {/* Content - Left aligned and centered */}
                <div className="relative z-10 h-full flex">
                  <div className="flex-1 flex flex-col justify-center p-6">
                    <div className="space-y-2">
                      <CardTitle className={`line-clamp-2 ${newsItem.image_banner ? 'text-white' : ''}`}>
                        {newsItem.title}
                      </CardTitle>
                      <CardDescription className={`line-clamp-2 ${newsItem.image_banner ? 'text-gray-200' : ''}`}>
                        {newsItem.banner_subtitle}
                      </CardDescription>
                      
                      <div className={`flex items-center gap-4 text-sm ${newsItem.image_banner ? 'text-gray-200' : 'text-muted-foreground'}`}>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(newsItem.created_at), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Created by {getCreatorName(newsItem.created_by)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2">
                        {newsItem.image_banner && (
                          <Badge variant="secondary" className="flex items-center gap-1 bg-white/20 text-white border-white/20">
                            <ImageIcon className="h-3 w-3" />
                            Banner Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons - positioned at the right */}
                  <div className="flex flex-col items-center justify-center gap-2 p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(newsItem)}
                      className={newsItem.image_banner ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : ''}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(newsItem)}
                      className={newsItem.image_banner ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : ''}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          <NewsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Dialogs */}
      <CreateNewsDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleSuccess}
      />

      {selectedNews && (
        <>
          <EditNewsDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            newsItem={selectedNews}
            onSuccess={handleSuccess}
          />

          <DeleteNewsDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            newsItem={selectedNews}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </div>
  );
}
