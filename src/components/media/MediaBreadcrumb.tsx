
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home } from 'lucide-react';

interface MediaBreadcrumbProps {
  currentPath: string;
  onNavigate: (index: number) => void;
}

export const MediaBreadcrumb: React.FC<MediaBreadcrumbProps> = ({
  currentPath,
  onNavigate,
}) => {
  const breadcrumbs = currentPath 
    ? ['Root', ...currentPath.split('/')] 
    : ['Root'];

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(index - 1)}
            className={`px-2 py-1 h-auto text-sm hover:text-primary transition-colors ${
              index === breadcrumbs.length - 1 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {index === 0 && <Home className="h-4 w-4 mr-1" />}
            {crumb}
          </Button>
        </React.Fragment>
      ))}
    </nav>
  );
};
