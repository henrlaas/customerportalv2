
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fetchFavicon } from '@/services/companyHelpers';

interface CompanyFaviconProps {
  companyName: string;
  website?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export const CompanyFavicon: React.FC<CompanyFaviconProps> = ({ 
  companyName, 
  website,
  size = 'md'
}) => {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    async function loadFavicon() {
      if (website) {
        try {
          const url = await fetchFavicon(website);
          setFaviconUrl(url);
        } catch (err) {
          console.error('Error loading favicon:', err);
          setError(true);
        }
      }
    }
    
    loadFavicon();
  }, [website]);

  const getInitials = () => {
    if (!companyName) return '?';
    return companyName
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage 
        src={faviconUrl || undefined} 
        alt={companyName} 
        className={error ? "opacity-0" : ""}
      />
      <AvatarFallback>{getInitials()}</AvatarFallback>
    </Avatar>
  );
};
