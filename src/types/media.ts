export interface MediaFile {
  id: string;
  name: string;
  fileType: string;
  url: string;
  size: number;
  created_at: string;
  uploadedBy?: string;
  uploaderAvatarUrl?: string;
  favorited: boolean;
  selected?: boolean;
  isFolder: boolean;
  isImage?: boolean;
  isVideo?: boolean;
  isDocument?: boolean;
  fileCount?: number;
  bucketId: string;
  isCompanyFolder?: boolean;
  companyName?: string;
  companyWebsite?: string;
  companyLogoUrl?: string;
}

export interface MediaData {
  folders: MediaFile[];
  files: MediaFile[];
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'newest' | 'oldest' | 'name' | 'size';

export interface FilterOptions {
  fileTypes: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  favorites: boolean;
}

export interface DragItem {
  id: string;
  type: 'FILE' | 'FOLDER';
  data: MediaFile;
}
