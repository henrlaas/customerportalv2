
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FolderArchive, Image, FileText, FileVideo } from 'lucide-react';

const MediaPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Upload Files
          </button>
          <button className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100">
            Create Folder
          </button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b px-4 py-3 flex items-center">
          <h2 className="font-medium">All Files</h2>
          <div className="ml-auto">
            <input
              type="text"
              placeholder="Search media..."
              className="border rounded px-3 py-1 text-sm"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-3 flex flex-col items-center">
              <FolderArchive className="h-12 w-12 mb-2 text-amber-500" />
              <span className="text-sm font-medium text-center truncate w-full">Campaign Assets</span>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-3 flex flex-col items-center">
              <Image className="h-12 w-12 mb-2 text-blue-500" />
              <span className="text-sm font-medium text-center truncate w-full">Logo.png</span>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-3 flex flex-col items-center">
              <Image className="h-12 w-12 mb-2 text-blue-500" />
              <span className="text-sm font-medium text-center truncate w-full">Banner.jpg</span>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-3 flex flex-col items-center">
              <FileText className="h-12 w-12 mb-2 text-gray-500" />
              <span className="text-sm font-medium text-center truncate w-full">Report.pdf</span>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-3 flex flex-col items-center">
              <FileVideo className="h-12 w-12 mb-2 text-red-500" />
              <span className="text-sm font-medium text-center truncate w-full">Presentation.mp4</span>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-3 flex flex-col items-center">
              <FolderArchive className="h-12 w-12 mb-2 text-amber-500" />
              <span className="text-sm font-medium text-center truncate w-full">Client Resources</span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default MediaPage;
