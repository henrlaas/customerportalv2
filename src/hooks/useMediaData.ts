
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MediaData, FilterOptions } from '@/types/media';
import { getFileTypeFromName } from '@/utils/mediaUtils';
import { useCompanyNames } from './useCompanyNames';

export const useMediaData = (
  currentPath: string,
  session: any,
  filters: FilterOptions,
  activeTab: string
) => {
  const { toast } = useToast();
  const { data: companies } = useCompanyNames();

  return useQuery({
    queryKey: ['mediaFiles', currentPath, session?.user?.id, filters, activeTab],
    queryFn: async () => {
      if (!session?.user?.id) {
        return { folders: [], files: [] };
      }
      
      try {
        // Handle company files tab
        if (activeTab === 'company') {
          // At root level, return company folders
          if (!currentPath) {
            if (!companies) return { folders: [], files: [] };
            
            const folders = companies.map(company => ({
              id: company.id,
              name: company.name,
              fileType: 'folder',
              url: '',
              size: 0,
              created_at: new Date().toISOString(),
              favorited: false,
              isFolder: true,
              fileCount: 0,
              bucketId: 'company_media',
              isCompanyFolder: true,
              companyName: company.name
            }));

            // Get file counts for each company folder
            for (const folder of folders) {
              const { data: contents, error: countError } = await supabase
                .storage
                .from('company_media')
                .list(folder.name, {
                  limit: 100,
                  offset: 0,
                });
                
              if (!countError && contents) {
                folder.fileCount = contents.filter(item => !item.name.endsWith('.folder')).length;
              }
            }
            
            return { folders, files: [] };
          }

          // Inside a company folder, show only files
          const { data: items, error } = await supabase
            .storage
            .from('company_media')
            .list(currentPath);
          
          if (error) throw error;

          // Get metadata and process files
          const { data: mediaMetadata } = await supabase
            .from('media_metadata')
            .select('*')
            .eq('bucket_id', 'company_media');
          
          // Get favorites
          const { data: favorites } = await supabase
            .from('media_favorites')
            .select('*')
            .eq('user_id', session.user.id);

          const files = items
            ?.filter(item => !item.name.endsWith('.folder'))
            .map(file => {
              const filePath = `${currentPath}/${file.name}`;
              const metadata = mediaMetadata?.find(meta => 
                meta.file_path === filePath && meta.bucket_id === 'company_media'
              );
              
              const isFavorited = favorites?.some(fav => 
                fav.file_path === filePath && fav.bucket_id === 'company_media'
              ) || false;
              
              const url = supabase.storage
                .from('company_media')
                .getPublicUrl(filePath).data.publicUrl;
              
              const fileType = getFileTypeFromName(file.name);
              
              return {
                id: file.id || '',
                name: file.name,
                fileType,
                url,
                size: file.metadata?.size || 0,
                created_at: file.created_at || new Date().toISOString(),
                uploadedBy: metadata?.uploaded_by || 'Unknown',
                favorited: isFavorited,
                isFolder: false,
                isImage: fileType.startsWith('image/'),
                isVideo: fileType.startsWith('video/'),
                isDocument: fileType.startsWith('application/') || fileType.startsWith('text/'),
                bucketId: 'company_media'
              };
            }) || [];

          return { folders: [], files };
        }

        // Handle internal files tab (media bucket)
        const { data: items, error } = await supabase
          .storage
          .from('media')
          .list(currentPath);
        
        if (error) throw error;

        const folders = (items || [])
          .filter(item => !item.name.includes('.folder'))
          .filter(item => item.id === null)
          .map(folder => ({
            id: folder.name,
            name: folder.name,
            fileType: 'folder',
            url: '',
            size: 0,
            created_at: folder.created_at || new Date().toISOString(),
            favorited: false,
            isFolder: true,
            fileCount: 0,
            bucketId: 'media'
          }));

        // Get metadata and favorites for files
        const { data: mediaMetadata } = await supabase
          .from('media_metadata')
          .select('*')
          .eq('bucket_id', 'media');
          
        const { data: favorites } = await supabase
          .from('media_favorites')
          .select('*')
          .eq('user_id', session.user.id);

        const files = (items || [])
          .filter(item => item.id !== null && !item.name.includes('.folder'))
          .map(file => {
            const filePath = currentPath 
              ? `${currentPath}/${file.name}`
              : file.name;
              
            const metadata = mediaMetadata?.find(meta => 
              meta.file_path === filePath && meta.bucket_id === 'media'
            );
            
            const isFavorited = favorites?.some(fav => 
              fav.file_path === filePath
            ) || false;
            
            const url = supabase.storage
              .from('media')
              .getPublicUrl(filePath).data.publicUrl;
            
            const fileType = getFileTypeFromName(file.name);
            
            return {
              id: file.id || '',
              name: file.name,
              fileType,
              url,
              size: file.metadata?.size || 0,
              created_at: file.created_at || new Date().toISOString(),
              uploadedBy: metadata?.uploaded_by || 'Unknown',
              favorited: isFavorited,
              isFolder: false,
              isImage: fileType.startsWith('image/'),
              isVideo: fileType.startsWith('video/'),
              isDocument: fileType.startsWith('application/') || fileType.startsWith('text/'),
              bucketId: 'media'
            };
          });

        return { folders, files };
      } catch (error: any) {
        toast({
          title: 'Error fetching media',
          description: error.message,
          variant: 'destructive',
        });
        return { folders: [], files: [] };
      }
    },
    enabled: !!session?.user?.id,
  });
};
