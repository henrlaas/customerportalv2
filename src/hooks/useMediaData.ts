import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MediaData, FilterOptions } from '@/types/media';
import { getFileTypeFromName } from '@/utils/mediaUtils';
import { useCompanyNames } from './useCompanyNames';

// Helper function to recursively fetch all files from all folders
const fetchAllFilesRecursively = async (bucketId: string, basePath: string = ''): Promise<any[]> => {
  const allFiles: any[] = [];
  
  const { data: items, error } = await supabase
    .storage
    .from(bucketId)
    .list(basePath);
    
  if (error) throw error;
  
  for (const item of items || []) {
    if (item.id === null && !item.name.endsWith('.folder')) {
      // This is a folder, recurse into it
      const folderPath = basePath ? `${basePath}/${item.name}` : item.name;
      const subFiles = await fetchAllFilesRecursively(bucketId, folderPath);
      allFiles.push(...subFiles);
    } else if (item.id !== null && !item.name.endsWith('.folder')) {
      // This is a file
      const filePath = basePath ? `${basePath}/${item.name}` : item.name;
      allFiles.push({
        ...item,
        fullPath: filePath,
        folderPath: basePath
      });
    }
  }
  
  return allFiles;
};

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
          .select('id, user_id, file_path, created_at, bucket_id')
          .eq('user_id', session.user.id);

        console.log('Debug - Favorites data:', favorites);

        // Handle company files tab
        if (activeTab === 'company') {
          // If favorites filter is active, fetch all favorited files and folders
          if (filters.favorites) {
            const bucketId = 'companymedia';
            
            // Get metadata for favorited items
            const { data: mediaMetadata } = await supabase
              .from('media_metadata')
              .select('*')
              .eq('bucket_id', bucketId);

            console.log('Debug - Company metadata:', mediaMetadata);

            // Get favorited folders from metadata
            const favoritedFolders = mediaMetadata
              ?.filter(meta => {
                const isFavorited = favorites?.some(fav => 
                  fav.file_path === meta.file_path && fav.bucket_id === bucketId
                );
                const isFolder = meta.mime_type === 'application/folder';
                console.log(`Debug - Checking ${meta.file_path}: isFolder=${isFolder}, isFavorited=${isFavorited}`);
                return isFolder && isFavorited;
              })
              .map(folderMeta => {
                console.log('Debug - Creating folder object for:', folderMeta.file_path);
                return {
                  id: folderMeta.file_path,
                  name: folderMeta.original_name || folderMeta.file_path.split('/').pop() || '',
                  fileType: 'folder',
                  url: '',
                  size: 0,
                  created_at: folderMeta.upload_date || new Date().toISOString(),
                  uploadedBy: folderMeta.uploaded_by || '',
                  favorited: true,
                  isFolder: true,
                  fileCount: 0,
                  bucketId: bucketId
                };
              }) || [];

            console.log('Debug - Favorited folders result:', favoritedFolders);

            // Fetch all files recursively and filter favorited ones
            const allFiles = await fetchAllFilesRecursively(bucketId);
            const favoritedFiles = allFiles
              .filter(file => {
                return favorites?.some(fav => 
                  fav.file_path === file.fullPath && fav.bucket_id === bucketId
                );
              })
              .map(file => {
                const metadata = mediaMetadata?.find(meta => 
                  meta.file_path === file.fullPath && meta.bucket_id === bucketId
                );
                
                const url = supabase.storage
                  .from(bucketId)
                  .getPublicUrl(file.fullPath).data.publicUrl;
                
                const fileType = getFileTypeFromName(file.name);
                
                return {
                  id: file.id || '',
                  name: file.name,
                  fileType,
                  url,
                  size: file.metadata?.size || 0,
                  created_at: file.created_at || new Date().toISOString(),
                  uploadedBy: metadata?.uploaded_by || '',
                  favorited: true,
                  isFolder: false,
                  isImage: fileType.startsWith('image/'),
                  isVideo: fileType.startsWith('video/'),
                  isDocument: fileType.startsWith('application/') || fileType.startsWith('text/'),
                  bucketId: bucketId,
                  fullPath: file.fullPath
                };
              });

            console.log('Debug - Final favorites result for company:', { folders: favoritedFolders, files: favoritedFiles });
            return { folders: favoritedFolders, files: favoritedFiles };
          }
          
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
              uploadedBy: '',
              favorited: false,
              isFolder: true,
              fileCount: 0,
              bucketId: 'companymedia',
              isCompanyFolder: true,
              companyName: company.name,
              companyWebsite: company.website,
              companyLogoUrl: company.logo_url
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

          const folders = items
            ?.filter(item => item.id === null && !item.name.endsWith('.folder'))
            .map(folder => ({
              id: folder.name,
              name: folder.name,
              fileType: 'folder',
              url: '',
              size: 0,
              created_at: folder.created_at || new Date().toISOString(),
              uploadedBy: '',
              favorited: false,
              isFolder: true,
              fileCount: 0,
              bucketId: 'companymedia'
            })) || [];
            
          // Get file counts for each folder
          for (const folder of folders) {
            const folderPath = currentPath ? `${currentPath}/${folder.name}` : folder.name;
            const { data: folderContents, error: folderError } = await supabase
              .storage
              .from('companymedia')
              .list(folderPath, {
                limit: 100,
                offset: 0,
              });
              
            if (!folderError && folderContents) {
              // Exclude .folder files from count
              folder.fileCount = folderContents.filter(item => !item.name.endsWith('.folder')).length;
            }
          }

          // Get metadata and process files and folders
          const { data: mediaMetadata } = await supabase
            .from('media_metadata')
            .select('*')
            .eq('bucket_id', 'companymedia');

          // Add folder metadata to folders
          folders.forEach(folder => {
            const folderPath = currentPath ? `${currentPath}/${folder.name}` : folder.name;
            const folderMeta = mediaMetadata?.find(meta => 
              meta.file_path === folderPath && meta.mime_type === 'application/folder'
            );
            
            if (folderMeta) {
              folder.uploadedBy = folderMeta.uploaded_by || '';
              folder.created_at = folderMeta.upload_date || folder.created_at;
            }
            
            // Check if folder is favorited
            folder.favorited = favorites?.some(fav => 
              fav.file_path === folderPath && fav.bucket_id === 'companymedia'
            ) || false;
          });

          let files = (items || [])
            .filter(item => item.id !== null && !item.name.endsWith('.folder'))
            .map(file => {
              const filePath = currentPath 
                ? `${currentPath}/${file.name}`
                : file.name;
              const metadata = mediaMetadata?.find(meta => 
                meta.file_path === filePath && meta.bucket_id === 'companymedia'
              );
              
              // Check if file is favorited
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

          return { folders, files };
        }

        // Handle internal files tab (media bucket)
        // If favorites filter is active, fetch all favorited files and folders
        if (filters.favorites) {
          const bucketId = 'media';
          
          // Get metadata for favorited items
          const { data: mediaMetadata } = await supabase
            .from('media_metadata')
            .select('*')
            .eq('bucket_id', bucketId);

          console.log('Debug - Internal metadata:', mediaMetadata);

          // Get favorited folders from metadata
          const favoritedFolders = mediaMetadata
            ?.filter(meta => {
              const isFavorited = favorites?.some(fav => 
                fav.file_path === meta.file_path && fav.bucket_id === bucketId
              );
              const isFolder = meta.mime_type === 'application/folder';
              console.log(`Debug - Checking ${meta.file_path}: isFolder=${isFolder}, isFavorited=${isFavorited}`);
              return isFolder && isFavorited;
            })
            .map(folderMeta => {
              console.log('Debug - Creating folder object for:', folderMeta.file_path);
              return {
                id: folderMeta.file_path,
                name: folderMeta.original_name || folderMeta.file_path.split('/').pop() || '',
                fileType: 'folder',
                url: '',
                size: 0,
                created_at: folderMeta.upload_date || new Date().toISOString(),
                uploadedBy: folderMeta.uploaded_by || '',
                favorited: true,
                isFolder: true,
                fileCount: 0,
                bucketId: bucketId
              };
            }) || [];

          console.log('Debug - Favorited folders result:', favoritedFolders);

          // Fetch all files recursively and filter favorited ones
          const allFiles = await fetchAllFilesRecursively(bucketId);
          const favoritedFiles = allFiles
            .filter(file => {
              return favorites?.some(fav => 
                fav.file_path === file.fullPath && fav.bucket_id === bucketId
              );
            })
            .map(file => {
              const metadata = mediaMetadata?.find(meta => 
                meta.file_path === file.fullPath && meta.bucket_id === bucketId
              );
              
              const url = supabase.storage
                .from(bucketId)
                .getPublicUrl(file.fullPath).data.publicUrl;
              
              const fileType = getFileTypeFromName(file.name);
              
              return {
                id: file.id || '',
                name: file.name,
                fileType,
                url,
                size: file.metadata?.size || 0,
                created_at: file.created_at || new Date().toISOString(),
                uploadedBy: metadata?.uploaded_by || '',
                favorited: true,
                isFolder: false,
                isImage: fileType.startsWith('image/'),
                isVideo: fileType.startsWith('video/'),
                isDocument: fileType.startsWith('application/') || fileType.startsWith('text/'),
                bucketId: bucketId,
                fullPath: file.fullPath
              };
            });

          console.log('Debug - Final favorites result for internal:', { folders: favoritedFolders, files: favoritedFiles });
          return { folders: favoritedFolders, files: favoritedFiles };
        }

        // Normal internal media browsing (not favorites mode)
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
            uploadedBy: '',
            favorited: false,
            isFolder: true,
            fileCount: 0,
            bucketId: 'media'
          }));
          
        // Get file counts for each folder
        for (const folder of folders) {
          const folderPath = currentPath ? `${currentPath}/${folder.name}` : folder.name;
          const { data: folderContents, error: folderError } = await supabase
            .storage
            .from('media')
            .list(folderPath, {
              limit: 100,
              offset: 0,
            });
            
          if (!folderError && folderContents) {
            // Exclude .folder files from count
            folder.fileCount = folderContents.filter(item => !item.name.endsWith('.folder')).length;
          }
        }

        // Get metadata for files and folders - make sure we get ALL metadata for the current path
        const { data: mediaMetadata } = await supabase
          .from('media_metadata')
          .select('*')
          .eq('bucket_id', 'media');

        // Add folder metadata to folders
        folders.forEach(folder => {
          const folderPath = currentPath ? `${currentPath}/${folder.name}` : folder.name;
          const folderMeta = mediaMetadata?.find(meta => 
            meta.file_path === folderPath && meta.mime_type === 'application/folder'
          );
          
          if (folderMeta) {
            folder.uploadedBy = folderMeta.uploaded_by || '';
            folder.created_at = folderMeta.upload_date || folder.created_at;
          }
          
          // Check if folder is favorited
          folder.favorited = favorites?.some(fav => 
            fav.file_path === folderPath && fav.bucket_id === 'media'
          ) || false;
        });

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
            
            // Check if file is favorited using the favorites data we retrieved earlier
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
