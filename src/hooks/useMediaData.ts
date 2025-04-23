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
        // For companies tab, fetch company folders if we're at root
        if (activeTab === 'companies' && !currentPath) {
          const { data: companies, error: companiesError } = await supabase
            .from('companies')
            .select('*')
            .order('name');
            
          if (companiesError) throw companiesError;
          
          // Convert companies to folder format
          const companyFolders = companies.map(company => ({
            id: company.id,
            name: company.name,
            fileType: 'folder',
            url: '',
            size: 0,
            created_at: company.created_at,
            favorited: false,
            isFolder: true,
            fileCount: 0
          }));
          
          return { folders: companyFolders, files: [] };
        }

        // Get the correct path based on the context
        let listPath = currentPath;
        if (activeTab === 'companies' && currentPath) {
          // If we're in companies tab, prefix with 'companies/'
          const parts = currentPath.split('/');
          if (parts.length === 1) {
            // We're at company root level
            listPath = `companies/${parts[0]}`;
          } else {
            // We're in a subfolder
            listPath = `companies/${currentPath}`;
          }
        }

        // First get folders
        const { data: folders, error: folderError } = await supabase
          .storage
          .from('media')
          .list(listPath, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
          });
        
        if (folderError) throw folderError;

        // Filter out items based on the active tab
        const filteredFolders = folders?.filter(item => {
          if (activeTab === 'all') {
            // In all files tab, don't show company folders at root
            return item.id === null && (!listPath || !listPath.startsWith('companies/'));
          }
          return item.id === null;
        }) || [];

        // Then get files from media_metadata for additional metadata
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
        
        // Process folders first
        const folderItems = filteredFolders
          .map(async folder => {
            // Get the count of files in this folder
            const { data: folderContents, error: folderError } = await supabase
              .storage
              .from('media')
              .list(`${listPath ? `${listPath}/` : ''}${folder.name}`, {
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
          }) || [];

        const resolvedFolderItems = await Promise.all(folderItems);
          
        // Process files with their metadata
        const fileItems = folders
          ?.filter(item => item.id !== null)
          .map(file => {
            const filePath = listPath 
              ? `${listPath}/${file.name}`
              : file.name;
              
            const metadata = mediaMetadata?.find(meta => 
              meta.file_path === filePath
            );
            
            const isFavorited = favorites?.some(fav => 
              fav.file_path === filePath
            ) || false;
            
            const url = supabase.storage.from('media').getPublicUrl(
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
        
        return { folders: resolvedFolderItems, files: fileItems } as MediaData;
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
