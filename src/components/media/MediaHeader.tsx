
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderIcon, Building } from 'lucide-react';

interface MediaHeaderProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const MediaHeader: React.FC<MediaHeaderProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-1">Manage and organize your files</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="internal" className="flex items-center gap-2">
            <FolderIcon className="h-4 w-4" />
            Internal Media
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Company Media
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
