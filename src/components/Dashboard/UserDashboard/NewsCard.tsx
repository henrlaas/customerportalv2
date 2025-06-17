
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { newsService } from '@/services/newsService';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Newspaper } from 'lucide-react';

export const NewsCard = () => {
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: news = [], isLoading } = useQuery({
    queryKey: ['latest-news'],
    queryFn: async () => {
      const allNews = await newsService.getAll();
      return allNews.slice(0, 1); // Get only the latest news
    },
  });

  const latestNews = news[0];
  const creatorUserIds = latestNews ? [latestNews.created_by] : [];
  const { data: userProfiles = {} } = useUserProfiles(creatorUserIds);

  const getCreatorFirstName = (userId: string) => {
    const profile = userProfiles[userId];
    if (profile?.first_name) {
      return profile.first_name;
    }
    return 'Unknown User';
  };

  const handleNewsClick = () => {
    if (latestNews) {
      setSelectedNews(latestNews);
      setDialogOpen(true);
    }
  };

  if (isLoading) {
    return (
      <Card className="h-48">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading news...</div>
        </CardContent>
      </Card>
    );
  }

  if (!latestNews) {
    return (
      <Card className="h-48">
        <CardContent className="flex flex-col items-center justify-center h-full">
          <Newspaper className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-center">No news available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card 
        className="h-48 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow relative"
        onClick={handleNewsClick}
        style={{
          backgroundImage: latestNews.image_banner ? `url(${latestNews.image_banner})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Black overlay */}
        {latestNews.image_banner && (
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        )}
        
        {/* Latest News Badge */}
        <Badge 
          variant="secondary" 
          className="absolute top-4 left-4 z-10 bg-black/30 text-white border-white/20 backdrop-blur-sm"
        >
          Latest news
        </Badge>
        
        {/* Content - Three sections layout */}
        <CardContent className="relative z-10 p-6 h-full flex flex-col justify-between">
          {/* Top spacer for badge */}
          <div className="h-6"></div>
          
          {/* Middle section - Title and Banner Subtitle */}
          <div className={`flex-1 flex flex-col justify-center ${latestNews.image_banner ? 'text-white' : ''}`}>
            <h3 className="text-xl font-bold mb-2 line-clamp-2">
              {latestNews.title}
            </h3>
            {latestNews.banner_subtitle && (
              <p className="text-sm line-clamp-3">
                {latestNews.banner_subtitle}
              </p>
            )}
          </div>
          
          {/* Bottom section - Publisher and Date */}
          <div className={`flex items-center justify-between text-xs opacity-90 ${latestNews.image_banner ? 'text-white' : ''}`}>
            <span>Published by {getCreatorFirstName(latestNews.created_by)}</span>
            <span>{format(new Date(latestNews.created_at), 'MMM d, yyyy')}</span>
          </div>
        </CardContent>
      </Card>

      {/* News Detail Dialog - Without banner image, with preserved formatting */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedNews?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <pre className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">
              {selectedNews?.description}
            </pre>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
              <span>Published by {selectedNews && getCreatorFirstName(selectedNews.created_by)}</span>
              <span>{selectedNews && format(new Date(selectedNews.created_at), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
