
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
        // Get favorites for the current user
        const { data: favorites } = await supabase
          .from('media_favorites')
          .select('*')
          .eq('user_id', session.user.id);

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
              bucketId: 'companymedia',
              isCompanyFolder: true,
              companyName: company.name
            }));

            // Get file counts for each company folder
            for (const folder of folders) {
              const { data: contents, error: countError } = await supabase
                .storage
                .from('companymedia')
                .list(folder.name, {
                  limit: 100,
                  offset: 0,
                });
                
              if (!countError && contents) {
                // Exclude .folder files from count
                folder.fileCount = contents.filter(item => !item.name.endsWith('.folder')).length;
              }
            }
            
            return { folders, files: [] };
          }

          // Inside a company folder, need to separate folders from files
          const { data: items, error } = await supabase
            .storage
            .from('companymedia')
            .list(currentPath);
          
          if (error) throw error;

          // Process items to separate folders and files
          const folders = items
            ?.filter(item => item.id === null && !item.name.endsWith('.folder'))
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
              bucketId: 'companymedia'
            })) || [];

          // Get metadata and process files
          const { data: mediaMetadata } = await supabase
            .from('media_metadata')
            .select('*')
            .eq('bucket_id', 'companymedia');

          let files = (items || [])
            .filter(item => item.id !== null && !item.name.endsWith('.folder'))
            .map(file => {
              const filePath = currentPath 
                ? `${currentPath}/${file.name}`
                : file.name;
              const metadata = mediaMetadata?.find(meta => 
                meta.file_path === filePath && meta.bucket_id === 'companymedia'
              );
              
              const isFavorited = favorites?.some(fav => 
                fav.file_path === filePath && fav.bucket_id === 'companymedia'
              ) || false;
              
              const url = supabase.storage
                .from('companymedia')
                .getPublicUrl(filePath).data.publicUrl;
              
              const fileType = getFileTypeFromName(file.name);
              
              return {
                id: file.id || '',
                name: file.name,
                fileType,
                url,
                size: file.metadata?.size || 0,
                created_at: file.created_at || new Date().toISOString(),
                uploadedBy: metadata?.uploaded_by || '',
                favorited: isFavorited,
                isFolder: false,
                isImage: fileType.startsWith('image/'),
                isVideo: fileType.startsWith('video/'),
                isDocument: fileType.startsWith('application/') || fileType.startsWith('text/'),
                bucketId: 'companymedia'
              };
            });

          // Apply favorites filter if enabled
          if (filters.favorites) {
            files = files.filter(file => file.favorited);
          }

          return { folders, files };
        }

        // Handle internal files tab (media bucket)
        const { data: items, error } = await supabase
          .storage
          .from('media')
          .list(currentPath);
        
        if (error) throw error;

        // Filter out .folder files from folders
        const folders = (items || [])
          .filter(item => item.id === null && !item.name.endsWith('.folder'))
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

        // Get metadata for files
        const { data: mediaMetadata } = await supabase
          .from('media_metadata')
          .select('*')
          .eq('bucket_id', 'media');

        // Filter out .folder files from files
        let files = (items || [])
          .filter(item => item.id !== null && !item.name.endsWith('.folder'))
          .map(file => {
            const filePath = currentPath 
              ? `${currentPath}/${file.name}`
              : file.name;
              
            const metadata = mediaMetadata?.find(meta => 
              meta.file_path === filePath && meta.bucket_id === 'media'
            );
            
            const isFavorited = favorites?.some(fav => 
              fav.file_path === filePath && fav.bucket_id === 'media'
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
              uploadedBy: metadata?.uploaded_by || '',
              favorited: isFavorited,
              isFolder: false,
              isImage: fileType.startsWith('image/'),
              isVideo: fileType.startsWith('video/'),
              isDocument: fileType.startsWith('application/') || fileType.startsWith('text/'),
              bucketId: 'media'
            };
          });

        // Apply favorites filter if enabled
        if (filters.favorites) {
          files = files.filter(file => file.favorited);
        }

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
