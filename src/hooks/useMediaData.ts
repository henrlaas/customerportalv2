
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MediaData, FilterOptions } from '@/types/media';
import { getFileTypeFromName } from '@/utils/mediaUtils';

export const useMediaData = (
  currentPath: string,
  session: any,
  filters: FilterOptions,
  activeTab: string
) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['mediaFiles', currentPath, session?.user?.id, filters, activeTab],
    queryFn: async () => {
      if (!session?.user?.id) {
        return { folders: [], files: [] };
      }
      
      try {
        // Determine which bucket to use based on active tab
        const bucketId = activeTab === 'companies' ? 'companies_media' : 'media';
        
        // For companies tab at root level, fetch company folders
        if (activeTab === 'companies' && !currentPath) {
          // Fetch all companies to create virtual folders
          const { data: companies, error: companiesError } = await supabase
            .from('companies')
            .select('id, name, created_at');
            
          if (companiesError) throw companiesError;
          
          const folders = (companies || []).map(company => ({
            id: company.id,
            name: company.name,
            fileType: 'folder',
            url: '',
            size: 0,
            created_at: company.created_at,
            favorited: false,
            isFolder: true,
            fileCount: 0, // We'll update this below
          }));

          // Get file counts for each company folder
          for (const folder of folders) {
            const { data: contents, error: countError } = await supabase
              .storage
              .from('companies_media')
              .list(folder.id, {
                limit: 100,
                offset: 0,
              });
              
            if (!countError && contents) {
              folder.fileCount = contents.filter(item => item.id !== null).length;
            }
          }
          
          return { folders, files: [] };
        }

        // For subfolders in companies tab or files in all tab
        const { data: items, error } = await supabase
          .storage
          .from(bucketId)
          .list(currentPath, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
          });
        
        if (error) throw error;

        const folders = (items || [])
          .filter(item => !item.name.endsWith('.folder'))
          .filter(item => item.id === null)
          .map(async folder => {
            const { data: folderContents, error: folderError } = await supabase
              .storage
              .from(bucketId)
              .list(`${currentPath ? `${currentPath}/` : ''}${folder.name}`, {
                limit: 100,
                offset: 0,
              });

            const fileCount = folderContents?.filter(item => item.id !== null).length || 0;

            return {
              id: folder.name,
              name: folder.name,
              fileType: 'folder',
              url: '',
              size: 0,
              created_at: folder.created_at || new Date().toISOString(),
              favorited: false,
              isFolder: true,
              fileCount,
            };
          });

        const resolvedFolders = await Promise.all(folders);

        // Get metadata and process files
        const { data: mediaMetadata, error: mediaError } = await supabase
          .from('media_metadata')
          .select('*');
          
        if (mediaError) throw mediaError;
        
        // Get favorites for the current user
        const { data: favorites, error: favoritesError } = await supabase
          .from('media_favorites')
          .select('*')
          .eq('user_id', session.user.id);
          
        if (favoritesError) throw favoritesError;

        const files = items
          ?.filter(item => item.id !== null)
          .map(file => {
            const filePath = currentPath 
              ? `${currentPath}/${file.name}`
              : file.name;
              
            const metadata = mediaMetadata?.find(meta => 
              meta.file_path === filePath
            );
            
            const isFavorited = favorites?.some(fav => 
              fav.file_path === filePath
            ) || false;
            
            const url = supabase.storage.from(bucketId).getPublicUrl(
              filePath
            ).data.publicUrl;
            
            const fileType = file.metadata?.mimetype || getFileTypeFromName(file.name);
            
            return {
              id: file.id || '',
              name: file.name,
              fileType: fileType,
              url: url,
              size: file.metadata?.size || 0,
              created_at: file.created_at || new Date().toISOString(),
              uploadedBy: metadata?.uploaded_by || 'Unknown',
              favorited: isFavorited,
              isFolder: false,
              isImage: fileType.startsWith('image/'),
              isVideo: fileType.startsWith('video/'),
              isDocument: fileType.startsWith('application/') || fileType.startsWith('text/'),
            };
          }) || [];

        return { 
          folders: resolvedFolders, 
          files 
        } as MediaData;
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
