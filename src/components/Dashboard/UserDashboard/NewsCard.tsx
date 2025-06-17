
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { newsService } from '@/services/newsService';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

export function NewsCard() {
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

  const getCreatorName = (userId: string) => {
    const profile = userProfiles[userId];
    return profile?.first_name || 'Unknown User';
  };

  if (isLoading) {
    return (
      <Card className="h-64 animate-pulse">
        <div className="h-full bg-gray-200 rounded-lg"></div>
      </Card>
    );
  }

  if (!latestNews) {
    return (
      <Card className="h-64 flex items-center justify-center">
        <CardContent>
          <p className="text-gray-500">No news available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="h-64 overflow-hidden relative"
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
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        <CardHeader className="pb-3">
          <Badge variant="secondary" className={`w-fit ${latestNews.image_banner ? 'bg-white/20 text-white border-white/20' : ''}`}>
            Latest News
          </Badge>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col justify-end">
          <div className="space-y-3">
            <h3 className={`text-xl font-bold line-clamp-2 ${latestNews.image_banner ? 'text-white' : 'text-gray-900'}`}>
              {latestNews.title}
            </h3>
            <p className={`text-sm line-clamp-3 ${latestNews.image_banner ? 'text-gray-200' : 'text-gray-600'}`}>
              {latestNews.description}
            </p>
            
            <div className={`flex items-center gap-4 text-xs ${latestNews.image_banner ? 'text-gray-200' : 'text-gray-500'}`}>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Published by {getCreatorName(latestNews.created_by)}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(latestNews.created_at), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
